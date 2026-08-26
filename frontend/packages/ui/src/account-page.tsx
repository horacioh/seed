import * as stylex from '@stylexjs/stylex'
import {HMMetadataPayload} from '@seed-hypermedia/client/hm-types'
import {hmId, hostnameStripProtocol, ProfileTab, useDomain, useFollowProfile, useRouteLink} from '@shm/shared'
import {IS_DESKTOP} from '@shm/shared/constants'
import {useAccount, useResource} from '@shm/shared/models/entity'
import {ActivityIcon, AlertCircle, Check, LucideIcon, Rss, UserCheck, Users} from 'lucide-react'
import {ReactNode} from 'react'
import {Button} from './button'
import {ScrollArea} from './components/scroll-area'
import {Feed} from './feed'
import {FollowButton} from './follow-button'
import {FollowersContent} from './followers'
import {FollowingContent} from './following'
import {HMIcon} from './hm-icon'
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card'
import {Pencil} from './icons'
import {MembershipContent} from './membership'
import {PageLayout} from './page-layout'
import {PageTabItem, PageTabs} from './page-tabs'
const styles = stylex.create({
  sb42feb5d: {
    flex: '1',
  },
  s86ff3e6: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  s2e6cd8a3: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '700',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf465c2d8: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
    wordBreak: 'break-all',
    color: 'oklch(62.3% 0.214 259.815)',
  },
  sab7d789e: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    color: 'oklch(59.6% 0.145 163.225)',
  },
  s36c7f1: {
    width: 'calc(0.25rem * 72)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s5b4541d: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    color: 'oklch(66.6% 0.179 58.318)',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
})
export type SiteAccountTab = 'profile' | 'membership' | 'followers' | 'following'
const SITE_ACCOUNT_TABS: {
  label: string
  value: SiteAccountTab
  icon: LucideIcon
}[] = [
  {
    label: 'Activity',
    value: 'profile',
    icon: ActivityIcon,
  },
  {
    label: 'Space Membership',
    value: 'membership',
    icon: Users,
  },
  {
    label: 'Followers',
    value: 'followers',
    icon: UserCheck,
  },
  {
    label: 'Following',
    value: 'following',
    icon: Rss,
  },
]
const DOMAIN_LINK_STALE_TIME_MS = 3 * 60 * 60 * 1000
function getSiteHostname(siteUrl?: string | null): string | null {
  if (!siteUrl) return null
  try {
    return new URL(siteUrl).hostname || null
  } catch {
    return null
  }
}

/**
 * Resolves whether the profile header should link to the verified custom domain
 * or keep the legacy in-app site navigation.
 */
