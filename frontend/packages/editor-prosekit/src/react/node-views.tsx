import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {union} from 'prosekit/core'
import {defineReactNodeView, type ReactNodeViewProps} from 'prosekit/react'
import {isIpfsUrl, useFileProxyUrl, useImageUrl} from '@shm/ui/get-file-url'
import {type FormEvent, useEffect, useState} from 'react'
import {isVideoPlayerLink, videoEmbedLink, videoIframeSrc} from '@seed-hypermedia/client/editor/media'
import {ATOM_BLOCK_TYPES} from '../schema'
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

/** Resolve a media link like the BlockNote editor: `ipfs://` through the app's gateway, other URLs as-is. */
function useMediaUrl() {
  const imageUrl = useImageUrl()
  const fileUrl = useFileProxyUrl()
  return (link: string, kind: 'image' | 'file') =>
    !isIpfsUrl(link) ? link : kind === 'image' ? imageUrl(link) : fileUrl(link)
}

/** Read-only rendering of HM blocks, used inside `Embed` blocks. */
function ReadOnlyBlocks({blocks, childrenType}: {blocks: HMBlockNode[]; childrenType?: string}) {
  const mediaUrl = useMediaUrl()
  const Tag = childrenType === 'Ordered' ? 'ol' : childrenType === 'Unordered' ? 'ul' : 'div'
  return (
    <Tag className={childrenType === 'Blockquote' ? 'seed-ro-quote' : 'seed-ro-group'}>
      {blocks.map(({block, children}) => {
        const b = block as Record<string, any>
        const inner =
          b.type === 'Heading' ? (
            <h3>{b.text}</h3>
          ) : b.type === 'Image' ? (
            <img src={mediaUrl(b.link, 'image')} alt={b.text} />
          ) : b.text ? (
            <p>{String(b.text).replaceAll('\uFFFC', '•')}</p>
          ) : null
        const nested = children?.length ? (
          <ReadOnlyBlocks blocks={children} childrenType={b.attributes?.childrenType} />
        ) : null
        return Tag === 'div' ? (
          <div key={b.id}>
            {inner}
            {nested}
          </div>
        ) : (
          <li key={b.id}>
            {inner}
            {nested}
          </li>
        )
      })}
    </Tag>
  )
}

function EmbedView({node, setAttrs, selected}: ReactNodeViewProps) {
  const link: string = node.attrs.link
  const attributes = node.attrs.attributes as Record<string, unknown>
  const view = (attributes.view as string) || 'Content'
  const {doc, loading} = useDocument(link)
  const setView = (v: string) => setAttrs({attributes: {...attributes, view: v}})
  return (
    <div
      className={`seed-embed seed-embed-${view.toLowerCase()}`}
      data-selected={selected || undefined}
      contentEditable={false}
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

/** Empty media block: paste a URL, or upload / drop a file through `services.uploadFile`. */
function MediaPicker({kind, onPick}: {kind: 'image' | 'video'; onPick: (link: string, name?: string) => void}) {
  const services = useSeedServices()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const upload = (file?: File) => {
    if (!file || !services.uploadFile) return
    if (!file.type.startsWith(`${kind}/`)) {
      setError(kind === 'image' ? 'That file is not an image.' : 'That file is not a video.')
      return
    }
    setBusy(true)
    setError(null)
    services
      .uploadFile(file)
      .then((link) => onPick(link, file.name))
      .catch((e) => setError(`Upload failed: ${e}`))
      .finally(() => setBusy(false))
  }
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = String(new FormData(e.currentTarget).get('link') ?? '').trim()
    if (!/^(https?|ipfs):\/\//.test(value)) {
      setError('Enter an http(s) or ipfs:// link.')
      return
    }
    onPick(kind === 'video' ? videoEmbedLink(value) ?? value : value)
  }
  return (
    <div
      className="seed-media-picker"
      data-media-controls
      data-dragover={over || undefined}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        upload(e.dataTransfer.files[0])
      }}
    >
      <form onSubmit={submit}>
        <input
          name="link"
          placeholder={kind === 'image' ? 'Image URL or ipfs:// link' : 'YouTube, Vimeo, video URL or ipfs:// link'}
          aria-label={kind === 'image' ? 'Image link' : 'Video link'}
        />
        <button type="submit">Embed</button>
        {services.uploadFile ? (
          <label className="seed-media-upload">
            {busy ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept={`${kind}/*`}
              hidden
              disabled={busy}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
        ) : null}
      </form>
      <small>
        {error ?? (services.uploadFile ? `Or drop ${kind === 'image' ? 'an image' : 'a video'} here` : null)}
      </small>
    </div>
  )
}

