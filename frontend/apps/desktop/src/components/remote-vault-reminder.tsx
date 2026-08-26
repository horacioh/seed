import * as stylex from '@stylexjs/stylex'
import React from 'react'
import {useListKeys, useVaultStatus} from '@/models/daemon'
import {useRemoteVaultReminderPreference} from '@/models/app-settings'
import {useNavigate} from '@/utils/useNavigate'
import {VaultBackendMode, VaultConnectionStatus} from '@shm/shared/client/.generated/daemon/v1alpha/daemon_pb'
import {Button} from '@shm/ui/button'
import {SizableText} from '@shm/ui/text'
const styles = stylex.create({
  se24be6d7: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    marginBottom: 'calc(0.25rem * 4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 4)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-sm)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  se80bcbd2: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
})
const REMIND_LATER_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Shows a non-blocking remote-vault reminder for local-only desktop users.
 */
export function RemoteVaultReminder() {
  const navigate = useNavigate()
  const vaultStatus = useVaultStatus()
  const keys = useListKeys()
  const reminder = useRemoteVaultReminderPreference()
  const hasKeys = (keys.data?.length || 0) > 0
  const isLocalOnly =
    vaultStatus.data?.backendMode === VaultBackendMode.LOCAL &&
    vaultStatus.data?.connectionStatus !== VaultConnectionStatus.CONNECTED
  const isDismissedPermanently = reminder.value.data?.dontRemindAgain === true
  const remindLaterUntil = reminder.value.data?.remindLaterUntilMs ?? null
  const isSnoozed = remindLaterUntil !== null && remindLaterUntil > Date.now()
  if (!hasKeys || !isLocalOnly || isDismissedPermanently || isSnoozed) {
    return null
  }
  return (
    <div className={stylex.props(styles.se24be6d7).className || ''}>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText size="lg" weight="bold">
          Connect a Remote Vault
        </SizableText>
        <SizableText className={stylex.props(styles.sf2718385).className || ''}>
          Remote Vault lets you continue using your Hypermedia accounts across devices and on the Web. All data is
          end-to-end encrypted.
        </SizableText>
      </div>
      <div className={stylex.props(styles.se80bcbd2).className || ''}>
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            navigate({
              key: 'settings',
            })
          }}
        >
          Open Settings
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            reminder.setPreference({
              remindLaterUntilMs: Date.now() + REMIND_LATER_MS,
              dontRemindAgain: false,
            })
          }}
        >
          Remind Me Later
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            reminder.setPreference({
              remindLaterUntilMs: null,
              dontRemindAgain: true,
            })
          }}
        >
          Don&apos;t Remind Again
        </Button>
      </div>
    </div>
  )
}
