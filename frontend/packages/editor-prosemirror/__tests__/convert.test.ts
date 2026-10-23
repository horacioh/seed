import {collectHMBlockIds, hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {type Command, NodeSelection, TextSelection} from 'prosemirror-state'
import {EditorView} from 'prosemirror-view'
import {describe, expect, it} from 'vitest'
import {allBlocks} from '../../editor-prosekit/__tests__/fixtures/all-blocks'
import home from '../../editor-prosekit/__tests__/fixtures/horacio-home.json'
import seedHypermedia from '../../editor-prosekit/__tests__/fixtures/seed-hypermedia.json'
import weeklyReview from '../../editor-prosekit/__tests__/fixtures/weekly-review.json'
import {duplicateBlock, liftBlock, setParentChildrenType, sinkBlock, splitSeedBlock} from '../src/commands'
import {fromHM, getSeedSchema, prosemirrorAdapter, toHM} from '../src/convert'
import {createSeedState} from '../src/editor'
import {insertFiles, isIframeVideo, videoEmbedUrl} from '../src/media'
import {suggestPluginKey} from '../src/suggest'

const roundTrip = (blocks: HMBlockNode[]) => toHM(fromHM(blocks))
const realDocs = {home, seedHypermedia, weeklyReview} as unknown as Record<string, {content: HMBlockNode[]}>

/** A real ProseMirror view (jsdom) with every Seed plugin. */
function editorWith(blocks: HMBlockNode[], uploadFile?: (file: File) => Promise<string>) {
  return new EditorView(document.createElement('div'), {state: createSeedState(blocks, {uploadFile})})
}

/** Position just after the text `needle` inside the document. */
function posAfter(view: EditorView, needle: string) {
  let found = -1
  view.state.doc.descendants((node, pos) => {
    if (found < 0 && node.isText && node.text!.includes(needle))
      found = pos + node.text!.indexOf(needle) + needle.length
  })
  if (found < 0) throw new Error(`text not found: ${needle}`)
  return found
}

function setCursor(view: EditorView, pos: number) {
  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, pos)))
}

// jsdom has no ClipboardEvent; ProseMirror only needs an event object.
const pasteEvent = () => new Event('paste') as ClipboardEvent

const exec = (view: EditorView, command: Command) => command(view.state, view.dispatch, view)

/** Type `text` through the input-rule path, like a keypress would. */
function type(view: EditorView, text: string) {
  for (const ch of text) {
    const {from, to} = view.state.selection
    const handled = view.someProp('handleTextInput', (f) => f(view, from, to, ch, () => view.state.tr.insertText(ch)))
    if (!handled) view.dispatch(view.state.tr.insertText(ch, from, to))
  }
}

