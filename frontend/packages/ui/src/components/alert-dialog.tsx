import * as stylex from '@stylexjs/stylex'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'
import {buttonVariants, type ButtonVariantProps} from '../button'
import {modalContent, overlay} from '../animation-keyframes'
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
  s62362947: {
    maxHeight: '90vh',
  },
  scdbaf625: {
    width: '100%',
  },
  scae0c05e: {
    maxWidth: 'calc(100% - 2rem)',
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
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
  s8c9099f9: {
    transitionDuration: '200ms',
  },
  s9315a67a: {
    '@media ((min-width: 640px))': {
      maxWidth: '32rem',
    },
  },
})
const styles_3 = stylex.create({
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
  s5df6e672: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    padding: 'calc(0.25rem * 6)',
  },
})
const styles = stylex.create({
  saf49316c: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
function AlertDialog({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}
function AlertDialogTrigger({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}
function AlertDialogPortal({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}
function AlertDialogOverlay({className, ...props}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
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
  )
}
function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          stylex.props(
            styles_4.s436dc7b6,
            styles_4.s5cee774,
            styles_4.s3beb7e48,
            styles_4.sb043ed16,
            styles_4.s3824ce,
            styles_4.s2ffff9,
            styles_4.s62362947,
            styles_4.scdbaf625,
            styles_4.scae0c05e,
            styles_4.s67e351ac,
            styles_4.s92852dd5,
            styles_4.sf799889b,
            styles_4.sad8c742c,
            styles_4.s8a6c2948,
            styles_4.s8c9099f9,
            styles_4.s9315a67a,
            modalContent.base,
            styles_6.s97078f79,
            styles_6.sfee8bc58,
          ).className || '',
          className,
        )}
        {...props}
      >
        <div className={stylex.props(styles_2.s5df6e672).className || ''}>{children}</div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}
function AlertDialogHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(stylex.props(styles_3.sc91ae224).className || '', className)}
      {...props}
    />
  )
}
function AlertDialogFooter({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(stylex.props(styles_3.s2de48f95).className || '', className)}
      {...props}
    />
  )
}
function AlertDialogTitle({className, ...props}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(stylex.props(styles.saf49316c).className || '', className)}
      {...props}
    />
  )
}
function AlertDialogDescription({className, ...props}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(stylex.props(styles.sa56e915f).className || '', className)}
      {...props}
    />
  )
}
function AlertDialogAction({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & ButtonVariantProps) {
  // When asChild, the child (e.g. a styled Button) owns its classes — applying
  // buttonVariants here too would concatenate two variants' classes and let
  // stylesheet order pick the winner (red button, wrong text color).
  return (
    <AlertDialogPrimitive.Action
      className={
        props.asChild
          ? className
          : cn(
              buttonVariants({
                variant,
                size,
                className,
              }),
            )
      }
      {...props}
    />
  )
}
function AlertDialogCancel({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & ButtonVariantProps) {
  return (
    <AlertDialogPrimitive.Cancel
      className={
        props.asChild
          ? className
          : cn(
              buttonVariants({
                variant: variant ?? 'outline',
                size,
                className,
              }),
            )
      }
      {...props}
    />
  )
}
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
