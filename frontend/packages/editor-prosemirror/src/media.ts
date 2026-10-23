import type {Node as PMNode} from 'prosemirror-model'
import {NodeSelection, Plugin, PluginKey, type EditorState, type Transaction} from 'prosemirror-state'
import type {EditorView} from 'prosemirror-view'
import {blockDepth} from './commands'
import {ATOM_BLOCK_TYPES} from './schema'

/** Uploads a file and resolves to the link to store (`ipfs://…` in the app). */
export type UploadFile = (file: File) => Promise<string>

/** YouTube video id of `url`, or false. Same regex as `youtubeParser` in `@shm/editor/utils`. */
export function youtubeParser(url: string): string | false {
  const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)
  return match && match[7]!.length == 11 ? match[7]! : false
}

/**
 * The embed URL BlockNote stores for a YouTube or Vimeo link
 * (`https://www.youtube.com/embed/<id>`, `https://player.vimeo.com/video/<id>`),
 * or null when `url` is neither.
 */
export function videoEmbedUrl(url: string): string | null {
  if (url.includes('youtu.be') || url.includes('youtube')) {
    const id = youtubeParser(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (url.includes('vimeo')) {
    const parts = url.split('/')
    return `https://player.vimeo.com/video/${parts[parts.length - 1]}`
  }
  return null
}

/** Whether a stored video `link` plays in an iframe (YouTube/Vimeo) instead of `<video>`. */
export function isIframeVideo(link: string): boolean {
  return /^https:\/\/(www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/.test(link)
}

/**
 * Put a media/atom block at the cursor: it replaces the current block's
 * content when that is an empty paragraph, otherwise it becomes a new block
 * right after the current one.
 */
export function insertAtomBlock(state: EditorState, node: PMNode, at = state.selection.from): Transaction {
  const $pos = state.doc.resolve(at)
  const d = blockDepth($pos)
  const tr = state.tr
  if (d < 0) return tr
  const content = $pos.node(d).firstChild!
  const start = $pos.before(d) + 1
  if (content.type.name === 'paragraph' && content.content.size === 0) {
    tr.replaceWith(start, start + content.nodeSize, node)
    return tr.setSelection(NodeSelection.create(tr.doc, start))
  }
  const after = $pos.after(d)
  tr.insert(after, state.schema.nodes.blockNode!.create(null, node))
  return tr.setSelection(NodeSelection.create(tr.doc, after + 1))
}

function mediaTypeOf(file: File) {
  if (file.type.startsWith('image/')) return ATOM_BLOCK_TYPES.Image
  if (file.type.startsWith('video/')) return ATOM_BLOCK_TYPES.Video
  return ATOM_BLOCK_TYPES.File
}

/** Upload `files` and insert one Image/Video/File block per file at `pos`. */
export async function insertFiles(view: EditorView, files: File[], uploadFile: UploadFile, pos?: number) {
  for (const file of files) {
    const link = await uploadFile(file)
    if (view.isDestroyed) return
    const type = view.state.schema.nodes[mediaTypeOf(file)]!
    const attributes = mediaTypeOf(file) === ATOM_BLOCK_TYPES.Image ? {} : {name: file.name}
    view.dispatch(insertAtomBlock(view.state, type.create({link, attributes}), pos).scrollIntoView())
    pos = undefined
  }
}

/** Plugin key of {@link createMediaPlugin}. */
export const mediaPluginKey = new PluginKey('seed-media')

/**
 * Paste and drop handling for media: dropped or pasted files are uploaded
 * through `uploadFile` and become Image/Video/File blocks; a pasted YouTube or
 * Vimeo URL on an empty line becomes a Video block.
 */
export function createMediaPlugin(uploadFile: UploadFile) {
  return new Plugin({
    key: mediaPluginKey,
    props: {
      handlePaste(view, event, slice) {
        const files = Array.from(event.clipboardData?.files ?? [])
        if (files.length) {
          void insertFiles(view, files, uploadFile)
          return true
        }
        const text = slice.content.textBetween(0, slice.content.size, '\n').trim()
        const {$from, empty} = view.state.selection
        const embed = /^https?:\/\/\S+$/.test(text) ? videoEmbedUrl(text) : null
        if (!embed || !empty || $from.parent.type.name !== 'paragraph' || $from.parent.content.size) return false
        const node = view.state.schema.nodes.hmVideo!.create({link: embed})
        view.dispatch(insertAtomBlock(view.state, node).scrollIntoView())
        return true
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? [])
        if (!files.length) return false
        event.preventDefault()
        const pos = view.posAtCoords({left: event.clientX, top: event.clientY})?.pos
        void insertFiles(view, files, uploadFile, pos)
        return true
      },
    },
  })
}
