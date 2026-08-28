import * as stylex from '@stylexjs/stylex'
import {useAssistantPanel} from '@/assistant-panel-state'
import {clientLazy} from '@/client-lazy'
import {useSiteContextSnapshot} from '@/site-context-bridge'
import {UniversalAppContext} from '@shm/shared'
import {NavContextProvider} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {Spinner} from '@shm/ui/spinner'
import {useMedia} from '@shm/ui/use-media'
import {cn} from '@shm/ui/utils'
import {ArrowLeft} from 'lucide-react'
import React, {Suspense, useCallback, useEffect, useRef, useState} from 'react'

// The panel body pulls in the agents models and the rich editor. Like the /hm/agents pages and the
// commenting editor, it is a separate client-only chunk that only loads once the panel opens, so
// nothing agents-related enters the initial bundle.
const styles_5 = stylex.create({
  s1bd1f072: {
    visibility: 'visible',
  },
  scad131e9: {
    position: 'sticky',
  },
  s696c5b8: {
    top: 'calc(0.25rem * 0)',
  },
  s5cf8731: {
    height: '100dvh',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s760cfea1: {
    alignSelf: 'flex-start',
  },
})
const styles_4 = stylex.create({
  s87a3738c: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 1)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    paddingTop: 'env(safe-area-inset-top)',
  },
  s40a14ed2: {
    display: 'flex',
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    flexDirection: 'column',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
})
const styles_3 = stylex.create({
  s9cf2edc1: {
    cursor: 'col-resize',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
})
const styles_2 = stylex.create({
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
const styles = stylex.create({
  s1dd0bfd2: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  s520c9021: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    position: 'sticky',
    top: 'calc(0.25rem * 0)',
    display: 'flex',
    height: '100dvh',
    flexShrink: '0',
    flexDirection: 'column',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
  },
  sb03e17cd: {
    backgroundColor: 'var(--background)',
    position: 'fixed',
    inset: 'calc(0.25rem * 0)',
    zIndex: '50',
    display: 'flex',
    height: '100dvh',
    width: '100%',
    flexDirection: 'column',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s3b59b99: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 12)',
  },
})
const WebAssistantPanelContent = clientLazy<{
  showClose?: boolean
}>(async () => ({
  default: (await import('./web-assistant-panel-content')).default,
}))
const WIDTH_STORAGE_KEY = 'seed.assistant.width'
const DEFAULT_WIDTH_PX = 380
const MIN_WIDTH_PX = 280
/** The page keeps at least this share of the viewport, mirroring desktop's maxSize={40}. */
const MAX_WIDTH_FRACTION = 0.4
function clampWidth(width: number): number {
  const max = typeof window === 'undefined' ? Infinity : Math.max(MIN_WIDTH_PX, window.innerWidth * MAX_WIDTH_FRACTION)
  return Math.min(Math.max(width, MIN_WIDTH_PX), max)
}

/** Panel width in pixels, persisted across visits. Read after mount so SSR needs no width. */
function usePanelWidth(): [number, (width: number) => void] {
  const [width, setWidth] = useState(DEFAULT_WIDTH_PX)
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(WIDTH_STORAGE_KEY))
      if (Number.isFinite(stored) && stored > 0) setWidth(clampWidth(stored))
    } catch {
      // No storage: the default width is fine.
    }
  }, [])
  const update = useCallback((next: number) => {
    const clamped = clampWidth(next)
    setWidth(clamped)
    try {
      window.localStorage.setItem(WIDTH_STORAGE_KEY, String(Math.round(clamped)))
    } catch {
      // ignore
    }
  }, [])
  return [width, update]
}

