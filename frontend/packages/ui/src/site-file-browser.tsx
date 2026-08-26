import * as stylex from '@stylexjs/stylex'
import type {HMDocumentInfo, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {getMetadataName} from '@shm/shared'
import {useDirectory} from '@shm/shared/models/entity'
import {
  buildDocumentTree,
  filterDocumentsByTitle,
  flattenTree,
  getAncestorPathKeys,
} from '@shm/shared/utils/all-documents-tree'
import {ChevronDown, ChevronRight, Lock, Search} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {Button} from './button'
import {Input} from './components/input'
import {ScrollArea} from './components/scroll-area'
import {Spinner} from './spinner'
import {cn} from './utils'

/** Props for the shared site document browser. */
const styles = stylex.create({
  s898dc4ca: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s3484a8: {
    paddingLeft: 'calc(0.25rem * 9)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s3e98fb7e: {
    display: 'flex',
    height: 'calc(0.25rem * 24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sb8ea20d3: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    padding: 'calc(0.25rem * 6)',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s6364a2ad: {
    color: 'var(--muted-foreground)',
    padding: 'calc(0.25rem * 6)',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  se181db62: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    flexShrink: '0',
  },
  s4a58805: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flexShrink: '0',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
export interface SiteFileBrowserProps {
  siteId: UnpackedHypermediaId
  activeDocumentId: UnpackedHypermediaId | null
  onNavigate: (id: UnpackedHypermediaId) => void
  onPrefetch?: (id: UnpackedHypermediaId) => void
}
function titleOf(doc: HMDocumentInfo) {
  return getMetadataName(doc.metadata) || doc.path?.at(-1) || 'Untitled'
}

/** Renders the searchable, expandable document hierarchy for a site. */
export function SiteFileBrowser({siteId, activeDocumentId, onNavigate, onPrefetch}: SiteFileBrowserProps) {
  const directory = useDirectory(siteId, {
    mode: 'AllDescendants',
  })
  const [query, setQuery] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  useEffect(() => {
    const activeAncestors = getAncestorPathKeys(activeDocumentId?.path)
    if (!activeAncestors.length) return
    setExpandedPaths((current) => new Set(Array.from(current).concat(activeAncestors)))
  }, [activeDocumentId?.id])
  const documents = directory.data ?? []
  const tree = useMemo(() => buildDocumentTree(documents), [documents])
  const rows = useMemo(() => flattenTree(tree, expandedPaths), [expandedPaths, tree])
  const matches = useMemo(() => filterDocumentsByTitle(documents, query), [documents, query])
  const visibleDocuments = query.trim() ? matches : rows.map((row) => row.doc)
  const rowById = useMemo(() => new Map(rows.map((row) => [row.doc.id.id, row])), [rows])
  function toggle(pathKey: string) {
    setExpandedPaths((current) => {
      const next = new Set(current)
      if (next.has(pathKey)) next.delete(pathKey)
      else next.add(pathKey)
      return next
    })
  }
  return (
    <div className="dark:bg-background flex h-full min-h-0 flex-col bg-white">
      <div className={stylex.props(styles.s898dc4ca).className || ''}>
        <div className={stylex.props(styles.sdef3facc).className || ''}>
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Filter documents"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter documents…"
            className={stylex.props(styles.s3484a8).className || ''}
          />
        </div>
      </div>

      <ScrollArea className="scroll-area-full-height min-h-0 flex-1" viewportClassName="[&>div]:!block">
        <div className={stylex.props(styles.s1aa15).className || ''}>
          {directory.isLoading ? (
            <div className={stylex.props(styles.s3e98fb7e).className || ''} aria-label="Loading documents">
              <Spinner />
            </div>
          ) : directory.isError ? (
            <div className={stylex.props(styles.sb8ea20d3).className || ''}>
              <p>Couldn’t load documents.</p>
              <Button size="sm" variant="outline" onClick={() => directory.refetch()}>
                Retry
              </Button>
            </div>
          ) : visibleDocuments.length === 0 ? (
            <p className={stylex.props(styles.s6364a2ad).className || ''}>
              {query.trim() ? 'No documents found' : 'No documents to browse'}
            </p>
          ) : (
            <div role={query.trim() ? 'list' : 'tree'} aria-label="Space documents">
              {visibleDocuments.map((doc) => {
                const row = rowById.get(doc.id.id)
                const isFiltered = !!query.trim()
                const isActive = doc.id.id === activeDocumentId?.id
                const isExpanded = row ? expandedPaths.has(row.pathKey) : false
                return (
                  <div
                    key={doc.id.id}
                    role={isFiltered ? 'listitem' : 'treeitem'}
                    aria-expanded={!isFiltered && row?.hasChildren ? isExpanded : undefined}
                    style={{
                      paddingLeft: isFiltered ? 0 : (row?.depth ?? 0) * 16,
                    }}
                    className={cn(
                      'flex min-w-0 items-center rounded-md',
                      isActive && 'bg-accent text-accent-foreground',
                    )}
                  >
                    {!isFiltered && row?.hasChildren ? (
                      <button
                        type="button"
                        className="hover:bg-accent/60 focus-visible:ring-ring flex size-6 shrink-0 items-center justify-center rounded-md p-0 outline-none focus-visible:ring-2"
                        aria-label={isExpanded ? `Collapse ${titleOf(doc)}` : `Expand ${titleOf(doc)}`}
                        onClick={() => toggle(row.pathKey)}
                      >
                        {isExpanded ? (
                          <ChevronDown className={stylex.props(styles.s3269316e).className || ''} />
                        ) : (
                          <ChevronRight className={stylex.props(styles.s3269316e).className || ''} />
                        )}
                      </button>
                    ) : (
                      <span className={stylex.props(styles.se181db62).className || ''} />
                    )}
                    <button
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onPointerEnter={() => onPrefetch?.(doc.id)}
                      onFocus={() => onPrefetch?.(doc.id)}
                      onClick={() => onNavigate(doc.id)}
                      className="hover:bg-accent/60 focus-visible:ring-ring flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 text-left text-sm outline-none focus-visible:ring-2"
                    >
                      {doc.visibility === 'PRIVATE' ? (
                        <Lock aria-label="Private document" className={stylex.props(styles.s4a58805).className || ''} />
                      ) : null}
                      <span className={stylex.props(styles.s6e724d66).className || ''}>{titleOf(doc)}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
