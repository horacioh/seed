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
const styles_5 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sca3de96b: {
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_4 = stylex.create({
  s9c6684ea: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
      },
    },
  },
  s1a570aef: {
    backgroundColor: 'var(--tone-blue-50)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--tone-blue-100)',
      },
    },
  },
})
const styles_3 = stylex.create({
  sa16ea943: {
    fontWeight: '700',
  },
  s2c8b4ee7: {
    color: 'var(--brand)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const styles_2 = stylex.create({
  s1ccb701d: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 3)',
    textAlign: 'left',
  },
  sc67d55c1: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
})
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
        stylex.props(
          styles_5.s2ffff9,
          styles_5.scdbaf625,
          styles_5.s93b5f015,
          styles_5.s5d936fc,
          styles_5.s1aa17,
          styles_5.sbf63b0a7,
          styles_5.sf7fb00e8,
        ).className || '',
        'group',
        stylex.props(isRead ? styles_4.s9c6684ea : styles_4.s1a570aef).className || '',
      )}
    >
      <button type="button" className={stylex.props(styles_2.s1ccb701d).className || ''} onClick={() => void onOpen()}>
        <div className={stylex.props(styles.sc5969aae).className || ''}>
          {authorId ? (
            <HMIcon size={24} id={authorId} name={authorName} icon={authorIcon} />
          ) : (
            <div className={stylex.props(styles.sc4465ee8).className || ''} />
          )}
        </div>
        <div className={stylex.props(styles_2.sc67d55c1).className || ''}>
          <div className={stylex.props(styles.se99caec9).className || ''}>
            {!isRead ? <span className={stylex.props(styles.s4b70932d).className || ''} /> : null}
            <p
              className={cn(
                stylex.props(styles.sab7cc6fa).className || '',
                stylex.props(!isRead && styles_3.sa16ea943).className || '',
              )}
            >
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
          className={
            stylex.props(styles_5.sca3de96b, styles_5.sf032ed6c, styles_5.s765a26ee, styles_5.s83442393).className || ''
          }
          onClick={() => {
            onToggleRead()
          }}
        >
          <Check size={16} className={stylex.props(isRead ? styles_3.s2c8b4ee7 : styles_3.sf2718385).className || ''} />
        </Button>
      </Tooltip>
    </div>
  )
}
