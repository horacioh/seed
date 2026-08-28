import * as stylex from '@stylexjs/stylex'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'
import {cn} from '../utils'
const styles_2 = stylex.create({
  list: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    display: 'inline-flex',
    height: 'calc(var(--spacing) * 9)',
    width: 'fit-content',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    padding: '3px',
  },
})
const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1',
    outline: 'none',
  },
  trigger: {
    display: 'inline-flex',
    height: 'calc(100% - 1px)',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    borderRadius: '0.375rem',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    padding: '0.25rem 0.5rem',
    color: 'var(--text-dimmed)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transitionProperty: 'color, box-shadow',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ':disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
    ':focus-visible': {
      borderColor: 'var(--ring)',
      outline: '1px solid var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    },
  },
  // Active-tab chrome. In dark mode the active tab gets a visible border and tinted fill so it
  // reads as a raised surface against the muted list background.
  triggerActive: {
    backgroundColor: {
      default: null,
      ':is([data-state="active"])': 'var(--background)',
      ':is(.dark *):is([data-state="active"])': 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
    color: {
      default: 'var(--text-dimmed)',
      ':is(.dark *):is([data-state="active"])': 'var(--foreground)',
    },
    borderColor: {
      default: 'transparent',
      ':is(.dark *):is([data-state="active"])': 'var(--input)',
    },
    boxShadow: {
      default: null,
      ':is([data-state="active"])': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
  },
})
function Tabs({className, ...props}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(stylex.props(styles.root).className || '', className)}
      {...props}
    />
  )
}
function TabsList({className, ...props}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(stylex.props(styles_2.list).className || '', className)}
      {...props}
    />
  )
}
function TabsTrigger({className, ...props}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(stylex.props(styles.trigger, styles.triggerActive).className || '', className)}
      {...props}
    />
  )
}
function TabsContent({className, ...props}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(stylex.props(styles.content).className || '', className)}
      {...props}
    />
  )
}
export {Tabs, TabsContent, TabsList, TabsTrigger}
