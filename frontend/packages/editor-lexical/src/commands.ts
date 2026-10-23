import {$isCodeNode} from '@lexical/code'
import {registerMarkdownShortcuts, TEXT_FORMAT_TRANSFORMERS} from '@lexical/markdown'
import {mergeRegister} from '@lexical/utils'
import {
  $createNodeSelection,
  $getRoot,
  $getSelection,
  $getState,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  $setState,
  COMMAND_PRIORITY_NORMAL,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  ParagraphNode,
  RootNode,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
  type BaseSelection,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
} from 'lexical'
import {createBlockId} from './convert'
import {
  $createSeedBlockNode,
  $createSeedGroupNode,
  $createSeedTextBlockNode,
  $isSeedBlockNode,
  $isSeedContentNode,
  $isSeedGroupNode,
  $isSeedTextBlockNode,
  childrenTypeState,
  hmBaselineState,
  hmIdState,
  hmNodeKeysState,
  hmOriginalState,
  hmTypeState,
  SeedBlockNode,
  SeedGroupNode,
  type SeedTextBlockNode,
} from './nodes'

/** The {@link SeedBlockNode} containing `node` (or `node` itself). */
export function $nearestBlock(node: LexicalNode | null | undefined): SeedBlockNode | null {
  for (let n = node ?? null; n; n = n.getParent()) if ($isSeedBlockNode(n)) return n
  return null
}

/** The block the selection's anchor (or selected node) is in. */
export function $selectedBlock(): SeedBlockNode | null {
  const sel = $getSelection()
  if ($isRangeSelection(sel)) return $nearestBlock(sel.anchor.getNode())
  if ($isNodeSelection(sel)) return $nearestBlock(sel.getNodes()[0])
  return null
}

const groupOf = (block: SeedBlockNode): SeedGroupNode | null => {
  const last = block.getLastChild()
  return $isSeedGroupNode(last) ? last : null
}

/** Move a block into its previous sibling's children (Tab). */
export function $sinkBlock(block: SeedBlockNode): boolean {
  const prev = block.getPreviousSibling()
  if (!$isSeedBlockNode(prev)) return false
  let group = groupOf(prev)
  if (!group) {
    group = $createSeedGroupNode($getState(prev, childrenTypeState) ?? 'Group')
    prev.append(group)
  }
  group.append(block)
  return true
}

/** Move a nested block out to follow its parent; later siblings become its children (Shift-Tab). */
export function $liftBlock(block: SeedBlockNode): boolean {
  const group = block.getParent()
  const parentBlock = group?.getParent()
  if (!$isSeedGroupNode(group) || !$isSeedBlockNode(parentBlock)) return false
  const after = block.getNextSiblings()
  if (after.length) {
    let own = groupOf(block)
    if (!own) {
      own = $createSeedGroupNode($getState(group, childrenTypeState))
      block.append(own)
    }
    own.append(...after)
  }
  parentBlock.insertAfter(block)
  if (group.isEmpty()) group.remove()
  return true
}

/** Set the `childrenType` of the group `block` sits in (markdown list/quote shortcuts). */
export function $setParentChildrenType(block: SeedBlockNode, childrenType: string): boolean {
  const group = block.getParent()
  if (!$isSeedGroupNode(group)) return false
  $setState(group, childrenTypeState, childrenType)
  return true
}

/**
 * Set the `childrenType` of `block`'s own children. A block without children
 * keeps it on itself, for the first child indented into it.
 */
export function $setChildrenType(block: SeedBlockNode, childrenType: string): void {
  const group = groupOf(block)
  $setState(group ?? block, childrenTypeState, childrenType)
}

/** Set the HM type of `block`'s text content (Paragraph ↔ Heading). */
export function $setTextType(block: SeedBlockNode, hmType: string): boolean {
  const text = block.getFirstChild()
  if (!$isSeedTextBlockNode(text)) return false
  $setState(text, hmTypeState, hmType)
  return true
}

/**
 * Put new content into the selected block when its text is empty, or into a
 * new block after it (slash menu, toolbar inserts). Returns the block used.
 */
export function $insertBlockContent(content: LexicalNode): SeedBlockNode | null {
  const block = $selectedBlock()
  if (!block) return null
  const first = block.getFirstChild()
  if ($isSeedTextBlockNode(first) && first.getTextContentSize() === 0) {
    first.replace(content)
    return block
  }
  const next = $createSeedBlockNode().append(content)
  block.insertAfter(next)
  return next
}

