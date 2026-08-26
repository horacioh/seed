import * as stylex from '@stylexjs/stylex'
const styles = stylex.create({
  s43b2554a: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--foreground)',
    position: 'absolute',
    zIndex: '9',
    height: 'calc(0.25rem * 12)',
    width: 'calc(0.25rem * 2)',
    cursor: 'col-resize',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
})
export function ResizeHandle({onMouseDown, style, ...props}: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={stylex.props(styles.s43b2554a).className || ''}
      style={{
        top: 'calc(50% - 16px)',
        ...style,
      }}
      onMouseDown={onMouseDown}
      {...props}
    />
  )
}
