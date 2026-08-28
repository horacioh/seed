import * as stylex from '@stylexjs/stylex'
import {HMAccountsMetadata, HMActivitySummary, HMComment, HMLibraryDocument} from '@seed-hypermedia/client/hm-types'
import {formattedDate, getMetadataName, normalizeDate, plainTextOfContent, useRouteLink} from '@shm/shared'
import {Button} from './button'
import {Version} from './icons'
import {SizableText} from './text'
import {cn} from './utils'
const styles_2 = stylex.create({
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s5f846256: {
    backgroundColor: 'oklch(27.8% 0.033 256.848)',
  },
  s63f771a: {
    padding: 'calc(0.25rem * 0.5)',
  },
})
const styles = stylex.create({
  s7b2d8cee: {
    height: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  s921206a0: {
    display: 'flex',
    width: '100%',
    flex: '1',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  s3e376100: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
  s48f55329: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 'calc(0.25rem * 2)',
  },
  s675d16be: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
  },
  sf79d1283: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
    flexShrink: '0',
    fontFamily: 'var(--font-sans)',
    opacity: '80%',
  },
})
export function SubDocumentItem({
  item,
  accountsMetadata,
  markedAsRead,
  hideIcon,
}: {
  item: HMLibraryDocument
  accountsMetadata: HMAccountsMetadata
  markedAsRead?: boolean
  hideIcon?: boolean
}) {
  const metadata = item?.metadata
  const id = item.id
  const isRead = markedAsRead || !item.activitySummary?.isUnread
  const linkProps = useRouteLink({
    key: 'document',
    id,
  })
  return (
    <Button className={cn(stylex.props(styles.s7b2d8cee).className || '')} {...linkProps}>
      {!hideIcon && (
        <div
          className={
            stylex.props(
              styles_2.sc6ed1702,
              styles_2.sce22ca32,
              styles_2.s775755af,
              styles_2.s5f846256,
              styles_2.s63f771a,
            ).className || ''
          }
        >
          <Version size={16} color="white" />
        </div>
      )}
      <div className={stylex.props(styles.s921206a0).className || ''}>
        <SizableText weight={isRead ? 'normal' : 'bold'} className={stylex.props(styles.s3e376100).className || ''}>
          {getMetadataName(metadata)}
        </SizableText>

        {item.activitySummary && (
          <LibraryEntryUpdateSummary
            accountsMetadata={accountsMetadata}
            latestComment={item.latestComment}
            activitySummary={item.activitySummary}
          />
        )}
      </div>
    </Button>
  )
}
export function LibraryEntryUpdateSummary({
  activitySummary,
  accountsMetadata,
  latestComment,
}: {
  activitySummary: HMActivitySummary
  accountsMetadata: HMAccountsMetadata | undefined
  latestComment: HMComment | undefined | null
}) {
  const latestChangeTime = normalizeDate(activitySummary?.latestChangeTime)
  const latestCommentTime = normalizeDate(activitySummary?.latestCommentTime)
  let summaryText = ''
  if (latestChangeTime) {
    summaryText = `Document Changed`
  }
  if (latestCommentTime && latestChangeTime && latestCommentTime > latestChangeTime) {
    const author = latestComment?.author ? accountsMetadata?.[latestComment?.author] : undefined
    const authorName = author?.metadata?.name
    summaryText = `Comment`
    if (authorName && latestComment) {
      summaryText = `${authorName}: ${plainTextOfContent(latestComment.content)}`
    }
  }
  return (
    <div className={stylex.props(styles.s48f55329).className || ''}>
      <SizableText size="xs" color="muted" className={stylex.props(styles.s675d16be).className || ''} weight="light">
        {summaryText}
      </SizableText>
      <ActivityTime activitySummary={activitySummary} />
    </div>
  )
}
export function ActivityTime({activitySummary}: {activitySummary: HMActivitySummary}) {
  const latestChangeTime = normalizeDate(activitySummary?.latestChangeTime)
  const latestCommentTime = normalizeDate(activitySummary?.latestCommentTime)
  const displayTime =
    latestCommentTime && latestChangeTime && latestCommentTime > latestChangeTime ? latestCommentTime : latestChangeTime
  if (displayTime) {
    return (
      <SizableText size="xs" color="muted" className={stylex.props(styles.sf79d1283).className || ''} weight="light">
        ({formattedDate(displayTime)})
      </SizableText>
    )
  }
  return null
}
