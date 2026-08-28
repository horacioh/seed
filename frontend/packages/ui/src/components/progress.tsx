import * as stylex from '@stylexjs/stylex'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'
import {cn} from '../utils'
const styles_2 = stylex.create({
  sbd58bedb: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 20%, transparent)',
    position: 'relative',
    height: 'calc(var(--spacing) * 2)',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
  },
})
const styles = stylex.create({
  s151ddbb7: {
    backgroundColor: 'var(--primary)',
    height: '100%',
    width: '100%',
    flex: '1',
    transitionProperty: 'all',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
})
function Progress({className, value, ...props}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(stylex.props(styles_2.sbd58bedb).className || '', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={stylex.props(styles.s151ddbb7).className || ''}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  )
}
export {Progress}
