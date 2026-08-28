import * as stylex from '@stylexjs/stylex'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {XIcon} from 'lucide-react'
import * as React from 'react'
import {modalContent, overlay, sideContent} from '../animation-keyframes'
import {cn} from '../utils'
const styles_6 = stylex.create({
  s97078f79: {
    transform: 'translate(-50%, 0)',
  },
  sfee8bc58: {
    transform: 'translate(0, -50%)',
  },
})
const styles_4 = stylex.create({
  s5cee774: {
    position: 'fixed',
  },
  s74a79380: {
    inset: 'calc(0.25rem * 0)',
  },
  s3824ce: {
    zIndex: '50',
  },
  s49d86571: {
    height: '100vh',
  },
  s199f2733: {
    backgroundColor: 'color-mix(in oklab, #000 50%, transparent)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s3beb7e48: {
    left: '50%',
  },
  sb043ed16: {
    top: '50%',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
  s8c9099f9: {
    transitionDuration: '200ms',
  },
  sf7998a1b: {
    borderRadius: '0.125rem',
  },
  s2ef10477: {
    ':focus': {
      outlineStyle: 'none',
      '@media (forced-colors: active)': {
        outline: '2px solid transparent',
        outlineOffset: '2px',
      },
    },
  },
  s67010d77: {
    position: 'absolute',
  },
  s478fb0c3: {
    right: 'calc(0.25rem * 4)',
  },
  s696c5bc: {
    top: 'calc(0.25rem * 4)',
  },
  saf5ba32b: {
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s8880a929: {
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sd4a248ef: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'oklch(37.3% 0.034 259.733)',
      },
    },
  },
  s4a7318b7: {
    ':focus': {
      boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
    },
  },
  sb8c216a5: {
    ':focus': {},
  },
  s854ec953: {
    ':focus': {},
  },
  s933f49de: {
    ':disabled': {
      pointerEvents: 'none',
    },
  },
  se911cb2c: {
    insetBlock: 'calc(0.25rem * 0)',
  },
  s478fb0bf: {
    right: 'calc(0.25rem * 0)',
  },
  scdbaf625: {
    width: '100%',
  },
  s8c21f341: {
    maxWidth: '440px',
  },
  s8a6c2ac1: {
    boxShadow: 'var(--shadow-xl)',
  },
})
const styles_3 = stylex.create({
  sea03b582: {
    maxHeight: 'calc(1vh * 100)',
    width: '100%',
    maxWidth: 'var(--container-xl)',
    '@media ((min-width: 640px))': {
      maxHeight: 'calc(1vh * 100 - 4rem)',
    },
  },
  sc91ae224: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
    textAlign: 'center',
    '@media ((min-width: 640px))': {
      textAlign: 'left',
    },
  },
  s2de48f95: {
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
    },
  },
})
const styles_2 = stylex.create({
  s5df6e671: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    padding: 'calc(0.25rem * 5)',
  },
  s5a2f838d: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
})
const styles = stylex.create({
  s88a3565a: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  sca2fef09: {
    WebkitBackdropFilter: 'blur(8px)',
    backdropFilter: 'blur(8px)        ',
  },
  s84ca715: {
    fontSize: '1.125rem',
    lineHeight: '1',
    fontWeight: '600',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
function Dialog({...props}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}
function DialogTrigger({...props}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}
function DialogPortal({...props}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}
function DialogClose({...props}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}
const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({className, ...props}, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      stylex.props(
        styles_4.s5cee774,
        styles_4.s74a79380,
        styles_4.s3824ce,
        styles_4.s49d86571,
        styles_4.s199f2733,
        overlay.base,
      ).className || '',
      className,
    )}
    {...props}
  />
))
function DialogContent({
  className,
  children,
  showCloseButton = true,
  contentClassName,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  contentClassName?: string
  style?: React.CSSProperties
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          stylex.props(
            styles_4.s436dc7b6,
            styles_4.s5cee774,
            styles_4.s3beb7e48,
            styles_4.sb043ed16,
            styles_4.s3824ce,
            styles_4.s2ffff9,
            styles_4.s67e351ac,
            styles_4.s92852dd5,
            styles_4.sf799889b,
            styles_4.s8a6c2948,
            styles_4.s8c9099f9,
            modalContent.base,
            styles_6.s97078f79,
            styles_6.sfee8bc58,
          ).className || '',
          // Default sizing only if no custom className is provided
          stylex.props(!className ? styles_3.sea03b582 : null).className || '',
          className,
        )}
        style={style}
        {...props}
      >
        <div className={cn(stylex.props(styles_2.s5df6e671).className || '', contentClassName)}>
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className={
                stylex.props(
                  styles_4.sf7998a1b,
                  styles_4.s2ef10477,
                  styles_4.s67010d77,
                  styles_4.s478fb0c3,
                  styles_4.s696c5bc,
                  styles_4.saf5ba32b,
                  styles_4.s8880a929,
                  styles_4.sd4a248ef,
                  styles_4.s4a7318b7,
                  styles_4.sb8c216a5,
                  styles_4.s854ec953,
                  styles_4.s933f49de,
                ).className || ''
              }
            >
              <XIcon />
              <span className={stylex.props(styles.s88a3565a).className || ''}>Close</span>
            </DialogPrimitive.Close>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * Right-side panel variant of {@link DialogContent}: a full-height panel
 * pinned to the right edge over a dimmed, blurred backdrop.
 */
function DialogSideContent({
  className,
  children,
  contentClassName,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  contentClassName?: string
  style?: React.CSSProperties
}) {
  return (
    <DialogPortal data-slot="dialog-side-portal">
      <DialogOverlay className={stylex.props(styles.sca2fef09).className || ''} />
      <DialogPrimitive.Content
        data-slot="dialog-side-content"
        className={cn(
          stylex.props(
            styles_4.s436dc7b6,
            styles_4.s5cee774,
            styles_4.se911cb2c,
            styles_4.s478fb0bf,
            styles_4.s3824ce,
            styles_4.s2ffff9,
            styles_4.scdbaf625,
            styles_4.s8c21f341,
            styles_4.s67e351ac,
            styles_4.s92852dd5,
            styles_4.s8a6c2ac1,
            styles_4.s8c9099f9,
            sideContent.base,
          ).className || '',
          className,
        )}
        style={style}
        {...props}
      >
        <div className={cn(stylex.props(styles_2.s5a2f838d).className || '', contentClassName)}>{children}</div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}
function DialogHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(stylex.props(styles_3.sc91ae224).className || '', className)}
      {...props}
    />
  )
}
function DialogFooter({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(stylex.props(styles_3.s2de48f95).className || '', className)}
      {...props}
    />
  )
}
function DialogTitle({className, ...props}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(stylex.props(styles.s84ca715).className || '', className)}
      {...props}
    />
  )
}
function DialogDescription({className, ...props}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(stylex.props(styles.sa56e915f).className || '', className)}
      {...props}
    />
  )
}
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogSideContent,
  DialogTitle,
  DialogTrigger,
}
