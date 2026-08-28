import * as stylex from '@stylexjs/stylex'
import {Slot} from '@radix-ui/react-slot'
import {Loader2} from 'lucide-react'
import * as React from 'react'
import {cn} from './utils'
const styles = stylex.create({
  loader: {
    animation: 'spin 1s linear infinite',
  },
  base: {
    display: 'inline-flex',
    userSelect: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
    borderRadius: '0.375rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 500,
    outline: 'none',
    flexShrink: 0,
    transitionProperty: 'all',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ':disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
    ':focus-visible': {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    },
  },
  variantDefault: {
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--primary) 90%, transparent)',
    },
  },
  variantDestructive: {
    backgroundColor: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--destructive) 90%, transparent)',
    },
    ':focus-visible': {
      boxShadow: 'var(--ring-destructive)',
    },
  },
  variantOutline: {
    backgroundColor: 'var(--input)',
    color: 'var(--foreground)',
    border: '1px solid var(--border-outline)',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--background)',
      color: 'var(--accent-foreground)',
      boxShadow: 'var(--shadow-md)',
    },
  },
  variantSecondary: {
    backgroundColor: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--secondary) 80%, transparent)',
    },
  },
  variantAccent: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--accent) 80%, transparent)',
    },
  },
  variantGhost: {
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: 'var(--surface-hover)',
      color: 'var(--foreground)',
    },
    ':active': {
      backgroundColor: 'var(--overlay-5-10)',
    },
  },
  variantLink: {
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    borderColor: 'transparent',
    textDecoration: 'none',
    textUnderlineOffset: '4px',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  variantBrand: {
    backgroundColor: 'var(--brand)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--brand-4)',
    },
    ':active': {
      backgroundColor: 'var(--brand-3)',
    },
  },
  variantBrand12: {
    backgroundColor: 'var(--brand-12)',
    color: 'var(--foreground)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--brand-11)',
    },
    ':active': {
      backgroundColor: 'var(--brand-10)',
    },
  },
  variantBlue: {
    backgroundColor: 'var(--color-blue-700)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--color-blue-800)',
    },
  },
  variantGreen: {
    backgroundColor: 'var(--color-green-700)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--color-green-800)',
    },
  },
  variantOrange: {
    backgroundColor: 'var(--color-orange-700)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--color-orange-800)',
    },
  },
  variantInverse: {
    backgroundColor: 'var(--contrast)',
    color: 'var(--surface-contrast)',
    borderColor: 'transparent',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      backgroundColor: 'var(--contrast-90)',
    },
  },
  sizeXs: {
    height: '1.5rem',
    minWidth: '1.5rem',
    borderRadius: '0.375rem',
    gap: '0.375rem',
    paddingBlock: 0,
    paddingInline: {
      default: '0.5rem',
      ':has(> svg)': '0.375rem',
    },
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  sizeSm: {
    height: '2rem',
    minWidth: '2rem',
    borderRadius: '0.375rem',
    gap: '0.375rem',
    paddingBlock: 0,
    paddingInline: {
      default: '0.75rem',
      ':has(> svg)': '0.625rem',
    },
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  sizeDefault: {
    height: '2.25rem',
    minWidth: '2.25rem',
    paddingBlock: '0.5rem',
    paddingInline: {
      default: '1rem',
      ':has(> svg)': '0.75rem',
    },
  },
  sizeLg: {
    height: '2.5rem',
    minWidth: '2.5rem',
    borderRadius: '0.375rem',
    paddingBlock: 0,
    paddingInline: {
      default: '1.5rem',
      ':has(> svg)': '1rem',
    },
  },
  sizeIcon: {
    height: '2rem',
    width: '2rem',
    minWidth: '2rem',
    borderRadius: '0.375rem',
    paddingInline: {
      default: null,
      ':has(> svg)': '0.5rem',
    },
  },
  sizeIconSm: {
    height: '1.5rem',
    width: '1.5rem',
    minWidth: '1.5rem',
    borderRadius: '0.375rem',
    paddingInline: {
      default: null,
      ':has(> svg)': '0.25rem',
    },
  },
})
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'danger'
  | 'outline'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'link'
  | 'brand'
  | 'brand-12'
  | 'blue'
  | 'green'
  | 'orange'
  | 'inverse'
export type ButtonSize = 'xs' | 'sm' | 'default' | 'lg' | 'icon' | 'iconSm'
export interface ButtonVariantProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}
function variantStyle(variant: ButtonVariant) {
  switch (variant) {
    case 'default':
      return styles.variantDefault
    case 'destructive':
    case 'danger':
      return styles.variantDestructive
    case 'outline':
      return styles.variantOutline
    case 'secondary':
      return styles.variantSecondary
    case 'accent':
      return styles.variantAccent
    case 'ghost':
      return styles.variantGhost
    case 'link':
      return styles.variantLink
    case 'brand':
      return styles.variantBrand
    case 'brand-12':
      return styles.variantBrand12
    case 'blue':
      return styles.variantBlue
    case 'green':
      return styles.variantGreen
    case 'orange':
      return styles.variantOrange
    case 'inverse':
      return styles.variantInverse
  }
}
function sizeStyle(size: ButtonSize) {
  switch (size) {
    case 'xs':
      return styles.sizeXs
    case 'sm':
      return styles.sizeSm
    case 'lg':
      return styles.sizeLg
    case 'icon':
      return styles.sizeIcon
    case 'iconSm':
      return styles.sizeIconSm
    default:
      return styles.sizeDefault
  }
}
export function buttonVariants({variant = 'ghost', size = 'default', className}: ButtonVariantProps = {}) {
  return cn(stylex.props(styles.base, variantStyle(variant), sizeStyle(size)).className, className)
}
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    ButtonVariantProps & {
      asChild?: boolean
      loading?: boolean
    }
>(({className, variant, size, asChild = false, loading = false, children, ...props}, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className={stylex.props(styles.loader).className || ''} /> : null}
          {children}
        </>
      )}
    </Comp>
  )
})
Button.displayName = 'Button'
export function ButtonLink({className, variant, size, ...props}: React.ComponentProps<'a'> & ButtonVariantProps) {
  return (
    <a
      data-slot="button-link"
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    />
  )
}
export type ButtonProps = React.ComponentProps<'button'> &
  ButtonVariantProps & {
    asChild?: boolean
  }
