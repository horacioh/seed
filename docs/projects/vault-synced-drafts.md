# Vault-Synced Drafts

## Problem

Drafts live only on the client that created them:

- Desktop writes document drafts to `userData/drafts` (`index.json`, `<slug>_<id>.md`/legacy `<id>.json`, `.history`
  backups) and comment drafts to `userData/comment-drafts/*.json` (`frontend/apps/desktop/src/app-drafts.ts`,
  `app-comments.ts`).
- Web writes document drafts and recovery snapshots to IndexedDB (`web-doc-drafts-01`,
  `frontend/apps/web/app/document-edit/web-draft-db.ts`), draft media to IndexedDB (`seed_drafts`,
  `frontend/apps/web/app/draft-media-db.ts`) and comment drafts to `localStorage`
  (`frontend/apps/web/app/comment-draft-utils.ts`).

A user who starts a document on their laptop cannot continue it on another computer or in the browser. Clearing browser
storage or losing a machine loses unpublished work. Two clients editing the same document produce two unrelated drafts
that only meet at publish time through the three-way rebase in `documentMachine`.

The vault already gives every user one Hypermedia account that follows them across desktop, web and mobile, but it only
carries identities. It is the natural login for a draft sync service, and the same infrastructure is the foundation for
realtime collaboration on drafts later.

## Solution