/** Select a decorator content node (atoms, math). */
export function $selectNode(node: LexicalNode) {
  const sel = $createNodeSelection()
  sel.add(node.getKey())
  $setSelection(sel)
}

function $isAtStart(sel: RangeSelection, text: ElementNode) {
  const {anchor} = sel
  if (!sel.isCollapsed() || anchor.offset !== 0) return false
  const node = anchor.getNode()
  return node.is(text) || !!text.getFirstDescendant()?.is(node)
}

/** Wrap a stray node (pasted paragraph, inline text…) into a fresh block. */
function $asBlock(node: LexicalNode): SeedBlockNode {
  if ($isSeedBlockNode(node)) return node
  const block = $createSeedBlockNode()
  node.insertBefore(block)
  if ($isSeedContentNode(node)) block.append(node)
  else if ($isParagraphNode(node) || ($isElementNode(node) && !node.isInline())) {
    const text = $createSeedTextBlockNode()
    text.append(...(node as ElementNode).getChildren())
    node.remove()
    block.append(text)
  } else block.append($createSeedTextBlockNode().append(node))
  return block
}

/** Root and groups hold only blocks. */
function $normalizeContainer(container: ElementNode) {
  for (const child of container.getChildren()) {
    if ($isSeedGroupNode(child)) {
      for (const inner of child.getChildren()) child.insertBefore(inner)
      child.remove()
    } else if (!$isSeedBlockNode(child)) $asBlock(child)
  }
}

/** A block is `[content, group?]`; anything else moves to new blocks after it. */
function $normalizeBlock(block: SeedBlockNode) {
  const children = block.getChildren()
  if (!children.length) {
    block.remove()
    return
  }
  let content: LexicalNode | null = null
  let group: SeedGroupNode | null = null
  const extras: LexicalNode[] = []
  children.forEach((child, i) => {
    if (i === 0 && $isParagraphNode(child)) {
      const text = $createSeedTextBlockNode()
      text.append(...child.getChildren())
      child.replace(text)
      content = text
    } else if (i === 0 && $isSeedContentNode(child)) content = child
    else if ($isSeedGroupNode(child)) {
      if (!group) group = child
      else {
        group.append(...child.getChildren())
        child.remove()
      }
    } else extras.push(child)
  })
  if (!content) block.splice(0, 0, [$createSeedTextBlockNode()])
  let anchor: LexicalNode = block
  for (const extra of extras) {
    const moved = $asBlock(extra)
    anchor.insertAfter(moved)
    anchor = moved
  }
  if (group && !block.getLastChild()!.is(group)) block.append(group)
}

/** Fresh ids for new blocks and for copies whose id another (older) block already has. */
function $ensureId(block: SeedBlockNode) {
  const id = $getState(block, hmIdState)
  let duplicate = false
  if (id) {
    const key = Number(block.getKey())
    const visit = (node: LexicalNode) => {
      if (duplicate) return
      if ($isSeedBlockNode(node) && node !== block && $getState(node, hmIdState) === id && Number(node.getKey()) < key)
        duplicate = true
      if ($isElementNode(node)) node.getChildren().forEach(visit)
    }
    visit($getRoot())
  }
  if (id && !duplicate) return
  $setState(block, hmIdState, createBlockId())
  $setState(block, hmOriginalState, null)
  $setState(block, hmBaselineState, null)
  $setState(block, hmNodeKeysState, null)
}

/** Previous block in reading order, ignoring nesting (where Backspace joins to). */
function $previousBlockInOrder(block: SeedBlockNode): SeedBlockNode | null {
  const sibling = block.getPreviousSibling()
  if (!$isSeedBlockNode(sibling)) return null
  let prev: SeedBlockNode = sibling
  for (let g = groupOf(prev); g; g = groupOf(prev)) {
    const last = g.getLastChild()
    if (!$isSeedBlockNode(last)) break
    prev = last
  }
  return prev
}

