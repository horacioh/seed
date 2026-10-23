---
name: The CodeMirror 6 editor spike
summary: A second implementation of the editor adapter that edits Seed documents as an Obsidian-style live-preview text document on CodeMirror 6, and how it compares with the ProseKit spike.
---
`frontend/packages/editor-codemirror` (`@shm/editor-codemirror`) implements the same `EditorAdapter<EditorDoc>` contract as the ProseKit spike (see `adapter.md`), with [CodeMirror 6](https://codemirror.net) as the editor. CodeMirror is a text editor, not a rich-text tree editor, so this spike tests a different model: a Seed document is a Markdown-like text with Seed extensions, shown as a live preview, where syntax is hidden off the cursor block and media, embeds and mentions render as widgets. BlockNote and the ProseKit package are untouched.

# How Seed sits on top of CodeMirror

The `@codemirror/*` packages are npm dependencies pinned to exact versions. Nothing is vendored or patched. Seed behaviour uses only public extension points: a `StateField`, `StateEffect`s, a `RangeSet`, decorations and widgets, `atomicRanges`, `showTooltip`, `gutter`, `keymap`, `inputHandler`, `domEventHandlers` and `@codemirror/autocomplete` sources.

| File | What it adds |
| --- | --- |
| `src/format.ts` | The text syntax and its parser. One block per line, multi-line content continues on indented lines, nesting is two spaces per level, and children of `Unordered` / `Ordered` / `Blockquote` parents start with `- `, `1. ` or `> `. `# ` heading, fenced ```` ``` ```` code, `$$` math, `![[hm://…\|View]]` embed, `![caption](link)` image and `::Type[text](link)` for every other block type. Inline `**bold**`, `*italic*`, `<u>underline</u>`, `~~strike~~`, `` `code` ``, `[text](url)`, `[[hm://…]]` mentions and `<x:N>…</x:N>` for annotations that have no syntax. Annotation offsets are code points, as in HM. Also `youtubeParser` and the YouTube / Vimeo link normalisation copied from `frontend/packages/editor`, so stored links match what BlockNote writes. |
| `src/state.ts` | `seedBlocks`, a `StateField` holding a `RangeSet` of block markers (id, original HM block, baseline) mapped through every transaction. `toHM` rebuilds `children` and `childrenType` from indentation; `fromHM`, `createSeedState` and `codemirrorAdapter`. |
| `src/commands.ts` | Structural editing: Tab / Shift-Tab move a block with its children, Enter splits a block with a fresh id, Shift-Enter adds a line inside a block, Backspace at the start outdents, `- ` / `1. ` / `> ` set the parent's `childrenType`. |
| `src/editor.ts` | `seedEditorExtensions(services)`: live-preview decorations and widgets (mention chips, embeds with Content / Card views, image, video, YouTube / Vimeo iframes, file, button, query, web embed, unknown-block badge), `@` and `[[` mention completions, slash menu, formatting toolbar and shortcuts, paste and drop (files, YouTube / Vimeo URLs, id-less pasted text), drag handle gutter and Alt-↑/↓ block moves. |
| `src/react/*` | `SeedCodeMirrorEditor`, a thin React wrapper around `EditorView`, and the CSS. |

**Ids and preservation.** Ids and HM payloads are never written into the text. Each block's first line carries a point marker in the `seedBlocks` range set; the markers map through every change, so ids follow their text through edits, undo and moves. Inserted lines get fresh ids. Commands that rewrite text (Enter, moves, drag and drop) reassign markers explicitly with the `assignBlock` effect. Each marker keeps the loaded HM block and a baseline of its serialised text: when the text still equals the baseline, `toHM` returns the original object, so unknown data survives byte-for-byte. Otherwise the parsed fields are written over a copy of the original, so unknown attributes, unknown annotations (as `<x:N>` spans) and unknown top-level keys survive edits to the block itself. Unknown block types are `::Type[text](link)` lines: their text is editable, their children render as nested lines, and nothing is dropped.

**Services.** The editor takes the same kind of `SeedEditorServices` object as ProseKit (`searchMentions`, `loadDocument`, `fileUrl`) plus an optional `uploadFile(file) => Promise<url>`. The harness wires mentions to `MentionCandidates` and `rankMentionCandidates`, embeds to `Resource`, `ipfs://` links to `@shm/ui/get-file-url`, and uploads to a local object URL as a stand-in for IPFS.

# The harness

`pnpm --filter @shm/editor-codemirror dev` serves `http://localhost:5184`. Like the ProseKit harness it loads any public document (`?site=https://seed.horacioh.com&id=hm://…`) and shows the change operations `hmDocumentOperations` would publish and the HM blocks side by side. `?id=demo` loads a local document with every block type. It does not publish.

# Parity with the BlockNote editor

| Feature | CodeMirror spike | Notes |
| --- | --- | --- |
| Nested blocks, Tab / Shift-Tab | Done | Indentation is the hierarchy; the subtree moves with the block. |
| `childrenType` Group / Ordered / Unordered / Blockquote | Done | `Grid` and unknown values round-trip but render as a plain group. |
| Headings | Done | `# ` lines, styled in the preview. |
| Bold, italic, underline, strike, code, link | Done | Syntax is shown on the cursor block and hidden elsewhere. Toolbar on selection, Mod-B / I / U / E, Mod-Shift-X. Links are typed as `[text](url)`, no link popover. |
| Text and background color | Partial | Round-trip only, as `<x:N>` spans. |
| `@` account mentions | Done | Inserts an `Embed` annotation `hm://<uid>`, rendered as a chip. |
| `[[` document mentions | Done | Inserts `hm://<uid>/<path>`, chip shows the document title. |
| Embed block, Content / Card views | Done | Loads and renders the embedded document (read-only), view toggle. No Comments view. |
| Image | Done | Slash menu (URL or upload), paste and drop upload through `uploadFile`, width and caption render; `ipfs://` through the gateway. No resize handles. |
| Video, YouTube, Vimeo | Done | `<video>` for files and `ipfs://`, iframe for YouTube / Vimeo. Pasting a YouTube or Vimeo URL on an empty line makes a Video block with the normalised link. |
| Unknown blocks | Done | Editable text + children + type badge, everything preserved. BlockNote shows an error banner instead. |
| File, button, web embed, query, Nostr | Partial | Render as widgets and round-trip; no settings forms, query results not loaded. |
| Code block | Partial | Fenced, language preserved; no syntax highlighting (CodeMirror language packages could add it). |
| Math | Partial | `$$` source, no KaTeX rendering. |
| Slash menu | Partial | Heading, code, math, image (URL / upload), video (URL / upload), embed, button, lists, quote. |
| Drag handle / side menu | Partial | Grip gutter that drags a block with its children, plus Alt-↑/↓. No block options menu. |
| Markdown shortcuts | Partial | Lists and quotes; headings, marks and code are already Markdown since the source is text. |
| Paste | Partial | Pasted text gets fresh ids; files upload, video URLs become Video blocks. No HTML-to-blocks conversion. |
| Comments, citations, range selection, draft machine, autosave | Missing | App integration, not part of the spike. |
| Tables, grids, Page-mode sections | Missing | See trade-offs. |
| Publish from the harness | Missing | The harness shows the operations; it is not wired to a daemon. |

# Licenses and pinned versions

All runtime packages are MIT. Checked in each published `package.json`.

| Package | Version | License |
| --- | --- | --- |
| `@codemirror/state` | 6.7.6 | MIT |
| `@codemirror/view` | 6.43.15 | MIT |
| `@codemirror/commands` | 6.11.1 | MIT |
| `@codemirror/autocomplete` | 6.20.4 | MIT |
| `@codemirror/language` | 6.13.1 | MIT |
| `@lezer/common` (transitive) | 1.5.4 | MIT |
| `@lezer/highlight` (transitive) | 1.2.5 | MIT |
| `@lezer/lr` (transitive) | 1.4.11 | MIT |
| `style-mod` (transitive) | 4.1.4 | MIT |
| `w3c-keyname` (transitive) | 2.2.8 | MIT |
| `crelt` (transitive) | 1.0.6 | MIT |
| `@marijn/find-cluster-break` (transitive) | 1.0.4 | MIT |

Dev dependencies match the ProseKit package. The workspace has one copy of each `@codemirror/*` package; CodeMirror breaks (duplicate `@codemirror/state` "instanceof" errors) if two copies load. Installing them also resolves ProseKit's optional `@lezer/*` peers in the lockfile, without changing any ProseKit version.

# Gaps and risks

- **The text is the model.** Every Seed feature that is not Markdown-shaped needs a syntax, a parser and a widget. The grammar in `format.ts` is the riskiest code in the package: escaping, nested marks across `<x:N>` spans and multi-line blocks are all hand-written. The round-trip tests on real documents are what make it safe.
- **Atomic widgets are not editable.** Embeds, media and other atom blocks are replaced by widgets; editing their link means editing the source line. Captions, button labels and so on are text in the line, but there is no inline form.
- **Selection inside widgets.** Embedded documents render read-only inside a widget; you cannot select or cite a range inside them as BlockNote can.
- **Live preview is a heuristic.** Syntax is revealed on the block with the cursor. Long blocks with many marks shift while you type, which some people find noisy (Obsidian has the same behaviour).
- **Menus are DIY.** Autocomplete gives a list popup and `showTooltip` gives positioning; everything else (toolbar buttons, drag indicator, media widgets, embed toggles) is hand-built DOM.

# Trade-offs against a tree editor

- **Lost:** a real document tree. Tables, grid layouts and Page-mode sections have no natural text form; they would be fenced directives rendered as opaque widgets, and editing cells inside them would need a nested editor. Cross-block selection and block-level node views with editable content inside are much harder than in ProseMirror.
- **Gained:** a source mode for free (turn off the live-preview extension and the same document is plain Markdown-like text), vim / emacs keymaps (`@replit/codemirror-vim`, MIT), virtualised rendering that stays fast on very large documents (CodeMirror only renders the viewport), and a simpler collaboration story: one text CRDT (`Y.Text`) bound with `y-codemirror.next` (MIT) instead of a ProseMirror tree in `Y.XmlFragment`. The block-id markers would still have to be synced separately, for example as a `Y.Map` of id → relative position.

# Compared with ProseKit

| | ProseKit | CodeMirror |
| --- | --- | --- |
| Seed-specific code (`src`, TS / TSX) | 1,605 lines | 1,762 lines |
| CSS | 345 lines | 214 lines |
| Tests (excluding shared fixtures) | 384 lines | 446 lines |
| Harness build, JS gzip | 289 KiB (295,521 B) | 281 KiB (287,730 B) |
| Harness build, CSS gzip | 1.8 KiB | 1.5 KiB |

Measured with both spikes at the same feature level (media included). Both harness bundles include the same Seed app code (`@shm/shared`, `@shm/ui` helpers, React), so the editors themselves end up within a few KiB of each other: CodeMirror's core is smaller than ProseMirror plus ProseKit, but the Seed text grammar and hand-built widgets add back most of the difference.

- **Easier with CodeMirror:** ids that survive any edit (a mapped range set is exactly what CodeMirror is built for), round-tripping unknown data, undo, very large documents, Markdown shortcuts (they are the syntax), and a future source mode or Yjs binding.
- **Harder with CodeMirror:** the whole document grammar and parser (ProseKit gets this from a schema), rich block UI (media, embeds) as widgets rather than node views, and anything layout-like. Live preview needs careful decoration logic to hide syntax without breaking cursor movement.
- **UI built by hand:** in both spikes most Seed UI is custom. ProseKit ships headless menu, popover, block-handle and toolbar components; CodeMirror ships only the completion popup and tooltip positioning, so the toolbar, drag handle, drop indicator and every widget here are hand-written DOM.

# Recommendation

CodeMirror is not a good replacement for BlockNote as the main Seed editor. Seed documents are trees of typed blocks with rich, interactive node content, and the roadmap (tables, grids, Page mode, block-level comments and citations) pushes further in that direction. In CodeMirror every one of those needs a text syntax plus a widget, and the grammar becomes the product. ProseKit models the tree directly, needed about 10% fewer lines for the same features, and ships more of the menu UI.

CodeMirror is a strong candidate for an **optional source / Markdown mode alongside a tree editor**: the same `EditorAdapter` contract means both editors load and save the same HM blocks with the same ids, so switching modes is lossless. It would also suit a "focus / long-form" writing mode or very large documents. If collaboration on plain text arrives before collaboration on blocks, `y-codemirror.next` is the most mature binding of the candidates.

# Upgrading CodeMirror

1. Bump the exact `@codemirror/*` versions together in `frontend/packages/editor-codemirror/package.json` and run `pnpm install`. Check that `pnpm why @codemirror/state` shows one version.
2. Read the CodeMirror changelog for the APIs the package uses (`StateField`, `RangeSet`, decorations, `gutter`, `showTooltip`, autocomplete sources).
3. Run `pnpm --filter @shm/editor-codemirror typecheck` and `test`. The round-trip tests on real documents and the DOM tests catch serialization and widget regressions.
4. Open the harness and check the live preview, menus, drag handle and media by hand.

No Seed code lives inside CodeMirror, so there is nothing to merge.
