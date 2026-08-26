import * as stylex from '@stylexjs/stylex'
import {ExternalLink} from 'lucide-react'
import {Button} from '../button'
import {AccountSettingsTabs, type AccountSettingsTab} from './account-settings-tabs'

/**
 * Shared header for the account-settings detail pane: the settings tabs
 * (Notifications / Connected Devices) on the left and a "My Profile" button on
 * the right, all on one row. Routing-agnostic — the platform wires `onTabChange`
 * and `onOpenProfile` to its own navigation (desktop opens the in-app profile;
 * the web vault opens the public profile).
 */
const styles = stylex.create({
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function AccountSettingsHeader({
  activeTab,
  onTabChange,
  onOpenProfile,
}: {
  activeTab: AccountSettingsTab
  onTabChange: (tab: AccountSettingsTab) => void
  onOpenProfile?: () => void
}) {
  return (
    <div className={stylex.props(styles.s86ff3e5).className || ''}>
      <AccountSettingsTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        className={stylex.props(styles.sb42feb5d).className || ''}
      />
      {onOpenProfile ? (
        <Button variant="green" className={stylex.props(styles.sf032ed6c).className || ''} onClick={onOpenProfile}>
          <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
          My Profile
        </Button>
      ) : null}
    </div>
  )
}
