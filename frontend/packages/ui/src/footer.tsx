import * as stylex from '@stylexjs/stylex'
import {cn} from './utils'
const styles = stylex.create({
  s7a93f9df: {
    marginInline: 'calc(0.25rem * -1)',
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
    paddingBlock: 'calc(0.25rem * 0)',
  },
})
interface FooterWrapperProps {
  children?: React.ReactNode
  className?: string
}
export function FooterWrapper({children, className}: FooterWrapperProps) {
  return (
    <div
      className={cn(
        stylex.props(styles.s7a93f9df).className || '',
        'min-h-6 flex-none items-center select-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
