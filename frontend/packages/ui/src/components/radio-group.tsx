import * as stylex from '@stylexjs/stylex'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import {CircleIcon} from 'lucide-react'
import * as React from 'react'
import {cn} from '../utils'
const styles = stylex.create({
  sd1c4c9a2: {
    display: 'grid',
    gap: 'calc(0.25rem * 3)',
  },
  s1b72923d: {
    position: 'relative',
    display: 'flex',
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
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={stylex.props(styles.s1b72923d).className || ''}
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}
export {RadioGroup, RadioGroupItem}
