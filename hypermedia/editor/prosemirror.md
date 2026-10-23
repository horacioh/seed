---
name: The plain ProseMirror editor spike
summary: A second implementation of the editor adapter, built directly on the official prosemirror-* packages with no wrapper, and how it compares with the ProseKit spike.
---
This spike implements the editor-agnostic contract from [the editor adapter](./adapter.md) (`EditorAdapter`, `hmDocumentOperations`, `collectHMBlockIds`) on the official `prosemirror-*` packages directly, with no ProseKit, Tiptap or other wrapper. It answers one question: what does it cost to own the thin layer ourselves, so the only editor dependency is the most stable, slowest-moving core? The code is `frontend/packages/editor-prosemirror` (`@shm/editor-prosemirror`). BlockNote and the ProseKit package are untouched.

# How Seed sits on top of ProseMirror

Every package is an exact-pinned npm dependency. Nothing is vendored, forked or patched; Seed behaviour uses only ProseMirror's public extension points (`Schema` specs, `Plugin`, `keymap`, `InputRule`, `NodeView`, `EditorProps`).

| File | What it adds |
| --- | --- |
| `src/schema.ts` | The same document shape as the ProseKit spike (`doc > blockNode+`, `blockNode > content blockGroup?`, `blockGroup[childrenType] > blockNode+`), written as plain `NodeSpec` / `MarkSpec` objects. `paragraph`, `text` and the bold/italic/code/link marks come from `prosemirror-schema-basic`; underline, strike, colors, `heading`, `codeBlock`, `hmMath`, the atom blocks, `hmUnknown`, `hmMention` and `hmAnnotation` are Seed specs. |
| `src/convert.ts` | `fromHM` / `toHM` and `prosemirrorAdapter`. The same preservation model as ProseKit (`original` + `baseline` + `nodeKeys` on each `blockNode`); the code is the ProseKit converter with only the import paths changed, which shows the converter is editor-library independent. |
| `src/commands.ts` | The nested Enter / Tab / Shift-Tab / Backspace commands, the block id plugin (paste and duplicate get fresh ids), `duplicateBlock`, `replaceBlockContent`, the key map (history and mark toggles included) and the markdown input rules (`- `, `1. `, `> ` set the parent `childrenType`; `# `, ```` ``` ````, `$$` make heading, code and math blocks). |
| `src/suggest.ts` | A ~60-line suggestion plugin: detects `@`, `[[` and `/` before the cursor, exposes the match as plugin state, hands arrow/Enter/Tab keys to the open menu and dismisses on Escape. |
| `src/media.ts` | `youtubeParser` and `videoEmbedUrl` (copied from `@shm/editor`, so stored links match BlockNote's `https://www.youtube.com/embed/<id>` / `https://player.vimeo.com/video/<id>`), and a plugin that uploads pasted/dropped files through `uploadFile(file) => Promise<link>` and turns a YouTube/Vimeo URL pasted on an empty line into a Video block. |
| `src/editor.ts` | `createSeedPlugins` / `createSeedState`: the plugin list (Seed plugins plus stock `history`, `dropCursor`, `gapCursor`, `baseKeymap`). Tests use it without React. |
| `src/react/SeedProseMirrorEditor.tsx` | The React glue we had to write: mounts one `EditorView`, re-renders menus on each transaction through a context, and renders React node views as portals into ProseMirror-owned DOM (a ~40-line `PortalStore`). |
| `src/react/node-views.tsx` | Embed (Content/Card toggle, loads the document), Image (width, caption), Video (`<video>` with autoplay/loop/muted, or the YouTube/Vimeo iframe), the empty-media picker (URL, upload button, drop zone), File, Button, Web embed, Query, Nostr, mentions, and a plain-DOM math view with a lazily loaded KaTeX preview. |
| `src/react/menus.tsx` | Mention menus, slash menu, formatting toolbar and block handle (add, drag, duplicate), all hand-built absolutely positioned popovers. |

**Services.** `SeedEditorServices` is the ProseKit interface plus `uploadFile`. The harness wires it to `MentionCandidates` + `rankMentionCandidates`, `Resource` for embeds and mention labels, `getDaemonFileUrl` from `@shm/ui/get-file-url` for `ipfs://` links (with `SEED_ASSET_HOST` set to the default site), and `URL.createObjectURL` as the upload stand-in.

# The harness

`pnpm --filter @shm/editor-prosemirror dev` serves `http://localhost:5183` with the same UX as the ProseKit harness: `?site=…&id=hm://…` loads a public document, and the side panel shows the change operations and the HM blocks. `window.SEED_PM_VIEW` exposes the `EditorView`.

# Parity with the BlockNote editor

| Feature | ProseMirror spike | Notes |
| --- | --- | --- |
| Nested blocks, Tab / Shift-Tab | Done | Same commands as ProseKit, ported to direct imports. |
| `childrenType` Group / Ordered / Unordered / Blockquote | Done | `Grid` and unknown values preserved, rendered as a group. |
| Headings | Done | `# ` shortcut, slash menu, toolbar `H` toggle. |
| Bold, italic, underline, strike, code, link | Done | Toolbar and `Mod-b/i/u/e`, `Mod-Shift-s`. Link editing is a prompt. |
| Text and background color | Partial | Round-trip only, no UI. |
| `@` account mentions | Done | `MentionCandidates` + `rankMentionCandidates`; inserts `Embed` `hm://<uid>`. |
| `[[` document mentions | Done | Inserts `Embed` `hm://<uid>/<path>`. |
| Embed block, Content / Card views | Done | No Comments view; block/range embeds show the whole document. |
| Unknown blocks | Done | Editable text + children, everything preserved, no error banner. |
| Image | Done | Slash menu → URL, upload or drop; also drop/paste anywhere. Width and caption render. No resize handle. |
| Video | Done | URL, upload or drop; `ipfs://` plays in `<video>`; YouTube/Vimeo URLs normalized like BlockNote and play in an iframe; pasting one on an empty line creates a Video block. |
| File, button, web embed, query, Nostr | Partial | Render and round-trip; no settings forms, query results not loaded. |
| Code block | Partial | ```` ``` ```` shortcut, language preserved; no highlighting. |
| Math | Done | `$$` shortcut, editable TeX with live KaTeX preview. |
| Slash menu | Done | Paragraph, heading, code, math, list/quote children, image, video, embeds, button, web embed; filters as you type. |
| Drag handle / side menu | Partial | Add, drag (moves keep ids), duplicate; no block options menu. |
| Markdown shortcuts | Partial | Lists, quote, heading, code, math. No inline `**bold**` rules. |
| Paste | Partial | Id stripping, files, video URLs; no markdown or link-to-embed paste. |
| Comments, citations, range selection, draft machine, autosave | Missing | App integration, not part of the spike. |
| Publish from the harness | Missing | Shows the operations only. |

# Licenses and pinned versions

All MIT. Exact versions, matching the root `pnpm.overrides`, so the workspace resolves one copy of the core packages:

| Package | Version | License |
| --- | --- | --- |
| `prosemirror-model` | 1.25.4 | MIT |
| `prosemirror-state` | 1.4.4 | MIT |
| `prosemirror-view` | 1.42.3 | MIT |
| `prosemirror-transform` | 1.10.4 | MIT |
| `prosemirror-commands` | 1.7.1 | MIT |
| `prosemirror-keymap` | 1.2.3 | MIT |
| `prosemirror-inputrules` | 1.5.1 | MIT |
| `prosemirror-history` | 1.5.0 | MIT |
| `prosemirror-dropcursor` | 1.8.2 | MIT |
| `prosemirror-gapcursor` | 1.4.0 | MIT |
| `prosemirror-schema-basic` | 1.2.4 | MIT |
| `katex` | 0.18.2 (root override) | MIT |
| `@types/katex` (dev) | 0.16.7 | MIT |

Transitive: `orderedmap`, `rope-sequence`, `w3c-keyname` (MIT, same author). No helper libraries were added: `@handlewithcare/react-prosemirror` and `prosemirror-suggest`-style packages were not needed, because a portal store and a 60-line suggest plugin covered it.

**Duplicates.** `model`, `state`, `transform` and `view` are forced to one version by the root overrides. Other packages have nested copies only under `@prosekit/*` and `@tiptap/pm` (`prosemirror-commands` 1.7.2, `dropcursor` 1.8.4, `gapcursor` 1.4.1, `changeset`), which this package never resolves; it gets the hoisted root copies. No `@codemirror/*` is involved.

# Gaps and risks

- **We own the UI.** ProseMirror has no menus, popovers, positioning or block handle. Everything in `menus.tsx` is hand-written and simple: no flip/collision handling, no virtualized lists, keyboard support only where we added it. A production version would want a positioning helper (e.g. Floating UI, MIT) and accessibility work.
- **We own the React glue.** Portal node views are ~40 lines and work, but each React node view re-renders on every update of its node, and `stopEvent` / `ignoreMutation` are coarse. This is the area most likely to grow subtle selection bugs.
- **No ecosystem conveniences.** Things ProseKit ships as extensions (link popover, code highlighting, tables, virtual selection) are each a small project here.
- **Bug found in shared code.** The ProseKit `stripBlockIds` (copied here) rebuilt every node with `type.create`, which throws on text nodes, so any paste containing text failed inside `transformPasted`. Fixed in this package (the "pasted blocks get fresh ids" and YouTube paste tests caught it); `editor-prosekit` still has it, since this spike must not touch that package.
- **Media.** The harness upload is an object URL, so uploads don't survive a reload; the real app plugs in IPFS through `uploadFile`. No image resize handle.

# Upgrading

1. Bump the exact versions in `package.json` together with the root `pnpm.overrides` (they must stay equal) and run `pnpm install`.
2. Read the [ProseMirror changelog](https://prosemirror.net/docs/changelog/). The core has been 1.x since 2017 and follows semver strictly; breaking changes are rare.
3. Run `pnpm --filter @shm/editor-prosemirror typecheck` and `test`, then check the harness menus by hand.

# Comparison with ProseKit

| | ProseKit (#55) | Plain ProseMirror |
| --- | --- | --- |
| Seed-specific TS/TSX in `src/` | 1,253 lines | 1,860 lines (+48%) |
| Seed CSS | 238 lines | 314 lines (popovers we style ourselves) |
| Harness JS, gzip | 209 KB | 254 KB; 170 KB without `@shm/ui/get-file-url`, which pulls the `@shm/shared` barrel (~84 KB). KaTeX (77 KB JS + 8 KB CSS gzip) is a lazy chunk loaded on the first math block. |
| Media | Render only | URL/upload/drop pickers, YouTube/Vimeo, paste-to-video |
| Direct dependencies | 1 (`prosekit`, 0.x) | 11 `prosemirror-*` packages (1.x) + `katex` |
| UI we built | Contents of menus; ProseKit gives positioned autocomplete, inline popover and block handle components | Everything: trigger detection, positioning, keyboard navigation, block handle, drag start |

**Easier with plain ProseMirror:** no indirection. Schema specs, plugins and commands are the same objects the ProseMirror docs describe, so the nested Seed commands port with only import changes; the converter is identical. No custom-element/React 18 `className` problems, and the dependency is the slowest-moving part of the stack.

**Harder:** about 600 more lines for the same features, mostly menus, positioning, the suggest plugin and React node-view glue. ProseKit's autocomplete and block handle handle edge cases (scrolling, flipping, focus) that ours don't yet.

**Recommendation.** For replacing BlockNote, the deciding cost is not the document layer (identical in both) but the UI layer. Plain ProseMirror is viable and gives the most stable dependency, at the price of owning ~600 lines of menus and glue that will grow with polish. ProseKit gets the same features with less code and better-behaved menus, but adds a 0.x dependency between us and ProseMirror. Because the schema, converter and commands are plain ProseMirror objects in both spikes, choosing ProseKit now keeps the option to drop down to plain ProseMirror later with little rework.
