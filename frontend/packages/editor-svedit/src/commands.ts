import {
  AddNewLineCommand,
  BreakTextNodeCommand,
  Command,
  define_keymap,
  InsertDefaultNodeCommand,
  RedoCommand,
  SelectAllCommand,
  SelectParentCommand,
  UndoCommand,
  type DocumentPath,
  type TextSelection,
  type Transaction,
} from 'svedit'
import {
  formatsOf,
  marksFromFormats,
  newBlockNode,
  type InlineFormat,
  type SveditRange,
  type SveditText,
} from './convert'
import type {InlineStyle} from './schema'
import type {SuggestionMenu} from './svelte/menu-state.svelte'

const segmenter = new Intl.Segmenter()
const graphemes = (s: string) => Array.from(segmenter.segment(s), (x) => x.segment)

function textSelection(tr: Transaction): TextSelection | null {
  const sel = tr.selection
  return sel?.type === 'text' ? sel : null
}

function nodeArray(nodes: string[], from?: {marks?: unknown[]; annotations?: unknown[]}) {
  return {nodes, marks: [...(from?.marks ?? [])], annotations: [...(from?.annotations ?? [])]}
}

/** The `[start, end)` grapheme range of a text selection. */
export function selectionRange(sel: TextSelection): [number, number] {
  return [Math.min(sel.anchor_offset, sel.focus_offset), Math.max(sel.anchor_offset, sel.focus_offset)]
}

/**
 * Replace graphemes `[from, to)` of the text property at `path` and rewrite its
 * marks from per-grapheme formats. Data-only annotations shift with the text.
 * This is the one primitive behind formatting, links, mentions and shortcuts.
 */
export function spliceText(
  tr: Transaction,
  path: DocumentPath,
  from: number,
  to: number,
  inserted: {text: string; formats?: InlineFormat[]} = {text: ''},
  mapFormats?: (formats: InlineFormat[]) => InlineFormat[],
): void {
  const text: SveditText = tr.get(path)
  const chars = graphemes(text.content)
  const formats = formatsOf(tr.doc.nodes, text)
  const insertedChars = graphemes(inserted.text)
  const insertedFormats =
    inserted.formats ?? insertedChars.map(() => ({styles: [], link: '', embed: '', embed_json: ''}))
  let nextFormats = [...formats.slice(0, from), ...insertedFormats, ...formats.slice(to)]
  if (mapFormats) nextFormats = mapFormats(nextFormats)
  const delta = insertedChars.length - (to - from)
  const shift = (o: number) => (o <= from ? o : o >= to ? o + delta : from + Math.min(o - from, insertedChars.length))
  const annotations: SveditRange[] = text.annotations.map((a) => ({
    node_id: a.node_id,
    start_offset: shift(a.start_offset),
    end_offset: shift(a.end_offset),
  }))
  for (const mark of text.marks) tr.delete(mark.node_id)
  const marks = marksFromFormats(nextFormats, (node) => {
    const id = tr.generate_id()
    tr.create({id, ...node} as any)
    return id
  })
  tr.set(path, {content: [...chars.slice(0, from), ...insertedChars, ...chars.slice(to)].join(''), marks, annotations})
}

/** Toggle an HM formatting style over the selected text. */
export function toggleStyle(tr: Transaction, style: InlineStyle): boolean {
  const sel = textSelection(tr)
  if (!sel || sel.anchor_offset === sel.focus_offset) return false
  const [from, to] = selectionRange(sel)
  const all = formatsOf(tr.doc.nodes, tr.get(sel.path))
    .slice(from, to)
    .every((f) => f.styles.includes(style))
  spliceText(tr, sel.path, 0, 0, undefined, (formats) =>
    formats.map((f, i) =>
      i < from || i >= to
        ? f
        : {...f, styles: all ? f.styles.filter((s) => s !== style) : [...new Set([...f.styles, style])]},
    ),
  )
  tr.set_selection(sel)
  return true
}

/** Set (or with `''` remove) a link over the selected text. */
export function setLink(tr: Transaction, href: string): boolean {
  const sel = textSelection(tr)
  if (!sel || sel.anchor_offset === sel.focus_offset) return false
  const [from, to] = selectionRange(sel)
  spliceText(tr, sel.path, 0, 0, undefined, (formats) =>
    formats.map((f, i) => (i < from || i >= to || f.embed ? f : {...f, link: href})),
  )
  tr.set_selection(sel)
  return true
}

/**
 * Replace the trigger text `[from, caret)` (e.g. `@hora`) with an inline
 * `Embed` (one U+FFFC placeholder carrying the link) followed by a space.
 */
export function insertMention(tr: Transaction, from: number, link: string): boolean {
  const sel = textSelection(tr)
  if (!sel) return false
  const to = selectionRange(sel)[1]
  const plain: InlineFormat = {styles: [], link: '', embed: '', embed_json: ''}
  spliceText(tr, sel.path, from, to, {
    text: '\uFFFC ',
    formats: [{...plain, embed: link, embed_json: JSON.stringify({type: 'Embed', link})}, plain],
  })
  tr.set_selection({...sel, anchor_offset: from + 2, focus_offset: from + 2})
  return true
}

