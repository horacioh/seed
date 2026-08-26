import * as stylex from '@stylexjs/stylex'
import type {SiteEmailSubscriber} from '@shm/shared/models/notification-service'
import type {NavRoute} from '@shm/shared/routes'
import {useTxString} from '@shm/shared/translation'
import {formattedDateShort} from '@shm/shared/utils/date'
import {Mail} from 'lucide-react'
import type {MenuItemType} from './options-dropdown'
import {Spinner} from './spinner'
import {SizableText} from './text'
import {cn} from './utils'

/**
 * Document-options menu entry that opens the site's email subscribers page.
 * Shared between the web and desktop document options menus.
 */
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s65917ffb: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 8)',
  },
  s6f33f519: {
    color: 'oklch(63.7% 0.237 25.331)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  sf1007831: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  se21ec12d: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
})
export function createEmailSubscribersMenuItem({
  navigate,
  accountUid,
}: {
  navigate: (route: NavRoute) => void
  accountUid?: string
}): MenuItemType {
  return {
    key: 'email-subscribers',
    label: 'Email Subscribers',
    icon: <Mail className={stylex.props(styles.sca3de968).className || ''} />,
    onClick: () =>
      navigate({
        key: 'site-settings-emails',
        accountUid,
      }),
  }
}

/**
 * Page body for the email subscribers page: heading, description, and either
 * a status message or the subscriber list. Shared between web and desktop;
 * the platform pages provide their own chrome and data fetching.
 */
export function SiteEmailSubscribersPanel({
  message,
  subscribers,
  isLoading,
  errorMessage,
}: {
  /** When set, shown instead of the list (sign-in / not-owner / unavailable states). */
  message?: string | null
  subscribers?: SiteEmailSubscriber[] | undefined
  isLoading?: boolean
  errorMessage?: string | null
}) {
  const tx = useTxString()
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <SizableText size="2xl" weight="bold" asChild>
        <h1>{tx('Email Subscribers')}</h1>
      </SizableText>
      <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        {tx('People who subscribed to receive updates from this space.')}
      </SizableText>
      {message ? (
        <SizableText className={stylex.props(styles.sf2718385).className || ''}>{message}</SizableText>
      ) : (
        <SiteEmailSubscribersList subscribers={subscribers} isLoading={!!isLoading} errorMessage={errorMessage} />
      )}
    </div>
  )
}

/**
 * Renders the list of emails subscribed to a site. Shared between the web
 * and desktop email subscribers pages.
 */
export function SiteEmailSubscribersList({
  subscribers,
  isLoading,
  errorMessage,
}: {
  subscribers: SiteEmailSubscriber[] | undefined
  isLoading: boolean
  errorMessage?: string | null
}) {
  const tx = useTxString()
  if (isLoading) {
    return (
      <div className={stylex.props(styles.s65917ffb).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (errorMessage) {
    return <SizableText className={stylex.props(styles.s6f33f519).className || ''}>{errorMessage}</SizableText>
  }
  if (!subscribers?.length) {
    return (
      <SizableText className={stylex.props(styles.sf2718385).className || ''}>
        {tx('No one has subscribed to this space yet.')}
      </SizableText>
    )
  }
  const activeCount = subscribers.filter((s) => !s.isUnsubscribed).length
  return (
    <div className={stylex.props(styles.sfbc6e28f).className || ''}>
      <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
        {activeCount === 1 ? tx('1 subscriber') : `${activeCount} ${tx('subscribers')}`}
      </SizableText>
      <div className="border-border flex flex-col divide-y rounded-md border">
        {subscribers.map((subscriber) => (
          <div key={subscriber.email} className={stylex.props(styles.sf1007831).className || ''}>
            <div className={stylex.props(styles.s783f19f3).className || ''}>
              <SizableText
                weight="medium"
                className={cn(subscriber.isUnsubscribed && 'text-muted-foreground line-through')}
              >
                {subscriber.email}
              </SizableText>
              <SizableText size="xs" className={stylex.props(styles.sf2718385).className || ''}>
                {tx('Subscribed')} {formattedDateShort(subscriber.createdAt)}
              </SizableText>
            </div>
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              {subscriber.isUnsubscribed ? (
                <SubscriberTag label={tx('Unsubscribed')} />
              ) : (
                <>
                  {subscriber.notifyOwnedDocChange && <SubscriberTag label={tx('Document Changes')} />}
                  {subscriber.notifySiteDiscussions && <SubscriberTag label={tx('Discussions')} />}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
function SubscriberTag({label}: {label: string}) {
  return (
    <SizableText size="xs" className={stylex.props(styles.se21ec12d).className || ''}>
      {label}
    </SizableText>
  )
}
