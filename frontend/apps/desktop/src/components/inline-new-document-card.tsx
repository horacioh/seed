import * as stylex from '@stylexjs/stylex'
import {useDeleteDraft, useUpdateDraftMetadata} from '@/models/documents'
import {client} from '@/trpc'
import {useNavigate} from '@/utils/useNavigate'
import {HMListedDraft} from '@seed-hypermedia/client/hm-types'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {invalidateQueries} from '@shm/shared/models/query-client'
import {queryKeys} from '@shm/shared/models/query-keys'
import {Button} from '@shm/ui/button'
import {DraftBadge} from '@shm/ui/draft-badge'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {toast} from '@shm/ui/toast'
import {ImageIcon, MoreVertical, Pencil, Trash2} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
const styles = stylex.create({
  s6e8f8a6d: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 12)',
    height: 'calc(0.25rem * 12)',
    opacity: '30%',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s2f003150: {
    marginTop: 'calc(0.25rem * 2)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s8c232eb7: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: 'calc(0.25rem * 3)',
    paddingRight: 'calc(0.25rem * 2)',
    paddingLeft: 'calc(0.25rem * 4)',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function InlineNewDocumentCard({draft, autoFocus}: {draft: HMListedDraft; autoFocus?: boolean}) {
  const navigate = useNavigate()
  const deleteDraft = useDeleteDraft()
  const updateMetadata = useUpdateDraftMetadata()
  const [title, setTitle] = useState(draft.metadata?.name || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Sync external changes
  useEffect(() => {
    setTitle(draft.metadata?.name || '')
  }, [draft.metadata?.name])
  const saveName = useCallback(
    (name: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        updateMetadata.mutate(
          {
            draftId: draft.id,
            metadata: {
              name,
            },
          },
          {
            onError: () => {
              toast.error('Failed to save draft title')
            },
          },
        )
      }, 500)
    },
    [draft.id, updateMetadata],
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])
  const openDraft = useCallback(async () => {
    // Cancel any pending debounced save to prevent duplicate mutations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = undefined
    }

    // The draft is already at parent + `-${draftId}` (set by useCreateInlineDraft).
    // For older drafts created before that change (location-only, no editUid),
    // backfill the edit path so the unified editor can find them.
    let editUid = draft.editUid ?? draft.locationUid
    let editPath = draft.editPath?.length ? draft.editPath : [...(draft.locationPath ?? []), `-${draft.id}`]
    if (!editUid) {
      toast.error('Cannot open draft: missing target location')
      return
    }
    try {
      const fullDraft = await client.drafts.get.query(draft.id)
      if (!fullDraft) throw new Error(`Draft ${draft.id} not found`)
      const needsBackfill = !fullDraft.editUid || !fullDraft.editPath?.length
      await client.drafts.write.mutate({
        id: fullDraft.id,
        editUid,
        editPath,
        locationUid: fullDraft.locationUid ?? editUid,
        locationPath: fullDraft.locationPath ?? editPath.slice(0, -1),
        metadata: {
          ...fullDraft.metadata,
          name: title,
        },
        content: fullDraft.content,
        deps: fullDraft.deps,
        navigation: fullDraft.navigation,
        visibility: fullDraft.visibility,
      })
      if (needsBackfill) {
        invalidateQueries([queryKeys.DRAFTS_LIST_ACCOUNT, editUid])
      }
      invalidateQueries([queryKeys.DRAFT, draft.id])
      invalidateQueries([queryKeys.DRAFTS_LIST])
    } catch (err) {
      console.error('Failed to save draft title before navigating:', err)
      // Fall through and navigate anyway — the unified editor will use whatever's on disk.
    }
    navigate({
      key: 'document',
      id: hmId(editUid, {
        path: editPath,
      }),
    })
  }, [navigate, draft, title])
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    saveName(val)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      openDraft()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      inputRef.current?.blur()
    }
  }
  return (
    <div className="@container flex min-h-[200px] flex-1 overflow-hidden rounded-lg border-2 border-dashed border-yellow-400/50 bg-white shadow-sm transition-colors duration-300 dark:bg-black">
      <div className="flex max-w-full flex-1 flex-col @md:flex-row">
        {/* Image placeholder */}
        <div
          className="relative flex h-40 w-full shrink-0 cursor-pointer items-center justify-center bg-gray-50 @md:h-auto @md:w-1/2 dark:bg-gray-900"
          onClick={openDraft}
        >
          <ImageIcon className={stylex.props(styles.s6e8f8a6d).className || ''} />
        </div>
        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col justify-between">
          <div className={stylex.props(styles.s1aa17).className || ''}>
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleKeyDown}
                placeholder="Untitled document"
                className="text-foreground block w-full border-none bg-transparent font-sans text-lg leading-tight font-bold outline-none placeholder:text-gray-400"
              />
            </div>
            <div className={stylex.props(styles.s2f003150).className || ''}>
              <DraftBadge />
            </div>
          </div>
          <div className={stylex.props(styles.s8c232eb7).className || ''}>
            <Button
              variant="ghost"
              size="sm"
              onClick={openDraft}
              className={stylex.props(styles.s5d936fa).className || ''}
            >
              <Pencil className={stylex.props(styles.sca3de967).className || ''} />
              Edit
            </Button>
            <OptionsDropdown
              align="end"
              button={
                <Button variant="ghost" size="iconSm" aria-label="Draft options">
                  <MoreVertical className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
              }
              menuItems={[
                {
                  key: 'open',
                  label: 'Open Draft',
                  icon: <Pencil className={stylex.props(styles.sca3de968).className || ''} />,
                  onClick: openDraft,
                },
                {
                  key: 'delete',
                  label: 'Delete Draft',
                  icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
                  variant: 'destructive',
                  onClick: () => deleteDraft.mutate(draft.id),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
