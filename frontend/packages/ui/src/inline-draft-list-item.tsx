import * as stylex from '@stylexjs/stylex'
import {HMListedDraft} from '@seed-hypermedia/client/hm-types'
import {FileText, MoreVertical, Forward, Pencil, Trash2} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from './button'
import {DraftBadge} from './draft-badge'
import {OptionsDropdown} from './options-dropdown'
const styles_2 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  s1ca68c72: {
    borderStyle: 'dashed',
  },
  s7a26f4ee: {
    borderColor: 'color-mix(in oklab, oklch(85.2% 0.199 91.936) 50%, transparent)',
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
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s29df1839: {
    borderStyle: 'none',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
})
const styles = stylex.create({
  s7091d227: {
    color: 'var(--muted-foreground)',
    marginRight: 'calc(0.25rem * 3)',
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
    flexShrink: '0',
  },
  se5fd4a4f: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    overflow: 'hidden',
  },
  sf2746014: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    overflow: 'hidden',
  },
  s86ff3e3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export interface InlineDraftListItemProps {
  draft: HMListedDraft
  autoFocus?: boolean
  onOpenDraft: (draftId: string) => void
  onDeleteDraft: (draftId: string) => void
  onMoveDraft?: (draftId: string) => void
  onUpdateDraftName: (draftId: string, name: string) => void
}
export function InlineDraftListItem({
  draft,
  autoFocus,
  onOpenDraft,
  onDeleteDraft,
  onMoveDraft,
  onUpdateDraftName,
}: InlineDraftListItemProps) {
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
      className={
        stylex.props(
          styles_2.s2ffff9,
          styles_2.scdbaf625,
          styles_2.sc7847ec6,
          styles_2.sc6ed1702,
          styles_2.s529492ad,
          styles_2.s7c401ed1,
          styles_2.s1ca68c72,
          styles_2.s7a26f4ee,
          styles_2.s605ce4a1,
          styles_2.s34b1af,
          styles_2.s34b56e,
          styles_2.s8a6c2a27,
        ).className || ''
      }
    >
      <FileText className={stylex.props(styles.s7091d227).className || ''} />
      <div className={stylex.props(styles.se5fd4a4f).className || ''}>
        <div className={stylex.props(styles.sf2746014).className || ''}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder="Untitled document"
            className={
              stylex.props(
                styles_2.sc05281e3,
                styles_2.scdbaf625,
                styles_2.s29df1839,
                styles_2.s60f53bca,
                styles_2.sa1762f51,
                styles_2.sab7cc6fa,
                styles_2.sa16ea943,
                styles_2.sa602a1e3,
              ).className || ''
            }
          />
          <DraftBadge />
        </div>
        <div className={stylex.props(styles.s86ff3e3).className || ''} onClick={(e) => e.stopPropagation()}>
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
  )
}
