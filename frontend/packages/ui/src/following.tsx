import * as stylex from '@stylexjs/stylex'
import {hasProfileSubscription, hmId, useContactListOfAccount, useRouteLink} from '@shm/shared'
import {useAccountsMetadata} from '@shm/shared/models/entity'
import {useMemo} from 'react'
import {HMIcon} from './hm-icon'
import {Spinner} from './spinner'
import {SizableText} from './text'

/** Shows accounts that this account is following (contacts with profile subscription). */
const styles_3 = stylex.create({
  s57f1f153: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'var(--radius)',
    padding: 'calc(var(--spacing) * 3)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_2 = stylex.create({
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
const styles = stylex.create({
  s65917ffb: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 8)',
  },
  s65430849: {
    paddingBlock: 'calc(0.25rem * 8)',
    textAlign: 'center',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
export function FollowingContent({siteUid, accountUid}: {siteUid?: string | null; accountUid: string}) {
  const allContacts = useContactListOfAccount(accountUid)
  // Filter to only show contacts with profile subscription (explicit or implicit for legacy)
  // Deduplicate by subject (account being followed)
  const following = useMemo(() => {
    const filtered = allContacts.data?.filter((c) => hasProfileSubscription(c)) ?? []
    return filtered.filter((contact, index, arr) => arr.findIndex((c) => c.subject === contact.subject) === index)
  }, [allContacts.data])
  const followingUids = useMemo(() => {
    return following.map((c) => c.subject)
  }, [following])
  const followingAccounts = useAccountsMetadata(followingUids)
  if (allContacts.isLoading) {
    return (
      <div className={stylex.props(styles.s65917ffb).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (!following.length) {
    return (
      <div className={stylex.props(styles.s65430849).className || ''}>
        <SizableText color="muted">Not following anyone yet</SizableText>
      </div>
    )
  }
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      {following.map((contact) => {
        const accountData = followingAccounts.data[contact.subject]
        return (
          <FollowingItem
            key={contact.id}
            accountUid={contact.subject}
            metadata={accountData?.metadata}
            siteUid={siteUid}
          />
        )
      })}
    </div>
  )
}

/** Single item showing an account being followed. */
function FollowingItem({
  accountUid,
  metadata,
  siteUid,
}: {
  accountUid: string
  metadata?: {
    name?: string
    icon?: string
  } | null
  siteUid?: string | null
}) {
  const linkProps = useRouteLink(
    siteUid
      ? {
          key: 'site-profile',
          id: hmId(siteUid),
          accountUid: accountUid !== siteUid ? accountUid : undefined,
          tab: 'profile',
        }
      : {
          key: 'profile',
          id: hmId(accountUid),
          tab: 'profile',
        },
  )
  return (
    <a {...linkProps} className={stylex.props(styles_3.s57f1f153).className || ''}>
      <HMIcon id={hmId(accountUid)} size={40} icon={metadata?.icon} name={metadata?.name} />
      <div className={stylex.props(styles_2.se30fd43e).className || ''}>
        <SizableText weight="medium" className={stylex.props(styles.s6e724d66).className || ''}>
          {metadata?.name || 'Untitled'}
        </SizableText>
      </div>
    </a>
  )
}
