import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {mergeRegister} from '@lexical/utils'
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getState,
  $setState,
  COMMAND_PRIORITY_HIGH,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  PASTE_COMMAND,
  type NodeKey,
} from 'lexical'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  $isSeedBlockNode,
  attributesState,
  decoratorRenderers,
  hmTypeState,
  linkState,
  textState,
  type SeedAtomNode,
  type SeedMathNode,
  type SeedMentionNode,
} from '../nodes'
import {$createSeedAtom, $insertBlockContent, $nearestBlock, $selectedBlock} from '../commands'
import {isVideoPlayerLink, videoEmbedUrl} from '../media'
import {type EmbeddedDocument, useSeedServices} from './services'

/** Load an embedded document once per link. */
function useDocument(link: string) {
  const services = useSeedServices()
  const [state, setState] = useState<{doc: EmbeddedDocument | null; loading: boolean}>({doc: null, loading: true})
  useEffect(() => {
    let cancelled = false
    setState({doc: null, loading: true})
    services
      .loadDocument(link)
      .catch(() => null)
      .then((doc) => !cancelled && setState({doc, loading: false}))
    return () => {
      cancelled = true
    }
  }, [link, services])
  return state
}

/** Click selects the decorator as a Lexical node selection. */
function useSelectable(nodeKey: NodeKey) {
  const [selected, setSelected, clear] = useLexicalNodeSelection(nodeKey)
  const onClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, a, video')) return
    if (!e.shiftKey) clear()
    setSelected(true)
  }
  return {selected, onClick}
}

/** Read-only rendering of HM blocks, used inside `Embed` blocks. */
function ReadOnlyBlocks({blocks, childrenType}: {blocks: HMBlockNode[]; childrenType?: string}) {
  const services = useSeedServices()
  const Tag = childrenType === 'Ordered' ? 'ol' : childrenType === 'Unordered' ? 'ul' : 'div'
  return (
    <Tag className={childrenType === 'Blockquote' ? 'seed-ro-quote' : 'seed-ro-group'}>
      {blocks.map(({block, children}) => {
        const b = block as Record<string, any>
        const inner =
          b.type === 'Heading' ? (
            <h3>{b.text}</h3>
          ) : b.type === 'Image' ? (
            <img src={services.fileUrl(b.link, 'image')} alt={b.text} />
          ) : b.text ? (
            <p>{String(b.text).replaceAll('\uFFFC', '•')}</p>
          ) : null
        const nested = children?.length ? (
          <ReadOnlyBlocks blocks={children} childrenType={b.attributes?.childrenType} />
        ) : null
        const Item = Tag === 'div' ? 'div' : 'li'
        return (
          <Item key={b.id}>
            {inner}
            {nested}
          </Item>
        )
      })}
    </Tag>
  )
}

function EmbedView({nodeKey, link, attributes}: {nodeKey: NodeKey; link: string; attributes: Record<string, any>}) {
  const [editor] = useLexicalComposerContext()
  const {selected, onClick} = useSelectable(nodeKey)
  const view = (attributes.view as string) || 'Content'
  const {doc, loading} = useDocument(link)
  const setView = (v: string) =>
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) $setState(node, attributesState, {...$getState(node, attributesState), view: v})
    })
  return (
    <div
      className={`seed-embed seed-embed-${view.toLowerCase()}`}
      data-selected={selected || undefined}
      data-testid="seed-embed"
      onClick={onClick}
    >
      <div className="seed-embed-bar">
        <span className="seed-embed-link">{link}</span>
        {['Content', 'Card'].map((v) => (
          <button key={v} type="button" data-active={view === v || undefined} onClick={() => setView(v)}>
            {v}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="seed-embed-empty">Loading…</div>
      ) : !doc ? (
        <div className="seed-embed-empty">Could not load {link}</div>
      ) : view === 'Card' ? (
        <div className="seed-embed-card">
          <strong>{doc.title}</strong>
          {doc.summary ? <p>{doc.summary}</p> : null}
        </div>
      ) : (
        <div className="seed-embed-content">
          <h2>{doc.title}</h2>
          <ReadOnlyBlocks blocks={doc.content.slice(0, 8)} />
        </div>
      )}
    </div>
  )
}

