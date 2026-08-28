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
const styles_5 = stylex.create({
  s913139c0: {
    textDecorationLine: 'none',
  },
  saa53335b: {
    textUnderlineOffset: '4px',
  },
  sd30dd60e: {
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  crumbBase: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  crumbMuted: {
    color: 'var(--muted-foreground)',
  },
  crumbRed: {
    color: 'var(--color-red-500)',
  },
  crumbItalic: {
    fontStyle: 'italic',
  },
  crumbLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing)',
  },
})
const styles_4 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s2ffff9: {
    display: 'flex',
  },
  s6a2edbb: {
    width: 'fit-content',
  },
  s67010d77: {
    position: 'absolute',
  },
  s8a2493f4: {
    right: 'calc(0.25rem * -2)',
  },
  s5360d9ad: {
    top: 'calc(0.25rem * -2)',
  },
  s382471: {
    zIndex: '20',
  },
  sca3de96b: {
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s199f2714: {
    backgroundColor: 'color-mix(in oklab, #000 40%, transparent)',
  },
  s2daecf89: {
    color: '#fff',
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s291c6e14: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 60%, transparent)',
      },
    },
  },
  s83138179: {
    '@media ((min-width: 768px))': {
      pointerEvents: 'none',
    },
  },
  s3ef704cb: {
    '@media ((min-width: 768px))': {
      opacity: '0%',
    },
  },
  s5a2f5ab3: {
    '@media ((min-width: 768px))': {
      ':focus-visible': {
        pointerEvents: 'auto',
      },
    },
  },
  sd1b7258f: {
    '@media ((min-width: 768px))': {
      ':focus-visible': {
        opacity: '100%',
      },
    },
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sab7cc794: {
    fontSize: '1.25rem',
    lineHeight: 'var(--text-xl--line-height)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
})
const styles_3 = stylex.create({
  s3fa1ef71: {
    position: 'relative',
    width: '100%',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--surface)',
  },
  s34a2ad: {
    paddingTop: 'calc(var(--spacing) * 6)',
  },
  s77a614bf: {
    paddingTop: 'calc(var(--spacing) * 4)',
    '@media ((min-width: 768px))': {
      paddingTop: 'calc(var(--spacing) * 15)',
    },
  },
  sfc388ac: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 768px))': {
      gap: 'calc(var(--spacing) * 4)',
    },
  },
  sc638d8ca: {
    fontSize: 'var(--text-2xl)',
    lineHeight: 'var(--text-2xl--line-height)',
    '@media ((max-width: 767px))': {
      lineHeight: 'var(--leading-tight)',
    },
    '@media ((min-width: 768px))': {
      fontSize: 'var(--text-4xl)',
      lineHeight: 'var(--text-4xl--line-height)',
    },
    '@media ((min-width: 1024px))': {
      fontSize: 'var(--text-5xl)',
      lineHeight: 'var(--text-5xl--line-height)',
    },
  },
  s8a2ade4d: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingBottom: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 768px))': {
      paddingBottom: 'calc(var(--spacing) * 4)',
    },
  },
  s8caf5f69: {
    display: 'none',
    flex: '1',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    '@media ((min-width: 768px))': {
      display: 'flex',
    },
  },
  sd26d27e5: {
    display: 'flex',
    minWidth: 'calc(var(--spacing) * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    '@media ((min-width: 768px))': {
      display: 'none',
    },
  },
  s4b286732: {
    width: 'calc(var(--spacing) * 5)',
    height: 'calc(var(--spacing) * 5)',
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: 'var(--surface)',
    backgroundColor: 'var(--surface)',
  },
  sedda4c86: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    textDecorationLine: 'none',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
  se47715a9: {
    textDecorationLine: 'none',
    textUnderlineOffset: '4px',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
const styles_2 = stylex.create({
  sb0422e15: {
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
  s6eeb840f: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
  },
  sa4681c45: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s8fe3a8bd: {
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
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
      className={cn(
        stylex.props(styles_3.s3fa1ef71).className || '',
        stylex.props(hasCover ? styles_3.s34a2ad : styles_3.s77a614bf).className || '',
      )}
      style={{
        marginTop: hasCover ? -40 : 0,
      }}
    >
      <div className={stylex.props(styles_3.sfc388ac).className || ''}>
        {!isHomeDoc && docId && hasIcon ? (
          <div
            className={stylex.props(styles_4.sdef3facc, styles_4.s2ffff9, styles_4.s6a2edbb).className || ''}
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
                className={
                  stylex.props(
                    styles_4.s67010d77,
                    styles_4.s8a2493f4,
                    styles_4.s5360d9ad,
                    styles_4.s382471,
                    styles_4.sca3de96b,
                    styles_4.s775755af,
                    styles_4.s199f2714,
                    styles_4.s2daecf89,
                    styles_4.s486c2d2f,
                    styles_4.s8a6c2a27,
                    styles_4.s83442393,
                    styles_4.s291c6e14,
                    styles_4.s83138179,
                    styles_4.s3ef704cb,
                    styles_4.s5a2f5ab3,
                    styles_4.sd1b7258f,
                  ).className || ''
                }
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
                className={stylex.props(styles_3.sc638d8ca).className || ''}
                weight="bold"
                {...highlighter(docId)}
              >
                {isHomeDoc ? 'Home' : docMetadata?.name}
              </SizableText>
            )}
            {docMetadata?.summary ? (
              <span className={stylex.props(styles_4.sf2718385, styles_4.sab7cc794).className || ''}>
                {docMetadata?.summary}
              </span>
            ) : null}
          </>
        )}
        <div className={stylex.props(styles_3.s8a2ade4d).className || ''}>
          {siteUrl ? <SiteURLButton siteUrl={siteUrl} /> : null}
          <div className={stylex.props(styles.s2d015205).className || ''}>
            <div className={stylex.props(styles_3.s8caf5f69).className || ''}>
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
            <div className={stylex.props(styles_3.sd26d27e5).className || ''}>
              {displayAuthors.length ? (
                <>
                  <div
                    className={stylex.props(styles_4.s2ffff9, styles_4.sf032ed6c, styles_4.sc6ed1702).className || ''}
                  >
                    {displayAuthors.slice(0, 3).map((author) => (
                      <div key={author.id.id} className={stylex.props(styles_3.s4b286732).className || ''}>
                        <HMIcon id={author.id} name={author.metadata?.name} icon={author.metadata?.icon} size={20} />
                      </div>
                    ))}
                  </div>
                  <p className={stylex.props(styles_2.sb0422e15).className || ''}>
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
      className={
        (stylex.props(styles_5.s913139c0, styles_5.saa53335b, styles_5.sd30dd60e).className || '') +
        ' ' +
        (resolvedName ? '' : stylex.props(styles_5.sf2718385).className || '')
      }
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
    <nav aria-label="Breadcrumb" className={cn(stylex.props(styles_2.s6eeb840f).className || '', className)}>
      <ol className={stylex.props(styles_2.sa4681c45).className || ''}>
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
            <li
              key={key}
              className={[stylex.props(styles_2.sa4681c45).className || '', className].filter(Boolean).join(' ')}
            >
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
                  className={stylex.props(styles_2.s8fe3a8bd).className || ''}
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
    <a {...linkProps} className={stylex.props(styles_3.sedda4c86).className || ''}>
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
  const renderText = (label = displayName, ...extra: (keyof typeof styles_5)[]) =>
    isCurrent ? (
      <span
        aria-current="page"
        className={stylex.props(styles_5.crumbBase, ...extra.map((k) => styles_5[k])).className || ''}
      >
        {label}
      </span>
    ) : (
      <a
        {...linkProps}
        className={
          stylex.props(styles_5.s913139c0, styles_5.sd30dd60e, styles_5.crumbBase, ...extra.map((k) => styles_5[k]))
            .className || ''
        }
      >
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
    if (isCurrent) {
      return (
        <span
          aria-current="page"
          className={stylex.props(styles_5.crumbBase, styles_5.crumbMuted, styles_5.crumbLoading).className || ''}
        >
          {content}
        </span>
      )
    }
    return (
      <a
        {...linkProps}
        className={
          stylex.props(
            styles_5.s913139c0,
            styles_5.sd30dd60e,
            styles_5.crumbBase,
            styles_5.crumbMuted,
            styles_5.crumbLoading,
          ).className || ''
        }
      >
        {content}
      </a>
    )
  }
  if (crumb.isTombstone) {
    return <Tooltip content="This document has been deleted">{renderText(displayName, 'crumbRed')}</Tooltip>
  }
  if (crumb.isUnpublishedDraft) {
    return (
      <Tooltip content="This document is a draft and has not been published yet — its URL is private to you.">
        {renderText(displayName, 'crumbMuted', 'crumbItalic')}
      </Tooltip>
    )
  }
  if (crumb.isNotFound) {
    return <Tooltip content="Document not found on the network">{renderText(displayName, 'crumbRed')}</Tooltip>
  }
  if (crumb.isError) {
    return <Tooltip content="Failed to load this document">{renderText(displayName, 'crumbRed')}</Tooltip>
  }
  if (!crumb.metadata?.name) {
    return renderText(displayName, 'crumbMuted')
  }
  return renderText(crumb.metadata.name)
}
function SiteURLButton({siteUrl, onSiteUrlClick}: {siteUrl: string; onSiteUrlClick?: (url: string) => void}) {
  return (
    <SizableText
      size="sm"
      className={stylex.props(styles_3.se47715a9).className || ''}
      onClick={() => onSiteUrlClick?.(siteUrl)}
    >
      {siteUrl}
    </SizableText>
  )
}
