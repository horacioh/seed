# Tiptap spike

A second implementation of the editor adapter from [adapter.md](./adapter.md), built on stock
[Tiptap 3](https://tiptap.dev) instead of ProseKit. It lives in `frontend/packages/editor-tiptap`
(`@shm/editor-tiptap`), loads and saves only HM blocks through the same `EditorAdapter` contract, and shares the
ProseKit spike's test fixtures. Nothing in `frontend/packages/editor` (BlockNote) or `frontend/packages/editor-prosekit`
changes.

# How Seed sits on top of Tiptap

Tiptap is an unmodified npm dependency. Every Seed behaviour is a Tiptap extension (`Node.create`, `Mark.create`,
`Extension.create`) or a React node view, using only public APIs.

| File                             | What it adds                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/schema.ts`                  | The same document shape as the ProseKit spike: `doc > blockNode+`, `blockNode > content blockGroup?`, `blockGroup > blockNode+` with `childrenType`. Content nodes are stock Tiptap extensions (`Paragraph`, `Heading`, `CodeBlock`) re-configured to sit inside `blockNode`, plus Seed nodes `hmMath`, the atom blocks, `hmUnknown`, inline `hmMention` and the generic `hmAnnotation` mark. Marks are stock Tiptap bold, italic, underline, strike, code, link and `TextStyle` (text/background color). `getSeedSchema()` builds the ProseMirror schema headlessly for `fromHM`. |
| `src/convert.ts`                 | `fromHM` / `toHM` and `tiptapAdapter`. Same preservation strategy as ProseKit: each `blockNode` keeps the loaded `original`, a `baseline` of what the editor modelled, and the original key order; untouched blocks return the original object. Offsets are code points.                                                                                                                                                 |
| `src/commands.ts`                | `SeedStructure`: Tab / Shift-Tab / Enter / Backspace on the nested model (ported from the ProseKit commands, they are plain ProseMirror commands), `- `, `1. `, `> ` input rules that set the parent `childrenType`, the block-id plugin (fresh ids for pasted and duplicated blocks), YouTube/Vimeo URL normalisation and the paste-a-video-URL rule. `seedEditorExtensions()` adds Tiptap's undo/redo, drop cursor, gap cursor and placeholder. |
| `src/react/node-views.tsx`       | `ReactNodeViewRenderer` views: embeds (Content / Card), image, video (file `<video>` or YouTube/Vimeo iframe), file, button, query, web embed, mentions, and the URL / upload / drop picker for empty media blocks.                                                                                                                                                                                                         |
| `src/react/menus.tsx`            | `@`, `[[` and `/` menus on `@tiptap/suggestion` (Tiptap gives the trigger, query and keyboard hooks; the popup is ours), the formatting toolbar on Tiptap's `BubbleMenu`, and a custom block handle (add / drag).                                                                                                                                                                                                          |
| `src/react/SeedTiptapEditor.tsx` | `useEditor` + `EditorContent`, `FileHandler` for dropped/pasted image and video files, and the services context.                                                                                                                                                                                                                                                                                                                |

`SeedEditorServices` is the ProseKit contract plus `uploadFile(file) => Promise<url>`. The harness uploads to a local
object URL; the app would upload to IPFS and return `ipfs://…`. `fileUrl` in the harness uses `extractIpfsUrlCid` from
`@shm/ui/get-file-url` against the site's gateway.

# The harness

`pnpm --filter @shm/editor-tiptap dev` serves it on <http://localhost:5185>. Same UX as the ProseKit harness:
`?site=…&id=hm://…` loads a public document, and the right pane shows the change operations and the HM blocks.
`window.SEED_TIPTAP_EDITOR` is the live Tiptap editor.

# Parity with the BlockNote editor

| Feature                                                       | Tiptap spike | Notes                                                                                                                                            |
| ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nested blocks, Tab / Shift-Tab                                | Done         | Same commands as ProseKit; Shift-Tab takes following siblings along as children.                                                                 |
| `childrenType` Group / Ordered / Unordered / Blockquote       | Done         | `Grid` and unknown values are preserved and rendered as a group.                                                                                 |
| Headings                                                      | Done         | Stock Tiptap `Heading`; HM has no levels so it is pinned to one.                                                                                 |
| Bold, italic, underline, strike, code, link                   | Done         | Stock Tiptap marks and their shortcuts; `BubbleMenu` toolbar. Link editing is a prompt.                                                          |
| Text and background color                                     | Partial      | Stock `TextStyle` (`color`, `backgroundColor`), round-trip only, no UI. Overlapping colour annotations keep their own ranges.                       |
| `@` account mentions                                          | Done         | `@tiptap/suggestion` + `MentionCandidates` / `rankMentionCandidates`; inserts `Embed` `hm://<uid>`.                                                 |
| `[[` document mentions                                        | Done         | Inserts `Embed` `hm://<uid>/<path>`.                                                                                                             |
| Embed block, Content / Card views                             | Done         | Loads and shows the embedded document, view toggle. No Comments view; block and range embeds show the whole document.                           |
| Image                                                         | Done         | Slash menu, URL, upload button, drop/paste of files (`FileHandler`); width and caption/name rendered; `ipfs://` through the gateway. No resize. |
| Video, YouTube, Vimeo                                         | Done         | URL or upload; files play in `<video>` (`autoplay`/`loop`/`muted` honoured), YouTube/Vimeo links render the iframe. Links stored as BlockNote writes them. Pasting a YouTube/Vimeo URL on an empty line turns it into a video block. |
| Unknown blocks                                                | Done         | Editable text + children, everything preserved. BlockNote shows an error banner instead.                                                         |
| File, button                                                  | Partial      | Render and round-trip; no upload or settings forms.                                                                                              |
| Code block                                                    | Partial      | Stock `CodeBlock`, language preserved; no syntax highlighting (Tiptap's lowlight extension is the drop-in).                                      |
| Math                                                          | Partial      | Editable source, no KaTeX rendering (the MIT `@tiptap/extension-mathematics` is an option).                                                      |
| Web embed, query, Nostr                                       | Partial      | Placeholder + round-trip; query results not loaded.                                                                                              |
| Slash menu                                                    | Partial      | Paragraph, heading, code, math, image, video, list/quote groups, embeds, button.                                                                 |
| Drag handle / side menu                                       | Partial      | Our own handle (add + drag via ProseMirror drag-and-drop); no block options menu. See below for why not Tiptap's drag handle.                     |
| Markdown shortcuts                                            | Partial      | Lists and quotes (ours), headings, bold, italic, strike, code (Tiptap input rules). `# ` heading, `**x**` etc. come for free.                     |
| Paste                                                         | Partial      | ProseMirror paste with id stripping, media files, video URLs; no markdown or link-to-embed paste.                                                |
| Comments, citations, range selection, draft machine, autosave | Missing      | App integration, not part of the spike.                                                                                                          |
| Publish from the harness                                      | Missing      | The harness shows the operations; it is not wired to a daemon.                                                                                  |

# Tests

`__tests__/convert.test.ts` imports the ProseKit fixtures in place and runs everything against a real Tiptap `Editor`
in jsdom (27 tests): byte-for-byte round trip of the all-blocks fixture and the three published documents, zero
operations on an untouched load (both headless and through a live editor), id preservation through edits, fresh ids
for duplicated and pasted blocks, unknown block types / attributes / annotations / top-level keys surviving edits to
other blocks and to the unknown block's own text, unknown blocks rendering text and children with no error banner,
Backspace at the start of an unknown block not converting it, media attribute round-trips (`link`, `width`, `name`,
`autoplay`, `loop`, `muted`, unknown attributes), YouTube/Vimeo normalisation and paste, hierarchy commands and markdown
shortcuts.

# Licenses and pinned versions

All Tiptap packages are pinned to `3.32.0` (latest stable on npm at the time of the spike) and are MIT:

`@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/suggestion`, `@tiptap/extensions`, `@tiptap/extension-bold`,
`-code`, `-code-block`, `-file-handler`, `-heading`, `-italic`, `-link`, `-paragraph`, `-strike`, `-text`,
`-text-style`, `-underline`. Transitive: `@tiptap/extension-bubble-menu` and `-floating-menu` 3.32.0 (MIT),
`@floating-ui/dom` 1.8.0 (MIT), `linkifyjs` (MIT), ProseMirror packages (MIT).

No Pro, Cloud or private-registry packages are used. Notably not used: Tiptap's Pro `UniqueID` and comments (we have
our own id plugin) and `@tiptap/extension-drag-handle(-react)`. The drag handle is MIT on npm in 3.x, but it pulls in
`@tiptap/y-tiptap` and Yjs peers and targets top-level nodes by default, so a 70-line custom handle was simpler.

# Dependency isolation

- Tiptap 3 lives in `frontend/packages/editor-tiptap/node_modules/@tiptap/*`; the root `node_modules/@tiptap/*` stays
  at BlockNote's 2.0.3, so the two never dedupe together.
- Core ProseMirror packages resolve to the single workspace copy pinned by the root `pnpm.overrides`
  (`prosemirror-model` 1.25.4, `-state` 1.4.4, `-transform` 1.10.4, `-view` 1.42.3). The harness bundle contains one
  copy of each. Tiptap 3.32 declares slightly newer minimums (e.g. `prosemirror-view ^1.42.6`); the overrides win and
  everything tested works, but a real migration should bump the overrides.
- Leaf plugins (`prosemirror-commands`, `-dropcursor`, `-gapcursor`, `-history`) get package-local patch versions;
  they hold no shared identity, so that is harmless.
- The lockfile change also dedupes `@floating-ui/core`/`utils` used by `@floating-ui/dom` 1.7.5 to the 1.8.0 line
  (a minor bump for existing consumers).

# Upgrading Tiptap

All Seed code is extensions on top of a pinned, unmodified Tiptap, so an upgrade is: bump every `@tiptap/*` to the
same version (they release in lockstep), bump the root ProseMirror overrides to Tiptap's minimums, run
`pnpm --filter @shm/editor-tiptap test` and click through the harness. Tiptap follows semver (2.0 stable in 2023, 3.0 in 2025); the 2 → 3 jump was the last major (renamed packages, `@tiptap/extensions` bundle, `BubbleMenu` moved to
`@tiptap/react/menus`, floating-ui instead of tippy). What Seed relies on is the extension API, `ReactNodeViewRenderer`,
`Suggestion`, `BubbleMenu` and raw ProseMirror commands, all of which survived 2 → 3 with small changes.

# Gaps and risks

- **Tiptap's model is flat.** Stock Tiptap lists, blockquote, the drag handle and `UniqueID` assume top-level blocks
  or ProseMirror-style lists. Seed's `blockNode > content blockGroup?` tree means we cannot use those extensions and
  write the structural commands ourselves, exactly as with ProseKit (and as BlockNote does).
- **Default keymaps fight the tree.** Tiptap's core keymap (`clearNodes` on Backspace at document start, `Enter`
  splitting) assumes a flat doc. `SeedStructure` runs at high priority and claims those keys; a new Tiptap default
  could need another override. Covered by tests.
- **Input rules via `insertContent`** run on a timer in Tiptap 3, so tests type through `handleTextInput` instead.
- **Popups are ours.** `@tiptap/suggestion` only provides triggers and keyboard hooks; the menus, positioning and the
  block handle are custom React.
- **ProseMirror version skew** with the root overrides, as above.
- **Bug found while porting**: the ProseKit `stripBlockIds` paste transform calls `NodeType.create` on text nodes and
  throws on any paste of more than one block. Fixed in the Tiptap copy (`if (node.isLeaf)`); the ProseKit package was
  left untouched per the spike rules.

# Tiptap vs ProseKit

| | ProseKit spike | Tiptap spike |
| --- | --- | --- |
| Seed-specific source (`src/**/*.ts(x)`, no CSS/tests) | 1,253 lines | 1,659 lines |
| …of which schema + convert + commands | 764 | 925 |
| …of which React (views, menus, editor, services) | 463 | 711 |
| Harness JS, gzip | 209 KB | 246 KB (331 KB with `@shm/ui/get-file-url`, which drags `@shm/shared` into the harness; the app already has it) |
| Menus / popovers built ourselves | Slash, mentions, toolbar and block handle mostly from ProseKit's headless React components | Suggestion popups, positioning and block handle are ours; toolbar uses Tiptap `BubbleMenu` |

The Tiptap line count includes media work the ProseKit spike doesn't have (upload/URL/drop picker, `FileHandler`
insertion, YouTube/Vimeo players and paste, ~150 lines). Like for like, the two are within ~15%.

Easier with Tiptap:

- Extension API is well documented and widely used; every question had a doc page, example or GitHub issue.
- Marks, headings, code block and their keyboard shortcuts and input rules are stock extensions with nothing to wire.
- `FileHandler`, `BubbleMenu`, `Placeholder`, `UndoRedo`, drop/gap cursor are one line each.
- React node views and `useEditorState` are straightforward.
- It is what BlockNote is built on (Seed's fork uses Tiptap 2.0.3), so Seed's `blockNode`/`blockGroup` model maps
  1:1.

Harder with Tiptap:

- ProseKit ships headless React components for autocomplete, popovers and the block handle; with Tiptap those are
  DIY in this spike (Tiptap's own UI components are copy-in templates, not a library dependency).
- Overriding Tiptap's default keymap/behaviours for a nested doc takes care (priority, claiming keys).
- Slightly bigger bundle (+37 KB gzip).

# Porting from BlockNote

BlockNote's Seed fork is Tiptap 2.0.3 with `blockContainer`/`blockGroup` nodes; this spike's `blockNode`/`blockGroup`
is the same shape. Code that is plain ProseMirror or Tiptap extensions (key handlers, input rules, paste handlers, the
YouTube/Vimeo parsing that was copied here) ports with little change; Tiptap 2 → 3 API differences are small
(`@tiptap/react/menus`, `@tiptap/extensions`). Code that is BlockNote-specific (`createReactBlockSpec`, `BlockNoteEditor`
APIs, its side menu / slash menu / formatting toolbar framework, block schema helpers) does not port and has to be
rewritten as node views and menus, which is what this spike does for the minimum set.

# Recommendation

Tiptap is a credible base, and slightly less work for Seed than ProseKit in the schema/marks layer, but not decisively
better. What decides it is UI: ProseKit gives us headless menus/handles for free, Tiptap gives a bigger ecosystem, docs,
long semver history and the shortest path for porting existing BlockNote code. If the plan is to port a lot of the
current BlockNote node and interaction code, Tiptap is the better pick; if the plan is a fresh rewrite with minimal UI
code, ProseKit stays slightly ahead.