function blockOf(blocks: HMBlockNode[], id: string): Record<string, any> {
  for (const n of blocks) {
    if (n.block.id === id) return n.block
    const found = n.children && blockOf(n.children, id)
    if (found) return found
  }
  return undefined as any
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

  it('implements the shared EditorAdapter contract', () => {
    expect(prosemirrorAdapter.name).toBe('prosemirror')
    expect(JSON.stringify(prosemirrorAdapter.toHM(prosemirrorAdapter.fromHM(allBlocks)))).toBe(
      JSON.stringify(allBlocks),
    )
  })

  it('an untouched editor produces zero change ops', () => {
    for (const {content} of Object.values(realDocs)) {
      const view = editorWith(content)
      expect(hmDocumentOperations(content, toHM(view.state.doc))).toEqual([])
    }
  })

  it('maps formatting to ProseMirror marks and inline embeds to mention nodes', () => {
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
          schema.text('it', [schema.marks.italic!.create(), schema.marks.underline!.create()]),
          schema.text('s', [schema.marks.strike!.create()]),
          schema.text('c', [schema.marks.code!.create()]),
          schema.text('l', [schema.marks.link!.create({href: 'https://x.y'})]),
          schema.nodes.hmMention!.create({link: 'hm://z6MkA', mentionKind: 'account'}),
          schema.nodes.hmMention!.create({link: 'hm://z6MkB/docs/a', mentionKind: 'document'}),
        ]),
      ),
    ])
    expect(toHM(doc)[0]!.block).toEqual({
      type: 'Paragraph',
      id: 'x',
      text: '😀 boldiitscl\uFFFC\uFFFC'.replace('ii', 'i'),
      annotations: [
        {type: 'Bold', starts: [2], ends: [6]},
        {type: 'Italic', starts: [6], ends: [8]},
        {type: 'Underline', starts: [6], ends: [8]},
        {type: 'Strike', starts: [8], ends: [9]},
        {type: 'Code', starts: [9], ends: [10]},
        {type: 'Link', link: 'https://x.y', starts: [10], ends: [11]},
        {type: 'Embed', link: 'hm://z6MkA', starts: [11], ends: [12]},
        {type: 'Embed', link: 'hm://z6MkB/docs/a', starts: [12], ends: [13]},
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

  it('renders unknown blocks as editable text with their children, without an error banner', () => {
    const doc = fromHM(unknownDoc)
    const first = doc.firstChild!
    expect(first.firstChild!.type.name).toBe('hmUnknown')
    expect(first.firstChild!.textContent).toBe('future text')
    expect(first.child(1).firstChild!.textContent).toBe('child')
    const view = editorWith(unknownDoc)
    expect(view.dom.textContent).toContain('future text')
    expect(view.dom.textContent).toContain('child')
    expect(view.dom.textContent).not.toMatch(/error|unsupported/i)
  })

  it('keeps unknown fields when the user edits an unknown block', () => {
    const view = editorWith(unknownDoc)
    setCursor(view, posAfter(view, 'future'))
    view.dispatch(view.state.tr.insertText('!'))
    const [edited] = toHM(view.state.doc)
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

  it('keeps unknown blocks byte-for-byte when other blocks are edited', () => {
    const view = editorWith(unknownDoc)
    setCursor(view, posAfter(view, 'unknown bits'))
    view.dispatch(view.state.tr.insertText('.'))
    const saved = toHM(view.state.doc)
    expect(JSON.stringify(saved[0])).toBe(JSON.stringify(unknownDoc[0]))
    expect(saved[1]!.block).toMatchObject({
      text: 'known type, unknown bits.',
      annotations: [{type: 'Bold', attributes: {weight: 900}, starts: [0], ends: [5]}],
      attributes: {textAlignment: 'center', futureAttr: true},
    })
  })
})

describe('block ids survive load → edit → save', () => {
  it('keeps every id through edits', () => {
    const content = realDocs.weeklyReview!.content
    const view = editorWith(content)
    const original = collectHMBlockIds(content)
    const firstText = view.state.doc.firstChild!.firstChild!.textContent
    setCursor(view, posAfter(view, firstText))
    view.dispatch(view.state.tr.insertText(' edited'))
    const saved = toHM(view.state.doc)
    expect(collectHMBlockIds(saved)).toEqual(original)
    const ops = hmDocumentOperations(content, saved)
    expect(ops).toEqual([{type: 'ReplaceBlock', block: expect.objectContaining({id: original[0]})}])
  })

  const two: HMBlockNode[] = ['a', 'b'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )

  it('duplicated blocks get fresh ids', () => {
    const view = editorWith(two)
    setCursor(view, posAfter(view, 'aaa'))
    exec(view, duplicateBlock)
    const saved = toHM(view.state.doc)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['aaa', 'aaa', 'bbb'])
    const ids = collectHMBlockIds(saved)
    expect(ids[0]).toBe('a')
    expect(ids[2]).toBe('b')
    expect(new Set(ids).size).toBe(3)
  })

  it('pasted blocks get fresh ids', () => {
    const view = editorWith(two)
    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, 0)))
    const {dom} = view.serializeForClipboard(view.state.selection.content())
    setCursor(view, posAfter(view, 'bbb'))
    view.pasteHTML(dom.innerHTML, pasteEvent())
    const ids = collectHMBlockIds(toHM(view.state.doc))
    expect(ids.filter((id) => id === 'a')).toHaveLength(1)
    expect(new Set(ids).size).toBe(ids.length)
    expect(toHM(view.state.doc).map((n) => (n.block as any).text)).toContain('aaa')
  })
})

