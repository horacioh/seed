import * as stylex from '@stylexjs/stylex'
import {HMSiteMember, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useAccountsMetadata} from '@shm/shared/models/entity'
import {useRouteLink} from '@shm/shared/routing'
import {useMemo} from 'react'
import {HMIcon} from './hm-icon'
import {cn} from './utils'
const styles_3 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
})
const styles_2 = stylex.create({
  s83c92e9b: {
    backgroundColor: 'var(--muted)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 80%, transparent)',
      },
    },
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'var(--radius)',
    paddingInline: 'calc(var(--spacing) * 5)',
    paddingBlock: 'calc(var(--spacing) * 4)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles = stylex.create({
  s36b147d4: {
    borderRadius: 'calc(infinity * 1px)',
    boxShadow: '0 0 0 2px var(--muted)',
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
    <a {...peopleLinkProps} className={cn(stylex.props(styles_2.s83c92e9b).className || '', className)}>
      <div className={stylex.props(styles_3.s2ffff9).className || ''}>
        {displayUids.map((uid, idx) => {
          const member = members[idx]
          if (!member) return null
          const meta = accountsMeta.data[uid]
          return (
            <div
              key={uid}
              className={stylex.props(styles.s36b147d4).className || ''}
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
