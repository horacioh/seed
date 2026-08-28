import * as stylex from '@stylexjs/stylex'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'
import {floatingContent} from '../animation-keyframes'
import {cn} from '../utils'
const styles = stylex.create({
  s56bd391d: {
    backgroundColor: 'var(--popover)',
  },
  s9a29c60b: {
    color: 'var(--popover-foreground)',
  },
  s6148939c: {
    transformOrigin: 'var(--radix-popover-content-transform-origin)',
  },
  s254b9195: {
    outlineStyle: 'none',
    '@media (forced-colors: active)': {
      outline: '2px solid transparent',
      outlineOffset: '2px',
    },
  },
  s3824ce: {
    zIndex: '50',
  },
  se2d22e8c: {
    maxHeight: '80dvh',
  },
  sc6b360a5: {
    maxHeight: 'calc(var(--vvh, 1vh) * 80)',
  },
  sbdc6b730: {
    width: 'min(92vw, 18rem)',
  },
  s21707c9a: {
    overflow: 'auto',
  },
  s32880ba8: {
    overscrollBehavior: 'contain',
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
export type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>
function Popover({...props}: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}
function PopoverTrigger({children, ...props}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  )
}
function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          stylex.props(
            styles.s56bd391d,
            styles.s9a29c60b,
            styles.s6148939c,
            styles.s254b9195,
            styles.s3824ce,
            styles.se2d22e8c,
            styles.sc6b360a5,
            styles.sbdc6b730,
            styles.s21707c9a,
            styles.s32880ba8,
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
    </PopoverPrimitive.Portal>
  )
}
function PopoverAnchor({...props}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}
export {Popover, PopoverAnchor, PopoverContent, PopoverTrigger}
