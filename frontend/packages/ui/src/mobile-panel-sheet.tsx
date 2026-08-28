import * as stylex from '@stylexjs/stylex'
import {useCallback, useEffect, useId, useRef, useState} from 'react'
import type {PointerEvent as ReactPointerEvent, ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {Button} from './button'
import {Close} from './icons'
import {Text} from './text'
import {cn} from './utils'
const styles_4 = stylex.create({
  sd5b2c253: {
    pointerEvents: 'auto',
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_3 = stylex.create({
  sd5b893dc: {
    pointerEvents: 'none',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_2 = stylex.create({
  scdba75bb: {
    position: 'fixed',
    inset: 'calc(var(--spacing) * 0)',
    zIndex: '50',
    display: 'flex',
    height: '100dvh',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'color-mix(in oklab, var(--color-black) 25%, transparent)',
    paddingTop: 'calc(var(--spacing) * 10)',
    WebkitBackdropFilter: 'blur(2px)',
    backdropFilter: 'blur(2px)        ',
  },
  s411844c6: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
    transitionDuration: '200ms',
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
  s566ebbaa: {
    pointerEvents: 'none',
    opacity: '0%',
  },
  s24ced1d2: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    display: 'flex',
    height: '90dvh',
    maxHeight: '90dvh',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderTopLeftRadius: 'var(--radius-3xl)',
    borderTopRightRadius: 'var(--radius-3xl)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    boxShadow: '0 -20px 60px rgba(0,0,0,0.22)',
  },
  sce520b1d: {
    willChange: 'transform',
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
  s879a70b0: {
    transitionProperty: 'none',
  },
  s7d993993: {
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
    transitionDuration: '300ms',
  },
  s89d1ab86: {
    cursor: 'grab',
    touchAction: 'none',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 6)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    ':active': {
      cursor: 'grabbing',
    },
  },
  sa534fd37: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 30%, transparent)',
    display: 'block',
    height: 'calc(var(--spacing) * 1.5)',
    width: 'calc(var(--spacing) * 12)',
    borderRadius: 'calc(infinity * 1px)',
  },
  sc231eb58: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
})
const styles = stylex.create({
  sd7a601ea: {
    display: 'flex',
    flexShrink: '0',
    justifyContent: 'center',
    paddingTop: 'calc(0.25rem * 2)',
  },
  s1142a765: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 2)',
    textAlign: 'left',
  },
  sb42feb5d: {
    flex: '1',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export interface MobilePanelSheetProps {
  /** Whether the panel is open */
  isOpen: boolean
  /** Panel title */
  title: string
  /** Callback when close button is clicked */
  onClose: () => void
  /** Panel content */
  children: ReactNode
}
export function MobilePanelSheet({isOpen, title, onClose, children}: MobilePanelSheetProps) {
  const titleId = useId()
  const [isVisible, setIsVisible] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false)
      setDragY(0)
      setIsDragging(false)
      return
    }
    const frame = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  // Lock body scroll while the sheet is open, and clean up on unmount
  // to prevent the user from getting stuck with a non-scrollable page.
  useEffect(() => {
    if (!isOpen) return
    const html = document.documentElement
    const body = document.body
    const scrollY = window.scrollY
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyPosition = body.style.position
    const prevBodyTop = body.style.top
    const prevBodyWidth = body.style.width
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.position = prevBodyPosition
      body.style.top = prevBodyTop
      body.style.width = prevBodyWidth
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Close on Escape key so the user is never stuck with the panel open
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )
  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])
  const handleDragStart = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }, [])
  const handleDragMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!isDragging) return
      const nextY = event.clientY - dragStartY.current
      setDragY(nextY < 0 ? Math.max(nextY * 0.25, -24) : nextY)
    },
    [isDragging],
  )
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const closeThreshold = Math.min(160, window.innerHeight * 0.18)
    if (dragY > closeThreshold) {
      onClose()
    }
    setDragY(0)
  }, [dragY, isDragging, onClose])

  // Portal to document.body to escape ancestor transforms (e.g. transform-gpu on SiteHeader)
  // which break position:fixed by creating a new containing block.
  return createPortal(
    <div
      data-slot="mobile-panel-overlay"
      onClick={onClose}
      className={cn(
        stylex.props(styles_2.scdba75bb).className || '',
        stylex.props(styles_2.s411844c6).className || '',
        isOpen
          ? (stylex.props(styles_4.sd5b2c253).className || '') +
              ' ' +
              (isVisible
                ? stylex.props(styles_4.s486c2d2f).className || ''
                : stylex.props(styles_4.s765a26ee).className || '')
          : stylex.props(styles_3.sd5b893dc, styles_3.s765a26ee).className || '',
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-slot="mobile-panel-sheet"
        onClick={(event) => event.stopPropagation()}
        style={{
          transform: isOpen && isVisible ? `translateY(${dragY}px)` : 'translateY(2rem)',
        }}
        className={cn(
          stylex.props(styles_2.s24ced1d2).className || '',
          stylex.props(styles_2.sce520b1d).className || '',
          stylex.props(isDragging ? styles_2.s879a70b0 : styles_2.s7d993993).className || '',
        )}
      >
        <div className={stylex.props(styles.sd7a601ea).className || ''}>
          <button
            type="button"
            aria-label="Drag panel"
            data-slot="mobile-panel-drag-handle"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className={stylex.props(styles_2.s89d1ab86).className || ''}
          >
            <span aria-hidden="true" className={stylex.props(styles_2.sa534fd37).className || ''} />
          </button>
        </div>

        {/* Header */}
        <div className={stylex.props(styles.s1142a765).className || ''}>
          <Text id={titleId} weight="semibold" className={stylex.props(styles.sb42feb5d).className || ''}>
            {title}
          </Text>

          <Button
            aria-label="Close panel"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={stylex.props(styles.sf032ed6c).className || ''}
          >
            <Close className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        </div>

        {/* Content */}
        <div className={stylex.props(styles_2.sc231eb58).className || ''}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
