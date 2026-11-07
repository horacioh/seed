import {createHeadlessEditor} from '@lexical/headless'
import {hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {
  $createNodeSelection,
  $getRoot,
  $getSelection,
  $setSelection,
  BLUR_COMMAND,
  PASTE_COMMAND,
  type ElementNode,
} from 'lexical'
import {describe, expect, it} from 'vitest'
import {registerSeedEditing} from '../src/commands'
import {fromHM, toHM} from '../src/convert'
import {videoEmbedUrl, youtubeParser} from '../src/media'
import {SEED_NODES} from '../src/nodes'

const media: HMBlockNode[] = [
  {
    block: {
      type: 'Image',
      id: 'img',
      text: 'A caption',
      link: 'ipfs://bafkreie5ykmjtxd3rbkmh4bxsoe2k6ys5ngzxlvgxw7wc3kjqyw3tdv3vu',
      attributes: {width: 480, name: 'photo.png', focalPoint: [0.2, 0.8]},
      annotations: [],
    },
  },
  {
    block: {
      type: 'Video',
      id: 'ipfs-video',
      text: '',
      link: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      attributes: {width: 640, name: 'clip.mp4', autoplay: true, loop: true, muted: true, poster: 'ipfs://poster'},
      annotations: [],
    },
    children: [{block: {type: 'Paragraph', id: 'child', text: 'below the video', annotations: []}}],
  },
  {
    block: {
      type: 'Video',
      id: 'yt',
      text: '',
      link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      attributes: {width: 560, autoplay: false, loop: false, muted: false},
      annotations: [],
    },
  },
  {
    block: {
      type: 'Video',
      id: 'vimeo',
      text: '',
      link: 'https://player.vimeo.com/video/76979871',
      attributes: {name: 'Vimeo', start: 12},
    } as any,
  },
] as unknown as HMBlockNode[]

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

/** Put the caret in the text of the last top-level block and paste `text`. */
function pasteInLastBlock(blocks: HMBlockNode[], text: string) {
  const editor = editorWith(blocks)
  editor.update(
    () => {
      ;($getRoot().getLastChildOrThrow() as ElementNode).getFirstChildOrThrow<ElementNode>().selectEnd()
      editor.dispatchCommand(PASTE_COMMAND, {clipboardData: {getData: () => text}, preventDefault() {}} as any)
    },
    {discrete: true},
  )
  return toHM(editor.getEditorState().toJSON())
}

describe('media blocks', () => {
  it('round-trip Image, ipfs Video, YouTube and Vimeo blocks byte-for-byte, unknown attributes included', () => {
    const editor = editorWith(media)
    const saved = toHM(editor.getEditorState().toJSON())
    expect(JSON.stringify(saved)).toBe(JSON.stringify(media))
    expect(hmDocumentOperations(media, saved)).toEqual([])
  })

  it('keep link, width, name, autoplay, loop and muted when other blocks are edited', () => {
    const editor = editorWith(media)
    editor.update(() => $getRoot().getFirstChildOrThrow<ElementNode>().insertBefore($getRoot().getLastChildOrThrow()), {
      discrete: true,
    })
    const saved = toHM(editor.getEditorState().toJSON())
    expect(saved.map((n) => n.block.id)).toEqual(['vimeo', 'img', 'ipfs-video', 'yt'])
    for (const node of media) expect(saved.find((n) => n.block.id === node.block.id)).toEqual(node)
  })

  it('normalize YouTube and Vimeo page URLs to the player links BlockNote stores', () => {
    const embed = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    expect(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe(embed)
    expect(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(embed)
    expect(videoEmbedUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(embed)
    expect(videoEmbedUrl(embed)).toBe(embed)
    expect(videoEmbedUrl('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871')
    expect(videoEmbedUrl('https://www.youtube.com/watch?v=short')).toBeNull()
    expect(videoEmbedUrl('https://example.com/clip.mp4')).toBeNull()
    expect(videoEmbedUrl('ipfs://bafy')).toBeNull()
    expect(youtubeParser('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('turn a YouTube URL pasted on an empty line into a Video block', () => {
    const blocks = [
      {block: {type: 'Paragraph', id: 'a', text: 'aaa', annotations: []}},
      {block: {type: 'Paragraph', id: 'empty', text: '', annotations: []}},
    ] as unknown as HMBlockNode[]
    const saved = pasteInLastBlock(blocks, 'https://youtu.be/dQw4w9WgXcQ')
    expect(saved).toHaveLength(2)
    expect(saved[1]!.block).toMatchObject({
      type: 'Video',
      id: 'empty',
      link: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    })
  })

  it('paste a YouTube URL as text into a line that already has text', () => {
    const blocks = [{block: {type: 'Paragraph', id: 'a', text: 'see ', annotations: []}}] as unknown as HMBlockNode[]
    const saved = pasteInLastBlock(blocks, 'https://youtu.be/dQw4w9WgXcQ')
    expect(saved.map((n) => n.block.type)).toEqual(['Paragraph'])
  })

  it('drop a media node selection on blur, so clicking back into text places the caret', () => {
    const editor = editorWith(media)
    editor.update(
      () => {
        const sel = $createNodeSelection()
        sel.add(($getRoot().getFirstChildOrThrow() as ElementNode).getFirstChildOrThrow().getKey())
        $setSelection(sel)
        editor.dispatchCommand(BLUR_COMMAND, new FocusEvent('blur'))
      },
      {discrete: true},
    )
    expect(editor.getEditorState().read(() => $getSelection())).toBeNull()
  })
})
