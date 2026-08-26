import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {type DocumentMachineEvent} from '@shm/shared/models/document-machine'
import {useAccount} from '@shm/shared/models/entity'
import {useIsHomeDraftOverride} from '@shm/shared/home-draft-context'
import {
  selectDocument,
  selectDraftId,
  selectMetadata,
  selectSaveIndicatorStatus,
  useDocumentSelector,
  useDocumentSend,
} from '@shm/shared/models/use-document-machine'
import {useUnpublishedChangeCount} from '@shm/shared/models/use-unpublished-change-count'
import {type AnyTimestamp, formattedDateMedium, formattedDateShort, normalizeDate} from '@shm/shared/utils/date'
import {Check, ChevronRight, Clock, Copy, FileDiff, Trash} from 'lucide-react'
import React, {forwardRef, useMemo, useRef, useState} from 'react'
import {Button} from './button'
import {Input} from './components/input'
import {Popover, PopoverAnchor, PopoverContent} from './components/popover'
import {copyTextToClipboard} from './copy-to-clipboard'
import {MenuItemType, OptionsDropdown} from './options-dropdown'
import {Separator} from './separator'
import {Spinner} from './spinner'
import {toast} from './toast'
import {Tooltip} from './tooltip'
import {usePopoverState} from './use-popover-state'
import {cn} from './utils'

/** Platform callbacks injected by the host (desktop or web). */
const styles = stylex.create({
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sfbc6e291: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 5)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  sbf1d6884: {
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
    fontWeight: '500',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s8e245e23: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s3566be64: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s9b0705b1: {
    marginInline: 'calc(0.25rem * -3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2.5)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s1f58c058: {
    color: 'var(--muted-foreground)',
    flex: '1',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s5bf31d46: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
  },
  sb7e18fa: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 1)',
  },
  sfc33e6c7: {
    height: 'calc(0.25rem * 11)',
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
    fontWeight: '600',
  },
  s5b9173f5: {
    height: 'calc(0.25rem * 10)',
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
  },
  sf4676641: {
    gap: 'calc(0.25rem * 1.5)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s45268f: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  sc6f2d5a5: {
    pointerEvents: 'none',
    position: 'absolute',
    right: '100%',
    marginRight: 'calc(0.25rem * 2)',
  },
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
})
export type EditingToolbarCallbacks = {
  /** Resolve the public URL where this doc is/will be available. */
  getDocumentUrl?: (docId: UnpackedHypermediaId) => string | null
  /** Confirm + perform discard. Desktop opens delete-draft dialog; web shows a simple confirm. */
  onDiscardConfirm?: (draftId: string, send: (e: DocumentMachineEvent) => void) => void
  /** Path-segment slugifier for the first-publish editable permalink. */
  slugify?: (raw: string) => string
  /** First-publish slug suggestion. */
  computeFirstPublishPath?: (parentPath: string[], title: string, draftId: string) => string[]
  /** Navigate to document versions panel. Row hidden when undefined. */
  onGoToVersions?: (docId: UnpackedHypermediaId) => void
  /**
   * Walks the editor's content for embed blocks pointing at
   * unpublished child drafts.
   */
  getUnpublishedChildCount?: () => number
  /**
   * Intercept the publish action before it reaches the document machine. Return
   * true when handled to skip the normal publish. Return false/undefined
   * to publish normally.
   */
  onPublishIntercept?: (pathOverride?: string[]) => boolean
}

