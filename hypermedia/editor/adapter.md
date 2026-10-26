---
name: The editor adapter
summary: A small editor-agnostic contract between Seed documents and a rich-text editor, and the ProseKit spike that implements it next to the current BlockNote editor.
---
Seed's editor is a vendored fork of BlockNote (`frontend/packages/editor`, on Tiptap 2.0.3). Every BlockNote or Tiptap update has to be merged by hand into the fork, and BlockNote is not MIT-licensed. The editor adapter separates "what a Seed document is" from "which editor edits it", so an editor library can be used unmodified and upgraded by bumping a version. The first implementation is [ProseKit](https://prosekit.dev), in `frontend/packages/editor-prosekit`. It is a spike: BlockNote is untouched and still the editor of the apps.

# The contract

The contract lives in `frontend/packages/client/src/editor-adapter.ts` and imports no editor, React or DOM code.

```ts
interface EditorAdapter<EditorDoc> {
  readonly name: string
  fromHM(blocks: HMBlockNode[]): EditorDoc
  toHM(doc: EditorDoc): HMBlockNode[]
}

hmDocumentOperations(published: HMBlockNode[], edited: HMBlockNode[]): DocumentOperation[]
```

- **HM blocks are the canonical format.** An editor only ever loads from and saves to `HMBlockNode[]` trees.
- **One save path.** `hmDocumentOperations` diffs two HM trees with the same id-aware diff the desktop draft machine uses (`block-diff.ts`: `ReplaceBlock`, `MoveBlocks`, `DeleteBlocks`). Editors never compute changes themselves.
- **Block ids survive.** `fromHM` keeps every id, `toHM` writes it back, and new blocks get fresh ids. Pasted blocks are stripped of ids and duplicates are re-issued, so a copy never steals another block's id.
- **Never delete what you don't understand.** `toHM(fromHM(blocks))` is byte-for-byte equal to `blocks` (`JSON.stringify` equality, so key order too). Unknown block types, unknown attributes, unknown annotations and unknown top-level block fields (such as `revision`) round-trip. Unknown blocks render as editable text with their children, never as an error banner.

## The editor kit

The six spikes (ProseKit, Svedit, Lexical, plain ProseMirror, Tiptap, CodeMirror) each re-wrote the same editor-independent logic, and the copies drifted (the paste id-stripping bug was fixed in two copies but not in the original). That logic now lives once in `@seed-hypermedia/client/editor/*`, with no editor, React or DOM imports. An adapter only maps between the kit's neutral shapes and its own model:

| Module | What it owns |
| --- | --- |
| `editor/blocks` | `HM_BLOCK_KINDS` (`text`, `code`, `math`, `atom`), `blockKind(type)` (`unknown` for anything else), `ownedAttributes(kind)`, `CHILDREN_TYPES`. Adding a block type is one edit. |
| `editor/inline` | `inlineFromHM(text, annotations)` → `InlineRun[]` (marked text, `mention` over `\uFFFC`, `break` for `\n`) and `inlineToHM(runs)`. Code point offsets and range merging live here. Marks are `simple`, `link`, `color`, or `opaque`, which carries any annotation the kit doesn't model unchanged. |
| `editor/preserve` | `snapshotBlock(node, produced)` at load, `restoreBlock(snapshot, produced)` at save (returns the loaded object when nothing modelled changed; otherwise keeps every unowned key and attribute), `withChildrenType`, and `assembleBlockNode` (node key order, empty `children`, unknown node keys). The `BlockSnapshot` is plain JSON, so it can sit in a node attr, a side map keyed by id, or CodeMirror state. |
| `editor/ids` | `createBlockId`, `withFreshIds(tree)` for paste/duplicate in editors that copy HM trees, and `validateHMTree` (missing / duplicate ids, unknown `childrenType`), which schema-less editors (Lexical, CodeMirror) should run on their output. |
| `editor/media` | `youtubeParser`, `videoEmbedLink`, `isVideoPlayerLink`, `videoIframeSrc`, matching what BlockNote stores. |
| `editor/services` | The framework-free `SeedEditorServices` interface (`searchMentions`, `loadDocument`, `uploadFile?`). Each editor passes it to its UI its own way (ProseKit: a React context). |
| `editor/conformance` | `adapterConformanceCases(adapter, {fixtures, hooks})`: runner-independent cases (each throws on failure) for byte-for-byte round trips, zero operations on an untouched load, stable and valid ids, an `unknownDataFixture` and a `mediaFixture`. With `hooks.setBlockText` / `hooks.pasteBlocks` it also checks that an edit keeps unknown data and touches only the edited block, and that pasted blocks get fresh ids. |
| `editor/fixtures` | The shared test fixtures (`editorFixtures`: all block types plus the three real documents). Test-only, not in the build. |

