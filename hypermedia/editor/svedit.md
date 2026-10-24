---
name: The Svedit editor spike
summary: A second implementation of the editor adapter on Svedit, a Svelte 5 editor with a flat node graph, compared with BlockNote and the ProseKit spike.
---
`frontend/packages/editor-svedit` implements the [editor adapter](./adapter.md) on [Svedit](https://github.com/michael/svedit), so it can be compared with the ProseKit spike in `frontend/packages/editor-prosekit`. It reuses the shared contract (`EditorAdapter`, `hmDocumentOperations`) unchanged, the same fixtures and the same harness layout. BlockNote and the ProseKit package are untouched.

Horacio originally asked for [editable.website](https://github.com/michael/editable). Its `LICENSE` is a commercial license from Ken Experiences GmbH (one license per production website), so it can't be a dependency. Svedit is the editing engine underneath it, by the same author, and is MIT. editable.website was only used as a reference for UX.

# How Seed sits on top of Svedit

Svedit is an npm dependency pinned to an exact version (`svedit@0.15.1`, peer `svelte@5.57.1`). Nothing is vendored or patched. Seed behaviour uses Svedit's extension points: a document schema, node components, a session config (`generate_id`, `inserters`, `create_commands_and_keymap`, `system_components.overlays`), transforms and commands.

| File | What it adds |
| --- | --- |
| `src/schema.ts` | The Svedit schema. `hm_document.body` and every `hm_block.children` are `node_array`s of `hm_block`, so the HM tree is kept as a tree of references. One generic `hm_block` text node holds every HM block type in `block_type`, plus `children_type`, `link`, `attributes` (JSON), `hm_original`, `hm_baseline` and `hm_node_keys` for preservation. Marks are one `hm_inline` mark (styles, link, inline embed); unknown annotations are an `hm_annotation` annotation. `toNodeId` / `fromNodeId` encode HM ids into Svedit's id grammar. |
| `src/convert.ts` | `fromHM` / `toHM` and `sveditAdapter`. Converts HM code-point offsets to Svedit grapheme offsets and back, and overlapping HM annotations to disjoint marks and back. |
| `src/commands.ts` | Transaction helpers and keymap: Tab / Shift-Tab, Enter split, Shift-Enter, style toggles, links, mention insertion, `setBlockType`, list / quote `childrenType`, markdown shortcuts, menu keys, undo / redo, and media: `setMediaLink`, `placeMedia`, `uploadFiles`, `pasteVideoLink`. |
| `src/media.ts` | `youtubeParser` and the YouTube / Vimeo link normalisation copied from `@shm/editor` (`utils.ts`, `video.tsx`), so a Video block stores the same `https://www.youtube.com/embed/<id>` / `https://player.vimeo.com/video/<id>` link BlockNote writes. |
| `src/session.ts` | `createSeedSession`: the Svedit `Session` with Seed's components, commands and services. |
| `src/svelte/*` | Node components (`SeedDocument`, `SeedBlock`, `SeedInline`, `EmbedView`, `MediaPicker`), the overlay with the formatting toolbar, link input, `@` / `[[` mention menus and slash menu, and `SeedEditor`. |
| `src/react/SeedSveditEditor.tsx` | A React component that mounts the Svelte editor with `svelte`'s `mount` / `unmount`. |

**Preservation.** Same rule as ProseKit: each block keeps the loaded HM block (`hm_original`) and a baseline of the modeled fields. Untouched blocks are returned as the original object; edited blocks are written over a copy of it, so unknown attributes and top-level keys survive edits. Unknown annotations keep their JSON in `hm_annotation` and follow the text.

**Services.** `SeedEditorServices` (`searchMentions`, `loadDocument`, `fileUrl`, `uploadFile`) is the same idea as in ProseKit. The harness wires it to `MentionCandidates` + `rankMentionCandidates` and `Resource`. `fileUrl` resolves `ipfs://` links like `useFileUrl` in `@shm/ui/get-file-url` (`${ipfsFileUrl}/${cid}` via `extractIpfsUrlCid`); `uploadFile(file) => Promise<link>` is where the app plugs in its IPFS upload, and the harness returns a local object URL instead.

**Media.** Image, Video and File blocks without a `link` render `MediaPicker` (Upload button, link prompt, drop target). Files dropped anywhere on the editor, or pasted, go through `uploadFile`: they fill an empty media or paragraph block, otherwise a new block is inserted after the one under the drop. Images render with `width` and `name`, and their text is the editable caption. Video blocks whose link is a YouTube / Vimeo player render the iframe; any other link (`ipfs://` or a URL) plays in a `<video>` with `autoplay`, `loop` and `muted` from the attributes. Pasting a YouTube / Vimeo URL into an empty block turns it into a Video block. The harness serves one content-addressed test video (`harness/public/ipfs/<cid>`, a real raw-leaf CIDv1 of the file) as a stand-in gateway and redirects other CIDs to the site's `/ipfs/` gateway.

# How Svedit's model fits Seed

- **Flat graph vs tree.** Svedit stores nodes in a flat id-keyed map, but a node property can be a `node_array` of references. Seed's tree maps onto that directly: a block's `children` is a `node_array`, `childrenType` is a string next to it. The graph is not a limitation for nesting; Svedit just doesn't know it is a tree, so Seed owns every structural command (indent, outdent, split, list type).
- **Strict schema.** Svedit rejects node types and properties the schema doesn't declare. HM has an open set of block types, so the adapter can't give each type its own Svedit node: everything is one `hm_block` and `SeedBlock.svelte` switches on `block_type`. This is what makes unknown blocks safe (they are ordinary editable text with children) but it means Svedit's per-type node features (different properties per type, inserters per type) aren't used.
- **Ids.** Svedit ids can't contain `__` or most punctuation, so HM ids are encoded (`b` prefix, `_xxxxxx` escapes) and decoded on save. New blocks get fresh HM-style ids from `generate_id`.
- **Text offsets.** Svedit offsets are graphemes, HM offsets are code points. The adapter converts with `Intl.Segmenter`; emoji and flags are tested.
- **Marks.** Svedit marks can't overlap, HM annotations can. The adapter splits text into runs that each carry the full set of styles (`hm_inline.styles`) and merges them back into HM ranges on save. Typing at the end of a mark doesn't extend it, unlike BlockNote.
- **Mentions.** An inline `Embed` is the `\uFFFC` placeholder with an `hm_inline` mark carrying the link, rendered as a chip by `SeedInline.svelte`. The `@` / `[[` menus watch the text selection; the selection model (path + grapheme offsets) made trigger detection simple.
- **Nested lists.** Lists are children with `childrenType` `Ordered` / `Unordered`, rendered with CSS counters. Svedit has no list concept of its own, which is a good fit: there is nothing to fight.
- **Selection.** Svedit has text, node and property selections and "node gaps" between blocks for inserting. A text selection lives in one text property; selecting across blocks becomes a node selection within one node array. Cross-level selections in nested trees weren't tested in depth.

# The harness

`pnpm --filter @shm/editor-svedit dev` serves `http://localhost:5182`, a React page that hosts the Svelte editor through `SeedSveditEditor`. It loads any public document (`?site=https://seed.horacioh.com&id=hm://…`) or a local demo document (`?id=demo`, with embeds, lists, media and an unknown block) and shows the change operations and HM blocks side by side, like the ProseKit harness.

# Parity with the BlockNote editor

| Feature | Svedit spike | Notes |
| --- | --- | --- |
| Nested blocks, Tab / Shift-Tab | Done | Shift-Tab takes following siblings along as children, like BlockNote. |
| `childrenType` Group / Ordered / Unordered / Blockquote | Done | Unknown values are preserved and render as a group. |
| Headings | Done | |
| Bold, italic, underline, strike, code, link | Done | Floating toolbar with a link input, and Mod-B / I / U / Shift-X / E / K shortcuts. |
| Text and background color | Partial | Round-trip only, no UI. |
| `@` account mentions | Done | Inserts `Embed` `hm://<uid>`. |
| `[[` document mentions | Done | Inserts `Embed` `hm://<uid>/<path>`. |
| Embed block, Content / Card views | Done | Loads and shows the embedded document; block fragments show that block. No Comments view, no view toggle UI. |
| Unknown blocks | Done | Editable text + children, everything preserved, no error banner. |
| Image | Done | Slash menu, Upload button, drag and drop and paste through `uploadFile`, or a URL. Renders `width`, `name` and the caption; `ipfs://` goes through the `@shm/ui/get-file-url` resolution. No resize handle or width form (width is kept, not editable). |
| Video | Done | Same insertion paths as Image. `ipfs://` and file URLs play in `<video>` with `autoplay` / `loop` / `muted`. No settings form for those flags (kept, not editable). |
| YouTube / Vimeo | Done | Slash menu entry, the Video link prompt, or pasting the URL on an empty line; stored as the BlockNote player link and rendered as an iframe. |
| File, button | Partial | Render and round-trip; File has the same upload / drop / link picker; no button settings form. |
| Code block | Partial | Editable, newlines allowed, language preserved; no highlighting. |
| Math | Partial | Editable source, no KaTeX rendering. |
| Web embed, query | Partial | Placeholder + round-trip; query results aren't loaded. |
| Slash menu | Partial | Heading, paragraph, lists, quote, code, math, button, embeds, image, video, YouTube / Vimeo, file, web embed. |
| Markdown shortcuts | Partial | `# `, `- `, `* `, `1. `, `> `, ```` ``` ````. |
| Drag handle / side menu | Missing | Svedit has node selection and node gaps (insert between blocks) but no drag handle. |
| Paste | Partial | Svedit's own paste handling, plus Seed's: pasted files are uploaded, and a YouTube / Vimeo URL on an empty line becomes a Video block. No id stripping, markdown or `hm://` link-to-embed paste yet. |
| Comments, citations, range selection, draft machine, autosave | Missing | App integration, not part of the spike. |

# Svedit: license, gaps and risks

- **License.** Svedit is MIT (`package.json` and `LICENSE` in the repository). It has no runtime dependencies, only a `svelte ^5` peer. Svelte is MIT; its dependencies are MIT except `aria-query` and `axobject-query` (Apache-2.0, compile-time a11y checks). editable.website is not permissive and is not used.
- **Maturity.** Svedit is 0.x, has one main author and a small community, and its README says it is early. The spike hit gaps a mature editor would cover: commands only exist once the `Svedit` component mounts, marks can't overlap, typing at a mark boundary doesn't extend the mark, no drag handle, no IME / mobile keyboard testing beyond basic typing.
- **Svelte inside React.** The apps are React. `SeedSveditEditor` mounts the editor with `mount()` and tears it down with `unmount()`; props go in once, changes come out through callbacks. That works (the harness is React), but every Seed UI piece inside the editor (embeds, mention chips, menus, media forms) has to be written in Svelte, not reused from `@shm/ui`. Two UI frameworks, two styling setups and two sets of a11y primitives is the main ongoing cost.
- **Bundle size.** Harness production builds (both include React and the Seed client): Svedit 479 kB / 149 kB gzip, ProseKit 670 kB / 209 kB gzip. Svedit plus the Svelte runtime is smaller than ProseMirror plus ProseKit, but in the apps it would be in addition to React, and BlockNote/Tiptap would only drop out at the end of a migration.
- **Strict schema vs open HM.** Using one generic node type is robust but means Seed reimplements per-type behaviour in one component, and Svedit's own type-level features are unused.

# Upgrading Svedit

1. Bump the exact `svedit` (and if needed `svelte`) version in `frontend/packages/editor-svedit/package.json` and run `pnpm install`.
2. Read Svedit's commits / changelog for changes to `Session`, `Transaction`, the schema API and `Svedit.svelte` props, the parts `schema.ts`, `session.ts` and `commands.ts` use.
3. Run `pnpm --filter @shm/editor-svedit typecheck` and `test`. The round-trip tests on real documents catch schema and conversion regressions.
4. Open the harness and check typing, menus, Tab / Shift-Tab and the toolbar by hand.

No Seed code lives inside Svedit, so there is nothing to merge.

# Svedit compared with ProseKit

| | Svedit | ProseKit |
| --- | --- | --- |
| Effort | Similar size. Conversion needed more work (id encoding, grapheme offsets, disjoint marks); structural commands were easier on a graph. | Conversion simpler (ProseMirror marks overlap, code-unit offsets); nested `blockNode` / `blockGroup` commands needed care. |
| Fit with Seed's nested model | Good: `node_array` children are the HM tree. Open block types need one generic node. | Good: the schema expresses the tree directly, and unknown types get their own node. |
| Extension API | Small and readable (schema, components, transforms, keymap), but less of it: no plugins, no decorations, no input rules. | Large: ProseMirror plugins, input rules, node views and ProseKit's ready extensions (code highlighting, tables, block handle). |
| React integration | Svelte inside React through `mount`; Seed UI in the editor must be Svelte. | Native `prosekit/react` bindings; Seed UI can reuse React components. |
| Bundle size | 149 kB gzip harness. | 209 kB gzip harness. |
| Maturity / community | 0.x, one main author, small user base. | 0.x on top of ProseMirror, which is mature and widely used. |

**Recommendation.** Svedit can carry Seed documents without losing data and its node-array model fits the HM tree well, but it is not the better choice to replace BlockNote. The Svelte-in-React cost applies to every Seed component inside the editor, the editor is young with a single maintainer, and ProseKit gives the same "unmodified dependency + Seed extensions" property on ProseMirror with native React bindings. Svedit is worth revisiting if Seed moves its UI to Svelte or Svedit's ecosystem matures.
