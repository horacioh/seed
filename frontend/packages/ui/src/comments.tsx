import * as stylex from '@stylexjs/stylex'
import {AlertDialogDescription, AlertDialogTitle} from '@radix-ui/react-alert-dialog'
import {
  BlockRange,
  HMBlockNode,
  HMComment,
  HMCommentGroup,
  HMDocument,
  HMExternalCommentGroup,
  HMMetadata,
  HMMetadataPayload,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {
  commentIdToHmId,
  formattedDateShort,
  getCommentTargetId,
  hmId,
  NavRoute,
  useCommentGroups,
  useCommentParents,
  useRouteLink,
  useUniversalAppContext,
} from '@shm/shared'
import {HMListDiscussionsOutput} from '@seed-hypermedia/client/hm-types'
import {
  useCommentsServiceContext,
  useDeleteComment,
  useHackyAuthorsSubscriptions,
  useUpdateComment,
} from '@shm/shared/comments-service-provider'
import {
  useBlockDiscussions,
  useCommentReplyCount,
  useCommentVersions,
  useDocumentComments,
  useDocumentDiscussions,
} from '@shm/shared/models/comments'
import {useIsCurrentUser, useResource} from '@shm/shared/models/entity'
import {useReadOnlyViewer} from '@shm/shared/readonly-viewer-context'
import {getRoutePanel} from '@shm/shared/routes'
import {useTxString} from '@shm/shared/translation'
import {useNavigate, useNavRoute} from '@shm/shared/utils/navigation'
import {Link, MessageSquare, Pencil, Trash2, X} from 'lucide-react'
import {memo, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {SelectionContent} from './accessories'
import {getBlockNodeById} from './blocks-content-utils'
import {Button} from './button'
import {Popover, PopoverContent, PopoverTrigger} from './components/popover'
import {HMIcon} from './hm-icon'
import {BlockQuote, ReplyArrow} from './icons'
import {AuthorNameLink, getContextualProfileRoute, InlineDescriptor, Timestamp} from './inline-descriptor'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {Spinner} from './spinner'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {useAppDialog} from './universal-dialog'
import {useCopyHmLink} from './use-copy-hm-link'
import {cn} from './utils'
const styles = stylex.create({
  sad7857bb: {
    backgroundColor: 'var(--border)',
    position: 'absolute',
    width: '1px',
  },
  s5de8cc86: {
    paddingInline: 'calc(0.25rem * 2)',
    paddingRight: 'calc(0.25rem * 4)',
    paddingLeft: 'calc(0.25rem * 3)',
  },
  scd65e4a1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 4)',
  },
  se295dce0: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 4)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  saa9e18d4: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s7026dbc7: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s333fddbc: {
    paddingInline: 'calc(0.25rem * 2)',
    paddingRight: 'calc(0.25rem * 4)',
  },
  sd6ede4bd: {
    marginTop: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 2)',
  },
  s193c542f: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s3811bb5f: {
    position: 'absolute',
    top: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    zIndex: '2',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'transparent',
    transitionProperty: 'all',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '200ms',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  s413c077e: {
    backgroundColor: 'var(--border)',
    height: '100%',
    width: '1px',
  },
  sda0311b5: {
    display: 'flex',
    width: '100%',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sb96da299: {
    display: 'inline',
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
  sd5589519: {
    marginLeft: 'calc(0.25rem * -1)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s8694781e: {
    position: 'relative',
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 2)',
    transitionProperty: 'all',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '200ms',
  },
  s91eacb54: {
    flexShrink: '0',
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s86442bb7: {
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '700',
  },
  sf6cf9d64: {
    width: 'calc(0.25rem * 72)',
    padding: 'calc(0.25rem * 0)',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  sf9671454: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  s3e28d4cf: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s318ac90b: {
    paddingInline: 'calc(0.25rem * 1)',
    paddingBottom: 'calc(0.25rem * 2)',
  },
  s9994dffa: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  se2c17d64: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
  },
  sfcb32917: {
    width: 'calc(0.25rem * 25)',
    height: 'calc(0.25rem * 25)',
    color: 'oklch(92.8% 0.006 264.531)',
  },
})
export function CommentDiscussions({
  targetId,
  isEntirelyHighlighted = false,
  commentId,
  commentEditor,
  targetDomain,
  selection,
}: {
  targetId: UnpackedHypermediaId
  commentId?: string
  commentEditor?: ReactNode
  onStartDiscussion?: () => void
  isEntirelyHighlighted?: boolean
  targetDomain?: string
  selection?: {
    blockId?: string
    blockRange?: BlockRange
  }
}) {
  const focusedCommentRef = useRef<HTMLDivElement>(null)
  const [showParents, setShowParents] = useState(false)
  const parentsRef = useRef<HTMLDivElement>(null)

  // Fetch all comments for the document
  const commentsService = useDocumentComments(targetId)
  const parentThread = useCommentParents(commentsService.data?.comments, commentId ?? '')
  const commentGroupReplies = useCommentGroups(commentsService.data?.comments, commentId)

  // Subscribe to all authors in this discussion
  const allAuthorIds = useMemo(() => {
    const authors = new Set<string>()
    if (parentThread?.thread) {
      parentThread.thread.forEach((c) => {
        if (c.author) authors.add(c.author)
      })
    }
    if (commentGroupReplies.data) {
      commentGroupReplies.data.forEach((cg) => {
        cg.comments.forEach((c) => {
          if (c.author) authors.add(c.author)
        })
      })
    }
    return Array.from(authors)
  }, [parentThread?.thread, commentGroupReplies.data])
  useHackyAuthorsSubscriptions(allAuthorIds)
  const {showDeletedContent} = useCommentsServiceContext()
  const commentResource = useResource(commentId ? commentIdToHmId(commentId) : null, {
    subscribed: true,
  })

  // Find the actual focused comment
  const focusedComment = useMemo(() => {
    const listedComment = commentsService.data?.comments?.find((c) => c.id === commentId)
    if (listedComment) return listedComment
    if (commentResource.data?.type === 'comment') return commentResource.data.comment
    return null
  }, [commentsService.data?.comments, commentId, commentResource.data])
  const isDeletedComment = !focusedComment && commentResource.data?.type === 'tombstone'

  // On desktop, fetch version history for deleted comments so we can show their content
  const deletedVersions = useCommentVersions(showDeletedContent && isDeletedComment ? commentId : null)
  const deletedLastVersion = deletedVersions.data?.versions?.[0]
  // Wait for the resource query to fully settle before deciding deleted/not-found, so we don't
  // flash "This comment was deleted." while peer sync is still in flight (issue #435).
  const isFocusedCommentLoading =
    commentResource.isFetching ||
    commentResource.isLoading ||
    commentResource.isDiscovering ||
    (!commentResource.data && !commentResource.error)
  const isFocusedCommentDeleted = commentResource.data?.type === 'tombstone'
  const showDeletedPreview = !!showDeletedContent && isFocusedCommentDeleted && !!deletedLastVersion
  const showDeletedPreviewLoading = !!showDeletedContent && isFocusedCommentDeleted && deletedVersions.isLoading

  // Render parent thread after initial load and adjust scroll
  useLayoutEffect(() => {
    // Only run once when we have parent thread data and haven't shown parents yet
    if (!parentThread?.thread?.length || showParents) return

    // Delay to ensure focused comment is rendered first
    const timer = setTimeout(() => {
      setShowParents(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [parentThread?.thread, showParents, commentId]) // Added commentId as dependency

  useLayoutEffect(() => {
    if (!showParents) return
    focusedCommentRef.current?.scrollIntoView({
      behavior: 'instant',
      block: 'start',
    })
  }, [showParents, commentId])
  const commentEditorSlot = commentEditor ? (
    <div className="relative max-h-1/2 py-4">
      <div
        className={stylex.props(styles.sad7857bb).className || ''}
        style={{
          height: isEntirelyHighlighted ? 40 : 56,
          top: isEntirelyHighlighted ? -16 : -32,
          left: 26,
        }}
      />
      <div className={stylex.props(styles.s5de8cc86).className || ''}>{commentEditor}</div>
    </div>
  ) : null
  if (!commentId) return null
  if (commentsService.error) {
    return (
      <SelectionContent>
        <div className={stylex.props(styles.scd65e4a1).className || ''}>
          <SizableText color="muted" size="sm">
            Failed to load comment thread
          </SizableText>
        </div>
        {commentEditorSlot}
      </SelectionContent>
    )
  }
  if (commentsService.isLoading && !commentsService.data) {
    return (
      <SelectionContent>
        <div className={stylex.props(styles.se295dce0).className || ''}>
          <Spinner />
        </div>
        {commentEditorSlot}
      </SelectionContent>
    )
  }
  if (showDeletedPreview) {
    return (
      <SelectionContent>
        <div className={stylex.props(styles.s1aa15).className || ''}>
          <DeletedCommentPreview comment={deletedLastVersion!} />
        </div>
        {commentEditorSlot}
      </SelectionContent>
    )
  }
  if (showDeletedPreviewLoading || isFocusedCommentLoading) {
    return (
      <SelectionContent>
        <div className={stylex.props(styles.se295dce0).className || ''}>
          <Spinner />
        </div>
        {commentEditorSlot}
      </SelectionContent>
    )
  }
  if (!focusedComment && commentsService.data) {
    if (isFocusedCommentDeleted) {
      return (
        <SelectionContent>
          <div className={stylex.props(styles.scd65e4a1).className || ''}>
            <SizableText color="muted" size="sm">
              This comment was deleted.
            </SizableText>
          </div>
          {commentEditorSlot}
        </SelectionContent>
      )
    }
    return (
      <SelectionContent>
        <div className={stylex.props(styles.scd65e4a1).className || ''}>
          <SizableText color="muted" size="sm">
            This comment could not be found.
          </SizableText>
        </div>
        {commentEditorSlot}
      </SelectionContent>
    )
  }

  // Check if there are actual parent comments (more than just the focused comment itself)
  const hasParents = parentThread?.thread && parentThread.thread.length > 1
  return (
    <SelectionContent>
      {/* Render parent thread above focused comment when ready */}
      {hasParents && showParents && (
        <div ref={parentsRef}>
          {parentThread.thread.slice(0, -1).map((comment, index, list) => (
            <div
              key={comment.id}
              className={cn(
                stylex.props(styles.s1aa15).className || '',
                index != list.length - 1 && 'border-border border-b',
              )}
            >
              <Comment
                comment={comment}
                authorId={comment.author}
                authorMetadata={commentsService.data?.authors?.[comment.author]?.metadata}
                targetDomain={targetDomain}
                isFirst={index === 0}
                isLast={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Render the focused comment */}
      {focusedComment && (
        <div ref={focusedCommentRef} className={cn(stylex.props(styles.s1aa15).className || '')}>
          <Comment
            comment={focusedComment}
            authorId={focusedComment.author}
            authorMetadata={commentsService.data?.authors?.[focusedComment.author]?.metadata}
            targetDomain={targetDomain}
            isFirst={!(hasParents && showParents)}
            isLast={true}
            highlight
            selection={selection}
          />
        </div>
      )}

      {commentEditorSlot}

      {commentGroupReplies.data?.length > 0
        ? commentGroupReplies.data.map((cg) => {
            return (
              <div key={cg.id} className={cn(stylex.props(styles.s1aa15).className || '')}>
                <CommentGroup
                  key={cg.id}
                  commentGroup={cg}
                  authors={commentsService.data?.authors}
                  targetDomain={targetDomain}
                />
              </div>
            )
          })
        : null}
    </SelectionContent>
  )
}
export const Discussions = memo(function Discussions({
  targetId,
  commentId,
  targetDomain,
}: {
  targetId: UnpackedHypermediaId
  commentId?: string
  targetDomain?: string
}) {
  const discussionsService = useDocumentDiscussions(targetId, commentId)

  // Subscribe to all authors in discussions
  const allAuthorIds = useMemo(() => {
    const authors = new Set<string>()
    if (discussionsService.data?.discussions) {
      discussionsService.data.discussions.forEach((cg) => {
        cg.comments.forEach((c) => {
          if (c.author) authors.add(c.author)
        })
      })
    }
    if (discussionsService.data?.citingDiscussions) {
      discussionsService.data.citingDiscussions.forEach((cg) => {
        cg.comments.forEach((c) => {
          if (c.author) authors.add(c.author)
        })
      })
    }
    return Array.from(authors)
  }, [discussionsService.data?.discussions, discussionsService.data?.citingDiscussions])
  useHackyAuthorsSubscriptions(allAuthorIds)
  let panelContent = null
  if (discussionsService.isLoading && !discussionsService.data) {
    panelContent = (
      <div className={stylex.props(styles.s9a378369).className || ''}>
        <Spinner />
      </div>
    )
  } else if (discussionsService.error) {
    panelContent = (
      <div className={stylex.props(styles.scd65e4a1).className || ''}>
        <SizableText color="muted" size="sm" className={stylex.props(styles.sa1762f51).className || ''}>
          Failed to load discussions
        </SizableText>
      </div>
    )
  } else if (discussionsService.data) {
    const totalCount =
      (discussionsService.data.discussions?.length ?? 0) + (discussionsService.data.citingDiscussions?.length ?? 0)
    panelContent =
      totalCount > 0 ? (
        <>
          {discussionsService.data.discussions?.map((cg) => {
            return (
              <div key={cg.id} className={cn(stylex.props(styles.saa9e18d4).className || '')}>
                <LazyCommentGroup>
                  <CommentGroup
                    commentGroup={cg}
                    authors={discussionsService.data.authors}
                    enableReplies
                    targetDomain={targetDomain}
                  />
                </LazyCommentGroup>
              </div>
            )
          })}
          {discussionsService.data.citingDiscussions?.map((cg) => {
            return (
              <div key={cg.id} className={cn(stylex.props(styles.saa9e18d4).className || '')}>
                <LazyCommentGroup>
                  <CommentGroup
                    commentGroup={cg}
                    authors={discussionsService.data.authors}
                    enableReplies
                    targetDomain={targetDomain}
                  />
                </LazyCommentGroup>
              </div>
            )
          })}
        </>
      ) : (
        <NoComments />
      )
  }
  return <SelectionContent>{panelContent}</SelectionContent>
})
export function BlockDiscussions({
  targetId,
  commentEditor,
  targetDomain,
  blockRange,
}: {
  targetId: UnpackedHypermediaId
  commentEditor?: ReactNode
  targetDomain?: string
  /** Optional codepoint range within `targetId.blockRef` to visually highlight inside the quoted block. */
  blockRange?: BlockRange
}) {
  const commentsService = useBlockDiscussions(targetId)
  const doc = useResource(targetId)

  // Subscribe to all authors in block discussions
  const allAuthorIds = useMemo(() => {
    const authors = new Set<string>()
    if (commentsService.data?.comments) {
      commentsService.data.comments.forEach((c) => {
        if (c.author) authors.add(c.author)
      })
    }
    return Array.from(authors)
  }, [commentsService.data?.comments])
  useHackyAuthorsSubscriptions(allAuthorIds)
  let quotedContent = null
  let panelContent = null
  if (!targetId) return null
  if (targetId.blockRef && doc.data?.type == 'document' && doc.data.document) {
    quotedContent = (
      <QuotedDocBlock docId={targetId} blockId={targetId.blockRef} doc={doc.data.document} blockRange={blockRange} />
    )
  } else if (doc.isInitialLoading) {
    quotedContent = (
      <div className={stylex.props(styles.s9a378369).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (commentsService.isLoading && !commentsService.data) {
    panelContent = (
      <div className={stylex.props(styles.s7026dbc7).className || ''}>
        <Spinner />
      </div>
    )
  } else if (commentsService.error) {
    panelContent = (
      <div className={stylex.props(styles.scd65e4a1).className || ''}>
        <SizableText color="muted" size="sm">
          Failed to load block discussions
        </SizableText>
      </div>
    )
  } else if (commentsService.data && commentsService.data.comments && commentsService.data.comments.length) {
    panelContent = (
      <>
        {commentsService.data.comments.map((comment) => {
          return (
            <div key={comment.id} className={cn(stylex.props(styles.s1aa15).className || '')}>
              <Comment
                isFirst
                isLast
                key={comment.id}
                comment={comment}
                authorId={comment.author}
                authorMetadata={commentsService.data.authors[comment.author]?.metadata}
                targetDomain={targetDomain}
              />
            </div>
          )
        })}
      </>
    )
  }
  return (
    <SelectionContent>
      {quotedContent}
      <div className={stylex.props(styles.s333fddbc).className || ''}>{commentEditor}</div>
      <div className={stylex.props(styles.sd6ede4bd).className || ''}>{panelContent}</div>
    </SelectionContent>
  )
}

// this is a LINEARIZED set of comments, where one comment is directly replying to another. the commentGroup.moreCommentsCount should be the number of replies to the last comment in the group.
const LAZY_COMMENT_PLACEHOLDER_HEIGHT = 80

/**
 * Lazy-renders children only when near the viewport using IntersectionObserver.
 * Unmounts children when scrolled far away to keep memory low.
 * Preserves measured height as placeholder to prevent scroll jumps.
 */
function LazyCommentGroup({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)
  const heightRef = useRef(LAZY_COMMENT_PLACEHOLDER_HEIGHT)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setIsNearViewport(true)
        } else {
          if (el.offsetHeight > 0) {
            heightRef.current = el.offsetHeight
          }
          setIsNearViewport(false)
        }
      },
      {
        rootMargin: '600px',
      },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={
        isNearViewport
          ? undefined
          : {
              minHeight: heightRef.current,
            }
      }
    >
      {isNearViewport ? children : null}
    </div>
  )
}
export const CommentGroup = memo(function CommentGroup({
  commentGroup,
  authors,
  enableReplies = true,
  highlightLastComment = false,
  targetDomain,
}: {
  commentGroup: HMCommentGroup | HMExternalCommentGroup
  authors?: HMListDiscussionsOutput['authors']
  enableReplies?: boolean
  highlightLastComment?: boolean
  targetDomain?: string
}) {
  const lastComment = commentGroup.comments.at(-1)
  const firstComment = commentGroup.comments[0]
  return (
    <div className={stylex.props(styles.s193c542f).className || ''}>
      {/* {commentGroup.comments.length > 1 && (
        <div
          className="absolute w-px bg-border"
          style={{
            height: `calc(100% - ${avatarSize * 2}px)`,
            top: avatarSize + avatarSize / 2 - 1,
            left: avatarSize + avatarSize / 2 - 1,
          }}
        />
       )} */}

      {commentGroup.comments.map((comment) => {
        const isLastCommentInGroup = !!lastComment && comment === lastComment
        const isFirstCommentInGroup = !!lastComment && comment === firstComment
        return (
          <Comment
            isLast={isLastCommentInGroup}
            isFirst={isFirstCommentInGroup}
            externalTarget={
              isFirstCommentInGroup && commentGroup.type === 'externalCommentGroup' ? commentGroup.target : undefined
            }
            key={comment.id}
            comment={comment}
            authorMetadata={comment.author ? authors?.[comment.author]?.metadata : null}
            authorId={comment.author}
            enableReplies={enableReplies}
            highlight={highlightLastComment && isLastCommentInGroup}
            targetDomain={targetDomain}
          />
        )
      })}
    </div>
  )
})
export const Comment = memo(function Comment({
  comment,
  isFirst = true,
  isLast = false,
  authorMetadata,
  authorId,
  enableReplies = true,
  defaultExpandReplies = false,
  highlight = false,
  targetDomain,
  heading,
  externalTarget,
  selection,
}: {
  comment: HMComment
  isFirst?: boolean
  isLast?: boolean
  authorMetadata?: HMMetadata | null
  authorId?: string | null
  enableReplies?: boolean
  defaultExpandReplies?: boolean
  highlight?: boolean
  targetDomain?: string
  heading?: ReactNode
  externalTarget?: HMMetadataPayload
  selection?: {
    blockId?: string
    blockRange?: BlockRange
  }
}) {
  const tx = useTxString()
  const [showReplies, setShowReplies] = useState(defaultExpandReplies)
  const [isEditing, setIsEditing] = useState(false)
  const [viewingVersion, setViewingVersion] = useState<HMComment | null>(null)
  const commentsContext = useCommentsServiceContext()
  const {data: replyCount} = useCommentReplyCount({
    id: comment.id,
  })
  const isAuthor = useIsCurrentUser(comment.author)
  const deleteCommentMutation = useDeleteComment()
  const updateCommentMutation = useUpdateComment()
  const deleteCommentDialog = useDeleteCommentDialog()
  const currentRoute = useNavRoute()
  const authorHmId = comment.author || authorId ? hmId(authorId || comment.author) : null
  const docId = getCommentTargetId(comment)
  const authorLink = useRouteLink(getContextualProfileRoute(currentRoute, authorHmId, docId?.uid))
  const copyHmLink = useCopyHmLink()
  const {origin: appOrigin} = useUniversalAppContext()
  const externalTargetLink = useRouteLink(
    externalTarget
      ? {
          key: 'document',
          id: externalTarget.id,
        }
      : null,
  )
  useEffect(() => {
    if (defaultExpandReplies !== showReplies) {
      setShowReplies(defaultExpandReplies)
    }
  }, [defaultExpandReplies])
  const navigate = useNavigate('replace')

  // When this comment is the focused permalink comment (/:comments/UID/TSID),
  // the viewed version lives on the route (?v=) so it survives copy/paste and
  // reload. Other comments keep the version preview as local state.
  const isRouteControlledVersion = currentRoute.key === 'comments' && currentRoute.openComment === comment.id
  const routeCommentVersion =
    currentRoute.key === 'comments' && currentRoute.openComment === comment.id
      ? currentRoute.openCommentVersion
      : undefined
  const routeVersionToView =
    routeCommentVersion && routeCommentVersion !== comment.version ? routeCommentVersion : undefined
  const commentVersions = useCommentVersions(routeVersionToView ? comment.id : null)
  const routeViewingVersion = routeVersionToView
    ? commentVersions.data?.versions?.find((version) => version.version === routeVersionToView) ?? null
    : null
  const activeViewingVersion = isRouteControlledVersion ? routeViewingVersion : viewingVersion
  const selectViewingVersion = (version: HMComment | null) => {
    if (currentRoute.key === 'comments' && currentRoute.openComment === comment.id) {
      navigate({
        ...currentRoute,
        openCommentVersion: (version && version.version !== comment.version && version.version) || undefined,
      })
    } else {
      setViewingVersion(version)
    }
  }
  const options: MenuItemType[] = []
  if (isAuthor) {
    options.push({
      icon: <Pencil className={stylex.props(styles.sca3de968).className || ''} />,
      label: 'Edit',
      onClick: () => setIsEditing(true),
      key: 'edit',
    })
  }
  if (isAuthor) {
    options.push({
      icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
      label: 'Delete',
      onClick: () => {
        deleteCommentDialog.open({
          onConfirm: () => {
            // Check if we're currently focused on this comment before deleting.
            // If so, navigate back to the comments list after deletion succeeds.
            const routePanel = getRoutePanel(currentRoute)
            const isFocusedComment =
              (currentRoute.key === 'comments' && currentRoute.openComment === comment.id) ||
              (routePanel?.key === 'comments' && routePanel.openComment === comment.id)
            deleteCommentMutation.mutate(
              {
                comment,
                signingAccountId: comment.author,
              },
              {
                onSuccess: () => {
                  if (!isFocusedComment) return
                  if (currentRoute.key === 'comments' && currentRoute.openComment) {
                    navigate({
                      ...currentRoute,
                      openComment: undefined,
                      openCommentVersion: undefined,
                    })
                  } else if ('panel' in currentRoute && routePanel?.key === 'comments' && routePanel.openComment) {
                    navigate({
                      ...currentRoute,
                      panel: {
                        ...routePanel,
                        openComment: undefined,
                      },
                    } as NavRoute)
                  }
                },
              },
            )
          },
        })
      },
      key: 'delete',
    })
  }
  const isEntirelyHighlighted = highlight && !selection
  return (
    <>
      {deleteCommentDialog.content}
      <div className={cn('group relative flex gap-1 rounded-lg p-2', isEntirelyHighlighted && 'bg-accent')}>
        {heading ? null : (
          <div className="relative mt-0.5 flex min-w-5 flex-col items-center">
            {isFirst ? null : <div className="bg-border absolute top-[-40px] left-1/2 h-[40px] w-px" />}
            <div
              className={cn(
                stylex.props(styles.s3811bb5f).className || '',
                isEntirelyHighlighted
                  ? 'outline-secondary hover:outline-secondary'
                  : 'dark:outline-background dark:hover:outline-background outline-white hover:outline-white',
              )}
              {...authorLink}
            />
            {authorHmId && (
              <div className={stylex.props(styles.sca3de969).className || ''}>
                <HMIcon id={authorHmId} name={authorMetadata?.name} icon={authorMetadata?.icon} size={20} />
              </div>
            )}
            {!isLast || (highlight && selection?.blockId) ? (
              <div className={stylex.props(styles.s413c077e).className || ''} />
            ) : null}
          </div>
        )}

        <div className={stylex.props(styles.sda0311b5).className || ''}>
          <div className="group flex items-center justify-between gap-2 overflow-hidden pr-2">
            {heading ? (
              <div className={stylex.props(styles.sb96da299).className || ''}>{heading}</div>
            ) : (
              <InlineDescriptor>
                {authorHmId ? (
                  <AuthorNameLink
                    author={{
                      id: authorHmId,
                      metadata: authorMetadata ?? undefined,
                    }}
                    siteUid={docId?.uid}
                  />
                ) : (
                  <span>Someone</span>
                )}{' '}
                {externalTarget ? (
                  <>
                    <span>on</span>{' '}
                    <button
                      {...externalTargetLink}
                      className="hover:bg-accent text-foreground h-5 truncate rounded px-1 text-sm font-bold transition-colors"
                    >
                      {externalTarget.metadata?.name}
                    </button>
                  </>
                ) : null}
                <CommentDate comment={comment} />
                {JSON.stringify(comment.createTime) !== JSON.stringify(comment.updateTime) ? (
                  <EditedIndicator commentId={comment.id} onSelectVersion={selectViewingVersion} />
                ) : null}
              </InlineDescriptor>
            )}
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              {!isEditing && (
                <Tooltip content={tx('Copy Comment Link')}>
                  <Button
                    // size="icon"
                    size="xs"
                    variant="ghost"
                    className="text-muted-foreground hover-hover:opacity-0 hover-hover:group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                    onClick={() => {
                      if (!docId) return
                      const routeLatest =
                        currentRoute.key === 'document' ||
                        currentRoute.key === 'comments' ||
                        currentRoute.key === 'activity'
                          ? currentRoute.id.latest
                          : undefined
                      copyHmLink({
                        id: {
                          ...docId,
                          hostname: targetDomain ?? null,
                          latest: routeLatest ?? null,
                        },
                        commentId: commentIdToHmId(comment.id),
                        gatewayUrl: appOrigin ?? undefined,
                      })
                    }}
                  >
                    <Link className={stylex.props(styles.sca3de967).className || ''} />
                  </Button>
                </Tooltip>
              )}
              {!isEditing && options.length > 0 ? (
                <OptionsDropdown
                  side="bottom"
                  size="xs"
                  align="end"
                  className="hover-hover:opacity-0 hover-hover:group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
                  menuItems={options}
                />
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <InlineCommentEditor
              comment={comment}
              onCancel={() => setIsEditing(false)}
              onSave={(newContent) => {
                updateCommentMutation.mutate(
                  {
                    comment,
                    newContent,
                    signingAccountId: comment.author,
                  },
                  {
                    onSuccess: () => setIsEditing(false),
                  },
                )
              }}
              isSaving={updateCommentMutation.isPending}
            />
          ) : activeViewingVersion ? (
            <VersionPreview version={activeViewingVersion} onDismiss={() => selectViewingVersion(null)} />
          ) : (
            <CommentContent comment={comment} selection={selection} />
          )}

          {!isEntirelyHighlighted && !isEditing && (
            <div className={cn(stylex.props(styles.sd5589519).className || '', !heading && 'mb-2')}>
              {enableReplies || commentsContext.onReplyClick ? (
                <Button
                  variant="ghost"
                  size="xs"
                  className={cn(
                    'text-muted-foreground hover:text-muted-foreground active:text-muted-foreground',
                    'plausible-event-name=Reply+Click',
                  )}
                  onClick={() => {
                    if (commentsContext.onReplyClick) {
                      commentsContext.onReplyClick(comment)
                    } else if (replyCount && commentsContext.onReplyCountClick) {
                      commentsContext.onReplyCountClick(comment)
                    }
                  }}
                >
                  <ReplyArrow className={stylex.props(styles.sca3de967).className || ''} />
                  {tx('Reply')}
                  {replyCount && replyCount > 0 ? ` (${replyCount})` : ''}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  )
})
export function CommentContent({
  comment,
  size,
  zoomBlockRef,
  selection,
  resourceId,
}: {
  comment: HMComment
  size?: 'sm' | 'md'
  zoomBlockRef?: string | null
  zoomBlockRange?: BlockRange | null
  selection?: {
    blockId?: string
    blockRange?: BlockRange
  }
  allowHighlight?: boolean
  openOnClick?: boolean
  onBlockSelect?: (blockId: string, blockRange: BlockRange | null) => void
  resourceId?: UnpackedHypermediaId
}) {
  const Viewer = useReadOnlyViewer()
  const currentRoute = useNavRoute()
  const targetHomeEntity = useResource(hmId(comment.targetAccount))
  const targetHomeDoc = targetHomeEntity.data?.type === 'document' ? targetHomeEntity.data.document : undefined
  const targetDocId = getCommentTargetId(comment)
  const siteUrl = targetHomeDoc?.metadata?.siteUrl as string | undefined
  const textUnit = size === 'sm' ? 12 : 14
  const layoutUnit = size === 'sm' ? 14 : 16
  const copyHmLink = useCopyHmLink()
  const {origin: appOrigin} = useUniversalAppContext()
  const copyBlockUrl = useCallback(
    (blockId: string, blockRange?: BlockRange | null) => {
      if (!targetDocId) return
      const routeLatest =
        currentRoute.key === 'document' || currentRoute.key === 'comments' || currentRoute.key === 'activity'
          ? currentRoute.id.latest
          : undefined
      copyHmLink({
        id: {
          ...targetDocId,
          hostname: siteUrl ?? null,
          latest: routeLatest ?? null,
          blockRef: blockId,
          blockRange: blockRange ?? null,
        },
        commentId: commentIdToHmId(comment.id),
        gatewayUrl: appOrigin ?? undefined,
      })
    },
    [targetDocId, currentRoute, comment.id, siteUrl, copyHmLink, appOrigin],
  )
  const onCopyBlockLink = useCallback((blockId: string) => copyBlockUrl(blockId), [copyBlockUrl])
  const onCopyFragmentLink = useCallback(
    (blockId: string, rangeStart: number, rangeEnd: number) =>
      copyBlockUrl(blockId, {
        start: rangeStart,
        end: rangeEnd,
      }),
    [copyBlockUrl],
  )
  const focusedId = {
    ...(resourceId || commentIdToHmId(comment.id, comment.version)),
    blockRef: selection?.blockId || null,
    blockRange: selection?.blockRange || null,
  }
  const zoomedBlock = zoomBlockRef ? getBlockNodeById(comment.content, zoomBlockRef) : null
  const zoomedContent = zoomedBlock ? [zoomedBlock] : comment.content
  if (!Viewer) return null
  return (
    <Viewer
      blocks={zoomedContent}
      resourceId={focusedId}
      resourceKind="comment"
      commentStyle
      textUnit={textUnit}
      layoutUnit={layoutUnit}
      onCopyBlockLink={onCopyBlockLink}
      onCopyFragmentLink={onCopyFragmentLink}
    />
  )
}
function CommentDate({comment}: {comment: HMComment}) {
  const targetId = getCommentTargetId(comment)
  // Same destination as "Copy Comment Link": the target document's comments
  // view focused on this comment, staying within the site context. The id
  // drops the comment's targetVersion so the URL matches the copied link.
  const destRoute: NavRoute | null = targetId
    ? {
        key: 'comments',
        id: hmId(targetId.uid, {
          path: targetId.path,
        }),
        openComment: comment.id,
      }
    : null
  return <Timestamp time={comment.createTime} route={destRoute} />
}
export function QuotedDocBlock({
  docId,
  blockId,
  doc,
  blockRange,
}: {
  docId: UnpackedHypermediaId
  blockId: string
  doc: HMDocument
  blockRange?: BlockRange
}) {
  const Viewer = useReadOnlyViewer()
  const blockContent = useMemo(() => {
    if (!doc.content) return null
    return getBlockNodeById(doc.content, blockId)
  }, [doc.content, blockId])

  // Only forward a codepoint range — `{expanded: true}` blockRange variants
  // should not trigger fragment highlighting.
  const fragmentRange = blockRange && 'start' in blockRange ? blockRange : undefined
  return (
    <div className="bg-brand-50 dark:bg-brand-950 rounded-lg">
      <div className={stylex.props(styles.s8694781e).className || ''}>
        <div className={stylex.props(styles.s91eacb54).className || ''}>
          <BlockQuote size={23} />
        </div>
        <div className="min-w-0 flex-1">
          {blockContent && Viewer && (
            <Viewer
              blocks={[blockContent]}
              resourceId={{
                ...docId,
                blockRef: blockId,
              }}
              focusBlockId={fragmentRange ? blockId : undefined}
              blockRange={fragmentRange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
export function useDeleteCommentDialog() {
  return useAppDialog(DeleteCommentDialog, {
    isAlert: true,
  })
}
function DeleteCommentDialog({
  input,
  onClose,
}: {
  input: {
    onConfirm: () => void
  }
  onClose: () => void
}) {
  return (
    <>
      <AlertDialogTitle className={stylex.props(styles.s86442bb7).className || ''}>Really Delete?</AlertDialogTitle>
      <AlertDialogDescription>
        You will publicly delete this comment, although other peers may have already archived it.
      </AlertDialogDescription>
      <Button
        variant="destructive"
        onClick={() => {
          input.onConfirm()
          onClose()
        }}
      >
        Delete Comment
      </Button>
    </>
  )
}

/** "(edited)" label with popover listing versions. Clicking a version calls onSelectVersion. */
function EditedIndicator({
  commentId,
  onSelectVersion,
}: {
  commentId: string
  onSelectVersion: (version: HMComment | null) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground ml-1 cursor-pointer text-[11px] hover:underline">(edited)</button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className={stylex.props(styles.sf6cf9d64).className || ''}>
        {open ? (
          <CommentVersionList
            commentId={commentId}
            onSelect={(version) => {
              onSelectVersion(version)
              setOpen(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

/** Popover list of comment versions. Clicking a version triggers onSelect (null for the current version). */
function CommentVersionList({commentId, onSelect}: {commentId: string; onSelect: (version: HMComment | null) => void}) {
  const {data, isLoading, error} = useCommentVersions(commentId)
  if (isLoading) {
    return (
      <div className={stylex.props(styles.se295dce0).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (error || !data?.versions?.length) {
    return (
      <div className={stylex.props(styles.s1aa17).className || ''}>
        <SizableText size="sm" color="muted">
          Could not load edit history
        </SizableText>
      </div>
    )
  }
  const editCount = data.versions.length - 1
  return (
    <div className={stylex.props(styles.s783f19f3).className || ''}>
      <div className={stylex.props(styles.sf9671454).className || ''}>
        <SizableText size="sm" className={stylex.props(styles.s62c182b1).className || ''}>
          Edited {editCount} {editCount === 1 ? 'time' : 'times'}
        </SizableText>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {data.versions.map((version, index) => {
          const versionNumber = data.versions.length - index
          const isCurrent = index === 0
          if (isCurrent) {
            return (
              <button
                key={version.version || index}
                className="hover:bg-accent border-border flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0"
                onClick={() => onSelect(null)}
              >
                <div className={stylex.props(styles.s86ff3e4).className || ''}>
                  <SizableText size="xs">Version {versionNumber}</SizableText>
                  <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] leading-none font-medium">
                    current
                  </span>
                </div>
                <SizableText size="xs" color="muted">
                  {version.updateTime ? formattedDateShort(version.updateTime) : ''}
                </SizableText>
              </button>
            )
          }
          return (
            <button
              key={version.version || index}
              className="hover:bg-accent border-border flex w-full items-center justify-between border-b px-3 py-2 text-left last:border-b-0"
              onClick={() => onSelect(version)}
            >
              <SizableText size="xs">Version {versionNumber}</SizableText>
              <SizableText size="xs" color="muted">
                {version.updateTime ? formattedDateShort(version.updateTime) : ''}
              </SizableText>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Red inline banner showing the content of a deleted comment (pre-deletion version from history). */
function DeletedCommentPreview({comment}: {comment: HMComment}) {
  return (
    <div className="rounded-md border border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950">
      <div className={stylex.props(styles.s3e28d4cf).className || ''}>
        <SizableText size="xs" className="font-sans text-red-800 dark:text-red-200">
          This comment was deleted
          {comment.updateTime ? ` · ${formattedDateShort(comment.updateTime)}` : ''}
        </SizableText>
      </div>
      <div className={stylex.props(styles.s318ac90b).className || ''}>
        <CommentContent
          comment={comment}
          size="sm"
          openOnClick={false}
          resourceId={commentIdToHmId(comment.id, comment.version)}
        />
      </div>
    </div>
  )
}

/** Yellow inline banner showing a previous version of the comment in place of the current content. */
function VersionPreview({version, onDismiss}: {version: HMComment; onDismiss: () => void}) {
  return (
    <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950">
      <div className={stylex.props(styles.s9994dffa).className || ''}>
        <SizableText size="xs" className="font-sans text-yellow-800 dark:text-yellow-200">
          Viewing previous version {version.updateTime ? `\u00b7 ${formattedDateShort(version.updateTime)}` : ''}
        </SizableText>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-yellow-800 hover:bg-yellow-200 dark:text-yellow-200 dark:hover:bg-yellow-900"
          onClick={onDismiss}
        >
          <X className={stylex.props(styles.s3269316e).className || ''} />
        </Button>
      </div>
      <div className={stylex.props(styles.s318ac90b).className || ''}>
        <CommentContent
          comment={version}
          size="sm"
          openOnClick={false}
          resourceId={commentIdToHmId(version.id, version.version)}
        />
      </div>
    </div>
  )
}

/** Inline editor for editing an existing comment in-place. Uses context-provided renderer. */
function InlineCommentEditor({
  comment,
  onCancel,
  onSave,
  isSaving,
}: {
  comment: HMComment
  onCancel: () => void
  onSave: (content: HMBlockNode[]) => void
  isSaving: boolean
}) {
  const {renderInlineEditor} = useCommentsServiceContext()
  if (!renderInlineEditor) {
    // Fallback: show cancel button if no editor renderer is provided
    return (
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        <SizableText size="sm" color="muted" className={stylex.props(styles.sa1762f51).className || ''}>
          Inline editing is not available.
        </SizableText>
        <Button variant="ghost" size="xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    )
  }
  return renderInlineEditor({
    comment,
    onSave,
    onCancel,
    isSaving,
  })
}
function NoComments({}: {}) {
  const tx = useTxString()
  return (
    <div className={stylex.props(styles.se2c17d64).className || ''}>
      <MessageSquare className={stylex.props(styles.sfcb32917).className || ''} size={48} />
      <SizableText size="md" className={stylex.props(styles.sa1762f51).className || ''}>
        {tx('No comments here, yet!')}
      </SizableText>
    </div>
  )
}
