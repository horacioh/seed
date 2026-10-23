import {type Extensions, Extension, InputRule} from '@tiptap/core'
import {Dropcursor, Gapcursor, Placeholder, UndoRedo} from '@tiptap/extensions'
import {chainCommands, joinBackward, joinTextblockBackward, selectNodeBackward} from '@tiptap/pm/commands'
import {Fragment, type Node as PMNode, type ResolvedPos, Slice} from '@tiptap/pm/model'
import {
  type Command,
  type EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  type Selection,
  TextSelection,
  type Transaction,
} from '@tiptap/pm/state'
import {createBlockId} from './convert'
import {seedSchemaExtensions} from './schema'

/** Depth of the innermost `blockNode` around `$pos`, or -1. */
export function blockDepth($pos: ResolvedPos): number {
  for (let d = $pos.depth; d > 0; d--) if ($pos.node(d).type.name === 'blockNode') return d
  return -1
}

/** Re-create the selection after the block that held it moved from `oldStart` to `newStart`. */
function moveSelection(tr: Transaction, sel: Selection, oldStart: number, newStart: number) {
  const shift = newStart - oldStart
  if (sel instanceof NodeSelection) return tr.setSelection(NodeSelection.create(tr.doc, sel.from + shift))
  return tr.setSelection(TextSelection.create(tr.doc, sel.anchor + shift, sel.head + shift))
}

/** Tab: make the current block the last child of its previous sibling. */
export const sinkBlock: Command = (state, dispatch) => {
  const {$from} = state.selection
  const d = blockDepth($from)
  if (d < 0) return false
  const index = $from.index(d - 1)
  if (index === 0) return false
  const node = $from.node(d)
  const prev = $from.node(d - 1).child(index - 1)
  const nodeStart = $from.before(d)
  const prevStart = nodeStart - prev.nodeSize
  const prevGroup = prev.childCount > 1 ? prev.child(1) : null
  const schema = state.schema
  let newPrev: PMNode
  let newNodeStart: number
  if (prevGroup) {
    newPrev = prev.copy(prev.content.replaceChild(1, prevGroup.copy(prevGroup.content.addToEnd(node))))
    newNodeStart = prevStart + prev.nodeSize - 2
  } else {
    newPrev = prev.copy(prev.content.addToEnd(schema.nodes.blockGroup!.create({childrenType: 'Group'}, node)))
    newNodeStart = prevStart + prev.nodeSize
  }
  if (dispatch) {
    const tr = state.tr.replaceWith(prevStart, nodeStart + node.nodeSize, newPrev)
    dispatch(moveSelection(tr, state.selection, nodeStart, newNodeStart).scrollIntoView())
  }
  return true
}

/**
 * Shift-Tab: move the current block out of its parent, right after it. Later
 * siblings become the block's own children, so document order is unchanged.
 */
export const liftBlock: Command = (state, dispatch) => {
  const {$from} = state.selection
  const d = blockDepth($from)
  if (d < 3 || $from.node(d - 1).type.name !== 'blockGroup') return false
  const node = $from.node(d)
  const group = $from.node(d - 1)
  const parent = $from.node(d - 2)
  const index = $from.index(d - 1)
  const before: PMNode[] = []
  const after: PMNode[] = []
  group.forEach((child, _offset, i) => (i < index ? before : i > index ? after : null)?.push(child))
  const newParent = before.length
    ? parent.copy(parent.content.replaceChild(1, group.copy(Fragment.from(before))))
    : parent.copy(Fragment.from(parent.firstChild))
  let newNode = node
  if (after.length) {
    const ownGroup = node.childCount > 1 ? node.child(1) : null
    newNode = ownGroup
      ? node.copy(node.content.replaceChild(1, ownGroup.copy(ownGroup.content.append(Fragment.from(after)))))
      : node.copy(node.content.addToEnd(group.copy(Fragment.from(after))))
  }
  if (dispatch) {
    const parentStart = $from.before(d - 2)
    const tr = state.tr.replaceWith(parentStart, parentStart + parent.nodeSize, [newParent, newNode])
    dispatch(moveSelection(tr, state.selection, $from.before(d), parentStart + newParent.nodeSize).scrollIntoView())
  }
  return true
}

function newBlock(state: EditorState, content?: PMNode) {
  return state.schema.nodes.blockNode!.create(null, content ?? state.schema.nodes.paragraph!.create())
}

