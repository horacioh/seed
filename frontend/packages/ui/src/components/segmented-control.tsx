import {useId} from 'react'
import {cn} from '../utils'

/**
 * A compact segmented control (pill toggle): a rounded muted track with the
 * active option shown as a raised light pill. Shared so any 2+-way choice looks
 * consistent across the apps.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: {value: T; label: string}[]
  disabled?: boolean
  className?: string
}) {
  const groupName = useId()
  return (
    <div className={cn('inline-flex items-center rounded-full bg-black/10 p-1 dark:bg-white/10', className)}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <label
            key={option.value}
            className={cn(
              'focus-within:ring-ring relative cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors focus-within:ring-2',
              disabled && 'cursor-not-allowed opacity-50',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground bg-transparent',
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={active}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            {option.label}
          </label>
        )
      })}
    </div>
  )
}
