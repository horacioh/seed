import {chainCommands, joinBackward, joinTextblockBackward, selectNodeBackward, toggleMark} from 'prosemirror-commands'
import {redo, undo} from 'prosemirror-history'
import {InputRule} from 'prosemirror-inputrules'
import {Fragment, type Node as PMNode, type ResolvedPos, Slice} from 'prosemirror-model'
import {
  type Command,
  type EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  type Selection,
  TextSelection,
  type Transaction,
} from 'prosemirror-state'
import {createBlockId} from './convert'
import {seedSchema} from './schema'

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

/** Copy a fragment with every `blockNode` id and preservation attr cleared. */
export function stripBlockIds(fragment: Fragment): Fragment {
  const nodes: PMNode[] = []
  fragment.forEach((node) => {
    if (node.isLeaf) nodes.push(node)
    else if (node.type.name === 'blockNode')
      nodes.push(
        node.type.create(
          {...node.attrs, id: null, original: null, baseline: null, nodeKeys: null},
          stripBlockIds(node.content),
          node.marks,
        ),
      )
    else nodes.push(node.copy(stripBlockIds(node.content)))
  })
  return Fragment.from(nodes)
}

export const blockIdsPlugin = new Plugin({
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

/**
 * Replace the content node of the block around the cursor, keeping its
 * inline content when both are textblocks (slash menu, markdown shortcuts).
 */
export function replaceBlockContent(make: (schema: EditorState['schema']) => PMNode): Command {
  return (state, dispatch) => {
    const {$from} = state.selection
    const d = blockDepth($from)
    if (d < 0) return false
    const start = $from.before(d) + 1
    const content = $from.node(d).firstChild!
    const node = make(state.schema)
    const inline = node.isTextblock && content.isTextblock && !node.type.spec.code ? content.content : undefined
    if (dispatch) {
      const tr = state.tr.replaceWith(
        start,
        start + content.nodeSize,
        inline ? node.type.create(node.attrs, inline) : node,
      )
      const sel = node.isTextblock
        ? TextSelection.create(tr.doc, start + 1 + (inline ? Math.min($from.parentOffset, inline.size) : 0))
        : NodeSelection.create(tr.doc, start)
      dispatch(tr.setSelection(sel).scrollIntoView())
    }
    return true
  }
}

/** Insert a copy of the current block right after it. The id plugin gives the copy fresh ids. */
export const duplicateBlock: Command = (state, dispatch) => {
  const d = blockDepth(state.selection.$from)
  if (d < 0) return false
  const pos = state.selection.$from.after(d)
  dispatch?.(state.tr.insert(pos, state.selection.$from.node(d)))
  return true
}

function groupTypeRule(regex: RegExp, childrenType: 'Ordered' | 'Unordered' | 'Blockquote') {
  return new InputRule(regex, (state, _match, start, end) => {
    const $start = state.doc.resolve(start)
    const d = blockDepth($start)
    if (d < 3 || $start.parent !== $start.node(d).firstChild || $start.parent.type.name !== 'paragraph') return null
    return state.tr.delete(start, end).setNodeAttribute($start.before(d - 1), 'childrenType', childrenType)
  })
}

function blockTypeRule(regex: RegExp, nodeName: string) {
  return new InputRule(regex, (state, _match, start, end) => {
    const $start = state.doc.resolve(start)
    if ($start.parent.type.name !== 'paragraph' || $start.parentOffset !== 0) return null
    const d = blockDepth($start)
    const tr = state.tr.delete(start, end)
    const pos = $start.before(d) + 1
    const content = tr.doc.nodeAt(pos)!
    const type = state.schema.nodes[nodeName]!
    const inline = type.spec.code
      ? Fragment.from(content.textContent ? state.schema.text(content.textContent) : [])
      : content.content
    tr.replaceWith(pos, pos + content.nodeSize, type.create(null, inline))
    return tr.setSelection(TextSelection.create(tr.doc, pos + 1))
  })
}

/** Markdown shortcuts: list/quote children, headings, code and math blocks. */
export const seedInputRules: InputRule[] = [
  groupTypeRule(/^\s*([-+*])\s$/, 'Unordered'),
  groupTypeRule(/^(\d+)\.\s$/, 'Ordered'),
  groupTypeRule(/^\s*>\s$/, 'Blockquote'),
  blockTypeRule(/^#{1,6}\s$/, 'heading'),
  blockTypeRule(/^```$/, 'codeBlock'),
  blockTypeRule(/^\$\$$/, 'hmMath'),
]

const insertNewline: Command = (state, dispatch) => {
  dispatch?.(state.tr.insertText('\n').scrollIntoView())
  return true
}

/** Seed key bindings: hierarchy, block split/join, history and mark toggles. */
export const seedKeys: Record<string, Command> = {
  Tab: sinkBlock,
  'Shift-Tab': liftBlock,
  Enter: splitSeedBlock,
  Backspace: backspaceSeedBlock,
  'Shift-Enter': insertNewline,
  'Mod-z': undo,
  'Shift-Mod-z': redo,
  'Mod-y': redo,
  'Mod-b': toggleMark(seedSchema.marks.bold!),
  'Mod-i': toggleMark(seedSchema.marks.italic!),
  'Mod-u': toggleMark(seedSchema.marks.underline!),
  'Mod-Shift-s': toggleMark(seedSchema.marks.strike!),
  'Mod-e': toggleMark(seedSchema.marks.code!),
}
