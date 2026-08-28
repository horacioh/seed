import * as stylex from '@stylexjs/stylex'
import {cn} from './utils'
const styles_2 = stylex.create({
  s89613ca9: {
    minHeight: 'calc(0.25rem * 6)',
    flex: 'none',
    alignItems: 'center',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
})
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
        stylex.props(styles_2.s89613ca9).className || '',
        className,
      )}
    >
      {children}
    </div>
  )
}
