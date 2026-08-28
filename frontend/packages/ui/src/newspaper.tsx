import * as stylex from '@stylexjs/stylex'
import type {HMBlockImage} from '@seed-hypermedia/client/hm-types'
import {
  HMAccountsMetadata,
  HMDocumentInfo,
  HMQueryBlockItemSummary,
  HMResourceFetchResult,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {
  findFirstBlock,
  hmId,
  plainTextOfContent,
  type DocumentRoute,
  useRouteLink,
  useUniversalAppContext,
} from '@shm/shared'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {useInteractionSummary} from '@shm/shared/models/interaction-summary'
import {
  canShowMoveDocumentAction,
  canShowRepublishDocumentAction,
  type DocumentCardActionOrigin,
} from '@shm/shared/utils/document-actions'
import {createWebHMUrl, getVersionHeads, hmIdToURL} from '@shm/shared/utils/entity-id-url'
import {useNavigate} from '@shm/shared/utils/navigation'
import {Bookmark, Copy, FilePen, FileText, Forward, History, Layers, MessageSquare, Pencil, Split} from 'lucide-react'
import {HTMLAttributes, ReactNode, useMemo} from 'react'
import {Button} from './button'
import {copyUrlToClipboardWithFeedback} from './copy-to-clipboard'
import {createCopyLinkMenuItem, getWebCopyLinkHostname} from './copy-link-menu'
import {createDocumentVersionsPanelRoute} from './document-versions-panel'
import {DraftBadge} from './draft-badge'
import {FacePile} from './face-pile'
import {useImageUrl} from './get-file-url'
import {useHighlighter} from './highlight-context'
import {Download, Trash} from './icons'
import {MergedBadge} from './merged-badge'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {PrivateBadge} from './private-badge'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {cn} from './utils'

/** Builds the DocumentCard inline menu items */
const styles_9 = stylex.create({
  s95afba94: {
    ':hover': {
      backgroundColor: 'var(--accent)',
    },
  },
  s59794290: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  s74bfe3fb: {
    ':is(.dark *)': {
      backgroundColor: '#000',
    },
  },
})
const styles_8 = stylex.create({
  sf9dd9441: {
    containerType: 'inline-size',
  },
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s8c909dba: {
    transitionDuration: '300ms',
  },
  sf7998a14: {
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  s966497bf: {
    minHeight: '240px',
  },
  sc29d56a7: {
    minHeight: '280px',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  s426adf6a: {
    lineHeight: '1.25',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  s597c48d: {
    display: 'block',
  },
  sc41b2606: {
    fontSize: '1.5rem',
    lineHeight: 'var(--text-2xl--line-height)',
  },
  s3cc0cac7: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitboxOrient: 'vertical',
    WebkitlineClamp: '2',
  },
  sab7cc61b: {
    fontSize: '1.125rem',
    lineHeight: 'var(--text-lg--line-height)',
  },
})
const styles_7 = stylex.create({
  s2db0a4cc: {
    width: 'calc(0.25rem * 14)',
    height: 'calc(0.25rem * 14)',
  },
})
const styles_6 = stylex.create({
  sf92c36b0: {
    margin: 'calc(0.25rem * 3)',
  },
  s77be7ef7: {
    height: 'auto',
  },
  s5f86341b: {
    width: '50%',
  },
  s2c5f2b38: {
    width: 'calc(0.25rem * 32)',
  },
  sbdde5449: {
    flexDirection: 'row',
  },
  sb22307c5: {
    alignItems: 'center',
  },
  sfa6c1995: {
    alignItems: 'stretch',
  },
})
const styles_5 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s19ed3: {
    margin: 'calc(0.25rem * 3)',
  },
  s2ff5c7: {
    height: 'calc(0.25rem * 24)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sd91e9c32: {
    aspectRatio: '1 / 1',
  },
  s7d7f436d: {
    width: 'calc(0.25rem * 12)',
    height: 'calc(0.25rem * 12)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s13bc8d40: {
    backgroundColor: 'oklch(95% 0.052 163.051)',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  sb42feb5d: {
    flex: '1',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
})
const styles_4 = stylex.create({
  sfde10673: {
    width: 'calc(var(--spacing) * 6)',
    height: 'calc(var(--spacing) * 6)',
    color: 'var(--tone-emerald-700-2)',
  },
  sf7a6dc56: {
    maxWidth: '100%',
    cursor: 'pointer',
    textDecorationLine: 'none',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
const styles_3 = stylex.create({
  sc7847ec6: {
    cursor: 'pointer',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
const styles_2 = stylex.create({
  se0accc2: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s66f9345d: {
    position: 'absolute',
    top: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  s5d7ceece: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  sf73e7bf5: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: 'calc(0.25rem * 2)',
    paddingRight: 'calc(0.25rem * 2)',
    paddingLeft: 'calc(0.25rem * 3)',
  },
  sac428cea: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
  },
  se4b59c31: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 2)',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '2',
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
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
})
export function useDocumentCardMenuItems(
  docId: UnpackedHypermediaId,
  doc?: HMResourceFetchResult['document'] | null,
  relocationOrigin?: DocumentCardActionOrigin,
): MenuItemType[] {
  const actions = useDocumentActions()
  const draft = actions.getDraft?.(docId)
  const navigate = useNavigate()
  const {onCopyReference, onPushReference, origin, experiments} = useUniversalAppContext()
  const draftId = actions.getDraftId?.(docId) ?? draft?.id
  const isOwner = actions.selectedAccountUid === docId.uid
  const hasPath = !!docId.path?.length
  const selectedAccountCanWriteSource = isOwner || !!actions.canWriteDocument?.(docId)
  return useMemo(() => {
    const items: MenuItemType[] = []
    if (actions.onEditDocument && isOwner) {
      items.push({
        key: 'edit',
        label: draftId ? 'Resume Editing' : 'Edit',
        icon: <Pencil className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onEditDocument!(docId, draftId)
        },
      })
    }
    items.push({
      key: 'versions',
      label: 'Versions history',
      icon: <History className={stylex.props(styles.sca3de968).className || ''} />,
      onClick: (e) => {
        e?.stopPropagation()
        navigate({
          key: 'document',
          id: docId,
          panel: createDocumentVersionsPanelRoute(docId),
        } as any)
      },
    })
    if (isOwner) {
      items.push({
        key: 'options',
        label: 'Document Settings',
        icon: <FilePen className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          navigate({
            key: 'document',
            id: docId,
            panel: {
              key: 'options',
            },
          } as any)
        },
      })
    }
    if (actions.onCopyLink) {
      const copyCanonical = onCopyReference ? () => onCopyReference(docId) : null
      const copyGateway = async () => {
        const gwUrl = getWebCopyLinkHostname(origin)
        const url = createWebHMUrl(docId.uid, {
          path: docId.path,
          version: docId.version,
          latest: docId.latest,
          blockRef: docId.blockRef,
          blockRange: docId.blockRange,
          hostname: gwUrl,
        })
        await copyUrlToClipboardWithFeedback(url, 'Gateway')
        onPushReference?.(docId)
      }
      items.push(
        createCopyLinkMenuItem({
          advanced: experiments?.advancedCopyLinkOptions,
          label: 'Copy link',
          canonical: {
            copy: copyCanonical,
          },
          gateway: {
            copy: copyGateway,
          },
          hypermedia: {
            copy: () => copyUrlToClipboardWithFeedback(hmIdToURL(docId), 'Hypermedia'),
          },
        }),
      )
    }
    if (
      actions.onMoveDocument &&
      canShowMoveDocumentAction({
        id: docId,
        selectedAccountUid: actions.selectedAccountUid,
        canWriteSource: selectedAccountCanWriteSource,
      })
    ) {
      items.push({
        key: 'move',
        label: 'Move',
        icon: <Forward className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onMoveDocument!(docId, relocationOrigin)
        },
      })
    }
    if (actions.onDuplicateDocument && isOwner && !!docId.path?.length) {
      items.push({
        key: 'duplicate',
        label: 'Duplicate document',
        icon: <Copy className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onDuplicateDocument!(docId)
        },
      })
    }
    if (
      actions.onRepublishDocument &&
      canShowRepublishDocumentAction({
        id: docId,
        selectedAccountUid: actions.selectedAccountUid,
      })
    ) {
      items.push({
        key: 'republish',
        label: 'Republish',
        icon: <Split className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onRepublishDocument!(docId, relocationOrigin)
        },
      })
    }
    if (actions.onExportDocument && doc) {
      items.push({
        key: 'export',
        label: 'Export document',
        icon: <Download className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onExportDocument!(doc)
        },
      })
    }
    items.push({
      key: 'directory',
      label: 'Sub documents',
      icon: <Layers className={stylex.props(styles.sca3de968).className || ''} />,
      onClick: (e) => {
        e?.stopPropagation()
        navigate({
          key: 'directory',
          id: docId,
        } as any)
      },
    })
    if (actions.onDeleteDocument && isOwner && hasPath) {
      items.push({
        key: 'delete',
        label: 'Delete document',
        icon: <Trash className={stylex.props(styles.sca3de968).className || ''} />,
        variant: 'destructive' as const,
        onClick: (e) => {
          e?.stopPropagation()
          actions.onDeleteDocument!(docId)
        },
      })
    }
    return items
  }, [
    actions,
    docId,
    selectedAccountCanWriteSource,
    hasPath,
    doc,
    isOwner,
    navigate,
    onCopyReference,
    onPushReference,
    origin,
    experiments?.advancedCopyLinkOptions,
    draftId,
    relocationOrigin,
  ])
}

/**
 * Shared container className for card-style document representations
 * (published {@link DocumentCard} and unpublished draft placeholders alike).
 */
export function documentCardContainerClassName({
  banner = false,
  hasCover = false,
}: {
  banner?: boolean
  hasCover?: boolean
} = {}) {
  return cn(
    stylex.props(
      styles_8.sf9dd9441,
      styles_8.s2ffff9,
      styles_8.scdbaf625,
      styles_8.s92852dd5,
      styles_8.sf799889b,
      styles_8.sad8c742c,
      styles_8.s1a01a0ed,
      styles_8.s605ce4a1,
      styles_8.s8a6c2964,
      styles_8.sf7fb00e8,
      styles_8.s8c909dba,
    ).className || '',
    stylex.props(styles_9.s95afba94, styles_9.s59794290, styles_9.s74bfe3fb).className || '',
    'group/item',
    banner && hasCover ? stylex.props(styles_8.sf7998a14, styles_8.s966497bf, styles_8.sc29d56a7).className || '' : '',
    banner && !hasCover ? stylex.props(styles_8.sf7998a14).className || '' : '',
  )
}

/** Left-hand thumbnail for a document card: wide cover, square icon, or the green doc placeholder. */
export function DocumentCardThumbnail({
  coverImage,
  iconImage,
  banner = false,
}: {
  coverImage?: string
  iconImage?: string
  banner?: boolean
}) {
  const imageUrl = useImageUrl()
  if (coverImage) {
    // Cover image. Banner cards keep a half width cover.
    // Regular row cards get a rectangle that stretches
    // vertically to fill the card's row height.
    return (
      <div
        className={cn(
          stylex.props(
            styles_5.sdef3facc,
            styles_5.s19ed3,
            styles_5.s2ff5c7,
            styles_5.sf032ed6c,
            styles_5.s92852dd5,
            styles_5.sf79988b7,
          ).className || '',
          stylex.props(styles_6.sf92c36b0, styles_6.s77be7ef7).className || '',
          banner ? stylex.props(styles_6.s5f86341b).className || '' : stylex.props(styles_6.s2c5f2b38).className || '',
        )}
      >
        <img className={stylex.props(styles.s66f9345d).className || ''} src={imageUrl(coverImage, 'L')} alt="" />
      </div>
    )
  }
  if (iconImage) {
    // No cover, but the doc has an icon — render it as a square
    // thumbnail aligned top-left next to the title.
    return (
      <div
        className={
          (stylex.props(
            styles_5.s5fd609e3,
            styles_5.s19ed3,
            styles_5.s2ffff9,
            styles_5.sd91e9c32,
            styles_5.s7d7f436d,
            styles_5.sf032ed6c,
            styles_5.sc6ed1702,
            styles_5.sce22ca32,
            styles_5.s92852dd5,
            styles_5.sf79988b7,
          ).className || '') +
          ' ' +
          (stylex.props(styles_7.s2db0a4cc).className || '')
        }
      >
        <img src={imageUrl(iconImage, 'S')} alt="" className={stylex.props(styles.s5d7ceece).className || ''} />
      </div>
    )
  }
  // Neither cover nor icon — green doc-icon placeholder.
  return (
    <div
      className={
        (stylex.props(
          styles_5.s19ed3,
          styles_5.s2ffff9,
          styles_5.sd91e9c32,
          styles_5.s7d7f436d,
          styles_5.sf032ed6c,
          styles_5.sc6ed1702,
          styles_5.sce22ca32,
          styles_5.sf79988b7,
          styles_5.s13bc8d40,
        ).className || '') +
        ' ' +
        (stylex.props(styles_7.s2db0a4cc).className || '')
      }
    >
      <FileText className={stylex.props(styles_4.sfde10673).className || ''} strokeWidth={1.5} />
    </div>
  )
}

/**
 * Presentational body of a document card: thumbnail, title, summary, badges, and an
 * actions row. Kept separate from {@link DocumentCard} so unpublished draft placeholders
 * can render with pixel-identical structure — only their slot contents differ.
 */
export function DocumentCardShell({
  interactive = false,
  hasCover = false,
  thumbnail,
  title,
  summary,
  badges,
  actions,
}: {
  interactive?: boolean
  hasCover?: boolean
  thumbnail: ReactNode
  title: ReactNode
  summary?: ReactNode
  badges?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div
      className={cn(
        stylex.props(styles_5.s2ffff9, styles_5.s3f58665f, styles_5.sfcf3a2ae, styles_5.sb42feb5d, styles_5.s67e351ac)
          .className || '',
        stylex.props(styles_6.sbdde5449).className || '',
        stylex.props(interactive && styles_3.sc7847ec6).className || '',
        stylex.props(styles_6.sb22307c5).className || '',
        hasCover ? stylex.props(styles_6.sfa6c1995).className || '' : '',
      )}
    >
      {thumbnail}
      <div className={stylex.props(styles_2.se0accc2).className || ''}>
        <div className={stylex.props(styles.s1aa16).className || ''}>
          {title}
          {summary}
        </div>
        <div className={stylex.props(styles.sf73e7bf5).className || ''}>
          <div className={stylex.props(styles.sac428cea).className || ''}>{badges}</div>
          {actions}
        </div>
      </div>
    </div>
  )
}
export function DocumentCard({
  docId,
  route,
  entity,
  metadata,
  firstImageInContent,
  visibility,
  version,
  interactionSummary: interactionSummaryProp,
  accountsMetadata,
  contributorUids,
  navigate: navigateProp = true,
  titleLinkOnly = false,
  onMouseEnter,
  onMouseLeave,
  banner = false,
  showSummary = false,
  hideInlineActions = false,
  relocationOrigin,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  docId: UnpackedHypermediaId
  /** Optional document route for callers that need to preserve an active panel. */
  route?: DocumentRoute
  entity: HMResourceFetchResult | null | undefined
  metadata?: HMDocumentInfo['metadata']
  /** Indexer-derived fallback cover (see HMDocumentInfo.firstImageInContent). */
  firstImageInContent?: HMDocumentInfo['firstImageInContent']
  visibility?: HMDocumentInfo['visibility']
  version?: string
  interactionSummary?: HMQueryBlockItemSummary | null
  accountsMetadata?: HMAccountsMetadata
  contributorUids?: string[]
  navigate?: boolean
  titleLinkOnly?: boolean
  onMouseEnter?: (id: UnpackedHypermediaId) => void
  onMouseLeave?: (id: UnpackedHypermediaId) => void
  banner?: boolean
  showSummary?: boolean
  /** Hide the inline bookmark / comments / options-dropdown row */
  hideInlineActions?: boolean
  relocationOrigin?: DocumentCardActionOrigin
}) {
  const highlighter = useHighlighter()
  const linkProps = useRouteLink(
    route ??
      (docId
        ? {
            key: 'document',
            id: docId,
          }
        : null),
  )
  const {onClick: routeOnClick, tag: _routeTag, ...linkAttributes} = linkProps
  const navigate = useNavigate()
  const actions = useDocumentActions()
  const draft = actions.getDraft?.(docId)
  const summaryId = useMemo(
    () =>
      docId
        ? hmId(docId.uid, {
            path: docId.path,
          })
        : null,
    [docId?.uid, docId?.path],
  )
  const interactionSummary = useInteractionSummary(summaryId, {
    enabled: !interactionSummaryProp,
  })
  const commentCount = interactionSummaryProp?.comments ?? interactionSummary.data?.comments ?? 0
  const baseMetadata = metadata ?? entity?.document?.metadata
  const resolvedMetadata = draft?.metadata
    ? {
        ...baseMetadata,
        ...draft.metadata,
      }
    : baseMetadata
  const textContent = useMemo(() => {
    if (!showSummary) return null
    if (resolvedMetadata?.summary) {
      return resolvedMetadata.summary
    }
    return plainTextOfContent(entity?.document?.content)
  }, [showSummary, resolvedMetadata, entity?.document?.content])
  const explicitCover = resolvedMetadata?.cover
  const explicitIcon = resolvedMetadata?.icon
  // The indexer precomputes the first content image, delivered as a typed
  // sibling of the card's fast metadata (listing callers). Entity-bearing
  // callers already hold the document, so they derive it from content in
  // hand. Either way a card NEVER fetches a document just for a fallback
  // cover — a doc the indexer hasn't derived yet simply renders coverless
  // until the backfill reindex catches up. An icon suppresses the fallback
  // cover entirely, even if a derived value lingers from before the icon
  // was set.
  const indexedFirstImage = explicitIcon ? undefined : firstImageInContent
  const inHandContent = entity?.document?.content
  const firstContentImage = useMemo(() => {
    if (explicitCover || explicitIcon || indexedFirstImage) return undefined
    if (!inHandContent?.length) return undefined
    const block = findFirstBlock<HMBlockImage>(
      inHandContent,
      (b): b is HMBlockImage => b.type === 'Image' && !!(b as any).link,
    )
    return block?.link || undefined
  }, [explicitCover, explicitIcon, indexedFirstImage, inHandContent])
  const coverImage = explicitCover || indexedFirstImage || firstContentImage
  const iconImage = explicitIcon
  const resolvedVisibility = visibility ?? entity?.document?.visibility
  const isPrivate = resolvedVisibility === 'PRIVATE'
  const doc = entity?.document
  const headCount = getVersionHeads(version ?? doc?.version).length

  // Context-driven state for the inline row (badges, bookmark button).
  const draftId = actions.getDraftId?.(docId) ?? draft?.id
  const bookmarked = actions.isBookmarked?.(docId) ?? false
  const menuItems = useDocumentCardMenuItems(docId, doc, relocationOrigin)
  const sharedProps = {
    ...highlighter(docId),
    className: documentCardContainerClassName({
      banner,
      hasCover: !!coverImage,
    }),
  }
  const titleClassName = cn(
    stylex.props(styles_8.sc05281e3, styles_8.sa1762f51, styles_8.s426adf6a, styles_8.sa16ea943).className || '',
    banner
      ? stylex.props(styles_8.s597c48d, styles_8.sc41b2606).className || ''
      : stylex.props(styles_8.s3cc0cac7, styles_8.sab7cc61b).className || '',
  )
  const title = resolvedMetadata?.name
  const content = (
    <DocumentCardShell
      interactive={navigateProp}
      hasCover={!!coverImage}
      thumbnail={<DocumentCardThumbnail coverImage={coverImage} iconImage={iconImage} banner={banner} />}
      title={
        titleLinkOnly && linkAttributes.href ? (
          <a
            {...linkAttributes}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.stopPropagation()
              routeOnClick?.(e)
            }}
            className={cn(titleClassName, stylex.props(styles_4.sf7a6dc56).className || '')}
          >
            {title}
          </a>
        ) : (
          <p className={titleClassName}>{title}</p>
        )
      }
      summary={
        textContent ? (
          <p
            className={cn(
              stylex.props(styles.se4b59c31).className || '',
              stylex.props(!banner && styles_3.sab7cc6fa).className || '',
            )}
          >
            {textContent}
          </p>
        ) : null
      }
      badges={
        <>
          {contributorUids && contributorUids.length > 0 && accountsMetadata && (
            <FacePile accounts={contributorUids} accountsMetadata={accountsMetadata} />
          )}
          {!!draftId && <DraftBadge />}
          {!draftId && isPrivate && <PrivateBadge size="sm" />}
          {!draftId && headCount > 1 && <MergedBadge count={headCount} size="sm" />}
        </>
      }
      actions={
        !hideInlineActions ? (
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
                    actions.onBookmarkToggle!(docId)
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
                  className={stylex.props(styles_5.s2ffff9, styles_5.sc6ed1702, styles_5.s5d936fa).className || ''}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate({
                      key: 'comments',
                      id: docId,
                    })
                  }}
                >
                  <MessageSquare className={stylex.props(styles.sca3de967).className || ''} />
                  <SizableText size="xs" className={stylex.props(styles.sa1762f51).className || ''}>
                    {commentCount}
                  </SizableText>
                </Button>
              </Tooltip>
            )}
            {menuItems.length > 0 && (
              <OptionsDropdown menuItems={menuItems} align="end" side="top" hiddenUntilItemHover />
            )}
          </div>
        ) : null
      }
    />
  )
  if (navigateProp && linkProps) {
    return (
      <a {...sharedProps} {...linkAttributes} onClick={routeOnClick} {...(props as any)}>
        {content}
      </a>
    )
  }
  return (
    <div {...sharedProps} {...props}>
      {content}
    </div>
  )
}
