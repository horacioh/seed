import * as stylex from '@stylexjs/stylex'
import {useDeletedContent, useUndeleteEntity} from '@/models/entities'
import {HMDeletedEntity} from '@seed-hypermedia/client/hm-types'
import {formattedDateLong, formattedDateMedium} from '@shm/shared/utils/date'
import {unpackHmId} from '@shm/shared/utils/entity-id-url'
import {Button} from '@shm/ui/button'
import {ShieldX} from '@shm/ui/icons'
import {List} from '@shm/ui/list'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
const styles_2 = stylex.create({
  sd8ffadfb: {
    display: 'flex',
    width: '100%',
    maxWidth: '600px',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
  },
})
const styles = stylex.create({
  s18c10: {
    height: 'calc(0.25rem * 5)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export default function DeletedContent() {
  const deleted = useDeletedContent()
  return (
    <List
      items={deleted.data || []}
      header={<div className={stylex.props(styles.s18c10).className || ''} />}
      footer={<div className={stylex.props(styles.s18c10).className || ''} />}
      renderItem={({item}) => {
        return (
          <div className={stylex.props(styles_2.sd8ffadfb).className || ''}>
            // @ts-expect-error
            <Tooltip
              content={`Reason: ${
                // @ts-expect-error
                item.deletedReason
              }`}
            >
              <SizableText weight="bold" color="destructive">
                {/* @ts-expect-error */}
                {item.metadata}
              </SizableText>
            </Tooltip>
            <div className={stylex.props(styles.sb42feb5d).className || ''} />
            <Tooltip
              content={`You deleted this on ${formattedDateLong(
                // @ts-expect-error
                item.deleteTime,
              )}`}
            >
              <SizableText color="muted">
                {/* @ts-expect-error */}
                {formattedDateMedium(item.deleteTime)}
              </SizableText>
            </Tooltip>
            {/* @ts-expect-error */}
            <UndeleteButton item={item} />
          </div>
        )
      }}
    />
  )
}
function UndeleteButton({item}: {item: HMDeletedEntity}) {
  const undelete = useUndeleteEntity()
  const unpackedId = item.id ? unpackHmId(item.id) : null
  if (!unpackedId) return null
  return (
    <Tooltip content={`Allow this document to be synced to your computer again.`}>
      <Button
        size="sm"
        onClick={() => {
          if (!item.id) return
          undelete.mutate({
            id: item.id,
          })
        }}
      >
        <ShieldX className={stylex.props(styles.sca3de968).className || ''} />
      </Button>
    </Tooltip>
  )
}
