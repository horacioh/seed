import * as stylex from '@stylexjs/stylex'
import {NavRoute, useRouteLink} from '@shm/shared'
import {LucideIcon} from 'lucide-react'
import {cloneElement, isValidElement, ReactNode} from 'react'
import {Button, ButtonProps} from './button'
import {Tooltip} from './tooltip'
import {cn} from './utils'

/**
 * Tab item definition for PageTabs.
 */
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s61644a76: {
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)',
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'calc(infinity * 1px)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-xs)',
  },
  sbd905992: {
    flex: '1',
    borderRadius: 'calc(infinity * 1px)',
  },
})
export interface PageTabItem {
  /** Unique key for the tab (used for matching active state) */
  key: string
  /** Tab label text */
  label: string
  /** Navigation route */
  route: NavRoute
  /** Tooltip text */
  tooltip?: string
  /** Optional icon */
  icon?: LucideIcon
  /** Optional count badge */
  count?: number
  /** Optional background class */
  bg?: string
}

/**
 * Props for individual PageTab component.
 * Renders a navigable tab button with optional icon, label, and count.
 */
export interface PageTabProps extends Omit<ButtonProps, 'variant' | 'asChild'> {
  /** Navigation route for the tab */
  route: NavRoute
  /** Tab label text */
  label?: string
  /** Tooltip text shown on hover (when not active) */
  tooltip?: string
  /** Optional count badge (e.g., comments count) */
  count?: number
  /** Optional icon component from lucide-react */
  icon?: LucideIcon
  /** Whether this tab is currently active */
  active?: boolean
  /** Whether to show the label (used for responsive hiding) */
  showLabel?: boolean
  /** Optional background color class override */
  bg?: string
  /**
   * Optional node rendered inside the active tab pill, to the right of label/count.
   * Only rendered when `active` is true. Receives `nested` prop via cloneElement so
   * the action can adapt its styling to sit inside the accent pill.
   */
  trailingAction?: ReactNode
}

/**
 * Individual tab button with navigation support.
 * Renders as a rounded-full button with accent/ghost variants based on active state.
 */
export function PageTab({
  route,
  label,
  tooltip,
  count,
  icon: Icon,
  active = false,
  showLabel = true,
  bg,
  trailingAction,
  className,
  ...props
}: PageTabProps) {
  const linkProps = useRouteLink(route)
  const linkContent = (
    <>
      {Icon && <Icon className={stylex.props(styles.sca3de968).className || ''} />}
      {label && showLabel ? <span className="hidden truncate text-sm md:block">{label}</span> : null}
      {count ? <span className={stylex.props(styles.sab7cc6fa).className || ''}>{count}</span> : null}
    </>
  )
  if (active && trailingAction) {
    const nestedAction = isValidElement(trailingAction)
      ? cloneElement(
          trailingAction as React.ReactElement<{
            nested?: boolean
          }>,
          {
            nested: true,
          },
        )
      : trailingAction
    return (
      <Tooltip content="">
        <div className={cn(stylex.props(styles.s61644a76).className || '', bg, className)}>
          <a
            {...linkProps}
            data-tab={route.key}
            className="inline-flex h-9 items-center gap-2 rounded-l-full pr-2 pl-4 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            {linkContent}
          </a>
          {nestedAction}
        </div>
      </Tooltip>
    )
  }
  const btn = (
    <Button
      className={cn(stylex.props(styles.sbd905992).className || '', bg, className)}
      asChild
      variant={active ? 'accent' : 'ghost'}
      {...props}
    >
      <a {...linkProps} data-tab={route.key}>
        {linkContent}
      </a>
    </Button>
  )
  return <Tooltip content={active ? '' : tooltip || ''}>{btn}</Tooltip>
}

/**
 * Props for the PageTabs container component.
 */
export interface PageTabsProps {
  /** Array of tab items to render */
  tabs: PageTabItem[]
  /** ID of the currently active tab */
  activeTab?: string
  /** Whether to show labels (for responsive layouts) */
  showLabels?: boolean
  /** Additional className for the container */
  className?: string
}

/**
 * Container component for rendering a group of PageTab buttons.
 * Provides consistent layout with flex gap.
 */
export function PageTabs({tabs, activeTab, showLabels = true, className}: PageTabsProps) {
  return (
    <div className={cn('flex items-center gap-2 md:gap-4', className)}>
      {tabs.map((tab) => (
        <PageTab
          key={tab.key}
          active={activeTab === tab.key}
          route={tab.route}
          label={tab.label}
          tooltip={tab.tooltip}
          icon={tab.icon}
          count={tab.count}
          bg={tab.bg}
          showLabel={showLabels}
        />
      ))}
    </div>
  )
}
