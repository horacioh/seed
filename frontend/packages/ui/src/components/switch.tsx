import * as stylex from '@stylexjs/stylex'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as React from 'react'
import {cn} from '../utils'
const styles_3 = stylex.create({
  sdb3190ca: {
    ':is(.dark *)': {
      ':is([data-state="unchecked"])': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
  s79032af3: {
    ':is(.dark *)': {
      ':is([data-state="unchecked"])': {
        backgroundColor: 'var(--background)',
      },
    },
  },
  s184c7da: {
    ':is(.dark *)': {
      ':is([data-state="checked"])': {
        backgroundColor: 'var(--primary-foreground)',
      },
    },
  },
})
const styles_2 = stylex.create({
  s18c2039a: {
    ':is([data-state="checked"])': {
      backgroundColor: 'var(--primary)',
    },
  },
  s11171984: {
    ':is([data-state="unchecked"])': {
      backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
    },
  },
  sfb8a4f81: {
    ':is([data-state="checked"])': {
      translate: 'calc(100% - 2px) 0',
    },
  },
  sc7f2acd5: {
    ':is([data-state="unchecked"])': {
      translate: '0px 0',
    },
  },
})
const styles = stylex.create({
  s5b4447b4: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
    },
  },
  sa391181a: {
    ':focus-visible': {},
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s8a6c2ac8: {
    boxShadow: 'var(--shadow-xs)',
  },
  s9b8736ad: {
    display: 'inline-flex',
  },
  sdc5ae1ba: {
    height: '1.15rem',
  },
  s1c462: {
    width: 'calc(0.25rem * 8)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s8880a929: {
    transitionProperty: 'all',
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
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  sd5b893dc: {
    pointerEvents: 'none',
  },
  s597c48d: {
    display: 'block',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sc883a3d3: {
    boxShadow: '0 0 0 0px var(--ring-color, currentcolor)',
  },
  s8b2dd4f4: {
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
export function Switch({className, ...props}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        stylex.props(
          styles.s5b4447b4,
          styles.sa391181a,
          styles.s1a01a0ed,
          styles.s1a01a0ed,
          styles.s8a6c2ac8,
          styles.s9b8736ad,
          styles.sdc5ae1ba,
          styles.s1c462,
          styles.sf032ed6c,
          styles.sc6ed1702,
          styles.s775755af,
          styles.sad8c742c,
          styles.s8880a929,
          styles.s21f8c65d,
          styles.s8b5b6275,
          styles.s8658d75b,
        ).className || '',
        stylex.props(styles_2.s18c2039a, styles_2.s11171984).className || '',
        stylex.props(styles_3.sdb3190ca).className || '',
        'peer',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          stylex.props(
            styles.s436dc7b6,
            styles.sd5b893dc,
            styles.s597c48d,
            styles.sca3de968,
            styles.s775755af,
            styles.sc883a3d3,
            styles.s8b2dd4f4,
          ).className || '',
          stylex.props(styles_2.sfb8a4f81, styles_2.sc7f2acd5).className || '',
          stylex.props(styles_3.s79032af3, styles_3.s184c7da).className || '',
        )}
      />
    </SwitchPrimitive.Root>
  )
}
export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root>