function $handleEnter(event: KeyboardEvent | null): boolean {
  const sel = $getSelection()
  if ($isNodeSelection(sel)) {
    const block = $nearestBlock(sel.getNodes()[0])
    if (!block) return false
    event?.preventDefault()
    const text = $createSeedTextBlockNode()
    block.insertAfter($createSeedBlockNode().append(text))
    text.select()
    return true
  }
  if (!$isRangeSelection(sel) || event?.shiftKey) return false
  const text = [sel.anchor.getNode(), ...sel.anchor.getNode().getParents()].find($isSeedTextBlockNode)
  if (!text) return false
  const block = text.getParent()
  if (!$isSeedBlockNode(block)) return false
  event?.preventDefault()
  if (sel.isCollapsed() && text.getTextContentSize() === 0) {
    if ($getState(text, hmTypeState) !== 'Paragraph') return $setTextType(block, 'Paragraph')
    if ($liftBlock(block)) return true
  }
  if ($isAtStart(sel, text) && text.getTextContentSize() > 0) {
    block.insertBefore($createSeedBlockNode().append($createSeedTextBlockNode()))
    return true
  }
  sel.insertParagraph()
  return true
}

function $handleBackspace(event: KeyboardEvent | null): boolean {
  const sel = $getSelection()
  if (!$isRangeSelection(sel)) return false
  const text = [sel.anchor.getNode(), ...sel.anchor.getNode().getParents()].find($isSeedTextBlockNode)
  if (!text || !$isAtStart(sel, text)) return false
  const block = text.getParent()
  if (!$isSeedBlockNode(block)) return false
  if ($getState(text, hmTypeState) === 'Heading') {
    event?.preventDefault()
    return $setTextType(block, 'Paragraph')
  }
  if ($isSeedGroupNode(block.getParent()) && !block.getPreviousSibling()) {
    event?.preventDefault()
    return $liftBlock(block)
  }
  const prev = $previousBlockInOrder(block)
  if (!prev) return false
  const prevContent = prev.getFirstChild()
  event?.preventDefault()
  if ($isDecoratorNode(prevContent)) {
    if (text.getTextContentSize() === 0 && !groupOf(block)) block.remove()
    $selectNode(prevContent)
    return true
  }
  if (!$isElementNode(prevContent)) return false
  const offset = prevContent.getChildrenSize()
  prevContent.append(...text.getChildren())
  const lastBefore = prevContent.getChildAtIndex(offset - 1)
  if ($isTextNode(lastBefore)) lastBefore.select(lastBefore.getTextContentSize(), lastBefore.getTextContentSize())
  else prevContent.select(offset, offset)
  const ownGroup = groupOf(block)
  if (ownGroup) {
    const target = groupOf(prev)
    if (target) target.append(...ownGroup.getChildren())
    else prev.append(ownGroup)
  }
  block.remove()
  return true
}

