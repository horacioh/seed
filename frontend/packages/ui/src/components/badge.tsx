import {Slot} from '@radix-ui/react-slot'
import * as React from 'react'

import {cn} from '../utils'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    width: 'fit-content',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    borderRadius: '0.375rem',
    border: '1px solid var(--border)',
    padding: '0 0.25rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 500,
    overflow: 'hidden',
    transitionProperty: 'color, box-shadow',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ':focus-visible': {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    },
  },
  variantDefault: {
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--primary) 90%, transparent)',
    },
  },
  variantSecondary: {
    backgroundColor: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--secondary) 90%, transparent)',
    },
  },
  variantAccent: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)',
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--accent) 90%, transparent)',
    },
  },
  variantDestructive: {
    backgroundColor: 'var(--destructive-surface)',
    color: 'white',
    borderColor: 'transparent',
    ':hover': {
      backgroundColor: 'color-mix(in oklch, var(--destructive) 90%, transparent)',
    },
    ':focus-visible': {
      boxShadow: 'var(--ring-destructive)',
    },
  },
  variantOutline: {
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    ':hover': {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    },
  },
  variantWarning: {
    backgroundColor: 'transparent',
    color: 'var(--color-yellow-500)',
    borderColor: 'var(--warning-border)',
    ':focus-visible': {
      boxShadow: 'var(--ring-warning)',
    },
  },
})

export type BadgeVariant = 'default' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'warning'

export interface BadgeProps extends React.ComponentProps<'span'> {
  variant?: BadgeVariant
  asChild?: boolean
}

function badgeStyle(variant: BadgeVariant) {
  switch (variant) {
    case 'default':
      return styles.variantDefault
    case 'secondary':
      return styles.variantSecondary
    case 'accent':
      return styles.variantAccent
    case 'destructive':
      return styles.variantDestructive
    case 'outline':
      return styles.variantOutline
    case 'warning':
      return styles.variantWarning
  }
}

export function Badge({className, variant = 'default', asChild = false, ...props}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(stylex.props(styles.base, badgeStyle(variant)).className, className)}
      {...props}
    />
  )
}
