import * as stylex from '@stylexjs/stylex'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import {CheckIcon} from 'lucide-react'
import * as React from 'react'
import {HTMLAttributes} from 'react'
import {cn} from '../utils'
import {Label} from './label'
const styles = stylex.create({
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'currentcolor',
    transitionProperty: 'none',
  },
  checkIcon: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  field: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    borderRadius: '4px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--input-surface)',
    boxShadow: '0 0 0 1px var(--border), var(--shadow-xs)',
    outline: 'none',
    transitionProperty: 'box-shadow, background-color, border-color, color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    ':focus-visible': {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    },
  },
  sizeSm: {
    width: '0.75rem',
    height: '0.75rem',
  },
  sizeLg: {
    width: '1.25rem',
    height: '1.25rem',
  },
  checkedPrimary: {
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    borderColor: 'var(--primary)',
  },
  checkedBrand: {
    backgroundColor: 'var(--brand-5)',
    color: 'white',
    borderColor: 'var(--brand-5)',
  },
  checkedDestructive: {
    backgroundColor: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    borderColor: 'var(--destructive)',
  },
  checkedSecondary: {
    backgroundColor: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    borderColor: 'var(--secondary)',
  },
  checkedAccent: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)',
    borderColor: 'var(--accent)',
  },
})
const ariaFallback =
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
export type CheckboxVariant = 'primary' | 'brand' | 'destructive' | 'secondary' | 'accent'
export type CheckboxSize = 'default' | 'sm' | 'lg'
function checkedStyle(variant: CheckboxVariant) {
  switch (variant) {
    case 'primary':
      return styles.checkedPrimary
    case 'brand':
      return styles.checkedBrand
    case 'destructive':
      return styles.checkedDestructive
    case 'secondary':
      return styles.checkedSecondary
    case 'accent':
      return styles.checkedAccent
  }
}
function sizeStyle(size: CheckboxSize) {
  switch (size) {
    case 'sm':
      return styles.sizeSm
    case 'lg':
      return styles.sizeLg
    default:
      return undefined
  }
}
export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  variant?: CheckboxVariant
  size?: CheckboxSize
}
export function Checkbox({className, variant = 'brand', size = 'default', checked, ...props}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        stylex.props(styles.base, sizeStyle(size), checked && checkedStyle(variant)).className,
        ariaFallback,
        className,
      )}
      checked={checked}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={stylex.props(styles.indicator).className || ''}
      >
        <CheckIcon className={stylex.props(styles.checkIcon).className || ''} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
export function CheckboxField({
  checked,
  onCheckedChange,
  labelProps,
  children,
  id,
  className,
  variant = 'primary',
  size = 'default',
}: {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
  children: React.ReactNode | string
  id: string
} & HTMLAttributes<HTMLDivElement> &
  Pick<CheckboxProps, 'variant' | 'size'>) {
  return (
    <div className={cn(stylex.props(styles.field).className || '', className)}>
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} variant={variant} size={size} />
      <Label htmlFor={id} {...labelProps}>
        {children}
      </Label>
    </div>
  )
}
