import * as stylex from '@stylexjs/stylex'
import {ComponentProps, PropsWithChildren, ReactNode, useMemo, useState} from 'react'
import {Button} from './button'
import {Copy, ExternalLink} from './icons'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles = stylex.create({
  sc1d20b39: {
    cursor: 'default',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s44461b98: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    padding: 'calc(0.25rem * 4)',
  },
  s8383de21: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
  },
  s59cf0f3c: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  s633c2d5d: {
    display: 'block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
    WebkitUserSelect: 'text',
    userSelect: 'text',
  },
  s5b6a7ac3: {
    marginLeft: 'calc(0.25rem * 2)',
    flex: 'none',
    transitionProperty: 'opacity',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
})
function useHover() {
  const [hover, setHover] = useState(false)
  return useMemo(
    () => ({
      hover,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
    }),
    [hover],
  )
}
TableList.Header = TableHeader
TableList.Item = TableItem
export function TableList({
  children,
  className,
  ...props
}: {
  children: ReactNode
  className?: string
} & ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        stylex.props(styles.sc1d20b39).className || '',
        'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-black',
        'sm:mx-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
function TableHeader({
  children,
  className,
  ...props
}: PropsWithChildren<
  {
    className?: string
  } & ComponentProps<'div'>
>) {
  return (
    <div className={cn('flex items-center gap-3 bg-gray-200 px-4 py-2 dark:bg-gray-800', className)} {...props}>
      {children}
    </div>
  )
}
function TableItem({
  children,
  className,
  ...props
}: PropsWithChildren<
  {
    className?: string
  } & ComponentProps<'div'>
>) {
  return (
    <div
      className={cn(
        stylex.props(styles.s44461b98).className || '',
        'bg-gray-50 dark:bg-black',
        'hover:bg-gray-100 dark:hover:bg-gray-900',
        'border-b border-gray-200 last:border-b-0 dark:border-gray-700',
        className,
      )}
      {...props}
    >
      <div className={stylex.props(styles.s8383de21).className || ''}>{children}</div>
    </div>
  )
}
export function InfoListHeader({title, right}: {title: string; right?: ReactNode}) {
  return (
    <TableList.Header>
      <SizableText weight="bold">{title}</SizableText>
      <div className={stylex.props(styles.s59cf0f3c).className || ''}>{right}</div>
    </TableList.Header>
  )
}
export function InfoListItem({
  label,
  value,
  onCopy,
  onOpen,
}: {
  label: string
  value?: string | string[]
  onCopy?: () => void
  onOpen?: () => void
}) {
  const values = Array.isArray(value) ? value : [value]
  const {hover, ...hoverProps} = useHover()
  return (
    <TableList.Item {...hoverProps}>
      <SizableText size="xs" className="text-muted-foreground w-[140px] min-w-[140px] flex-none">
        {label}:
      </SizableText>
      <div className="min-w-0 flex-1 overflow-hidden">
        {values.map((value, index) => (
          <SizableText key={index} size="xs" className={stylex.props(styles.s633c2d5d).className || ''}>
            {value}
          </SizableText>
        ))}
      </div>
      {!!value && onCopy ? (
        <Tooltip content={`Copy ${label}`}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(stylex.props(styles.s5b6a7ac3).className || '', hover ? 'opacity-100' : 'opacity-0')}
            onClick={onCopy}
          >
            <Copy />
          </Button>
        </Tooltip>
      ) : null}
      {!!value && onOpen ? (
        <Tooltip content={`Open ${label}`}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(stylex.props(styles.s5b6a7ac3).className || '', hover ? 'opacity-100' : 'opacity-0')}
            onClick={onOpen}
          >
            <ExternalLink />
          </Button>
        </Tooltip>
      ) : null}
    </TableList.Item>
  )
}
