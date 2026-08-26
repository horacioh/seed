import * as stylex from '@stylexjs/stylex'
import {Bell, Lock, type LucideIcon} from 'lucide-react'
import {Button} from '../button'
import {cn} from '../utils'
const styles = stylex.create({
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
export type AccountSettingsTab = 'devices' | 'notifications'
const TABS: {
  key: AccountSettingsTab
  label: string
  icon: LucideIcon
}[] = [
  {
    key: 'devices',
    label: 'Connected Devices',
    icon: Lock,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Bell,
  },
]

/** Human-readable label for each account-settings tab. */
export const ACCOUNT_SETTINGS_TAB_LABELS = Object.fromEntries(TABS.map((tab) => [tab.key, tab.label])) as Record<
  AccountSettingsTab,
  string
>

/**
 * Shared per-account tab bar (Account / Notifications / Devices), used by both
 * the desktop app and the web vault. Routing-agnostic: the platform wires
 * `onTabChange` to its router so each tab gets a real URL.
 */
export function AccountSettingsTabs({
  activeTab,
  onTabChange,
  className,
}: {
  activeTab: AccountSettingsTab
  onTabChange: (tab: AccountSettingsTab) => void
  className?: string
}) {
  return (
    <div className={cn(stylex.props(styles.s86ff3e4).className || '', className)}>
      {TABS.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.key
        return (
          <Button
            key={tab.key}
            variant={active ? 'accent' : 'ghost'}
            className={[stylex.props(styles.s775755af).className || '', className].filter(Boolean).join(' ')}
            onClick={() => onTabChange(tab.key)}
          >
            <Icon className={stylex.props(styles.sca3de968).className || ''} />
            <span className={stylex.props(styles.s6e724d66).className || ''}>{tab.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