/** Enter: split the block (not just its paragraph), keeping the id on the original block. */
export const splitSeedBlock: Command = (state, dispatch) => {
  const {$from, $to} = state.selection
  const d = blockDepth($from)
  if (d < 0) return false
  const block = $from.node(d)
  const content = block.firstChild!
  const blockStart = $from.before(d)
  if (state.selection instanceof NodeSelection || !content.isTextblock) {
    if (dispatch) {
      const pos = blockStart + block.nodeSize
      const tr = state.tr.insert(pos, newBlock(state))
      dispatch(tr.setSelection(TextSelection.create(tr.doc, pos + 2)).scrollIntoView())
    }
    return true
  }
  if (content.type.spec.code || $from.parent !== content || $to.parent !== content) return false
  if (content.content.size === 0) {
    if (liftBlock(state, dispatch)) return true
    if (content.type.name !== 'paragraph' && content.type.name !== 'hmUnknown') {
      dispatch?.(state.tr.setBlockType($from.pos, $from.pos, state.schema.nodes.paragraph!))
      return true
    }
  }
  if (!dispatch) return true
  const tr = state.tr.deleteSelection()
  const $pos = tr.doc.resolve(tr.mapping.map($from.pos))
  const atStart = $pos.parentOffset === 0 && content.content.size > 0
  const atEnd = $pos.parentOffset === $pos.parent.content.size
  const group = block.childCount > 1 ? block.child(1) : null
  if (atStart) {
    tr.insert(blockStart, newBlock(state))
  } else if (atEnd && group) {
    const pos = blockStart + 1 + tr.doc.nodeAt(blockStart)!.firstChild!.nodeSize + 1
    tr.insert(pos, newBlock(state))
    tr.setSelection(TextSelection.create(tr.doc, pos + 2))
  } else {
    const after = atEnd ? state.schema.nodes.paragraph! : $pos.parent.type
    tr.split($pos.pos, 2, [
      {type: state.schema.nodes.blockNode!},
      {type: after, attrs: atEnd ? null : $pos.parent.attrs},
    ])
  }
  dispatch(tr.scrollIntoView())
  return true
}

/** Backspace at the start of a block: heading → paragraph, first child → outdent, else join. */
export const backspaceSeedBlock: Command = (state, dispatch, view) => {
  const {$from, empty} = state.selection
  const d = blockDepth($from)
  if (!empty || d < 0 || $from.parentOffset !== 0 || $from.parent !== $from.node(d).firstChild) return false
  const content = $from.parent
  if (content.type.name === 'heading' || content.type.name === 'hmMath' || content.type.name === 'codeBlock') {
    dispatch?.(state.tr.setBlockType($from.pos, $from.pos, state.schema.nodes.paragraph!))
    return true
  }
  if ($from.index(d - 1) === 0 && liftBlock(state, dispatch)) return true
  // At the very start of the document there is nothing to join; claim the key
  // so Tiptap's default `clearNodes` doesn't turn an unknown block into a paragraph.
  if ($from.before(d) === 0) return true
  return chainCommands(joinTextblockBackward, joinBackward, selectNodeBackward)(state, dispatch, view)
}

/** Set the `childrenType` of the group containing the current block (lists, blockquote). */
export function setParentChildrenType(childrenType: 'Group' | 'Ordered' | 'Unordered' | 'Blockquote'): Command {
  return (state, dispatch) => {
    const {$from} = state.selection
    const d = blockDepth($from)
    if (d < 3 || $from.node(d - 1).type.name !== 'blockGroup') return false
    dispatch?.(state.tr.setNodeAttribute($from.before(d - 1), 'childrenType', childrenType))
    return true
  }
}

/** Set the `childrenType` of the current block's own children group. */
export function setChildrenType(childrenType: 'Group' | 'Ordered' | 'Unordered' | 'Blockquote'): Command {
  return (state, dispatch) => {
    const {$from} = state.selection
    const d = blockDepth($from)
    if (d < 0) return false
    const block = $from.node(d)
    if (block.childCount < 2) return false
    dispatch?.(
      state.tr.setNodeAttribute($from.before(d) + 1 + block.firstChild!.nodeSize, 'childrenType', childrenType),
    )
    return true
  }
}

function stripBlockIds(fragment: Fragment): Fragment {
  const nodes: PMNode[] = []
  fragment.forEach((node) => {
    if (node.isLeaf) return void nodes.push(node)
    const attrs =
      node.type.name === 'blockNode'
        ? {...node.attrs, id: null, original: null, baseline: null, nodeKeys: null}
        : node.attrs
    nodes.push(node.type.create(attrs, stripBlockIds(node.content), node.marks))
  })
  return Fragment.from(nodes)
}

/**
 * Keeps block ids unique and present: new blocks get fresh ids, duplicates
 * (from splitting) keep the id on the first occurrence, and pasted blocks get
 * new ids unless they are being moved by drag and drop.
 */
