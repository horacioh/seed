import {describe, expect, it} from 'vitest'
import type {EditorAdapter} from '../src/editor-adapter'
import {blockKind, ownedAttributes} from '../src/editor/blocks'
import {adapterConformanceCases} from '../src/editor/conformance'
import {allBlocks, editorFixtures} from '../src/editor/fixtures/index'
import {validateHMTree, withFreshIds} from '../src/editor/ids'
import {INLINE_EMBED_CHAR, inlineFromHM, inlineToHM} from '../src/editor/inline'
import {isVideoPlayerLink, videoEmbedLink} from '../src/editor/media'
import {restoreBlock, snapshotBlock, withChildrenType, type ProducedBlock} from '../src/editor/preserve'
import type {HMBlockNode} from '../src/hm-types'

function textBlocks(nodes: HMBlockNode[]): Array<Record<string, any>> {
  return nodes.flatMap((n) => [
    ...(blockKind(n.block.type) === 'text' ? [n.block as Record<string, any>] : []),
    ...textBlocks(n.children ?? []),
  ])
}

describe('inline', () => {
  it('round-trips the text and annotations of every text block in the fixtures to equivalent HM', () => {
    for (const blocks of Object.values(editorFixtures)) {
      for (const block of textBlocks(blocks)) {
        const runs = inlineFromHM(block.text, block.annotations)
        const {text, annotations} = inlineToHM(runs)
        expect(text).toBe(block.text)
        expect(inlineFromHM(text, annotations)).toEqual(runs)
      }
    }
  })

  it('collects every range of the same mark into one annotation', () => {
    const annotations = [
      {type: 'Bold', starts: [0], ends: [1]},
      {type: 'Bold', starts: [2], ends: [3]},
    ]
    expect(inlineToHM(inlineFromHM('abc', annotations)).annotations).toEqual([
      {type: 'Bold', starts: [0, 2], ends: [1, 3]},
    ])
  })

  it('splits text into marked runs, mentions and breaks with code point offsets', () => {
    const runs = inlineFromHM(`😀 bold\n${INLINE_EMBED_CHAR}`, [
      {type: 'Bold', starts: [2], ends: [6]},
      {type: 'Embed', starts: [7], ends: [8], link: 'hm://alice'},
    ])
    expect(runs).toEqual([
      {kind: 'text', text: '😀 ', marks: []},
      {kind: 'text', text: 'bold', marks: [{kind: 'simple', type: 'Bold'}]},
      {kind: 'break', marks: []},
      {
        kind: 'mention',
        link: 'hm://alice',
        mentionKind: null,
        annotation: {type: 'Embed', link: 'hm://alice'},
        marks: [],
      },
    ])
  })

  it('keeps annotations it does not model as opaque marks and merges touching ranges', () => {
    const highlight = {type: 'Highlight', starts: [0], ends: [3], attributes: {tone: 'warm'}}
    const runs = inlineFromHM('abcdef', [highlight])
    expect(runs[0]!.marks).toEqual([{kind: 'opaque', annotation: {type: 'Highlight', attributes: {tone: 'warm'}}}])
    const bold = [{kind: 'simple', type: 'Bold'}] as const
    expect(
      inlineToHM([
        {kind: 'text', text: 'ab', marks: [...bold]},
        {kind: 'text', text: 'cd', marks: [...bold]},
      ]).annotations,
    ).toEqual([{type: 'Bold', starts: [0], ends: [4]}])
  })
})

