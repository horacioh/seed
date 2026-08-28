import * as stylex from '@stylexjs/stylex'
import {ChevronLeft} from 'lucide-react'
import {HTMLAttributes} from 'react'
import {Button} from './button'
import {ScrollArea} from './components/scroll-area'
import {cn} from './utils'
const styles = stylex.create({
  s9999e1a5: {
    color: 'var(--muted-foreground)',
    margin: 'calc(0.25rem * 2)',
    flex: '1',
    justifyContent: 'flex-start',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 2)',
  },
  sd6dded7f: {
    display: 'flex',
    height: '100%',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  s898dc4cb: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    padding: 'calc(0.25rem * 4)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
})
export function SelectionBackButton({
  onClick,
  label,
  className,
  ...props
}: {
  onClick: React.ComponentProps<'button'>['onClick']
  label?: string
} & HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(stylex.props(styles.s9999e1a5).className || '', className)}
      onClick={onClick}
      {...props}
    >
      <ChevronLeft size={16} />
      {label || 'Back'}
    </Button>
  )
}
export function PanelContent({children, header}: {children: React.ReactNode; header?: React.ReactNode}) {
  return (
    <div className={stylex.props(styles.sd6dded7f).className || ''}>
      {header ? <div className={stylex.props(styles.s898dc4cb).className || ''}>{header}</div> : null}
      <ScrollArea className={stylex.props(null).className || ''}>{children}</ScrollArea>
    </div>
  )
}
export function SelectionContent({
  children,
  ...props
}: {
  children?: React.ReactNode
  footer?: React.ReactNode
  header?: React.ReactNode
  bottomPadding?: number | string
}) {
  const content = <div className={cn(stylex.props(styles.sfbc6e28e).className || '')}>{children}</div>
  return (
    <div className={stylex.props(styles.sd6dded7f).className || ''} {...props}>
      {content}
    </div>
  )
}
