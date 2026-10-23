import {type ChangeSpec, EditorSelection, type EditorState, type TransactionSpec} from '@codemirror/state'
import type {Command} from '@codemirror/view'
import type {ListMarker} from './format'
import {assignBlock, createBlockId, type SeedBlock, seedBlocks} from './state'

const MARKERS: Record<ListMarker, string> = {Unordered: '- ', Ordered: '1. ', Blockquote: '> '}

/** Index of the block containing `pos`. */
export function blockIndexAt(state: EditorState, pos: number): number {
  const {blocks} = state.field(seedBlocks)
  let lo = 0
  let hi = blocks.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (blocks[mid]!.from <= pos) lo = mid
    else hi = mid - 1
  }
  return lo
}

/** Index just past the block's subtree (its following, deeper blocks). */
function subtreeEnd(blocks: SeedBlock[], index: number) {
  let end = index + 1
  while (end < blocks.length && blocks[end]!.depth > blocks[index]!.depth) end++
  return end
}

/** Marker text for a child at position `n` (1-based) of a list. */
function markerText(marker: ListMarker | null, n = 1) {
  return marker === 'Ordered' ? `${n}. ` : marker ? MARKERS[marker] : ''
}

/** Shift every line of blocks `[from, to)` by `delta` levels. */
function shiftLines(state: EditorState, blocks: SeedBlock[], from: number, to: number, delta: number): ChangeSpec[] {
  const changes: ChangeSpec[] = []
  const start = state.doc.lineAt(blocks[from]!.from).number
  const end = state.doc.lineAt(blocks[to - 1]!.to).number
  for (let n = start; n <= end; n++) {
    const line = state.doc.line(n)
    if (n === start) continue
    if (delta > 0 && line.length) changes.push({from: line.from, insert: '  '})
    if (delta < 0 && line.text.startsWith('  ')) changes.push({from: line.from, to: line.from + 2})
  }
  return changes
}

/** Replace the indentation + marker of a block's first line. */
function setPrefix(block: SeedBlock, depth: number, marker: ListMarker | null, n = 1): ChangeSpec {
  return {from: block.from, to: block.contentFrom, insert: '  '.repeat(depth) + (depth ? markerText(marker, n) : '')}
}

/** Tab: nest the block (with its children) under its previous sibling. */
export const indentBlock: Command = ({state, dispatch}) => {
  const {blocks} = state.field(seedBlocks)
  const index = blockIndexAt(state, state.selection.main.head)
  const block = blocks[index]!
  let prev = index - 1
  while (prev >= 0 && blocks[prev]!.depth > block.depth) prev--
  if (prev < 0 || blocks[prev]!.depth !== block.depth) return false
  // Join the new parent's existing children, using their marker.
  const lastChild = index - 1 > prev ? blocks.slice(prev + 1, index).find((b) => b.depth === block.depth + 1) : null
  const siblings = blocks.slice(prev + 1, index).filter((b) => b.depth === block.depth + 1).length
  const marker = lastChild ? lastChild.marker : null
  dispatch(
    state.update({
      changes: [
        setPrefix(block, block.depth + 1, marker, siblings + 1),
        ...shiftLines(state, blocks, index, subtreeEnd(blocks, index), 1),
      ],
      scrollIntoView: true,
      userEvent: 'input.indent',
    }),
  )
  return true
}

/** Shift-Tab: move the block out to its parent's level; later siblings become its children. */
export const outdentBlock: Command = ({state, dispatch}) => {
  const {blocks} = state.field(seedBlocks)
  const index = blockIndexAt(state, state.selection.main.head)
  const block = blocks[index]!
  if (block.depth === 0) return false
  let parent = index - 1
  while (blocks[parent]!.depth >= block.depth) parent--
  dispatch(
    state.update({
      changes: [
        setPrefix(block, block.depth - 1, blocks[parent]!.marker),
        ...shiftLines(state, blocks, index, subtreeEnd(blocks, index), -1),
      ],
      scrollIntoView: true,
      userEvent: 'delete.dedent',
    }),
  )
  return true
}