const blockIdsPlugin = new Plugin({
  key: new PluginKey('seed-block-ids'),
  props: {
    transformPasted: (slice, view) =>
      view.dragging?.move ? slice : new Slice(stripBlockIds(slice.content), slice.openStart, slice.openEnd),
  },
  appendTransaction: (trs, _old, state) => {
    if (!trs.some((tr) => tr.docChanged)) return null
    const seen = new Set<string>()
    const tr = state.tr
    state.doc.descendants((node, pos) => {
      if (node.type.name !== 'blockNode') return true
      const id = node.attrs.id
      if (!id || seen.has(id)) {
        tr.setNodeMarkup(pos, null, {
          ...node.attrs,
          id: createBlockId(),
          original: null,
          baseline: null,
          nodeKeys: null,
        })
      } else seen.add(id)
      return true
    })
    return tr.docChanged ? tr : null
  },
})

function groupTypeRule(find: RegExp, childrenType: 'Ordered' | 'Unordered' | 'Blockquote') {
  return new InputRule({
    find,
    handler: ({state, range}) => {
      const $start = state.doc.resolve(range.from)
      const d = blockDepth($start)
      if (d < 3 || $start.parent !== $start.node(d).firstChild || $start.parent.type.name !== 'paragraph') return null
      state.tr.delete(range.from, range.to).setNodeAttribute($start.before(d - 1), 'childrenType', childrenType)
      return undefined
    },
  })
}

function youtubeParser(url: string) {
  const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)
  return match && match[7]!.length === 11 ? match[7]! : false
}

/**
 * The `link` BlockNote stores for a YouTube or Vimeo URL (`youtube.com/embed/<id>`
 * or `player.vimeo.com/video/<id>`), or `null` for other URLs. Same parsing as
 * `frontend/packages/editor/src/video.tsx`.
 */
export function normalizeVideoUrl(url: string): string | null {
  try {
    new URL(url)
  } catch {
    return null
  }
  if (url.includes('youtu.be') || url.includes('youtube')) {
    const id = youtubeParser(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (url.includes('vimeo')) {
    const parts = url.split('/')
    return `https://player.vimeo.com/video/${parts[parts.length - 1]}`
  }
  return null
}

/** Replace the content node of the block around the cursor (slash menu, paste). */
export function replaceBlockContent(make: (schema: EditorState['schema']) => PMNode): Command {
  return (state, dispatch) => {
    const {$from} = state.selection
    const d = blockDepth($from)
    if (d < 0) return false
    const start = $from.before(d) + 1
    const content = $from.node(d).firstChild!
    const node = make(state.schema)
    const inline = node.isTextblock && content.isTextblock && !node.type.spec.code ? content.content : undefined
    dispatch?.(
      state.tr.replaceWith(start, start + content.nodeSize, inline ? node.type.create(node.attrs, inline) : node),
    )
    return true
  }
}

/** Pasting a YouTube/Vimeo URL on an empty line turns that block into a Video block. */
const videoPastePlugin = new Plugin({
  key: new PluginKey('seed-video-paste'),
  props: {
    handlePaste: (view, event, slice) => {
      const text = (
        event.clipboardData?.getData('text/plain') || slice.content.textBetween(0, slice.content.size)
      ).trim()
      const link = text ? normalizeVideoUrl(text) : null
      const {$from, empty} = view.state.selection
      if (!link || !empty || $from.parent.type.name !== 'paragraph' || $from.parent.content.size) return false
      return replaceBlockContent((s) => s.nodes.hmVideo!.create({link}))(view.state, view.dispatch)
    },
  },
})

/**
 * Seed structural editing on top of Tiptap: block ids, hierarchy keys
 * (Tab/Shift-Tab/Enter/Backspace), list/quote markdown shortcuts and video
 * URL paste. Runs before Tiptap's default keymap.
 */
export const SeedStructure = Extension.create({
  name: 'seedStructure',
  priority: 1000,
  addKeyboardShortcuts() {
    const run = (command: Command) => () => command(this.editor.state, this.editor.view.dispatch, this.editor.view)
    return {
      Tab: run(sinkBlock),
      'Shift-Tab': run(liftBlock),
      Enter: run(splitSeedBlock),
      Backspace: run(backspaceSeedBlock),
      'Shift-Enter': run((state, dispatch) => {
        dispatch?.(state.tr.insertText('\n').scrollIntoView())
        return true
      }),
    }
  },
  addInputRules: () => [
    groupTypeRule(/^\s*([-+*])\s$/, 'Unordered'),
    groupTypeRule(/^(\d+)\.\s$/, 'Ordered'),
    groupTypeRule(/^\s*>\s$/, 'Blockquote'),
  ],
  addProseMirrorPlugins: () => [blockIdsPlugin, videoPastePlugin],
})

/** Schema plus editing behaviour that doesn't need React: what tests and headless editors use. */
export function seedEditorExtensions(): Extensions {
  return [
    ...seedSchemaExtensions(),
    SeedStructure,
    UndoRedo,
    Dropcursor.configure({color: '#0969da', width: 2}),
    Gapcursor,
    Placeholder.configure({placeholder: "Type '/' for blocks, '@' or '[[' to mention", showOnlyCurrent: true}),
  ]
}
