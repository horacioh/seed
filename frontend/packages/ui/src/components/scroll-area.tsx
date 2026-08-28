import * as stylex from '@stylexjs/stylex'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'
import {forwardRef} from 'react'
import {cn} from '../utils'
const styles_3 = stylex.create({
  s3e1d8f65: {
    ':focus-visible': {
      boxShadow: '0 0 0 3px currentcolor',
      outlineStyle: 'solid',
      outlineWidth: '1px',
    },
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: '1',
    borderRadius: 'inherit',
    transitionProperty: 'color, box-shadow',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    outlineStyle: 'none',
  },
})
const styles_2 = stylex.create({
  s975679fc: {
    height: '100%',
    width: 'calc(0.25rem * 2.5)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderLeftColor: 'transparent',
  },
  sebe30c1d: {
    height: 'calc(0.25rem * 2.5)',
    flexDirection: 'column',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderTopColor: 'transparent',
  },
})
const styles = stylex.create({
  s7d2ace5d: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  sdd09b949: {
    display: 'flex',
    touchAction: 'none',
    padding: '1px',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s6f86d42a: {
    backgroundColor: 'var(--border)',
    position: 'relative',
    flex: '1',
    borderRadius: 'calc(infinity * 1px)',
  },
})
function ScrollAreaImpl(
  {
    className,
    viewportClassName,
    fillViewportContent = false,
    children,
    onScroll,
    ...props
  }: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
    viewportClassName?: string
    fillViewportContent?: boolean
    onScroll?: (e: React.UIEvent<HTMLElement>) => void
  },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const scrollId = (props as any)['data-scroll-id']
  if (scrollId === 'main-document-scroll') {
    console.log('Main document ScrollArea rendering, onScroll:', !!onScroll)
  }
  const handleViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return

      // Wait a tick for Radix to set up its internal structure
      setTimeout(() => {
        // Check all possible scroll containers
        const viewport = node
        const firstChild = node.children[0] as HTMLElement
        if (fillViewportContent && firstChild) {
          // Radix uses an internal content wrapper; force it to fill viewport height.
          firstChild.style.display = 'flex'
          firstChild.style.flexDirection = 'column'
          firstChild.style.minHeight = '100%'
          firstChild.style.width = '100%'
        }
        const handleScroll = (e: Event) => {
          onScroll?.(e as any)
        }

        // Try both the viewport and its first child
        if (onScroll && viewport) {
          viewport.addEventListener('scroll', handleScroll, {
            passive: true,
          })
        }
        if (onScroll && firstChild) {
          firstChild.addEventListener('scroll', handleScroll, {
            passive: true,
          })
        }
      }, 100)
    },
    [onScroll, fillViewportContent],
  )
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn(stylex.props(styles.s7d2ace5d).className || '', className)}
      ref={ref}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={handleViewportRef}
        data-slot="scroll-area-viewport"
        className={cn(stylex.props(styles_3.s3e1d8f65).className || '', viewportClassName)}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
const ScrollArea = forwardRef(ScrollAreaImpl)
function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        stylex.props(styles.sdd09b949).className || '',
        stylex.props(orientation === 'vertical' && styles_2.s975679fc).className || '',
        stylex.props(orientation === 'horizontal' && styles_2.sebe30c1d).className || '',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={stylex.props(styles.s6f86d42a).className || ''}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}
export {ScrollArea, ScrollBar}
