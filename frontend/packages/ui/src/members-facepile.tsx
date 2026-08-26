import * as stylex from '@stylexjs/stylex'
import {HMSiteMember, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useAccountsMetadata} from '@shm/shared/models/entity'
import {useRouteLink} from '@shm/shared/routing'
import {useMemo} from 'react'
import {HMIcon} from './hm-icon'
import {cn} from './utils'
const styles = stylex.create({
  s36b147d4: {
    borderRadius: 'calc(infinity * 1px)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000,  0 0 0 calc(2px + 0px) var(--muted), 0 0 #0000',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
const MAX_AVATARS = 3
interface MembersFacepileProps {
  members: HMSiteMember[]
  siteId: UnpackedHypermediaId
  description?: string
  className?: string
}
export function MembersFacepile({members, siteId, description, className}: MembersFacepileProps) {
  const totalCount = members.length
  const displayUids = useMemo(() => members.slice(0, MAX_AVATARS).map((m) => m.account.uid), [members])
  const accountsMeta = useAccountsMetadata(displayUids)
  const peopleLinkProps = useRouteLink({
    key: 'collaborators',
    id: {
      ...siteId,
      latest: true,
      version: null,
    },
  })
  if (totalCount === 0) return null
  return (
    <a
      {...peopleLinkProps}
      className={cn(
        'bg-muted hover:bg-muted/80 flex cursor-pointer items-center gap-3 rounded-lg px-5 py-4 transition-colors',
        className,
      )}
    >
      <div className="flex -space-x-2">
        {displayUids.map((uid, idx) => {
          const member = members[idx]
          if (!member) return null
          const meta = accountsMeta.data[uid]
          return (
            <div
              key={uid}
              className={[stylex.props(styles.s36b147d4).className || '', className].filter(Boolean).join(' ')}
              style={{
                zIndex: MAX_AVATARS - idx,
              }}
            >
              <HMIcon id={member.account} name={meta?.metadata?.name} icon={meta?.metadata?.icon} size={32} />
            </div>
          )
        })}
      </div>
      <span className={stylex.props(styles.sa56e915f).className || ''}>
        {description || `${totalCount} member${totalCount !== 1 ? 's' : ''} collaborating`}
      </span>
    </a>
  )
}
