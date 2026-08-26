import * as stylex from '@stylexjs/stylex'
import {HMListedDraft} from '@seed-hypermedia/client/hm-types'
import {ImageIcon, MoreVertical, Forward, Pencil, Trash2} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from './button'
import {DraftBadge} from './draft-badge'
import {OptionsDropdown} from './options-dropdown'
import {cn} from './utils'
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
  s7e411b84: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBlock: 'calc(0.25rem * 3)',
    paddingRight: 'calc(0.25rem * 2)',
    paddingLeft: 'calc(0.25rem * 4)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export interface InlineDraftCardProps {
  draft: HMListedDraft
  autoFocus?: boolean
  banner?: boolean
  onOpenDraft: (draftId: string) => void
  onDeleteDraft: (draftId: string) => void
  onMoveDraft?: (draftId: string) => void
  onUpdateDraftName: (draftId: string, name: string) => void
}
export function InlineDraftCard({
  draft,
  autoFocus,
  banner,
  onOpenDraft,
  onDeleteDraft,
  onMoveDraft,
  onUpdateDraftName,
}: InlineDraftCardProps) {
  const [title, setTitle] = useState(draft.metadata?.name || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (!autoFocus || !containerRef.current) return
    containerRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [autoFocus])

  // Sync external changes
  useEffect(() => {
    setTitle(draft.metadata?.name || '')
  }, [draft.metadata?.name])
  const saveName = useCallback(
    (name: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        onUpdateDraftName(draft.id, name)
      }, 500)
    },
    [draft.id, onUpdateDraftName],
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])
  const openDraft = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = undefined
    }
    onUpdateDraftName(draft.id, title)
    onOpenDraft(draft.id)
  }, [draft.id, title, onOpenDraft, onUpdateDraftName])
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
    <div
      ref={containerRef}
      onClick={(e) => {
        e.stopPropagation()
        openDraft()
      }}
      className={cn(
        '@container flex min-h-[200px] flex-1 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-yellow-400/50 bg-white shadow-sm transition-colors duration-300 dark:bg-black',
        banner && 'rounded-xl md:min-h-[240px] lg:min-h-[280px]',
      )}
    >
      <div className="flex max-w-full flex-1 flex-col @md:flex-row">
        {/* Image placeholder */}
        <div
          className={cn(
            'relative flex h-40 w-full shrink-0 items-center justify-center bg-gray-50 @md:h-auto @md:w-1/2 dark:bg-gray-900',
            banner && '@md:h-auto',
          )}
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
                onClick={(e) => e.stopPropagation()}
                placeholder="Untitled document"
                className={cn(
                  'text-foreground block w-full border-none bg-transparent font-sans leading-tight font-bold outline-none placeholder:text-gray-400',
                  banner ? 'text-2xl' : 'text-lg',
                )}
              />
            </div>
            <div className={stylex.props(styles.s2f003150).className || ''}>
              <DraftBadge />
            </div>
          </div>
          <div className={stylex.props(styles.s7e411b84).className || ''} onClick={(e) => e.stopPropagation()}>
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
                ...(onMoveDraft
                  ? [
                      {
                        key: 'move',
                        label: 'Move',
                        icon: <Forward className={stylex.props(styles.sca3de968).className || ''} />,
                        onClick: () => onMoveDraft(draft.id),
                      },
                    ]
                  : []),
                {
                  key: 'delete',
                  label: 'Delete Draft',
                  icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
                  variant: 'destructive',
                  onClick: () => onDeleteDraft(draft.id),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
