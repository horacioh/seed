export function ResizeHandle({onMouseDown, style, ...props}: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={props['aria-label'] || 'Resize panel'}
      tabIndex={0}
      className="border-border bg-foreground focus-visible:ring-ring absolute z-9 h-12 w-2 cursor-col-resize rounded-md border focus-visible:ring-2"
      style={{top: 'calc(50% - 16px)', ...style}}
      onMouseDown={onMouseDown}
      {...props}
    />
  )
}
