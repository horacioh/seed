import * as stylex from '@stylexjs/stylex'
import {useSelector} from '@xstate/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useUniversalAppContext} from '../routing'
import type {InspectEntry, InspectEventStore} from './document-machine-inspect'
import {useDocumentMachineRef, type DocumentMachineSnapshot} from './use-document-machine'

/**
 * Formats a state value into a readable dot-separated path.
 * Handles both string values ("loading") and object values ({editing: "idle"}).
 */
const styles_2 = stylex.create({
  sc7133e96: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 1)',
  },
})
const styles = stylex.create({
  s5cee774: {
    position: 'fixed',
  },
  s808fc113: {
    bottom: 'calc(0.25rem * 5)',
  },
  s478fb0c2: {
    right: 'calc(0.25rem * 3)',
  },
  s6c4ecf55: {
    zIndex: '9999',
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
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sdddec04c: {
    borderColor: 'oklch(87% 0 0)',
  },
  s327a116b: {
    backgroundColor: 'oklch(20.5% 0 0)',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sa173a9a1: {
    fontFamily: 'var(--font-mono)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s61da104b: {
    color: 'oklch(97% 0 0)',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sb60737a8: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'oklch(26.9% 0 0)',
      },
    },
  },
  sd5276459: {
    display: 'inline-block',
  },
  sca3de966: {
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
  },
  se911c76b: {
    insetInline: 'calc(0.25rem * 0)',
  },
  s808fc10e: {
    bottom: 'calc(0.25rem * 0)',
  },
  s61fdcb43: {
    maxHeight: '50vh',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s7c401f13: {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  sc3182879: {
    boxShadow: 'var(--shadow-2xl)',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  sdddebc8b: {
    borderColor: 'oklch(92.2% 0 0)',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  s61da2a92: {
    color: 'oklch(26.9% 0 0)',
  },
  s61da1b8e: {
    color: 'oklch(70.8% 0 0)',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s61da1f4f: {
    color: 'oklch(55.6% 0 0)',
  },
  sb6071d61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'oklch(97% 0 0)',
      },
    },
  },
  s36c4c94f: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'oklch(37.1% 0 0)',
      },
    },
  },
  sb42feb5d: {
    flex: '1',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s21707c9a: {
    overflow: 'auto',
  },
  s7c401f11: {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  s3301fa: {
    marginBottom: 'calc(0.25rem * 2)',
  },
  sd52b2d2: {
    textTransform: 'uppercase',
  },
  s37483969: {
    letterSpacing: '0.05em',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s8ecdafd3: {
    wordBreak: 'break-all',
  },
  s33458e: {
    marginTop: 'calc(0.25rem * 4)',
  },
  s9490059e: {
    flexWrap: 'wrap',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd1033: {
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  s61da26d1: {
    color: 'oklch(37.1% 0 0)',
  },
  s36c80e: {
    width: 'calc(0.25rem * 80)',
  },
  s55426dfb: {
    fontSize: '10px',
  },
  s36c4c58e: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'oklch(43.9% 0 0)',
      },
    },
  },
  sdddeb8ca: {
    borderColor: 'oklch(97% 0 0)',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s326929ec: {
    width: 'calc(0.25rem * 1.5)',
    height: 'calc(0.25rem * 1.5)',
  },
})
function formatStateValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([key, child]) => `${key}.${formatStateValue(child)}`)
      .join(', ')
  }
  return String(value)
}

/** Select the state value for display. */
function selectStateValue(snapshot: DocumentMachineSnapshot) {
  return snapshot.value
}

