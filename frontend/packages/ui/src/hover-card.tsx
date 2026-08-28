import * as stylex from '@stylexjs/stylex'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import * as React from 'react'
import {floatingContent} from './animation-keyframes'
import {cn} from './utils'
const styles = stylex.create({
  s56bd391d: {
    backgroundColor: 'var(--popover)',
  },
  s9a29c60b: {
    color: 'var(--popover-foreground)',
  },
  s956a95cc: {
    transformOrigin: 'var(--radix-hover-card-content-transform-origin)',
  },
  s254b9195: {
    outlineStyle: 'none',
    '@media (forced-colors: active)': {
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },
  },
  s3824af: {
    zIndex: '40',
  },
  s36c7d4: {
    width: 'calc(0.25rem * 64)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
})
function HoverCard({openDelay = 100, ...props}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} {...props} />
}
function HoverCardTrigger({...props}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}
function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  side = 'top',
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        side={side}
        className={cn(
          stylex.props(
            styles.s56bd391d,
            styles.s9a29c60b,
            styles.s956a95cc,
            styles.s254b9195,
            styles.s3824af,
            styles.s36c7d4,
            styles.sf79988b7,
            styles.sad8c742c,
            styles.s1aa17,
            styles.s8a6c2964,
            floatingContent.base,
            floatingContent.bottom,
            floatingContent.left,
            floatingContent.right,
            floatingContent.top,
          ).className || '',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}
export {HoverCard, HoverCardContent, HoverCardTrigger}
