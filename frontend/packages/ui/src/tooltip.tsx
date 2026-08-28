import * as stylex from '@stylexjs/stylex'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'
import {floatingContent} from './animation-keyframes'
import {cn} from './utils'
const tooltipTheme = stylex.create({
  base: {
    backgroundColor: {
      default: '#000',
      ':is(.dark *)': '#fff',
    },
    color: {
      default: '#fff',
      ':is(.dark *)': '#000',
    },
  },
})
const styles_2 = stylex.create({
  s3fbaeb7a: {
    transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
  },
  s3824ce: {
    zIndex: '50',
  },
  s6a2edbb: {
    width: 'fit-content',
  },
  s15930ada: {
    maxWidth: '20rem',
  },
  s1a861a3c: {
    textWrap: 'balance',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
})
const styles = stylex.create({
  s961c867: {
    zIndex: '49',
    width: '0.625rem',
    height: '0.625rem',
    translate: '0 calc(-50% - 2px)',
    rotate: '45deg',
    borderRadius: '2px',
    backgroundColor: {
      default: '#000',
      ':is(.dark *)': '#fff',
    },
    fill: {
      default: '#000',
      ':is(.dark *)': '#fff',
    },
  },
})
export function Tooltip({
  content,
  side = 'top',
  children,
  delay = 200,
  asChild = false,
  contentClassName,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  delay?: number
  content: string
  side?: React.ComponentProps<typeof TooltipContent>['side']
  asChild?: boolean
  // Extra classes for the tooltip content.
  contentClassName?: string
}) {
  return (
    <TooltipPrimitive.Root data-slot="tooltip" {...props} delayDuration={delay}>
      <TooltipTrigger asChild>{asChild ? children : <span>{children}</span>}</TooltipTrigger>
      {content && (
        <TooltipContent side={side} className={contentClassName}>
          {content}
        </TooltipContent>
      )}
    </TooltipPrimitive.Root>
  )
}

// ================================================

export function TooltipProvider({delayDuration = 0, ...props}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}
function TooltipTrigger({...props}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          stylex.props(
            styles_2.s3fbaeb7a,
            styles_2.s3824ce,
            styles_2.s6a2edbb,
            styles_2.s15930ada,
            styles_2.s1a861a3c,
            styles_2.sf79988b7,
            styles_2.s34b1ae,
            styles_2.sc5dd13f4,
            styles_2.sab7cc79b,
            tooltipTheme.base,
            floatingContent.base,
            floatingContent.bottom,
            floatingContent.left,
            floatingContent.right,
            floatingContent.top,
          ).className || '',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className={stylex.props(styles.s961c867).className || ''} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
