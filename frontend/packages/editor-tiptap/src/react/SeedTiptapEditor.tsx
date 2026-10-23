import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {Editor, Extensions} from '@tiptap/core'
import FileHandler from '@tiptap/extension-file-handler'
import {EditorContent, useEditor} from '@tiptap/react'
import {useMemo, useRef} from 'react'
import {blockDepth, seedEditorExtensions} from '../commands'
import {fromHM, toHM} from '../convert'
import {BlockHandle, createSeedMenus, FormattingToolbar} from './menus'
import {withSeedNodeViews} from './node-views'
import {type SeedEditorServices, SeedServicesContext} from './services'
import './style.css'

const MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']

/** Upload dropped/pasted files and insert them as Image/Video blocks after the block at `pos`. */
async function insertFiles(editor: Editor, services: SeedEditorServices, files: File[], pos: number) {
  for (const file of files) {
    const link = await services.uploadFile(file)
    const {state} = editor
    const $pos = state.doc.resolve(Math.min(pos, state.doc.content.size))
    const d = blockDepth($pos)
    const type = file.type.startsWith('video/') ? 'hmVideo' : 'hmImage'
    const media = state.schema.nodes[type]!.create({link, attributes: {name: file.name}})
    const block = d > 0 ? $pos.node(d) : null
    if (block && block.firstChild!.type.name === 'paragraph' && block.firstChild!.content.size === 0) {
      const start = $pos.before(d) + 1
      editor.view.dispatch(state.tr.replaceWith(start, start + block.firstChild!.nodeSize, media))
    } else {
      const at = d > 0 ? $pos.after(d) : state.doc.content.size
      editor.view.dispatch(state.tr.insert(at, state.schema.nodes.blockNode!.create(null, media)))
      pos = at + 1
    }
  }
}

/** Every Seed extension for the React editor: schema, commands, node views, menus and file drop. */
function seedReactExtensions(services: {current: SeedEditorServices}, menuExtensions: Extensions): Extensions {
  return [
    ...withSeedNodeViews(seedEditorExtensions()),
    ...menuExtensions,
    FileHandler.configure({
      allowedMimeTypes: MEDIA_TYPES,
      onDrop: (editor, files, pos) => void insertFiles(editor, services.current, files, pos),
      onPaste: (editor, files) => void insertFiles(editor, services.current, files, editor.state.selection.from),
    }),
  ]
}

/** Props for {@link SeedTiptapEditor}. */
export type SeedTiptapEditorProps = {
  /** The document content to load, as published (HM blocks). */
  initialContent: HMBlockNode[]
  /** Called with the HM blocks after every document change. */
  onChange?: (blocks: HMBlockNode[]) => void
  /** Search, loading and upload services (see {@link SeedEditorServices}). */
  services: SeedEditorServices
  /** Receives the underlying Tiptap editor once created (tests, devtools). */
  onEditor?: (editor: Editor) => void
}

/** A Seed document editor built on stock Tiptap. Mount with a `key` to reload content. */
export function SeedTiptapEditor({initialContent, onChange, services, onEditor}: SeedTiptapEditorProps) {
  const servicesRef = useRef(services)
  servicesRef.current = services
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const menus = useMemo(() => createSeedMenus(servicesRef), [])
  const editor = useEditor(
    {
      extensions: seedReactExtensions(servicesRef, menus.extensions),
      content: fromHM(initialContent).toJSON(),
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      onCreate: ({editor: e}) => onEditor?.(e),
      onUpdate: ({editor: e}) => onChangeRef.current?.(toHM(e.state.doc)),
    },
    // The editor owns its state after mount; parents remount it to reload.
    [],
  )
  return (
    <SeedServicesContext.Provider value={services}>
      <div className="seed-tiptap">
        <EditorContent editor={editor} className="seed-tiptap-content" data-testid="tiptap-editor" />
        <BlockHandle editor={editor} />
        <FormattingToolbar editor={editor} />
        <menus.Popups />
      </div>
    </SeedServicesContext.Provider>
  )
}