const BLOCK_SHORTCUTS: Array<[RegExp, (block: SeedBlockNode, m: RegExpMatchArray) => boolean]> = [
  [/^#{1,6} $/, (b) => $setTextType(b, 'Heading')],
  [/^[-*+] $/, (b) => $setParentChildrenType(b, 'Unordered')],
  [/^\d+\. $/, (b) => $setParentChildrenType(b, 'Ordered')],
  [/^> $/, (b) => $setParentChildrenType(b, 'Blockquote')],
]

/**
 * Lexical's own markdown element transformers only fire for blocks that are
 * direct children of the root, and Seed blocks are nested, so the block-level
 * shortcuts (`# `, `- `, `1. `, `> `) are handled here.
 */
function registerBlockShortcuts(editor: LexicalEditor) {
  return editor.registerUpdateListener(({tags, dirtyLeaves, editorState, prevEditorState}) => {
    if (tags.has('historic') || tags.has('collaboration')) return
    let match: {key: string; text: string} | null = null
    editorState.read(() => {
      const sel = $getSelection()
      if (!$isRangeSelection(sel) || !sel.isCollapsed()) return
      const node = sel.anchor.getNode()
      if (!$isTextNode(node) || !dirtyLeaves.has(node.getKey())) return
      const parent = node.getParent()
      if (!$isSeedTextBlockNode(parent) || !parent.getFirstChild()?.is(node)) return
      const text = node.getTextContent().slice(0, sel.anchor.offset)
      if (!/ $/.test(text)) return
      const prevText = prevEditorState.read(() => {
        const prevNode = prevEditorState._nodeMap.get(node.getKey())
        return $isTextNode(prevNode) ? prevNode.getTextContent() : ''
      })
      if (prevText.length !== node.getTextContentSize() - 1) return
      match = {key: node.getKey(), text}
    })
    const found = match as {key: string; text: string} | null
    if (!found) return
    const shortcut = BLOCK_SHORTCUTS.find(([re]) => re.test(found.text))
    if (!shortcut) return
    editor.update(() => {
      const sel = $getSelection()
      if (!$isRangeSelection(sel)) return
      const node = sel.anchor.getNode()
      const block = $nearestBlock(node)
      if (!$isTextNode(node) || !block || !shortcut[1](block, found.text.match(shortcut[0])!)) return
      const [, rest] = node.splitText(found.text.length)
      node.remove()
      if (rest) rest.select(0, 0)
      else (block.getFirstChild() as SeedTextBlockNode).select(0, 0)
    })
  })
}

/**
 * Turn pasted nodes into whole Seed blocks inserted after the current one,
 * so multi-block copies and pasted HTML headings/paragraphs stay separate
 * blocks. Inline-only pastes fall through to Lexical's default.
 */
function $insertClipboardBlocks(nodes: LexicalNode[], selection: BaseSelection): boolean {
  const isBlockLevel = (n: LexicalNode) =>
    $isSeedBlockNode(n) || $isSeedGroupNode(n) || (($isElementNode(n) || $isDecoratorNode(n)) && !n.isInline())
  if (!$isRangeSelection(selection) || !nodes.some(isBlockLevel)) return false
  const current = $nearestBlock(selection.anchor.getNode())
  if (!current) return false
  if (!selection.isCollapsed()) selection.removeText()
  const blocks: SeedBlockNode[] = []
  let inline: SeedTextBlockNode | null = null
  for (const n of nodes) {
    if ($isSeedBlockNode(n)) blocks.push(n)
    else if ($isSeedGroupNode(n)) blocks.push(...n.getChildren().filter($isSeedBlockNode))
    else if ($isSeedContentNode(n)) blocks.push($createSeedBlockNode().append(n))
    else if ($isElementNode(n) && !n.isInline()) {
      const text = $createSeedTextBlockNode()
      text.append(...n.getChildren())
      blocks.push($createSeedBlockNode().append(text))
    } else {
      if (!inline) {
        inline = $createSeedTextBlockNode()
        blocks.push($createSeedBlockNode().append(inline))
      }
      inline.append(n)
      continue
    }
    inline = null
  }
  const content = current.getFirstChild()
  const replaceCurrent = $isSeedTextBlockNode(content) && content.getTextContentSize() === 0 && !groupOf(current)
  let last = current
  for (const block of blocks) {
    last.insertAfter(block)
    last = block
  }
  if (replaceCurrent) current.remove()
  last.selectEnd()
  return true
}

/**
 * All Seed editing behaviour on top of an unmodified Lexical editor: document
 * normalization, block ids, Enter/Tab/Shift-Tab/Backspace on nested blocks,
 * and markdown shortcuts.
 */
export function registerSeedEditing(editor: LexicalEditor, {markdown = true} = {}): () => void {
  return mergeRegister(
    editor.registerNodeTransform(RootNode, (root) => {
      $normalizeContainer(root)
      if (root.isEmpty()) root.append($createSeedBlockNode().append($createSeedTextBlockNode()))
    }),
    editor.registerNodeTransform(SeedGroupNode, (group) => {
      $normalizeContainer(group)
      if (group.isEmpty()) group.remove()
    }),
    editor.registerNodeTransform(SeedBlockNode, (block) => {
      $normalizeBlock(block)
      if (block.isAttached()) $ensureId(block)
    }),
    editor.registerNodeTransform(ParagraphNode, (p) => {
      if (!$isSeedBlockNode(p.getParent())) return
      const text = $createSeedTextBlockNode()
      text.append(...p.getChildren())
      p.replace(text)
    }),
    editor.registerCommand(KEY_ENTER_COMMAND, $handleEnter, COMMAND_PRIORITY_NORMAL),
    editor.registerCommand(
      SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
      ({nodes, selection}) => $insertClipboardBlocks(nodes, selection),
      COMMAND_PRIORITY_NORMAL,
    ),
    editor.registerCommand(KEY_BACKSPACE_COMMAND, $handleBackspace, COMMAND_PRIORITY_NORMAL),
    editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        const sel = $getSelection()
        if ($isRangeSelection(sel) && [sel.anchor.getNode(), ...sel.anchor.getNode().getParents()].some($isCodeNode))
          return false
        const block = $selectedBlock()
        if (!block) return false
        event.preventDefault()
        if (event.shiftKey) $liftBlock(block)
        else $sinkBlock(block)
        return true
      },
      COMMAND_PRIORITY_NORMAL,
    ),
    markdown ? registerBlockShortcuts(editor) : () => {},
    markdown ? registerMarkdownShortcuts(editor, TEXT_FORMAT_TRANSFORMERS) : () => {},
  )
}
