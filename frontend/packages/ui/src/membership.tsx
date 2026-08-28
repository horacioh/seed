import * as stylex from '@stylexjs/stylex'
import {HMContactRecord} from '@seed-hypermedia/client/hm-types'
import {hmId, useRouteLink} from '@shm/shared'
import {useContactListOfAccount} from '@shm/shared/models/contacts'
import {useAccount} from '@shm/shared/models/entity'
import {HMIcon} from './hm-icon'
import {Spinner} from './spinner'
import {SizableText} from './text'

/** Shows sites/accounts that this account has membership in (all contacts). */
const styles_4 = stylex.create({
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const styles_3 = stylex.create({
  s6c85cbfb: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'var(--radius)',
    paddingInline: 'calc(var(--spacing) * 6)',
    paddingBlock: 'calc(var(--spacing) * 3)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_2 = stylex.create({
  sdf91ad18: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
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
  sb7e2bc2: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 4)',
  },
})
export function MembershipContent({accountUid}: {accountUid: string}) {
  const contacts = useContactListOfAccount(accountUid)
  const siteSubscribed = contacts.data?.filter((contact) => contact.subscribe?.site)
  // Deduplicate by subject (account being subscribed to)
  const uniqueSiteSubscribed = siteSubscribed?.filter(
    (contact, index, arr) => arr.findIndex((c) => c.subject === contact.subject) === index,
  )
  if (contacts.isLoading) {
    return (
      <div className={stylex.props(styles.s65917ffb).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (!uniqueSiteSubscribed?.length) {
    return (
      <div className={stylex.props(styles.s65430849).className || ''}>
        <SizableText color="muted">No spaces joined yet</SizableText>
      </div>
    )
  }
  return (
    <div className={stylex.props(styles.sb7e2bc2).className || ''}>
      {uniqueSiteSubscribed?.map((contact) => {
        return <MembershipItem key={contact.subject} contact={contact} />
      })}
    </div>
  )
}

/** Single item showing a site/account membership. */
function MembershipItem({contact}: {contact: HMContactRecord}) {
  const subject = useAccount(contact.subject, {
    subscribe: true,
  })
  const linkProps = useRouteLink({
    key: 'document',
    id: hmId(contact.subject),
  })
  const name = contact.name || subject.data?.metadata?.name
  const icon = subject.data?.metadata?.icon
  return (
    <a {...linkProps} className={stylex.props(styles_3.s6c85cbfb).className || ''}>
      <HMIcon id={hmId(contact.subject)} size={40} icon={icon} name={name} />
      <div className={stylex.props(styles_2.sdf91ad18).className || ''}>
        <SizableText
          weight="medium"
          className={
            (stylex.props(styles_4.s6e724d66).className || '') +
            ' ' +
            (name ? '' : stylex.props(styles_4.sf2718385).className || '')
          }
        >
          {name || 'Untitled'}
        </SizableText>
        {!name ? <Spinner size="small" /> : null}
      </div>
    </a>
  )
}
