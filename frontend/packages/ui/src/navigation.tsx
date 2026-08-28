import * as stylex from '@stylexjs/stylex'
import {
  HMDocument,
  HMDocumentInfo,
  HMListedDraft,
  HMMetadata,
  HMResourceFetchResult,
  HMResourceVisibility,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {getMetadataName, getNodesOutline, NavRoute, NodeOutline, useRouteLink} from '@shm/shared'
import {getVersionHeads} from '@shm/shared/utils/entity-id-url'
import {useIsomorphicLayoutEffect} from '@shm/shared/utils/use-isomorphic-layout-effect'
import {ReactNode, useMemo} from 'react'
import {HoverCard, HoverCardContent, HoverCardTrigger} from './/hover-card'
import {ButtonProps} from './button'
import {useHighlighter} from './highlight-context'
import {HMIcon} from './hm-icon'
import {SmallListItem} from './list-item'
import {MergedBadge} from './merged-badge'
import {PrivateBadge} from './private-badge'
import {useMedia} from './use-media'
import {usePopoverState} from './use-popover-state'
import {cn} from './utils'
const styles_2 = stylex.create({
  s8706abad: {
    height: '100%',
    maxHeight: '80vh',
    width: '100%',
    overflow: 'auto',
  },
  s8097fc7a: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
    height: 'calc(var(--spacing) * 0.5)',
    width: '100%',
    borderRadius: 'calc(infinity * 1px)',
  },
  s1589f20c: {
    paddingLeft: '3px',
  },
})
const styles = stylex.create({
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s5f8260f0: {
    display: 'flex',
    width: 'calc(0.25rem * 5)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s2aed43c2: {
    zIndex: '50',
    padding: 'calc(0.25rem * 1)',
  },
  s44d93df3: {
    MsOverflowStyle: 'none',
    scrollbarWidth: 'none',
    height: '100%',
    overflow: 'auto',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
})
export function DocumentSmallListItem({
  metadata,
  id,
  active,
  onClick,
  draftId,
  isPublished,
  visibility,
}: {
  metadata?: HMMetadata
  id?: UnpackedHypermediaId
  active?: boolean
  onClick?: ButtonProps['onClick']
  draftId?: string | null | undefined
  isPublished?: boolean
  visibility?: HMResourceVisibility
}) {
  const route: NavRoute | undefined = draftId
    ? {
        key: 'draft',
        id: draftId,
      }
    : id && {
        key: 'document',
        id,
      }
  if (!route) {
    throw new Error('No route for DocumentSmallListItem. Must provide either id or draftId')
  }
  const linkProps = useRouteLink(route, {
    onClick: onClick,
  })
  const color = isPublished === false ? '$color11' : undefined
  const highlight = useHighlighter()
  const isPrivate = visibility === 'PRIVATE'
  const icon = id ? <HMIcon id={id} name={metadata?.name} icon={metadata?.icon} size={20} /> : null
  const headCount = getVersionHeads(id?.version).length
  const accessory =
    isPrivate || headCount > 1 ? (
      <div className={stylex.props(styles.s86ff3e3).className || ''}>
        {isPrivate && <PrivateBadge size="sm" />}
        {headCount > 1 && <MergedBadge count={headCount} size="sm" />}
      </div>
    ) : null
  return (
    <SmallListItem
      multiline
      bold
      color={color}
      key={draftId || id?.id}
      title={getMetadataName(metadata)}
      {...highlight(id)}
      icon={icon}
      active={active}
      isDraft={!!draftId}
      accessory={accessory}
      {...linkProps}
    />
  )
}
export type DocNavigationItem = {
  key: string
  metadata: HMMetadata
  isPublished?: boolean
  id?: UnpackedHypermediaId
  webUrl?: string
  draftId?: string | null | undefined
  sortTime?: Date
  visibility?: HMResourceVisibility
}

/** Whether a top-header navigation item is complete enough to render publicly. */
export function isValidSiteHeaderItem(item: DocNavigationItem): boolean {
  const hasLabel = !!item.metadata.name?.trim()
  const hasDestination = !!item.id || !!item.webUrl?.trim() || !!item.draftId
  return hasLabel && hasDestination
}
export function getSiteNavDirectory({
  id,
  directory,
  drafts,
  includePrivate = false,
}: {
  id: UnpackedHypermediaId
  directory?: HMDocumentInfo[]
  drafts?: HMListedDraft[]
  includePrivate?: boolean
}): DocNavigationItem[] {
  const draftsArray = Array.isArray(drafts) ? drafts : []
  const editIds = new Set<string>(
    draftsArray
      // @ts-expect-error
      .map((d) => d.editId)
      .filter((id) => !!id)
      .map((id) => id.id),
  )
  const unpublishedDraftItems: DocNavigationItem[] = draftsArray
    // @ts-expect-error
    .filter((draft) => draft.locationId && draft.locationId.id === id.id)
    .map(
      (draft) =>
        ({
          key: draft.id,
          id: undefined,
          draftId: draft.id,
          metadata: draft.metadata,
          sortTime: new Date(draft.lastUpdateTime),
          isPublished: false,
        }) satisfies DocNavigationItem,
    )
  const publishedItems: DocNavigationItem[] =
    directory
      ?.filter((item) => includePrivate || item.visibility !== 'PRIVATE')
      .map((item) => {
        const id = item.id
        const sortTime = item.sortTime
        return {
          key: id.id,
          id,
          metadata: item.metadata,
          sortTime,
          draftId: editIds.has(id.id)
            ? // @ts-expect-error
              draftsArray.find((d) => d.editId?.id === id.id)?.id
            : undefined,
          isPublished: true,
          visibility: item.visibility,
        }
      }) ?? []
  unpublishedDraftItems.sort((a, b) => (b.sortTime?.getTime() || 0) - (a.sortTime?.getTime() || 0)).reverse()
  publishedItems.sort((a, b) => (b.sortTime?.getTime() || 0) - (a.sortTime?.getTime() || 0)).reverse()
  const directoryItems: DocNavigationItem[] = [...publishedItems, ...unpublishedDraftItems]
  return directoryItems
}
export function useNodesOutline(
  document: HMDocument | null | undefined,
  id: UnpackedHypermediaId,
  embeddedDocs?: HMResourceFetchResult[],
) {
  return useMemo(
    () => getNodesOutline(document?.content || [], id, embeddedDocs),
    [document?.content, id, embeddedDocs],
  )
}
export function DocumentOutline({
  outline,
  indented,
  onActivateBlock,
  onClick,
  id,
  activeBlockId,
  onCloseNav,
}: {
  outline: NodeOutline[]
  indented?: number
  onActivateBlock: (blockId: string) => void
  onClick?: ButtonProps['onClick']
  id: UnpackedHypermediaId
  activeBlockId: string | null
  onCloseNav?: () => void
}) {
  return outline.map((node) => (
    <OutlineNode
      node={node}
      key={node.id}
      indented={indented}
      onActivateBlock={onActivateBlock}
      onClick={onClick}
      activeBlockId={activeBlockId}
      onCloseNav={onCloseNav}
      docId={id}
    />
  ))
}
export function DraftOutline({
  id,
  onActivateBlock,
  indented,
  onClick,
  outline = [],
}: {
  id?: UnpackedHypermediaId
  onActivateBlock: (blockId: string) => void
  indented?: number
  onClick?: ButtonProps['onClick']
  outline: NodeOutline[]
}) {
  return outline.map((node) => (
    <OutlineNode
      node={node}
      key={node.id}
      indented={indented}
      onActivateBlock={onActivateBlock}
      onClick={onClick}
      activeBlockId={null}
      docId={id}
    />
  ))
}
function OutlineNode({
  node,
  indented = 0,
  activeBlockId,
  onActivateBlock,
  onClick,
  onCloseNav,
  docId,
}: {
  node: NodeOutline
  indented?: number
  activeBlockId: string | null
  onActivateBlock: (blockId: string) => void
  onClick?: ButtonProps['onClick']
  onCloseNav?: () => void
  docId?: UnpackedHypermediaId
}) {
  const routeLinkResult = useRouteLink(
    docId
      ? {
          key: 'document',
          id: {
            ...docId,
            blockRef: node.id,
            blockRange: {
              expanded: true,
            },
          },
        }
      : {
          key: 'document',
          id: {
            id: '',
            uid: '',
            path: null,
            version: null,
            blockRef: null,
            blockRange: null,
            hostname: null,
            scheme: null,
          },
        },
    {
      replace: true,
    },
  )
  const outlineProps = docId ? routeLinkResult : undefined
  return (
    <>
      <SmallListItem
        {...outlineProps}
        key={node.id}
        multiline
        active={node.id === activeBlockId}
        title={node.title}
        indented={indented}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault()
          if (outlineProps && outlineProps.onClick) {
            outlineProps.onClick(e)
          }
          onClick?.(e)
          onCloseNav?.()
          onActivateBlock(node.id)
        }}
      />
      {node.children?.length
        ? node.children.map((child) => (
            <OutlineNode
              node={child}
              key={child.id}
              indented={indented + 1}
              activeBlockId={activeBlockId}
              onActivateBlock={onActivateBlock}
              onClick={onClick}
              onCloseNav={onCloseNav}
              docId={docId}
            />
          ))
        : null}
    </>
  )
}
export function DocNavigationWrapper({
  children,
  showCollapsed,
  outline,
}: {
  children: ReactNode
  showCollapsed: boolean
  outline: Array<NodeOutline>
}) {
  const popoverState = usePopoverState()
  const media = useMedia()
  useIsomorphicLayoutEffect(() => {
    if (media.gtSm && popoverState.open) {
      popoverState.onOpenChange(false)
    }
  }, [media.gtSm])
  const limitedOutline = outline?.length > 7 ? outline.slice(0, 7) : outline
  return showCollapsed ? (
    <div className={stylex.props(styles.s9a378369).className || ''}>
      <HoverCard openDelay={100}>
        <HoverCardTrigger className={stylex.props(styles.s5f8260f0).className || ''}>
          {limitedOutline?.length
            ? limitedOutline.map((node) => <CollapsedOutlineNode key={node.id} node={node} />)
            : null}
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={{
            bottom: 24,
          }}
          className={stylex.props(styles.s2aed43c2).className || ''}
        >
          <div className={stylex.props(styles_2.s8706abad).className || ''}>{children}</div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ) : (
    <div
      className={stylex.props(styles.s44d93df3).className || ''}
      // paddingVertical="$4"
    >
      {children}
    </div>
  )
}
function CollapsedOutlineNode({node, level = 1}: {node: NodeOutline; level?: number}) {
  const nodes =
    !node.children?.length || node.children.length < 2
      ? undefined
      : node.children.length < 8
        ? node.children
        : node.children.slice(0, 8)
  return (
    <>
      <div key={node.id} className={stylex.props(styles_2.s8097fc7a).className || ''} />
      {nodes ? (
        <div
          className={cn(
            stylex.props(styles.sfbc6e28f).className || '',
            stylex.props(level < 3 ? styles_2.s1589f20c : null).className || '',
          )}
        >
          {nodes.map((child) => (
            <CollapsedOutlineNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      ) : null}
    </>
  )
}
