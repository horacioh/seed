interface SpinnerProps {
  /** Size of the spinner. Defaults to "md". */
  size?: 'sm' | 'md' | 'lg'
  /** Accessible status text. Defaults to "Loading". */
  label?: string
  /** Additional CSS classes. */
  className?: string
}

const sizeClasses = {
  sm: 'size-5 border-2',
  md: 'size-8 border-3',
  lg: 'size-10 border-4',
}

/**
 * Animated loading spinner component.
 */
export function Spinner({size = 'md', label = 'Loading', className = ''}: SpinnerProps) {
  return (
    <output aria-live="polite" aria-atomic="true" className="block">
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={`border-t-primary animate-spin rounded-full border-transparent ${sizeClasses[size]} ${className}`}
      />
    </output>
  )
}
