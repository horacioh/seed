import {collectHMBlockIds, hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {break_text_node, type DocumentPath, type Session, type Transaction} from 'svedit'
import {describe, expect, it} from 'vitest'
import {
  applyMarkdownShortcut,
  indentBlock,
  insertMention,
  outdentBlock,
  setLink,
  setParentChildrenType,
  toggleStyle,
} from '../src/commands'
import {fromHM, toHM, type SveditDocument} from '../src/convert'
import {fromNodeId, toNodeId} from '../src/schema'
import {createSeedSession} from '../src/session'
import {allBlocks} from './fixtures/all-blocks'
import home from './fixtures/horacio-home.json'
import seedHypermedia from './fixtures/seed-hypermedia.json'
import weeklyReview from './fixtures/weekly-review.json'

const roundTrip = (blocks: HMBlockNode[]) => toHM(fromHM(blocks))
const realDocs = {home, seedHypermedia, weeklyReview} as unknown as Record<string, {content: HMBlockNode[]}>
const saved = (session: Session<any>) => toHM(session.doc as SveditDocument)

/** Path of the text property containing `needle`, walking the HM tree through Svedit node arrays. */
function textPath(session: Session<any>, needle: string): DocumentPath {
  const walk = (path: DocumentPath, ids: string[]): DocumentPath | null => {
    for (const [i, id] of ids.entries()) {
      const node = session.get(id)
      if (node.content.content.includes(needle)) return [...path, i, 'content']
      const found = walk([...path, i, 'children'], node.children.nodes)
      if (found) return found
    }
    return null
  }
  const found = walk([session.document_id, 'body'], session.get(session.document_id).body.nodes)
  if (!found) throw new Error(`text not found: ${needle}`)
  return found
}

/** Put the caret (or a selection of `length` graphemes ending there) right after `needle`. */
function select(session: Session<any>, needle: string, length = 0) {
  const path = textPath(session, needle)
  const offset = [...new Intl.Segmenter().segment(session.get(path).content.split(needle)[0] + needle)].length
  session.selection = {type: 'text', path, anchor_offset: offset - length, focus_offset: offset}
}

function run(session: Session<any>, fn: (tr: Transaction) => unknown) {
  const tr = session.tr
  const result = fn(tr)
  session.apply(tr)
  return result
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

  it.each(Object.keys(realDocs))('loads %s into a live Svedit session without changes', (name) => {
    const content = realDocs[name]!.content
    const session = createSeedSession(content)
    expect(JSON.stringify(saved(session))).toBe(JSON.stringify(content))
    expect(hmDocumentOperations(content, saved(session))).toEqual([])
  })

  it('maps formatting to hm_inline marks and inline embeds to one-character embed marks', () => {
    const doc = fromHM(allBlocks)
    const marks = Object.values(doc.nodes).filter((n) => n.type === 'hm_inline')
    expect([...new Set(marks.flatMap((m) => m.styles))].sort()).toEqual([
      'Bold',
      'Code',
      'Italic',
      'Strike',
      'Underline',
    ])
    expect(marks.filter((m) => m.link).map((m) => m.link)).toContain('https://seed.hyper.media')
    expect(marks.filter((m) => m.embed).map((m) => m.embed)).toEqual(['hm://z6MkAccount', 'hm://z6MkSite/a/doc'])
  })

  it('converts between HM code point offsets and Svedit grapheme offsets', () => {
    const family = '👨‍👩‍👧' // one grapheme, five code points
    const blocks = [
      {
        block: {
          type: 'Paragraph',
          id: 'x',
          text: `${family} 😀 bold`,
          annotations: [{type: 'Bold', starts: [8], ends: [12]}],
          attributes: {},
        },
      },
    ] as unknown as HMBlockNode[]
    const doc = fromHM(blocks)
    expect(doc.nodes[toNodeId('x')].content.marks[0]).toMatchObject({start_offset: 4, end_offset: 8})
    const session = createSeedSession(blocks)
    select(session, '😀', 1)
    run(session, (tr) => toggleStyle(tr, 'Italic'))
    expect((saved(session)[0]!.block as any).annotations).toEqual([
      {type: 'Italic', starts: [6], ends: [7]},
      {type: 'Bold', starts: [8], ends: [12]},
    ])
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
    expect(JSON.stringify(saved(createSeedSession(unknownDoc)))).toBe(JSON.stringify(unknownDoc))
  })

  it('loads unknown blocks as editable text with their children', () => {
    const session = createSeedSession(unknownDoc)
    const node = session.get(toNodeId('u1'))
    expect(node.type).toBe('hm_block')
    expect(node.block_type).toBe('FancyFutureBlock')
    expect(node.content.content).toBe('future text')
    expect(session.get(node.children.nodes[0]).content.content).toBe('child')
  })

  it('keeps unknown fields when the user edits an unknown block', () => {
    const session = createSeedSession(unknownDoc)
    select(session, 'future')
    run(session, (tr) => tr.insert_text('!'))
    expect(saved(session)[0]!.block).toEqual({
      type: 'FancyFutureBlock',
      id: 'u1',
      text: 'future! text',
      revision: 'bafyrev',
      annotations: [
        // Unlike BlockNote, Svedit does not extend a mark when typing right after it.
        {type: 'Bold', starts: [0], ends: [6]},
        {type: 'Sparkle', attributes: {intensity: 3}, starts: [8], ends: [12]},
      ],
      attributes: {childrenType: 'Grid', columnCount: 3, futureAttr: {nested: [1, 2]}},
      futureTopLevel: 'kept',
    })
  })

  it('keeps unknown attributes of known blocks when editing them', () => {
    const session = createSeedSession(unknownDoc)
    select(session, 'unknown bits')
    run(session, (tr) => tr.insert_text('.'))
    expect(saved(session)[1]!.block).toMatchObject({
      text: 'known type, unknown bits.',
      annotations: [{type: 'Bold', attributes: {weight: 900}, starts: [0], ends: [5]}],
      attributes: {textAlignment: 'center', futureAttr: true},
    })
  })
})

