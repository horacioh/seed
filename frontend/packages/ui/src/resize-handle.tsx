import {cn} from './utils'

export function ResizeHandle({
  onMouseDown,
  onKeyDown,
  style,
  className,
  'aria-label': ariaLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={ariaLabel || 'Resize media'}
      className={cn(
        'border-border bg-foreground focus-visible:ring-ring absolute z-9 h-12 w-2 cursor-col-resize rounded-md border p-0 focus-visible:ring-2',
        className,
      )}
      style={{top: 'calc(50% - 16px)', ...style}}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      {...props}
    />
  )
}
