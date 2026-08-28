import * as stylex from '@stylexjs/stylex'
import {ComponentProps, PropsWithChildren, ReactNode, useMemo, useState} from 'react'
import {Button} from './button'
import {Copy, ExternalLink} from './icons'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_4 = stylex.create({
  s30e7b11: {
    borderColor: 'var(--tone-gray-200)',
    backgroundColor: 'var(--tone-gray-50)',
  },
  s80d181ae: {
    '@media ((min-width: 640px))': {
      marginInline: 'calc(var(--spacing) * 0)',
    },
  },
  s21a21bfe: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    backgroundColor: 'var(--tone-gray-200-2)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 2)',
  },
  s70da49d8: {
    backgroundColor: 'var(--tone-gray-50)',
  },
  s8720a404: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--tone-gray-100-2)',
      },
    },
  },
  s456bb598: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'var(--tone-gray-200)',
    backgroundColor: 'var(--surface-black)',
    ':lastChild': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  sbeccbc50: {
    color: 'var(--muted-foreground)',
    width: '140px',
    minWidth: '140px',
    flex: 'none',
  },
})
const styles_3 = stylex.create({
  s486c2d2f: {
    opacity: '100%',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_2 = stylex.create({
  sdecc81f3: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
  },
})
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
        stylex.props(styles_4.s30e7b11).className || '',
        stylex.props(styles_4.s80d181ae).className || '',
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
    <div className={cn(stylex.props(styles_4.s21a21bfe).className || '', className)} {...props}>
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
        stylex.props(styles_4.s70da49d8).className || '',
        stylex.props(styles_4.s8720a404).className || '',
        stylex.props(styles_4.s456bb598).className || '',
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
      <SizableText size="xs" className={stylex.props(styles_4.sbeccbc50).className || ''}>
        {label}:
      </SizableText>
      <div className={stylex.props(styles_2.sdecc81f3).className || ''}>
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
            className={cn(
              stylex.props(styles.s5b6a7ac3).className || '',
              stylex.props(hover ? styles_3.s486c2d2f : styles_3.s765a26ee).className || '',
            )}
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
            className={cn(
              stylex.props(styles.s5b6a7ac3).className || '',
              stylex.props(hover ? styles_3.s486c2d2f : styles_3.s765a26ee).className || '',
            )}
            onClick={onOpen}
          >
            <ExternalLink />
          </Button>
        </Tooltip>
      ) : null}
    </TableList.Item>
  )
}