/** Dark pill shown top-right while autosave is saving or just saved. */
export function SaveIndicator() {
  const status = useDocumentSelector(selectSaveIndicatorStatus)
  if (status === 'hidden') return null
  const label = status === 'saving' ? 'Saving…' : 'Saved'
  const icon =
    status === 'saving' ? (
      <Spinner className={stylex.props(styles.sca3de967).className || ''} />
    ) : (
      <Check className={stylex.props(styles.sca3de967).className || ''} />
    )
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-2 py-1 text-white sm:px-3 dark:bg-neutral-700">
      {icon}
      <span className="hidden text-xs sm:inline">{label}</span>
    </div>
  )
}
function formatRelativeTime(updateTime: AnyTimestamp): string | null {
  const date = normalizeDate(updateTime)
  if (!date) return null
  const diffSeconds = (Date.now() - date.getTime()) / 1000
  if (diffSeconds < 60) return 'just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
  if (diffSeconds < 86400 * 7) return `${Math.floor(diffSeconds / 86400)}d ago`
  return formattedDateShort(date)
}
function slugifyEditedPathSegment(raw: string, slugify: (raw: string) => string): string {
  const withoutLeadingWhitespace = raw.replace(/^\s+/, '')
  const slug = slugify(withoutLeadingWhitespace)
  if (!slug) return ''
  return /\s$/.test(withoutLeadingWhitespace) ? `${slug}-` : slug
}

/**
 * Popover body shown when the user clicks Publish.
 * Exported for testing.
 */