/** Select context fields relevant for debugging. */
function selectDebugContext(snapshot: DocumentMachineSnapshot) {
  const ctx = snapshot.context
  return {
    canEdit: ctx.canEdit,
    documentReady: ctx.documentReady,
    draftReady: ctx.draftReady,
    draftId: ctx.draftId,
    draftCreated: ctx.draftCreated,
    draftContent: ctx.draftContent ? `${ctx.draftContent.length} blocks` : 'null',
    draftCursorPosition: ctx.draftCursorPosition,
    shouldAutoEdit: ctx.shouldAutoEdit,
    publishedVersion: ctx.publishedVersion,
    pendingRemoteDocumentVersion: ctx.pendingRemoteDocument?.version ?? null,
    hasChangedWhileSaving: ctx.hasChangedWhileSaving,
    documentId: ctx.documentId ? `${ctx.documentId.uid}/${ctx.documentId.path?.join('/')}` : null,
    document: ctx.document ? `v:${ctx.document.version?.slice(0, 12)}` : 'null',
  }
}
export interface DocumentMachineDebugDrawerProps {
  /** The event store to subscribe to for inspection events. */
  store?: InspectEventStore
}

/**
 * Debug drawer for the document state machine.
 * Shows current state, key context fields, event log, and quick event sender.
 *
 * Gated by the `developerTools` experiment flag — renders null when off.
 * Must be rendered inside a `DocumentMachineProvider` tree.
 */