describe('preserve', () => {
  const node = {
    block: {type: 'Paragraph', id: 'a', text: 'hi', annotations: [], attributes: {align: 'center'}, extra: 1},
  } as unknown as HMBlockNode
  const produced = (text: string): ProducedBlock => ({
    fields: {type: 'Paragraph', id: 'a', text, annotations: [], attributes: {}},
    ownedAttrs: ownedAttributes('text'),
  })

  it('returns the original object for untouched blocks', () => {
    const snapshot = snapshotBlock(node, produced('hi'))
    expect(restoreBlock(snapshot, produced('hi'))).toBe(node.block)
  })

  it('keeps unknown keys and attributes of edited blocks', () => {
    const snapshot = snapshotBlock(node, produced('hi'))
    expect(restoreBlock(snapshot, produced('hello'))).toEqual({
      type: 'Paragraph',
      id: 'a',
      text: 'hello',
      annotations: [],
      attributes: {align: 'center'},
      extra: 1,
    })
  })

  it('lets an editor own attributes, including childrenType when the block has children', () => {
    const image = {block: {type: 'Image', id: 'i', link: 'x', attributes: {width: '1', childrenType: 'Ordered'}}}
    const fields = {type: 'Image', id: 'i', text: '', link: 'x', attributes: {}}
    const snapshot = snapshotBlock(image as unknown as HMBlockNode, {
      fields: {...fields, attributes: {width: '1'}},
      ownedAttrs: 'all',
    })
    expect(restoreBlock(snapshot, {fields, ownedAttrs: 'all'}).attributes).toEqual({childrenType: 'Ordered'})
    const withGroup = withChildrenType({fields, ownedAttrs: ownedAttributes('text')}, 'Unordered')
    expect(withGroup.ownedAttrs).toEqual(['childrenType'])
    expect(restoreBlock(snapshot, withGroup).attributes).toEqual({width: '1', childrenType: 'Unordered'})
  })
})

describe('ids', () => {
  it('gives every block a fresh id and keeps everything else', () => {
    let n = 0
    const fresh = withFreshIds(allBlocks, () => `new-${n++}`)
    expect(validateHMTree([...allBlocks, ...fresh])).toEqual([])
    expect(JSON.stringify(fresh).replace(/"id":"new-\d+"/g, '')).toBe(
      JSON.stringify(allBlocks).replace(/"id":"[^"]+"/g, ''),
    )
  })

  it('points copied columnId references at the copied columns', () => {
    const b = (block: Record<string, unknown>, children?: HMBlockNode[]) =>
      ({block, ...(children ? {children} : {})}) as unknown as HMBlockNode
    const table = [
      b({type: 'Table', id: 't'}, [
        b({type: 'Column', id: 'col'}),
        b({type: 'Cell', id: 'cell', attributes: {columnId: 'col', other: 1}}),
        b({type: 'Cell', id: 'outside', attributes: {columnId: 'elsewhere'}}),
      ]),
    ]
    let n = 0
    const [copied] = withFreshIds(table, () => `new-${n++}`)
    expect(copied!.children!.map((c) => (c.block as Record<string, any>).attributes)).toEqual([
      undefined,
      {columnId: 'new-1', other: 1},
      {columnId: 'elsewhere'},
    ])
  })

  it('reports missing and duplicate ids and unknown childrenType values', () => {
    const p = (id: string, attributes = {}) => ({block: {type: 'Paragraph', id, attributes}}) as unknown as HMBlockNode
    expect(validateHMTree([p('a'), {...p('b', {childrenType: 'Grid'}), children: [p('a'), p('')]}])).toEqual([
      {kind: 'unknown-children-type', id: 'b', childrenType: 'Grid'},
      {kind: 'duplicate-id', id: 'a', path: [1, 0]},
      {kind: 'missing-id', path: [1, 1]},
    ])
  })
})

describe('media', () => {
  it('normalises YouTube and Vimeo page URLs to the player links BlockNote stores', () => {
    expect(videoEmbedLink('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(videoEmbedLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
    expect(videoEmbedLink('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871')
    expect(videoEmbedLink('ipfs://bafy')).toBeNull()
    expect(isVideoPlayerLink('https://player.vimeo.com/video/1')).toBe(true)
  })
})

describe('conformance', () => {
  const lossless: EditorAdapter<HMBlockNode[]> = {name: 'json', fromHM: structuredClone, toHM: (doc) => doc}

  it('passes an adapter that keeps the HM tree as is', () => {
    const cases = adapterConformanceCases(lossless, {fixtures: editorFixtures})
    expect(cases.length).toBeGreaterThan(10)
    for (const c of cases) c.run()
  })

  it('fails an adapter that drops attributes it does not model', () => {
    const strip = (nodes: HMBlockNode[]): HMBlockNode[] =>
      nodes.map((n) => ({
        ...n,
        block: {...n.block, attributes: {}},
        ...(n.children ? {children: strip(n.children)} : {}),
      }))
    const lossy: EditorAdapter<HMBlockNode[]> = {name: 'lossy', fromHM: strip, toHM: (doc) => doc}
    const failures = adapterConformanceCases(lossy).filter((c) => {
      try {
        c.run()
        return false
      } catch {
        return true
      }
    })
    expect(failures.map((c) => c.name)).toContain('lossy: unknown data round-trips byte-for-byte')
  })
})