describe('block ids survive load → edit → save', () => {
  it('encodes HM ids into valid, reversible Svedit ids', () => {
    for (const id of ['Xr_qmEGA', 'U8m6-IOa', 'JEAN-HOME', '0abc', 'a__b', 'é😀']) {
      expect(toNodeId(id)).toMatch(/^[A-Za-z_][A-Za-z0-9_-]*$/)
      expect(toNodeId(id)).not.toContain('__')
      expect(fromNodeId(toNodeId(id))).toBe(id)
    }
  })

  it('keeps every id through edits, splits and indentation', () => {
    const content = realDocs.weeklyReview!.content
    const session = createSeedSession(content)
    const original = collectHMBlockIds(content)
    const firstText = session.get(session.get(session.document_id).body.nodes[0]).content.content
    select(session, firstText)
    run(session, (tr) => tr.insert_text(' edited'))
    const afterEdit = saved(session)
    expect(collectHMBlockIds(afterEdit)).toEqual(original)
    expect(hmDocumentOperations(content, afterEdit)).toEqual([
      {type: 'ReplaceBlock', block: expect.objectContaining({id: original[0]})},
    ])
    run(session, break_text_node)
    const afterSplit = collectHMBlockIds(saved(session))
    expect(new Set(afterSplit).size).toBe(original.length + 1)
    expect(afterSplit).toEqual(expect.arrayContaining(original))
  })
})

