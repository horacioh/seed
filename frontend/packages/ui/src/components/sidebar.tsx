import * as stylex from '@stylexjs/stylex'
import {Slot} from '@radix-ui/react-slot'
import * as React from 'react'
import {cn} from '../utils'
const styles_7 = stylex.create({
  s4d716b15: {
    ':is([class~="group/menu-item"]:hover *)': {
      opacity: '100%',
    },
  },
  s206ed21b: {
    ':has([data-state="open"])': {
      opacity: '100%',
    },
  },
})
const styles_6 = stylex.create({
  s4daa174: {
    transform: 'translate(0, -50%)',
  },
})
const styles_5 = stylex.create({
  s5a075dd9: {
    ':is([data-active="true"])': {
      backgroundColor: 'var(--sidebar-accent)',
    },
  },
  s724e421f: {
    ':is([data-active="true"])': {
      color: 'var(--sidebar-accent-foreground)',
    },
  },
})
const styles_4 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s2ca27025: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--sidebar-accent)',
      },
    },
  },
  s99984b53: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--sidebar-accent-foreground)',
      },
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  sb601d1d4: {
    color: 'color-mix(in oklab, var(--sidebar-foreground) 70%, transparent)',
  },
  sde2b04b6: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--sidebar-foreground)',
      },
    },
  },
  s67010d77: {
    position: 'absolute',
  },
  s478fb0c0: {
    right: 'calc(0.25rem * 1)',
  },
  sbbfc415c: {
    top: '50%',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s765a26ee: {
    opacity: '0%',
  },
  se40e3bb5: {
    ':focus-within': {
      opacity: '100%',
    },
  },
})
const styles_3 = stylex.create({
  s6cb51ce7: {
    color: 'color-mix(in oklab, var(--sidebar-foreground) 70%, transparent)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    paddingInline: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s2597ab67: {
    color: 'color-mix(in oklab, var(--sidebar-foreground) 70%, transparent)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--sidebar-foreground)',
      },
    },
    display: 'flex',
    aspectRatio: '1 / 1',
    width: 'calc(var(--spacing) * 5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s5c652bfe: {
    color: 'color-mix(in oklab, var(--sidebar-foreground) 70%, transparent)',
    marginLeft: 'auto',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    fontVariantNumeric: '   tabular-nums ',
  },
})
const styles_2 = stylex.create({
  sb0664ded: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    overflow: 'auto',
  },
  s46fbdfb0: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s284935db: {
    display: 'flex',
    width: '100%',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
})
const styles = stylex.create({
  s21672183: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 2)',
  },
  sa1ca981b: {
    backgroundColor: 'var(--sidebar-border)',
    marginInline: 'calc(0.25rem * 2)',
    height: '1px',
    borderStyle: 'none',
  },
  s4beb63ff: {
    width: '100%',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
function SidebarHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(stylex.props(styles.s21672183).className || '', className)}
      {...props}
    />
  )
}
function SidebarContent({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(stylex.props(styles_2.sb0664ded).className || '', className)}
      {...props}
    />
  )
}
function SidebarFooter({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(stylex.props(styles.s21672183).className || '', className)}
      {...props}
    />
  )
}
function SidebarSeparator({className, ...props}: React.ComponentProps<'hr'>) {
  return (
    <hr
      data-slot="sidebar-separator"
      className={cn(stylex.props(styles.sa1ca981b).className || '', className)}
      {...props}
    />
  )
}
function SidebarGroup({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(stylex.props(styles_2.s46fbdfb0).className || '', className)}
      {...props}
    />
  )
}
function SidebarGroupLabel({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(stylex.props(styles_3.s6cb51ce7).className || '', className)}
      {...props}
    />
  )
}
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="sidebar-group-action"
      className={cn(stylex.props(styles_3.s2597ab67).className || '', className)}
      {...props}
    />
  )
}
function SidebarGroupContent({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn(stylex.props(styles.s4beb63ff).className || '', className)}
      {...props}
    />
  )
}
function SidebarMenu({className, ...props}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn(stylex.props(styles_2.s284935db).className || '', className)}
      {...props}
    />
  )
}
function SidebarMenuItem({className, ...props}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn(stylex.props(styles_4.sdef3facc).className || '', 'group/menu-item', className)}
      {...props}
    />
  )
}
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        stylex.props(
          styles_4.s2ca27025,
          styles_4.s99984b53,
          styles_4.s2ffff9,
          styles_4.scdbaf625,
          styles_4.sc6ed1702,
          styles_4.s5d936fb,
          styles_4.sf79988b7,
          styles_4.s34b1ad,
          styles_4.sc5dd13f4,
          styles_4.sab7cc6fa,
          styles_4.sa602a1e3,
        ).className || '',
        stylex.props(styles_5.s5a075dd9, styles_5.s724e421f).className || '',
        className,
      )}
      {...props}
    />
  )
}
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean
  }
>(({className, asChild = false, ...props}, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-action"
      className={cn(
        stylex.props(
          styles_4.sb601d1d4,
          styles_4.sde2b04b6,
          styles_4.s67010d77,
          styles_4.s478fb0c0,
          styles_4.sbbfc415c,
          styles_4.s2ffff9,
          styles_4.sc6ed1702,
          styles_4.sce22ca32,
          styles_4.sf79988b7,
          styles_4.s1aa14,
          styles_4.s765a26ee,
          styles_4.se40e3bb5,
        ).className || '',
        stylex.props(styles_6.s4daa174).className || '',
        stylex.props(styles_7.s4d716b15, styles_7.s206ed21b).className || '',
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = 'SidebarMenuAction'
function SidebarMenuBadge({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(stylex.props(styles_3.s5c652bfe).className || '', className)}
      {...props}
    />
  )
}
export {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarSeparator,
}
