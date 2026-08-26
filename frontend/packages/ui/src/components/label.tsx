import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '../utils'

const labelVariants = cva(
  'flex items-center gap-2 text-sm leading-none font-medium font-sans select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-lg',
      },
    },
  },
)

function Label({
  className,
  size = 'default',
  htmlFor,
  onClick,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
  const handleClick = (event: React.MouseEvent<HTMLLabelElement>) => {
    onClick?.(event)
    if (!htmlFor) return
    const control = document.getElementById(htmlFor)
    if (control && control.tagName === 'BUTTON' && control.getAttribute('role') === 'radio') {
      event.preventDefault()
      control.click()
    }
  }
  return (
    <LabelPrimitive.Root
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(labelVariants({size}), className)}
      onClick={handleClick}
      {...props}
    />
  )
}

export {Label}
