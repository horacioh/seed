import * as stylex from '@stylexjs/stylex'
import {forwardRef} from 'react'
import {cn} from './utils'

const styles = stylex.create({
  base: {
    color: 'var(--tone-gray-900)',
    fontWeight: 700,
  },
  level1: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    '@media (min-width: 768px)': {
      fontSize: '1.875rem',
      lineHeight: 'calc(2.25 / 1.875)',
    },
  },
  level2: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    '@media (min-width: 768px)': {
      fontSize: '1.5rem',
      lineHeight: 'calc(2 / 1.5)',
    },
  },
  level3: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    '@media (min-width: 768px)': {
      fontSize: '1.25rem',
      lineHeight: 'calc(1.75 / 1.25)',
    },
  },
  level4: {
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
    '@media (min-width: 768px)': {
      fontSize: '1.125rem',
      lineHeight: 'calc(1.75 / 1.125)',
    },
  },
})

type HeadingLevel = 1 | 2 | 3 | 4

export interface SeedHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
  level?: HeadingLevel
}

export const SeedHeading = forwardRef<HTMLHeadingElement, SeedHeadingProps>(({className, level = 2, ...props}, ref) => {
  const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : level === 3 ? 'h4' : level === 4 ? 'h5' : 'h3'
  const levelStyle =
    level === 1 ? styles.level1 : level === 2 ? styles.level2 : level === 3 ? styles.level3 : styles.level4

  return <Tag ref={ref} className={cn(stylex.props(styles.base, levelStyle).className, className)} {...props} />
})

SeedHeading.displayName = 'SeedHeading'
