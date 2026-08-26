import * as stylex from '@stylexjs/stylex'
import {cn} from '../utils'
const styles = stylex.create({
  s86be8218: {
    backgroundColor: 'var(--accent)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
})
function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn(stylex.props(styles.s86be8218).className || '', className)} {...props} />
  )
}
export {Skeleton}