Make every draft a local-first [Yjs](https://yjs.dev) document on all clients, and add an **opt-in Draft Sync Service**
that users enable with their hyper.media vault account. With sync off, drafts behave as today (local only) on the new
model. With sync on, drafts, their media and comment drafts follow the owner account to every device in realtime.

### User stories

- As a writer, I can start a draft on desktop and keep editing it on another desktop or on the web, with no manual
  export.
- As a writer, I see edits from my other open devices appear live, with their cursors.
- As a writer, I can edit offline; my changes merge when the device reconnects.
- As a writer, I enable sync once from any vault-connected device and every device signed into the same vault starts
  syncing.
- As a writer who never enables sync, nothing leaves my device and drafts keep working as they do today.
- As a writer, images and files I add to a draft show up on my other devices before I publish.
- As a writer, when I publish or delete a draft on one device it disappears from the others; a device that was editing
  it at the time can keep its unsaved changes as a new draft.
- As a commenter, a reply I start on one device is waiting on the other.

### Decisions

- **Engine: Yjs.** Already a dependency (`yjs` 13.6, `y-prosemirror`, `y-protocols`, `@tiptap/extension-collaboration`
  and `-cursor`), and the vendored BlockNote editor accepts `collaboration: {fragment: Y.XmlFragment}`
  (`frontend/packages/editor/src/blocknote/core/BlockNoteEditor.ts`). Live cursors come from the Yjs awareness protocol.
- **Yjs is the draft's source of truth on every client, sync or not.** The sync service is just one more provider
  attached to the same `Y.Doc`.
- **Separate, self-hostable service** (Bun, like `vault/`), e.g. `sync.hyper.media`. The vault server stays the identity
  authority and is not changed into a document store.
- **Server-readable trust model for v1.** TLS in transit, encryption at rest, contents readable by the service so it can
  compact history and validate updates. E2EE is a later phase (see No Gos).
- **Access via Seed capabilities.** Every connection is authenticated by a signature from the account key (desktop,
  through the daemon's `SignData` RPC) or from a delegated web session key plus its capability blob (web). v1 rule: only
  the draft's owner account may read or write it.
- **Opt-in stored in the vault.** New `syncServerUrl` field in vault `State`, next to `notificationServerUrl`. Older
  clients preserve it automatically (unknown CBOR fields round-trip through `Extra` in Go and the TS merge). Web
  sessions receive it in the delegation callback, like `notifyServerUrl` in `hmauth.ts` `CallbackData`.
- **Media synced as owner-scoped, content-addressed blobs** on the sync service, garbage-collected after publish/delete.
- **Comment drafts use the same model** as the last v1 phase.

### Draft document shape

One `Y.Doc` per draft, keyed by the existing draft id (nanoid):

- `content`: `Y.XmlFragment` bound to the editor through `y-prosemirror`.
- `meta`: `Y.Map` holding the fields `writeDraft` persists today (`metadata`, `navigation`, `deps`,
  `editUid`/`editPath`, `locationUid`/`locationPath`, `visibility`, `publishPath`, `schemaDraft`, `bindingSchemaDrafts`,
  `removedChildDocumentIds`, owner account, `createTime`, `deleted` tombstone).
- Per-device, non-synced state (`cursorPosition`, `maintenanceRevision`) stays outside the doc.
- `baseBlocks` (rebase baseline) is derived from `deps` at publish time instead of stored, so it cannot diverge between
  devices.

A per-owner **draft index** is itself a small `Y.Doc` (`Y.Map` of draft id → listing fields matching `HMListedDraft`),
so draft lists, breadcrumbs and `useDraftsForAccount` update live without opening every draft.

### Client changes

- **Shared (`@shm/shared`, `@shm/editor`)**: a `DraftStore` interface (open/list/delete draft docs, attach providers)
  with desktop and web implementations. `documentMachine` stops snapshotting content through `writeDraft`. It reads the
  `Y.Doc` at publish time and keeps its existing rebase against the published version. `meta` changes go through `Y.Map`
  transactions.
- **Desktop**: the main process owns the `Y.Doc`s and persists each as an append-only update log plus periodic snapshot
  under `userData/drafts/<id>.ydoc`. Renderers attach over the existing tRPC/IPC bridge. When `syncServerUrl` is set,
  the main process runs one sync connection per owner account.
- **Web**: `y-indexeddb` persistence per draft, replacing `web-doc-drafts-01`. When the delegation carries a
  `syncServerUrl`, the web app opens a sync connection authenticated with its session key and capability.
- **Settings**: a "Sync drafts across devices" switch in vault security settings (desktop and vault web app) that sets
  or clears `syncServerUrl`, with a custom-server field like the notification server.
- **Status UI**: the existing draft status indicator shows local-only / syncing / synced / offline.

### Sync service

- WebSocket endpoint speaking the standard `y-protocols` sync + awareness messages, multiplexing one connection per
  owner account over many draft docs.
- Auth handshake: client sends `{account, sessionKey?, capabilityCid?, timestamp, signature}`; the service verifies the
  signature, and for web sessions checks the capability blob (issuer = account, delegate = session key, not
  expired/revoked). The authenticated principal is pinned to the connection.
- Storage: SQLite (same stack as `vault/src/sqlite.ts`), tables for draft docs (owner, draft id, merged update,
  version), pending updates, tombstones and media blobs (owner, CID, size, refcount). Updates are compacted
  periodically. Payloads are encrypted at rest with a server key.
- Media: `PUT/GET /media/{cid}` with the same auth; the server verifies the CID hash on upload. Clients upload when a
  draft first references a local-only blob and rewrite nothing: draft content keeps `ipfs://<cid>` links, and readers
  fall back to the sync service when the local daemon/IndexedDB lacks the CID.
- Quotas per owner (doc count, total bytes) and a max update size to bound abuse.

### Lifecycle rules

- **Migration**: on first launch of the new version, existing desktop files and web IndexedDB drafts are converted into
  `Y.Doc`s with the same draft ids. Originals are kept (`drafts/.history/pre-yjs/`, a read-only IndexedDB store) for one
  release, then removed.
- **Enabling sync**: local drafts owned by an account are uploaded on first connection. Drafts with the same id merge
  (Yjs). Drafts with different ids targeting the same document stay separate drafts.
- **Publish/delete**: sets `meta.deleted` and a tombstone in the index. Other devices close the draft. A device with the
  draft open shows "This draft was published on another device" and can save its local copy as a new draft. Tombstoned
  docs and their unreferenced media are purged server-side after a retention window.
- **Disabling sync**: clients keep their local copies; the user can choose to delete server copies.
- **Offline**: local edits always apply to the local `Y.Doc`; providers catch up on reconnect.

## Scope

Roughly 6–8 weeks for one engineer, in four phases. Each phase ships behind a flag and is usable on its own.

1. **Local Yjs drafts (2 weeks).** `DraftStore` interface, `Y.Doc` draft shape and index, desktop update-log
   persistence, web `y-indexeddb`, editor bound through `y-prosemirror`, `documentMachine` publish/rebase reading from
   the doc, migration of existing drafts. No network. Depends on nothing.
2. **Sync service and vault opt-in, desktop (2 weeks).** New service with auth handshake, y-protocols relay, SQLite
   storage and compaction. `syncServerUrl` in vault `State` (Go `state.go`, TS `vault.ts`/`vault-merge.ts`, mobile
   parity), daemon RPCs to get/set it, settings switch, desktop provider and status UI. Depends on phase 1.
3. **Web sync and draft media (1.5 weeks).** `syncServerUrl` in the delegation callback, web provider authenticated by
   session key and capability, media blob endpoints and client fallback, GC. Depends on phase 2.
4. **Comment drafts (1 week).** Move desktop `comment-drafts` and web `localStorage` comment drafts onto `DraftStore`.
   Depends on phases 1–3.

Phase 2 of the product (collaborators, E2EE) is a separate project that starts after v1 ships.

## Rabbit Holes

- **Loro or Automerge instead of Yjs.** Loro's history and movable-tree model are attractive, but its ProseMirror
  binding is not wired into BlockNote/TipTap 2.0. Keep a thin `DraftStore` seam so the engine can be swapped later, and
  don't evaluate engines further in v1.
- **Server-authoritative sync engines (Zero, Replicache-style).** These are designed for relational queries, not
  rich-text merges, and need a Postgres source of truth. Out of scope.
- **Making published documents CRDT-native.** Drafts become Yjs; the published Seed change/blob model stays as is.
  Publishing still converts the doc to blocks and runs the existing rebase.
- **Replacing the three-way rebase.** Keep it for "draft vs newer published version"; Yjs only handles "draft vs the
  same draft on another device".
- **Per-block attribution, version history UI, or time travel** built on Yjs snapshots.
- **Syncing the desktop draft `.history` backups** to the server. Server-side compaction plus local snapshots are
  enough.
- **Mobile drafts.** The mobile app has no document drafts today; it gets the vault field for parity only.
- **Owner selection edge cases.** Drafts edited through another account's capability: v1 uses the account chosen to sign
  the publish as the owner, and does not support changing the owner of an existing draft.

## No Gos

- No changes to how the vault stores identities. Drafts never go into the vault's encrypted `State` blob; only the
  `syncServerUrl` setting does.
- No sync without explicit opt-in. With `syncServerUrl` unset, no draft data leaves the device.
- No collaborators in v1. Only the owner account's devices and sessions can read or write a draft, even if other
  accounts have write capability on the target document. The data model stores the target document so phase 2 can add
  "writers of this document can join its drafts" by changing the access rule only.
- No end-to-end encryption in v1. It needs per-draft keys distributed to web sessions and collaborators, which does not
  exist yet. Document this clearly in the settings UI ("drafts are stored readable on the sync server").
- No dependency on the vault server being online for editing. The sync service and vault can both be down and drafts
  still work locally.
- No breaking change for users who never enable sync, beyond the one-time local migration.
