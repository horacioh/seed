import * as stylex from '@stylexjs/stylex'
import {cn} from '../utils'

/**
 * A compact segmented control (pill toggle): a rounded muted track with the
 * active option shown as a raised light pill. Shared so any 2+-way choice looks
 * consistent across the apps.
 */
const styles = stylex.create({
  sdb2ddfa4: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'var(--overlay-10)',
    padding: 'calc(var(--spacing) * 1)',
  },
  s3432d27d: {
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-medium)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':disabled': {
      opacity: '50%',
    },
  },
  sfe496440: {
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    boxShadow: 'var(--shadow-sm)',
  },
  s34d53960: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    backgroundColor: 'transparent',
  },
})
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: {
    value: T
    label: string
  }[]
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn(stylex.props(styles.sdb2ddfa4).className || '', className)}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              stylex.props(styles.s3432d27d).className || '',
              stylex.props(active ? styles.sfe496440 : styles.s34d53960).className || '',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
