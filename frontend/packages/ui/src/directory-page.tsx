import * as stylex from '@stylexjs/stylex'
import {
  HMAccountsMetadata,
  HMDocumentInfo,
  HMListedDraft,
  HMMetadata,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {getMetadataName, useRouteLink} from '@shm/shared'
import {useCanSeePrivateDocs} from '@shm/shared/models/capabilities'
import {useAccountsMetadata, useDirectoryWithDrafts} from '@shm/shared/models/entity'
import {normalizeDate} from '@shm/shared/utils/date'
import {getRouteKey, useNavRoute} from '@shm/shared/utils/navigation'
import {Folder, Search} from 'lucide-react'
import {ChangeEvent, ReactNode, useMemo, useState} from 'react'
import {Button} from './button'
import {Input} from './components/input'
import {DocumentListItem} from './document-list-item'
import {DraftBadge} from './draft-badge'
import {getSiteNavDirectory} from './navigation'
import {PageLayout} from './page-layout'
import {Spinner} from './spinner'
import {SizableText} from './text'
import {useScrollRestoration} from './use-scroll-restoration'

/**
 * Full-page directory content component.
 * This is the first implementation of the panel-to-page pattern.
 * Can be used standalone (page) or wrapped in AccessoryLayout (panel).
 */
const styles_2 = stylex.create({
  s7152e96b: {
    color: 'var(--muted-foreground)',
    position: 'absolute',
    top: '50%',
    left: 'calc(var(--spacing) * 3)',
    width: 'calc(var(--spacing) * 4)',
    height: 'calc(var(--spacing) * 4)',
    translate: '0 -50%',
  },
  sb789ef1: {
    borderColor: 'color-mix(in oklab, var(--border) 70%, transparent)',
    color: 'var(--muted-foreground)',
    marginLeft: 'calc(var(--spacing) * 5)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    paddingBlock: 'calc(var(--spacing) * 2)',
    paddingLeft: 'calc(var(--spacing) * 5)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  scb4c14c5: {
    borderColor: 'color-mix(in oklab, var(--border) 70%, transparent)',
    marginLeft: 'calc(var(--spacing) * 5)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    paddingLeft: 'calc(var(--spacing) * 5)',
  },
  sb24cdc6d: {
    height: 'auto',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderStyle: 'none',
    backgroundColor: 'var(--surface-contrast)',
    paddingInline: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    boxShadow: 'var(--shadow-sm)',
    ':hover': {
      '@media (hover: hover)': {
        boxShadow: 'var(--shadow-md)',
      },
    },
  },
})
const styles = stylex.create({
  sf48c8a4f: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 8)',
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  s1170e5f9: {
    position: 'relative',
    width: '100%',
  },
  s3484a8: {
    paddingLeft: 'calc(0.25rem * 9)',
  },
  sfe859e32: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s34b572: {
    paddingBlock: 'calc(0.25rem * 6)',
  },
  s5fc7c349: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 16)',
  },
  s77710dd6: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 16)',
    height: 'calc(0.25rem * 16)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
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
})
export function DirectoryPageContent({
  docId,
  canCreate,
  header,
  headerRight,
  showSearch = true,
  showTitle = true,
  contentMaxWidth,
}: {
  docId: UnpackedHypermediaId
  canCreate?: boolean
  header?: ReactNode
  headerRight?: ReactNode
  showSearch?: boolean
  showTitle?: boolean
  contentMaxWidth?: number
}) {
  const route = useNavRoute()
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useScrollRestoration({
    scrollId: `directory-page-${docId.id}`,
    getStorageKey: () => getRouteKey(route),
    debug: false,
  })
  const {items, accountsMetadata, isInitialLoading} = useDirectoryDataWithActivity(docId)

  // Filter items based on search query
  const filteredItems = searchQuery
    ? items.filter((item) => item.metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : items
  if (isInitialLoading) {
    return (
      <div className={stylex.props(styles.sf48c8a4f).className || ''}>
        <Spinner className={stylex.props(styles.sca3de96c).className || ''} />
      </div>
    )
  }
  const searchBox =
    showSearch && items.length > 0 ? (
      <div className={stylex.props(styles.s1170e5f9).className || ''}>
        <Search className={stylex.props(styles_2.s7152e96b).className || ''} />
        <Input
          placeholder="Filter documents…"
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className={stylex.props(styles.s3484a8).className || ''}
        />
      </div>
    ) : null
  return (
    <PageLayout
      title={showTitle ? 'Sub documents' : undefined}
      headerRight={
        <>
          {searchBox}
          {headerRight}
        </>
      }
      contentMaxWidth={contentMaxWidth}
    >
      {/* Optional header slot (for create button, etc.) */}
      {header && <div className={stylex.props(styles.sfe859e32).className || ''}>{header}</div>}

      {/* Content */}
      <div className={stylex.props(styles.s34b572).className || ''} ref={scrollRef}>
        {items.length === 0 ? (
          <DirectoryEmpty canCreate={canCreate} />
        ) : filteredItems.length === 0 ? (
          <DirectoryNoResults searchQuery={searchQuery} />
        ) : (
          <DirectoryListViewWithActivity items={filteredItems} accountsMetadata={accountsMetadata} />
        )}
      </div>
    </PageLayout>
  )
}
function DirectoryNoResults({searchQuery}: {searchQuery: string}) {
  return (
    <div className={stylex.props(styles.s5fc7c349).className || ''}>
      <Search className={stylex.props(styles.s77710dd6).className || ''} />
      <SizableText color="muted" weight="medium" size="xl">
        No results found
      </SizableText>
      <SizableText color="muted" size="sm">
        No documents match "{searchQuery}"
      </SizableText>
    </div>
  )
}
export type DirectoryItem = ReturnType<typeof getSiteNavDirectory>[number]
export function DirectoryEmpty({canCreate}: {canCreate?: boolean}) {
  return (
    <div className={stylex.props(styles.s5fc7c349).className || ''}>
      <Folder className={stylex.props(styles.s77710dd6).className || ''} />
      <SizableText color="muted" weight="medium" size="xl">
        There are no documents here
      </SizableText>
      {canCreate && (
        <SizableText color="muted" size="sm">
          Create a new document to get started
        </SizableText>
      )}
    </div>
  )
}

/** Hook to fetch directory data with drafts */
export function useDirectoryData(docId: UnpackedHypermediaId) {
  const {directory, drafts, isInitialLoading} = useDirectoryWithDrafts(docId, {
    mode: 'Children',
  })
  const canSeePrivate = useCanSeePrivateDocs(docId)
  const directoryItems = getSiteNavDirectory({
    id: docId,
    directory,
    drafts,
    includePrivate: canSeePrivate,
  })
  return {
    directoryItems,
    isInitialLoading,
  }
}

/** Directory item with activity data */
export type DirectoryItemWithActivity =
  | (HMDocumentInfo & {
      draftId?: string
      isPublished: true
    })
  | {
      draftId: string
      isPublished: false
      id: UnpackedHypermediaId
      metadata: HMMetadata
      sortTime: Date
    }

/** Get the most recent activity time for sorting */
function getActivityTime(item: DirectoryItemWithActivity): number {
  if (!item.isPublished) return item.sortTime?.getTime() || 0
  const activity = item.activitySummary
  if (!activity) return item.sortTime?.getTime() || 0
  const changeTime = normalizeDate(activity.latestChangeTime)?.getTime() || 0
  const commentTime = normalizeDate(activity.latestCommentTime)?.getTime() || 0
  return Math.max(changeTime, commentTime) || item.sortTime?.getTime() || 0
}

/** Hook to fetch directory data with activity info for rich display */
export function useDirectoryDataWithActivity(docId: UnpackedHypermediaId) {
  const {directory, drafts, isInitialLoading} = useDirectoryWithDrafts(docId, {
    mode: 'Children',
  })
  const canSeePrivate = useCanSeePrivateDocs(docId)
  const items = useMemo(() => {
    const draftsArray = Array.isArray(drafts) ? drafts : []
    const editIds = new Map<string, string>()
    draftsArray.forEach((draft: HMListedDraft) => {
      // @ts-expect-error editId exists on drafts
      if (draft.editId?.id) {
        // @ts-expect-error editId exists on drafts
        editIds.set(draft.editId.id, draft.id)
      }
    })

    // Map published items with draft info, filtering private docs if user lacks access
    const publishedItems: DirectoryItemWithActivity[] = (directory ?? [])
      .filter((item) => canSeePrivate || item.visibility !== 'PRIVATE')
      .map((item) => ({
        ...item,
        draftId: editIds.get(item.id.id),
        isPublished: true as const,
      }))

    // Add unpublished drafts (new docs not yet published) that belong to this directory
    const unpublishedDraftItems: DirectoryItemWithActivity[] = draftsArray
      // @ts-expect-error locationId exists on drafts
      .filter((draft) => draft.locationId && draft.locationId.id === docId.id)
      .map((draft) => ({
        draftId: draft.id,
        isPublished: false as const,
        id: docId,
        metadata: draft.metadata,
        sortTime: new Date(draft.lastUpdateTime),
      }))
    const allItems = [...publishedItems, ...unpublishedDraftItems]

    // Sort by activity time (most recent first)
    allItems.sort((a, b) => getActivityTime(b) - getActivityTime(a))
    return allItems
  }, [directory, drafts, docId.id, canSeePrivate])

  // Collect all author uids for fetching metadata
  const authorUids = useMemo(() => {
    const uids = new Set<string>()
    items.forEach((item) => {
      if (item.isPublished && 'authors' in item) {
        item.authors?.forEach((uid) => uids.add(uid))
      }
    })
    return Array.from(uids)
  }, [items])
  const accountsMetadata = useAccountsMetadata(authorUids)
  return {
    items,
    accountsMetadata: accountsMetadata.data,
    isInitialLoading,
    isLoadingMetadata: accountsMetadata.isLoading,
  }
}

/** Directory list view with rich activity display like Library */
export function DirectoryListViewWithActivity({
  items,
  accountsMetadata,
}: {
  items: DirectoryItemWithActivity[]
  accountsMetadata?: HMAccountsMetadata
}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      {items.map((item) =>
        item.isPublished ? (
          <DirectoryDocumentTreeItem
            key={item.id.id}
            item={item}
            draftId={item.draftId}
            accountsMetadata={accountsMetadata}
          />
        ) : (
          <DraftListItem key={item.draftId} draftId={item.draftId} metadata={item.metadata} />
        ),
      )}
    </div>
  )
}
function DirectoryDocumentTreeItem({
  item,
  draftId,
  accountsMetadata,
}: {
  item: HMDocumentInfo & {
    draftId?: string
    isPublished: true
  }
  draftId?: string
  accountsMetadata?: HMAccountsMetadata
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <DocumentListItem
        item={item}
        draftId={draftId}
        accountsMetadata={accountsMetadata}
        expandable={{
          expanded,
          onToggle: () => setExpanded((value) => !value),
        }}
      />
      {expanded && <DirectoryDocumentChildren docId={item.id} />}
    </div>
  )
}
function DirectoryDocumentChildren({docId}: {docId: UnpackedHypermediaId}) {
  const {items, accountsMetadata, isInitialLoading} = useDirectoryDataWithActivity(docId)
  if (isInitialLoading) {
    return (
      <div className={stylex.props(styles_2.sb789ef1).className || ''}>
        <Spinner className={stylex.props(styles.s3269316e).className || ''} />
        Loading children…
      </div>
    )
  }
  if (!items.length) return null
  return (
    <div className={stylex.props(styles_2.scb4c14c5).className || ''}>
      <DirectoryListViewWithActivity items={items} accountsMetadata={accountsMetadata} />
    </div>
  )
}
function DraftListItem({draftId, metadata}: {draftId: string; metadata: HMMetadata}) {
  const linkProps = useRouteLink({
    key: 'draft',
    id: draftId,
  })
  return (
    <Button asChild variant="ghost" className={stylex.props(styles_2.sb24cdc6d).className || ''}>
      <a {...linkProps}>
        <div className={stylex.props(styles.sf2746014).className || ''}>
          <SizableText className={stylex.props(styles.s62d3095e).className || ''}>
            {getMetadataName(metadata)}
          </SizableText>
          <DraftBadge />
        </div>
      </a>
    </Button>
  )
}
