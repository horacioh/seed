---
name: The Lexical editor spike
summary: A second implementation of the editor adapter on Meta's Lexical, next to BlockNote and the ProseKit spike, to test whether the adapter boundary is editor-agnostic and whether Lexical can replace BlockNote.
---
`frontend/packages/editor-lexical` implements the [editor adapter](./adapter.md) on [Lexical](https://lexical.dev). It stacks on the ProseKit spike: it uses the same contract (`@seed-hypermedia/client/editor-adapter`), the same fixtures and the same harness layout. BlockNote and the ProseKit package are untouched.

# The contract fits unchanged

Lexical is not ProseMirror-based, and the contract did not need to change. `EditorDoc` is Lexical's `SerializedEditorState` (plain JSON), so `fromHM` and `toHM` are pure JSON functions that need no editor, DOM or React. The editor loads with `editor.parseEditorState(fromHM(blocks))` and saves with `toHM(editorState.toJSON())`. Saving goes through the shared `hmDocumentOperations`.

# How Seed sits on top of Lexical

Lexical is pinned to `0.52.0`, all `lexical` and `@lexical/*` packages at the same exact version. Nothing is vendored or patched. Seed behaviour is custom nodes, NodeState, commands and React plugins:

| File | What it adds |
| --- | --- |
| `src/nodes.ts` | `SeedBlockNode` (one HM block: content first, optional `SeedGroupNode` second), `SeedGroupNode` (children, `childrenType` in NodeState), `SeedTextBlockNode` (paragraph, heading or any unknown text type, the HM type in NodeState), `SeedAtomNode` (decorator for `Embed`, `Image`, `Video`, `File`, `Button`, `WebEmbed`, `Query`, `Nostr`), `SeedMathNode`, the inline `SeedMentionNode`, and Lexical's own `LinkNode` and `CodeNode`. HM data lives in NodeState (`$getState` / `$setState`), so it survives `exportJSON` / `importJSON`, undo, copy and paste. |
| `src/convert.ts` | `fromHM` / `toHM` and `lexicalAdapter`. Annotation offsets are code points. Bold, italic, underline, strike and code are Lexical text-format bits, links are `LinkNode`s, colours are inline styles, inline `Embed`s are `SeedMentionNode`s over `\uFFFC`, and any other annotation rides on the text nodes it covers as NodeState. |
| `src/commands.ts` | `registerSeedEditing`: Enter splits blocks, Tab / Shift-Tab, Backspace outdents then joins, `# `, `- `, `1. `, `> ` shortcuts, Lexical's text-format markdown shortcuts, block-level paste, and node transforms that keep the tree valid and ids unique. |
| `src/media.ts` | `youtubeParser` and `videoEmbedUrl`, copied from `@shm/editor` `utils.ts` / `video.tsx`, so a pasted YouTube or Vimeo URL is stored as the same `youtube.com/embed/<id>` / `player.vimeo.com/video/<id>` link BlockNote writes. |
| `src/react/*` | `@lexical/react`: `SeedLexicalEditor` (`LexicalComposer` + `RichTextPlugin`), decorators for embeds, media, math (KaTeX) and mentions, `@` / `[[` typeahead menus, slash menu, formatting toolbar, and a block handle with `+` and nested drag and drop. |

**Preservation.** As in the ProseKit spike, every `SeedBlockNode` keeps the loaded HM block (`hmOriginal`) and a baseline of the fields the editor models. If the modeled fields still equal the baseline, `toHM` returns the original object; otherwise edited fields are written over a copy of it, so unknown block types, attributes, top-level fields (`revision`) and key order survive. Unknown annotations are stored without their ranges on the text they cover and are re-ranged on save, so they follow the text through edits.

**Ids.** The block id is NodeState on `SeedBlockNode`. A root transform re-issues ids for new blocks and for duplicates (paste, split), keeping the first occurrence, so a copied block never steals the original's id.

# Lexical nesting vs the Seed block tree

Lexical's `@lexical/list` models lists HTML-style: `ListNode` (bullet / number / check) containing `ListItemNode`s, and nesting is a `ListNode` inside a `ListItemNode`. The list type belongs to the list, an item has no separate "content", and paragraphs can't have children outside a list. Lexical's generic indent is just a number on each element (`__indent`), rendered as padding, with no tree.

Seed's tree is different: any block can have children, and the parent's `childrenType` (`Group`, `Ordered`, `Unordered`, `Blockquote`, or anything else) says how they render. So the spike does not use `@lexical/list` or `__indent`. It mirrors the ProseKit schema with its own `ElementNode`s: `root > SeedBlockNode+`, `SeedBlockNode > content SeedGroupNode?`, `SeedGroupNode > SeedBlockNode+`, with `childrenType` on the group. A `childrenType` chosen on a block that has no children yet is kept on the block and moves to its group on first indent. Lexical does not enforce a schema, so this shape is kept by node transforms (orphan text wrapped into blocks, empty groups removed, blocks never left without content).

# The harness

`pnpm --filter @shm/editor-lexical dev` serves `http://localhost:5182`. Like the ProseKit harness it loads a public document (`?site=https://seed.horacioh.com&id=hm://…`), uses `MentionCandidates` + `rankMentionCandidates` for mentions and `Resource` for embeds, and shows the change operations and HM blocks side by side. It resolves `ipfs://` media with `@shm/ui/get-file-url` inside a `UniversalAppProvider` whose `ipfsFileUrl` is the dev server's `/ipfs`, which serves harness uploads and proxies other CIDs to the site's gateway.

# Parity with the BlockNote editor

| Feature | Lexical spike | Notes |
| --- | --- | --- |
| Nested blocks, Tab / Shift-Tab | Done | Shift-Tab takes following siblings along as children. |
| `childrenType` Group / Ordered / Unordered / Blockquote | Done | Slash menu and `- `, `1. `, `> `. Other values are preserved and render as a group. |
| Headings | Done | `# ` shortcut and slash menu. |
| Bold, italic, underline, strike, code, link | Done | Toolbar, shortcuts and `**`/`*`/`` ` `` markdown. Link editing is a prompt. |
| Text and background color | Partial | Round-trip only, no UI. |
| `@` account mentions | Done | Inserts `Embed` `hm://<uid>`. |
| `[[` document mentions | Done | Inserts `Embed` `hm://<uid>/<path>`. |
| Embed block, Content / Card views | Done | Loads the embedded document, view toggle. No Comments view; block or range embeds show the whole document. |
| Unknown blocks | Done | Editable text + children, everything preserved, no error banner. |
| Image | Done | Slash menu inserts an empty block with Upload and URL fields; files can also be dropped or pasted into the editor. Uploads go through the injectable `SeedEditorServices.uploadFile(file) => Promise<link>` (the harness stores the file under its real UnixFS CID in the dev server and returns `ipfs://<cid>`; without the hook the editor uses an object URL). `ipfs://` resolves through `@shm/ui/get-file-url` (`useImageUrl`). Renders `width` and the caption (`text`, else `name`). No resize handle or settings form. |
| Video (file / `ipfs://`) | Done | Upload, drop or URL. `ipfs://` plays in a `<video>` through `useFileProxyUrl`, honouring `width`, `autoplay`, `loop`, `muted`. |
| YouTube / Vimeo video | Done | Video block with a player link renders as an `<iframe>`. Page URLs are normalised to the links BlockNote stores, and pasting a YouTube or Vimeo URL on an empty line creates the Video block. |
| Media round-trip | Done | `link`, `width`, `name`, `autoplay`, `loop`, `muted` and unknown attributes survive `fromHM` → `toHM` byte-for-byte and through edits (`__tests__/media.test.ts`). |
| File, button | Partial | File uses the same upload / URL placeholder; button renders and round-trips. No settings forms. |
| Code block | Partial | Lexical `CodeNode`, language preserved; no syntax highlighting wired. |
| Math | Partial | Editable source with live KaTeX rendering. |
| Web embed, query, Nostr | Partial | Placeholder and round-trip; query results are not loaded. |
| Slash menu | Partial | Paragraph, heading, code, math, list and quote groups, embeds, image, video, file, web embed, button. |
| Drag handle / side menu | Partial | `+` and nested drag and drop of a block with its children; no block options menu. |
| Markdown shortcuts | Partial | Headings, lists, quotes, bold, italic, code. |
| Paste | Partial | Lexical and HTML paste become whole blocks with fresh ids; files become media blocks; YouTube / Vimeo URLs on an empty line become Video blocks. No markdown or `hm://` link-to-embed paste. |
| Comments, citations, range selection, draft machine, autosave | Missing | App integration, not part of the spike. |

# Lexical: license, gaps and risks

- **License.** `lexical` and every `@lexical/*` package are MIT (checked in each published `package.json`). Their runtime dependencies are MIT too: `@floating-ui/*`, `@preact/signals-core`, `tabbable`, `@types/trusted-types`. KaTeX (math rendering) is MIT and its one dependency, `commander`, is MIT. `yjs` is an optional peer of `@lexical/yjs` and is not installed.
- **No schema.** Lexical has no content expressions. The Seed tree shape is kept by transforms and commands; a bug there corrupts structure silently instead of being rejected, so the transforms need tests (they have some).
- **Root-level helpers.** `DraggableBlockPlugin_EXPERIMENTAL`, the list plugin, indent and the markdown block transformers assume top-level blocks. The spike writes its own block handle, drag and drop, Enter, Tab, Backspace and block shortcuts, which is the same work ProseKit needed.
- **Selection across blocks** is Lexical's, built for flat documents. Deleting a range that spans nested blocks works but has not been tested deeply.
- **Pre-1.0.** Lexical is at 0.x and minor versions do break APIs (NodeState and `$config` are recent). Pinning and the tests are what make upgrades safe.

# Upgrading Lexical

1. Bump all `lexical` and `@lexical/*` versions in `frontend/packages/editor-lexical/package.json` together (same exact version, including `@lexical/headless` in dev dependencies) and run `pnpm install`.
2. Read the Lexical changelog for the APIs the package uses: NodeState, `$config`, node transforms, `SELECTION_INSERT_CLIPBOARD_NODES_COMMAND`, `LexicalTypeaheadMenuPlugin`.
3. Run `pnpm --filter @shm/editor-lexical typecheck` and `test`.
4. Open the harness and check menus, the block handle and the toolbar by hand.

# Compared with the ProseKit spike

| | Lexical | ProseKit |
| --- | --- | --- |
| Effort | About the same. Converter, nodes and commands ~1,150 lines, React ~780. | Similar; ProseKit got the content-expression schema for free. |
| Fit with Seed's nested blocks | Needs transforms to keep the tree valid, because nothing enforces it. Nodes, NodeState and JSON state map cleanly to HM blocks. | ProseMirror schema expresses `blockNode > content blockGroup?` directly and rejects invalid trees. |
| Extension API | Node subclasses, NodeState, commands and transforms; plain classes and functions, easy to read and debug. | ProseKit extensions over ProseMirror specs, commands and plugins; very flexible, more concepts. |
| React integration | First-class: decorators are React components, plugins are components, typeahead menu built in. | Good with `prosekit/react`; menus are web components, which needed workarounds on React 18. |
| Bundle size (editor code only, minified / gzip, without React, Seed code or KaTeX) | 470 KB / 155 KB (Lexical packages 430 KB) | 366 KB / 117 KB |
| Maturity / community | Meta, used in Facebook and many products, ~24k GitHub stars, ~3.5M npm downloads a week. Still 0.x. | One main maintainer, ~1.2k stars, ~10k downloads a week, on ProseMirror (very mature, ~15M downloads a week). 0.x. |

KaTeX adds another ~74 KB gzip to the Lexical spike (the ProseKit spike shows math source only).

**Recommendation.** Both libraries can carry Seed's documents behind the same adapter with no fork. ProseKit fits Seed's nested block model better because ProseMirror's schema enforces it; Lexical needs more invariant code but has the larger community, Meta's backing and the better React story. If the deciding factor is long-term maintenance and a large ecosystem, Lexical is viable; if it is the closest fit to the current BlockNote/ProseMirror model and the smallest migration from today's editor, ProseKit is the safer choice.
