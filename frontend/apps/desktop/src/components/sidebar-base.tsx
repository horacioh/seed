import {useSidebarContext} from '@/sidebar-context'
import {useStream} from '@shm/shared/use-stream'
import useMedia from '@shm/ui/use-media'
import {cn} from '@shm/ui/utils'
import {ReactNode, useEffect, useLayoutEffect, useRef} from 'react'
import {ImperativePanelHandle, Panel, PanelResizeHandle} from 'react-resizable-panels'

export function GenericSidebarContainer({
  children,
  footer,
}: {
  children: ReactNode
  footer?: (props: {isVisible?: boolean}) => ReactNode
}) {
  const ctx = useSidebarContext()
  const isLocked = useStream(ctx.isLocked)

  const sidebarWidth = useStream(ctx.sidebarWidth)
  const ref = useRef<ImperativePanelHandle>(null)
  const panelContentRef = useRef<HTMLElement>(null)
  const prevIsLocked = useRef<boolean | undefined>(undefined)
  const media = useMedia()

  // Enforce 250px minimum when locking sidebar open.
  // useEffect (not useLayoutEffect) so it runs after Panel's own layout-effect
  // registration completes — avoids "Panel size not found" assertion when the
  // imperative ref is invoked before the PanelGroup has the panel in its map.
  useEffect(() => {
    const isOpening = prevIsLocked.current === false && isLocked === true
    const isInitialMount = prevIsLocked.current === undefined && isLocked === true

    const panel = ref.current
    if (!panel) return

    const safeResize = (pct: number) => {
      try {
        panel.resize(pct)
      } catch (error) {
        console.log('[250px constraint] Panel operation failed (panel not ready yet):', error)
      }
    }
    const safeExpand = () => {
      try {
        panel.expand()
      } catch (error) {
        console.log('[250px constraint] Panel operation failed (panel not ready yet):', error)
      }
    }
    const safeCollapse = () => {
      try {
        panel.collapse()
      } catch (error) {
        console.log('[250px constraint] Panel operation failed (panel not ready yet):', error)
      }
    }

    if (isLocked && (isOpening || isInitialMount)) {
      // Use requestAnimationFrame to ensure layout is complete before measuring
      requestAnimationFrame(() => {
        const containerWidth = window.innerWidth
        const storedPercent = sidebarWidth || 15
        const pixelValue = (storedPercent / 100) * containerWidth

        if (pixelValue < 250) {
          const newPercent = Math.min(30, (250 / containerWidth) * 100)
          // console.log('[250px constraint] Adjusting to:', newPercent)
          safeResize(newPercent)
          ctx.onSidebarResize(newPercent)
        }
        safeExpand()
      })
    } else if (isLocked && !isOpening && !isInitialMount) {
      safeResize(sidebarWidth || 15)
      safeExpand()
    } else if (!isLocked) {
      safeCollapse()
    }

    prevIsLocked.current = isLocked
  }, [isLocked, sidebarWidth, ctx])

  // When window shrinks past the breakpoint, close the sidebar (and restore it when growing back)
  const prevMediaGtSm = useRef(media.gtSm)
  const wasLockedBeforeCollapse = useRef(false)
  useLayoutEffect(() => {
    if (prevMediaGtSm.current && !media.gtSm) {
      if (isLocked) {
        wasLockedBeforeCollapse.current = true
        ctx.onCloseSidebar()
        if (panelContentRef.current?.contains(document.activeElement)) {
          document.getElementById('main-content')?.focus()
        }
      }
    } else if (!prevMediaGtSm.current && media.gtSm) {
      if (wasLockedBeforeCollapse.current) {
        wasLockedBeforeCollapse.current = false
        ctx.onLockSidebarOpen()
      }
    }
    prevMediaGtSm.current = media.gtSm
  }, [media.gtSm])

  useLayoutEffect(() => {
    const element = panelContentRef.current
    if (!element) return

    const updateSidebarWidthPx = () => {
      if (!isLocked) return
      const width = element.getBoundingClientRect().width
      if (width > 0) ctx.onSidebarWidthPxChange(width)
    }

    updateSidebarWidthPx()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateSidebarWidthPx)
      return () => {
        window.removeEventListener('resize', updateSidebarWidthPx)
      }
    }

    const resizeObserver = new ResizeObserver(updateSidebarWidthPx)
    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ctx, isLocked])

  return (
    <>
      <Panel
        defaultSize={sidebarWidth}
        minSize={10}
        maxSize={30}
        ref={ref}
        collapsible
        id="sidebar"
        order={1}
        className="h-full overflow-hidden"
        onResize={(size) => {
          ctx.onSidebarResize(size)
        }}
      >
        <nav
          ref={panelContentRef}
          aria-label="Sidebar"
          data-a11y-region="sidebar"
          hidden={!isLocked}
          tabIndex={-1}
          className={cn(
            'relative h-full w-full flex-col transition-all duration-200 ease-in-out',
            isLocked ? 'flex' : 'hidden',
          )}
        >
          {isLocked ? (
            <PanelResizeHandle
              aria-label="Resize sidebar"
              className="panel-resize-handle focus-visible:ring-ring absolute top-0 right-0 z-10 h-full focus-visible:ring-2"
            />
          ) : null}
          <div className="flex-1 overflow-y-auto pb-8">{children}</div>
          {footer ? <div className="w-full items-end">{footer({isVisible: isLocked})}</div> : null}
        </nav>
      </Panel>
    </>
  )
}
