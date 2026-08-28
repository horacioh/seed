import {Slot} from '@radix-ui/react-slot'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {cn} from '../utils'

const styles = stylex.create({
  base: {
    lineHeight: '1.5',
  },
  sizeXs: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sizeSm: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sizeMd: {
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
  },
  sizeLg: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
  },
  sizeXl: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
  },
  size2xl: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
  },
  size3xl: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
  },
  size4xl: {
    fontSize: '2.25rem',
    lineHeight: 'calc(2.5 / 2.25)',
  },
  size5xl: {
    fontSize: '3rem',
    lineHeight: '1',
  },
  colorDefault: {
    color: 'var(--foreground)',
  },
  colorBrand: {
    color: 'var(--brand)',
  },
  colorBrand12: {
    color: 'var(--brand-12)',
  },
  colorDestructive: {
    color: 'var(--destructive)',
  },
  colorMuted: {
    color: 'var(--muted-foreground)',
  },
  colorWarning: {
    color: '#ca8a04',
  },
  colorSuccess: {
    color: '#16a34a',
  },
  weightThin: {
    fontWeight: 100,
  },
  weightLight: {
    fontWeight: 300,
  },
  weightNormal: {
    fontWeight: 400,
  },
  weightMedium: {
    fontWeight: 500,
  },
  weightSemibold: {
    fontWeight: 600,
  },
  weightBold: {
    fontWeight: 700,
  },
  weightExtrabold: {
    fontWeight: 800,
  },
  familySans: {
    fontFamily: 'var(--font-sans)',
  },
  familyMono: {
    fontFamily: 'var(--font-mono)',
  },
  familyHeading: {
    fontFamily: 'var(--font-serif)',
  },
  familySerif: {
    fontFamily: 'var(--font-serif)',
  },
})

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
type TextColor = 'default' | 'brand' | 'brand-12' | 'destructive' | 'warning' | 'success' | 'muted'
type TextWeight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
type TextFamily = 'default' | 'mono' | 'heading' | 'serif'

export interface TextProps extends React.ComponentProps<'span'> {
  size?: TextSize
  color?: TextColor
  weight?: TextWeight
  family?: TextFamily
  asChild?: boolean
}

function Text({size, color, weight, family, asChild = false, className, ...props}: TextProps) {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      className={cn(
        stylex.props(
          styles.base,
          size === 'xs' && styles.sizeXs,
          size === 'sm' && styles.sizeSm,
          size === 'md' && styles.sizeMd,
          size === 'lg' && styles.sizeLg,
          size === 'xl' && styles.sizeXl,
          size === '2xl' && styles.size2xl,
          size === '3xl' && styles.size3xl,
          size === '4xl' && styles.size4xl,
          size === '5xl' && styles.size5xl,
          color === 'default' && styles.colorDefault,
          color === 'brand' && styles.colorBrand,
          color === 'brand-12' && styles.colorBrand12,
          color === 'destructive' && styles.colorDestructive,
          color === 'warning' && styles.colorWarning,
          color === 'success' && styles.colorSuccess,
          color === 'muted' && styles.colorMuted,
          weight === 'thin' && styles.weightThin,
          weight === 'light' && styles.weightLight,
          weight === 'normal' && styles.weightNormal,
          weight === 'medium' && styles.weightMedium,
          weight === 'semibold' && styles.weightSemibold,
          weight === 'bold' && styles.weightBold,
          weight === 'extrabold' && styles.weightExtrabold,
          family === 'default' && styles.familySans,
          family === 'mono' && styles.familyMono,
          family === 'heading' && styles.familyHeading,
          family === 'serif' && styles.familySerif,
        ).className,
        className,
      )}
      {...props}
    />
  )
}

const SizableText = Text

export {SizableText, Text}

export type SizableTextProps = React.ComponentProps<typeof SizableText>
