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

The tests in `editor-prosekit/__tests__/convert.test.ts` pin these rules, including three real documents published on `seed.horacioh.com` (saved as fixtures with their source URL) and an untouched load producing zero operations.

# How Seed sits on top of ProseKit

ProseKit is an npm dependency pinned to an exact version (`prosekit@0.22.4`). Nothing is vendored or patched. Seed behaviour is ordinary ProseKit extensions:

| File | What it adds |
| --- | --- |
| `src/schema.ts` | The Seed document shape: `doc > blockNode+`, `blockNode > content blockGroup?`, `blockGroup > blockNode+` with a `childrenType` attr (`Group`, `Ordered`, `Unordered`, `Blockquote`, `Grid` and anything else). Content nodes come from ProseKit (`paragraph`, `heading`, `codeBlock`) or are Seed node specs: `hmMath`, atom blocks (`hmEmbed`, `hmImage`, `hmVideo`, `hmFile`, `hmButton`, `hmWebEmbed`, `hmQuery`, `hmNostr`), `hmUnknown` for any other block type, the inline `hmMention` node, and a generic `hmAnnotation` mark for unknown annotations. Marks are ProseKit's bold, italic, underline, strike, code, link, text and background color. |
| `src/convert.ts` | `fromHM` / `toHM` and `prosekitAdapter`. Annotation offsets are code points, as in HM. Inline `Embed` annotations become `hmMention` nodes over the `\uFFFC` placeholder. |
| `src/commands.ts` | Structural editing on the nested model: Tab / Shift-Tab, Enter that splits blocks (not just paragraphs), Backspace that outdents then joins, `- `, `1. ` and `> ` shortcuts that set the parent's `childrenType`, and the id plugin. |
| `src/react/*` | `prosekit/react` bindings: node views (embeds, media, mentions), `@` and `[[` mention menus, slash menu, block handle, formatting toolbar, and `SeedProseKitEditor`. |

**Preservation.** Each `blockNode` keeps the loaded HM block in an `original` attr plus a `baseline` of the fields the editor models. On save, if the modeled fields still equal the baseline the original object is returned as is; otherwise the edited fields are written over a copy of the original, so unknown attributes and keys survive edits too. Known annotations keep their own unknown attributes the same way, and unknown annotations ride along as `hmAnnotation` marks, so they follow the text through edits.

**Services.** The editor takes a `SeedEditorServices` object (`searchMentions`, `loadDocument`, `fileUrl`) instead of reaching into app state. The harness wires it to the same `MentionCandidates` API and `rankMentionCandidates` ordering the BlockNote mention menu uses, and to `Resource` for embeds.

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
| Image, video, file, button | Partial | Render and round-trip; no upload, resize or settings forms. |
| Code block | Partial | Editable, language preserved; no syntax highlighting. |
| Math | Partial | Editable source, no KaTeX rendering. |
| Web embed, query, Nostr | Partial | Render a placeholder and round-trip; query results are not loaded. |
| Slash menu | Partial | Paragraph, heading, code, math, list and quote groups, embeds, image, button. |
| Drag handle / side menu | Partial | ProseKit block handle (add, drag); no block options menu. |
| Markdown shortcuts | Partial | Lists and quotes; ProseKit has more that are not wired yet. |
| Paste | Partial | ProseMirror paste with id stripping; no markdown or link-to-embed paste. |
| Comments, citations, range selection, draft machine, autosave | Missing | App integration, not part of the spike. |
| Publish from the harness | Missing | The harness shows the operations; it is not wired to a daemon. |

# ProseKit: license, gaps and risks

- **License.** ProseKit is MIT (checked in the published `package.json` and the repository). Its runtime dependencies are ProseMirror (MIT) and small MIT libraries.
- **React 18 and custom elements.** ProseKit's menus are web components. React 18 sets `className` as a literal `classname` attribute on them, so the spike styles them by tag name. React 19 fixes this.
- **Pre-1.0.** ProseKit is at 0.x and minor versions can break APIs. Pinning an exact version and the tests in this package are what make upgrades safe.
- **Nested block model.** ProseKit's list and block-handle helpers assume flat ProseMirror documents. Seed's `blockNode` / `blockGroup` tree needed its own Enter, Tab, Shift-Tab and Backspace commands. Drag and drop works on `blockNode`s but hasn't been tested deeply.
- **What ProseKit doesn't have.** Collaboration, comments, and media uploads are app concerns either way. Code highlighting, KaTeX, tables and a link popover exist as ProseKit extensions and can be added.

# Upgrading ProseKit

1. Bump the exact `prosekit` version in `frontend/packages/editor-prosekit/package.json` and run `pnpm install`.
2. Read the ProseKit changelog for breaking changes in the extensions the package imports (`schema.ts`, `commands.ts`, `react/*`).
3. Run `pnpm --filter @shm/editor-prosekit typecheck` and `test`. The round-trip tests on real documents catch schema or serialization regressions.
4. Open the harness and check the menus, the block handle and the toolbar by hand.

No Seed code lives inside ProseKit, so there is nothing to merge.
