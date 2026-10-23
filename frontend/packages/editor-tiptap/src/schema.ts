import {type Extensions, getSchema, Mark, Node} from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Heading from '@tiptap/extension-heading'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import {BackgroundColor, Color, TextStyle} from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import type {Schema} from '@tiptap/pm/model'

/**
 * HM block types rendered as atom (non-editable-text) nodes. They keep the
 * block's `link`, `text` and `attributes` verbatim in node attrs; React node
 * views render them.
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

/** HM block type → Tiptap node name for every block type the editor models. */
export const HM_TO_NODE: Record<string, string> = {
  Paragraph: 'paragraph',
  Heading: 'heading',
  Code: 'codeBlock',
  Math: 'hmMath',
  ...ATOM_BLOCK_TYPES,
}

/** Tiptap node name → HM block type (inverse of {@link HM_TO_NODE}). */
export const NODE_TO_HM: Record<string, string> = Object.fromEntries(
  Object.entries(HM_TO_NODE).map(([hm, node]) => [node, hm]),
)

/** An attribute kept only in editor state (never written to the DOM). */
const stateAttr = (fallback: unknown = null) => ({default: fallback, rendered: false, keepOnSplit: false})

/** An attribute stored as JSON in a `data-*` attribute, so copy/paste keeps it. */
function jsonAttr(name: string, fallback: unknown, dataName = name) {
  return {
    default: fallback,
    keepOnSplit: false,
    parseHTML: (el: HTMLElement) => {
      const raw = el.getAttribute(`data-${dataName}`)
      if (raw == null) return fallback
      try {
        return JSON.parse(raw)
      } catch {
        return fallback
      }
    },
    renderHTML: (attrs: Record<string, unknown>) => ({[`data-${dataName}`]: JSON.stringify(attrs[name])}),
  }
}

/**
 * Document structure. Mirrors the HM tree: a `blockNode` is one HM block
 * (its content node) plus an optional `blockGroup` with its children. The
 * group's `childrenType` is the parent block's `attributes.childrenType`.
 *
 * `blockNode.attrs.original` keeps the HM block exactly as loaded, so fields
 * this editor does not model survive the round trip.
 */
const SeedDoc = Node.create({name: 'doc', topNode: true, content: 'blockNode+'})

const BlockNode = Node.create({
  name: 'blockNode',
  content: 'block blockGroup?',
  defining: true,
  draggable: true,
  addAttributes: () => ({
    id: {
      default: null,
      keepOnSplit: false,
      parseHTML: (el) => el.getAttribute('data-id'),
      renderHTML: (attrs) => ({'data-id': attrs.id}),
    },
    original: stateAttr(),
    baseline: stateAttr(),
    nodeKeys: stateAttr(),
  }),
  parseHTML: () => [{tag: 'div[data-node-type="blockNode"]'}],
  renderHTML: ({HTMLAttributes}) => ['div', {...HTMLAttributes, 'data-node-type': 'blockNode', class: 'seed-block'}, 0],
})

const BlockGroup = Node.create({
  name: 'blockGroup',
  content: 'blockNode+',
  addAttributes: () => ({
    childrenType: {
      default: null,
      parseHTML: (el) => el.getAttribute('data-children-type') || null,
      renderHTML: (attrs) => ({'data-children-type': attrs.childrenType ?? 'Group'}),
    },
  }),
  parseHTML: () => [{tag: 'div[data-node-type="blockGroup"]'}],
  renderHTML: ({HTMLAttributes}) => [
    'div',
    {...HTMLAttributes, 'data-node-type': 'blockGroup', class: 'seed-group'},
    0,
  ],
})

