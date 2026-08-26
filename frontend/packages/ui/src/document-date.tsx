import * as stylex from '@stylexjs/stylex'
import {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {useTx, useTxUtils} from '@shm/shared/translation'
import {SizableText} from './text'
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card'
const styles = stylex.create({
  s9b9fe380: {
    flexShrink: '0',
    flexGrow: '0',
    cursor: 'default',
  },
  se2dff6fe: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
  },
})
export function DocumentDate({
  metadata,
  updateTime,
  disableTooltip = false,
}: {
  metadata?: HMMetadata
  updateTime: (
    | string
    | {
        seconds: number | bigint
        nanos: number
      }
  ) &
    (
      | string
      | {
          seconds: number | bigint
          nanos: number
        }
      | undefined
    )
  disableTooltip?: boolean
}) {
  const tx = useTx()
  const {formattedDateDayOnly, formattedDateMedium, formattedDateLong} = useTxUtils()
  const displayText = metadata?.displayPublishTime
    ? formattedDateDayOnly(new Date(metadata.displayPublishTime))
    : formattedDateMedium(updateTime)
  const content: React.ReactNode[] = [
    <SizableText size="sm" color="muted" key="last-update" suppressHydrationWarning>
      {tx('Last Update')}: {formattedDateLong(updateTime)}
    </SizableText>,
    // // Disabled because this is always 1969 because the backend looks at the deterministic genesis blob instead of the actual creation time
    // <SizableText size="sm">
    //   First published: {formattedDateLong(document?.createTime)}
    // </SizableText>,
  ]
  if (metadata?.displayPublishTime) {
    content.unshift(
      <SizableText
        // className="text-brand/50"
        className="brand"
        size="sm"
        key="original-publish-date"
      >
        {tx('Original Publish date')}: {displayText}
      </SizableText>,
    )
  }
  return (
    <HoverCard>
      <HoverCardTrigger>
        <SizableText
          size="xs"
          color={metadata?.displayPublishTime ? 'brand' : 'muted'}
          className={stylex.props(styles.s9b9fe380).className || ''}
        >
          {displayText}
        </SizableText>
      </HoverCardTrigger>
      {!disableTooltip && (
        <HoverCardContent>
          <div className={stylex.props(styles.se2dff6fe).className || ''}>{content}</div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
