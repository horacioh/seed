import * as stylex from '@stylexjs/stylex'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import {CircleIcon} from 'lucide-react'
import * as React from 'react'
import {cn} from '../utils'
const styles_6 = stylex.create({
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
const styles_5 = stylex.create({
  sa2132d46: {
    ':is(.dark *)': {
      backgroundColor: 'color-mix(in oklab, var(--input) 30%, transparent)',
    },
  },
})
const styles_4 = stylex.create({
  s56db4708: {
    ':is([aria-invalid="true"])': {
      borderColor: 'var(--destructive)',
    },
  },
})
const styles_3 = stylex.create({
  s11bd0ee9: {
    borderColor: 'var(--input)',
  },
  s1bfab962: {
    color: 'var(--primary)',
  },
  s5b4447b4: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
    },
  },
  sa391181a: {
    ':focus-visible': {},
  },
  s8a6c2ac8: {
    boxShadow: 'var(--shadow-xs)',
  },
  sd91e9c32: {
    aspectRatio: '1 / 1',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
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
})
const styles_2 = stylex.create({
  sb6207ed4: {
    fill: 'var(--primary)',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 'calc(var(--spacing) * 2)',
    height: 'calc(var(--spacing) * 2)',
    translate: '0 -50%',
  },
})
const styles = stylex.create({
  sd1c4c9a2: {
    display: 'grid',
    gap: 'calc(0.25rem * 3)',
  },
  s3aa5cace: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
function RadioGroup({className, ...props}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(stylex.props(styles.sd1c4c9a2).className || '', className)}
      {...props}
    />
  )
}
function RadioGroupItem({className, ...props}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        stylex.props(
          styles_3.s11bd0ee9,
          styles_3.s1bfab962,
          styles_3.s5b4447b4,
          styles_3.sa391181a,
          styles_3.s8a6c2ac8,
          styles_3.sd91e9c32,
          styles_3.sca3de968,
          styles_3.sf032ed6c,
          styles_3.s775755af,
          styles_3.sad8c742c,
          styles_3.sa602a1e3,
          styles_3.s8fbae0ef,
          styles_3.s21f8c65d,
          styles_3.s8b5b6275,
          styles_3.s8658d75b,
        ).className || '',
        stylex.props(styles_4.s56db4708).className || '',
        stylex.props(styles_5.sa2132d46).className || '',
        stylex.props(styles_6.sdc685e61, styles_6.s71984e23).className || '',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={stylex.props(styles.s3aa5cace).className || ''}
      >
        <CircleIcon className={stylex.props(styles_2.sb6207ed4).className || ''} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
export {RadioGroup, RadioGroupItem}
