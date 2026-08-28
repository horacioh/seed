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
const styles_5 = stylex.create({
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s33458e: {
    marginTop: 'calc(0.25rem * 4)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s597c48d: {
    display: 'block',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
})
const styles_4 = stylex.create({
  s2120934c: {
    display: 'flex',
    minHeight: 'calc(var(--spacing) * 0)',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 1280px))': {
      flexDirection: 'row',
    },
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s67b8c92c: {
    color: 'color-mix(in oklab, var(--muted-foreground) 35%, transparent)',
  },
  sebe3536f: {
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--accent) 60%, transparent)',
      },
    },
    ':focus-visible': {
      boxShadow: '0 0 0 2px currentcolor',
      outlineStyle: 'none',
    },
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'var(--graph-width) minmax(0,1fr)',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    textAlign: 'left',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':lastChild': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  s650a3dc6: {
    backgroundColor: 'var(--accent)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  s7a2978f3: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--muted-foreground)',
    minWidth: 'calc(var(--spacing) * 0)',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    boxShadow: 'var(--shadow-xs)',
    '@media ((min-width: 1280px))': {
      width: 'calc(var(--spacing) * 80)',
      flexShrink: '0',
    },
  },
  sac689fc0: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    height: 'fit-content',
    minWidth: 'calc(var(--spacing) * 0)',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    boxShadow: 'var(--shadow-xs)',
    '@media ((min-width: 1280px))': {
      width: 'calc(var(--spacing) * 80)',
      flexShrink: '0',
    },
  },
})
const styles_3 = stylex.create({
  sc05281e3: {
    color: 'var(--foreground)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sfbecb7e3: {
    stroke: 'var(--background)',
  },
  s3495744c: {
    fill: 'var(--background)',
    stroke: 'currentcolor',
  },
  s1ca68c72: {
    borderStyle: 'dashed',
  },
})
const styles_2 = stylex.create({
  s551ca835: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: 'var(--shadow-xs)',
  },
  s1db42ac3: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    paddingRight: 'calc(0.25rem * 4)',
  },
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
  s4c30bc07: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s5c06ec28: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s5d84e660: {
    maxWidth: '100%',
    minWidth: 'calc(0.25rem * 0)',
    wordBreak: 'break-all',
  },
  sdecc81f3: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
  },
  s7b18ff85: {
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    wordBreak: 'break-all',
  },
  sa9c17a14: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    gap: 'calc(0.25rem * 3)',
  },
  se166db83: {
    color: 'var(--foreground)',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    wordBreak: 'break-all',
  },
})
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
    boxShadow: 'var(--shadow-xs)',
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
    <div className={stylex.props(styles_4.s2120934c).className || ''}>
      <div className={stylex.props(styles_2.s551ca835).className || ''}>
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
                    stylex.props(
                      selectedNode && (selectedNode.id === from.id || selectedNode.id === to.id)
                        ? styles_4.sc05281e3
                        : styles_4.s67b8c92c,
                    ).className || '',
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
                  selectedNode?.id === node.id
                    ? stylex.props(styles_5.sc05281e3).className || ''
                    : laneColorClass(node.lane),
                  stylex.props(node.isMissing && styles_3.sf2718385).className || '',
                )}
              >
                <circle
                  cx={nodeX(node)}
                  cy={nodeY(node)}
                  r={node.isMerge ? 7 : 6}
                  className={cn(
                    stylex.props(styles.s4430632f).className || '',
                    stylex.props(selectedNode?.id === node.id && styles_3.sfbecb7e3).className || '',
                    stylex.props(node.isMissing && styles_3.s3495744c).className || '',
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
                  stylex.props(styles_4.sebe3536f).className || '',
                  stylex.props(selectedNode?.id === node.id ? styles_4.s650a3dc6 : null).className || '',
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
                <span className={stylex.props(styles_2.s1db42ac3).className || ''}>
                  <VersionNodeIcon node={node} />
                  <span className={stylex.props(styles_2.se30fd43e).className || ''}>
                    <span className={stylex.props(styles_2.s4c30bc07).className || ''}>
                      <span className={stylex.props(styles.s3114908f).className || ''}>{node.shortId}</span>
                      {node.isHead ? <Badge>HEAD</Badge> : null}
                      {node.isGenesis ? <Badge>genesis</Badge> : null}
                      {node.isMerge ? <Badge>merge</Badge> : null}
                      {node.isMissing ? <Badge>missing</Badge> : null}
                    </span>
                    <span className={stylex.props(styles_2.s5c06ec28).className || ''}>
                      {node.author ? (
                        <span className={stylex.props(styles_2.s5d84e660).className || ''}>hm://{node.author}</span>
                      ) : null}
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
        stylex.props(node.isHead && styles_3.sc05281e3).className || '',
        stylex.props(node.isMissing && styles_3.s1ca68c72).className || '',
      )}
    >
      <Icon className={stylex.props(styles.sca3de968).className || ''} />
    </span>
  )
}
function VersionDetails({node, docId}: {node: DocumentVersionGraphNode | null; docId: UnpackedHypermediaId}) {
  if (!node) {
    return (
      <aside className={stylex.props(styles_4.s7a2978f3).className || ''}>
        Select a version to inspect its dependencies.
      </aside>
    )
  }
  return (
    <aside className={stylex.props(styles_4.sac689fc0).className || ''}>
      <div className={stylex.props(styles.s584ecc35).className || ''}>
        <div className={stylex.props(styles_2.sdecc81f3).className || ''}>
          <h2 className={stylex.props(styles.s6528b98e).className || ''}>Version details</h2>
          <p className={stylex.props(styles.s69d240f5).className || ''}>{node.id}</p>
        </div>
        {node.isHead ? <Badge>HEAD</Badge> : null}
      </div>

      <dl className={stylex.props(styles_5.s33458e, styles_5.sab7cc6fa).className || ''}>
        <DetailRow label="Author">{node.author ? `hm://${node.author}` : 'Unknown'}</DetailRow>
        <DetailRow label="Created">{node.createTime ? formatDate(node.createTime) : 'Unknown'}</DetailRow>
        <DetailRow label="Depth">{node.depth}</DetailRow>
        <DetailRow label="Lane">{node.lane + 1}</DetailRow>
        <DetailRow label="Dependencies">
          {node.deps.length ? (
            <span className={stylex.props(styles_5.s597c48d, styles_5.s3f58665f).className || ''}>
              {node.deps.map((dep) => (
                <span key={dep} className={stylex.props(styles_2.s7b18ff85).className || ''}>
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
    <div className={stylex.props(styles_2.sa9c17a14).className || ''}>
      <dt className={stylex.props(styles.s461e02e7).className || ''}>{label}</dt>
      <dd className={stylex.props(styles_2.se166db83).className || ''}>{children}</dd>
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