/** Block type for an uploaded or dropped file, by MIME type. */
function mediaTypeOf(file: File) {
  return file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'File'
}

/** Upload through the app's `uploadFile` hook, or a local object URL when it has none. */
function useUpload() {
  const services = useSeedServices()
  return useCallback(
    (file: File) => (services.uploadFile ? services.uploadFile(file) : Promise.resolve(URL.createObjectURL(file))),
    [services],
  )
}

/** Empty Image/Video/File block: upload, drop or paste a URL to fill it. */
function MediaPlaceholder({nodeKey, type}: {nodeKey: NodeKey; type: string}) {
  const [editor] = useLexicalComposerContext()
  const upload = useUpload()
  const [url, setUrl] = useState('')
  const [state, setState] = useState<'idle' | 'dragging' | 'uploading' | 'error'>('idle')
  const fill = (link: string, attributes: Record<string, unknown> = {}) =>
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!node) return
      $setState(node, linkState, type === 'Video' ? videoEmbedUrl(link) ?? link : link)
      $setState(node, attributesState, {...$getState(node, attributesState), ...attributes})
    })
  const uploadFile = (file: File | undefined) => {
    if (!file) return
    setState('uploading')
    upload(file)
      .then((link) => fill(link, {name: file.name}))
      .catch(() => setState('error'))
  }
  const accept = type === 'Image' ? 'image/*' : type === 'Video' ? 'video/*' : undefined
  return (
    <div
      className="seed-media-placeholder"
      data-state={state}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return
        e.preventDefault()
        e.stopPropagation()
        setState('dragging')
      }}
      onDragLeave={() => setState((s) => (s === 'dragging' ? 'idle' : s))}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return
        e.preventDefault()
        e.stopPropagation()
        uploadFile(e.dataTransfer.files[0])
      }}
    >
      <label className="seed-media-upload">
        {state === 'uploading' ? 'Uploading…' : `Upload ${type.toLowerCase()}`}
        <input type="file" accept={accept} hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (url.trim()) fill(url.trim())
        }}
      >
        <input
          aria-label={`${type} URL`}
          placeholder={type === 'Video' ? 'Paste a video, YouTube or Vimeo URL' : `Paste ${type.toLowerCase()} URL`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onPaste={(e) => e.stopPropagation()}
        />
        <button type="submit">Embed</button>
      </form>
      {state === 'error' ? <span className="seed-media-error">Upload failed</span> : null}
    </div>
  )
}

function MediaView(props: {
  nodeKey: NodeKey
  type: string
  link: string
  text: string
  attributes: Record<string, any>
}) {
  const services = useSeedServices()
  const {selected, onClick} = useSelectable(props.nodeKey)
  const {type, link, text, attributes} = props
  const width = typeof attributes.width === 'number' ? {width: attributes.width} : undefined
  let body
  if (!link && ['Image', 'Video', 'File'].includes(type))
    body = <MediaPlaceholder nodeKey={props.nodeKey} type={type} />
  else if (type === 'Image')
    body = (
      <figure style={width}>
        <img src={services.fileUrl(link, 'image')} alt={text || attributes.name || ''} />
        {text || attributes.name ? <figcaption>{text || attributes.name}</figcaption> : null}
      </figure>
    )
  else if (type === 'Video')
    body = (
      <figure style={width}>
        {isVideoPlayerLink(link) ? (
          <iframe
            src={link}
            title={attributes.name || 'Video'}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={services.fileUrl(link, 'video')}
            controls
            playsInline
            autoPlay={!!attributes.autoplay}
            loop={!!attributes.loop}
            muted={!!attributes.muted}
          />
        )}
        {text ? <figcaption>{text}</figcaption> : null}
      </figure>
    )
  else if (type === 'File')
    body = (
      <a href={services.fileUrl(link, 'file')} target="_blank" rel="noreferrer">
        📎 {attributes.name || link}
      </a>
    )
  else if (type === 'Button') body = <span className="seed-button">{text || attributes.name || 'Button'}</span>
  else if (type === 'Query')
    body = (
      <span>
        Query · {attributes.style ?? 'List'} · {JSON.stringify(attributes.query?.includes ?? [])}
      </span>
    )
  else body = <a href={link}>{link}</a>
  return (
    <div className={`seed-atom seed-atom-${type}`} data-selected={selected || undefined} onClick={onClick}>
      {body}
    </div>
  )
}