/** Atom nodes for HM block types Tiptap has no extension for. React views are added in `react/node-views`. */
export const atomBlockNodes = Object.entries(ATOM_BLOCK_TYPES).map(([hmType, name]) =>
  Node.create({
    name,
    group: 'block',
    atom: true,
    selectable: true,
    addAttributes: () => ({
      link: jsonAttr('link', ''),
      text: jsonAttr('text', ''),
      attributes: jsonAttr('attributes', {}),
    }),
    parseHTML: () => [{tag: `div[data-hm-type="${hmType}"]`}],
    renderHTML: ({HTMLAttributes}) => ['div', {...HTMLAttributes, 'data-hm-type': hmType}],
  }),
)

const MathBlock = Node.create({
  name: 'hmMath',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  parseHTML: () => [{tag: 'pre[data-hm-type="Math"]', preserveWhitespace: 'full'}],
  renderHTML: () => ['pre', {'data-hm-type': 'Math', class: 'seed-math'}, 0],
})

/**
 * Any block type this editor doesn't understand: its text and inline
 * annotations stay editable, children render through the block group, and
 * the full original block lives in `blockNode.attrs.original`.
 */
const UnknownBlock = Node.create({
  name: 'hmUnknown',
  group: 'block',
  content: 'inline*',
  addAttributes: () => ({
    hmType: {
      default: '',
      parseHTML: (el) => el.getAttribute('data-hm-unknown'),
      renderHTML: (attrs) => ({'data-hm-unknown': attrs.hmType}),
    },
  }),
  parseHTML: () => [{tag: 'div[data-hm-unknown]'}],
  renderHTML: ({HTMLAttributes}) => ['div', {...HTMLAttributes, class: 'seed-unknown'}, 0],
})

/** Inline `Embed` annotation (account/document mention) over U+FFFC. */
export const MentionNode = Node.create({
  name: 'hmMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addAttributes: () => ({
    link: {
      default: '',
      parseHTML: (el) => el.getAttribute('data-hm-mention'),
      renderHTML: (attrs) => ({'data-hm-mention': attrs.link}),
    },
    mentionKind: stateAttr(),
    annotation: jsonAttr('annotation', null, 'embed'),
  }),
  parseHTML: () => [{tag: 'span[data-hm-mention]'}],
  renderHTML: ({node, HTMLAttributes}) => ['span', {...HTMLAttributes, class: 'seed-mention'}, node.attrs.link],
  renderText: () => '\uFFFC',
})

/**
 * Any annotation the editor doesn't model (Range, TextSize, future types, or
 * a known type carrying extra fields). Several can overlap, and they move
 * with the text they cover.
 */
const GenericAnnotation = Mark.create({
  name: 'hmAnnotation',
  excludes: '',
  inclusive: false,
  addAttributes: () => ({annotation: jsonAttr('annotation', null)}),
  parseHTML: () => [{tag: 'span[data-annotation]:not([data-hm-mention])'}],
  renderHTML: ({HTMLAttributes}) => ['span', HTMLAttributes, 0],
})

/**
 * The schema-level Seed extensions: stock Tiptap extensions for everything
 * Tiptap already ships, plus Seed node and mark specs on top. Keymaps and
 * plugins live in `commands.ts`; React node views in `react/node-views.tsx`.
 */
export function seedSchemaExtensions(): Extensions {
  return [
    SeedDoc,
    BlockNode,
    BlockGroup,
    Text,
    Paragraph,
    Heading.configure({levels: [1, 2, 3]}),
    CodeBlock.configure({defaultLanguage: null, enableTabIndentation: false}),
    MathBlock,
    UnknownBlock,
    ...atomBlockNodes,
    MentionNode,
    GenericAnnotation,
    Bold,
    Italic,
    Underline,
    Strike,
    Code,
    Link.configure({openOnClick: false, autolink: true, linkOnPaste: true}),
    TextStyle,
    Color,
    BackgroundColor,
  ]
}

let cachedSchema: Schema | undefined
/** The ProseMirror schema Tiptap builds from {@link seedSchemaExtensions}. */
export function getSeedSchema(): Schema {
  cachedSchema ??= getSchema(seedSchemaExtensions())
  return cachedSchema
}