A new adapter gets the whole contract suite with `for (const c of adapterConformanceCases(adapter, {fixtures: editorFixtures, hooks})) it(c.name, c.run)`.

The conformance cases and the tests in `editor-prosekit/__tests__/convert.test.ts` pin these rules, including three real documents published on `seed.horacioh.com` (saved as fixtures with their source URL) and an untouched load producing zero operations.

# How Seed sits on top of ProseKit

ProseKit is an npm dependency pinned to an exact version (`prosekit@0.22.4`). Nothing is vendored or patched. Seed behaviour is ordinary ProseKit extensions:

| File | What it adds |
| --- | --- |
| `src/schema.ts` | The Seed document shape: `doc > blockNode+`, `blockNode > content blockGroup?`, `blockGroup > blockNode+` with a `childrenType` attr (`Group`, `Ordered`, `Unordered`, `Blockquote`, `Grid` and anything else). Content nodes come from ProseKit (`paragraph`, `heading`, `codeBlock`) or are Seed node specs: `hmMath`, atom blocks (`hmEmbed`, `hmImage`, `hmVideo`, `hmFile`, `hmButton`, `hmWebEmbed`, `hmQuery`, `hmNostr`), `hmUnknown` for any other block type, the inline `hmMention` node, and a generic `hmAnnotation` mark for unknown annotations. Marks are ProseKit's bold, italic, underline, strike, code, link, text and background color. |
| `src/convert.ts` | `fromHM` / `toHM` and `prosekitAdapter`: maps kit `InlineRun`s to ProseKit marks and `hmMention` / `hardBreak` nodes, and kit block kinds to node types. |
| `src/commands.ts` | Structural editing on the nested model: Tab / Shift-Tab, Enter that splits blocks (not just paragraphs), Backspace that outdents then joins, `- `, `1. ` and `> ` shortcuts that set the parent's `childrenType`, and the id plugin. |
| `src/react/*` | `prosekit/react` bindings: node views (embeds, media, mentions), `@` and `[[` mention menus, slash menu, block handle, formatting toolbar, and `SeedProseKitEditor`. |

**Preservation.** Each `blockNode` keeps the kit's `BlockSnapshot` (the loaded block plus a `baseline` of the fields the editor models) in a `snapshot` attr, and `restoreBlock` does the rest: untouched blocks come back as the original object, edited ones keep unknown attributes and keys. Known annotations keep their own unknown attributes the same way, and unknown annotations ride along as `hmAnnotation` marks, so they follow the text through edits.

**Services.** The editor takes a `SeedEditorServices` object (`searchMentions`, `loadDocument`, optional `uploadFile(file) => Promise<link>`) instead of reaching into app state. The harness wires it to the same `MentionCandidates` API and `rankMentionCandidates` ordering the BlockNote mention menu uses, to `Resource` for embeds, and `uploadFile` to a local object URL standing in for the IPFS upload. Media links resolve through `@shm/ui/get-file-url` (`useImageUrl` for images, `useFileProxyUrl` for video and files), so the editor sits inside the app's `UniversalAppProvider` and `ipfs://` links hit the same gateway as BlockNote.

**Media.** `@seed-hypermedia/client/editor/media` copies BlockNote's `youtubeParser` and the YouTube/Vimeo normalisation from `packages/editor/src/video.tsx`, so a Video block stores the same `https://www.youtube.com/embed/<id>` / `https://player.vimeo.com/video/<id>` link. Player links render as an iframe (YouTube with `rel=0`); `ipfs://` and other links play in `<video>`. `autoplay`, `loop` and `muted` are saved from the editor's settings and also applied to the `<video>` in the editor.

# The harness

`pnpm --filter @shm/editor-prosekit dev` serves `http://localhost:5181`. It loads any public document (`?site=https://seed.horacioh.com&id=hm://…`) into the editor and shows, side by side, the change operations `hmDocumentOperations` would publish and the HM blocks. It does not publish.

