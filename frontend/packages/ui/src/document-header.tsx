import * as stylex from '@stylexjs/stylex'
import {
  HMDocument,
  HMMetadata,
  HMMetadataPayload,
  HMResourceVisibility,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {abbreviateUid, useRouteLink} from '@shm/shared'
import {useAccount} from '@shm/shared/models/entity'
import type {NavRoute} from '@shm/shared/routes'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {X} from 'lucide-react'
import {useMemo} from 'react'
import {Button} from './button'
import {Container} from './container'
import {DocumentDate} from './document-date'
import {useHighlighter} from './highlight-context'
import {HMIcon} from './hm-icon'
import {Home} from './icons'
import {getContextualProfileRoute} from './inline-descriptor'
import {Spinner} from './spinner'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles = stylex.create({
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s2d015205: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
  },
  sf4b0a39d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '700',
  },
  sd54a55b9: {
    backgroundColor: 'var(--border)',
    height: 'calc(0.25rem * 6)',
    width: '1px',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s332783: {
    marginLeft: 'calc(0.25rem * 1)',
  },
  s2b214c4f: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
  },
  sdc925448: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export type AuthorPayload = HMMetadataPayload
export type BreadcrumbEntry =
  | {
      id: UnpackedHypermediaId
      metadata: HMMetadata
      isLoading?: boolean
      isNotFound?: boolean
      isTombstone?: boolean
      isError?: boolean
      /** Set on the last crumb when the current page is an unpublished local draft. */
      isUnpublishedDraft?: boolean
      /** Local draft route target for unpublished breadcrumb sections. */
      draftId?: string
      fallbackName?: string
    }
  | {
      label: string
    }
export function DocumentHeader({
  docId,
  docMetadata,
  authors = [],
  updateTime = null,
  siteUrl,
  documentTools,
  showTitle = true,
  children,
  onRemoveIcon,
  mobileBylineAction,
}: {
  docId: UnpackedHypermediaId | null
  docMetadata: HMMetadata | null
  authors: AuthorPayload[]
  updateTime: HMDocument['updateTime'] | null
  siteUrl?: string
  documentTools?: React.ReactNode
  visibility?: HMResourceVisibility
  version?: HMDocument['version'] | null
  showTitle?: boolean
  children?: React.ReactNode
  onRemoveIcon?: () => void
  mobileBylineAction?: React.ReactNode
}) {
  const hasCover = useMemo(() => !!docMetadata?.cover, [docMetadata])
  const hasIcon = useMemo(() => !!docMetadata?.icon, [docMetadata])
  const isHomeDoc = !docId?.path?.length
  const highlighter = useHighlighter()
  const displayAuthors = useMemo(() => {
    const seen = new Set<string>()
    return authors.filter((author) => {
      const key = author.id.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [authors])
  return (
    <Container
      className={cn('dark:bg-background relative w-full rounded-lg bg-white', hasCover ? 'pt-6' : 'pt-4 md:pt-15')}
      style={{
        marginTop: hasCover ? -40 : 0,
      }}
    >
      <div className="flex flex-col gap-2 md:gap-4">
        {!isHomeDoc && docId && hasIcon ? (
          <div
            className="group/icon relative flex w-fit"
            style={{
              marginTop: hasCover ? -80 : 0,
            }}
          >
            <HMIcon size={100} id={docId} name={docMetadata?.name} icon={docMetadata?.icon} />
            {onRemoveIcon ? (
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label="Remove document icon"
                className="absolute -top-2 -right-2 z-20 size-7 rounded-full bg-black/40 text-white opacity-100 shadow-sm backdrop-blur-sm transition-opacity hover:bg-black/60 md:pointer-events-none md:opacity-0 md:group-hover/icon:pointer-events-auto md:group-hover/icon:opacity-100 md:focus-visible:pointer-events-auto md:focus-visible:opacity-100"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onRemoveIcon()
                }}
              >
                <X className={stylex.props(styles.s3269316e).className || ''} />
              </Button>
            ) : null}
          </div>
        ) : null}
        {children ? (
          children
        ) : (
          <>
            {showTitle && (
              <SizableText
                className="text-2xl max-md:leading-tight md:text-4xl lg:text-5xl"
                weight="bold"
                {...highlighter(docId)}
              >
                {isHomeDoc ? 'Home' : docMetadata?.name}
              </SizableText>
            )}
            {docMetadata?.summary ? (
              <span className="font-body text-muted-foreground text-xl">{docMetadata?.summary}</span>
            ) : null}
          </>
        )}
        <div className="border-border flex flex-col gap-2 border-b pb-2 md:pb-4">
          {siteUrl ? <SiteURLButton siteUrl={siteUrl} /> : null}
          <div className={stylex.props(styles.s2d015205).className || ''}>
            <div className="hidden flex-1 flex-wrap items-center gap-3 md:flex">
              {displayAuthors.length ? (
                <>
                  <p className={stylex.props(styles.sf4b0a39d).className || ''}>
                    {displayAuthors.flatMap((a, index) => {
                      return [
                        <AuthorLink id={a.id} key={a.id.id} siteUid={docId?.uid} />,
                        index !== displayAuthors.length - 1 ? (
                          index === displayAuthors.length - 2 ? (
                            <SizableText key={`${a.id.id}-and`} size="xs" weight="bold">
                              {' & '}
                            </SizableText>
                          ) : (
                            <SizableText size="xs" key={`${a.id.id}-comma`} weight="bold">
                              {', '}
                            </SizableText>
                          )
                        ) : null,
                      ]
                    })}
                  </p>
                  <div className={stylex.props(styles.sd54a55b9).className || ''} />
                </>
              ) : null}
              {updateTime ? <DocumentDate metadata={docMetadata || undefined} updateTime={updateTime} /> : null}
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
              {displayAuthors.length ? (
                <>
                  <div className="flex shrink-0 items-center -space-x-2">
                    {displayAuthors.slice(0, 3).map((author) => (
                      <div
                        key={author.id.id}
                        className="dark:border-background dark:bg-background size-5 overflow-hidden rounded-full border-2 border-white bg-white"
                      >
                        <HMIcon id={author.id} name={author.metadata?.name} icon={author.metadata?.icon} size={20} />
                      </div>
                    ))}
                  </div>
                  <p className="min-w-0 truncate text-xs font-medium">
                    <AuthorLink id={displayAuthors[0]!.id} siteUid={docId?.uid} />
                    {displayAuthors.length > 1 ? ` & ${displayAuthors.length - 1} others` : null}
                  </p>
                </>
              ) : null}
              {displayAuthors.length && updateTime ? (
                <SizableText size="xs" className={stylex.props(styles.sf032ed6c).className || ''} aria-hidden="true">
                  ·
                </SizableText>
              ) : null}
              {updateTime ? <DocumentDate metadata={docMetadata || undefined} updateTime={updateTime} /> : null}
            </div>
            {mobileBylineAction}
          </div>
        </div>
      </div>
      {documentTools}
    </Container>
  )
}

/** Renders a clickable author name with a spinner while the account is loading. */
function AuthorLink({id, siteUid}: {id: UnpackedHypermediaId; siteUid?: string}) {
  const currentRoute = useNavRoute()
  const account = useAccount(id.uid, {
    subscribe: true,
  })
  const resolvedName = account.data?.metadata?.name
  const linkProps = useRouteLink(getContextualProfileRoute(currentRoute, id, siteUid))
  return (
    <a
      {...linkProps}
      className={`no-underline underline-offset-4 hover:underline ${resolvedName ? '' : 'text-muted-foreground'}`}
    >
      {resolvedName || abbreviateUid(id.uid)}
      {!resolvedName ? (
        <span className={stylex.props(styles.s332783).className || ''}>
          <Spinner size="small" />
        </span>
      ) : null}
    </a>
  )
}

/**
 * Renders the document's location trail, ending with the current document as
 * non-navigable text. A lone crumb still renders: it is the home document.
 */
export function Breadcrumbs({breadcrumbs, className}: {breadcrumbs: BreadcrumbEntry[]; className?: string}) {
  if (breadcrumbs.length === 0) return null
  const [first, ...rest] = breadcrumbs
  const lastIndex = breadcrumbs.length - 1
  return (
    <nav aria-label="Breadcrumb" className={cn('text-muted-foreground flex min-w-0 items-center', className)}>
      <ol className="flex min-w-0 items-center gap-2">
        {first && 'id' in first ? (
          <li className={stylex.props(styles.s2b214c4f).className || ''}>
            <HomeBreadcrumb crumb={first} isCurrent={lastIndex === 0} />
          </li>
        ) : null}
        {rest.map((crumb, i) => {
          const index = i + 1
          const key = 'id' in crumb ? crumb.id.id : `label-${i}`
          const isCurrent = index === lastIndex
          return (
            <li key={key} className="flex min-w-0 items-center gap-2">
              <SizableText
                aria-hidden="true"
                color="muted"
                size="xs"
                className={stylex.props(styles.sf032ed6c).className || ''}
              >
                {'>'}
              </SizableText>
              {'id' in crumb ? (
                <BreadcrumbLink crumb={crumb} isCurrent={isCurrent} />
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className="min-w-0 truncate text-xs whitespace-nowrap"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
type DocumentBreadcrumbEntry = Extract<
  BreadcrumbEntry,
  {
    id: any
  }
>
function HomeBreadcrumb({crumb, isCurrent}: {crumb: DocumentBreadcrumbEntry; isCurrent: boolean}) {
  const linkProps = useRouteLink({
    key: 'document',
    id: crumb.id,
  })
  if (isCurrent) {
    return (
      <span aria-current="page" className={stylex.props(styles.sdc925448).className || ''}>
        <Home className={stylex.props(styles.sca3de967).className || ''} />
      </span>
    )
  }
  return (
    <a {...linkProps} className="text-muted-foreground flex items-center gap-1 no-underline hover:underline">
      <Home className={stylex.props(styles.sca3de967).className || ''} />
    </a>
  )
}
function BreadcrumbLink({crumb, isCurrent}: {crumb: DocumentBreadcrumbEntry; isCurrent: boolean}) {
  const route: NavRoute = crumb.draftId
    ? {
        key: 'draft',
        id: crumb.draftId,
      }
    : {
        key: 'document',
        id: crumb.id,
      }
  const linkProps = useRouteLink(route)
  const title = crumb.metadata?.name
  const fallbackName = crumb.fallbackName || crumb.id.path?.at(-1) || crumb.id.uid.slice(0, 8)
  const displayName = title || fallbackName
  const renderText = (className: string, label = displayName) =>
    isCurrent ? (
      <span aria-current="page" className={className}>
        {label}
      </span>
    ) : (
      <a {...linkProps} className={`${className} no-underline hover:underline`}>
        {label}
      </a>
    )
  if (crumb.isLoading) {
    const content = (
      <>
        {title || 'Loading…'}
        <Spinner size="small" />
      </>
    )
    const className = 'text-muted-foreground flex min-w-0 items-center gap-1 truncate text-xs whitespace-nowrap'
    if (isCurrent) {
      return (
        <span aria-current="page" className={className}>
          {content}
        </span>
      )
    }
    return (
      <a {...linkProps} className={`${className} no-underline hover:underline`}>
        {content}
      </a>
    )
  }
  if (crumb.isTombstone) {
    return (
      <Tooltip content="This document has been deleted">
        {renderText('min-w-0 truncate text-xs whitespace-nowrap text-red-500')}
      </Tooltip>
    )
  }
  if (crumb.isUnpublishedDraft) {
    return (
      <Tooltip content="This document is a draft and has not been published yet — its URL is private to you.">
        {renderText('text-muted-foreground min-w-0 truncate text-xs whitespace-nowrap italic')}
      </Tooltip>
    )
  }
  if (crumb.isNotFound) {
    return (
      <Tooltip content="Document not found on the network">
        {renderText('min-w-0 truncate text-xs whitespace-nowrap text-red-500')}
      </Tooltip>
    )
  }
  if (crumb.isError) {
    return (
      <Tooltip content="Failed to load this document">
        {renderText('min-w-0 truncate text-xs whitespace-nowrap text-red-500')}
      </Tooltip>
    )
  }
  if (!crumb.metadata?.name) {
    return renderText('text-muted-foreground min-w-0 truncate text-xs whitespace-nowrap')
  }
  return renderText('min-w-0 truncate overflow-hidden text-xs whitespace-nowrap', crumb.metadata.name)
}
function SiteURLButton({siteUrl, onSiteUrlClick}: {siteUrl: string; onSiteUrlClick?: (url: string) => void}) {
  return (
    <SizableText
      size="sm"
      className="no-underline underline-offset-4 hover:underline"
      onClick={() => onSiteUrlClick?.(siteUrl)}
    >
      {siteUrl}
    </SizableText>
  )
}
