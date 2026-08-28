import * as stylex from '@stylexjs/stylex'
import {type SessionInfo} from './client'
import {useChildSessions} from './models'
import {ChevronDown, ChevronRight} from 'lucide-react'
import {useState} from 'react'
const pulseKeyframes = stylex.keyframes({
  '0%, 100%': {
    opacity: 1,
  },
  '50%': {
    opacity: 0.5,
  },
})
const dotStatusStyles = stylex.create({
  base: {
    width: 'calc(var(--spacing) * 2)',
    height: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(infinity * 1px)',
    flex: 'none',
  },
  idle: {
    backgroundColor: '#22c55e',
  },
  streaming: {
    backgroundColor: 'var(--muted-foreground)',
    animationName: pulseKeyframes,
    animationDuration: '2s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationIterationCount: 'infinite',
  },
  error: {
    backgroundColor: 'var(--destructive)',
  },
})

/** Status dot shown beside a session title in every session list. */
/**
 * The agent's own summary of a session (status verb, or the server's namer), pinned above the
 * chat so a reader knows what the session is doing without scrolling the transcript.
 */
const styles_4 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s8f3e7cf3: {
    backgroundColor: 'color-mix(in oklab, var(--card) 95%, transparent)',
  },
  s2d573fc9: {
    backgroundColor: 'color-mix(in oklab, var(--card) 80%, transparent)',
  },
  s948be48c: {
    flex: 'none',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s34b1ac: {
    paddingInline: 'calc(0.25rem * 1)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s3cc0cac8: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitboxOrient: 'vertical',
    WebkitlineClamp: '3',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sf4676641: {
    gap: 'calc(0.25rem * 1.5)',
  },
  s760cfea1: {
    alignSelf: 'flex-start',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  sc5dd1033: {
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  s284af276: {
    '@media ((max-width: 639px))': {
      minHeight: 'calc(0.25rem * 10)',
    },
  },
  s332784: {
    marginLeft: 'calc(0.25rem * 2)',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s7c401f0b: {
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
  },
  s3484a1: {
    paddingLeft: 'calc(0.25rem * 2)',
  },
  s3484a2: {
    paddingLeft: 'calc(0.25rem * 3)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  s37120a61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
  },
  scdbaf625: {
    width: '100%',
  },
  sf4676280: {
    gap: 'calc(0.25rem * 0.5)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
})
const styles_3 = stylex.create({
  s91cb207b: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
    width: 'calc(var(--spacing) * 2)',
    height: 'calc(var(--spacing) * 2)',
    flex: 'none',
    borderRadius: 'calc(infinity * 1px)',
  },
})
const styles_2 = stylex.create({
  s10483f08: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
const styles = stylex.create({
  s730eff20: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
  },
  se6c9d13: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flex: 'none',
  },
  sca3de966: {
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
  },
  scc9904d1: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sc20ef71c: {
    color: 'var(--muted-foreground)',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '3',
    width: '100%',
    paddingLeft: 'calc(0.25rem * 4)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
export function SessionSummaryBanner({
  description,
  compact,
  className: _className = '',
}: {
  description: string | undefined
  compact?: boolean
  className?: string
}) {
  if (!description) return null
  return (
    <div
      className={
        (stylex.props(
          styles_4.s1a01a0ed,
          styles_4.s8f3e7cf3,
          styles_4.s2d573fc9,
          styles_4.s948be48c,
          styles_4.s7c401f01,
        ).className || '') +
        ' ' +
        (compact
          ? stylex.props(styles_4.s34b1ae, styles_4.sc5dd13f4).className || ''
          : stylex.props(styles_4.s34b1ac, styles_4.s34b56e).className || '')
      }
      aria-label="Session summary"
    >
      <p
        className={
          (stylex.props(styles_4.sf2718385, styles_4.s3cc0cac8).className || '') +
          ' ' +
          (compact
            ? stylex.props(styles_4.sab7cc79b).className || ''
            : stylex.props(styles_4.sab7cc6fa).className || '')
        }
        title={description}
      >
        {description}
      </p>
    </div>
  )
}
export function SessionStatusDot({status, className: _className}: {status: SessionInfo['status']; className?: string}) {
  const statusStyle =
    status === 'error'
      ? dotStatusStyles.error
      : status === 'streaming'
        ? dotStatusStyles.streaming
        : dotStatusStyles.idle
  return (
    <span
      className={stylex.props(dotStatusStyles.base, statusStyle).className || ''}
      aria-label={status}
      title={status}
    />
  )
}

/**
 * Rolls the children's statuses into the one dot shown on a collapsed parent row: a failure has to
 * be visible without opening the disclosure, and anything still streaming keeps the row animated.
 */
function summarizeChildStatus(children: SessionInfo[] | undefined): SessionInfo['status'] | undefined {
  if (!children?.length) return undefined
  if (children.some((child) => child.status === 'error')) return 'error'
  if (children.some((child) => child.status === 'streaming')) return 'streaming'
  return 'idle'
}

/**
 * Disclosure for the sub-sessions spawned under one session.
 *
 * Session lists exclude children, so a parent carries only `childSessionCount` until the user opens
 * this — the child list is fetched on first expand and then kept live by the existing WebSocket
 * invalidations. Until that first fetch the summary dot has nothing to summarize and stays neutral.
 */
export function SubSessionsDisclosure({
  serverUrl,
  accountUid,
  parentSessionId,
  childSessionCount,
  compact,
  selectedSessionId,
  onOpenSession,
}: {
  serverUrl: string
  accountUid: string | null | undefined
  parentSessionId: string
  childSessionCount: number
  /** Sidebar sizing: smaller text and tighter rows. */
  compact?: boolean
  selectedSessionId?: string
  onOpenSession: (session: SessionInfo, event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const children = useChildSessions(serverUrl, accountUid, parentSessionId, {
    enabled: expanded,
  })
  const summaryStatus = summarizeChildStatus(children.data)
  return (
    <div className={stylex.props(styles.s730eff20).className || ''}>
      <button
        type="button"
        aria-expanded={expanded}
        className={
          stylex.props(
            styles_4.sf2718385,
            styles_4.sae6a97a5,
            styles_4.s2ffff9,
            styles_4.sc6ed1702,
            styles_4.sf4676641,
            styles_4.s760cfea1,
            styles_4.s529492ad,
            styles_4.s34b1ac,
            styles_4.sc5dd1033,
            styles_4.s284af276,
          ).className || ''
        }
        onClick={(event) => {
          event.stopPropagation()
          setExpanded((current) => !current)
        }}
      >
        {expanded ? (
          <ChevronDown className={stylex.props(styles.se6c9d13).className || ''} />
        ) : (
          <ChevronRight className={stylex.props(styles.se6c9d13).className || ''} />
        )}
        {summaryStatus ? (
          <SessionStatusDot status={summaryStatus} className={stylex.props(styles.sca3de966).className || ''} />
        ) : (
          <span className={stylex.props(styles_3.s91cb207b).className || ''} />
        )}
        <span className={stylex.props(compact ? styles_4.sab7cc79b : styles_4.sab7cc6fa).className || ''}>
          {childSessionCount} sub-session{childSessionCount === 1 ? '' : 's'}
        </span>
      </button>
      {expanded ? (
        <div
          className={
            (stylex.props(
              styles_4.s1a01a0ed,
              styles_4.s332784,
              styles_4.s2ffff9,
              styles_4.s67e351ac,
              styles_4.s7c401f0b,
            ).className || '') +
            ' ' +
            (compact ? stylex.props(styles_4.s3484a1).className || '' : stylex.props(styles_4.s3484a2).className || '')
          }
        >
          {children.isLoading ? (
            <span className={stylex.props(styles_4.sf2718385, styles_4.s34b1ad, styles_4.s34b56d).className || ''}>
              Loading sub-sessions…
            </span>
          ) : null}
          {children.isError ? (
            <span className={stylex.props(styles_4.s8a2570e2, styles_4.s34b1ad, styles_4.s34b56d).className || ''}>
              Could not load sub-sessions
            </span>
          ) : null}
          {children.data?.length === 0 ? (
            <span className={stylex.props(styles_4.sf2718385, styles_4.s34b1ad, styles_4.s34b56d).className || ''}>
              No sub-sessions
            </span>
          ) : null}
          {children.data?.map((child) => (
            <button
              key={child.id}
              type="button"
              className={
                (stylex.props(
                  styles_4.s37120a61,
                  styles_4.s2ffff9,
                  styles_4.scdbaf625,
                  styles_4.s67e351ac,
                  styles_4.sf4676280,
                  styles_4.s529492ad,
                  styles_4.s34b1ad,
                  styles_4.s34b56d,
                  styles_4.sbf63b0a7,
                ).className || '') +
                ' ' +
                (child.id === selectedSessionId ? stylex.props(styles_4.s5fd609e3).className || '' : '')
              }
              onClick={(event) => {
                event.stopPropagation()
                onOpenSession(child, event)
              }}
            >
              <span className={stylex.props(styles.scc9904d1).className || ''}>
                <SessionStatusDot status={child.status} className={stylex.props(styles.sca3de966).className || ''} />
                <span className={stylex.props(styles_2.s10483f08).className || ''}>
                  {child.title || 'Untitled sub-session'}
                </span>
              </span>
              {child.description ? (
                <span className={stylex.props(styles.sc20ef71c).className || ''}>{child.description}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
