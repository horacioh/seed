import {collectHMBlockIds, hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {Editor} from '@tiptap/core'
import type {Command} from '@tiptap/pm/state'
import {afterEach, describe, expect, it} from 'vitest'
import {allBlocks} from '../../editor-prosekit/__tests__/fixtures/all-blocks'
import home from '../../editor-prosekit/__tests__/fixtures/horacio-home.json'
import seedHypermedia from '../../editor-prosekit/__tests__/fixtures/seed-hypermedia.json'
import weeklyReview from '../../editor-prosekit/__tests__/fixtures/weekly-review.json'
import {
  liftBlock,
  normalizeVideoUrl,
  seedEditorExtensions,
  setParentChildrenType,
  sinkBlock,
  splitSeedBlock,
} from '../src/commands'
import {fromHM, toHM} from '../src/convert'
import {getSeedSchema} from '../src/schema'

const roundTrip = (blocks: HMBlockNode[]) => toHM(fromHM(blocks))
const realDocs = {home, seedHypermedia, weeklyReview} as unknown as Record<string, {content: HMBlockNode[]}>

const editors: Editor[] = []
afterEach(() => editors.splice(0).forEach((e) => e.destroy()))

/** A real Tiptap editor with the Seed extensions (keymaps, input rules, id plugin), mounted in jsdom. */
function editorWith(blocks: HMBlockNode[]) {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: seedEditorExtensions(),
    content: fromHM(blocks).toJSON(),
  })
  editors.push(editor)
  return editor
}

/** Position just after the text `needle` inside the document. */
function posAfter(editor: Editor, needle: string) {
  let found = -1
  editor.state.doc.descendants((node, pos) => {
    if (found < 0 && node.isText && node.text!.includes(needle))
      found = pos + node.text!.indexOf(needle) + needle.length
  })
  if (found < 0) throw new Error(`text not found: ${needle}`)
  return found
}

/** Type through the input-rule plugin, like a keyboard would. */
function typeWithRules(editor: Editor, text: string) {
  for (const ch of text) {
    const {view} = editor
    const {from, to} = view.state.selection
    const deflt = () => view.state.tr.insertText(ch, from, to)
    if (!view.someProp('handleTextInput', (f) => f(view, from, to, ch, deflt))) view.dispatch(deflt())
  }
}

// jsdom has no ClipboardEvent, which `view.pasteText`/`pasteHTML` construct.
;(globalThis as any).ClipboardEvent ??= class extends Event {
  clipboardData = null
}

const type = (editor: Editor, text: string) => editor.view.dispatch(editor.state.tr.insertText(text))
const exec = (editor: Editor, command: Command) => command(editor.state, editor.view.dispatch, editor.view)

describe('fromHM → toHM round trip', () => {
  it('is lossless for every supported block type', () => {
    expect(JSON.stringify(roundTrip(allBlocks))).toBe(JSON.stringify(allBlocks))
  })

  it.each(Object.keys(realDocs))('is byte-for-byte for the published document %s', (name) => {
    const content = realDocs[name]!.content
    expect(JSON.stringify(roundTrip(content))).toBe(JSON.stringify(content))
    expect(hmDocumentOperations(content, roundTrip(content))).toEqual([])
  })

  it.each(Object.keys(realDocs))('loads %s into a live Tiptap editor with zero ops', (name) => {
    const content = realDocs[name]!.content
    const editor = editorWith(content)
    expect(JSON.stringify(toHM(editor.state.doc))).toBe(JSON.stringify(content))
    expect(hmDocumentOperations(content, toHM(editor.state.doc))).toEqual([])
  })

  it('maps formatting to stock Tiptap marks and inline embeds to mention nodes', () => {
    const doc = fromHM(allBlocks)
    const marks = new Set<string>()
    const mentions: string[] = []
    doc.descendants((node) => {
      node.marks.forEach((m) => marks.add(m.type.name))
      if (node.type.name === 'hmMention') mentions.push(node.attrs.link)
    })
    expect([...marks].sort()).toEqual(['bold', 'code', 'italic', 'link', 'strike', 'textStyle', 'underline'])
    expect(mentions).toEqual(['hm://z6MkAccount', 'hm://z6MkSite/a/doc'])
  })

  it('serializes edited formatting back into HM annotations with code point offsets', () => {
    const schema = getSeedSchema()
    const doc = schema.nodes.doc!.create(null, [
      schema.nodes.blockNode!.create(
        {id: 'x'},
        schema.nodes.paragraph!.create(null, [
          schema.text('😀 '),
          schema.text('bold', [schema.marks.bold!.create(), schema.marks.textStyle!.create({color: 'red'})]),
          schema.nodes.hmMention!.create({link: 'hm://z6MkA', mentionKind: 'account'}),
        ]),
      ),
    ])
    expect(toHM(doc)[0]!.block).toEqual({
      type: 'Paragraph',
      id: 'x',
      text: '😀 bold\uFFFC',
      annotations: [
        {type: 'TextColor', starts: [2], ends: [6], attributes: {value: 'red'}},
        {type: 'Bold', starts: [2], ends: [6]},
        {type: 'Embed', link: 'hm://z6MkA', starts: [6], ends: [7]},
      ],
      attributes: {},
    })
  })

  it('keeps overlapping colour annotations of the same kind', () => {
    const blocks = [
      {
        block: {
          type: 'Paragraph',
          id: 'c',
          text: 'abcdef',
          annotations: [
            {type: 'TextColor', starts: [0], ends: [4], attributes: {value: 'red'}},
            {type: 'TextColor', starts: [2], ends: [6], attributes: {value: 'blue'}},
            {type: 'BackgroundColor', starts: [1], ends: [3], attributes: {value: 'yellow'}},
          ],
          attributes: {},
        },
      },
    ] as unknown as HMBlockNode[]
    expect(JSON.stringify(roundTrip(blocks))).toBe(JSON.stringify(blocks))
    const editor = editorWith(blocks)
    editor.commands.setTextSelection(posAfter(editor, 'f'))
    type(editor, '!')
    const annotations = (toHM(editor.state.doc)[0]!.block as any).annotations
    expect(annotations).toEqual(
      expect.arrayContaining([
        {type: 'TextColor', starts: [0], ends: [4], attributes: {value: 'red'}},
        {type: 'TextColor', starts: [2], ends: [6], attributes: {value: 'blue'}},
        {type: 'BackgroundColor', starts: [1], ends: [3], attributes: {value: 'yellow'}},
      ]),
    )
  })
})