/**
 * Hosts the agents assistant panel beside the page, the way desktop's main window does.
 *
 * Mounted once, above the Remix outlet, so route changes never remount it: the panel keeps its
 * transcript, composer draft, scroll position, and WebSocket subscriptions while the page behind it
 * changes. The page-scoped contexts it needs — in-app navigation for dialogs and links, and the
 * current route for the window context it attaches to every send — are re-provided from the
 * site-context bridge, which the page on screen keeps up to date.
 *
 * Layout: a flex row whose first column is always the page — rendered whether or not the panel is
 * open, so toggling never remounts the page either — and whose second column, when open, is a
 * draggable divider plus a sticky full-height aside. Pages that scroll the window keep doing so;
 * the aside sticks to the viewport beside them. Narrow screens have no room for a split: the panel
 * takes the whole viewport and a "Back to page" bar returns to the page without closing the panel's
 * state, so reopening it from the account menu lands back in the same chat.
 */
export function WebAssistantHost({children}: {children: React.ReactNode}) {
  const panel = useAssistantPanel()
  const media = useMedia()
  const isMobile = media.xs
  const [width, setWidth] = usePanelWidth()
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{
    x: number
    width: number
  } | null>(null)
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      dragStart.current = {
        x: event.clientX,
        width,
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setDragging(true)
    },
    [width],
  )
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStart.current) return
      // The divider sits on the aside's left edge: dragging left widens the panel.
      setWidth(dragStart.current.width + (dragStart.current.x - event.clientX))
    },
    [setWidth],
  )
  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setDragging(false)
  }, [])
  const showSidePanel = panel.isOpen && !isMobile
  const showFullScreen = panel.isOpen && isMobile
  return (
    <div
      className={cn(
        stylex.props(styles.s1dd0bfd2).className || '',
        stylex.props(dragging && styles_3.s9cf2edc1).className || '',
      )}
    >
      <div className={stylex.props(styles_2.se30fd43e).className || ''}>{children}</div>
      {showSidePanel ? (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize agents panel"
            className={cn(
              stylex.props(
                styles_5.s1bd1f072,
                styles_5.scad131e9,
                styles_5.s696c5b8,
                styles_5.s5cf8731,
                styles_5.sf032ed6c,
                styles_5.s760cfea1,
              ).className || '',
              'panel-resize-handle',
              dragging && 'active',
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <aside
            aria-label="Agents"
            data-testid="web-assistant-panel"
            className={stylex.props(styles.s520c9021).className || ''}
            style={{
              width,
            }}
          >
            <PanelBody showClose />
          </aside>
        </>
      ) : null}
      {showFullScreen ? <FullScreenPanel onBack={panel.close} /> : null}
    </div>
  )
}

/** Narrow screens: the panel over the whole viewport, with a bar that returns to the page. */
function FullScreenPanel({onBack}: {onBack: () => void}) {
  // The page underneath must not scroll while the panel covers it, and Escape returns to the page
  // so nobody is stuck — the same courtesies the shared bottom sheet extends.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onBack])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agents"
      data-testid="web-assistant-panel-fullscreen"
      className={stylex.props(styles.sb03e17cd).className || ''}
    >
      <div className={stylex.props(styles_4.s87a3738c).className || ''}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className={stylex.props(styles.s5d936fb).className || ''}
          aria-label="Back to page"
        >
          <ArrowLeft className={stylex.props(styles.sca3de968).className || ''} />
          Back to page
        </Button>
      </div>
      <div className={stylex.props(styles_4.s40a14ed2).className || ''}>
        <PanelBody />
      </div>
    </div>
  )
}

/**
 * The lazy panel under the current page's contexts. Before any page has published (first paint,
 * or a page outside the site shell) the panel has nothing to navigate with, so it waits.
 */
function PanelBody({showClose}: {showClose?: boolean}) {
  const site = useSiteContextSnapshot()
  if (!site) return <PanelLoading />
  return (
    <UniversalAppContext.Provider value={site.universal}>
      <NavContextProvider value={site.navigation}>
        <Suspense fallback={<PanelLoading />}>
          <WebAssistantPanelContent showClose={showClose} />
        </Suspense>
      </NavContextProvider>
    </UniversalAppContext.Provider>
  )
}
function PanelLoading() {
  return (
    <div className={stylex.props(styles.s3b59b99).className || ''}>
      <Spinner />
    </div>
  )
}
