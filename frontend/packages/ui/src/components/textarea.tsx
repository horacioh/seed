import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import {cn} from '../utils'
const styles_4 = stylex.create({
  sdc685e61: {
    ':is([aria-invalid="true"])': {
      '--ring-color': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
    },
  },
  s71984e23: {
    ':is(.dark *)': {
      ':is([aria-invalid="true"])': {
        '--ring-color': 'color-mix(in oklab, var(--destructive) 40%, transparent)',
      },
    },
  },
})
const styles_3 = stylex.create({
  sa2132d46: {
    ':is(.dark *)': {
      backgroundColor: 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
  },
})
const styles_2 = stylex.create({
  sfb4c68be: {
    '::placeholder': {
      color: 'var(--muted-foreground)',
    },
  },
  s56db4708: {
    ':is([aria-invalid="true"])': {
      borderColor: 'var(--destructive)',
    },
  },
})
const styles = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s5b4447b4: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
    },
  },
  sa391181a: {
    ':focus-visible': {},
  },
  s445a735d: {
    fieldSizing: 'content',
  },
  s2ffff9: {
    display: 'flex',
  },
  sabad9445: {
    minHeight: 'calc(0.25rem * 16)',
  },
  scdbaf625: {
    width: '100%',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sbf5f1771: {
    fontSize: '1rem',
    lineHeight: 'var(--text-base--line-height)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s8fbae0ef: {
    transitionProperty: 'color, box-shadow',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s21f8c65d: {
    ':focus-visible': {
      boxShadow: '0 0 0 3px var(--ring-color, currentcolor)',
    },
  },
  s8b5b6275: {
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  s8658d75b: {
    ':disabled': {
      opacity: '50%',
    },
  },
  s22817817: {
    '@media ((min-width: 768px))': {
      fontSize: '0.875rem',
      lineHeight: 'var(--text-sm--line-height)',
    },
  },
})
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(function Textarea(
  {className, ...props},
  ref,
) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        stylex.props(
          styles.s1a01a0ed,
          styles.s5b4447b4,
          styles.sa391181a,
          styles.s445a735d,
          styles.s2ffff9,
          styles.sabad9445,
          styles.scdbaf625,
          styles.sf79988b7,
          styles.sad8c742c,
          styles.s60f53bca,
          styles.s34b1ae,
          styles.s34b56e,
          styles.sbf5f1771,
          styles.sa602a1e3,
          styles.s8fbae0ef,
          styles.s21f8c65d,
          styles.s8b5b6275,
          styles.s8658d75b,
          styles.s22817817,
        ).className || '',
        stylex.props(styles_2.sfb4c68be, styles_2.s56db4708).className || '',
        stylex.props(styles_3.sa2132d46).className || '',
        stylex.props(styles_4.sdc685e61, styles_4.s71984e23).className || '',
        className,
      )}
      {...props}
    />
  )
})
export {Textarea}
