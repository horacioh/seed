import * as stylex from '@stylexjs/stylex'
import {cn} from './utils'
import * as React from 'react'
const styles = stylex.create({
  s3999bf0e: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderColor: 'currentcolor',
    borderRightColor: 'transparent',
  },
  s4d18f127: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '300ms',
  },
})
export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: 'small' | 'large'
  color?: string
  hide?: boolean
}

// Rendered as a <span> (not <div>) so it stays valid phrasing content — it is
// frequently placed inside <p>/<a> (e.g. the document-header author link), where
// a <div> triggers `validateDOMNesting` warnings and force-closes the <p>.
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({size = 'small', color, hide = false, className, ...props}, ref) => {
    const sizeClasses = {
      small: 'size-4 border-2',
      large: 'size-8 border-4',
    }
    return (
      <span
        ref={ref}
        className={cn(
          stylex.props(styles.s3999bf0e).className || '',
          stylex.props(styles.s4d18f127).className || '',
          hide ? 'opacity-0' : 'opacity-100',
          sizeClasses[size],
          className,
        )}
        style={{
          color: color || 'currentColor',
          ...props.style,
        }}
        {...props}
      />
    )
  },
)
Spinner.displayName = 'Spinner'
