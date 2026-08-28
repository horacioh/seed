import * as stylex from '@stylexjs/stylex'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import {cn} from '../utils'

const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: 1,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    userSelect: 'none',
  },
  sizeSm: {
    fontSize: '0.75rem',
  },
  sizeLg: {
    fontSize: '1.125rem',
  },
})

type LabelSize = 'default' | 'sm' | 'lg'

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  size?: LabelSize
}

function Label({className, size = 'default', htmlFor, onClick, ...props}: LabelProps) {
  const handleClick = (event: React.MouseEvent<HTMLLabelElement>) => {
    onClick?.(event)
    if (!htmlFor) return
    const control = document.getElementById(htmlFor)
    if (control && control.tagName === 'BUTTON' && control.getAttribute('role') === 'radio') {
      event.preventDefault()
      control.click()
    }
  }

  const sizeStyle = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : undefined

  return (
    <LabelPrimitive.Root
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(stylex.props(styles.base, sizeStyle).className, className)}
      onClick={handleClick}
      {...props}
    />
  )
}

export {Label}