export function DocumentMachineDebugDrawer({store}: DocumentMachineDebugDrawerProps) {
  const experiments = useUniversalAppContext().experiments
  const enabled = !!experiments?.developerTools
  const [isOpen, setIsOpen] = useState(false)

  // Keyboard shortcut: Cmd/Ctrl + Shift + D
  useEffect(() => {
    if (!enabled) return
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
  if (!enabled) return null
  return (
    <>
      <StatePill onClick={() => setIsOpen(true)} isOpen={isOpen} />
      {isOpen && <DebugPanel onClose={() => setIsOpen(false)} store={store} />}
    </>
  )
}
function StatePill({onClick, isOpen}: {onClick: () => void; isOpen: boolean}) {
  const actorRef = useDocumentMachineRef()
  const stateValue = useSelector(actorRef, selectStateValue)
  const label = formatStateValue(stateValue)
  return (
    <button
      onClick={onClick}
      className={
        stylex.props(
          styles.s5cee774,
          styles.s808fc113,
          styles.s478fb0c2,
          styles.s6c4ecf55,
          styles.s2ffff9,
          styles.sc6ed1702,
          styles.sf4676641,
          styles.s775755af,
          styles.sad8c742c,
          styles.sdddec04c,
          styles.s327a116b,
          styles.s34b1ae,
          styles.sc5dd13f4,
          styles.sa173a9a1,
          styles.sab7cc79b,
          styles.s61da104b,
          styles.s8a6c2948,
          styles.sf7fb00e8,
          styles.sb60737a8,
        ).className || ''
      }
      title="Open Document Machine Debug Panel (Cmd+Shift+D)"
      style={{
        display: isOpen ? 'none' : undefined,
      }}
    >
      <span
        className={stylex.props(styles.sd5276459, styles.sca3de966, styles.s775755af).className || ''}
        style={{
          backgroundColor: label.startsWith('error')
            ? '#ef4444'
            : label.startsWith('editing')
              ? '#22c55e'
              : label.startsWith('publishing')
                ? '#eab308'
                : '#3b82f6',
        }}
      />
      {label}
    </button>
  )
}
function DebugPanel({onClose, store}: {onClose: () => void; store?: InspectEventStore}) {
  const actorRef = useDocumentMachineRef()
  const stateValue = useSelector(actorRef, selectStateValue)
  const debugCtx = useSelector(actorRef, selectDebugContext)

  // Event log from the inspect store (captures all XState inspection events)
  const [events, setEvents] = useState<InspectEntry[]>(() => (store ? [...store.entries] : []))
  const eventsEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!store) return
    // Seed with existing entries
    setEvents([...store.entries])
    return store.subscribe(() => {
      setEvents([...store.entries])
    })
  }, [store])

  // Fallback: if no store, subscribe to actor events directly
  useEffect(() => {
    if (store) return // store takes priority
    const sub = actorRef.on('*', (event: any) => {
      setEvents((prev) => {
        const entry: InspectEntry = {
          inspType: 'event',
          eventType: event.type,
          timestamp: new Date().toISOString(),
          raw: event,
        }
        return [entry, ...prev].slice(0, 200)
      })
    })
    return () => sub.unsubscribe()
  }, [actorRef, store])
  const handleSendEvent = useCallback(
    (eventType: string) => {
      try {
        actorRef.send({
          type: eventType,
        } as any)
      } catch (err) {
        console.error('[DebugPanel] Failed to send event:', err)
      }
    },
    [actorRef],
  )
  const handleClear = useCallback(() => {
    store?.clear()
    setEvents([])
  }, [store])
  const stateLabel = formatStateValue(stateValue)
  return (
    <div
      className={
        stylex.props(
          styles.s5cee774,
          styles.se911c76b,
          styles.s808fc10e,
          styles.s6c4ecf55,
          styles.s2ffff9,
          styles.s61fdcb43,
          styles.s67e351ac,
          styles.s7c401f13,
          styles.sdddec04c,
          styles.s605ce4a1,
          styles.sc3182879,
        ).className || ''
      }
    >
      {/* Header */}
      <div
        className={
          stylex.props(
            styles.s2ffff9,
            styles.sc6ed1702,
            styles.sc1a629cb,
            styles.s7c401f01,
            styles.sdddebc8b,
            styles.s34b1af,
            styles.s34b56e,
          ).className || ''
        }
      >
        <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb).className || ''}>
          <span
            className={
              stylex.props(styles.sa173a9a1, styles.sab7cc6fa, styles.s62c182b1, styles.s61da2a92).className || ''
            }
          >
            Document Machine
          </span>
          <StateBadge label={stateLabel} />
        </div>
        <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb).className || ''}>
          <span className={stylex.props(styles.sab7cc79b, styles.s61da1b8e).className || ''}>Cmd+Shift+D</span>
          <button
            onClick={onClose}
            className={
              stylex.props(
                styles.s529492ad,
                styles.s1aa14,
                styles.s61da1f4f,
                styles.sf7fb00e8,
                styles.sb6071d61,
                styles.s36c4c94f,
              ).className || ''
            }
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={stylex.props(styles.s2ffff9, styles.sb42feb5d, styles.s92852dd5).className || ''}>
        {/* Context panel */}
        <div
          className={
            stylex.props(styles.sb42feb5d, styles.s21707c9a, styles.s7c401f11, styles.sdddebc8b, styles.s1aa16)
              .className || ''
          }
        >
          <h3
            className={
              stylex.props(
                styles.s3301fa,
                styles.sa173a9a1,
                styles.sab7cc79b,
                styles.s62c182b1,
                styles.sd52b2d2,
                styles.s37483969,
                styles.s61da1f4f,
              ).className || ''
            }
          >
            Context
          </h3>
          <div className={stylex.props(styles_2.sc7133e96).className || ''}>
            {Object.entries(debugCtx).map(([key, value]) => (
              <div
                key={key}
                className={
                  stylex.props(styles.s2ffff9, styles.s93b5f015, styles.s5d936fb, styles.sa173a9a1, styles.sab7cc79b)
                    .className || ''
                }
              >
                <span className={stylex.props(styles.sf032ed6c, styles.s61da1f4f).className || ''}>{key}:</span>
                <span className={stylex.props(styles.s8ecdafd3, styles.s61da2a92).className || ''}>
                  {value === null ? (
                    <span className={stylex.props(styles.s61da1b8e).className || ''}>null</span>
                  ) : (
                    String(value)
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Quick event sender */}
          <h3
            className={
              stylex.props(
                styles.s3301fa,
                styles.s33458e,
                styles.sa173a9a1,
                styles.sab7cc79b,
                styles.s62c182b1,
                styles.sd52b2d2,
                styles.s37483969,
                styles.s61da1f4f,
              ).className || ''
            }
          >
            Send Event
          </h3>
          <div className={stylex.props(styles.s2ffff9, styles.s9490059e, styles.s5d936fa).className || ''}>
            {['edit.start', 'edit.cancel', 'change', 'publish.start', 'reset.content'].map((eventType) => (
              <button
                key={eventType}
                onClick={() => handleSendEvent(eventType)}
                className={
                  stylex.props(
                    styles.s529492ad,
                    styles.sad8c742c,
                    styles.sdddec04c,
                    styles.s34b1ad,
                    styles.sc5dd1033,
                    styles.sa173a9a1,
                    styles.sab7cc79b,
                    styles.s61da26d1,
                    styles.sf7fb00e8,
                    styles.sb6071d61,
                  ).className || ''
                }
              >
                {eventType}
              </button>
            ))}
          </div>
        </div>

        {/* Event log panel */}
        <div
          className={stylex.props(styles.s2ffff9, styles.s36c80e, styles.s67e351ac, styles.s92852dd5).className || ''}
        >
          <div
            className={
              stylex.props(
                styles.s2ffff9,
                styles.sc6ed1702,
                styles.sc1a629cb,
                styles.s7c401f01,
                styles.sdddebc8b,
                styles.s34b1ae,
                styles.s34b56e,
              ).className || ''
            }
          >
            <h3
              className={
                stylex.props(
                  styles.sa173a9a1,
                  styles.sab7cc79b,
                  styles.s62c182b1,
                  styles.sd52b2d2,
                  styles.s37483969,
                  styles.s61da1f4f,
                ).className || ''
              }
            >
              Event Log ({events.length})
            </h3>
            <button
              onClick={handleClear}
              className={
                stylex.props(styles.sa173a9a1, styles.s55426dfb, styles.s61da1b8e, styles.sf7fb00e8, styles.s36c4c58e)
                  .className || ''
              }
            >
              clear
            </button>
          </div>
          <div className={stylex.props(styles.sb42feb5d, styles.s21707c9a).className || ''}>
            {events.length === 0 ? (
              <p
                className={
                  stylex.props(styles.s1aa16, styles.sa173a9a1, styles.sab7cc79b, styles.s61da1b8e).className || ''
                }
              >
                No events yet…
              </p>
            ) : (
              events.map((evt, i) => (
                <div
                  key={`${evt.timestamp}-${i}`}
                  className={
                    stylex.props(
                      styles.s2ffff9,
                      styles.sc6ed1702,
                      styles.sc1a629cb,
                      styles.s7c401f01,
                      styles.sdddeb8ca,
                      styles.s34b1ae,
                      styles.s34b56d,
                    ).className || ''
                  }
                >
                  <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sf4676641).className || ''}>
                    <EventTypeBadge type={evt.inspType} />
                    <span
                      className={stylex.props(styles.sa173a9a1, styles.sab7cc79b, styles.s61da2a92).className || ''}
                    >
                      {evt.eventType}
                    </span>
                  </div>
                  <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb).className || ''}>
                    {evt.stateValue != null && (
                      <span
                        className={stylex.props(styles.sa173a9a1, styles.s55426dfb, styles.s61da1f4f).className || ''}
                      >
                        {formatStateValue(evt.stateValue)}
                      </span>
                    )}
                    <span
                      className={stylex.props(styles.sa173a9a1, styles.s55426dfb, styles.s61da1b8e).className || ''}
                    >
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={eventsEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
function StateBadge({label}: {label: string}) {
  return (
    <span
      className={
        stylex.props(
          styles.sd5276459,
          styles.s775755af,
          styles.s34b1ad,
          styles.sc5dd1033,
          styles.sa173a9a1,
          styles.sab7cc79b,
          styles.s129e46b3,
        ).className || ''
      }
      style={{
        backgroundColor: label.startsWith('error')
          ? '#fecaca'
          : label.startsWith('editing')
            ? '#bbf7d0'
            : label.startsWith('publishing')
              ? '#fef08a'
              : '#bfdbfe',
        color: '#1e293b',
      }}
    >
      {label}
    </span>
  )
}
function EventTypeBadge({type}: {type: string}) {
  const colors: Record<string, string> = {
    event: '#3b82f6',
    snapshot: '#22c55e',
    actor: '#a855f7',
  }
  return (
    <span
      className={stylex.props(styles.sd5276459, styles.s326929ec, styles.s775755af).className || ''}
      style={{
        backgroundColor: colors[type] ?? '#9ca3af',
      }}
      title={type}
    />
  )
}
