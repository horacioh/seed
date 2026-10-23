import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {NodeViewConstructor} from 'prosemirror-view'
import {type ComponentType, type FormEvent, useEffect, useState} from 'react'
import {isIframeVideo, videoEmbedUrl} from '../media'
import {ATOM_BLOCK_TYPES} from '../schema'
import type {ReactNodeViewProps} from './SeedProseMirrorEditor'
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
            <img src={services.fileUrl(b.link)} alt={b.text} />
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

function EmbedView({node, setAttrs, selected}: ReactNodeViewProps) {
  const link: string = node.attrs.link
  const attributes = node.attrs.attributes as Record<string, unknown>
  const view = (attributes.view as string) || 'Content'
  const {doc, loading} = useDocument(link)
  return (
    <div className={`seed-embed seed-embed-${view.toLowerCase()}`} data-selected={selected || undefined}>
      <div className="seed-embed-bar">
        <span className="seed-embed-link">{link}</span>
        {['Content', 'Card'].map((v) => (
          <button
            key={v}
            type="button"
            data-active={view === v || undefined}
            onClick={() => setAttrs({attributes: {...attributes, view: v}})}
          >
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

/** Empty Image/Video block: pick a URL, upload a file or drop one. */
function MediaPicker({kind, onLink}: {kind: 'image' | 'video'; onLink: (link: string) => void}) {
  const services = useSeedServices()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const upload = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith(`${kind}/`)) return setError(`Not a ${kind} file: ${file.name}`)
    services.uploadFile(file).then(onLink, (e) => setError(String(e)))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = url.trim()
    if (!/^(https?|ipfs):\/\//.test(value)) return setError('Enter an http(s):// or ipfs:// URL')
    if (kind === 'video' && /^https?:/.test(value) && /youtu|vimeo/.test(value)) {
      const embed = videoEmbedUrl(value)
      if (!embed) return setError(`Unsupported YouTube URL: ${value}`)
      return onLink(embed)
    }
    onLink(value)
  }
  return (
    <div
      className="seed-media-picker"
      data-stop-event
      data-dragging={dragging || undefined}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        upload(e.dataTransfer.files[0])
      }}
    >
      <form onSubmit={submit}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={kind === 'image' ? 'Image URL or ipfs://…' : 'Video, YouTube or Vimeo URL'}
          aria-label={`${kind} URL`}
        />
        <button type="submit">Embed</button>
        <label className="seed-media-upload">
          Upload
          <input type="file" accept={`${kind}/*`} hidden onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </form>
      <small>{error ?? `…or drop a${kind === 'image' ? 'n image' : ' video'} file here`}</small>
    </div>
  )
}

function widthStyle(width: unknown) {
  const n = Number(width)
  return Number.isFinite(n) && n > 0 ? {width: `${n}px`, maxWidth: '100%'} : undefined
}

function MediaView({node, selected, setAttrs}: ReactNodeViewProps) {
  const services = useSeedServices()
  const {link, text} = node.attrs as {link: string; text: string}
  const attributes = node.attrs.attributes as Record<string, any>
  const type = node.type.name
  let body
  if ((type === ATOM_BLOCK_TYPES.Image || type === ATOM_BLOCK_TYPES.Video) && !link) {
    body = (
      <MediaPicker kind={type === ATOM_BLOCK_TYPES.Image ? 'image' : 'video'} onLink={(l) => setAttrs({link: l})} />
    )
  } else if (type === ATOM_BLOCK_TYPES.Image) {
    body = (
      <figure>
        <img src={services.fileUrl(link)} alt={text || attributes.name || ''} style={widthStyle(attributes.width)} />
        {text || attributes.name ? <figcaption>{text || attributes.name}</figcaption> : null}
      </figure>
    )
  } else if (type === ATOM_BLOCK_TYPES.Video) {
    body = (
      <figure>
        {isIframeVideo(link) ? (
          <iframe
            src={link}
            title={attributes.name || 'Embedded video'}
            style={widthStyle(attributes.width)}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={services.fileUrl(link)}
            controls
            autoPlay={Boolean(attributes.autoplay)}
            loop={Boolean(attributes.loop)}
            muted={Boolean(attributes.muted)}
            playsInline
            style={widthStyle(attributes.width)}
          />
        )}
        {attributes.name ? <figcaption>{attributes.name}</figcaption> : null}
      </figure>
    )
  } else if (type === ATOM_BLOCK_TYPES.File)
    body = (
      <a href={services.fileUrl(link)} target="_blank" rel="noreferrer">
        📎 {attributes.name || link}
        {attributes.size ? <small> · {Math.round(Number(attributes.size) / 1024)} KB</small> : null}
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
  else
    body = (
      <a href={link} target="_blank" rel="noreferrer">
        {type === ATOM_BLOCK_TYPES.WebEmbed ? '🌐 ' : ''}
        {link}
      </a>
    )
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

/** React node views by ProseMirror node name. */
export const reactNodeViews: Record<string, ComponentType<ReactNodeViewProps>> = {
  [ATOM_BLOCK_TYPES.Embed]: EmbedView,
  ...Object.fromEntries(
    Object.values(ATOM_BLOCK_TYPES)
      .filter((name) => name !== ATOM_BLOCK_TYPES.Embed)
      .map((name) => [name, MediaView]),
  ),
  hmMention: MentionView,
}

let katexPromise: Promise<typeof import('katex').default> | undefined
function loadKatex() {
  katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([m]) => m.default)
  return katexPromise
}

/** Math block: editable TeX source with a live KaTeX preview below it (plain DOM node view). */
export const mathNodeView: NodeViewConstructor = (initialNode) => {
  const dom = document.createElement('div')
  dom.className = 'seed-math-block'
  const contentDOM = document.createElement('pre')
  contentDOM.className = 'seed-math'
  const preview = document.createElement('div')
  preview.className = 'seed-math-preview'
  preview.contentEditable = 'false'
  dom.append(contentDOM, preview)
  let latest = ''
  // KaTeX is loaded on first use, so documents without math don't pay for it.
  const render = (tex: string) => {
    latest = tex
    if (!tex) return void (preview.innerHTML = '')
    void loadKatex().then((katex) => {
      if (latest === tex) preview.innerHTML = katex.renderToString(tex, {throwOnError: false, displayMode: true})
    })
  }
  render(initialNode.textContent)
  return {
    dom,
    contentDOM,
    update(node) {
      if (node.type !== initialNode.type) return false
      render(node.textContent)
      return true
    },
    ignoreMutation: (m) => preview.contains(m.target),
  }
}
