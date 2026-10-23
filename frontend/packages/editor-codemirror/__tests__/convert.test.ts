import {collectHMBlockIds, hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {undo, history} from '@codemirror/commands'
import {EditorSelection, type EditorState, type TransactionSpec} from '@codemirror/state'
import type {EditorView} from '@codemirror/view'
import {describe, expect, it} from 'vitest'
import {allBlocks} from '../../editor-prosekit/__tests__/fixtures/all-blocks'
import home from '../../editor-prosekit/__tests__/fixtures/horacio-home.json'
import seedHypermedia from '../../editor-prosekit/__tests__/fixtures/seed-hypermedia.json'
import weeklyReview from '../../editor-prosekit/__tests__/fixtures/weekly-review.json'
import {indentBlock, listShortcut, outdentBlock, setChildrenType, splitBlock} from '../src/commands'
import {normalizeVideoUrl, parseInline, serializeInline} from '../src/format'
import {createSeedState, fromHM, toHM} from '../src/state'

const roundTrip = (blocks: HMBlockNode[]) => toHM(fromHM(blocks))
const realDocs = {home, seedHypermedia, weeklyReview} as unknown as Record<string, {content: HMBlockNode[]}>

/** A tiny stand-in for an EditorView: commands only use `state` and `dispatch`. */
function editorWith(blocks: HMBlockNode[]) {
  const editor = {
    state: createSeedState(blocks, history()),
    dispatch(tr: any) {
      editor.state = tr.state
    },
    update(spec: TransactionSpec) {
      editor.state = editor.state.update(spec).state
    },
    run(command: (view: EditorView) => boolean) {
      return command(editor as unknown as EditorView)
    },
  }
  return editor
}

/** Offset just after `needle` in the editor text. */
function posAfter(state: EditorState, needle: string) {
  const i = state.doc.toString().indexOf(needle)
  if (i < 0) throw new Error(`text not found: ${needle}`)
  return i + needle.length
}

function type(editor: ReturnType<typeof editorWith>, after: string, text: string) {
  const pos = posAfter(editor.state, after)
  editor.update({changes: {from: pos, insert: text}, selection: {anchor: pos + text.length}})
}

function setCursor(editor: ReturnType<typeof editorWith>, after: string) {
  editor.update({selection: EditorSelection.cursor(posAfter(editor.state, after))})
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

  it('re-parses its own text to the same blocks even when every block is treated as edited', () => {
    for (const content of [allBlocks, ...Object.values(realDocs).map((d) => d.content)]) {
      const state = fromHM(content)
      const reloaded = fromHM([])
      const fresh = reloaded.update({changes: {from: 0, to: reloaded.doc.length, insert: state.doc.toString()}}).state
      const strip = (nodes: HMBlockNode[]): unknown =>
        nodes.map((n) => {
          const {id: _id, ...b} = n.block as any
          return [b.type, b.text ?? '', b.link ?? '', strip(n.children ?? [])]
        })
      expect(strip(toHM(fresh))).toEqual(strip(content))
    }
  })

  it('writes formatting as Markdown-like syntax and mentions as [[hm://…]]', () => {
    const text = fromHM(allBlocks).doc.toString()
    expect(text).toContain('**')
    expect(text).toContain('[[hm://z6MkAccount]]')
    expect(text).toContain('![[hm://z6MkSite/doc|Card]]')
    expect(text).toContain('![caption](ipfs://bafyimage)')
    expect(text).toContain('::Video[](ipfs://bafyvideo)')
  })

  it('parses edited formatting into HM annotations with code point offsets', () => {
    expect(parseInline('😀 **bold**[[hm://z6MkA]] <u>u</u> ~~s~~ `c` *i* [l](https://x.y)')).toMatchObject({
      text: '😀 bold\uFFFC u s c i l',
      annotations: [
        {type: 'Bold', starts: [2], ends: [6]},
        {type: 'Embed', link: 'hm://z6MkA', attributes: {mentionKind: 'account'}, starts: [6], ends: [7]},
        {type: 'Underline', starts: [8], ends: [9]},
        {type: 'Strike', starts: [10], ends: [11]},
        {type: 'Code', starts: [12], ends: [13]},
        {type: 'Italic', starts: [14], ends: [15]},
        {type: 'Link', link: 'https://x.y', starts: [16], ends: [17]},
      ],
    })
  })

  it('keeps unpaired delimiters and escaped syntax as literal text', () => {
    expect(parseInline('2 * 3 and [x').text).toBe('2 * 3 and [x')
    const tricky = 'a*b**c`d[e]f<u>g\\h'
    expect(parseInline(serializeInline(tricky, [])).text).toBe(tricky)
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

  it('shows unknown blocks as editable text with their children', () => {
    expect(fromHM(unknownDoc).doc.toString()).toBe(
      '::FancyFutureBlock[**future** <x:1>text</x:1>]\n  child\n<x:0>known</x:0> type, unknown bits',
    )
  })

  it('keeps unknown fields when the user edits an unknown block', () => {
    const editor = editorWith(unknownDoc)
    type(editor, 'future', '!')
    const [edited] = toHM(editor.state)
    expect(edited!.block).toEqual({
      type: 'FancyFutureBlock',
      id: 'u1',
      text: 'future! text',
      revision: 'bafyrev',
      annotations: [
        {type: 'Bold', starts: [0], ends: [7]},
        {type: 'Sparkle', starts: [8], ends: [12], attributes: {intensity: 3}},
      ],
      attributes: {childrenType: 'Grid', columnCount: 3, futureAttr: {nested: [1, 2]}},
      futureTopLevel: 'kept',
    })
    expect(edited!.children).toEqual(unknownDoc[0]!.children)
  })

  it('keeps unknown attributes of known blocks when editing them', () => {
    const editor = editorWith(unknownDoc)
    type(editor, 'unknown bits', '.')
    expect(toHM(editor.state)[1]!.block).toMatchObject({
      text: 'known type, unknown bits.',
      annotations: [{type: 'Bold', attributes: {weight: 900}, starts: [0], ends: [5]}],
      attributes: {textAlignment: 'center', futureAttr: true},
    })
  })

  it('keeps unknown blocks byte-for-byte when other blocks are edited', () => {
    const editor = editorWith(unknownDoc)
    type(editor, 'unknown bits', '.')
    expect(JSON.stringify(toHM(editor.state)[0])).toBe(JSON.stringify(unknownDoc[0]))
  })
})

describe('block ids survive load → edit → save', () => {
  it('keeps every id through edits', () => {
    const content = realDocs.weeklyReview!.content
    const editor = editorWith(content)
    const original = collectHMBlockIds(content)
    const firstLine = editor.state.doc.line(1).text
    type(editor, firstLine, ' edited')
    const saved = toHM(editor.state)
    expect(collectHMBlockIds(saved)).toEqual(original)
    expect(hmDocumentOperations(content, saved)).toEqual([
      {type: 'ReplaceBlock', block: expect.objectContaining({id: original[0]})},
    ])
  })

  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )

  it('gives pasted and duplicated blocks fresh ids', () => {
    const editor = editorWith(flat)
    const text = editor.state.doc.toString()
    editor.update({changes: {from: text.length, insert: '\n' + text}})
    const ids = collectHMBlockIds(toHM(editor.state))
    expect(ids.slice(0, 3)).toEqual(['a', 'b', 'c'])
    expect(new Set(ids).size).toBe(6)
  })

  it('keeps the id of a block whose whole text is retyped, and of the line after a deleted one', () => {
    const editor = editorWith(flat)
    const b = posAfter(editor.state, 'aaa\n')
    editor.update({changes: {from: b, to: b + 3, insert: 'new'}})
    expect(toHM(editor.state).map((n) => n.block.id)).toEqual(['a', 'b', 'c'])
    editor.update({changes: {from: b, to: b + 4}})
    expect(toHM(editor.state).map((n) => n.block.id)).toEqual(['a', 'c'])
  })

  it('undo brings a deleted block back with its id', () => {
    const editor = editorWith(flat)
    const b = posAfter(editor.state, 'aaa\n')
    editor.update({changes: {from: b, to: b + 4}, userEvent: 'delete'})
    editor.run(undo)
    expect(toHM(editor.state).map((n) => n.block.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('hierarchy commands', () => {
  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )
  const shape = (nodes: HMBlockNode[]): unknown =>
    nodes.map((n) => [n.block.id, (n.block as any).attributes?.childrenType ?? null, shape(n.children ?? [])])

  it('Tab nests a block under its previous sibling and Shift-Tab undoes it', () => {
    const editor = editorWith(flat)
    setCursor(editor, 'bbb')
    expect(editor.run(indentBlock)).toBe(true)
    expect(shape(toHM(editor.state))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    setCursor(editor, 'ccc')
    editor.run(indentBlock)
    expect(shape(toHM(editor.state))).toEqual([
      [
        'a',
        'Group',
        [
          ['b', null, []],
          ['c', null, []],
        ],
      ],
    ])
    setCursor(editor, 'bbb')
    editor.run(outdentBlock)
    expect(shape(toHM(editor.state))).toEqual([
      ['a', null, []],
      ['b', 'Group', [['c', null, []]]],
    ])
  })

  it('Enter splits the block and keeps ids unique', () => {
    const editor = editorWith(flat)
    setCursor(editor, 'a')
    editor.run(splitBlock)
    const saved = toHM(editor.state)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['a', 'aa', 'bbb', 'ccc'])
    expect(saved[0]!.block.id).toBe('a')
    expect(new Set(collectHMBlockIds(saved)).size).toBe(4)
  })

  it('Enter at the start of a block opens a block above and the text keeps its id', () => {
    const editor = editorWith(flat)
    editor.update({selection: {anchor: posAfter(editor.state, 'aaa\n')}})
    editor.run(splitBlock)
    const saved = toHM(editor.state)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['aaa', '', 'bbb', 'ccc'])
    expect(saved[2]!.block.id).toBe('b')
  })

  it('list markers set the parent childrenType', () => {
    const editor = editorWith(allBlocks)
    setCursor(editor, 'quoted')
    editor.run(setChildrenType('Ordered'))
    expect((toHM(editor.state)[2]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
  })

  it('typing "- " at the start of a top-level block nests it as a bullet', () => {
    const editor = editorWith(flat)
    const pos = posAfter(editor.state, 'aaa\n')
    editor.update({changes: {from: pos, insert: '-'}})
    editor.update(listShortcut(editor.state, pos + 1, ' ')!)
    expect(shape(toHM(editor.state))).toEqual([
      ['a', 'Unordered', [['b', null, []]]],
      ['c', null, []],
    ])
  })
})

describe('media', () => {
  const media: HMBlockNode[] = [
    {
      block: {
        type: 'Image',
        id: 'i',
        text: 'a caption',
        link: 'ipfs://bafyimg',
        annotations: [],
        attributes: {width: '320', name: 'cat.png', futureAttr: 1},
      },
    },
    {
      block: {
        type: 'Video',
        id: 'v',
        text: '',
        link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        attributes: {width: '640', autoplay: true, loop: true, muted: true, name: 'yt', futureAttr: 2},
      },
    },
    {block: {type: 'Video', id: 'f', text: '', link: 'ipfs://bafyvid', attributes: {name: 'clip.mp4'}}},
  ] as unknown as HMBlockNode[]

  it('round-trips image and video attributes byte-for-byte', () => {
    expect(JSON.stringify(roundTrip(media))).toBe(JSON.stringify(media))
  })

  it('keeps width, name, autoplay/loop/muted and unknown attributes when the caption or link changes', () => {
    const editor = editorWith(media)
    type(editor, 'a caption', '!')
    const pos = posAfter(editor.state, 'ipfs://bafyvid')
    editor.update({changes: {from: pos - 'bafyvid'.length, to: pos, insert: 'bafyother'}})
    const [image, video, file] = toHM(editor.state)
    expect(image!.block).toEqual({...media[0]!.block, text: 'a caption!'})
    expect(JSON.stringify(video)).toBe(JSON.stringify(media[1]))
    expect(file!.block).toMatchObject({link: 'ipfs://bafyother', attributes: {name: 'clip.mp4'}})
  })

  it('normalizes YouTube and Vimeo links like BlockNote', () => {
    expect(normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
    expect(normalizeVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(normalizeVideoUrl('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871')
    expect(normalizeVideoUrl('ipfs://bafyvid')).toBe('ipfs://bafyvid')
    const editor = editorWith([])
    editor.update({changes: {from: 0, insert: '::Video[](https://youtu.be/dQw4w9WgXcQ)'}})
    expect(toHM(editor.state)[0]!.block).toMatchObject({
      type: 'Video',
      link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })
})
