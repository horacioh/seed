import * as stylex from '@stylexjs/stylex'
import type {NotificationPayload} from '@shm/shared/models/notification-payload'
import {Bell} from 'lucide-react'
import {ReactNode, useMemo} from 'react'
import {Button} from './button'
import {GeneralPageContainer, GeneralPageHeader} from './general-page'
import {NotificationListItem} from './notification-list-item'
import {Spinner} from './spinner'
import {SizableText, Text} from './text'

/** NotificationFilter controls whether all notifications or only unread notifications are shown. */
const styles = stylex.create({
  s72a2b24b: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: 'calc(0.25rem * 20)',
    height: 'calc(0.25rem * 20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sfbe982bd: {
    display: 'flex',
    alignSelf: 'flex-start',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s9eb1497c: {
    borderTopRightRadius: '0',
    borderBottomRightRadius: '0',
    borderStyle: 'solid',
    borderWidth: '0px',
  },
  s838ccbf6: {
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
    borderStyle: 'solid',
    borderWidth: '0px',
  },
  s3b59bb6: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 20)',
  },
})
export type NotificationFilter = 'all' | 'unread'

/** NotificationPageEmptyState renders the shared centered empty/error state for notifications pages. */
export function NotificationPageEmptyState({
  title,
  description,
  titleSize = 'xl',
}: {
  title: string
  description: ReactNode
  titleSize?: 'xl' | '2xl'
}) {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <div className={stylex.props(styles.s72a2b24b).className || ''}>
        <Bell size={50} className={stylex.props(styles.sf2718385).className || ''} />
      </div>
      {titleSize === '2xl' ? (
        <Text weight="bold" size="2xl">
          {title}
        </Text>
      ) : (
        <SizableText size="xl">{title}</SizableText>
      )}
      <p className="text-muted-foreground max-w-lg text-center">{description}</p>
    </div>
  )
}

/** NotificationFilterTabs renders the shared All/Unread segmented control. */
export function NotificationFilterTabs({
  filter,
  onFilterChange,
}: {
  filter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
}) {
  return (
    <div className={stylex.props(styles.sfbe982bd).className || ''}>
      <Button
        size="sm"
        variant={filter === 'all' ? 'secondary' : 'ghost'}
        className={stylex.props(styles.s9eb1497c).className || ''}
        onClick={() => onFilterChange('all')}
      >
        All
      </Button>
      <Button
        size="sm"
        variant={filter === 'unread' ? 'secondary' : 'ghost'}
        className={stylex.props(styles.s838ccbf6).className || ''}
        onClick={() => onFilterChange('unread')}
      >
        Unread
      </Button>
    </div>
  )
}

/** NotificationsPageContent renders the shared notifications page layout, filters, states, and list. */
export function NotificationsPageContent({
  filter,
  onFilterChange,
  notifications,
  isNotificationRead,
  onOpenNotification,
  onToggleNotificationRead,
  isLoading = false,
  headerLoading = isLoading,
  headerActions,
  errorMessage,
}: {
  filter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
  notifications: NotificationPayload[]
  isNotificationRead: (item: NotificationPayload) => boolean
  onOpenNotification: (item: NotificationPayload) => void | Promise<void>
  onToggleNotificationRead: (item: NotificationPayload, isRead: boolean) => void
  isLoading?: boolean
  headerLoading?: boolean
  headerActions?: ReactNode
  errorMessage?: string | null
}) {
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications
    return notifications.filter((item) => !isNotificationRead(item))
  }, [filter, isNotificationRead, notifications])
  return (
    <GeneralPageContainer>
      <GeneralPageHeader title="Notifications" loading={headerLoading} actions={headerActions} />

      <NotificationFilterTabs filter={filter} onFilterChange={onFilterChange} />

      {isLoading ? (
        <div className={stylex.props(styles.s3b59bb6).className || ''}>
          <Spinner />
        </div>
      ) : errorMessage ? (
        <NotificationPageEmptyState title="Could not load notifications" description={errorMessage} />
      ) : notifications.length === 0 ? (
        <NotificationPageEmptyState title="No notifications yet" description="Mentions and replies will appear here." />
      ) : filteredNotifications.length === 0 ? (
        <NotificationPageEmptyState title="All caught up" description="No unread notifications." />
      ) : (
        <div className="divide-border flex flex-col divide-y rounded-lg border">
          {filteredNotifications.map((item) => {
            const isRead = isNotificationRead(item)
            return (
              <NotificationListItem
                key={item.feedEventId}
                item={item}
                isRead={isRead}
                onOpen={() => onOpenNotification(item)}
                onToggleRead={() => onToggleNotificationRead(item, isRead)}
              />
            )
          })}
        </div>
      )}
    </GeneralPageContainer>
  )
}
