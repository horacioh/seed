import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {cn} from '../utils'

const styles = stylex.create({
  base: {
    display: 'flex',
    width: '100%',
    minWidth: 0,
    height: '2.25rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--input-surface)',
    color: 'var(--foreground)',
    padding: '0.25rem 0.75rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    lineHeight: '1.5rem',
    outline: 'none',
    transitionProperty: 'box-shadow',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    '::file-selector-button': {
      color: 'var(--foreground)',
    },
    '::placeholder': {
      color: 'var(--muted-foreground)',
    },
    '::selection': {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    },
    '@media (min-width: 768px)': {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  },
  variantDefault: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    },
  },
  variantUnstyled: {
    ':focus-visible': {
      borderColor: 'transparent',
      boxShadow: '0 0 0 3px transparent',
    },
  },
})

const ariaFallback =
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'

export type InputVariant = 'default' | 'unstyled'

export interface InputProps extends React.ComponentProps<'input'> {
  onChangeText?: (value: string) => void
  variant?: InputVariant
}

function inputClassName({variant = 'default', className}: {variant?: InputVariant; className?: string}) {
  return cn(
    stylex.props(styles.base, variant === 'unstyled' ? styles.variantUnstyled : styles.variantDefault).className,
    ariaFallback,
    className,
  )
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({className, type, onChangeText, onChange, variant = 'default', ...props}, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={inputClassName({variant, className})}
        onChange={(e) => {
          if (onChangeText) {
            onChangeText(e.target.value)
          } else {
            onChange?.(e)
          }
        }}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