describe('hierarchy commands', () => {
  const flat: HMBlockNode[] = ['a', 'b', 'c'].map(
    (id) => ({block: {type: 'Paragraph', id, text: id.repeat(3), annotations: [], attributes: {}}}) as HMBlockNode,
  )
  const shape = (nodes: HMBlockNode[]): unknown =>
    nodes.map((n) => [n.block.id, (n.block as any).attributes?.childrenType ?? null, shape(n.children ?? [])])

  it('Tab nests a block under its previous sibling and Shift-Tab undoes it', () => {
    const view = editorWith(flat)
    setCursor(view, posAfter(view, 'bbb'))
    expect(exec(view, sinkBlock)).toBe(true)
    expect(shape(toHM(view.state.doc))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    setCursor(view, posAfter(view, 'ccc'))
    exec(view, sinkBlock)
    expect(shape(toHM(view.state.doc))).toEqual([
      [
        'a',
        'Group',
        [
          ['b', null, []],
          ['c', null, []],
        ],
      ],
    ])
    setCursor(view, posAfter(view, 'bbb'))
    exec(view, liftBlock)
    expect(shape(toHM(view.state.doc))).toEqual([
      ['a', null, []],
      ['b', 'Group', [['c', null, []]]],
    ])
  })

  it('Tab and Shift-Tab are bound in the keymap', () => {
    const view = editorWith(flat)
    setCursor(view, posAfter(view, 'bbb'))
    view.someProp('handleKeyDown', (f) => f(view, new KeyboardEvent('keydown', {key: 'Tab'})))
    expect(shape(toHM(view.state.doc))).toEqual([
      ['a', 'Group', [['b', null, []]]],
      ['c', null, []],
    ])
    view.someProp('handleKeyDown', (f) => f(view, new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true})))
    expect(shape(toHM(view.state.doc))).toEqual(shape(flat))
  })

  it('Enter splits the block and keeps ids unique', () => {
    const view = editorWith(flat)
    setCursor(view, posAfter(view, 'a'))
    exec(view, splitSeedBlock)
    const saved = toHM(view.state.doc)
    expect(saved.map((n) => (n.block as any).text)).toEqual(['a', 'aa', 'bbb', 'ccc'])
    expect(saved[0]!.block.id).toBe('a')
    expect(new Set(collectHMBlockIds(saved)).size).toBe(4)
  })

  it('setParentChildrenType changes the parent childrenType', () => {
    const view = editorWith(allBlocks)
    setCursor(view, posAfter(view, 'quoted'))
    exec(view, setParentChildrenType('Ordered'))
    expect((toHM(view.state.doc)[2]!.block as any).attributes).toEqual({childrenType: 'Ordered'})
  })

  it.each([
    ['- ', 'Unordered'],
    ['1. ', 'Ordered'],
    ['> ', 'Blockquote'],
  ])('markdown shortcut %j sets the parent childrenType to %s', (shortcut, childrenType) => {
    const view = editorWith(flat)
    setCursor(view, posAfter(view, 'bbb'))
    exec(view, sinkBlock)
    setCursor(view, posAfter(view, 'bbb') - 3)
    type(view, shortcut)
    const saved = toHM(view.state.doc)
    expect((saved[0]!.block as any).attributes.childrenType).toBe(childrenType)
    expect((saved[0]!.children![0]!.block as any).text).toBe('bbb')
  })

  it('markdown shortcuts turn a paragraph into a heading, code or math block', () => {
    const view = editorWith(flat)
    setCursor(view, posAfter(view, 'aaa') - 3)
    type(view, '# ')
    setCursor(view, posAfter(view, 'bbb') - 3)
    type(view, '```')
    setCursor(view, posAfter(view, 'ccc') - 3)
    type(view, '$$')
    const saved = toHM(view.state.doc)
    expect(saved.map((n) => [n.block.type, (n.block as any).text])).toEqual([
      ['Heading', 'aaa'],
      ['Code', 'bbb'],
      ['Math', 'ccc'],
    ])
    expect(collectHMBlockIds(saved)).toEqual(['a', 'b', 'c'])
  })
})

describe('mention and slash triggers', () => {
  const one: HMBlockNode[] = [
    {block: {type: 'Paragraph', id: 'p', text: 'hi', annotations: [], attributes: {}}} as HMBlockNode,
  ]
  it.each([
    ['@hor', 'account', 'hor'],
    ['[[weekly', 'document', 'weekly'],
    ['/ima', 'slash', 'ima'],
  ])('%j opens the %s menu', (typed, kind, query) => {
    const view = editorWith(one)
    setCursor(view, posAfter(view, 'hi'))
    type(view, ' ' + typed)
    expect(suggestPluginKey.getState(view.state)).toMatchObject({kind, query})
  })

  it('Escape dismisses the menu until the trigger is retyped', () => {
    const view = editorWith(one)
    setCursor(view, posAfter(view, 'hi'))
    type(view, ' @ho')
    view.someProp('handleKeyDown', (f) => f(view, new KeyboardEvent('keydown', {key: 'Escape'})))
    expect(suggestPluginKey.getState(view.state)).toBeNull()
    type(view, 'r')
    expect(suggestPluginKey.getState(view.state)).toBeNull()
  })
})

