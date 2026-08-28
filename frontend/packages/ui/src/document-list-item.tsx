import * as stylex from '@stylexjs/stylex'
import {
  HMAccountsMetadata,
  HMActivitySummary,
  HMBreadcrumb,
  HMComment,
  HMDocumentInfo,
  HMLibraryDocument,
  HMQueryBlockItemSummary,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {
  formattedDate,
  getMetadataName,
  hmId,
  InteractionSummaryPayload,
  useRouteLink,
  useUniversalAppContext,
} from '@shm/shared'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {useInteractionSummary} from '@shm/shared/models/interaction-summary'
import {canShowMoveDocumentAction, canShowRepublishDocumentAction} from '@shm/shared/utils/document-actions'
import {createWebHMUrl, getVersionHeads, hmIdToURL} from '@shm/shared/utils/entity-id-url'
import {useNavigate} from '@shm/shared/utils/navigation'
import {Bookmark, ChevronRight, Copy, Forward, GitFork, MessageSquare, Pencil} from 'lucide-react'
import {Fragment, useMemo} from 'react'
import {LibraryEntryUpdateSummary} from './activity'
import {Button} from './button'
import {copyUrlToClipboardWithFeedback} from './copy-to-clipboard'
import {createCopyLinkMenuItem, getWebCopyLinkHostname} from './copy-link-menu'
import {FacePile} from './face-pile'
import {DraftBadge} from './draft-badge'
import {useHighlighter} from './highlight-context'
import {HMIcon} from './hm-icon'
import {Download, Trash} from './icons'
import {MergedBadge} from './merged-badge'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {PrivateBadge} from './private-badge'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {cn} from './utils'
const styles_5 = stylex.create({
  s74bfe3fb: {
    ':is(.dark *)': {
      backgroundColor: '#000',
    },
  },
})
const styles_4 = stylex.create({
  sb41ffff4: {
    height: 'auto',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s626516e5: {
    justifyContent: 'flex-start',
  },
  s29df1839: {
    borderStyle: 'none',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  s9ab038a6: {
    ':hover': {
      '@media (hover: hover)': {
        boxShadow: 'var(--shadow-md)',
      },
    },
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s9c668547: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 70%, transparent)',
      },
    },
  },
  s2ad4931: {
    marginLeft: 'calc(0.25rem * -2)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sca3de96b: {
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
})
const styles_3 = stylex.create({
  s86afa306: {
    paddingInline: 'calc(var(--spacing) * 0)',
    fontSize: '10px',
  },
  sc72d0d51: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
  },
})
const styles_2 = stylex.create({
  s6eb95469: {
    pointerEvents: 'none',
    visibility: 'hidden',
  },
  sb58610c9: {
    rotate: '90deg',
  },
})
const styles = stylex.create({
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sca14bda0: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    flexShrink: '0',
  },
  sc2ca51c7: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  s8d50829d: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sd734d49a: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sf2746014: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    overflow: 'hidden',
  },
  s62d3095e: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s55ac44a1: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    fill: 'currentcolor',
  },
  s33458b: {
    marginTop: 'calc(0.25rem * 1)',
  },
  se658ac13: {
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
  },
  s21188150: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s76b0b3a9: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
})
export type DocumentListItemData =
  | HMDocumentInfo
  | (HMLibraryDocument & {
      breadcrumbs?: HMBreadcrumb[]
    })
