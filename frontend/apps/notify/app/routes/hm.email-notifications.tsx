import * as stylex from '@stylexjs/stylex'
import {SizableText} from '@shm/ui/text'
import {
  useEmailNotificationsWithToken,
  useSetAccountOptions,
  useSetEmailUnsubscribed,
  useUnsubscribeMyNotification,
} from '@/email-notifications-token-models'
import type {EmailNotifTokenLoaderResponse} from '@/routes/hm.api.email-notif-token'
import {useSearchParams} from '@remix-run/react'
import {HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {abbreviateUid, hmId} from '@shm/shared'
import {useAccount, useResource} from '@shm/shared/models/entity'
import {Button} from '@shm/ui/button'
import {SwitchField} from '@shm/ui/form-fields'
import {HMIcon} from '@shm/ui/hm-icon'
import {Spinner} from '@shm/ui/spinner'
const styles = stylex.create({
  se5fa5a2e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    paddingInline: 'calc(0.25rem * 6)',
    paddingTop: 'calc(0.25rem * 8)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s3673aa9c: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    flexShrink: '0',
    objectFit: 'contain',
  },
  sfa173d82: {
    color: 'var(--brand)',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '700',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  s1093d590: {
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 4)',
  },
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s332784: {
    marginLeft: 'calc(0.25rem * 2)',
  },
  s6f33f8da: {
    color: 'oklch(57.7% 0.245 27.325)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s38dca3a9: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '700',
  },
  s90d9fe52: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s20c49ba: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(88.5% 0.062 18.334)',
    backgroundColor: 'oklch(97.1% 0.013 17.38)',
    padding: 'calc(0.25rem * 4)',
  },
  s680c8858: {
    fontWeight: '700',
    color: 'oklch(50.5% 0.213 27.518)',
  },
  sb6e3e6ee: {
    marginTop: 'calc(0.25rem * 2)',
    color: 'oklch(57.7% 0.245 27.325)',
  },
  s4204e446: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s345ee798: {
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 4)',
  },
  sd1949a51: {
    fontWeight: '700',
    color: 'oklch(27.8% 0.033 256.848)',
  },
  se8fe7171: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(87.2% 0.01 258.338)',
    paddingTop: 'calc(0.25rem * 2)',
  },
  s7af13144: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '700',
  },
  s92841d5d: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(87.2% 0.01 258.338)',
    paddingTop: 'calc(0.25rem * 2)',
  },
  s4178ed7e: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '700',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
})
export default function EmailNotificationsPage() {
  return (
    <NotifySiteContainer>
      <EmailNotificationsContent />
    </NotifySiteContainer>
  )
}
function NotifySiteHeader() {
  return (
    <div className={stylex.props(styles.se5fa5a2e).className || ''}>
      <div className={stylex.props(styles.s86ff3e4).className || ''}>
        <img src="/assets/seed-icon.svg" alt="Seed" className={stylex.props(styles.s3673aa9c).className || ''} />
        <h1 className={stylex.props(styles.sfa173d82).className || ''}>Seed Notify</h1>
      </div>
    </div>
  )
}
function NotifySiteContainer({children}: {children: React.ReactNode}) {
  return (
    <div className="bg-panel flex h-screen max-h-screen min-h-svh w-screen flex-col overflow-hidden">
      <NotifySiteHeader />
      <div className="dark:bg-background flex flex-1 gap-4 overflow-hidden overflow-y-auto bg-white px-6 py-8">
        <div className={stylex.props(styles.sfbc6e290).className || ''}>
          <div className={stylex.props(styles.s1093d590).className || ''}>{children}</div>
        </div>
      </div>
    </div>
  )
}
export function EmailNotificationsContent() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const {data: notifSettings, isLoading, error} = useEmailNotificationsWithToken(token)
  const {mutate: setEmailUnsubscribed} = useSetEmailUnsubscribed(token)
  if (!token) {
    return <SizableText>No token provided</SizableText>
  }
  if (isLoading) {
    return (
      <div className={stylex.props(styles.s9a378369).className || ''}>
        <Spinner />
        <SizableText className={stylex.props(styles.s332784).className || ''}>
          Loading notification settings…
        </SizableText>
      </div>
    )
  }
  if (error) {
    return (
      <div className={stylex.props(styles.s6f33f8da).className || ''}>
        <SizableText>Error loading notification settings: {String(error)}</SizableText>
      </div>
    )
  }
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {notifSettings ? (
        <>
          <div className={stylex.props(styles.sfbc6e28d).className || ''}>
            <h2 className={stylex.props(styles.s38dca3a9).className || ''}>Notification Settings</h2>
            <p className={stylex.props(styles.s90d9fe52).className || ''}>for {notifSettings.email}</p>
          </div>
          {notifSettings.isUnsubscribed ? (
            <>
              <div className={stylex.props(styles.s20c49ba).className || ''}>
                <p className={stylex.props(styles.s680c8858).className || ''}>Unsubscribed from All Notifications</p>
                <SizableText className={stylex.props(styles.sb6e3e6ee).className || ''}>
                  You were subscribed to:
                </SizableText>
                <div className="mt-3 space-y-2">
                  {notifSettings.subscriptions.map((sub) => (
                    <LoadedAccountTitle key={sub.id} id={hmId(sub.id)} />
                  ))}
                </div>
              </div>
              <MyNotificationsSection myNotifications={notifSettings.myNotifications} token={token} />
              <Button
                variant="default"
                onClick={() => {
                  setEmailUnsubscribed(false)
                }}
              >
                Re-Enable Notifications
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-6">
                {notifSettings.subscriptions.length ? (
                  notifSettings.subscriptions.map((sub) => (
                    <EmailNotificationSubscription key={sub.id} subscription={sub} token={token} />
                  ))
                ) : (
                  <p className={stylex.props(styles.s4204e446).className || ''}>
                    No space subscriptions configured for this email yet.
                  </p>
                )}
                <MyNotificationsSection myNotifications={notifSettings.myNotifications} token={token} />
              </div>

              <div className={stylex.props(styles.s345ee798).className || ''}>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setEmailUnsubscribed(true)
                  }}
                >
                  Unsubscribe from all Notifications
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className={stylex.props(styles.s9a378369).className || ''}>
          <Spinner />
        </div>
      )}
    </div>
  )
}
function MyNotificationsSection({
  myNotifications,
  token,
}: {
  myNotifications: EmailNotifTokenLoaderResponse['myNotifications']
  token: string
}) {
  if (!myNotifications.length) return null
  return (
    <div className="space-y-3 border-t pt-4">
      <h4 className={stylex.props(styles.sd1949a51).className || ''}>My Notifications</h4>
      <p className={stylex.props(styles.s4204e446).className || ''}>
        These accounts are configured via signed account settings and receive immediate mention/reply notifications.
      </p>
      <div className="space-y-2">
        {myNotifications.map((config) => (
          <MyNotificationConfigRow
            key={`notification-config-${config.accountId}`}
            accountId={config.accountId}
            token={token}
          />
        ))}
      </div>
    </div>
  )
}
function MyNotificationConfigRow({accountId, token}: {accountId: string; token: string}) {
  const {data: account} = useAccount(accountId)
  const {mutate: unsubscribeMyNotification, isLoading} = useUnsubscribeMyNotification(token)
  const displayId = account?.id || hmId(accountId)
  const displayName = account?.metadata?.name || abbreviateUid(displayId.uid)
  return (
    <div className={stylex.props(styles.se8fe7171).className || ''}>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <HMIcon size={24} id={displayId} icon={account?.metadata?.icon} />
        <p className={stylex.props(styles.s7af13144).className || ''}>{displayName}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => {
          unsubscribeMyNotification(accountId)
        }}
      >
        {isLoading ? 'Removing…' : 'Unsubscribe'}
      </Button>
    </div>
  )
}
function LoadedAccountTitle({id}: {id: UnpackedHypermediaId}) {
  const {data: account} = useResource(id)
  if (!account) return null
  if (account.type !== 'document') return null
  return <AccountTitle accountId={account.id} metadata={account.document?.metadata} />
}
function AccountTitle({accountId, metadata}: {accountId: UnpackedHypermediaId; metadata: HMMetadata}) {
  const displayName = metadata?.name || abbreviateUid(accountId.uid)
  return (
    <div className={stylex.props(styles.s92841d5d).className || ''}>
      {accountId ? <HMIcon size={24} id={accountId} /> : null}
      <p className={stylex.props(styles.s4178ed7e).className || ''}>{displayName}</p>
    </div>
  )
}
function EmailNotificationSubscription({
  subscription,
  token,
}: {
  subscription: EmailNotifTokenLoaderResponse['subscriptions'][number]
  token: string
}) {
  const {data: account} = useResource(hmId(subscription.id))
  if (!account) return null
  if (account.type !== 'document') return null
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      <div className={stylex.props(styles.s86ff3e5).className || ''}>
        <AccountTitle accountId={account.id} metadata={account.document?.metadata} />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className={stylex.props(styles.sd1949a51).className || ''}>Space Activity</h4>
          <p className={stylex.props(styles.s4204e446).className || ''}>
            Get notified when something happens in {account.document?.metadata?.name}. Emails will be sent every 4 hours
            at most.
          </p>
          <p className={stylex.props(styles.s4204e446).className || ''}>Notify me when:</p>
          <div className="space-y-3 pl-4">
            <AccountValueSwitch
              token={token}
              label="A Document is Created or Updated"
              field="notifyOwnedDocChange"
              subscription={subscription}
            />
            <AccountValueSwitch
              token={token}
              label="A Discussion is Created"
              field="notifySiteDiscussions"
              subscription={subscription}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
function AccountValueSwitch({
  token,
  label,
  field,
  subscription,
}: {
  token: string
  label: string
  field: 'notifyOwnedDocChange' | 'notifySiteDiscussions'
  subscription: EmailNotifTokenLoaderResponse['subscriptions'][number]
}) {
  const {mutate: setAccount, isLoading} = useSetAccountOptions(token)
  return (
    <SwitchField
      id={`${subscription.id}-${field}`}
      label={label}
      checked={subscription[field]}
      onCheckedChange={(checked) => {
        setAccount({
          accountId: subscription.id,
          [field]: checked,
        })
      }}
      disabled={isLoading}
    />
  )
}