/** Path of the array holding the selected block, its index and the block path. */
function blockLocation(sel: TextSelection) {
  const blockPath = sel.path.slice(0, -1)
  const arrayPath = blockPath.slice(0, -1)
  return {blockPath, arrayPath, index: blockPath.at(-1) as number, prop: String(arrayPath.at(-1))}
}

/** Tab: nest the block under its previous sibling (as its last child). */
export function indentBlock(tr: Transaction): boolean {
  const sel = textSelection(tr)
  if (!sel) return false
  const {arrayPath, index, prop} = blockLocation(sel)
  if (typeof index !== 'number' || index < 1) return false
  const owner = tr.get(arrayPath.slice(0, -1))
  const array = tr.get(arrayPath)
  const id: string = array.nodes[index]
  const prevId: string = array.nodes[index - 1]
  const prev = tr.get(prevId)
  const prevChildren: string[] = [...prev.children.nodes]
  tr.set([prevId, 'children'], nodeArray([...prevChildren, id], prev.children))
  if (!prevChildren.length && !prev.children_type) tr.set([prevId, 'children_type'], 'Group')
  tr.set(
    [owner.id, prop],
    nodeArray(
      array.nodes.filter((_: string, i: number) => i !== index),
      array,
    ),
  )
  tr.set_selection({...sel, path: [...arrayPath, index - 1, 'children', prevChildren.length, 'content']})
  return true
}

/** Shift-Tab: move the block after its parent; following siblings become its children. */
export function outdentBlock(tr: Transaction): boolean {
  const sel = textSelection(tr)
  if (!sel) return false
  const {arrayPath, index, prop} = blockLocation(sel)
  if (prop !== 'children') return false
  const parentPath = arrayPath.slice(0, -1)
  const parentIndex = parentPath.at(-1)
  if (typeof parentIndex !== 'number') return false
  const grandPath = parentPath.slice(0, -1)
  const parent = tr.get(parentPath)
  const siblings: string[] = [...parent.children.nodes]
  const id = siblings[index]!
  const node = tr.get(id)
  const after = siblings.slice(index + 1)
  if (after.length) {
    tr.set([id, 'children'], nodeArray([...node.children.nodes, ...after], node.children))
    if (!node.children_type) tr.set([id, 'children_type'], 'Group')
  }
  const grandOwner = tr.get(grandPath.slice(0, -1))
  const grand = tr.get(grandPath)
  const grandNodes: string[] = [...grand.nodes]
  grandNodes.splice(parentIndex + 1, 0, id)
  tr.set([grandOwner.id, String(grandPath.at(-1))], nodeArray(grandNodes, grand))
  tr.set([parent.id, 'children'], nodeArray(siblings.slice(0, index), parent.children))
  if (index === 0 && parent.children_type === 'Group') tr.set([parent.id, 'children_type'], '')
  tr.set_selection({...sel, path: [...grandPath, parentIndex + 1, 'content']})
  return true
}

/** Change the HM type of the selected block (keeps id, text and children). */
export function setBlockType(tr: Transaction, blockType: string): boolean {
  const sel = textSelection(tr)
  if (!sel) return false
  const block = tr.get(sel.path.slice(0, -1))
  tr.set([block.id, 'block_type'], blockType)
  return true
}

/**
 * List shortcuts (`- `, `1. `, `> `): set the `childrenType` of the selected
 * block's parent. A top-level block has no parent block, so it is first
 * nested under its previous sibling.
 */
export function setParentChildrenType(tr: Transaction, childrenType: string): boolean {
  const sel = textSelection(tr)
  if (!sel) return false
  let {arrayPath} = blockLocation(sel)
  if (blockLocation(sel).prop !== 'children') {
    if (!indentBlock(tr)) return false
    arrayPath = blockLocation(tr.selection as TextSelection).arrayPath
  }
  const parent = tr.get(arrayPath.slice(0, -1))
  tr.set([parent.id, 'children_type'], childrenType)
  return true
}

/** Markdown-style shortcuts applied when a space is typed after a prefix at block start. */
export const MARKDOWN_SHORTCUTS: Record<string, (tr: Transaction) => boolean> = {
  '#': (tr) => setBlockType(tr, 'Heading'),
  '-': (tr) => setParentChildrenType(tr, 'Unordered'),
  '*': (tr) => setParentChildrenType(tr, 'Unordered'),
  '1.': (tr) => setParentChildrenType(tr, 'Ordered'),
  '>': (tr) => setParentChildrenType(tr, 'Blockquote'),
  '```': (tr) => setBlockType(tr, 'Code'),
}

/**
 * Run a markdown shortcut if the text before the caret is exactly one of
 * {@link MARKDOWN_SHORTCUTS}: removes the prefix and applies it.
 */
export function applyMarkdownShortcut(tr: Transaction): boolean {
  const sel = textSelection(tr)
  if (!sel || sel.anchor_offset !== sel.focus_offset) return false
  const before = graphemes(tr.get(sel.path).content).slice(0, sel.focus_offset).join('')
  const shortcut = MARKDOWN_SHORTCUTS[before]
  if (!shortcut) return false
  spliceText(tr, sel.path, 0, sel.focus_offset)
  tr.set_selection({...sel, anchor_offset: 0, focus_offset: 0})
  return shortcut(tr)
}

