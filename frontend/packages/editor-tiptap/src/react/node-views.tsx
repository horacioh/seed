import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {type Extensions, Node} from '@tiptap/core'
import {NodeViewWrapper, type NodeViewProps, ReactNodeViewRenderer} from '@tiptap/react'
import {type FormEvent, useEffect, useState} from 'react'
import {normalizeVideoUrl} from '../commands'
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

function EmbedView({node, updateAttributes, selected}: NodeViewProps) {
  const link: string = node.attrs.link
  const attributes = node.attrs.attributes as Record<string, unknown>
  const view = (attributes.view as string) || 'Content'
  const {doc, loading} = useDocument(link)
  return (
    <NodeViewWrapper
      className={`seed-embed seed-embed-${view.toLowerCase()}`}
      data-selected={selected || undefined}
      contentEditable={false}
    >
      <div className="seed-embed-bar">
        <span className="seed-embed-link">{link}</span>
        {['Content', 'Card'].map((v) => (
          <button
            key={v}
            type="button"
            data-active={view === v || undefined}
            onClick={() => updateAttributes({attributes: {...attributes, view: v}})}
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
    </NodeViewWrapper>
  )
}

/** URL / upload / drop form shown by Image and Video blocks that have no link yet. */
function MediaPicker({kind, onPick}: {kind: 'image' | 'video'; onPick: (link: string, name?: string) => void}) {
  const services = useSeedServices()
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const upload = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      onPick(await services.uploadFile(file), file.name)
    } finally {
      setBusy(false)
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const link = url.trim()
    if (link) onPick(kind === 'video' ? normalizeVideoUrl(link) ?? link : link)
  }
  return (
    <div
      className="seed-media-picker"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void upload(e.dataTransfer.files[0])
      }}
    >
      <form onSubmit={submit}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={kind === 'video' ? 'Video, YouTube or Vimeo URL' : 'Image URL or ipfs:// link'}
          aria-label={`${kind} URL`}
        />
        <button type="submit">Embed</button>
        <label className="seed-upload">
          {busy ? 'Uploading…' : 'Upload'}
          <input
            type="file"
            accept={kind === 'video' ? 'video/*' : 'image/*'}
            onChange={(e) => void upload(e.target.files?.[0])}
            hidden
          />
        </label>
      </form>
      <small>…or drop a file here</small>
    </div>
  )
}

/** Whether a Video link is a YouTube/Vimeo player URL rather than a file. */
const isPlayerUrl = (link: string) =>
  link.startsWith('https://www.youtube.com/embed/') || link.startsWith('https://player.vimeo.com/video/')

function MediaView({node, selected, updateAttributes}: NodeViewProps) {
  const services = useSeedServices()
  const {link, text} = node.attrs as {link: string; text: string}
  const attributes = node.attrs.attributes as Record<string, any>
  const type = node.type.name
  const width = attributes.width ? Number(attributes.width) || undefined : undefined
  const pick = (newLink: string, name?: string) =>
    updateAttributes({link: newLink, attributes: name ? {...attributes, name} : attributes})
  let body
  if (type === ATOM_BLOCK_TYPES.Image) {
    body = link ? (
      <figure style={{width}}>
        <img src={services.fileUrl(link)} alt={text || attributes.name || ''} />
        {text || attributes.name ? <figcaption>{text || attributes.name}</figcaption> : null}
      </figure>
    ) : (
      <MediaPicker kind="image" onPick={pick} />
    )
  } else if (type === ATOM_BLOCK_TYPES.Video) {
    body = !link ? (
      <MediaPicker kind="video" onPick={pick} />
    ) : isPlayerUrl(link) ? (
      <iframe
        className="seed-video-player"
        src={link}
        style={{width: width ?? '100%'}}
        title={attributes.name || 'Video'}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    ) : (
      <video
        src={services.fileUrl(link)}
        controls
        width={width}
        autoPlay={Boolean(attributes.autoplay)}
        loop={Boolean(attributes.loop)}
        muted={Boolean(attributes.muted)}
      />
    )
  } else if (type === ATOM_BLOCK_TYPES.File) {
    body = (
      <a href={services.fileUrl(link)} target="_blank" rel="noreferrer">
        📎 {attributes.name || link}
        {attributes.size ? <small> · {attributes.size} bytes</small> : null}
      </a>
    )
  } else if (type === ATOM_BLOCK_TYPES.Button) {
    body = <span className="seed-button">{text || attributes.name || 'Button'}</span>
  } else if (type === ATOM_BLOCK_TYPES.Query) {
    body = (
      <span>
        Query · {attributes.style ?? 'List'} · {JSON.stringify(attributes.query?.includes ?? [])}
      </span>
    )
  } else {
    body = (
      <a href={link} target="_blank" rel="noreferrer">
        {link}
      </a>
    )
  }
  return (
    <NodeViewWrapper
      className={`seed-atom seed-atom-${type}`}
      data-selected={selected || undefined}
      contentEditable={false}
    >
      {body}
    </NodeViewWrapper>
  )
}

function MentionView({node}: NodeViewProps) {
  const link: string = node.attrs.link
  const {doc} = useDocument(link)
  const isAccount = node.attrs.mentionKind === 'account' || !link.replace('hm://', '').includes('/')
  return (
    <NodeViewWrapper as="span" className="seed-mention" data-hm-mention={link} title={link}>
      {isAccount ? '@' : ''}
      {doc?.title || link.replace('hm://', '').slice(0, 12)}
    </NodeViewWrapper>
  )
}

const VIEWS: Record<string, {component: (props: NodeViewProps) => JSX.Element; as?: string}> = {
  [ATOM_BLOCK_TYPES.Embed]: {component: EmbedView},
  hmMention: {component: MentionView, as: 'span'},
  ...Object.fromEntries(
    Object.values(ATOM_BLOCK_TYPES)
      .filter((name) => name !== ATOM_BLOCK_TYPES.Embed)
      .map((name) => [name, {component: MediaView}]),
  ),
}

/** Attach the Seed React node views to the schema extensions that have one. */
export function withSeedNodeViews(extensions: Extensions): Extensions {
  return extensions.map((ext) => {
    const view = VIEWS[ext.name]
    if (!view || !(ext instanceof Node)) return ext
    return ext.extend({addNodeView: () => ReactNodeViewRenderer(view.component, {as: view.as})})
  })
}