/** Width, caption and playback settings for the selected image or video. */
function MediaSettings({node, setAttrs}: Pick<ReactNodeViewProps, 'node' | 'setAttrs'>) {
  const attributes = node.attrs.attributes as Record<string, unknown>
  const isVideo = node.type.name === ATOM_BLOCK_TYPES.Video
  const setAttribute = (key: string, value: unknown) => {
    const {[key]: _old, ...rest} = attributes
    setAttrs({attributes: value === undefined ? rest : {...rest, [key]: value}})
  }
  return (
    <div className="seed-media-settings" data-media-controls>
      <label>
        Width
        <input
          type="number"
          min={64}
          step={10}
          placeholder="auto"
          value={attributes.width == null ? '' : String(attributes.width)}
          onChange={(e) => setAttribute('width', e.target.value ? Number(e.target.value) : undefined)}
        />
      </label>
      {isVideo ? (
        (['autoplay', 'loop', 'muted'] as const).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={Boolean(attributes[key])}
              onChange={(e) => setAttribute(key, e.target.checked || undefined)}
            />
            {key}
          </label>
        ))
      ) : (
        <input
          className="seed-media-caption"
          value={node.attrs.text}
          placeholder="Caption"
          aria-label="Caption"
          onChange={(e) => setAttrs({text: e.target.value})}
        />
      )}
      <button type="button" onClick={() => setAttrs({link: ''})}>
        Replace
      </button>
    </div>
  )
}

function ImageOrVideoView({node, setAttrs, selected}: ReactNodeViewProps) {
  const mediaUrl = useMediaUrl()
  const {link, text} = node.attrs as {link: string; text: string}
  const attributes = node.attrs.attributes as Record<string, any>
  const kind = node.type.name === ATOM_BLOCK_TYPES.Image ? 'image' : 'video'
  if (!link) {
    return (
      <div className={`seed-atom seed-media seed-media-${kind}`} contentEditable={false}>
        <MediaPicker
          kind={kind}
          onPick={(newLink, name) => setAttrs({link: newLink, attributes: name ? {...attributes, name} : attributes})}
        />
      </div>
    )
  }
  const style = attributes.width ? {width: `${attributes.width}px`} : undefined
  let body
  if (kind === 'image') body = <img src={mediaUrl(link, 'image')} alt={text || attributes.name || ''} style={style} />
  else if (isVideoPlayerLink(link))
    body = (
      <div className="seed-video-frame" style={style}>
        <iframe
          src={videoIframeSrc(link)}
          title="Embedded video player"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          // Clicks select the block; once selected, the player takes them.
          style={{pointerEvents: selected ? 'auto' : 'none'}}
        />
      </div>
    )
  else
    body = (
      <video
        key={link}
        src={mediaUrl(link, 'file')}
        controls
        playsInline
        preload="metadata"
        autoPlay={Boolean(attributes.autoplay)}
        loop={Boolean(attributes.loop)}
        muted={Boolean(attributes.muted)}
        style={style}
      />
    )
  const caption = kind === 'image' ? text || attributes.name : null
  return (
    <figure
      className={`seed-atom seed-media seed-media-${kind}`}
      data-selected={selected || undefined}
      contentEditable={false}
    >
      {body}
      {caption ? <figcaption>{caption}</figcaption> : null}
      {selected ? <MediaSettings node={node} setAttrs={setAttrs} /> : null}
    </figure>
  )
}

function MediaView({node, selected}: ReactNodeViewProps) {
  const mediaUrl = useMediaUrl()
  const {link, text} = node.attrs as {link: string; text: string}
  const attributes = node.attrs.attributes as Record<string, any>
  const type = node.type.name
  let body
  if (type === ATOM_BLOCK_TYPES.File)
    body = (
      <a href={mediaUrl(link, 'file')} target="_blank" rel="noreferrer">
        📎 {attributes.name || link}
      </a>
    )
  else if (type === ATOM_BLOCK_TYPES.Button)
    body = <span className="seed-button">{text || attributes.name || 'Button'}</span>
  else if (type === ATOM_BLOCK_TYPES.Query)
    body = (
      <span>
        Query · {attributes.style ?? 'List'} · {JSON.stringify(attributes.query?.includes ?? [])}
      </span>
    )
  else body = <a href={link}>{link}</a>
  return (
    <div className={`seed-atom seed-atom-${type}`} data-selected={selected || undefined} contentEditable={false}>
      {body}
    </div>
  )
}

function MentionView({node}: ReactNodeViewProps) {
  const link: string = node.attrs.link
  const {doc} = useDocument(link)
  const isAccount = node.attrs.mentionKind === 'account' || !link.replace('hm://', '').includes('/')
  return (
    <span className="seed-mention" data-hm-mention={link} title={link}>
      {isAccount ? '@' : ''}
      {doc?.title || link.replace('hm://', '').slice(0, 12)}
    </span>
  )
}

const CUSTOM_VIEWS = [ATOM_BLOCK_TYPES.Embed, ATOM_BLOCK_TYPES.Image, ATOM_BLOCK_TYPES.Video] as const

/** React node views for Seed blocks and inline mentions. */
export function defineSeedNodeViews() {
  return union(
    defineReactNodeView({name: ATOM_BLOCK_TYPES.Embed, component: EmbedView, as: 'div'}),
    ...[ATOM_BLOCK_TYPES.Image, ATOM_BLOCK_TYPES.Video].map((name) =>
      defineReactNodeView({
        name,
        component: ImageOrVideoView,
        as: 'div',
        // Inputs and drops inside the media controls belong to React, not ProseMirror.
        stopEvent: (event) => event.target instanceof Element && !!event.target.closest('[data-media-controls]'),
      }),
    ),
    ...Object.values(ATOM_BLOCK_TYPES)
      .filter((name) => !(CUSTOM_VIEWS as readonly string[]).includes(name))
      .map((name) => defineReactNodeView({name, component: MediaView, as: 'div'})),
    defineReactNodeView({name: 'hmMention', component: MentionView, as: 'span'}),
  )
}
