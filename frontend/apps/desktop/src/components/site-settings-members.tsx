import * as stylex from '@stylexjs/stylex'
import {useSelectedAccountId} from '@/selected-account'
import {client} from '@/trpc'
import {useNavigate} from '@/utils/useNavigate'
import type {HMMetadataPayload, HMSiteMember, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {hmId} from '@shm/shared'
import {useAddCapabilities, useIsSiteOwner, useSelectedAccountCapability} from '@shm/shared/models/capabilities'
import {useResource, useSiteMembers} from '@shm/shared/models/entity'
import {queryKeys} from '@shm/shared/models/query-keys'
import type {SiteSettingsTab} from '@shm/shared/routes'
import {Button} from '@shm/ui/button'
import {HMIcon} from '@shm/ui/hm-icon'
import {SiteEmailSubscribersList} from '@shm/ui/site-email-subscribers'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {cn} from '@shm/ui/utils'
import {useQuery} from '@tanstack/react-query'
import {type ReactNode, useMemo, useState} from 'react'
const styles_4 = stylex.create({
  s37120a61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
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
const styles_3 = stylex.create({
  s78ce1b99: {
    borderColor: 'var(--brand)',
    color: 'var(--brand-2)',
    fontWeight: 'var(--font-weight-medium)',
  },
  sce3543c7: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    borderColor: 'transparent',
  },
})
const styles_2 = stylex.create({
  s78ce1b99: {
    borderColor: 'var(--brand)',
    color: 'var(--brand-2)',
    fontWeight: '500',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const styles = stylex.create({
  s4c9e7ebc: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 10)',
  },
  s81b1ecbb: {
    borderColor: 'var(--border)',
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  scd81614b: {
    marginBottom: '-1px',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  s617ed067: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(0.25rem * 1.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s34b570: {
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s9c95321: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sb136bac9: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s65917ffb: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 8)',
  },
})
type MemberSubTab = 'members' | 'writers' | 'email-subscribers'
const SUB_TABS: {
  key: MemberSubTab
  label: string
}[] = [
  {
    key: 'members',
    label: 'Members',
  },
  {
    key: 'writers',
    label: 'Writers',
  },
  {
    key: 'email-subscribers',
    label: 'Email Subscribers',
  },
]
function roleLabel(role: string): string {
  if (role === 'writer') return 'Writer'
  if (role === 'owner') return 'Owner'
  if (role === 'agent') return 'Device'
  return 'Member'
}
export function MembersSettings({siteId, activeTab}: {siteId: UnpackedHypermediaId; activeTab?: SiteSettingsTab}) {
  const navigate = useNavigate('replace')
  const resource = useResource(siteId)
  const document = resource.data?.type === 'document' ? resource.data.document : undefined
  const {isSiteOwner, isLoading: isOwnerLoading} = useIsSiteOwner(siteId.uid)
  const {accounts, grantedMembers, members, isInitialLoading} = useSiteMembers(siteId)
  const signAs = useSelectedAccountId()
  const metadataSiteUrl = document?.metadata?.siteUrl

  // Only query when the siteUrl exists
  const subscribers = useQuery({
    queryKey: [queryKeys.SITE_EMAIL_SUBSCRIBERS, metadataSiteUrl ?? null, siteId.uid, signAs],
    queryFn: () =>
      client.sites.getEmailSubscribers.query({
        siteUrl: metadataSiteUrl,
        accountUid: siteId.uid,
        signAs: signAs!,
      }),
    enabled: !!signAs && isSiteOwner && !!metadataSiteUrl,
    retry: false,
  })
  const {membersList, writersList} = useMemo(() => {
    const owner: HMSiteMember = {
      account: hmId(siteId.uid),
      role: 'owner',
    }
    const seen = new Set<string>()
    const deduped = [owner, ...grantedMembers, ...members].filter((m) => {
      if (seen.has(m.account.uid)) return false
      seen.add(m.account.uid)
      return true
    })
    return {
      membersList: deduped.filter((m) => m.role === 'member'),
      writersList: deduped.filter((m) => m.role === 'writer' || m.role === 'owner'),
    }
  }, [grantedMembers, members, siteId.uid])
  const subTab: MemberSubTab = activeTab === 'writers' || activeTab === 'email-subscribers' ? activeTab : 'members'
  if (resource.isInitialLoading || isOwnerLoading) {
    return (
      <div className={stylex.props(styles.s4c9e7ebc).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (!document) {
    return <SizableText color="muted">This account doesn't have a space yet.</SizableText>
  }
  if (!isSiteOwner) {
    return (
      <>
        <SizableText size="2xl" weight="bold">
          People with access
        </SizableText>
        <SizableText color="muted">Only the space owner can view members.</SizableText>
      </>
    )
  }
  const counts: Record<MemberSubTab, number | undefined> = {
    members: membersList.length,
    writers: writersList.length,
    'email-subscribers': subscribers.data?.subscribers?.length,
  }
  return (
    <>
      <SizableText size="2xl" weight="bold">
        People with access
      </SizableText>

      {/* Sub-tab bar with counts */}
      <div className={stylex.props(styles.s81b1ecbb).className || ''}>
        {SUB_TABS.map((t) => {
          const count = counts[t.key]
          const active = subTab === t.key
          return (
            <button
              key={t.key}
              onClick={() =>
                navigate({
                  key: 'site-settings',
                  id: siteId,
                  tab: t.key,
                })
              }
              className={cn(
                stylex.props(styles.scd81614b).className || '',
                stylex.props(active ? styles_3.s78ce1b99 : styles_3.sce3543c7).className || '',
              )}
            >
              {t.label}
              {count !== undefined ? (
                <span className={stylex.props(styles.s617ed067).className || ''}>{count}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {subTab === 'members' && (
        <MembersList siteId={siteId} people={membersList} accounts={accounts} isLoading={isInitialLoading} />
      )}
      {subTab === 'writers' && <WritersPane people={writersList} accounts={accounts} isLoading={isInitialLoading} />}
      {subTab === 'email-subscribers' && (
        <div className={stylex.props(styles.s34b56e).className || ''}>
          {metadataSiteUrl ? (
            <SiteEmailSubscribersList
              subscribers={subscribers.data?.subscribers}
              isLoading={subscribers.isLoading}
              errorMessage={subscribers.error instanceof Error ? subscribers.error.message : null}
            />
          ) : (
            <SizableText color="muted" className={stylex.props(styles.s34b570).className || ''}>
              This space doesn't have a notification service configured, so it can't collect email subscribers yet.
            </SizableText>
          )}
        </div>
      )}
    </>
  )
}
function MembersList({
  siteId,
  people,
  accounts,
  isLoading,
}: {
  siteId: UnpackedHypermediaId
  people: HMSiteMember[]
  accounts: Record<string, HMMetadataPayload>
  isLoading: boolean
}) {
  const myCapability = useSelectedAccountCapability(siteId, 'owner')
  const addCapabilities = useAddCapabilities(siteId)
  const [promotingUid, setPromotingUid] = useState<string | null>(null)
  const promote = (accountUid: string) => {
    if (!myCapability) return
    setPromotingUid(accountUid)
    addCapabilities.mutate(
      {
        myCapability,
        collaboratorAccountIds: [accountUid],
        role: 'WRITER',
      },
      {
        onSuccess: () => toast.success('Writer access granted'),
        onError: () => toast.error('Failed to grant writer access'),
        onSettled: () => setPromotingUid(null),
      },
    )
  }
  if (isLoading) return <ListSpinner />
  if (!people.length) return <EmptyMessage>No members yet.</EmptyMessage>
  return (
    <div className={stylex.props(styles.s9c95321).className || ''}>
      {people.map((member) => (
        <MemberRow
          key={member.account.uid}
          member={member}
          account={accounts[member.account.uid]}
          action={
            myCapability ? (
              <Button
                size="xs"
                variant="outline"
                loading={promotingUid === member.account.uid}
                onClick={() => promote(member.account.uid)}
              >
                Add as writer
              </Button>
            ) : null
          }
        />
      ))}
    </div>
  )
}
function WritersPane({
  people,
  accounts,
  isLoading,
}: {
  people: HMSiteMember[]
  accounts: Record<string, HMMetadataPayload>
  isLoading: boolean
}) {
  if (isLoading) return <ListSpinner />
  if (!people.length) return <EmptyMessage>No writers yet.</EmptyMessage>
  return (
    <div className={stylex.props(styles.s9c95321).className || ''}>
      {people.map((member) => (
        <MemberRow key={member.account.uid} member={member} account={accounts[member.account.uid]} />
      ))}
    </div>
  )
}
function MemberRow({member, account, action}: {member: HMSiteMember; account?: HMMetadataPayload; action?: ReactNode}) {
  const metadata = account?.metadata
  const name = metadata?.name || `${member.account.uid.slice(0, 10)}…`
  return (
    <div
      className={
        stylex.props(
          styles_4.s37120a61,
          styles_4.s2ffff9,
          styles_4.sc6ed1702,
          styles_4.s5d936fc,
          styles_4.sf79988b7,
          styles_4.s1aa16,
          styles_4.sf7fb00e8,
        ).className || ''
      }
    >
      <HMIcon id={member.account} name={metadata?.name} icon={metadata?.icon} size={32} />
      <SizableText
        size="sm"
        className={cn(
          stylex.props(styles.sb136bac9).className || '',
          stylex.props(metadata?.name ? null : styles_2.sf2718385).className || '',
        )}
      >
        {name}
      </SizableText>
      {action && member.role === 'member' ? (
        <div className={stylex.props(styles_4.s765a26ee, styles_4.s83442393).className || ''}>{action}</div>
      ) : null}
      <SizableText size="xs" color="muted" className={stylex.props(styles.sf032ed6c).className || ''}>
        {roleLabel(member.role)}
      </SizableText>
    </div>
  )
}
function ListSpinner() {
  return (
    <div className={stylex.props(styles.s65917ffb).className || ''}>
      <Spinner />
    </div>
  )
}
function EmptyMessage({children}: {children: ReactNode}) {
  return (
    <SizableText color="muted" className={stylex.props(styles.s34b570).className || ''}>
      {children}
    </SizableText>
  )
}