/** Whether `pos` is inside the body of a fenced code or math block. */
function inFence(block: SeedBlock, pos: number) {
  const first = block.segments[0]!.text
  return (/^`{3,}/.test(first) || first === '$$') && pos > block.contentFrom
}

/**
 * Enter: split the block at the cursor into a new sibling with a fresh id.
 * Inside fenced code/math it inserts a line; on an empty nested block it
 * outdents, like a list.
 */
export const splitBlock: Command = (view) => {
  const {state, dispatch} = view
  const range = state.selection.main
  const {blocks} = state.field(seedBlocks)
  const block = blocks[blockIndexAt(state, range.from)]!
  const column = block.contentFrom - block.from
  if (inFence(block, range.from)) {
    dispatch(state.update(state.replaceSelection('\n' + ' '.repeat(column)), {userEvent: 'input'}))
    return true
  }
  if (block.depth > 0 && block.to === block.contentFrom) return outdentBlock(view)
  const prefix = '  '.repeat(block.depth) + markerText(block.marker, 2)
  if (range.empty && range.from === block.contentFrom && block.to > block.contentFrom) {
    // At the start of a non-empty block: open an empty block above, the text keeps its id.
    const insert = state.doc.sliceString(block.from, block.contentFrom) + '\n'
    dispatch(
      state.update({
        changes: {from: block.from, insert},
        selection: {anchor: block.contentFrom},
        effects: [
          assignBlock.of({pos: block.from, meta: {id: createBlockId()}}),
          assignBlock.of({pos: block.from + insert.length, meta: block.meta}),
        ],
        scrollIntoView: true,
        userEvent: 'input',
      }),
    )
    return true
  }
  dispatch(
    state.update(state.replaceSelection('\n' + prefix), {
      scrollIntoView: true,
      userEvent: 'input',
    }),
  )
  return true
}

/** Shift-Enter: a line break inside the block (stored as `\n` in its text). */
export const insertLineBreak: Command = ({state, dispatch}) => {
  const block = state.field(seedBlocks).blocks[blockIndexAt(state, state.selection.main.head)]!
  dispatch(
    state.update(state.replaceSelection('\\\n' + ' '.repeat(block.contentFrom - block.from)), {userEvent: 'input'}),
  )
  return true
}

/** Backspace at the start of a nested block outdents it instead of joining lines. */
export const backspaceBlock: Command = (view) => {
  const range = view.state.selection.main
  if (!range.empty) return false
  const block = view.state.field(seedBlocks).blocks[blockIndexAt(view.state, range.head)]!
  if (range.head !== block.contentFrom || block.from === block.contentFrom) return false
  return outdentBlock(view)
}

/** Set the `childrenType` of the cursor block's siblings by rewriting their markers. */
export function setChildrenType(childrenType: ListMarker | 'Group'): Command {
  return ({state, dispatch}) => {
    const {blocks} = state.field(seedBlocks)
    const index = blockIndexAt(state, state.selection.main.head)
    const {depth} = blocks[index]!
    if (depth === 0) return false
    let first = index
    while (first > 0 && blocks[first - 1]!.depth >= depth) first--
    const changes: ChangeSpec[] = []
    let n = 0
    for (let i = first; i < blocks.length && blocks[i]!.depth >= depth; i++) {
      if (blocks[i]!.depth !== depth) continue
      changes.push(setPrefix(blocks[i]!, depth, childrenType === 'Group' ? null : childrenType, ++n))
    }
    dispatch(state.update({changes, userEvent: 'input'}))
    return true
  }
}

/**
 * Markdown shortcuts: `- `, `1. ` or `> ` typed at the start of a top-level
 * block nest it as a list item / quote under the previous block.
 */
export function listShortcut(state: EditorState, from: number, text: string): TransactionSpec | null {
  if (text !== ' ') return null
  const block = state.field(seedBlocks).blocks[blockIndexAt(state, from)]!
  const typed = state.doc.sliceString(block.contentFrom, from)
  const marker: ListMarker | null =
    typed === '-' ? 'Unordered' : typed === '>' ? 'Blockquote' : /^\d+\.$/.test(typed) ? 'Ordered' : null
  if (!marker || block.depth > 0 || block.from === 0) return null
  return {
    changes: {from: block.from, to: from, insert: '  ' + markerText(marker)},
    selection: EditorSelection.cursor(block.from + 2 + markerText(marker).length),
    userEvent: 'input',
  }
}