# Parity with the BlockNote editor

| Feature | ProseKit spike | Notes |
| --- | --- | --- |
| Nested blocks, Tab / Shift-Tab | Done | Shift-Tab takes following siblings along as children, like BlockNote. |
| `childrenType` Group / Ordered / Unordered / Blockquote | Done | `Grid` and unknown values are preserved and rendered as a group. |
| Headings | Done | No heading levels in HM; all headings render alike. |
| Bold, italic, underline, strike, code, link | Done | Toolbar and shortcuts. Link editing is a prompt, no link toolbar. |
| Text and background color | Partial | Round-trip only, no UI. `TextSize`, `TextFamily`, `Range` round-trip as unknown marks. |
| `@` account mentions | Done | Inserts `Embed` `hm://<uid>`. |
| `[[` document mentions | Done | Inserts `Embed` `hm://<uid>/<path>`. |
| Embed block, Content / Card views | Done | Loads and shows the embedded document, view toggle. No Comments view, block or range embeds show the whole document. |
| Unknown blocks | Done | Editable text + children, everything preserved. BlockNote shows an error banner instead. |
| Image | Done | Slash menu, URL, upload button, drop or paste a file. Renders width and caption (or name); selected images get width, caption and replace controls. No drag-to-resize handles. |
| Video, YouTube, Vimeo | Done | Slash menu, URL, upload, drop or paste a file. `ipfs://` and file links play in `<video>`, YouTube/Vimeo URLs are stored as BlockNote's embed links and play in an iframe. Pasting a YouTube/Vimeo URL on an empty line makes a Video block. Width, autoplay, loop and muted settings. |
| File, button | Partial | Render and round-trip; no upload or settings forms. |
| Code block | Partial | Editable, language preserved; no syntax highlighting. |
| Math | Partial | Editable source, no KaTeX rendering. |
| Web embed, query, Nostr | Partial | Render a placeholder and round-trip; query results are not loaded. |
| Slash menu | Partial | Paragraph, heading, code, math, list and quote groups, embeds, image, video, button. |
| Drag handle / side menu | Partial | ProseKit block handle (add, drag); no block options menu. |
| Markdown shortcuts | Partial | Lists and quotes; ProseKit has more that are not wired yet. |
| Paste | Partial | ProseMirror paste with id stripping, image/video files, YouTube/Vimeo links to Video blocks; no markdown or `hm://` link-to-embed paste. |
| Line breaks | Done | `\n` in HM text is a ProseMirror `hardBreak` (Shift-Enter inserts one), so re-reading the DOM after typing can't collapse it into a space. |
| Comments, citations, range selection, draft machine, autosave | Missing | App integration, not part of the spike. |
| Publish from the harness | Missing | The harness shows the operations; it is not wired to a daemon. |

# ProseKit: license, gaps and risks

- **License.** ProseKit is MIT (checked in the published `package.json` and the repository). Its runtime dependencies are ProseMirror (MIT) and small MIT libraries.
- **React 18 and custom elements.** ProseKit's menus are web components. React 18 sets `className` as a literal `classname` attribute on them, so the spike styles them by tag name. React 19 fixes this.
- **Pre-1.0.** ProseKit is at 0.x and minor versions can break APIs. Pinning an exact version and the tests in this package are what make upgrades safe.
- **Nested block model.** ProseKit's list and block-handle helpers assume flat ProseMirror documents. Seed's `blockNode` / `blockGroup` tree needed its own Enter, Tab, Shift-Tab and Backspace commands. Drag and drop works on `blockNode`s but hasn't been tested deeply.
- **What ProseKit doesn't have.** Collaboration, comments and the IPFS upload itself are app concerns either way (the editor only calls `uploadFile`). Code highlighting, KaTeX, tables and a link popover exist as ProseKit extensions and can be added.

# Upgrading ProseKit

1. Bump the exact `prosekit` version in `frontend/packages/editor-prosekit/package.json` and run `pnpm install`.
2. Read the ProseKit changelog for breaking changes in the extensions the package imports (`schema.ts`, `commands.ts`, `react/*`).
3. Run `pnpm --filter @shm/editor-prosekit typecheck` and `test`. The round-trip tests on real documents catch schema or serialization regressions.
4. Open the harness and check the menus, the block handle and the toolbar by hand.

No Seed code lives inside ProseKit, so there is nothing to merge.