/**
 * Dropping or pasting image, video or other files into the editor uploads
 * them through `uploadFile` and inserts Image / Video / File blocks at the
 * drop point (or after the selected block).
 */
export function SeedMediaDropPlugin() {
  const [editor] = useLexicalComposerContext()
  const upload = useUpload()
  useEffect(() => {
    const insertFiles = (files: File[], blockKey: NodeKey | null) => {
      for (const file of files.reverse())
        upload(file).then((link) =>
          editor.update(() => {
            const node = blockKey ? $getNodeByKey(blockKey) : null
            const block = $isSeedBlockNode(node) ? node : $selectedBlock()
            $insertBlockContent($createSeedAtom(mediaTypeOf(file), link, {name: file.name}), block)
          }),
        )
    }
    const blockKeyAt = (target: EventTarget | null) => {
      const node = target instanceof Node ? $getNearestNodeFromDOMNode(target) : null
      return ($nearestBlock(node) ?? $selectedBlock())?.getKey() ?? null
    }
    return mergeRegister(
      editor.registerCommand(
        DRAGOVER_COMMAND,
        (e) => {
          if (!e.dataTransfer?.types.includes('Files')) return false
          e.preventDefault()
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        DROP_COMMAND,
        (e) => {
          const files = [...(e.dataTransfer?.files ?? [])]
          if (!files.length) return false
          e.preventDefault()
          insertFiles(files, blockKeyAt(e.target))
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (e) => {
          const files = 'clipboardData' in e ? [...(e.clipboardData?.files ?? [])] : []
          if (!files.length) return false
          e.preventDefault()
          insertFiles(files, $selectedBlock()?.getKey() ?? null)
          return true
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, upload])
  return null
}

function MathView({nodeKey, text}: {nodeKey: NodeKey; text: string}) {
  const [editor] = useLexicalComposerContext()
  const {selected, onClick} = useSelectable(nodeKey)
  const [editing, setEditing] = useState(!text)
  const html = useMemo(() => {
    try {
      return katex.renderToString(text || '\\text{Empty math}', {displayMode: true, throwOnError: false})
    } catch {
      return text
    }
  }, [text])
  const setText = (value: string) =>
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) $setState(node, textState, value)
    })
  return (
    <div
      className="seed-math"
      data-selected={selected || undefined}
      onClick={onClick}
      onDoubleClick={() => setEditing(true)}
    >
      <div dangerouslySetInnerHTML={{__html: html}} />
      {editing || selected ? (
        <textarea
          aria-label="LaTeX"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      ) : null}
    </div>
  )
}

function MentionView({link}: {link: string}) {
  const {doc} = useDocument(link)
  const isAccount = !link.replace('hm://', '').includes('/')
  return (
    <span className="seed-mention" data-hm-mention={link} title={link}>
      {isAccount ? '@' : ''}
      {doc?.title || link.replace('hm://', '').slice(0, 12)}
    </span>
  )
}

/** Install the React renderers for Seed decorator nodes. */
export function installSeedDecorators() {
  decoratorRenderers.atom = (node: SeedAtomNode) => {
    const type = $getState(node, hmTypeState)
    const props = {
      nodeKey: node.getKey(),
      link: $getState(node, linkState),
      text: $getState(node, textState),
      attributes: $getState(node, attributesState),
    }
    return type === 'Embed' ? <EmbedView {...props} /> : <MediaView {...props} type={type} />
  }
  decoratorRenderers.math = (node: SeedMathNode) => (
    <MathView nodeKey={node.getKey()} text={$getState(node, textState)} />
  )
  decoratorRenderers.mention = (node: SeedMentionNode) => <MentionView link={$getState(node, linkState)} />
}
