import * as stylex from '@stylexjs/stylex'
import {cn} from '@shm/ui/utils'
import {ReactNode} from 'react'
const styles_2 = stylex.create({
  sf96f2dc3: {
    marginInline: 'auto',
    display: 'flex',
    width: '100%',
    maxWidth: '80ch',
    flexShrink: '0',
    flexDirection: 'column',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingTop: 'calc(var(--spacing) * 6)',
  },
})
const styles = stylex.create({
  s566ebbaa: {
    pointerEvents: 'none',
    opacity: '0%',
  },
  s34b56c: {
    paddingBlock: 'calc(0.25rem * 0)',
  },
})
interface ContainerProps {
  children: ReactNode
  hide?: boolean
  clearVerticalSpace?: boolean
  className?: string
}
export const Container = ({children, hide = false, clearVerticalSpace = false, className}: ContainerProps) => {
  return (
    <div
      className={cn(
        stylex.props(styles_2.sf96f2dc3).className || '',
        stylex.props(hide && styles.s566ebbaa).className || '',
        stylex.props(clearVerticalSpace && styles.s34b56c).className || '',
        className,
      )}
    >
      {children}
    </div>
  )
}