interface DocumentListItemProps {
  item: DocumentListItemData
  accountsMetadata?: HMAccountsMetadata
  breadcrumbs?: HMBreadcrumb[]
  activitySummary?: HMActivitySummary | null
  latestComment?: HMComment | null
  interactionSummary?: HMQueryBlockItemSummary | InteractionSummaryPayload | null
  /** Pre-computed contributor UIDs (document authors + comment/mention authors). */
  contributorUids?: string[]
  draftId?: string
  isRead?: boolean
  indent?: boolean
  onClick?: (id: UnpackedHypermediaId) => void
  className?: string
  expandable?: {
    expanded: boolean
    onToggle: () => void
    isLoading?: boolean
  }
}
export function DocumentListItem({
  item,
  className,
  accountsMetadata,
  breadcrumbs,
  activitySummary,
  latestComment,
  contributorUids,
  interactionSummary,
  draftId: draftIdProp,
  isRead,
  indent = false,
  onClick,
  expandable,
}: DocumentListItemProps) {
  const id = item.id
  const actions = useDocumentActions()
  const draft = actions.getDraft?.(id)
  const draftId = draftIdProp ?? draft?.id
  const metadata = draft?.metadata
    ? {
        ...item.metadata,
        ...draft.metadata,
      }
    : item.metadata
  const visibility = 'visibility' in item ? item.visibility : undefined
  const isPrivate = visibility === 'PRIVATE'
  const headCount = getVersionHeads('version' in item ? item.version : undefined).length
  const itemActivitySummary =
    activitySummary !== undefined ? activitySummary : 'activitySummary' in item ? item.activitySummary : null
  const itemLatestComment =
    latestComment !== undefined ? latestComment : 'latestComment' in item ? item.latestComment : null
  const itemBreadcrumbs = breadcrumbs !== undefined ? breadcrumbs : 'breadcrumbs' in item ? item.breadcrumbs : null
  const computedIsRead = isRead !== undefined ? isRead : !itemActivitySummary?.isUnread
  const route = draftIdProp
    ? {
        key: 'draft' as const,
        id: draftIdProp,
      }
    : {
        key: 'document' as const,
        id,
      }
  const linkProps = useRouteLink(route)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Stop propagation to prevent parent handlers (like EmbedWrapper) from firing.
    e.stopPropagation()
    if (onClick) {
      onClick(id)
    } else if (linkProps?.onClick) {
      linkProps.onClick(e)
    }
  }
  const highlighter = useHighlighter()
  const {onCopyReference, onPushReference, origin, experiments} = useUniversalAppContext()
  const navigate = useNavigate()
  const summaryId = useMemo(
    () =>
      hmId(id.uid, {
        path: id.path,
      }),
    [id.uid, id.path],
  )
  const interactionSummaryData = useInteractionSummary(summaryId, {
    enabled: !interactionSummary,
  })
  const commentCount = interactionSummary?.comments ?? interactionSummaryData.data?.comments ?? 0
  const childCount =
    (interactionSummary && 'children' in interactionSummary ? interactionSummary.children : undefined) ??
    interactionSummaryData.data?.children ??
    0
  const canExpand = !!expandable && (childCount > 0 || expandable.expanded || expandable.isLoading)
  const bookmarked = actions.isBookmarked?.(id) ?? false
  const isOwner = actions.selectedAccountUid === id.uid
  const hasPath = !!id.path?.length
  const selectedAccountCanWriteSource = isOwner || !!actions.canWriteDocument?.(id)
  const doc = 'document' in item ? (item as any).document : undefined
  const menuItems = useMemo(() => {
    const items: MenuItemType[] = []
    if (actions.onEditDocument && isOwner) {
      items.push({
        key: 'edit',
        label: draftId ? 'Resume Editing' : 'Edit',
        icon: <Pencil className={stylex.props(styles.s3269316e).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onEditDocument!(id, draftId)
        },
      })
    }
    if (actions.onDuplicateDocument && isOwner && hasPath) {
      items.push({
        key: 'duplicate',
        label: 'Duplicate Document',
        icon: <Copy className={stylex.props(styles.s3269316e).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onDuplicateDocument!(id)
        },
      })
    }
    if (actions.onCopyLink) {
      const copyCanonical = onCopyReference ? () => onCopyReference(id) : null
      const copyGateway = async () => {
        const gwUrl = getWebCopyLinkHostname(origin)
        const url = createWebHMUrl(id.uid, {
          path: id.path,
          version: id.version,
          latest: id.latest,
          blockRef: id.blockRef,
          blockRange: id.blockRange,
          hostname: gwUrl,
        })
        await copyUrlToClipboardWithFeedback(url, 'Gateway')
        onPushReference?.(id)
      }
      items.push(
        createCopyLinkMenuItem({
          advanced: experiments?.advancedCopyLinkOptions,
          iconSize: 'sm',
          canonical: {
            copy: copyCanonical,
          },
          gateway: {
            copy: copyGateway,
          },
          hypermedia: {
            copy: () => copyUrlToClipboardWithFeedback(hmIdToURL(id), 'Hypermedia'),
          },
        }),
      )
    }
    if (
      actions.onMoveDocument &&
      canShowMoveDocumentAction({
        id,
        selectedAccountUid: actions.selectedAccountUid,
        canWriteSource: selectedAccountCanWriteSource,
      })
    ) {
      items.push({
        key: 'move',
        label: 'Move Document',
        icon: <Forward className={stylex.props(styles.s3269316e).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onMoveDocument!(id)
        },
      })
    }
    if (
      actions.onRepublishDocument &&
      canShowRepublishDocumentAction({
        id,
        selectedAccountUid: actions.selectedAccountUid,
      })
    ) {
      items.push({
        key: 'republish',
        label: 'Republish',
        icon: <GitFork className={stylex.props(styles.s3269316e).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onRepublishDocument!(id)
        },
      })
    }
    if (actions.onExportDocument && doc) {
      items.push({
        key: 'export',
        label: 'Export',
        icon: <Download className={stylex.props(styles.s3269316e).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onExportDocument!(doc)
        },
      })
    }
    if (actions.onDeleteDocument && isOwner && hasPath) {
      items.push({
        key: 'delete',
        label: 'Delete Document',
        icon: <Trash className={stylex.props(styles.s3269316e).className || ''} />,
        variant: 'destructive' as const,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onDeleteDocument!(id)
        },
      })
    }
    return items
  }, [
    actions.onEditDocument,
    actions.onDuplicateDocument,
    actions.onCopyLink,
    actions.onMoveDocument,
    actions.onRepublishDocument,
    actions.onExportDocument,
    actions.onDeleteDocument,
    id,
    doc,
    draftId,
    isOwner,
    selectedAccountCanWriteSource,
    hasPath,
    onCopyReference,
    onPushReference,
    origin,
    experiments?.advancedCopyLinkOptions,
  ])
  const hasActions = !!actions.onBookmarkToggle || commentCount > 0 || menuItems.length > 0
  return (
    <Button
      asChild
      variant="ghost"
      {...highlighter(id)}
      className={cn(
        stylex.props(
          styles_4.sb41ffff4,
          styles_4.scdbaf625,
          styles_4.sc6ed1702,
          styles_4.s626516e5,
          styles_4.s29df1839,
          styles_4.s60f53bca,
          styles_4.s605ce4a1,
          styles_4.s34b1af,
          styles_4.s34b56e,
          styles_4.s8a6c2a27,
          styles_4.s9ab038a6,
        ).className || '',
        stylex.props(styles_5.s74bfe3fb).className || '',
        'group/item',
        className,
      )}
    >
      <a data-resourceid={id.id} {...linkProps} onClick={handleClick}>
        {indent && <div className={stylex.props(styles.sca14bda0).className || ''} />}
        {expandable && (
          <button
            type="button"
            aria-label={expandable.expanded ? 'Collapse children' : 'Expand children'}
            aria-expanded={expandable.expanded}
            disabled={!canExpand}
            className={cn(
              stylex.props(
                styles_4.sf2718385,
                styles_4.s9c668547,
                styles_4.s2ad4931,
                styles_4.s2ffff9,
                styles_4.sca3de96b,
                styles_4.sf032ed6c,
                styles_4.sc6ed1702,
                styles_4.sce22ca32,
                styles_4.sf79988b7,
                styles_4.sf7fb00e8,
              ).className || '',
              'no-window-drag',
              stylex.props(!canExpand && styles_2.s6eb95469).className || '',
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              expandable.onToggle()
            }}
          >
            <ChevronRight
              className={cn(
                stylex.props(styles.sc2ca51c7).className || '',
                stylex.props(expandable.expanded && styles_2.sb58610c9).className || '',
              )}
            />
          </button>
        )}
        <HMIcon size={28} id={id} name={metadata?.name} icon={metadata?.icon} />
        <div className={stylex.props(styles.s8d50829d).className || ''}>
          {itemBreadcrumbs && itemBreadcrumbs.length > 1 && (
            <DocumentListItemBreadcrumbs breadcrumbs={itemBreadcrumbs} />
          )}
          <div className={stylex.props(styles.sd734d49a).className || ''}>
            <div className={stylex.props(styles.sf2746014).className || ''}>
              <SizableText
                className={cn(stylex.props(styles.s62d3095e).className || '')}
                weight={computedIsRead ? undefined : 'bold'}
              >
                {getMetadataName(metadata)}
              </SizableText>
              {!!draftId && <DraftBadge />}
              {isPrivate && <PrivateBadge size="sm" />}
              {headCount > 1 && <MergedBadge count={headCount} size="sm" />}
            </div>
            {commentCount > 0 && !hasActions && <DocumentListItemCommentCount count={commentCount} />}
            {!itemActivitySummary && 'updateTime' in item && (
              <SizableText size="xs" color="muted" className={stylex.props(styles.sa1762f51).className || ''}>
                {formattedDate(item.updateTime)}
              </SizableText>
            )}
            {hasActions && (
              <div className={stylex.props(styles.s86ff3e3).className || ''}>
                {actions.onBookmarkToggle && (
                  <Tooltip content={bookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="no-window-drag"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        actions.onBookmarkToggle!(id)
                      }}
                    >
                      {bookmarked ? (
                        <Bookmark className={stylex.props(styles.s55ac44a1).className || ''} />
                      ) : (
                        <Bookmark className={stylex.props(styles.s3269316e).className || ''} />
                      )}
                    </Button>
                  </Tooltip>
                )}
                {commentCount > 0 && (
                  <Tooltip content="View discussions">
                    <Button
                      size="icon"
                      variant="ghost"
                      className={stylex.props(styles_4.s2ffff9, styles_4.sc6ed1702, styles_4.s5d936fa).className || ''}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate({
                          key: 'comments',
                          id,
                        })
                      }}
                    >
                      <MessageSquare className={stylex.props(styles.s3269316e).className || ''} />
                      <SizableText size="xs" className={stylex.props(styles.sa1762f51).className || ''}>
                        {commentCount}
                      </SizableText>
                    </Button>
                  </Tooltip>
                )}
                {menuItems.length > 0 && <OptionsDropdown menuItems={menuItems} align="end" side="bottom" />}
              </div>
            )}
          </div>
          {itemActivitySummary && (
            <LibraryEntryUpdateSummary
              accountsMetadata={accountsMetadata}
              latestComment={itemLatestComment}
              activitySummary={itemActivitySummary}
            />
          )}
          {contributorUids && contributorUids.length > 0 && accountsMetadata && (
            <div className={stylex.props(styles.s33458b).className || ''}>
              <FacePile accounts={contributorUids} accountsMetadata={accountsMetadata} />
            </div>
          )}
        </div>
      </a>
    </Button>
  )
}
function DocumentListItemBreadcrumbs({breadcrumbs}: {breadcrumbs: HMBreadcrumb[]}) {
  const displayCrumbs = breadcrumbs.slice(1).filter((crumb) => !!crumb.name)
  if (!displayCrumbs.length) return null
  return (
    <div className={stylex.props(styles.se658ac13).className || ''}>
      {displayCrumbs.map((breadcrumb, idx) => (
        <Fragment key={breadcrumb.path}>
          <Button
            variant="link"
            className={stylex.props(styles_3.s86afa306).className || ''}
            size="xs"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {breadcrumb.name}
          </Button>
          {idx === displayCrumbs.length - 1 ? null : (
            <SizableText className={stylex.props(styles.s21188150).className || ''}>/</SizableText>
          )}
        </Fragment>
      ))}
    </div>
  )
}
function DocumentListItemCommentCount({count}: {count: number}) {
  if (!count) return null
  return (
    <div className={stylex.props(styles.s86ff3e3).className || ''}>
      <MessageSquare className={stylex.props(styles.s76b0b3a9).className || ''} />
      <SizableText className={stylex.props(styles_3.sc72d0d51).className || ''}>{count}</SizableText>
    </div>
  )
}
