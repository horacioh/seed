import {defineBaseCommands, defineHistory, defineMarkSpec, defineNodeSpec, union} from 'prosekit/core'
import {defineBackgroundColor} from 'prosekit/extensions/background-color'
import {defineBold} from 'prosekit/extensions/bold'
import {defineCode} from 'prosekit/extensions/code'
import {defineCodeBlock} from 'prosekit/extensions/code-block'
import {defineDropIndicator} from 'prosekit/extensions/drop-indicator'
import {defineGapCursor} from 'prosekit/extensions/gap-cursor'
import {defineHeading} from 'prosekit/extensions/heading'
import {defineItalic} from 'prosekit/extensions/italic'
import {defineLink} from 'prosekit/extensions/link'
import {defineParagraph} from 'prosekit/extensions/paragraph'
import {defineStrike} from 'prosekit/extensions/strike'
import {defineText} from 'prosekit/extensions/text'
import {defineTextColor} from 'prosekit/extensions/text-color'
import {defineUnderline} from 'prosekit/extensions/underline'

/**
 * HM block types rendered as atom (non-editable-text) nodes. They keep the
 * block's `link`, `text` and `attributes` verbatim in node attrs; node views
 * render them.
 */
export const ATOM_BLOCK_TYPES = {
  Embed: 'hmEmbed',
  Image: 'hmImage',
  Video: 'hmVideo',
  File: 'hmFile',
  Button: 'hmButton',
  WebEmbed: 'hmWebEmbed',
  Query: 'hmQuery',
  Nostr: 'hmNostr',
} as const

/** HM block type → ProseKit node name for every block type the editor models. */
export const HM_TO_NODE: Record<string, string> = {
  Paragraph: 'paragraph',
  Heading: 'heading',
  Code: 'codeBlock',
  Math: 'hmMath',
  ...ATOM_BLOCK_TYPES,
}

/** ProseKit node name → HM block type (inverse of {@link HM_TO_NODE}). */
export const NODE_TO_HM: Record<string, string> = Object.fromEntries(
  Object.entries(HM_TO_NODE).map(([hm, node]) => [node, hm]),
)

/**
 * Document structure. Mirrors the HM tree: a `blockNode` is one HM block
 * (its content node) plus an optional `blockGroup` with its children. The
 * group's `childrenType` is the parent block's `attributes.childrenType`.
 *
 * `blockNode.attrs.original` keeps the HM block exactly as loaded, so fields
 * this editor does not model survive the round trip.
 */
function defineStructure() {
  return union(
    defineNodeSpec({name: 'doc', topNode: true, content: 'blockNode+'}),
    defineNodeSpec({
      name: 'blockNode',
      content: 'block blockGroup?',
      defining: true,
      draggable: true,
      attrs: {
        id: {default: null},
        original: {default: null},
        baseline: {default: null},
        nodeKeys: {default: null},
      },
      parseDOM: [{tag: 'div[data-node-type="blockNode"]', getAttrs: (el) => ({id: el.getAttribute('data-id')})}],
      toDOM: (node) => ['div', {'data-node-type': 'blockNode', 'data-id': node.attrs.id, class: 'seed-block'}, 0],
    }),
    defineNodeSpec({
      name: 'blockGroup',
      content: 'blockNode+',
      attrs: {childrenType: {default: null}},
      parseDOM: [
        {
          tag: 'div[data-node-type="blockGroup"]',
          getAttrs: (el) => ({childrenType: el.getAttribute('data-children-type') || null}),
        },
      ],
      toDOM: (node) => [
        'div',
        {'data-node-type': 'blockGroup', 'data-children-type': node.attrs.childrenType ?? 'Group', class: 'seed-group'},
        0,
      ],
    }),
  )
}

/** Atom/text block nodes for Seed block types ProseKit has no extension for. */
function defineSeedBlocks() {
  const atomAttrs = {link: {default: ''}, text: {default: ''}, attributes: {default: {}}}
  return union(
    ...Object.entries(ATOM_BLOCK_TYPES).map(([hmType, name]) =>
      defineNodeSpec({
        name,
        group: 'block',
        atom: true,
        selectable: true,
        attrs: atomAttrs,
        parseDOM: [{tag: `div[data-hm-type="${hmType}"]`}],
        toDOM: () => ['div', {'data-hm-type': hmType}],
      }),
    ),
    defineNodeSpec({
      name: 'hmMath',
      group: 'block',
      content: 'text*',
      marks: '',
      code: true,
      parseDOM: [{tag: 'pre[data-hm-type="Math"]', preserveWhitespace: 'full'}],
      toDOM: () => ['pre', {'data-hm-type': 'Math', class: 'seed-math'}, 0],
    }),
    // Any block type this editor doesn't understand: its text and inline
    // annotations stay editable, children render through the block group,
    // and the full original block lives in `blockNode.attrs.original`.
    defineNodeSpec({
      name: 'hmUnknown',
      group: 'block',
      content: 'inline*',
      attrs: {hmType: {default: ''}},
      parseDOM: [{tag: 'div[data-hm-unknown]', getAttrs: (el) => ({hmType: el.getAttribute('data-hm-unknown')})}],
      toDOM: (node) => ['div', {'data-hm-unknown': node.attrs.hmType, class: 'seed-unknown'}, 0],
    }),
  )
}

/** Inline nodes and marks that carry Seed annotations ProseKit doesn't model. */
function defineSeedInline() {
  return union(
    // Inline `Embed` annotation (account/document mention) over U+FFFC.
    defineNodeSpec({
      name: 'hmMention',
      group: 'inline',
      inline: true,
      atom: true,
      selectable: true,
      attrs: {link: {default: ''}, mentionKind: {default: null}, annotation: {default: null}},
      parseDOM: [{tag: 'span[data-hm-mention]', getAttrs: (el) => ({link: el.getAttribute('data-hm-mention')})}],
      toDOM: (node) => ['span', {'data-hm-mention': node.attrs.link, class: 'seed-mention'}, node.attrs.link],
    }),
    // Any annotation the editor doesn't model (Range, TextSize, future types,
    // or a known type carrying extra fields). Several can overlap, and they
    // move with the text they cover.
    defineMarkSpec({
      name: 'hmAnnotation',
      excludes: '',
      inclusive: false,
      attrs: {annotation: {default: null}},
      parseDOM: [{tag: 'span[data-hm-annotation]'}],
      toDOM: (mark) => ['span', {'data-hm-annotation': mark.attrs.annotation?.type ?? ''}, 0],
    }),
  )
}

/**
 * The schema-level Seed extension: plain ProseKit extensions for everything
 * ProseKit already ships, plus Seed node and mark specs on top. Keymaps,
 * plugins and React views are added by {@link defineSeedEditorExtension}.
 */
export function defineSeedSchema() {
  return union(
    defineStructure(),
    defineText(),
    defineParagraph(),
    defineHeading(),
    defineCodeBlock(),
    defineSeedBlocks(),
    defineSeedInline(),
    defineBold(),
    defineItalic(),
    defineUnderline(),
    defineStrike(),
    defineCode(),
    defineLink(),
    defineTextColor(),
    defineBackgroundColor(),
  )
}

/** Schema plus editing behaviour that doesn't need a DOM-bound UI layer. */
export function defineSeedEditorBase() {
  return union(defineSeedSchema(), defineBaseCommands(), defineHistory(), defineGapCursor(), defineDropIndicator())
}

/** The extension type of the Seed ProseKit editor, for typed `useEditor`. */
export type SeedSchemaExtension = ReturnType<typeof defineSeedSchema>
