import {createHeadlessEditor} from '@lexical/headless'
import {collectHMBlockIds, hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $parseSerializedNode,
  createEditor,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical'
import {describe, expect, it} from 'vitest'
import {allBlocks} from '../../editor-prosekit/__tests__/fixtures/all-blocks'
import home from '../../editor-prosekit/__tests__/fixtures/horacio-home.json'
import seedHypermedia from '../../editor-prosekit/__tests__/fixtures/seed-hypermedia.json'
import weeklyReview from '../../editor-prosekit/__tests__/fixtures/weekly-review.json'
import {
  $liftBlock,
  $nearestBlock,
  $setChildrenType,
  $setParentChildrenType,
  $setTextType,
  $sinkBlock,
  registerSeedEditing,
} from '../src/commands'
import {fromHM, toHM} from '../src/convert'
import {SEED_NODES} from '../src/nodes'

const realDocs = {home, seedHypermedia, weeklyReview} as unknown as Record<string, {content: HMBlockNode[]}>

/** A headless editor with all Seed nodes and editing behaviour, loaded with `blocks`. */
function editorWith(blocks: HMBlockNode[]) {
  const editor = createHeadlessEditor({
    nodes: SEED_NODES,
    onError: (e) => {
      throw e
    },
  })
  registerSeedEditing(editor)
  editor.setEditorState(editor.parseEditorState(JSON.stringify(fromHM(blocks))))
  return editor
}

/** Through a real Lexical editor: parse the serialized state and export it again. */
const roundTrip = (blocks: HMBlockNode[]) => toHM(editorWith(blocks).getEditorState().toJSON())
const save = (editor: LexicalEditor) => toHM(editor.getEditorState().toJSON())
const update = (editor: LexicalEditor, fn: () => void) => editor.update(fn, {discrete: true})
const key = (k: string, shiftKey = false) => new KeyboardEvent('keydown', {key: k, shiftKey})

function findText(needle: string) {
  const visit = (node: LexicalNode): LexicalNode | null => {
    if ($isTextNode(node) && node.getTextContent().includes(needle)) return node
    for (const child of 'getChildren' in node ? (node as any).getChildren() : []) {
      const found = visit(child)
      if (found) return found
    }
    return null
  }
  const node = visit($getRoot())
  if (!node) throw new Error(`text not found: ${needle}`)
  return node as import('lexical').TextNode
}

/** Collapse the selection just after `needle`. */
function cursorAfter(editor: LexicalEditor, needle: string) {
  update(editor, () => {
    const node = findText(needle)
    const offset = node.getTextContent().indexOf(needle) + needle.length
    node.select(offset, offset)
    // What Lexical does on a DOM selection change: the caret takes the formatting of the text it is in.
    const sel = $getSelection()
    if ($isRangeSelection(sel)) {
      sel.format = node.getFormat()
      sel.style = node.getStyle()
    }
  })
}

function typeText(editor: LexicalEditor, text: string) {
  update(editor, () => {
    const sel = $getSelection()
    if ($isRangeSelection(sel)) sel.insertText(text)
  })
}

function nodeTypes(json: any, out = new Set<string>()) {
  out.add(json.type)
  for (const c of json.children ?? []) nodeTypes(c, out)
  return out
}

describe('fromHM → toHM round trip', () => {
  it('is lossless for every supported block type', () => {
    expect(JSON.stringify(toHM(fromHM(allBlocks)))).toBe(JSON.stringify(allBlocks))
    expect(JSON.stringify(roundTrip(allBlocks))).toBe(JSON.stringify(allBlocks))
  })

  it.each(Object.keys(realDocs))('is byte-for-byte for the published document %s', (name) => {
    const content = realDocs[name]!.content
    expect(JSON.stringify(roundTrip(content))).toBe(JSON.stringify(content))
    expect(hmDocumentOperations(content, roundTrip(content))).toEqual([])
  })

  it('maps formatting to Lexical text formats/links and inline embeds to mention nodes', () => {
    const json = editorWith(allBlocks).getEditorState().toJSON()
    let format = 0
    const styles = new Set<string>()
    const mentions: string[] = []
    const walk = (n: any) => {
      if (n.type === 'text') {
        format |= n.format
        if (n.style) styles.add(n.style)
      }
      if (n.type === 'seed-mention') mentions.push(n.$.link)
      ;(n.children ?? []).forEach(walk)
    }
    walk(json.root)
    expect(format).toBe(1 | 2 | 4 | 8 | 16)
    expect(nodeTypes(json.root)).toEqual(
      new Set([
        'root',
        'seed-block',
        'seed-text',
        'text',
        'linebreak',
        'link',
        'seed-group',
        'seed-mention',
        'code',
        'seed-math',
        'seed-atom',
      ]),
    )
    expect([...styles].join(' ')).toMatch(/color: .*background-color: /s)
    expect(mentions).toEqual(['hm://z6MkAccount', 'hm://z6MkSite/a/doc'])
  })

  it('serializes edited formatting back into HM annotations with code point offsets', () => {
    const editor = editorWith([
      {block: {type: 'Paragraph', id: 'x', text: '😀 ', annotations: [], attributes: {}}} as HMBlockNode,
    ])
    cursorAfter(editor, '😀 ')
    update(editor, () => {
      const sel = $getSelection()
      if (!$isRangeSelection(sel)) return
      sel.formatText('bold')
      sel.insertText('bold')
      const mention = $parseSerializedNode({type: 'seed-mention', version: 1, $: {link: 'hm://z6MkA'}} as any)
      sel.insertNodes([mention])
    })
    expect(save(editor)[0]!.block).toEqual({
      type: 'Paragraph',
      id: 'x',
      text: '😀 bold\uFFFC',
      annotations: [
        {type: 'Bold', starts: [2], ends: [6]},
        {type: 'Embed', link: 'hm://z6MkA', starts: [6], ends: [7]},
      ],
      attributes: {},
    })
  })
})

describe('never delete what you do not understand', () => {
  const unknownDoc: HMBlockNode[] = [
    {
      block: {
        type: 'FancyFutureBlock',
        id: 'u1',
        text: 'future text',
        revision: 'bafyrev',
        annotations: [
          {type: 'Bold', starts: [0], ends: [6]},
          {type: 'Sparkle', starts: [7], ends: [11], attributes: {intensity: 3}},
        ],
        attributes: {childrenType: 'Grid', columnCount: 3, futureAttr: {nested: [1, 2]}},
        futureTopLevel: 'kept',
      },
      children: [{block: {type: 'Paragraph', id: 'u1c', text: 'child', annotations: [], attributes: {}}, children: []}],
    } as unknown as HMBlockNode,
    {
      block: {
        type: 'Paragraph',
        id: 'p1',
        text: 'known type, unknown bits',
        annotations: [{type: 'Bold', starts: [0], ends: [5], attributes: {weight: 900}}],
        attributes: {textAlignment: 'center', futureAttr: true},
      },
    } as unknown as HMBlockNode,
  ]

  it('round-trips unknown blocks, attributes and annotations byte-for-byte', () => {
    expect(JSON.stringify(roundTrip(unknownDoc))).toBe(JSON.stringify(unknownDoc))
  })

  it('renders unknown blocks as editable text with their children, no error banner', () => {
    const editor = createEditor({
      nodes: SEED_NODES,
      onError: (e) => {
        throw e
      },
    })
    const root = document.createElement('div')
    root.contentEditable = 'true'
    editor.setRootElement(root)
    editor.setEditorState(editor.parseEditorState(JSON.stringify(fromHM(unknownDoc))))
    const unknown = root.querySelector('[data-hm-type="FancyFutureBlock"]')!
    expect(unknown.textContent).toBe('future text')
    expect(unknown.nextElementSibling!.getAttribute('data-children-type')).toBe('Grid')
    expect(unknown.nextElementSibling!.textContent).toBe('child')
    expect(root.textContent).not.toMatch(/error|unsupported/i)
  })

  it('keeps unknown fields when the user edits an unknown block', () => {
    const editor = editorWith(unknownDoc)
    cursorAfter(editor, 'future')
    typeText(editor, '!')
    expect(save(editor)[0]!.block).toEqual({
      type: 'FancyFutureBlock',
      id: 'u1',
      text: 'future! text',
      revision: 'bafyrev',
      annotations: [
        // Bold is inclusive: typing at its end extends it, as in BlockNote.
        {type: 'Bold', starts: [0], ends: [7]},
        {type: 'Sparkle', attributes: {intensity: 3}, starts: [8], ends: [12]},
      ],
      attributes: {childrenType: 'Grid', columnCount: 3, futureAttr: {nested: [1, 2]}},
      futureTopLevel: 'kept',
    })
  })

  it('keeps unknown attributes of known blocks when editing them', () => {
    const editor = editorWith(unknownDoc)
    cursorAfter(editor, 'unknown bits')
    typeText(editor, '.')
    expect(save(editor)[1]!.block).toMatchObject({
      text: 'known type, unknown bits.',
      annotations: [{type: 'Bold', attributes: {weight: 900}, starts: [0], ends: [5]}],
      attributes: {textAlignment: 'center', futureAttr: true},
    })
  })
})

describe('block ids survive load → edit → save', () => {
  it('keeps every id through edits', () => {
    const content = realDocs.weeklyReview!.content
    const editor = editorWith(content)
    const original = collectHMBlockIds(content)
    const firstText = (content[0]!.block as any).text!
    cursorAfter(editor, firstText.slice(-5))
    typeText(editor, ' edited')
    const saved = save(editor)
    expect(collectHMBlockIds(saved)).toEqual(original)
    const ops = hmDocumentOperations(content, saved)
    expect(ops).toEqual([{type: 'ReplaceBlock', block: expect.objectContaining({id: original[0]})}])
  })

  it('gives pasted copies of a block a fresh id and keeps the original', () => {
    const content = realDocs.weeklyReview!.content
    const editor = editorWith(content)
    const firstJSON = editor.getEditorState().toJSON().root.children[0]!
    update(editor, () => $getRoot().append($parseSerializedNode(firstJSON)))
    const saved = save(editor)
    const ids = collectHMBlockIds(saved)
    expect(ids[0]).toBe(content[0]!.block.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect((saved.at(-1)!.block as any).text).toBe((content[0]!.block as any).text)
  })
})

describe('hierarchy commands', () => {
  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )
  const shape = (nodes: HMBlockNode[]): unknown =>
    nodes.map((n) => [n.block.id, (n.block as any).attributes?.childrenType ?? null, shape(n.children ?? [])])
  const inBlock = (editor: LexicalEditor, needle: string, fn: (block: any) => void) =>
    update(editor, () => fn($nearestBlock(findText(needle))))

  it('Tab nests a block under its previous sibling and Shift-Tab undoes it', () => {
    const editor = editorWith(flat)
    cursorAfter(editor, 'bbb')
    update(editor, () => editor.dispatchCommand(KEY_TAB_COMMAND, key('Tab')))
    expect(shape(save(editor))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    inBlock(editor, 'ccc', $sinkBlock)
    expect(shape(save(editor))).toEqual([
      [
        'a',
        'Group',
        [
          ['b', null, []],
          ['c', null, []],
        ],
      ],
    ])
    cursorAfter(editor, 'bbb')
    update(editor, () => editor.dispatchCommand(KEY_TAB_COMMAND, key('Tab', true)))
    expect(shape(save(editor))).toEqual([
      ['a', null, []],
      ['b', 'Group', [['c', null, []]]],
    ])
    inBlock(editor, 'ccc', $liftBlock)
    expect(shape(save(editor))).toEqual([
      ['a', null, []],
      ['b', null, []],
      ['c', null, []],
    ])
  })

  it('Enter splits the block and keeps ids unique', () => {
    const editor = editorWith(flat)
    cursorAfter(editor, 'a')
    update(editor, () => editor.dispatchCommand(KEY_ENTER_COMMAND, key('Enter')))
    const saved = save(editor)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['a', 'aa', 'bbb', 'ccc'])
    expect(saved[0]!.block.id).toBe('a')
    expect(new Set(collectHMBlockIds(saved)).size).toBe(4)
  })

  it('Enter at the end of a block with children inserts its first child', () => {
    const editor = editorWith(allBlocks)
    cursorAfter(editor, 'quoted')
    const before = save(editor)
    const parentText = (before[2]!.block as any).text as string
    cursorAfter(editor, parentText)
    update(editor, () => editor.dispatchCommand(KEY_ENTER_COMMAND, key('Enter')))
    const after = save(editor)
    expect(after[2]!.children!.length).toBe(before[2]!.children!.length + 1)
    expect((after[2]!.children![0]!.block as any).text).toBe('')
  })

  it('Backspace at the start of a block joins it into the previous one and keeps the first id', () => {
    const editor = editorWith(flat)
    update(editor, () => findText('bbb').select(0, 0))
    update(editor, () => editor.dispatchCommand(KEY_BACKSPACE_COMMAND, key('Backspace')))
    const saved = save(editor)
    expect(saved.map((n) => [n.block.id, (n.block as any).text])).toEqual([
      ['a', 'aaabbb'],
      ['c', 'ccc'],
    ])
  })

  it('list shortcuts set the parent childrenType', () => {
    const editor = editorWith(allBlocks)
    inBlock(editor, 'quoted', (b) => $setParentChildrenType(b, 'Ordered'))
    expect((save(editor)[2]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
  })

  it('markdown "- " in a nested block turns its group into a bulleted list', () => {
    const editor = editorWith(flat)
    inBlock(editor, 'bbb', $sinkBlock)
    update(editor, () => findText('bbb').select(0, 0))
    typeText(editor, '-')
    typeText(editor, ' ')
    update(editor, () => {}) // commit the shortcut's follow-up update
    const saved = save(editor)
    expect(shape(saved)).toEqual([
      ['a', 'Unordered', [['b', null, []]]],
      ['c', null, []],
    ])
    expect((saved[0]!.children![0]!.block as any).text).toBe('bbb')
  })
})

describe('block type and childrenType edits', () => {
  const flat: HMBlockNode[] = ['a', 'b'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )

  it('re-renders a paragraph as a heading when its type changes', () => {
    const editor = createEditor({
      nodes: SEED_NODES,
      onError: (e) => {
        throw e
      },
    })
    const root = document.createElement('div')
    root.contentEditable = 'true'
    editor.setRootElement(root)
    editor.setEditorState(editor.parseEditorState(JSON.stringify(fromHM(flat))))
    update(editor, () => $setTextType($nearestBlock(findText('aaa'))!, 'Heading'))
    expect(root.querySelector('h2')?.textContent).toBe('aaa')
    expect((save(editor)[0]!.block as any).type).toBe('Heading')
  })

  it('pastes copied blocks as separate blocks with fresh ids', () => {
    const editor = editorWith(flat)
    const copied = editor.getEditorState().toJSON().root.children
    cursorAfter(editor, 'bbb')
    update(editor, () => {
      editor.dispatchCommand(SELECTION_INSERT_CLIPBOARD_NODES_COMMAND, {
        nodes: copied.map((n) => $parseSerializedNode(n)),
        selection: $getSelection()!,
      })
    })
    const saved = save(editor)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['aaa', 'bbb', 'aaa', 'bbb'])
    expect(saved.slice(0, 2).map((n) => n.block.id)).toEqual(['a', 'b'])
    expect(new Set(saved.map((n) => n.block.id)).size).toBe(4)
  })

  it('keeps a childrenType chosen on a childless block for its first indented child', () => {
    const editor = editorWith(flat)
    update(editor, () => $setChildrenType($nearestBlock(findText('aaa'))!, 'Ordered'))
    expect((save(editor)[0]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
    update(editor, () => $sinkBlock($nearestBlock(findText('bbb'))!))
    const saved = save(editor)
    expect((saved[0]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
    expect(saved[0]!.children!.map((n) => n.block.id)).toEqual(['b'])
  })
})
