import * as stylex from '@stylexjs/stylex'
import type {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {createInspectIpfsNavRoute, createInspectNavRoute} from '@shm/shared'
import {useRouteLink} from '@shm/shared/routing'
import {GitBranch, GitCommitHorizontal, GitMerge, GitPullRequestArrow, LinkIcon} from 'lucide-react'
import type {CSSProperties, ReactNode} from 'react'
import {useEffect, useMemo, useState} from 'react'
import {Button} from './button'
import {
  buildDocumentVersionGraph,
  type DocumentVersionGraphChange,
  type DocumentVersionGraphNode,
} from './document-version-graph'
import {cn} from './utils'
const styles = stylex.create({
  sebebaf11: {
    color: 'var(--muted-foreground)',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 4)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s554ced5: {
    color: 'var(--muted-foreground)',
    pointerEvents: 'none',
    position: 'absolute',
    top: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    zIndex: '20',
  },
  sc2826582: {
    fill: 'none',
    stroke: 'currentcolor',
  },
  s4430632f: {
    fill: 'currentcolor',
  },
  s7a8ff926: {
    position: 'relative',
    zIndex: '10',
  },
  s3114908f: {
    color: 'var(--foreground)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  s13474966: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-xs)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s584ecc35: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
  },
  s6528b98e: {
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  s69d240f5: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    wordBreak: 'break-all',
  },
  s5251db24: {
    marginTop: 'calc(0.25rem * 4)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  s461e02e7: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 24)',
    flexShrink: '0',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
  s2dbc2df2: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--muted-foreground)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 0.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    letterSpacing: '0.025em',
    textTransform: 'uppercase',
  },
})
const ROW_HEIGHT = 62
const LANE_WIDTH = 30
const GRAPH_LEFT_PADDING = 22
const GRAPH_TOP_PADDING = 30
const DETAIL_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Renders a Git-tree-style dependency graph for document versions. */
export function DocumentVersionGraphView({
  changes,
  latestVersion,
  docId,
}: {
  changes: DocumentVersionGraphChange[] | undefined
  latestVersion?: string | null
  docId: UnpackedHypermediaId
}) {
  const graph = useMemo(
    () =>
      buildDocumentVersionGraph({
        changes,
        latestVersion,
      }),
    [changes, latestVersion],
  )
  const [selectedId, setSelectedId] = useState<string | null>(graph.heads[0] || graph.nodes[0]?.id || null)
  const selectedNode = selectedId ? graph.nodesById[selectedId] || null : null
  const graphWidth = Math.max(96, GRAPH_LEFT_PADDING * 2 + (graph.maxLane + 1) * LANE_WIDTH)
  const graphHeight = Math.max(120, graph.nodes.length * ROW_HEIGHT + GRAPH_TOP_PADDING)
  useEffect(() => {
    if (selectedId && graph.nodesById[selectedId]) return
    setSelectedId(graph.heads[0] || graph.nodes[0]?.id || null)
  }, [graph, selectedId])
  if (!graph.nodes.length) {
    return <div className={stylex.props(styles.sebebaf11).className || ''}>No changes found.</div>
  }
  return (
    <div className="flex min-h-0 flex-col gap-4 xl:flex-row">
      <div className="border-border bg-background min-w-0 flex-1 overflow-auto rounded-xl border shadow-xs">
        <div
          className={stylex.props(styles.sdef3facc).className || ''}
          style={{
            height: graphHeight,
            minWidth: 680,
          }}
        >
          <svg
            className={stylex.props(styles.s554ced5).className || ''}
            width={graphWidth}
            height={graphHeight}
            aria-hidden="true"
          >
            {graph.edges.map((edge) => {
              const from = graph.nodesById[edge.from]
              const to = graph.nodesById[edge.to]
              if (!from || !to) return null
              return (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={edgePath(from, to)}
                  className={cn(
                    stylex.props(styles.sc2826582).className || '',
                    selectedNode && (selectedNode.id === from.id || selectedNode.id === to.id)
                      ? 'text-foreground'
                      : 'text-muted-foreground/35',
                  )}
                  strokeWidth={selectedNode && (selectedNode.id === from.id || selectedNode.id === to.id) ? 2.5 : 1.75}
                  strokeLinecap="round"
                />
              )
            })}
            {graph.nodes.map((node) => (
              <g
                key={node.id}
                className={cn(
                  selectedNode?.id === node.id ? 'text-foreground' : laneColorClass(node.lane),
                  node.isMissing && 'text-muted-foreground',
                )}
              >
                <circle
                  cx={nodeX(node)}
                  cy={nodeY(node)}
                  r={node.isMerge ? 7 : 6}
                  className={cn(
                    stylex.props(styles.s4430632f).className || '',
                    selectedNode?.id === node.id && 'stroke-background',
                    node.isMissing && 'fill-background stroke-current',
                  )}
                  strokeWidth={node.isMissing ? 2 : selectedNode?.id === node.id ? 3 : 0}
                />
                {node.isHead ? (
                  <circle
                    cx={nodeX(node)}
                    cy={nodeY(node)}
                    r={12}
                    className={stylex.props(styles.sc2826582).className || ''}
                    strokeWidth={2}
                  />
                ) : null}
              </g>
            ))}
          </svg>

          <div className={stylex.props(styles.s7a8ff926).className || ''}>
            {graph.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={cn(
                  'border-border/60 hover:bg-accent/60 focus-visible:ring-ring grid w-full grid-cols-[var(--graph-width)_minmax(0,1fr)] items-center border-b text-left transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:outline-none',
                  selectedNode?.id === node.id && 'bg-accent hover:bg-accent',
                )}
                style={
                  {
                    height: ROW_HEIGHT,
                    '--graph-width': `${graphWidth}px`,
                  } as CSSProperties
                }
                aria-pressed={selectedNode?.id === node.id}
                aria-label={`Inspect version ${node.id}`}
                onClick={() => setSelectedId(node.id)}
              >
                <span />
                <span className="flex min-w-0 items-center gap-3 pr-4">
                  <VersionNodeIcon node={node} />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className={stylex.props(styles.s3114908f).className || ''}>{node.shortId}</span>
                      {node.isHead ? <Badge>HEAD</Badge> : null}
                      {node.isGenesis ? <Badge>genesis</Badge> : null}
                      {node.isMerge ? <Badge>merge</Badge> : null}
                      {node.isMissing ? <Badge>missing</Badge> : null}
                    </span>
                    <span className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs">
                      {node.author ? <span className="max-w-full min-w-0 break-all">hm://{node.author}</span> : null}
                      {node.author && node.createTime ? <span>•</span> : null}
                      {node.createTime ? <span>{formatDate(node.createTime)}</span> : null}
                      {!node.author && !node.createTime ? <span>Dependency placeholder</span> : null}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <VersionDetails node={selectedNode} docId={docId} />
    </div>
  )
}
function VersionNodeIcon({node}: {node: DocumentVersionGraphNode}) {
  const Icon = node.isMerge
    ? GitMerge
    : node.isHead
      ? GitPullRequestArrow
      : node.isGenesis
        ? GitBranch
        : GitCommitHorizontal
  return (
    <span
      className={cn(
        stylex.props(styles.s13474966).className || '',
        node.isHead && 'text-foreground',
        node.isMissing && 'border-dashed',
      )}
    >
      <Icon className={stylex.props(styles.sca3de968).className || ''} />
    </span>
  )
}
function VersionDetails({node, docId}: {node: DocumentVersionGraphNode | null; docId: UnpackedHypermediaId}) {
  if (!node) {
    return (
      <aside className="border-border bg-background text-muted-foreground min-w-0 overflow-hidden rounded-xl border p-4 text-sm shadow-xs xl:w-80 xl:shrink-0">
        Select a version to inspect its dependencies.
      </aside>
    )
  }
  return (
    <aside className="border-border bg-background h-fit min-w-0 overflow-hidden rounded-xl border p-4 shadow-xs xl:w-80 xl:shrink-0">
      <div className={stylex.props(styles.s584ecc35).className || ''}>
        <div className="min-w-0 flex-1 overflow-hidden">
          <h2 className={stylex.props(styles.s6528b98e).className || ''}>Version details</h2>
          <p className={stylex.props(styles.s69d240f5).className || ''}>{node.id}</p>
        </div>
        {node.isHead ? <Badge>HEAD</Badge> : null}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <DetailRow label="Author">{node.author ? `hm://${node.author}` : 'Unknown'}</DetailRow>
        <DetailRow label="Created">{node.createTime ? formatDate(node.createTime) : 'Unknown'}</DetailRow>
        <DetailRow label="Depth">{node.depth}</DetailRow>
        <DetailRow label="Lane">{node.lane + 1}</DetailRow>
        <DetailRow label="Dependencies">
          {node.deps.length ? (
            <span className="block min-w-0 space-y-1">
              {node.deps.map((dep) => (
                <span key={dep} className="block max-w-full overflow-hidden font-mono text-xs break-all">
                  {dep}
                </span>
              ))}
            </span>
          ) : (
            'None'
          )}
        </DetailRow>
      </dl>

      <div className={stylex.props(styles.s5251db24).className || ''}>
        {node.isMissing ? null : <ExactVersionLink docId={docId} version={node.id} />}
        <IpfsLink cid={node.id} />
      </div>
    </aside>
  )
}
function ExactVersionLink({docId, version}: {docId: UnpackedHypermediaId; version: string}) {
  const linkProps = useRouteLink(
    createInspectNavRoute(
      {
        ...docId,
        version,
        latest: null,
        blockRef: null,
        blockRange: null,
      },
      null,
      null,
      null,
      null,
    ),
  )
  return (
    <Button asChild size="sm" variant="outline">
      <a {...linkProps}>
        <LinkIcon className={stylex.props(styles.sca3de968).className || ''} />
        Exact version
      </a>
    </Button>
  )
}
function IpfsLink({cid}: {cid: string}) {
  const linkProps = useRouteLink(createInspectIpfsNavRoute(cid))
  return (
    <Button asChild size="sm" variant="outline">
      <a {...linkProps}>IPFS object</a>
    </Button>
  )
}
function DetailRow({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="flex min-w-0 gap-3">
      <dt className={stylex.props(styles.s461e02e7).className || ''}>{label}</dt>
      <dd className="text-foreground min-w-0 flex-1 overflow-hidden break-all">{children}</dd>
    </div>
  )
}
function Badge({children}: {children: ReactNode}) {
  return <span className={stylex.props(styles.s2dbc2df2).className || ''}>{children}</span>
}
function nodeX(node: DocumentVersionGraphNode): number {
  return GRAPH_LEFT_PADDING + node.lane * LANE_WIDTH
}
function nodeY(node: DocumentVersionGraphNode): number {
  return GRAPH_TOP_PADDING + node.row * ROW_HEIGHT
}
function edgePath(from: DocumentVersionGraphNode, to: DocumentVersionGraphNode): string {
  const startX = nodeX(from)
  const startY = nodeY(from)
  const endX = nodeX(to)
  const endY = nodeY(to)
  const midY = startY + (endY - startY) / 2
  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
}
function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return DETAIL_DATE_FORMAT.format(date)
}
function laneColorClass(lane: number): string {
  return (
    ['text-blue-600', 'text-amber-500', 'text-pink-600', 'text-emerald-600', 'text-violet-600'][lane % 5] ||
    'text-blue-600'
  )
}
