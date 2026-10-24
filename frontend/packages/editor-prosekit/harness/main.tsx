import {createSeedClient} from '@seed-hypermedia/client'
import {hmDocumentOperations} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {unpackHmId} from '@seed-hypermedia/client/hm-types'
import {rankMentionCandidates} from '@shm/shared/models/mention-ranking'
import {TextSelection} from 'prosekit/pm/state'
import {StrictMode, useEffect, useMemo, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {SeedProseKitEditor} from '../src/react/SeedProseKitEditor'
import type {EmbeddedDocument, SeedEditorServices} from '../src/react/services'
import './harness.css'

const params = new URLSearchParams(location.search)
const SITE = params.get('site') || 'https://seed.horacioh.com'
const DEFAULT_DOC = 'hm://z6Mkvz9TgGtv9zsGsdrksfNk1ajbFancgHREJEz3Y2HsAVdk'
const client = createSeedClient(SITE)

/** Raw `Resource` JSON, unparsed, so unknown fields reach the editor untouched. */
async function fetchResource(link: string): Promise<any> {
  const res = await fetch(`${SITE}/api/Resource?id=${encodeURIComponent(link)}`)
  const body = await res.json()
  return body.json ?? body
}

const documentCache = new Map<string, Promise<EmbeddedDocument | null>>()

const services: SeedEditorServices = {
  async searchMentions(query, kind, signal) {
    const candidates = await client.request('MentionCandidates', {query, mode: kind}, {signal}).catch((e) => {
      console.error('MentionCandidates failed', e)
      throw e
    })
    return rankMentionCandidates(candidates, query, []).map((c) => ({
      link: kind === 'account' || !c.id.path?.length ? `hm://${c.id.uid}` : `hm://${c.id.uid}/${c.id.path.join('/')}`,
      title: c.title,
      subtitle: kind === 'account' ? c.id.uid.slice(0, 16) + '…' : c.parentNames.join(' / ') || c.id.uid.slice(0, 16),
      kind,
    }))
  },
  loadDocument(link) {
    const id = unpackHmId(link)
    const key = id ? `hm://${id.uid}${id.path?.length ? '/' + id.path.join('/') : ''}` : link
    if (!documentCache.has(key)) {
      documentCache.set(
        key,
        fetchResource(key).then((r) =>
          r?.type === 'document'
            ? {
                title: r.document.metadata?.name || key,
                summary: r.document.metadata?.summary,
                content: r.document.content,
              }
            : null,
        ),
      )
    }
    return documentCache.get(key)!
  },
  fileUrl: (link) => (link.startsWith('ipfs://') ? `${SITE}/ipfs/${link.slice(7)}` : link),
}

function Harness() {
  const [docId, setDocId] = useState(params.get('id') || DEFAULT_DOC)
  const [input, setInput] = useState(docId)
  const [published, setPublished] = useState<{content: HMBlockNode[]; title: string} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [edited, setEdited] = useState<HMBlockNode[] | null>(null)
  const [tab, setTab] = useState<'ops' | 'blocks'>('ops')

  useEffect(() => {
    setPublished(null)
    setEdited(null)
    setError(null)
    fetchResource(docId)
      .then((r) => {
        if (r?.type !== 'document') throw new Error(`Not a document: ${r?.type}`)
        setPublished({content: r.document.content, title: r.document.metadata?.name || docId})
      })
      .catch((e) => setError(String(e)))
  }, [docId])

  const current = edited ?? published?.content ?? []
  const ops = useMemo(() => (published ? hmDocumentOperations(published.content, current) : []), [published, current])
  useEffect(() => {
    ;(window as any).SEED_PROSEKIT = {published: published?.content, edited: current, ops}
  }, [published, current, ops])

  return (
    <div className="harness">
      <header>
        <strong>Seed × ProseKit</strong>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const url = new URL(location.href)
            url.searchParams.set('id', input)
            history.replaceState(null, '', url)
            setDocId(input)
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Document hm:// id" />
          <button type="submit">Load</button>
        </form>
        <span className="harness-site">{SITE}</span>
      </header>
      <main>
        <section className="harness-editor">
          {error ? <p className="harness-error">{error}</p> : null}
          {published ? (
            <>
              <h1 className="harness-title">{published.title}</h1>
              <SeedProseKitEditor
                key={docId}
                initialContent={published.content}
                onChange={setEdited}
                services={services}
                onEditor={(editor) =>
                  Object.assign(window, {SEED_PROSEKIT_EDITOR: editor, SEED_TEXT_SELECTION: TextSelection})
                }
              />
            </>
          ) : !error ? (
            <p>Loading {docId}…</p>
          ) : null}
        </section>
        <aside className="harness-panel">
          <div className="harness-tabs">
            <button type="button" data-active={tab === 'ops' || undefined} onClick={() => setTab('ops')}>
              Change ops ({ops.length})
            </button>
            <button type="button" data-active={tab === 'blocks' || undefined} onClick={() => setTab('blocks')}>
              HM blocks
            </button>
          </div>
          <pre data-testid={tab === 'ops' ? 'change-ops' : 'hm-blocks'}>
            {tab === 'ops'
              ? ops.length
                ? JSON.stringify(ops, null, 2)
                : 'No changes: the document round-trips untouched.'
              : JSON.stringify(current, null, 2)}
          </pre>
        </aside>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