describe('hierarchy commands', () => {
  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )
  const shape = (nodes: HMBlockNode[]): unknown =>
    nodes.map((n) => [n.block.id, (n.block as any).attributes?.childrenType ?? null, shape(n.children ?? [])])

  it('Tab nests a block under its previous sibling and Shift-Tab undoes it', () => {
    const session = createSeedSession(flat)
    select(session, 'bbb')
    expect(run(session, indentBlock)).toBe(true)
    expect(shape(saved(session))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    select(session, 'ccc')
    run(session, indentBlock)
    expect(shape(saved(session))).toEqual([
      [
        'a',
        'Group',
        [
          ['b', null, []],
          ['c', null, []],
        ],
      ],
    ])
    select(session, 'bbb')
    run(session, outdentBlock)
    expect(shape(saved(session))).toEqual([
      ['a', null, []],
      ['b', 'Group', [['c', null, []]]],
    ])
    expect(session.selection).toMatchObject({path: [session.document_id, 'body', 1, 'content']})
  })

  it('Enter splits the block and keeps ids unique', () => {
    const session = createSeedSession(flat)
    select(session, 'a')
    run(session, break_text_node)
    const out = saved(session)
    expect(out.map((n) => (n.block as any).text)).toEqual(['a', 'aa', 'bbb', 'ccc'])
    expect(out[0]!.block.id).toBe('a')
    expect(new Set(collectHMBlockIds(out)).size).toBe(4)
  })

  it('list shortcuts set the parent childrenType', () => {
    const session = createSeedSession(allBlocks)
    select(session, 'quoted')
    run(session, (tr) => setParentChildrenType(tr, 'Ordered'))
    expect((saved(session)[2]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
  })

  it('markdown shortcuts strip their prefix', () => {
    const session = createSeedSession(flat)
    const path = textPath(session, 'bbb')
    run(session, (tr) => {
      tr.set_selection({type: 'text', path, anchor_offset: 0, focus_offset: 0})
      tr.insert_text('- ')
    })
    session.selection = {type: 'text', path, anchor_offset: 1, focus_offset: 1}
    run(session, (tr) => {
      tr.set_selection({type: 'text', path, anchor_offset: 1, focus_offset: 1})
      return applyMarkdownShortcut(tr)
    })
    expect(shape(saved(session))).toEqual([
      ['a', 'Unordered', [['b', null, []]]],
      ['c', null, []],
    ])
    expect((saved(session)[0]!.children![0]!.block as any).text).toBe(' bbb')
  })
})

describe('formatting and mentions', () => {
  const para = [
    {block: {type: 'Paragraph', id: 'x', text: 'hello @ho', annotations: [], attributes: {}}},
  ] as HMBlockNode[]

  it('toggles overlapping styles and links into HM annotations', () => {
    const session = createSeedSession(para)
    select(session, 'hello', 5)
    run(session, (tr) => toggleStyle(tr, 'Bold'))
    select(session, 'llo', 3)
    run(session, (tr) => toggleStyle(tr, 'Italic'))
    run(session, (tr) => setLink(tr, 'https://seed.hyper.media'))
    expect((saved(session)[0]!.block as any).annotations).toEqual([
      {type: 'Bold', starts: [0], ends: [5]},
      {type: 'Italic', starts: [2], ends: [5]},
      {type: 'Link', starts: [2], ends: [5], link: 'https://seed.hyper.media'},
    ])
    select(session, 'hello', 5)
    run(session, (tr) => toggleStyle(tr, 'Bold'))
    expect((saved(session)[0]!.block as any).annotations).toEqual([
      {type: 'Italic', starts: [2], ends: [5]},
      {type: 'Link', starts: [2], ends: [5], link: 'https://seed.hyper.media'},
    ])
  })

  it('inserts an account mention as an inline Embed annotation', () => {
    const session = createSeedSession(para)
    select(session, '@ho')
    run(session, (tr) => insertMention(tr, 6, 'hm://z6MkAccount'))
    run(session, (tr) => tr.insert_text('and [[doc'))
    select(session, '[[doc')
    run(session, (tr) => insertMention(tr, 12, 'hm://z6MkSite/a/doc'))
    expect(saved(session)[0]!.block).toMatchObject({
      text: 'hello \uFFFC and \uFFFC ',
      annotations: [
        {type: 'Embed', link: 'hm://z6MkAccount', starts: [6], ends: [7]},
        {type: 'Embed', link: 'hm://z6MkSite/a/doc', starts: [12], ends: [13]},
      ],
    })
  })
})