export function getAccountSiteLinkState(params: {
  accountUid?: string | null
  hasSite: boolean
  siteUrl?: string | null
  registeredAccountUid?: string | null
  isDomainLoading?: boolean
}) {
  const hostname = getSiteHostname(params.siteUrl)
  const domainLabel = params.siteUrl ? hostnameStripProtocol(params.siteUrl) : 'Open Space'
  if (!params.hasSite) {
    return {
      kind: 'hidden' as const,
      label: 'Open Space',
      status: 'default' as const,
      hostname,
    }
  }
  if (!params.siteUrl) {
    return {
      kind: 'internal' as const,
      label: 'Open Space',
      status: 'default' as const,
      hostname,
    }
  }
  if (!hostname) {
    return {
      kind: 'internal' as const,
      label: 'Open Space',
      status: 'default' as const,
      hostname,
    }
  }
  if (
    !params.isDomainLoading &&
    params.accountUid &&
    params.registeredAccountUid &&
    params.registeredAccountUid === params.accountUid
  ) {
    return {
      kind: 'external' as const,
      label: domainLabel,
      status: 'verified' as const,
      hostname,
      verifiedMessage: `${domainLabel} is currently working for this profile account.`,
    }
  }
  if (params.isDomainLoading) {
    return {
      kind: 'internal' as const,
      label: domainLabel,
      status: 'default' as const,
      hostname,
    }
  }
  return {
    kind: 'internal' as const,
    label: 'Open Space',
    status: 'warning' as const,
    hostname,
    warningMessage: `${domainLabel} is not resolving to this profile account.`,
  }
}
export function AccountPage({
  siteUid,
  accountUid,
  tab,
  onEditProfile,
  headerButtons,
  onFollowClick,
}: {
  siteUid?: string | null
  accountUid: string
  tab: ProfileTab
  /** Callback to open edit profile dialog (only shown for own account) */
  onEditProfile?: () => void
  /** Additional header buttons (e.g., logout, link keys) - only shown for own account */
  headerButtons?: ReactNode
  /** Override follow button click (web: saves intent + opens signup for unauthenticated users) */
  onFollowClick?: () => void
}) {
  let ActiveTabContent = ProfileContent
  if (tab === 'membership') {
    ActiveTabContent = MembershipContent
  } else if (tab === 'followers') {
    ActiveTabContent = FollowersContent
  } else if (tab === 'following') {
    ActiveTabContent = FollowingContent
  }
  const account = useAccount(accountUid)
  const {isFollowing, isPending, isOwnAccount, followProfile, unfollowProfile} = useFollowProfile({
    profileUid: accountUid,
  })
  const handleFollowClick = onFollowClick ?? followProfile
  return (
    <ScrollArea className={stylex.props(styles.sb42feb5d).className || ''}>
      <PageLayout contentMaxWidth={720}>
        <div className="space-y-6 py-8">
          <div className="m-4 flex-col space-y-6">
            <div className={stylex.props(styles.s86ff3e6).className || ''}>
              <HMIcon
                id={hmId(accountUid)}
                size={64}
                icon={account.data?.metadata?.icon}
                name={account.data?.metadata?.name}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h1 className={stylex.props(styles.s2e6cd8a3).className || ''}>
                  {account.data?.metadata?.name || accountUid}
                </h1>
                <SiteLink account={account.data} />
              </div>
              <div className={stylex.props(styles.s86ff3e4).className || ''}>
                {isOwnAccount && onEditProfile && (
                  <Button variant="outline" onClick={onEditProfile}>
                    <Pencil className={stylex.props(styles.sca3de968).className || ''} />
                    Edit
                  </Button>
                )}
                {isOwnAccount && headerButtons}
                {!isOwnAccount && (
                  <FollowButton
                    onClick={isFollowing ? unfollowProfile : handleFollowClick}
                    disabled={isPending}
                    isFollowing={isFollowing}
                  />
                )}
              </div>
            </div>
            <AccountPageTabs siteUid={siteUid} accountUid={accountUid} tab={tab} />
          </div>
          <ActiveTabContent siteUid={siteUid} accountUid={accountUid} />
        </div>
      </PageLayout>
    </ScrollArea>
  )
}
function SiteLink({account}: {account?: HMMetadataPayload | null}) {
  const homeId = account?.id?.uid ? hmId(account.id.uid) : null
  const siteUrl = account?.metadata?.siteUrl || null
  const hostname = getSiteHostname(siteUrl)
  const homeDocument = useResource(homeId, {
    subscribed: true,
  })
  const homeDocData = homeDocument.data?.type === 'document' ? homeDocument.data.document : null
  const hasSite = !!siteUrl || !!homeDocData
  const domainInfo = useDomain(hostname, {
    enabled: !!hostname,
    retry: false,
    staleTime: DOMAIN_LINK_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })
  const linkState = getAccountSiteLinkState({
    accountUid: account?.id?.uid,
    hasSite,
    siteUrl,
    registeredAccountUid: domainInfo.data?.registeredAccountUid,
    isDomainLoading: domainInfo.isLoading,
  })
  const internalLinkProps = useRouteLink(
    homeId
      ? {
          key: 'document',
          id: homeId,
        }
      : null,
    homeId
      ? {
          origin: siteUrl,
          originHomeId: homeId,
        }
      : undefined,
  )
  const externalLinkProps = useRouteLink(siteUrl)
  if (linkState.kind === 'hidden') return null
  const linkProps = linkState.kind === 'external' && !IS_DESKTOP ? externalLinkProps : internalLinkProps
  return (
    <a className={stylex.props(styles.sf465c2d8).className || ''} {...linkProps}>
      <span>{linkState.label}</span>
      {linkState.status === 'verified' && linkState.verifiedMessage ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span
              className={stylex.props(styles.sab7d789e).className || ''}
              aria-label="Domain verification details"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Check className={stylex.props(styles.sca3de968).className || ''} />
            </span>
          </HoverCardTrigger>
          <HoverCardContent align="start" className={stylex.props(styles.s36c7f1).className || ''}>
            <div className="space-y-2 text-sm">
              <div className={stylex.props(styles.s129e46b3).className || ''}>{linkState.hostname}</div>
              <div className={stylex.props(styles.sf2718385).className || ''}>{linkState.verifiedMessage}</div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : null}
      {linkState.status === 'warning' && linkState.warningMessage ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span
              className={stylex.props(styles.s5b4541d).className || ''}
              aria-label="Domain verification details"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <AlertCircle className={stylex.props(styles.sca3de968).className || ''} />
            </span>
          </HoverCardTrigger>
          <HoverCardContent align="start" className={stylex.props(styles.s36c7f1).className || ''}>
            <div className="space-y-2 text-sm">
              <div className={stylex.props(styles.s129e46b3).className || ''}>{linkState.hostname}</div>
              <div className={stylex.props(styles.sf2718385).className || ''}>{linkState.warningMessage}</div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : null}
    </a>
  )
}
function ProfileContent({siteUid: _siteUid, accountUid}: {siteUid?: string | null; accountUid: string}) {
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      <Feed filterAuthors={[accountUid]} filterResource={undefined} />
    </div>
  )
}
function AccountPageTabs({
  siteUid,
  accountUid,
  tab,
}: {
  siteUid?: string | null
  accountUid: string
  tab: SiteAccountTab
}) {
  const tabs: PageTabItem[] = SITE_ACCOUNT_TABS.map((t) => ({
    key: t.value,
    label: t.label,
    icon: t.icon,
    route: siteUid
      ? {
          key: 'site-profile',
          id: hmId(siteUid),
          accountUid: accountUid !== siteUid ? accountUid : undefined,
          tab: t.value,
        }
      : {
          key: 'profile',
          id: hmId(accountUid),
          tab: t.value,
        },
  }))
  return <PageTabs tabs={tabs} activeTab={tab} />
}
