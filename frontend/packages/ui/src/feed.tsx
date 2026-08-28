import * as stylex from '@stylexjs/stylex'
import {HMBlockNode, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useDeleteComment, useHackyAuthorsSubscriptions} from '@shm/shared/comments-service-provider'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {HMListEventsParams, LoadedCommentEvent, LoadedEvent} from '@shm/shared/models/activity-service'
import {type DocumentMachineEvent} from '@shm/shared/models/document-machine'
import {useResource, useSelectedAccountId} from '@shm/shared/models/entity'
import {useDocumentSend} from '@shm/shared/models/use-document-machine'
import {useReadOnlyViewer} from '@shm/shared/readonly-viewer-context'
import {DocumentRoute, NavRoute} from '@shm/shared/routes'
import {useRouteLink, useUniversalAppContext} from '@shm/shared/routing'
import {useTx, useTxString} from '@shm/shared/translation'
import {useActivityFeed} from '@shm/shared/use-activity-feed'
import {commentIdToHmId, getCommentTargetId, getVersionHeads, hmId, latestId} from '@shm/shared/utils/entity-id-url'
import {useNavRoute} from '@shm/shared/utils/navigation'
import merge from 'lodash/merge'
import {CircleAlert, FilePen, Link, Merge, RotateCcw, Trash2, X} from 'lucide-react'
import {Fragment, useEffect, useMemo, useRef, useState} from 'react'
import {SelectionContent} from './accessories'
import {Button} from './button'
import {CommentContent, useDeleteCommentDialog} from './comments'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/alert-dialog'
import {HMIcon} from './hm-icon'
import {ReplyArrow} from './icons'
import {AuthorNameLink, DocumentNameLink, InlineDescriptor, Timestamp} from './inline-descriptor'
import {DocumentCard} from './newspaper'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {ResourceToken} from './resource-token'
import {Separator} from './separator'
import {Spinner} from './spinner'
import {Tooltip} from './tooltip'
import {useCopyHmLink} from './use-copy-hm-link'
import {cn} from './utils'
const styles_7 = stylex.create({
  s59794290: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  s20a3e675: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
      },
    },
  },
})
const styles_6 = stylex.create({
  s48bb0432: {
    '::before': {
      content: '""',
      borderColor: 'var(--border)',
    },
  },
  s41e96d2: {
    '::before': {
      content: '""',
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
    },
  },
  s41e78ca: {
    '::before': {
      content: '""',
      borderLeftStyle: 'solid',
      borderLeftWidth: '1px',
    },
  },
  s8e0df312: {
    '::before': {
      content: '""',
      position: 'absolute',
    },
  },
  s97216324: {
    '::before': {
      content: '""',
      left: '12px',
    },
  },
  s6ad686a4: {
    '::before': {
      content: '""',
      top: '9px',
    },
  },
  s5494a8fc: {
    '::before': {
      content: '""',
      height: 'calc(100% - 10px)',
    },
  },
  s5b46eb46: {
    '::before': {
      content: '""',
      width: '16px',
    },
  },
  sa30d0915: {
    '::before': {
      content: '""',
      borderTopLeftRadius: 'var(--radius)',
    },
  },
})
const styles_5 = stylex.create({
  s856bab52: {
    backgroundColor: 'var(--accent)',
  },
  s95afba94: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  s93b5f015: {
    alignItems: 'flex-start',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b570: {
    paddingBlock: 'calc(0.25rem * 4)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s4e079f: {
    '@media (hover: hover)': {
      opacity: '0%',
    },
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s8c9099f9: {
    transitionDuration: '200ms',
  },
  sea6c7565: {
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
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
  s68b465f8: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--background)',
      },
    },
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
})
const styles_4 = stylex.create({
  s8e3eaed: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: '24px',
    height: '24px',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  s695c9313: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'color-mix(in oklab, var(--color-amber-500) 10%, transparent)',
    paddingInline: 'calc(var(--spacing) * 1.5)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: '11px',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--tone-amber-700)',
  },
  s86211ac2: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--destructive)',
        opacity: '100%',
      },
    },
    margin: 'calc(var(--spacing) * -1)',
    width: 'calc(var(--spacing) * 7)',
    height: 'calc(var(--spacing) * 7)',
    flexShrink: '0',
    opacity: '70%',
  },
  s69314a36: {
    height: '18px',
    width: '24px',
  },
  sa3de5f9f: {
    width: '18px',
    height: '18px',
  },
  sb30c9c28: {
    minHeight: '20px',
    flex: '1',
    overflow: 'hidden',
    lineHeight: '14px',
  },
  sc061136a: {
    color: 'var(--muted-foreground)',
    marginLeft: 'calc(var(--spacing) * 0.5)',
    flex: 'none',
    fontSize: '11px',
  },
  s346fa975: {
    width: '50px',
  },
  sa3eaa5a4: {
    width: '24px',
    height: '24px',
  },
  s3447346e: {
    width: '24px',
  },
  se3333c05: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--muted-foreground)',
      },
    },
    ':active': {
      color: 'var(--muted-foreground)',
    },
  },
  sdab42caa: {
    backgroundColor: 'var(--accent)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
})
const styles_3 = stylex.create({
  s8ff9bd15: {
    boxShadow: '0 0 0 1px var(--border)',
  },
})
const styles_2 = stylex.create({
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
const styles = stylex.create({
  s8d50829d: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  se295dcdf: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 3)',
  },
  s8ebd66a8: {
    margin: 'calc(0.25rem * 4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 3)',
  },
  s3566be66: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  s2ff5c3: {
    height: 'calc(0.25rem * 20)',
  },
  sb61efeff: {
    color: 'var(--muted-foreground)',
    paddingBlock: 'calc(0.25rem * 3)',
    textAlign: 'center',
  },
  s76b0b3a9: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sc250396c: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
  },
  s342f90d0: {
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s2011040e: {
    marginInline: 'calc(0.25rem * 1)',
    marginBottom: 'calc(0.25rem * 1)',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  s8eee23a7: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
  },
  s61f21f46: {
    color: 'var(--muted-foreground)',
    marginLeft: 'calc(0.25rem * 1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 0.5)',
    verticalAlign: 'middle',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s2ad4933: {
    marginLeft: 'calc(0.25rem * -4)',
  },
  see106aa0: {
    marginLeft: 'calc(0.25rem * -3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sa56e9200: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s4b944b9: {
    color: 'var(--muted-foreground)',
    marginLeft: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  se99caec9: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 2)',
  },
  s7b2a91e8: {
    position: 'relative',
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  s34b4f5fe: {
    flex: '1',
    paddingBottom: 'calc(0.25rem * 6)',
  },
  s731a65c4: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s2ad4932: {
    marginLeft: 'calc(0.25rem * -3)',
  },
})
export type DraftVersionEntry = {
  docId: UnpackedHypermediaId
  draftId: string
  deps?: string[]
  metadata?: {
    name?: string
  }
  onDiscardConfirm?: (draftId: string, send: (event: DocumentMachineEvent) => void) => void
}
export function shouldShowDraftVersionEntry(
  filterEventType: HMListEventsParams['filterEventType'] | undefined,
  draftVersionEntry: DraftVersionEntry | undefined,
) {
  return !!draftVersionEntry && !!filterEventType?.includes('Ref')
}
export function getDraftVersionInsertIndex(events: LoadedEvent[], draft: DraftVersionEntry | undefined) {
  if (!draft?.deps?.length) return 0
  const baseVersions = new Set(draft.deps)
  const baseIndex = events.findIndex((event) => event.type === 'doc-update' && baseVersions.has(event.document.version))
  return baseIndex === -1 ? 0 : baseIndex
}

/** Returns the newest document update version from an activity feed ordered newest-first. */
export function getLatestDocUpdateVersion(events: LoadedEvent[]) {
  return events.find((event) => event.type === 'doc-update')?.document.version ?? null
}
export function isSelectedDocUpdateVersion(
  eventVersion: string | undefined,
  routeVersion: string | null | undefined,
  routeLatest: boolean | null | undefined,
  latestVersion: string | null | undefined,
) {
  if (!eventVersion) return false
  if (routeVersion) return eventVersion === routeVersion
  return !!routeLatest && !!latestVersion && eventVersion === latestVersion
}
export function canShowRestoreVersionButton(input: {
  isSingleResource?: boolean
  selectedAccountUid?: string
  selectedAccountCanWriteDocument?: boolean
  latestVersion?: string | null
  eventVersion?: string
  hasRestoreAction?: boolean
}) {
  return !!(
    input.isSingleResource &&
    input.selectedAccountUid &&
    input.selectedAccountCanWriteDocument &&
    input.latestVersion &&
    input.eventVersion &&
    input.hasRestoreAction &&
    input.latestVersion !== input.eventVersion
  )
}

/** Copy and button variants for the restore-version confirmation dialog. */
export const RESTORE_VERSION_DIALOG = {
  title: 'Restore this version?',
  description:
    'Your current draft will be discarded. This version will become the new latest version — you can always restore back later if needed.',
  cancelVariant: 'ghost',
  restoreVariant: 'danger',
} as const

/**
 * Marks version-row action buttons. The matching stylesheet rule reveals them on row hover and
 * keeps the icon button dimensions untouched.
 */
export const RESTORE_VERSION_ACTION_SLOT = 'restore-version-action'
export function Feed({
  filterResource,
  filterAuthors,
  filterEventType,
  targetDomain,
  size = 'md',
  draftVersionEntry,
}: {
  size?: 'sm' | 'md'
  filterResource: HMListEventsParams['filterResource']
  filterAuthors?: HMListEventsParams['filterAuthors']
  filterEventType?: HMListEventsParams['filterEventType']
  targetDomain?: string
  draftVersionEntry?: DraftVersionEntry
}) {
  const observerRef = useRef<IntersectionObserver>()
  const lastElementNodeRef = useRef<HTMLDivElement>(null)
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch} = useActivityFeed({
    filterResource,
    filterAuthors,
    filterEventType,
  })

  // Setup and cleanup observer whenever dependencies change
  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = undefined
    }
    const node = lastElementNodeRef.current

    // Early return if no node or still loading
    if (!node || isLoading) {
      return
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '100px',
      },
    )
    observerRef.current.observe(node)
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = undefined
      }
    }
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all pages into a single array of events.
  // Agent capability grants are implementation details for devices and should
  // not appear in user-facing feeds (notably profile feeds).
  const allEvents = (data?.pages.flatMap((page) => page.events) || []).filter((event) => {
    if (event.type !== 'capability') return true
    return event.capability.role?.toLowerCase() !== 'agent'
  })

  // Extract unique account IDs from events and subscribe for discovery.
  // Includes authors, reply parents, contact subjects, and capability delegates
  // so their profiles are discovered before we render them.
  const authorIds = useMemo(() => {
    const ids = new Set<string>()
    allEvents.forEach((event) => {
      if (event.author?.id?.uid) {
        ids.add(event.author.id.uid)
      }
      if (event.type === 'comment' && event.replyParentAuthor?.id?.uid) {
        ids.add(event.replyParentAuthor.id.uid)
      }
      if (event.type === 'contact' && event.contact.subject?.id?.uid) {
        ids.add(event.contact.subject.id.uid)
      }
      if (event.type === 'capability') {
        event.delegates.forEach((delegate) => {
          if (delegate?.id?.uid) {
            ids.add(delegate.id.uid)
          }
        })
      }
    })
    return Array.from(ids)
  }, [allEvents])

  // Subscribe to author accounts for discovery (desktop only, no-op on web)
  useHackyAuthorsSubscriptions(authorIds)
  const isSingleResource = filterResource && !filterResource.endsWith('*') ? true : false
  const shouldRenderDraftVersion = shouldShowDraftVersionEntry(filterEventType, draftVersionEntry)
  const draftInsertIndex = shouldRenderDraftVersion ? getDraftVersionInsertIndex(allEvents, draftVersionEntry) : -1
  const latestDocUpdateVersion = isSingleResource ? getLatestDocUpdateVersion(allEvents) : null
  if (error) {
    return (
      <div className={stylex.props(styles.s8d50829d).className || ''}>
        <p>Feed error. try again</p>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className={stylex.props(styles.se295dcdf).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (error) {
    return (
      <div className={stylex.props(styles.s8ebd66a8).className || ''}>
        <CircleAlert className={stylex.props(styles.s3566be66).className || ''} />
        <p className={stylex.props(styles.sa56e915f).className || ''}>Error Loading Feed</p>
        <Button
          size="sm"
          variant="default"
          onClick={() => refetch()}
          className={stylex.props(styles.s33458c).className || ''}
        >
          retry
        </Button>
      </div>
    )
  }
  return (
    <SelectionContent>
      <div>
        {allEvents.map((e, index) => {
          const route = getEventRoute(e)
          if (e.type == 'comment' && e.replyingComment) {
            return (
              <Fragment key={`row-${e.type}-${e.id}-${e.time}`}>
                {index === draftInsertIndex && draftVersionEntry ? (
                  <DraftVersionItem draft={draftVersionEntry} hasNewerPublishedVersion={draftInsertIndex > 0} />
                ) : null}
                <div>
                  <EventCommentWithReply
                    isSingleResource={isSingleResource}
                    event={e}
                    route={route}
                    targetDomain={targetDomain}
                    size={size}
                    latestDocUpdateVersion={latestDocUpdateVersion}
                  />
                  <Separator />
                </div>
              </Fragment>
            )
          }
          return (
            <Fragment key={`row-${e.type}-${e.id}-${e.time}`}>
              {index === draftInsertIndex && draftVersionEntry ? (
                <DraftVersionItem draft={draftVersionEntry} hasNewerPublishedVersion={draftInsertIndex > 0} />
              ) : null}
              <div>
                <EventItem
                  isSingleResource={isSingleResource}
                  event={e}
                  route={route}
                  targetDomain={targetDomain}
                  size={size}
                  latestDocUpdateVersion={latestDocUpdateVersion}
                />
                <Separator />
              </div>
            </Fragment>
          )
        })}
        {draftInsertIndex === allEvents.length && draftVersionEntry ? (
          <DraftVersionItem draft={draftVersionEntry} hasNewerPublishedVersion={draftInsertIndex > 0} />
        ) : null}
        {!isLoading && <div className={stylex.props(styles.s2ff5c3).className || ''} ref={lastElementNodeRef} />}
      </div>
      {isFetchingNextPage && <div className={stylex.props(styles.sb61efeff).className || ''}>Loading more…</div>}
      {!hasNextPage && allEvents.length > 0 && (
        <div className={stylex.props(styles.sb61efeff).className || ''}>No more events</div>
      )}
    </SelectionContent>
  )
}
function DraftVersionItem({
  draft,
  hasNewerPublishedVersion,
}: {
  draft: DraftVersionEntry
  hasNewerPublishedVersion: boolean
}) {
  const currentRoute = useNavRoute()
  const send = useDocumentSend()
  const draftRoute = {
    key: 'document' as const,
    id: hmId(draft.docId.uid, {
      path: draft.docId.path,
    }),
  }
  const draftLinkProps = useRouteLink(merge({}, currentRoute, draftRoute))
  const isCurrentDraftRoute =
    currentRoute.key === 'document' &&
    currentRoute.id.uid === draft.docId.uid &&
    currentRoute.id.version === null &&
    JSON.stringify(currentRoute.id.path ?? []) === JSON.stringify(draft.docId.path ?? [])
  return (
    <div
      className={cn(
        stylex.props(
          styles_5.s856bab52,
          styles_5.s95afba94,
          styles_5.s2ffff9,
          styles_5.s93b5f015,
          styles_5.s5d936fb,
          styles_5.s34b1af,
          styles_5.s34b570,
          styles_5.sf7fb00e8,
        ).className || '',
        stylex.props(styles_7.s59794290).className || '',
        'group',
        stylex.props(isCurrentDraftRoute && styles_3.s8ff9bd15).className || '',
      )}
      {...draftLinkProps}
    >
      <div className={stylex.props(styles_4.s8e3eaed).className || ''}>
        <FilePen className={stylex.props(styles.s76b0b3a9).className || ''} />
      </div>
      <div className={stylex.props(styles_2.se30fd43e).className || ''}>
        <div className={stylex.props(styles.sc250396c).className || ''}>
          <span className={stylex.props(styles.s342f90d0).className || ''}>Unpublished Changes</span>
          {hasNewerPublishedVersion ? (
            <span className={stylex.props(styles_4.s695c9313).className || ''}>Newer version above</span>
          ) : null}
        </div>
      </div>
      <Tooltip content="Discard changes">
        <Button
          size="icon"
          variant="ghost"
          className={stylex.props(styles_4.s86211ac2).className || ''}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (draft.onDiscardConfirm) {
              draft.onDiscardConfirm(draft.draftId, send)
            } else if (window.confirm('Discard draft changes?')) {
              send({
                type: 'edit.discard',
              })
            }
          }}
        >
          <X className={stylex.props(styles.s3269316e).className || ''} />
        </Button>
      </Tooltip>
    </div>
  )
}
function EventHeaderContent({
  event,
  targetDomain,
  isSingleResource,
  route,
  latestDocUpdateVersion,
}: {
  event: LoadedEvent
  targetDomain?: string
  isSingleResource?: boolean
  route?: NavRoute | null
  latestDocUpdateVersion?: string | null
}) {
  const tx = useTxString()
  const currentRoute = useNavRoute()
  const currentAccount = useSelectedAccountId()
  const documentActions = useDocumentActions()
  const latestDocId = event.type === 'doc-update' ? latestId(event.docId) : null
  const latestResource = useResource(latestDocId)
  const latestDocument = latestResource.data?.type === 'document' ? latestResource.data.document : null
  const latestVersion = latestDocUpdateVersion ?? latestDocument?.version
  const deleteCommentMutation = useDeleteComment()
  const deleteCommentDialog = useDeleteCommentDialog()
  const copyHmLink = useCopyHmLink()
  const {origin: appOrigin, onPushReference} = useUniversalAppContext()
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  if (event.type == 'comment') {
    const options: MenuItemType[] = []
    if (event.comment && currentAccount && currentAccount == event.comment.author) {
      options.push({
        icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
        label: 'Delete',
        onClick: () => {
          deleteCommentDialog.open({
            onConfirm: () => {
              deleteCommentMutation.mutate({
                comment: event.comment!,
                signingAccountId: currentAccount,
              })
            },
          })
        },
        key: 'delete',
      })
    }
    return (
      <>
        {deleteCommentDialog.content}
        <div
          className={
            stylex.props(
              styles_5.s2ffff9,
              styles_5.scdbaf625,
              styles_5.sc6ed1702,
              styles_5.sc1a629cb,
              styles_5.s5d936fb,
            ).className || ''
          }
        >
          <InlineDescriptor>
            <AuthorNameLink author={event.author} />{' '}
            {!isSingleResource && event.target ? (
              <>
                <span>commented on</span> <DocumentNameLink metadata={event.target?.metadata} id={event.target.id} />
              </>
            ) : null}
            <Timestamp time={event.time} route={route} />
          </InlineDescriptor>
          {event.comment && (
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              <Tooltip content={tx('Copy Comment Link')}>
                <Button
                  size="icon"
                  variant="ghost"
                  className={
                    stylex.props(
                      styles_5.sf2718385,
                      styles_5.s4e079f,
                      styles_5.s83442393,
                      styles_5.s8c9099f9,
                      styles_5.sea6c7565,
                    ).className || ''
                  }
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const targetDocId = getCommentTargetId(event.comment!)
                    if (!targetDocId || !event.comment) return
                    const routeLatest =
                      currentRoute.key === 'document' ||
                      currentRoute.key === 'comments' ||
                      currentRoute.key === 'activity'
                        ? currentRoute.id.latest
                        : undefined
                    copyHmLink({
                      id: {
                        ...targetDocId,
                        hostname: targetDomain ?? null,
                        latest: routeLatest ?? null,
                      },
                      commentId: commentIdToHmId(event.comment.id),
                      gatewayUrl: appOrigin ?? undefined,
                    })
                  }}
                >
                  <Link className={stylex.props(styles.sca3de967).className || ''} />
                </Button>
              </Tooltip>
              {options.length > 0 && (
                <OptionsDropdown
                  side="bottom"
                  align="end"
                  className={
                    stylex.props(styles_5.s4e079f, styles_5.s83442393, styles_5.s8c9099f9, styles_5.sea6c7565)
                      .className || ''
                  }
                  menuItems={options}
                />
              )}
            </div>
          )}
        </div>
      </>
    )
  }
  if (event.type == 'capability') {
    return (
      <InlineDescriptor>
        <AuthorNameLink author={event.author} /> <span>added</span>{' '}
        {event.delegates[0]?.id ? (
          <HMIcon
            className={stylex.props(styles.s2011040e).className || ''}
            id={event.delegates[0]?.id}
            size={18}
            icon={event.delegates[0]?.metadata?.icon}
            name={event.delegates[0]?.metadata?.name}
          />
        ) : null}
        <AuthorNameLink author={event.delegates[0]!} />{' '}
        {!isSingleResource && event.target?.id ? (
          <>
            <span>as a {event.capability.role} in</span>{' '}
            <DocumentNameLink metadata={event.target?.metadata} id={event.target?.id} />{' '}
          </>
        ) : (
          <>
            <span>as a {event.capability.role}</span>{' '}
          </>
        )}
        <Timestamp time={event.time} route={route} />
      </InlineDescriptor>
    )
  }
  if (event.type == 'doc-update') {
    const docUpdateHeadCount = getVersionHeads(event.document.version).length
    const selectedAccountCanWriteDocument = !!documentActions.canWriteDocument?.(event.docId)
    const canRestore = canShowRestoreVersionButton({
      isSingleResource,
      selectedAccountUid: documentActions.selectedAccountUid,
      selectedAccountCanWriteDocument,
      latestVersion,
      eventVersion: event.document.version,
      hasRestoreAction: !!documentActions.onRestoreDocumentVersion,
    })
    const restoreButton = canRestore ? (
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <Tooltip content="Restore">
          <Button
            aria-label="Restore"
            size="icon"
            variant="ghost"
            data-slot={RESTORE_VERSION_ACTION_SLOT}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setRestoreDialogOpen(true)
            }}
          >
            <RotateCcw />
          </Button>
        </Tooltip>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{RESTORE_VERSION_DIALOG.title}</AlertDialogTitle>
            <AlertDialogDescription>{RESTORE_VERSION_DIALOG.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring} variant={RESTORE_VERSION_DIALOG.cancelVariant}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRestoring}
              variant={RESTORE_VERSION_DIALOG.restoreVariant}
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!documentActions.onRestoreDocumentVersion) return
                setIsRestoring(true)
                try {
                  await documentActions.onRestoreDocumentVersion(event.docId, event.document)
                  setRestoreDialogOpen(false)
                } catch {
                  // The platform restore action owns user-facing error toasts.
                } finally {
                  setIsRestoring(false)
                }
              }}
            >
              {isRestoring ? 'Restoring…' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : null
    return (
      <div className={stylex.props(styles.s8eee23a7).className || ''}>
        <InlineDescriptor>
          <AuthorNameLink author={event.author} />{' '}
          {!isSingleResource ? (
            <>
              <span>
                {/* TODO: check if this is the correct way of getting the first ref update of a document */}
                {event.document.version == event.document.genesis ? 'created' : 'updated'}
              </span>{' '}
              <DocumentNameLink metadata={event.document.metadata} id={event.docId} />{' '}
            </>
          ) : (
            <>
              <span>
                {/* TODO: check if this is the correct way of getting the first ref update of a document */}
                {event.document.version == event.document.genesis ? 'created the document' : 'updated the document'}
              </span>{' '}
            </>
          )}
          <Timestamp time={event.time} route={route} />
          {docUpdateHeadCount > 1 ? (
            <Tooltip content={`Merged ${docUpdateHeadCount} concurrent versions`}>
              <span className={stylex.props(styles.s61f21f46).className || ''}>
                <Merge size={12} strokeWidth={2} />
                <span className={stylex.props(styles.sab7cc79b).className || ''}>{docUpdateHeadCount}</span>
              </span>
            </Tooltip>
          ) : null}
        </InlineDescriptor>
        <div className={stylex.props(styles.s86ff3e3).className || ''}>
          {restoreButton}
          <Tooltip content={tx('Copy Link to Version')}>
            <Button
              size="icon"
              variant="ghost"
              data-slot={RESTORE_VERSION_ACTION_SLOT}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!event.docId?.uid) return
                const routeLatest =
                  currentRoute.key === 'document' || currentRoute.key === 'comments' || currentRoute.key === 'activity'
                    ? currentRoute.id.latest
                    : undefined
                const versionedId = hmId(event.docId.uid, {
                  path: event.docId.path,
                  version: event.document.version,
                  latest: routeLatest ?? false,
                  hostname: targetDomain ?? null,
                })
                copyHmLink({
                  id: versionedId,
                  gatewayUrl: appOrigin ?? undefined,
                })
                onPushReference?.(versionedId)
              }}
            >
              <Link />
            </Button>
          </Tooltip>
        </div>
      </div>
    )
  }
  if (event.type == 'contact') {
    const contactAction =
      event.contact.subscribe?.site && event.contact.subscribe?.profile
        ? 'followed and joined'
        : event.contact.subscribe?.profile
          ? 'followed'
          : event.contact.subscribe?.site
            ? 'joined'
            : 'added'
    const contactName = event.contact.name?.trim() || null
    return (
      <InlineDescriptor>
        <AuthorNameLink author={event.author} /> <span>{contactAction}</span>{' '}
        {event.contact.subject?.id && event.contact.subject.metadata?.icon ? (
          <HMIcon
            className={stylex.props(styles.s2011040e).className || ''}
            id={event.contact.subject.id}
            size={18}
            icon={event.contact.subject.metadata.icon}
            name={event.contact.subject.metadata.name}
          />
        ) : null}
        <AuthorNameLink author={event.contact.subject} />
        {contactName ? (
          <>
            {' '}
            <span>as</span>{' '}
            <span
              className={
                stylex.props(
                  styles_5.s436dc7b6,
                  styles_5.sc05281e3,
                  styles_5.sae6a97a5,
                  styles_5.s529492ad,
                  styles_5.s769ec921,
                  styles_5.sab7cc6fa,
                  styles_5.s356a30,
                  styles_5.s646c459b,
                  styles_5.s48a3ed91,
                ).className || ''
              }
            >
              {contactName}
            </span>
          </>
        ) : null}{' '}
        <Timestamp time={event.time} route={route} />
      </InlineDescriptor>
    )
  }
  if (event.type == 'citation') {
    return (
      <InlineDescriptor>
        <AuthorNameLink author={event.author} /> <span>{event.citationType === 'c' ? 'mentioned' : 'cited'}</span>{' '}
        {!isSingleResource ? (
          <>
            <DocumentNameLink metadata={event.target?.metadata} id={event.target?.id} fallback="this document" />{' '}
          </>
        ) : (
          <>
            <span>this document</span>{' '}
          </>
        )}
        <span>{event.citationType === 'c' ? 'in a comment on' : 'in'}</span>{' '}
        <DocumentNameLink metadata={event.source?.metadata} id={event.source?.id} fallback="a document" />{' '}
        <Timestamp time={event.time} route={route} />
      </InlineDescriptor>
    )
  }
  console.error('EventHeaderContent: We must have ifs for all the event types:', event)
  return null
}
function EventContent({
  event,
  size = 'md',
  isSingleResource = false,
}: {
  event: LoadedEvent
  size?: 'sm' | 'md'
  isSingleResource?: boolean
}) {
  if (event.type == 'comment') {
    return event.comment ? (
      <div className={stylex.props(styles.s2ad4933).className || ''}>
        <CommentContent comment={event.comment} size={size} />
      </div>
    ) : null
  }
  if (event.type == 'citation') {
    // Render comment content for comment citations
    if (event.citationType === 'c' && event.comment) {
      return (
        <div className={stylex.props(styles.s2ad4933).className || ''}>
          <CommentContent comment={event.comment} size={size} />
        </div>
      )
    }

    // For document citations, show source block or document info
    if (event.citationType === 'd' && event.source.id && event.target.id) {
      // If we have a blockRef, render the actual block content
      if (event.source.id.blockRef) {
        return (
          <div className={stylex.props(styles.see106aa0).className || ''}>
            <CitationSourceBlock sourceId={event.source.id} />
          </div>
        )
      }

      // Otherwise, show source and target document info
      return (
        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <div className={stylex.props(styles.sfbc6e28d).className || ''}>
            <span className={stylex.props(styles.sa56e9200).className || ''}>Source Document:</span>
            <div className={stylex.props(styles.sab7cc6fa).className || ''}>
              <ResourceToken id={event.source.id} metadata={event.source.metadata} />
            </div>
          </div>
          <div className={stylex.props(styles.sfbc6e28d).className || ''}>
            <span className={stylex.props(styles.sa56e9200).className || ''}>Target Document:</span>
            <div className={stylex.props(styles.sab7cc6fa).className || ''}>
              <ResourceToken id={event.target.id} metadata={event.target.metadata} />
              {event.targetFragment && (
                <span className={stylex.props(styles.s4b944b9).className || ''}>(Block: {event.targetFragment})</span>
              )}
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  if (event.type == 'capability') return null
  // return (
  //   <div>
  //     <p>capability</p>
  //     <p className="text-xs text-muted-foreground">{JSON.stringify(event)}</p>
  //   </div>
  // )

  if (event.type == 'doc-update') {
    if (isSingleResource) return null
    // Use the versioned docId for proper navigation
    // Reconstruct the ID properly using hmId to ensure the id field is the base ID
    const versionedDocId = hmId(event.docId.uid, {
      path: event.docId.path,
      version: event.document.version,
    })
    return (
      <DocumentCard
        docId={versionedDocId}
        entity={{
          id: versionedDocId,
          document: event.document,
        }}
        accountsMetadata={event.author ? ([event.author] as any) : []}
      />
    )
  }
  if (event.type == 'contact') {
    // TODO: show contact card?
    return null
    // return (
    //   <div>
    //     <p>contact</p>
    //     <p className="text-xs text-muted-foreground">{JSON.stringify(event)}</p>
    //   </div>
    // )
  }
  return null
}
function EventCommentWithReply({
  event,
  route,
  targetDomain,
  isSingleResource,
  size,
  latestDocUpdateVersion,
}: {
  event: LoadedCommentEvent
  route: NavRoute | null
  targetDomain?: string
  isSingleResource?: boolean
  size?: 'sm' | 'md'
  latestDocUpdateVersion?: string | null
}) {
  const linkProps = useRouteLink(route)
  const tx = useTx()
  return (
    <div
      key={`${event.type}-${event.id}-${event.time}`}
      className={cn(
        stylex.props(styles_5.s68b465f8, styles_5.s34b1af, styles_5.s34b56e, styles_5.sf7fb00e8).className || '',
        stylex.props(styles_7.s20a3e675).className || '',
        'group',
      )}
      {...(route ? linkProps : {})}
    >
      {/* replying comment */}
      <div
        className={cn(
          stylex.props(styles.s783f19f3).className || '',
          stylex.props(styles_5.sdef3facc).className || '',
          stylex.props(
            styles_6.s48bb0432,
            styles_6.s41e96d2,
            styles_6.s41e78ca,
            styles_6.s8e0df312,
            styles_6.s97216324,
            styles_6.s6ad686a4,
            styles_6.s5494a8fc,
            styles_6.s5b46eb46,
            styles_6.sa30d0915,
          ).className || '',
        )}
      >
        <div className={stylex.props(styles.se99caec9).className || ''}>
          <div className={cn(stylex.props(styles_4.s69314a36).className || '')} />
          <div className={stylex.props(styles_4.sa3de5f9f).className || ''}>
            {event.replyParentAuthor?.id ? (
              <HMIcon
                size={18}
                id={event.replyParentAuthor.id}
                name={event.replyParentAuthor.metadata?.name}
                icon={event.replyParentAuthor.metadata?.icon}
              />
            ) : null}
          </div>
          <div
            className={
              stylex.props(
                styles_5.s2ffff9,
                styles_5.scdbaf625,
                styles_5.sc6ed1702,
                styles_5.sc1a629cb,
                styles_5.s5d936fb,
              ).className || ''
            }
          >
            <p className={stylex.props(styles_4.sb30c9c28).className || ''}>
              <AuthorNameLink author={event.replyParentAuthor} />{' '}
              <span className={stylex.props(styles_4.sc061136a).className || ''}>
                <Timestamp time={event.replyingComment?.updateTime} />
              </span>
            </p>
          </div>
        </div>
        <div className={stylex.props(styles.s7b2a91e8).className || ''}>
          <div className={cn(stylex.props(styles_4.s346fa975).className || '')} />

          <div className={stylex.props(styles.s34b4f5fe).className || ''}>
            <EventContent
              size={'sm'}
              event={{
                ...event,
                comment: event.replyingComment,
              }}
            />
          </div>
        </div>
      </div>

      <div className={stylex.props(styles_5.s2ffff9, styles_5.s93b5f015, styles_5.s5d936fb).className || ''}>
        <div className={stylex.props(styles_4.sa3eaa5a4).className || ''}>
          {event.author?.id ? (
            <HMIcon
              size={24}
              id={event.author.id}
              name={event.author.metadata?.name}
              icon={event.author.metadata?.icon}
            />
          ) : null}
        </div>
        <EventHeaderContent
          isSingleResource={isSingleResource}
          event={event}
          targetDomain={targetDomain}
          route={route}
          latestDocUpdateVersion={latestDocUpdateVersion}
        />
      </div>
      <div className={stylex.props(styles.s7b2a91e8).className || ''}>
        <div className={cn(stylex.props(styles_4.s3447346e).className || '')} />
        <div className={stylex.props(styles.s731a65c4).className || ''}>
          <EventContent size={size} event={event} />
          <div className={stylex.props(styles.s2ad4932).className || ''}>
            <Button size="xs" className={stylex.props(styles_4.se3333c05).className || ''}>
              <ReplyArrow className={stylex.props(styles.sca3de967).className || ''} />
              {tx('Reply')}
              {event.replyCount > 0 ? ` (${event.replyCount})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to find a block by ID in the content tree
function findContentBlock(content: HMBlockNode[], blockRef: string): HMBlockNode | null {
  let block: HMBlockNode | null = null
  content.find((node) => {
    if (node.block.id === blockRef) {
      block = node
      return true
    } else if (node.children) {
      block = findContentBlock(node.children, blockRef)
      return !!block
    }
    return false
  })
  return block
}

// Component to render a source block for document citations
function CitationSourceBlock({sourceId}: {sourceId: UnpackedHypermediaId}) {
  const resource = useResource(sourceId)
  const Viewer = useReadOnlyViewer()
  if (resource.isLoading) {
    return <div className={stylex.props(styles.sa56e9200).className || ''}>Loading block…</div>
  }
  if (resource.error || !resource.data || !Viewer) {
    return null
  }
  const content =
    resource.data.type === 'document'
      ? resource.data.document?.content
      : resource.data.type === 'comment'
        ? resource.data.comment?.content
        : undefined
  if (!content || !sourceId.blockRef) {
    return null
  }
  const blockNode = findContentBlock(content, sourceId.blockRef)
  if (!blockNode) {
    return null
  }
  return <Viewer blocks={[blockNode]} resourceId={sourceId} textUnit={14} layoutUnit={16} />
}
export function getEventRoute(event: LoadedEvent): NavRoute | null {
  if (event.type == 'comment') {
    // Navigate to the full comments page with the comment focused in the main panel
    if (!event.target?.id || !event.comment) return null
    return {
      key: 'comments' as const,
      id: event.target.id,
      openComment: event.comment.id,
    }
  }
  if (event.type == 'doc-update') {
    // Navigate to the document at the version from the ref event
    // Reconstruct the ID properly using hmId to ensure the id field is the base ID
    if (!event.docId?.uid) return null
    const route: DocumentRoute = {
      key: 'document' as const,
      id: hmId(event.docId.uid, {
        path: event.docId.path,
        version: event.document.version,
        latest: false,
      }),
    }
    return route
  }
  if (event.type == 'capability') {
    // Navigate to the target document if available
    if (!event.target?.id) return null
    const route = {
      key: 'document' as const,
      id: event.target.id,
    }
    return route
  }
  if (event.type == 'contact') {
    // Navigate to the contact page
    if (!event.contact.id) return null
    const route = {
      key: 'contact' as const,
      id: event.contact.id,
    }
    return route
  }
  if (event.type == 'citation') {
    // Navigate to the target document (the document being cited)
    if (!event.source?.id) return null

    // For comment citations, open the comment in the full comments page
    if (event.citationType === 'c' && event.comment) {
      return {
        key: 'comments' as const,
        id: event.source.id,
        openComment: event.comment.id,
      }
    }

    // For document citations, navigate to the target document
    // If there's a target fragment (block ID), include it in the URL
    const route = {
      key: 'document' as const,
      id: event.source.id,
      ...(event.targetFragment && {
        fragment: event.targetFragment,
      }),
    }
    return route
  }
  return null
}
function EventItem({
  event,
  route,
  targetDomain,
  isSingleResource,
  size,
  latestDocUpdateVersion,
}: {
  event: LoadedEvent
  route: NavRoute | null
  targetDomain?: string
  isSingleResource?: boolean
  size?: 'sm' | 'md'
  latestDocUpdateVersion?: string | null
}) {
  const currentRoute = useNavRoute()
  const linkProps = useRouteLink(route ? merge({}, currentRoute, route) : currentRoute)
  const latestDocId = event.type === 'doc-update' ? latestId(event.docId) : null
  const latestResource = useResource(latestDocId)
  const latestDocument = latestResource.data?.type === 'document' ? latestResource.data.document : null
  const latestVersion = latestDocUpdateVersion ?? latestDocument?.version
  const routeId = currentRoute.key === 'document' ? currentRoute.id : null
  const isSelectedVersion =
    event.type === 'doc-update' &&
    isSelectedDocUpdateVersion(event.document.version, routeId?.version, routeId?.latest, latestVersion)
  const tx = useTx()
  return (
    <div
      className={cn(
        stylex.props(
          styles_5.s68b465f8,
          styles_5.s2ffff9,
          styles_5.s67e351ac,
          styles_5.s5d936fb,
          styles_5.s34b1af,
          styles_5.s34b570,
          styles_5.sf7fb00e8,
        ).className || '',
        stylex.props(styles_7.s20a3e675).className || '',
        'group',
        stylex.props(isSelectedVersion ? styles_4.sdab42caa : null).className || '',
      )}
      {...(route ? linkProps : {})}
    >
      <div className={stylex.props(styles.se99caec9).className || ''}>
        <div className={stylex.props(styles_4.sa3eaa5a4).className || ''}>
          {event.author?.id ? (
            <HMIcon
              size={24}
              id={event.author.id}
              name={event.author.metadata?.name}
              icon={event.author.metadata?.icon}
            />
          ) : null}
        </div>
        <EventHeaderContent
          event={event}
          targetDomain={targetDomain}
          isSingleResource={isSingleResource}
          latestDocUpdateVersion={latestDocUpdateVersion}
        />
      </div>
      {isSingleResource && event.type == 'doc-update' ? null : (
        <div className={stylex.props(styles.s7b2a91e8).className || ''}>
          <div className={cn(stylex.props(styles_4.s3447346e).className || '')} />
          <div className={stylex.props(styles.s731a65c4).className || ''}>
            <EventContent size={size} isSingleResource={isSingleResource} event={event} />
            {event.type == 'comment' || (event.type == 'citation' && event.comment) ? (
              <div className={stylex.props(styles.s2ad4932).className || ''}>
                <Button size="xs" className={stylex.props(styles_4.se3333c05).className || ''}>
                  <ReplyArrow className={stylex.props(styles.sca3de967).className || ''} />
                  {tx('Reply')}
                  {(event.type == 'comment' && event.replyCount > 0) ||
                  (event.type == 'citation' && event.replyCount !== undefined && event.replyCount > 0)
                    ? ` (${event.replyCount})`
                    : ''}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
