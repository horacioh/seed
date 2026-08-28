import * as stylex from '@stylexjs/stylex'
import {HMContactItem, HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {abbreviateUid, AnyTimestamp, formattedDateShort, hmId, NavRoute, normalizeDate, useRouteLink} from '@shm/shared'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {useAccount, useResource} from '@shm/shared/models/entity'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Spinner} from './spinner'
import {Tooltip} from './tooltip'
const styles_4 = stylex.create({
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const styles_3 = stylex.create({
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s769ec921: {
    padding: '2px',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s356a30: {
    boxShadow: '0 0 0 1px var(--ring-color, currentcolor)',
  },
  s646c459b: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
      },
    },
  },
  s48a3ed91: {
    ':active': {
      backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
    },
  },
})
const styles_2 = stylex.create({
  s9cd548c8: {
    marginLeft: 'calc(var(--spacing) * 1)',
    flex: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
const styles = stylex.create({
  s21188150: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s332783: {
    marginLeft: 'calc(0.25rem * 1)',
  },
})
function formatUTC(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1) // Months are 0-based.
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  return `${year}-${month}-${day} ${hours}:${minutes} (UTC)`
}
export function Timestamp({time, route}: {time: AnyTimestamp; route?: NavRoute | null}) {
  const linkProps = useRouteLink(route ?? null)
  const date = time ? normalizeDate(time) : null
  if (!time || !date) return null
  return (
    <Tooltip side="top" delay={400} content={formatUTC(date)}>
      <a {...linkProps} className={stylex.props(styles_2.s9cd548c8).className || ''}>
        {formattedDateShort(time)}
      </a>
    </Tooltip>
  )
}
export function InlineDescriptor({children}: {children: React.ReactNode}) {
  return <p className={stylex.props(styles.s21188150).className || ''}>{children}</p>
}
function getSiteContextUid(route: NavRoute | null): string | null {
  if (!route) return null
  switch (route.key) {
    case 'document':
    case 'feed':
    case 'activity':
    case 'comments':
    case 'directory':
    case 'collaborators':
    case 'metadata':
    case 'site-profile':
    case 'profile':
    case 'contact':
      return route.id.uid
    default:
      return null
  }
}

/** Builds a profile route that prefers the current site context when one exists. */
export function getContextualProfileRoute(
  currentRoute: NavRoute | null,
  accountId: UnpackedHypermediaId | null,
  siteUid?: string | null,
): NavRoute | null {
  if (!accountId) return null
  const effectiveSiteUid = siteUid || getSiteContextUid(currentRoute)
  if (!effectiveSiteUid) {
    return {
      key: 'profile',
      id: accountId,
    }
  }
  return {
    key: 'site-profile',
    id: hmId(effectiveSiteUid),
    accountUid: accountId.uid !== effectiveSiteUid ? accountId.uid : undefined,
    tab: 'profile',
  }
}

/** Inline link to an author's profile, with a spinner while the account is still loading. */
export function AuthorNameLink({author, siteUid}: {author: HMContactItem | null; siteUid?: string}) {
  const currentRoute = useNavRoute()
  // Use the account query to get fresh cache data and distinguish loading from settled.
  // When useHackyAuthorsSubscriptions discovers the account, this query gets invalidated
  // and re-renders with the resolved name.
  const account = useAccount(author?.id?.uid, {
    subscribe: true,
  })
  const resolvedName = account.data?.metadata?.name || author?.metadata?.name
  const authorName = resolvedName || abbreviateUid(author?.id?.uid)
  const linkProps = useRouteLink(getContextualProfileRoute(currentRoute, author?.id || null, siteUid))
  return (
    <a
      className={
        (stylex.props(styles_4.sa1762f51, styles_4.sab7cc6fa, styles_4.sa16ea943).className || '') +
        ' ' +
        (resolvedName
          ? stylex.props(styles_4.sc05281e3).className || ''
          : stylex.props(styles_4.sf2718385).className || '')
      }
      {...linkProps}
    >
      {authorName}
      {!resolvedName ? (
        <span className={stylex.props(styles.s332783).className || ''}>
          <Spinner size="small" />
        </span>
      ) : null}
    </a>
  )
}
export function DocumentNameLink({
  metadata,
  id,
  fallback = 'a document',
}: {
  metadata?: HMMetadata | null
  id: UnpackedHypermediaId
  fallback?: string
}) {
  const linkProps = useRouteLink({
    key: 'document',
    id,
  })
  const actions = useDocumentActions()
  const draft = actions.getDraft?.(id)
  const resource = useResource(id, {
    subscribed: true,
  })
  const liveMetadata = resource.data?.type === 'document' ? resource.data.document.metadata : undefined
  const name = draft?.metadata?.name ?? liveMetadata?.name ?? metadata?.name
  return (
    <a
      className={
        stylex.props(
          styles_3.s436dc7b6,
          styles_3.sc05281e3,
          styles_3.sae6a97a5,
          styles_3.s529492ad,
          styles_3.s769ec921,
          styles_3.sa1762f51,
          styles_3.sab7cc6fa,
          styles_3.s356a30,
          styles_3.s646c459b,
          styles_3.s48a3ed91,
        ).className || ''
      }
      {...linkProps}
    >
      {name || fallback}
    </a>
  )
}
