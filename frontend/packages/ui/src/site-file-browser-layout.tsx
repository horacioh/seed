import * as stylex from '@stylexjs/stylex'
import type {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {IS_DESKTOP} from '@shm/shared/constants'
import {FolderTree, PanelLeft, X} from 'lucide-react'
import {createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels'
import {Button} from './button'
import {SiteFileBrowser} from './site-file-browser'
import {Tooltip} from './tooltip'
import {useMedia} from './use-media'

/** Collapse state of the inline file browser, shared with the page chrome below it. */
const styles_4 = stylex.create({
  s33458d: {
    marginTop: 'calc(0.25rem * 3)',
  },
})
const styles_3 = stylex.create({
  sdd15d0ce: {
    borderColor: 'var(--border)',
    display: 'none',
    height: '100%',
    width: 'calc(var(--spacing) * 72)',
    flexShrink: '0',
    flexDirection: 'column',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    backgroundColor: 'var(--surface)',
    '@media ((min-width: 768px))': {
      display: 'flex',
    },
  },
  s7924883e: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    height: 'calc(var(--spacing) * 9)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s54d5e841: {
    backgroundColor: 'var(--muted)',
    height: 'calc(var(--spacing) * 4)',
    width: 'calc(3/4 * 100%)',
    borderRadius: '0.25rem',
  },
  s2bacc67f: {
    backgroundColor: 'var(--muted)',
    height: 'calc(var(--spacing) * 4)',
    width: 'calc(2/3 * 100%)',
    borderRadius: '0.25rem',
  },
  s283a4bd: {
    backgroundColor: 'var(--muted)',
    height: 'calc(var(--spacing) * 4)',
    width: '50%',
    borderRadius: '0.25rem',
  },
  s5d90b3e0: {
    display: 'flex',
    height: '100%',
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'var(--surface)',
  },
  s5f75a25a: {
    '@media (prefers-reduced-motion: no-preference)': {
      animation: 'enter .15sease0s1normalnone',
      transitionDuration: '200ms',
      transitionTimingFunction: 'var(--ease-out)',
    },
    display: 'flex',
    height: '100dvh',
    width: '80dvw',
    maxWidth: '80dvw',
    flexShrink: '0',
    flexDirection: 'column',
    backgroundColor: 'var(--surface)',
    boxShadow: 'var(--shadow-2xl)',
  },
  s2d2b1042: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
    paddingBottom: 'calc(var(--spacing) * 2)',
  },
  sa92aabdd: {
    minHeight: 'calc(var(--spacing) * 0)',
    flex: '1',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  s622651f1: {
    '@media (prefers-reduced-motion: no-preference)': {
      animation: 'enter .15sease0s1normalnone',
      transitionDuration: '200ms',
      transitionTimingFunction: 'var(--ease-out)',
    },
    height: '100dvh',
    flex: '1',
    backgroundColor: 'color-mix(in oklab, var(--color-black) 45%, transparent)',
  },
  scf14577c: {
    borderColor: 'var(--border)',
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    backgroundColor: 'var(--surface)',
  },
  se10fba45: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    minHeight: 'calc(var(--spacing) * 0)',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'var(--surface)',
  },
  s992e3277: {
    position: 'absolute',
    top: 'calc(var(--spacing) * 2)',
    left: 'calc(var(--spacing) * 2)',
    zIndex: '50',
    '@media ((min-width: 768px))': {
      top: 'calc(var(--spacing) * 4)',
      right: 'calc(var(--spacing) * 4)',
      left: 'calc(var(--spacing) * 4)',
    },
  },
})
const styles_2 = stylex.create({
  s3d026a74: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
  },
  s76addcf3: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  s3680eae3: {
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    padding: 'calc(0.25rem * 3)',
  },
  s92c2336d: {
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
  },
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
const styles = stylex.create({
  s3e9812dd: {
    borderColor: 'var(--border)',
    display: 'flex',
    height: 'calc(0.25rem * 12)',
    flexShrink: '0',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
  },
  s80bea9bf: {
    position: 'fixed',
    inset: 'calc(0.25rem * 0)',
    zIndex: '50',
    display: 'flex',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  s2627021c: {
    color: 'var(--muted-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export interface SiteFileBrowserControls {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  /**
   * Claims the reveal button so the layout stops rendering its own floating
   * fallback. Returns a release callback.
   */
  claimRevealButton: () => () => void
}
const SiteFileBrowserContext = createContext<SiteFileBrowserControls | null>(null)

/** Returns the inline file browser controls, or null outside a site layout (Electron, embeds). */
export function useSiteFileBrowserControls(): SiteFileBrowserControls | null {
  return useContext(SiteFileBrowserContext)
}

/** Props for the responsive site file browser layout. */
export interface SiteFileBrowserLayoutProps {
  siteId: UnpackedHypermediaId
  activeDocumentId: UnpackedHypermediaId | null
  siteName: string
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  onNavigate: (id: UnpackedHypermediaId) => void
  onPrefetch?: (id: UnpackedHypermediaId) => void
  children: ReactNode
}

/** Places the site file browser inline on wide layouts and in a left drawer on mobile. */
export function SiteFileBrowserLayout({
  siteId,
  activeDocumentId,
  siteName,
  mobileOpen,
  onMobileOpenChange,
  onNavigate,
  onPrefetch,
  children,
}: SiteFileBrowserLayoutProps) {
  const media = useMedia()
  const isMobile = media.xs && !IS_DESKTOP
  const [isClient, setIsClient] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const desktopContainerRef = useRef<HTMLDivElement>(null)
  const browserPanelRef = useRef<ImperativePanelHandle>(null)
  const [minimumPercent, setMinimumPercent] = useState(20)
  const [revealClaims, setRevealClaims] = useState(0)
  const didSetInitialWidth = useRef(false)
  const browser = (
    <SiteFileBrowser
      siteId={siteId}
      activeDocumentId={activeDocumentId}
      onNavigate={onNavigate}
      onPrefetch={onPrefetch}
    />
  )
  // Only the inline (wide) layout has a collapse affordance; the mobile drawer is
  // opened from the site header, so page chrome below gets no controls there.
  const controls = useMemo<SiteFileBrowserControls>(
    () => ({
      collapsed,
      setCollapsed,
      claimRevealButton: () => {
        setRevealClaims((claims) => claims + 1)
        return () => setRevealClaims((claims) => claims - 1)
      },
    }),
    [collapsed],
  )
  useEffect(() => {
    setIsClient(true)
  }, [])
  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMobileOpenChange(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.documentElement.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileOpen, onMobileOpenChange])
  useEffect(() => {
    if (isMobile || !desktopContainerRef.current) return
    const updateConstraints = () => {
      const width = desktopContainerRef.current?.getBoundingClientRect().width ?? 0
      if (!width) return
      setMinimumPercent(Math.min(40, (240 / width) * 100))
      if (!didSetInitialWidth.current) {
        browserPanelRef.current?.resize(Math.min(40, (288 / width) * 100))
        didSetInitialWidth.current = true
      }
    }
    updateConstraints()
    const observer = new ResizeObserver(updateConstraints)
    observer.observe(desktopContainerRef.current)
    return () => observer.disconnect()
  }, [isMobile])
  if (!isClient) {
    return (
      <div className={stylex.props(styles_2.s3d026a74).className || ''}>
        <aside className={stylex.props(styles_3.sdd15d0ce).className || ''}>
          <div className={stylex.props(styles.s3e9812dd).className || ''}>
            <p className={stylex.props(styles_2.s76addcf3).className || ''}>Documents</p>
          </div>
          <div className={stylex.props(styles_2.s3680eae3).className || ''}>
            <div className={stylex.props(styles_3.s7924883e).className || ''} />
            <div className={stylex.props(styles_4.s33458d).className || ''}>
              <div className={stylex.props(styles_3.s54d5e841).className || ''} />
              <div className={stylex.props(styles_3.s2bacc67f).className || ''} />
              <div className={stylex.props(styles_3.s283a4bd).className || ''} />
            </div>
          </div>
        </aside>
        <div className={stylex.props(styles_3.s5d90b3e0).className || ''}>{children}</div>
      </div>
    )
  }
  if (isMobile) {
    return (
      <>
        <div className={stylex.props(styles_2.s92c2336d).className || ''}>{children}</div>
        {mobileOpen
          ? createPortal(
              <div
                className={stylex.props(styles.s80bea9bf).className || ''}
                role="dialog"
                aria-modal="true"
                aria-label="File browser"
              >
                <aside className={stylex.props(styles_3.s5f75a25a).className || ''}>
                  <div className={stylex.props(styles_3.s2d2b1042).className || ''}>
                    <div className={stylex.props(styles_2.se30fd43e).className || ''}>
                      <p className={stylex.props(styles.s62c182b1).className || ''}>Files</p>
                      <p className={stylex.props(styles.s2627021c).className || ''}>{siteName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close file browser"
                      onClick={() => onMobileOpenChange(false)}
                    >
                      <X className={stylex.props(styles.sca3de968).className || ''} />
                    </Button>
                  </div>
                  <div className={stylex.props(styles_3.sa92aabdd).className || ''}>{browser}</div>
                </aside>
                <button
                  type="button"
                  aria-label="Close file browser"
                  className={stylex.props(styles_3.s622651f1).className || ''}
                  onClick={() => onMobileOpenChange(false)}
                />
              </div>,
              document.body,
            )
          : null}
      </>
    )
  }
  return (
    <SiteFileBrowserContext.Provider value={controls}>
      <div ref={desktopContainerRef} className={stylex.props(styles_2.s3d026a74).className || ''}>
        <PanelGroup direction="horizontal" className={stylex.props(styles_2.s92c2336d).className || ''}>
          {!collapsed ? (
            <>
              <Panel
                id="site-file-browser"
                ref={browserPanelRef}
                order={1}
                defaultSize={24}
                minSize={minimumPercent}
                maxSize={40}
              >
                <aside className={stylex.props(styles_3.scf14577c).className || ''}>
                  <div className={stylex.props(styles.s3e9812dd).className || ''}>
                    <p className={stylex.props(styles_2.s76addcf3).className || ''}>Documents</p>
                    <Tooltip content="Hide file explorer">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Collapse file browser"
                        onClick={() => setCollapsed(true)}
                      >
                        <PanelLeft className={stylex.props(styles.sca3de968).className || ''} />
                      </Button>
                    </Tooltip>
                  </div>
                  <div className={stylex.props(styles_2.s92c2336d).className || ''}>{browser}</div>
                </aside>
              </Panel>
              <PanelResizeHandle className="panel-resize-handle" />
            </>
          ) : null}
          <Panel id="site-main-content" order={2} minSize={60}>
            <div className={stylex.props(styles_3.se10fba45).className || ''}>
              {collapsed && revealClaims === 0 ? (
                <div className={stylex.props(styles_3.s992e3277).className || ''}>
                  <Tooltip content="Show file explorer">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open file browser"
                      onClick={() => setCollapsed(false)}
                    >
                      <FolderTree className={stylex.props(styles.sca3de968).className || ''} />
                    </Button>
                  </Tooltip>
                </div>
              ) : null}
              {children}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </SiteFileBrowserContext.Provider>
  )
}
