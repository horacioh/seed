import * as stylex from '@stylexjs/stylex'
import {HelpCircle, MoreHorizontal} from 'lucide-react'
import {useRef, useState} from 'react'
import {ButtonProps, buttonVariants} from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContentProps,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './components/dropdown-menu'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {usePopoverState} from './use-popover-state'
import {cn} from './utils'
const styles_5 = stylex.create({
  s37bc4ec9: {
    ':is([class~="group/item"]:hover *)': {
      opacity: '100%',
    },
  },
})
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
})
const styles_3 = stylex.create({
  s46527e6e: {
    opacity: '100%',
  },
  sc04d6692: {
    backgroundColor: 'var(--overlay-10)',
  },
})
const styles_2 = stylex.create({
  s765a26ee: {
    opacity: '0%',
  },
  s486c2d2f: {
    opacity: '100%',
  },
})
const styles = stylex.create({
  sa0cf170f: {
    color: 'var(--muted-foreground)',
    marginLeft: 'auto',
    display: 'inline-flex',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
})
const TOOLTIP_MAX_WIDTH = 320
const TOOLTIP_VIEWPORT_PADDING = 16

// Renders a question mark icon with a hover tooltip.
// Picks right vs top based on actual viewport room at hover time.
function MenuItemHelpIcon({content}: {content: string}) {
  const [side, setSide] = useState<'right' | 'top'>('right')
  const ref = useRef<HTMLSpanElement>(null)
  const measure = () => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fitsRight = rect.right + TOOLTIP_MAX_WIDTH + TOOLTIP_VIEWPORT_PADDING < window.innerWidth
    setSide(fitsRight ? 'right' : 'top')
  }
  return (
    <Tooltip content={content} side={side} delay={150} asChild>
      <span
        ref={ref}
        onMouseEnter={measure}
        onFocus={measure}
        className={stylex.props(styles.sa0cf170f).className || ''}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <HelpCircle className={stylex.props(styles.s3269316e).className || ''} />
      </span>
    </Tooltip>
  )
}

/** Describes one action row rendered by the shared three-dot options menu. */
export type MenuItemType = {
  key: string
  label: string
  subLabel?: string
  icon: React.ReactNode
  onClick?: ButtonProps['onClick']
  variant?: 'default' | 'destructive'
  children?: MenuItemType[]
  tooltip?: string
  disabled?: boolean
}
function orderMenuItems(menuItems: (MenuItemType | null)[]) {
  const presentItems = menuItems.filter((item): item is MenuItemType => item != null)
  const nonDestructive = presentItems.filter((item) => item.variant !== 'destructive')
  const destructive = presentItems.filter((item) => item.variant === 'destructive')
  const firstDestructiveIndex = nonDestructive.length > 0 && destructive.length > 0 ? nonDestructive.length : -1
  return {
    ordered: [...nonDestructive, ...destructive],
    firstDestructiveIndex,
  }
}
function MenuItemLabel({item}: {item: MenuItemType}) {
  return item.subLabel ? (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <SizableText>{item.label}</SizableText>
      <SizableText size="sm" className={stylex.props(styles.sa56e9200).className || ''}>
        {item.subLabel}
      </SizableText>
    </div>
  ) : (
    <SizableText>{item.label}</SizableText>
  )
}
function renderMenuItem(item: MenuItemType, close: () => void) {
  if (item.children) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger disabled={item.disabled}>
          {item.icon}
          <SizableText>{item.label}</SizableText>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.children.map((child) => (
            <DropdownMenuItem
              key={child.key}
              variant={child.variant}
              disabled={child.disabled}
              onClick={(e) => {
                e.stopPropagation()
                if (child.disabled) return
                close()
                child.onClick?.(e as any)
              }}
            >
              {child.icon}
              <SizableText>{child.label}</SizableText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }
  return (
    <DropdownMenuItem
      variant={item.variant}
      disabled={item.disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (item.disabled) return
        close()
        item.onClick?.(e as any)
      }}
    >
      {item.icon}
      <MenuItemLabel item={item} />
      {item.tooltip ? <MenuItemHelpIcon content={item.tooltip} /> : null}
    </DropdownMenuItem>
  )
}

/** Renders the shared three-dot action menu used by row, card, and document option controls. */
export function OptionsDropdown({
  menuItems,
  hiddenUntilItemHover,
  side,
  align,
  className,
  size = 'icon',
  button,
  triggerClassName,
  contentClassName,
  ariaLabel = 'Open options',
  onCloseAutoFocus,
}: {
  menuItems: (MenuItemType | null)[]
  hiddenUntilItemHover?: boolean
  hover?: boolean
  button?: JSX.Element
  side?: DropdownMenuContentProps['side']
  align?: DropdownMenuContentProps['align']
  size?: ButtonProps['size']
  className?: string
  triggerClassName?: string
  contentClassName?: string
  ariaLabel?: string
  onCloseAutoFocus?: DropdownMenuContentProps['onCloseAutoFocus']
}) {
  const popoverState = usePopoverState()
  const {ordered, firstDestructiveIndex} = orderMenuItems(menuItems)
  const close = () => popoverState.onOpenChange(false)
  return (
    <div
      className={cn(
        stylex.props(styles_4.s2ffff9).className || '',
        stylex.props(styles_5.s37bc4ec9).className || '',
        stylex.props(!popoverState.open && hiddenUntilItemHover ? styles_2.s765a26ee : styles_2.s486c2d2f).className ||
          '',
        className,
        stylex.props(popoverState.open ? styles_3.s46527e6e : null).className || '',
      )}
    >
      <DropdownMenu open={popoverState.open} onOpenChange={popoverState.onOpenChange}>
        {button ? (
          <DropdownMenuTrigger asChild className={cn('no-window-drag', triggerClassName)}>
            {button}
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger
            aria-label={ariaLabel}
            className={cn(
              buttonVariants({
                variant: 'outline',
                size,
              }),
              'no-window-drag',
              triggerClassName,
            )}
          >
            <MoreHorizontal className={stylex.props(styles.s3269316e).className || ''} />
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent
          className={cn(stylex.props(styles.s1aa14).className || '', contentClassName)}
          side={side}
          align={align}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <div className={stylex.props(styles.s783f19f3).className || ''}>
            {ordered.map((item, index) => (
              <div key={item.key}>
                {index === firstDestructiveIndex ? (
                  <DropdownMenuSeparator className={stylex.props(styles_3.sc04d6692).className || ''} />
                ) : null}
                {renderMenuItem(item, close)}
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