describe('media blocks', () => {
  const media: HMBlockNode[] = [
    {
      block: {
        type: 'Video',
        id: 'yt',
        text: '',
        link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        attributes: {width: '640', name: 'clip', autoplay: true, loop: false, muted: true, futureAttr: {x: 1}},
      },
    },
    {
      block: {
        type: 'Image',
        id: 'img',
        text: 'A caption',
        link: 'ipfs://bafyimage',
        attributes: {width: '320', name: 'photo.png', futureImageAttr: 'kept'},
      },
    },
    {block: {type: 'Paragraph', id: 'p', text: 'after', annotations: [], attributes: {}}},
  ] as unknown as HMBlockNode[]

  it('round-trips image and video attributes, including unknown ones', () => {
    expect(JSON.stringify(roundTrip(media))).toBe(JSON.stringify(media))
  })

  it('keeps media blocks untouched when another block is edited', () => {
    const editor = editorWith(media)
    editor.commands.setTextSelection(posAfter(editor, 'after'))
    type(editor, '!')
    const saved = toHM(editor.state.doc)
    expect(saved[0]!.block).toBe(media[0]!.block)
    expect(saved[1]!.block).toBe(media[1]!.block)
    expect(hmDocumentOperations(media, saved)).toEqual([
      {type: 'ReplaceBlock', block: expect.objectContaining({id: 'p', text: 'after!'})},
    ])
  })

  it('keeps unknown media attributes when the media block itself changes', () => {
    const editor = editorWith(media)
    let videoPos = -1
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'hmVideo') videoPos = pos
    })
    const attributes = editor.state.doc.nodeAt(videoPos)!.attrs.attributes
    editor.view.dispatch(editor.state.tr.setNodeAttribute(videoPos, 'attributes', {...attributes, width: '480'}))
    expect(toHM(editor.state.doc)[0]!.block).toEqual({
      ...media[0]!.block,
      attributes: {width: '480', name: 'clip', autoplay: true, loop: false, muted: true, futureAttr: {x: 1}},
    })
  })

  it('normalizes YouTube and Vimeo URLs the way BlockNote stores them', () => {
    expect(normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
    expect(normalizeVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(normalizeVideoUrl('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871')
    expect(normalizeVideoUrl('https://example.com/a.mp4')).toBe(null)
  })

  it('turns a YouTube URL pasted on an empty line into a Video block', () => {
    const editor = editorWith([
      {block: {type: 'Paragraph', id: 'e', text: '', annotations: [], attributes: {}}} as unknown as HMBlockNode,
    ])
    editor.commands.setTextSelection(2)
    editor.view.pasteText('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(toHM(editor.state.doc)[0]!.block).toMatchObject({
      type: 'Video',
      id: 'e',
      link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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

  it('renders unknown blocks as editable text with their children, without an error banner', () => {
    const editor = editorWith(unknownDoc)
    const first = editor.state.doc.firstChild!
    expect(first.firstChild!.type.name).toBe('hmUnknown')
    expect(first.firstChild!.textContent).toBe('future text')
    expect(first.child(1).firstChild!.textContent).toBe('child')
    const dom = editor.view.dom
    expect(dom.querySelector('[data-hm-unknown="FancyFutureBlock"]')!.textContent).toBe('future text')
    expect(dom.textContent).toContain('child')
    expect(dom.textContent).not.toMatch(/error/i)
  })

  it('keeps unknown fields when the user edits an unknown block', () => {
    const editor = editorWith(unknownDoc)
    editor.commands.setTextSelection(posAfter(editor, 'future'))
    type(editor, '!')
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

  it('keeps unknown blocks byte-for-byte when another block is edited', () => {
    const editor = editorWith(unknownDoc)
    editor.commands.setTextSelection(posAfter(editor, 'unknown bits'))
    type(editor, '.')
    const saved = toHM(editor.state.doc)
    expect(JSON.stringify(saved[0])).toBe(JSON.stringify(unknownDoc[0]))
    expect(saved[1]!.block).toMatchObject({
      text: 'known type, unknown bits.',
      annotations: [{type: 'Bold', attributes: {weight: 900}, starts: [0], ends: [5]}],
      attributes: {textAlignment: 'center', futureAttr: true},
    })
  })

  it('keeps the unknown block type when Backspace is pressed at the start of the document', () => {
    const editor = editorWith(unknownDoc)
    editor.commands.setTextSelection(2)
    editor.commands.keyboardShortcut('Backspace')
    expect(toHM(editor.state.doc)[0]!.block.type).toBe('FancyFutureBlock')
  })
})

describe('block ids survive load → edit → save', () => {
  it('keeps every id through edits', () => {
    const content = realDocs.weeklyReview!.content
    const editor = editorWith(content)
    const original = collectHMBlockIds(content)
    const firstText = editor.state.doc.firstChild!.firstChild!.textContent
    editor.commands.setTextSelection(posAfter(editor, firstText))
    type(editor, ' edited')
    const saved = toHM(editor.state.doc)
    expect(collectHMBlockIds(saved)).toEqual(original)
    const ops = hmDocumentOperations(content, saved)
    expect(ops).toEqual([{type: 'ReplaceBlock', block: expect.objectContaining({id: original[0]})}])
  })

  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )

  it('gives duplicated blocks a fresh id and keeps the original on the first copy', () => {
    const editor = editorWith(flat)
    const first = editor.state.doc.firstChild!
    editor.view.dispatch(editor.state.tr.insert(first.nodeSize, first))
    const ids = collectHMBlockIds(toHM(editor.state.doc))
    expect(ids[0]).toBe('a')
    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
    expect(ids.slice(2)).toEqual(['b', 'c'])
  })

  it('gives pasted blocks fresh ids', () => {
    const editor = editorWith(flat)
    const {dom} = editor.view.serializeForClipboard(editor.state.doc.slice(0, editor.state.doc.content.size))
    editor.commands.setTextSelection(posAfter(editor, 'ccc'))
    editor.view.pasteHTML(dom.innerHTML)
    const saved = toHM(editor.state.doc)
    const ids = collectHMBlockIds(saved)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['aaa', 'bbb', 'ccc', 'aaa', 'bbb', 'ccc'])
    expect(ids.slice(0, 3)).toEqual(['a', 'b', 'c'])
    expect(new Set(ids).size).toBe(6)
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
    editor.commands.setTextSelection(posAfter(editor, 'bbb'))
    expect(editor.commands.keyboardShortcut('Tab')).toBe(true)
    expect(shape(toHM(editor.state.doc))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    editor.commands.setTextSelection(posAfter(editor, 'ccc'))
    exec(editor, sinkBlock)
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
    editor.commands.setTextSelection(posAfter(editor, 'bbb'))
    exec(editor, liftBlock)
    expect(shape(toHM(editor.state.doc))).toEqual([
      ['a', null, []],
      ['b', 'Group', [['c', null, []]]],
    ])
  })

  it('Enter splits the block and keeps ids unique', () => {
    const editor = editorWith(flat)
    editor.commands.setTextSelection(posAfter(editor, 'a'))
    exec(editor, splitSeedBlock)
    const saved = toHM(editor.state.doc)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['a', 'aa', 'bbb', 'ccc'])
    expect(saved[0]!.block.id).toBe('a')
    expect(new Set(collectHMBlockIds(saved)).size).toBe(4)
  })

  it('setParentChildrenType changes the list type of the enclosing group', () => {
    const editor = editorWith(allBlocks)
    editor.commands.setTextSelection(posAfter(editor, 'quoted'))
    exec(editor, setParentChildrenType('Ordered'))
    expect((toHM(editor.state.doc)[2]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
  })

  it('markdown shortcuts: "- " makes the enclosing group a bulleted list, "# " a heading', () => {
    const editor = editorWith(allBlocks)
    const pos = posAfter(editor, 'quoted') - 'quoted'.length
    editor.commands.setTextSelection(pos)
    typeWithRules(editor, '- ')
    expect((toHM(editor.state.doc)[2]!.block as any).attributes).toEqual({childrenType: 'Unordered'})
    typeWithRules(editor, '# ')
    expect(toHM(editor.state.doc)[2]!.children![0]!.block).toMatchObject({type: 'Heading', text: 'quoted'})
  })
})