describe('media blocks', () => {
  const media: HMBlockNode[] = [
    {
      block: {
        type: 'Image',
        id: 'img',
        text: 'A caption',
        link: 'ipfs://bafyimage',
        annotations: [],
        attributes: {width: '320', name: 'photo.png', futureImageAttr: {x: 1}},
      },
    },
    {
      block: {
        type: 'Video',
        id: 'vid',
        text: '',
        link: 'ipfs://bafyvideo',
        annotations: [],
        attributes: {width: '480', name: 'clip.mp4', autoplay: true, loop: true, muted: true, futureVideoAttr: 'kept'},
      },
    },
    {
      block: {
        type: 'Video',
        id: 'yt',
        text: '',
        link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        annotations: [],
        attributes: {},
      },
    },
    {block: {type: 'Paragraph', id: 'p', text: 'after', annotations: [], attributes: {}}},
  ] as unknown as HMBlockNode[]

  it('round-trips link, width, name, autoplay, loop, muted and unknown attributes', () => {
    expect(JSON.stringify(roundTrip(media))).toBe(JSON.stringify(media))
  })

  it('keeps media fields byte-for-byte when other blocks are edited', () => {
    const view = editorWith(media)
    setCursor(view, posAfter(view, 'after'))
    view.dispatch(view.state.tr.insertText('!'))
    const saved = toHM(view.state.doc)
    expect(JSON.stringify(saved.slice(0, 3))).toBe(JSON.stringify(media.slice(0, 3)))
    expect(hmDocumentOperations(media, saved)).toEqual([
      {type: 'ReplaceBlock', block: expect.objectContaining({id: 'p'})},
    ])
  })

  it('keeps unknown attributes when the media block itself changes', () => {
    const view = editorWith(media)
    const node = view.state.doc.firstChild!.firstChild!
    view.dispatch(
      view.state.tr.setNodeMarkup(1, undefined, {...node.attrs, attributes: {...node.attrs.attributes, width: '200'}}),
    )
    expect(toHM(view.state.doc)[0]!.block).toEqual({
      ...media[0]!.block,
      attributes: {width: '200', name: 'photo.png', futureImageAttr: {x: 1}},
    })
  })

  it('normalizes YouTube and Vimeo links like BlockNote', () => {
    expect(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
    expect(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(videoEmbedUrl('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871')
    expect(videoEmbedUrl('https://example.com/a.mp4')).toBeNull()
    expect(isIframeVideo('https://player.vimeo.com/video/76979871')).toBe(true)
    expect(isIframeVideo('ipfs://bafyvideo')).toBe(false)
  })

  it('pasting a YouTube URL on an empty line creates a Video block', () => {
    const view = editorWith([
      {block: {type: 'Paragraph', id: 'e', text: '', annotations: [], attributes: {}}} as HMBlockNode,
    ])
    setCursor(view, 2)
    view.pasteText('https://www.youtube.com/watch?v=dQw4w9WgXcQ', pasteEvent())
    expect(toHM(view.state.doc)[0]!.block).toMatchObject({
      type: 'Video',
      id: 'e',
      link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('pasting a YouTube URL inside text keeps it as text', () => {
    const view = editorWith([
      {block: {type: 'Paragraph', id: 't', text: 'see ', annotations: [], attributes: {}}} as HMBlockNode,
    ])
    setCursor(view, posAfter(view, 'see '))
    view.pasteText('https://youtu.be/dQw4w9WgXcQ', pasteEvent())
    expect(toHM(view.state.doc)[0]!.block).toMatchObject({type: 'Paragraph', text: 'see https://youtu.be/dQw4w9WgXcQ'})
  })

  it('uploaded files become Image and Video blocks through the uploadFile hook', async () => {
    const uploads: string[] = []
    const upload = async (file: File) => {
      uploads.push(file.name)
      return `ipfs://bafy-${file.name}`
    }
    const view = editorWith(
      [{block: {type: 'Paragraph', id: 'e', text: '', annotations: [], attributes: {}}} as HMBlockNode],
      upload,
    )
    setCursor(view, 2)
    await insertFiles(
      view,
      [new File(['x'], 'a.png', {type: 'image/png'}), new File(['y'], 'b.mp4', {type: 'video/mp4'})],
      upload,
    )
    const saved = toHM(view.state.doc)
    expect(uploads).toEqual(['a.png', 'b.mp4'])
    expect(saved.map((n) => [n.block.type, (n.block as any).link])).toEqual([
      ['Image', 'ipfs://bafy-a.png'],
      ['Video', 'ipfs://bafy-b.mp4'],
    ])
    expect(blockOf(saved, 'e').type).toBe('Image')
    expect((saved[1]!.block as any).attributes).toEqual({name: 'b.mp4'})
  })
})
