import * as stylex from '@stylexjs/stylex'
import {unpackHmId} from '@shm/shared'
import {ArrowDownRight, ChevronDown, ChevronRight} from 'lucide-react'
import {ComponentProps, ReactNode, useState} from 'react'
import {Button, ButtonProps} from './button'
import {DraftBadge} from './draft-badge'
import {useHighlighter} from './highlight-context'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_4 = stylex.create({
  sb41ffff4: {
    height: 'auto',
  },
  s3f582e18: {
    minHeight: 'calc(0.25rem * 8)',
  },
  scdbaf625: {
    width: '100%',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s2ffff9: {
    display: 'flex',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_3 = stylex.create({
  s239b4cca: {
    whiteSpace: 'normal',
  },
  itemTextBase: {
    textAlign: 'left',
    userSelect: 'none',
  },
  itemTextTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemTextMultiline: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
})
const styles_2 = stylex.create({
  s1e65f214: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
})
const styles = stylex.create({
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  saa18cb42: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    overflow: 'hidden',
    padding: 'calc(0.25rem * 1)',
  },
  sf2746014: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    overflow: 'hidden',
  },
  s421c6cb4: {
    position: 'absolute',
    left: 'calc(0.25rem * -6)',
  },
})
export function FocusButton({onPress, label}: {onPress: () => void; label?: string}) {
  return (
    <Tooltip content={label ? `Focus ${label}` : 'Focus'}>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onPress()
        }}
        size="sm"
      >
        <ArrowDownRight className={stylex.props(styles.sca3de967).className || ''} />
      </Button>
    </Tooltip>
  )
}
export function SmallListItem({
  disabled,
  title,
  icon,
  active,
  iconAfter,
  children,
  indented,
  bold,
  rightHover,
  color,
  menuItems,
  isCollapsed,
  onSetCollapsed,
  isDraft,
  multiline = false,
  docId,
  accessory,
  textClass,
  ...props
}: ButtonProps & {
  active?: boolean
  bold?: boolean
  indented?: boolean | number
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
  selected?: boolean
  rightHover?: ReactNode[]
  menuItems?: MenuItemType[]
  isCollapsed?: boolean | null
  onSetCollapsed?: (collapsed: boolean) => void
  isDraft?: boolean
  multiline?: boolean
  docId?: string
  accessory?: ReactNode
  textClass?: string
}) {
  const indent = indented ? (typeof indented === 'number' ? indented : 1) : 0
  const highlighter = useHighlighter()
  return (
    <Button
      className={cn(
        stylex.props(styles_4.sb41ffff4, styles_4.s3f582e18, styles_4.scdbaf625, styles_4.sbf63b0a7, styles_4.sa602a1e3)
          .className || '',
        stylex.props(active && styles_2.s1e65f214).className || '',
        props.className,
      )}
      size="sm"
      style={{
        paddingLeft: Math.max(0, indent) * 22 + 12,
      }}
      {...(docId ? highlighter(unpackHmId(docId)!) : {})}
      {...props}
    >
      <div className={stylex.props(styles.saa18cb42).className || ''}>
        {icon}
        {children}
        {title || isDraft || accessory ? (
          <div className={stylex.props(styles.sf2746014).className || ''}>
            <SizableText
              size="sm"
              className={cn(
                stylex.props(
                  styles_3.itemTextBase,
                  multiline ? styles_3.itemTextMultiline : styles_3.itemTextTruncate,
                  bold && styles_2.sa16ea943,
                ).className || '',
                textClass,
              )}
              style={{
                color: typeof color === 'string' ? color : undefined,
              }}
            >
              {title}
            </SizableText>
            {isDraft ? <DraftBadge /> : null}
            {accessory}
          </div>
        ) : null}
      </div>
      {isCollapsed != null ? (
        <Button
          className={stylex.props(styles.s421c6cb4).className || ''}
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onSetCollapsed?.(!isCollapsed)
          }}
        >
          {isCollapsed ? (
            <ChevronRight className={stylex.props(styles.sca3de967).className || ''} />
          ) : (
            <ChevronDown className={stylex.props(styles.sca3de967).className || ''} />
          )}
        </Button>
      ) : null}

      {iconAfter || rightHover || menuItems ? (
        <>
          {rightHover ? (
            <div className={stylex.props(styles_4.s2ffff9, styles_4.s765a26ee).className || ''}>{rightHover}</div>
          ) : null}
          {menuItems ? <OptionsDropdown hiddenUntilItemHover menuItems={menuItems} /> : null}
        </>
      ) : null}
    </Button>
  )
}
export function SmallListGroupItem({
  items,
  defaultExpanded,
  ...props
}: {
  items: ReactNode[]
  defaultExpanded?: boolean
} & ComponentProps<typeof SmallListItem>) {
  const [isCollapsed, setIsCollapsed] = useState(defaultExpanded ? false : true)
  return (
    <>
      <SmallListItem {...props} isCollapsed={items.length ? isCollapsed : null} onSetCollapsed={setIsCollapsed} />
      {isCollapsed ? null : items}
    </>
  )
}