export function PublishPopoverBody({
  docId,
  changeCount,
  onPublish,
  onClose,
  publishDisabled,
  unpublishedChildCount = 0,
  getDocumentUrl,
  slugify,
  computeFirstPublishPath,
  onGoToVersions,
}: {
  docId: UnpackedHypermediaId
  changeCount: number
  onPublish: (pathOverride?: string[]) => void
  onClose: () => void
  publishDisabled: boolean
  /** When greater than 0, publish is blocked because the doc embeds child drafts that haven't been published yet. */
  unpublishedChildCount?: number
} & EditingToolbarCallbacks) {
  const publishedDoc = useDocumentSelector(selectDocument)
  const draftId = useDocumentSelector(selectDraftId)
  const metadata = useDocumentSelector(selectMetadata)
  const homeDraftOverride = useIsHomeDraftOverride()
  const isHomeDoc = homeDraftOverride ?? (docId.path?.length ?? 0) === 0
  const isFirstPublish = !publishedDoc?.version && !isHomeDoc
  const isPrivate = publishedDoc?.visibility === 'PRIVATE'
  const lastSeg = docId.path?.at(-1) || ''
  const isPlaceholderPath = !!draftId && lastSeg === `-${draftId}`
  const slugFromTitle = useMemo(() => {
    if (!isFirstPublish || !draftId || !isPlaceholderPath || !computeFirstPublishPath) return null
    return computeFirstPublishPath(docId.path ?? [], metadata?.name || '', draftId)
  }, [isFirstPublish, isPlaceholderPath, docId.path, metadata?.name, draftId, computeFirstPublishPath])
  const autoSlugSegment = slugFromTitle?.at(-1) ?? lastSeg
  const lastAutoSlugRef = useRef<string | null>(null)
  const [editedPathSegment, setEditedPathSegment] = useState<string | null>(null)
  const userEditedRef = useRef(false)
  if (autoSlugSegment !== lastAutoSlugRef.current) {
    lastAutoSlugRef.current = autoSlugSegment
    if (!userEditedRef.current) {
      setEditedPathSegment(autoSlugSegment)
    }
  }
  const effectivePathSegment = editedPathSegment ?? autoSlugSegment ?? ''
  const normalizedPathSegment = slugify ? slugify(effectivePathSegment) : effectivePathSegment
  const previewPath = useMemo(() => {
    if (!isFirstPublish) return docId.path
    const parent = (docId.path ?? []).slice(0, -1)
    return [...parent, normalizedPathSegment || `untitled-${draftId ?? ''}`]
  }, [isFirstPublish, docId.path, normalizedPathSegment, draftId])
  const effectiveDocId = isFirstPublish
    ? {
        ...docId,
        path: previewPath,
      }
    : docId
  const documentUrl = getDocumentUrl?.(effectiveDocId) ?? null
  const firstAuthorUid = publishedDoc?.authors?.[0]
  const authorAccount = useAccount(firstAuthorUid)
  const authorName = authorAccount.data?.metadata?.name
  const relativeTime = formatRelativeTime(publishedDoc?.updateTime)
  const absoluteTime = publishedDoc?.updateTime ? formattedDateMedium(publishedDoc.updateTime) : undefined
  return (
    <div className={stylex.props(styles.sfbc6e291).className || ''}>
      {/* URL row */}
      <div className={stylex.props(styles.sfbc6e28f).className || ''}>
        <p className={stylex.props(styles.sbf1d6884).className || ''}>Your document will be available at</p>
        {documentUrl ? (
          <div className={stylex.props(styles.s86ff3e5).className || ''}>
            <span
              className="text-muted-foreground min-w-0 flex-1 text-sm"
              style={{
                direction: 'rtl',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {documentUrl}
            </span>
            <Tooltip content="Copy URL">
              <Button
                size="icon"
                variant="ghost"
                className={stylex.props(styles.sf032ed6c).className || ''}
                onClick={() => {
                  copyTextToClipboard(documentUrl).then(() => toast.success('Copied document URL'))
                }}
              >
                <Copy size={18} />
              </Button>
            </Tooltip>
          </div>
        ) : (
          <div className={stylex.props(styles.s8e245e23).className || ''}>
            <Spinner className={stylex.props(styles.sca3de968).className || ''} />
            <span>Loading…</span>
          </div>
        )}
        {isFirstPublish && slugify && (
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <p className={stylex.props(styles.sa56e915f).className || ''}>Edit your permalink</p>
            <Input
              value={`/${effectivePathSegment}`}
              disabled={isPrivate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (isPrivate) return
                userEditedRef.current = true
                const raw = e.target.value.replace(/^\//, '')
                setEditedPathSegment(slugifyEditedPathSegment(raw, slugify))
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
                  e.stopPropagation()
                  ;(e.target as HTMLInputElement).select()
                }
              }}
              placeholder="/document-path"
              className="h-10 border-black/10 text-sm dark:border-white/20"
            />
            {isPrivate ? (
              <p className={stylex.props(styles.sa56e915f).className || ''}>
                Private document paths are generated automatically.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <Separator className="bg-black/10 dark:bg-white/10" />

      {/* Last published row — clickable only when onGoToVersions provided */}
      {!!publishedDoc?.version ? (
        onGoToVersions ? (
          <button
            type="button"
            onClick={() => {
              onClose()
              onGoToVersions(docId)
            }}
            title={absoluteTime}
            className="hover:bg-muted -mx-3 flex items-center gap-3 rounded px-3 py-2.5 text-left text-sm"
          >
            <Clock className={stylex.props(styles.s3566be64).className || ''} />
            <span className={stylex.props(styles.sb42feb5d).className || ''}>
              <span className={stylex.props(styles.sc05281e3).className || ''}>{relativeTime ?? 'Published'}</span>
              {authorName ? (
                <span className={stylex.props(styles.sf2718385).className || ''}> by {authorName}</span>
              ) : null}
            </span>
            <ChevronRight className={stylex.props(styles.s3566be64).className || ''} />
          </button>
        ) : (
          <div title={absoluteTime} className={stylex.props(styles.s9b0705b1).className || ''}>
            <Clock className={stylex.props(styles.s3566be64).className || ''} />
            <span className={stylex.props(styles.sb42feb5d).className || ''}>
              <span className={stylex.props(styles.sc05281e3).className || ''}>{relativeTime ?? 'Published'}</span>
              {authorName ? (
                <span className={stylex.props(styles.sf2718385).className || ''}> by {authorName}</span>
              ) : null}
            </span>
          </div>
        )
      ) : (
        <div className={stylex.props(styles.s9b0705b1).className || ''}>
          <Clock className={stylex.props(styles.s3566be64).className || ''} />
          <span className={stylex.props(styles.s1f58c058).className || ''}>Not yet published</span>
        </div>
      )}

      {/* Changes count row */}
      <div className={stylex.props(styles.s9b0705b1).className || ''}>
        <FileDiff className={stylex.props(styles.s3566be64).className || ''} />
        <span className={stylex.props(styles.sb42feb5d).className || ''}>
          {changeCount === 0 ? 'No changes to publish' : `${changeCount} ${changeCount === 1 ? 'change' : 'changes'}`}
        </span>
      </div>

      {unpublishedChildCount > 0 ? (
        <div className="border-warning bg-warning/10 text-warning-foreground -mx-2 rounded-md border px-4 py-3 text-sm">
          <p className={stylex.props(styles.s129e46b3).className || ''}>
            {unpublishedChildCount === 1
              ? 'This document embeds an unpublished draft.'
              : `This document embeds ${unpublishedChildCount} unpublished drafts.`}
          </p>
          <p className={stylex.props(styles.s5bf31d46).className || ''}>
            Publish {unpublishedChildCount === 1 ? 'it' : 'them'} first before publishing this document.
          </p>
        </div>
      ) : null}

      <Separator className="bg-black/10 dark:bg-white/10" />

      <div className={stylex.props(styles.sb7e18fa).className || ''}>
        <Button
          size="default"
          variant={publishDisabled ? 'ghost' : 'brand'}
          className={cn(
            stylex.props(styles.sfc33e6c7).className || '',
            publishDisabled &&
              'bg-neutral-100 text-neutral-500 hover:bg-neutral-100 disabled:opacity-100 dark:bg-neutral-800 dark:text-neutral-400',
          )}
          disabled={publishDisabled}
          onClick={() => {
            const override =
              isFirstPublish && !isPrivate && userEditedRef.current && previewPath ? previewPath : undefined
            onPublish(override)
          }}
        >
          Publish: Make it live now
        </Button>
        <Button
          size="default"
          variant="ghost"
          className={stylex.props(styles.s5b9173f5).className || ''}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
function canPublishDocument({
  changeCount,
  unpublishedChildCount,
}: {
  changeCount: number
  unpublishedChildCount: number
}) {
  return changeCount > 0 && unpublishedChildCount === 0
}

/** Trigger button for the Publish popover. */
const PublishTrigger = forwardRef<
  HTMLButtonElement,
  {
    canPublish: boolean
    onClick: (e: React.MouseEvent) => void
  }
>(({canPublish, onClick}, ref) => {
  return (
    <Button
      ref={ref}
      size="sm"
      variant={canPublish ? 'green' : 'ghost'}
      className={cn(
        stylex.props(styles.sf4676641).className || '',
        !canPublish && 'bg-neutral-100 text-neutral-500 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400',
      )}
      onClick={onClick}
    >
      <span>Publish</span>
    </Button>
  )
})
PublishTrigger.displayName = 'PublishTrigger'

/**
 * Publish button + popover + options dropdown.
 * Must be rendered inside DocumentMachineProvider.
 */
export function PublishButtonWithPopover({
  docId,
  existingMenuItems,
  unpublishedChildCount = 0,
  getDocumentUrl,
  onDiscardConfirm,
  slugify,
  computeFirstPublishPath,
  onGoToVersions,
  getUnpublishedChildCount,
  onPublishIntercept,
}: {
  docId: UnpackedHypermediaId
  existingMenuItems: MenuItemType[]
  /** When greater than 0, publish is blocked because the doc embeds child drafts that haven't been published yet. */
  unpublishedChildCount?: number
} & EditingToolbarCallbacks) {
  const draftId = useDocumentSelector(selectDraftId)
  const changeCount = useUnpublishedChangeCount()
  const effectiveUnpublishedChildCount = Math.max(unpublishedChildCount, getUnpublishedChildCount?.() ?? 0)
  const canPublish = canPublishDocument({
    changeCount,
    unpublishedChildCount: effectiveUnpublishedChildCount,
  })
  const send = useDocumentSend()
  const popoverState = usePopoverState()
  const editingTrailingItems: MenuItemType[] = []
  if (draftId) {
    editingTrailingItems.push({
      key: 'discard-changes',
      label: 'Discard Changes',
      icon: <Trash className={stylex.props(styles.sca3de968).className || ''} />,
      variant: 'destructive' as const,
      onClick: () => {
        if (onDiscardConfirm) {
          onDiscardConfirm(draftId, send)
        } else {
          send({
            type: 'edit.discard',
          })
        }
      },
    })
  }
  const allItems = [...existingMenuItems, ...editingTrailingItems]
  const publishNow = (pathOverride?: string[]) => {
    if (!canPublish) return
    popoverState.onOpenChange(false)
    // Signed-out drafts hand off to account creation instead of publishing directly.
    if (onPublishIntercept?.(pathOverride)) return
    send({
      type: 'edit.start',
    })
    send({
      type: 'publish.start',
      pathOverride,
    })
  }
  const handlePublishTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const livePeekAtClick = getUnpublishedChildCount?.() ?? 0
    if (livePeekAtClick > 0 || !canPublish) {
      popoverState.onOpenChange(true)
      return
    }
    popoverState.onOpenChange(!popoverState.open)
  }
  return (
    <div className={stylex.props(styles.s86ff3e4).className || ''}>
      <Popover open={popoverState.open} onOpenChange={popoverState.onOpenChange}>
        <PopoverAnchor asChild>
          <PublishTrigger canPublish={canPublish} onClick={handlePublishTriggerClick} />
        </PopoverAnchor>
        <PopoverContent align="end" className="w-[26rem] max-w-[calc(100vw-2rem)] p-6">
          <PublishPopoverBody
            docId={docId}
            changeCount={changeCount}
            onPublish={publishNow}
            onClose={() => popoverState.onOpenChange(false)}
            publishDisabled={!canPublish}
            unpublishedChildCount={effectiveUnpublishedChildCount}
            getDocumentUrl={getDocumentUrl}
            slugify={slugify}
            computeFirstPublishPath={computeFirstPublishPath}
            onGoToVersions={onGoToVersions}
          />
        </PopoverContent>
      </Popover>
      <OptionsDropdown menuItems={allItems} align="end" side="bottom" />
    </div>
  )
}

/**
 * Combined right-actions for DocumentTools when editing.
 * Must be rendered inside DocumentMachineProvider.
 */
export function EditingDocToolsRight({
  docId,
  existingMenuItems,
  unpublishedChildCount,
  ...callbacks
}: {
  docId: UnpackedHypermediaId
  existingMenuItems: MenuItemType[]
  unpublishedChildCount?: number
} & EditingToolbarCallbacks) {
  return (
    <div className={stylex.props(styles.s45268f).className || ''}>
      <div className={stylex.props(styles.sc6f2d5a5).className || ''}>
        <SaveIndicator />
      </div>
      <PublishButtonWithPopover
        docId={docId}
        existingMenuItems={existingMenuItems}
        unpublishedChildCount={unpublishedChildCount}
        {...callbacks}
      />
    </div>
  )
}

/**
 * Slim toolbar shown when a draft exists but not actively editing.
 * Must be rendered inside DocumentMachineProvider.
 */
export function DraftActionsToolbar({
  docId,
  existingMenuItems,
  unpublishedChildCount,
  ...callbacks
}: {
  docId: UnpackedHypermediaId
  existingMenuItems: MenuItemType[]
  unpublishedChildCount?: number
} & EditingToolbarCallbacks) {
  return (
    <div className={stylex.props(styles.s86ff3e3).className || ''}>
      <PublishButtonWithPopover
        docId={docId}
        existingMenuItems={existingMenuItems}
        unpublishedChildCount={unpublishedChildCount}
        {...callbacks}
      />
    </div>
  )
}
