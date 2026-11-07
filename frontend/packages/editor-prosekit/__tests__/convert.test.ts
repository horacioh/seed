import {collectHMBlockIds, hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {createEditor, union} from 'prosekit/core'
import {TextSelection} from 'prosekit/pm/state'
import {describe, expect, it} from 'vitest'
import {defineSeedCommands} from '../src/commands'
import {fromHM, getSeedSchema, toHM} from '../src/convert'
import {defineSeedEditorBase} from '../src/schema'
import {allBlocks} from './fixtures/all-blocks'
import home from './fixtures/horacio-home.json'
import seedHypermedia from './fixtures/seed-hypermedia.json'
import weeklyReview from './fixtures/weekly-review.json'

const roundTrip = (blocks: HMBlockNode[]) => toHM(fromHM(blocks))
const realDocs = {home, seedHypermedia, weeklyReview} as unknown as Record<string, {content: HMBlockNode[]}>

/** An editor state with the real Seed extension (keymaps + id plugin), no DOM view. */
function editorWith(blocks: HMBlockNode[]) {
  const editor = createEditor({extension: union(defineSeedEditorBase(), defineSeedCommands())})
  editor.mount(document.createElement('div'))
  editor.setContent(fromHM(blocks, editor.schema))
  return editor
}

/** Position just after the text `needle` inside the document. */
function posAfter(editor: ReturnType<typeof editorWith>, needle: string) {
  let found = -1
  editor.state.doc.descendants((node, pos) => {
    if (found < 0 && node.isText && node.text!.includes(needle))
      found = pos + node.text!.indexOf(needle) + needle.length
  })
  if (found < 0) throw new Error(`text not found: ${needle}`)
  return found
}

function setCursor(editor: ReturnType<typeof editorWith>, pos: number) {
  const state = editor.state
  editor.updateState(state.apply(state.tr.setSelection(TextSelection.create(state.doc, pos))))
}

describe('fromHM → toHM round trip', () => {
  it('is lossless for every supported block type', () => {
    expect(JSON.stringify(roundTrip(allBlocks))).toBe(JSON.stringify(allBlocks))
  })

  it.each(Object.keys(realDocs))('is byte-for-byte for the published document %s', (name) => {
    const content = realDocs[name]!.content
    expect(JSON.stringify(roundTrip(content))).toBe(JSON.stringify(content))
    expect(hmDocumentOperations(content, roundTrip(content))).toEqual([])
  })

  it('maps formatting to ProseKit marks and inline embeds to mention nodes', () => {
    const doc = fromHM(allBlocks)
    const marks = new Set<string>()
    const mentions: string[] = []
    doc.descendants((node) => {
      node.marks.forEach((m) => marks.add(m.type.name))
      if (node.type.name === 'hmMention') mentions.push(node.attrs.link)
    })
    expect([...marks].sort()).toEqual([
      'backgroundColor',
      'bold',
      'code',
      'italic',
      'link',
      'strike',
      'textColor',
      'underline',
    ])
    expect(mentions).toEqual(['hm://z6MkAccount', 'hm://z6MkSite/a/doc'])
  })

  it('serializes edited formatting back into HM annotations with code point offsets', () => {
    const schema = getSeedSchema()
    const doc = schema.nodes.doc!.create(null, [
      schema.nodes.blockNode!.create(
        {id: 'x'},
        schema.nodes.paragraph!.create(null, [
          schema.text('😀 '),
          schema.text('bold', [schema.marks.bold!.create()]),
          schema.nodes.hmMention!.create({link: 'hm://z6MkA', mentionKind: 'account'}),
        ]),
      ),
    ])
    expect(toHM(doc)[0]!.block).toEqual({
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

  it('renders unknown blocks as editable text with their children', () => {
    const doc = fromHM(unknownDoc)
    const first = doc.firstChild!
    expect(first.firstChild!.type.name).toBe('hmUnknown')
    expect(first.firstChild!.textContent).toBe('future text')
    expect(first.child(1).firstChild!.textContent).toBe('child')
  })

  it('keeps unknown fields when the user edits an unknown block', () => {
    const editor = editorWith(unknownDoc)
    setCursor(editor, posAfter(editor, 'future'))
    editor.commands.insertText({text: '!'})
    const [edited] = toHM(editor.state.doc)
    expect(edited!.block).toEqual({
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
    setCursor(editor, posAfter(editor, 'unknown bits'))
    editor.commands.insertText({text: '.'})
    expect(toHM(editor.state.doc)[1]!.block).toMatchObject({
      text: 'known type, unknown bits.',
      annotations: [{type: 'Bold', attributes: {weight: 900}, starts: [0], ends: [5]}],
      attributes: {textAlignment: 'center', futureAttr: true},
    })
  })
})

describe('block ids survive load → edit → save', () => {
  it('keeps every id through edits, splits and indentation', () => {
    const content = realDocs.weeklyReview!.content
    const editor = editorWith(content)
    const original = collectHMBlockIds(content)
    const firstText = editor.state.doc.firstChild!.firstChild!.textContent
    setCursor(editor, posAfter(editor, firstText))
    editor.commands.insertText({text: ' edited'})
    const saved = toHM(editor.state.doc)
    expect(collectHMBlockIds(saved)).toEqual(original)
    const ops = hmDocumentOperations(content, saved)
    expect(ops).toEqual([{type: 'ReplaceBlock', block: expect.objectContaining({id: original[0]})}])
  })
})

describe('hierarchy commands', () => {
  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )
  const shape = (nodes: HMBlockNode[]): unknown =>
    nodes.map((n) => [n.block.id, (n.block as any).attributes?.childrenType ?? null, shape(n.children ?? [])])

  it('Tab nests a block under its previous sibling and Shift-Tab undoes it', async () => {
    const {sinkBlock, liftBlock} = await import('../src/commands')
    const editor = editorWith(flat)
    setCursor(editor, posAfter(editor, 'bbb'))
    expect(editor.exec(sinkBlock)).toBe(true)
    expect(shape(toHM(editor.state.doc))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    setCursor(editor, posAfter(editor, 'ccc'))
    editor.exec(sinkBlock)
    expect(shape(toHM(editor.state.doc))).toEqual([
      [
        'a',
        'Group',
        [
          ['b', null, []],
          ['c', null, []],
        ],
      ],
    ])
    setCursor(editor, posAfter(editor, 'bbb'))
    editor.exec(liftBlock)
    expect(shape(toHM(editor.state.doc))).toEqual([
      ['a', null, []],
      ['b', 'Group', [['c', null, []]]],
    ])
  })

  it('Enter splits the block and keeps ids unique', async () => {
    const {splitSeedBlock} = await import('../src/commands')
    const editor = editorWith(flat)
    setCursor(editor, posAfter(editor, 'a'))
    editor.exec(splitSeedBlock)
    const saved = toHM(editor.state.doc)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['a', 'aa', 'bbb', 'ccc'])
    expect(saved[0]!.block.id).toBe('a')
    expect(new Set(collectHMBlockIds(saved)).size).toBe(4)
  })

  it('list shortcuts set the parent childrenType', async () => {
    const {setParentChildrenType} = await import('../src/commands')
    const editor = editorWith(allBlocks)
    setCursor(editor, posAfter(editor, 'quoted'))
    editor.exec(setParentChildrenType('Ordered'))
    expect((toHM(editor.state.doc)[2]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
  })
})
