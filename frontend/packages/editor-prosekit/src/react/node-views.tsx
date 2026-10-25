import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {union} from 'prosekit/core'
import {defineReactNodeView, type ReactNodeViewProps} from 'prosekit/react'
import {useEffect, useState} from 'react'
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

function MediaView({node, selected}: ReactNodeViewProps) {
  const services = useSeedServices()
  const {link, text} = node.attrs as {link: string; text: string}
  const attributes = node.attrs.attributes as Record<string, any>
  const type = node.type.name
  let body
  if (type === ATOM_BLOCK_TYPES.Image) body = <img src={services.fileUrl(link)} alt={text} width={attributes.width} />
  else if (type === ATOM_BLOCK_TYPES.Video) body = <video src={services.fileUrl(link)} controls />
  else if (type === ATOM_BLOCK_TYPES.File)
    body = (
      <a href={services.fileUrl(link)} target="_blank" rel="noreferrer">
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
      {type === ATOM_BLOCK_TYPES.Image && text ? <figcaption>{text}</figcaption> : null}
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

/** React node views for Seed blocks and inline mentions. */
export function defineSeedNodeViews() {
  return union(
    defineReactNodeView({name: ATOM_BLOCK_TYPES.Embed, component: EmbedView, as: 'div'}),
    ...Object.values(ATOM_BLOCK_TYPES)
      .filter((name) => name !== ATOM_BLOCK_TYPES.Embed)
      .map((name) => defineReactNodeView({name, component: MediaView, as: 'div'})),
    defineReactNodeView({name: 'hmMention', component: MentionView, as: 'span'}),
  )
}
