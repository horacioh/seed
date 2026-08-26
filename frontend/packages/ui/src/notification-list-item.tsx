import * as stylex from '@stylexjs/stylex'
/**
 * Shared notification list item component used by both desktop and web.
 */
import {getDocumentTitle} from '@shm/shared/content'
import {abbreviateUid, formattedDateShort, hmId} from '@shm/shared'
import {useAccount, useResource} from '@shm/shared/models/entity'
import type {NotificationPayload} from '@shm/shared/models/notification-payload'
import {notificationTitle} from '@shm/shared/models/notification-helpers'
import {Button} from './button'
import {HMIcon} from './hm-icon'
import {Spinner} from './spinner'
import {Tooltip} from './tooltip'
import {cn} from './utils'
import {Check} from 'lucide-react'

/** Props for the notification list item. */
const styles = stylex.create({
  sc5969aae: {
    paddingTop: 'calc(0.25rem * 0.5)',
  },
  sc4465ee8: {
    backgroundColor: 'var(--muted)',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    borderRadius: 'calc(infinity * 1px)',
  },
  se99caec9: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 2)',
  },
  s4b70932d: {
    marginTop: 'calc(0.25rem * 1.5)',
    display: 'inline-block',
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
    flexShrink: '0',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(54.6% 0.245 262.881)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s7ec10f67: {
    marginLeft: 'calc(0.25rem * 1)',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
export type NotificationListItemProps = {
  item: NotificationPayload
  isRead: boolean
  onOpen: () => void | Promise<void>
  onToggleRead: () => void
}

/** A single notification row with author icon, title, date, and read toggle. */
export function NotificationListItem({item, isRead, onOpen, onToggleRead}: NotificationListItemProps) {
  const authorId = item.author.uid ? hmId(item.author.uid) : null
  const targetId = item.target.uid
    ? hmId(item.target.uid, {
        path: item.target.path ?? undefined,
      })
    : null
  const author = useAccount(item.author.uid || undefined, {
    subscribe: true,
  })
  const target = useResource(targetId, {
    subscribed: true,
  })
  const resolvedName = author.data?.metadata?.name
  const authorName = resolvedName || item.author.name || (item.author.uid ? abbreviateUid(item.author.uid) : undefined)
  const authorIcon = author.data?.metadata?.icon || item.author.icon || undefined
  const targetName = target.data?.type === 'document' ? getDocumentTitle(target.data.document) || undefined : undefined
  return (
    <div
      className={cn(
        'group flex w-full items-start gap-3 p-4 text-left transition-colors',
        isRead ? 'hover:bg-muted/40' : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/40',
      )}
    >
      <button type="button" className="flex min-w-0 flex-1 items-start gap-3 text-left" onClick={() => void onOpen()}>
        <div className={stylex.props(styles.sc5969aae).className || ''}>
          {authorId ? (
            <HMIcon size={24} id={authorId} name={authorName} icon={authorIcon} />
          ) : (
            <div className={stylex.props(styles.sc4465ee8).className || ''} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={stylex.props(styles.se99caec9).className || ''}>
            {!isRead ? <span className={stylex.props(styles.s4b70932d).className || ''} /> : null}
            <p className={cn(stylex.props(styles.sab7cc6fa).className || '', !isRead && 'font-bold')}>
              {notificationTitle(item, {
                authorName,
                targetName,
              })}
              {!resolvedName && item.author.uid ? (
                <span className={stylex.props(styles.s7ec10f67).className || ''}>
                  <Spinner size="small" />
                </span>
              ) : null}
            </p>
          </div>
          <p className={stylex.props(styles.sa56e9200).className || ''}>
            {formattedDateShort(new Date(item.eventAtMs))}
          </p>
        </div>
      </button>
      <Tooltip content={isRead ? 'Mark as unread' : 'Mark as read'}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          onClick={() => {
            onToggleRead()
          }}
        >
          <Check size={16} className={isRead ? 'text-brand' : 'text-muted-foreground'} />
        </Button>
      </Tooltip>
    </div>
  )
}
