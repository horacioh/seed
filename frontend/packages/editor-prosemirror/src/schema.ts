import {type MarkSpec, type NodeSpec, Schema} from 'prosemirror-model'
import {marks as basicMarks, nodes as basicNodes} from 'prosemirror-schema-basic'

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

/** HM block type → ProseMirror node name for every block type the editor models. */
export const HM_TO_NODE: Record<string, string> = {
  Paragraph: 'paragraph',
  Heading: 'heading',
  Code: 'codeBlock',
  Math: 'hmMath',
  ...ATOM_BLOCK_TYPES,
}

/** ProseMirror node name → HM block type (inverse of {@link HM_TO_NODE}). */
export const NODE_TO_HM: Record<string, string> = Object.fromEntries(
  Object.entries(HM_TO_NODE).map(([hm, node]) => [node, hm]),
)

const atomAttrs = {link: {default: ''}, text: {default: ''}, attributes: {default: {}}}

const atomNodes: Record<string, NodeSpec> = Object.fromEntries(
  Object.entries(ATOM_BLOCK_TYPES).map(([hmType, name]) => [
    name,
    {
      group: 'block',
      atom: true,
      selectable: true,
      draggable: false,
      attrs: atomAttrs,
      parseDOM: [{tag: `div[data-hm-type="${hmType}"]`}],
      toDOM: () => ['div', {'data-hm-type': hmType}],
    } satisfies NodeSpec,
  ]),
)

/**
 * Node specs of the Seed document. Mirrors the HM tree: a `blockNode` is one
 * HM block (its content node) plus an optional `blockGroup` with its
 * children. The group's `childrenType` is the parent block's
 * `attributes.childrenType`. `blockNode.attrs.original` keeps the HM block
 * exactly as loaded, so fields this editor does not model survive the round
 * trip.
 */
export const seedNodes: Record<string, NodeSpec> = {
  doc: {content: 'blockNode+'},
  blockNode: {
    content: 'block blockGroup?',
    defining: true,
    attrs: {id: {default: null}, original: {default: null}, baseline: {default: null}, nodeKeys: {default: null}},
    parseDOM: [{tag: 'div[data-node-type="blockNode"]', getAttrs: (el) => ({id: el.getAttribute('data-id')})}],
    toDOM: (node) => ['div', {'data-node-type': 'blockNode', 'data-id': node.attrs.id, class: 'seed-block'}, 0],
  },
  blockGroup: {
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
  },
  paragraph: {...basicNodes.paragraph, group: 'block'},
  heading: {
    group: 'block',
    content: 'inline*',
    defining: true,
    parseDOM: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => ({tag})),
    toDOM: () => ['h2', {class: 'seed-heading'}, 0],
  },
  codeBlock: {
    group: 'block',
    content: 'text*',
    marks: '',
    code: true,
    defining: true,
    attrs: {language: {default: ''}},
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (el) => ({language: el.getAttribute('data-language') || ''}),
      },
    ],
    toDOM: (node) => ['pre', {'data-language': node.attrs.language || null}, ['code', 0]],
  },
  hmMath: {
    group: 'block',
    content: 'text*',
    marks: '',
    code: true,
    parseDOM: [{tag: 'pre[data-hm-type="Math"]', preserveWhitespace: 'full'}],
    toDOM: () => ['pre', {'data-hm-type': 'Math', class: 'seed-math'}, 0],
  },
  ...atomNodes,
  // Any block type this editor doesn't understand: its text and inline
  // annotations stay editable, children render through the block group, and
  // the full original block lives in `blockNode.attrs.original`.
  hmUnknown: {
    group: 'block',
    content: 'inline*',
    attrs: {hmType: {default: ''}},
    parseDOM: [{tag: 'div[data-hm-unknown]', getAttrs: (el) => ({hmType: el.getAttribute('data-hm-unknown')})}],
    toDOM: (node) => ['div', {'data-hm-unknown': node.attrs.hmType, class: 'seed-unknown'}, 0],
  },
  text: basicNodes.text,
  // Inline `Embed` annotation (account/document mention) over U+FFFC.
  hmMention: {
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    attrs: {link: {default: ''}, mentionKind: {default: null}, annotation: {default: null}},
    parseDOM: [{tag: 'span[data-hm-mention]', getAttrs: (el) => ({link: el.getAttribute('data-hm-mention')})}],
    toDOM: (node) => ['span', {'data-hm-mention': node.attrs.link, class: 'seed-mention'}, node.attrs.link],
  },
}

/** Mark specs: basic marks from `prosemirror-schema-basic` plus the ones it lacks. */
export const seedMarks: Record<string, MarkSpec> = {
  link: {...basicMarks.link, inclusive: false},
  bold: basicMarks.strong,
  italic: basicMarks.em,
  underline: {parseDOM: [{tag: 'u'}, {style: 'text-decoration=underline'}], toDOM: () => ['u', 0]},
  strike: {parseDOM: [{tag: 's'}, {tag: 'del'}, {style: 'text-decoration=line-through'}], toDOM: () => ['s', 0]},
  code: basicMarks.code,
  textColor: {
    attrs: {color: {}},
    parseDOM: [{tag: 'span[data-text-color]', getAttrs: (el) => ({color: el.getAttribute('data-text-color')})}],
    toDOM: (mark) => ['span', {'data-text-color': mark.attrs.color, style: `color: ${mark.attrs.color}`}, 0],
  },
  backgroundColor: {
    attrs: {color: {}},
    parseDOM: [{tag: 'span[data-bg-color]', getAttrs: (el) => ({color: el.getAttribute('data-bg-color')})}],
    toDOM: (mark) => ['span', {'data-bg-color': mark.attrs.color, style: `background-color: ${mark.attrs.color}`}, 0],
  },
  // Any annotation the editor doesn't model (Range, TextSize, future types,
  // or a known type carrying extra fields). Several can overlap, and they
  // move with the text they cover.
  hmAnnotation: {
    excludes: '',
    inclusive: false,
    attrs: {annotation: {default: null}},
    parseDOM: [{tag: 'span[data-hm-annotation]'}],
    toDOM: (mark) => ['span', {'data-hm-annotation': mark.attrs.annotation?.type ?? ''}, 0],
  },
}

/** The ProseMirror schema of a Seed document. */
export const seedSchema = new Schema({nodes: seedNodes, marks: seedMarks})
