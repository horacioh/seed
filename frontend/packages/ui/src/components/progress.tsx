import * as stylex from '@stylexjs/stylex'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'
import {cn} from '../utils'
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
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
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