/** Svedit inserter for `hm_block`: a new Paragraph after the node cursor. */
export function insertBlock(tr: Transaction, content?: SveditText): void {
  const id = tr.generate_id()
  tr.create(newBlockNode(id, 'Paragraph', content) as any)
  tr.insert_nodes([id])
  const sel = tr.selection!
  tr.set_selection({
    type: 'text',
    path: [...sel.path, (sel as TextSelection).focus_offset - 1, 'content'],
    anchor_offset: 0,
    focus_offset: 0,
  })
}

/** A command running one transaction function on the current selection. */
class TransactionCommand extends Command {
  constructor(
    context: any,
    private run: (tr: Transaction) => boolean,
    private enabled: () => boolean = () => true,
  ) {
    super(context)
  }
  is_enabled() {
    return Boolean(this.context.editable && this.context.session.selection?.type === 'text' && this.enabled())
  }
  execute() {
    const tr = this.context.session.tr
    if (this.run(tr)) this.context.session.apply(tr)
  }
}

/** A command forwarding a key to the open suggestion menu. */
class MenuCommand extends Command {
  constructor(
    context: any,
    private menu: SuggestionMenu,
    private action: 'up' | 'down' | 'choose' | 'close',
  ) {
    super(context)
  }
  is_enabled() {
    return this.menu.open
  }
  execute() {
    if (this.action === 'up') this.menu.move(-1)
    else if (this.action === 'down') this.menu.move(1)
    else if (this.action === 'choose') this.menu.choose()
    else this.menu.dismiss()
  }
}

const currentBlock = (context: any) => {
  const sel = context.session.selection
  return sel?.type === 'text' ? context.session.get(sel.path.slice(0, -1)) : null
}

/**
 * Seed's commands and keymap on top of Svedit's built-in ones. Passed as
 * Svedit's `create_commands_and_keymap` config hook.
 */
export function createSeedCommands(context: any, menu: SuggestionMenu, promptLink: () => string | null) {
  const isCode = () => ['Code', 'Math'].includes(currentBlock(context)?.block_type)
  const isEmptyNested = () => {
    const sel = context.session.selection
    return sel?.type === 'text' && sel.path.at(-3) === 'children' && currentBlock(context)?.content.content === ''
  }
  const commands = {
    select_all: new SelectAllCommand(context),
    insert_default_node: new InsertDefaultNodeCommand(context),
    add_new_line: new AddNewLineCommand(context),
    break_text_node: new BreakTextNodeCommand(context),
    undo: new UndoCommand(context),
    redo: new RedoCommand(context),
    select_parent: new SelectParentCommand(context),
    code_new_line: new TransactionCommand(context, (tr) => (tr.insert_text('\n'), true), isCode),
    outdent_empty: new TransactionCommand(context, outdentBlock, isEmptyNested),
    indent: new TransactionCommand(context, indentBlock),
    outdent: new TransactionCommand(context, outdentBlock),
    bold: new TransactionCommand(context, (tr) => toggleStyle(tr, 'Bold')),
    italic: new TransactionCommand(context, (tr) => toggleStyle(tr, 'Italic')),
    underline: new TransactionCommand(context, (tr) => toggleStyle(tr, 'Underline')),
    strike: new TransactionCommand(context, (tr) => toggleStyle(tr, 'Strike')),
    code: new TransactionCommand(context, (tr) => toggleStyle(tr, 'Code')),
    link: new TransactionCommand(context, (tr) => {
      const href = promptLink()
      return href !== null && setLink(tr, href)
    }),
    menu_up: new MenuCommand(context, menu, 'up'),
    menu_down: new MenuCommand(context, menu, 'down'),
    menu_choose: new MenuCommand(context, menu, 'choose'),
    menu_close: new MenuCommand(context, menu, 'close'),
  }
  const keymap = define_keymap({
    'meta+a,ctrl+a': [commands.select_all],
    enter: [
      commands.menu_choose,
      commands.code_new_line,
      commands.outdent_empty,
      commands.break_text_node,
      commands.insert_default_node,
    ],
    'shift+enter': [commands.add_new_line, commands.insert_default_node],
    tab: [commands.menu_choose, commands.indent],
    'shift+tab': [commands.outdent],
    arrowup: [commands.menu_up],
    arrowdown: [commands.menu_down],
    escape: [commands.menu_close, commands.select_parent],
    'meta+b,ctrl+b': [commands.bold],
    'meta+i,ctrl+i': [commands.italic],
    'meta+u,ctrl+u': [commands.underline],
    'meta+shift+x,ctrl+shift+x': [commands.strike],
    'meta+e,ctrl+e': [commands.code],
    'meta+k,ctrl+k': [commands.link],
    'meta+z,ctrl+z': [commands.undo],
    'meta+shift+z,ctrl+shift+z': [commands.redo],
  })
  return {commands, keymap}
}
