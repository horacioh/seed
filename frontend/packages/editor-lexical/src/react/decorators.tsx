import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {$getNodeByKey, $getState, $setState, type NodeKey} from 'lexical'
import {useEffect, useMemo, useState} from 'react'
import {
  attributesState,
  decoratorRenderers,
  hmTypeState,
  linkState,
  textState,
  type SeedAtomNode,
  type SeedMathNode,
  type SeedMentionNode,
} from '../nodes'
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
  let body
  if (type === 'Image') body = <img src={services.fileUrl(link)} alt={text} width={attributes.width} />
  else if (type === 'Video') body = <video src={services.fileUrl(link)} controls />
  else if (type === 'File')
    body = (
      <a href={services.fileUrl(link)} target="_blank" rel="noreferrer">
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
      {type === 'Image' && text ? <figcaption>{text}</figcaption> : null}
    </div>
  )
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
