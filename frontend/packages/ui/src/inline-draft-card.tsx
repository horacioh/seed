import * as stylex from '@stylexjs/stylex'
import {HMListedDraft} from '@seed-hypermedia/client/hm-types'
import {ImageIcon, MoreVertical, Forward, Pencil, Trash2} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Button} from './button'
import {DraftBadge} from './draft-badge'
import {OptionsDropdown} from './options-dropdown'
import {cn} from './utils'
const styles_9 = stylex.create({
  s8c694c13: {
    ':is(.dark *)': {
      backgroundColor: 'oklch(21% 0.034 264.665)',
    },
  },
})
const styles_8 = stylex.create({
  sbdde5449: {
    flexDirection: 'row',
  },
})
const styles_7 = stylex.create({
  sd507cda3: {
    '::placeholder': {
      color: 'oklch(70.7% 0.022 261.325)',
    },
  },
})
const styles_6 = stylex.create({
  s77be7ef7: {
    height: 'auto',
  },
  s5f86341b: {
    width: '50%',
  },
})
const styles_5 = stylex.create({
  s2ffff9: {
    display: 'flex',
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
  sdef3facc: {
    position: 'relative',
  },
  s2ff601: {
    height: 'calc(0.25rem * 40)',
  },
  scdbaf625: {
    width: '100%',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s7ef3c0bd: {
    backgroundColor: 'oklch(98.5% 0.002 247.839)',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s597c48d: {
    display: 'block',
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
  sa16ea943: {
    fontWeight: '700',
  },
  s8e879397: {
    lineHeight: '1.25',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
})
const styles_4 = stylex.create({
  sbed77557: {
    containerType: 'inline-size',
    display: 'flex',
    minHeight: '200px',
    flex: '1',
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderColor: 'color-mix(in oklab, var(--color-yellow-400) 50%, transparent)',
    backgroundColor: 'var(--surface-contrast)',
    boxShadow: 'var(--shadow-sm)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: '300ms',
  },
  s60cb9ddc: {
    borderRadius: 'calc(var(--radius) + 4px)',
    '@media ((min-width: 768px))': {
      minHeight: '240px',
    },
    '@media ((min-width: 1024px))': {
      minHeight: '280px',
    },
  },
})
const styles_3 = stylex.create({
  sc41b2606: {
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
  },
  sab7cc61b: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
  },
})
const styles_2 = stylex.create({
  s89507f83: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
})
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
        stylex.props(styles_4.sbed77557).className || '',
        stylex.props(banner ? styles_4.s60cb9ddc : null).className || '',
      )}
    >
      <div
        className={
          (stylex.props(styles_5.s2ffff9, styles_5.sfcf3a2ae, styles_5.sb42feb5d, styles_5.s67e351ac).className || '') +
          ' ' +
          (stylex.props(styles_8.sbdde5449).className || '')
        }
      >
        {/* Image placeholder */}
        <div
          className={cn(
            stylex.props(
              styles_5.sdef3facc,
              styles_5.s2ffff9,
              styles_5.s2ff601,
              styles_5.scdbaf625,
              styles_5.sf032ed6c,
              styles_5.sc6ed1702,
              styles_5.sce22ca32,
              styles_5.s7ef3c0bd,
            ).className || '',
            stylex.props(styles_6.s77be7ef7, styles_6.s5f86341b).className || '',
            stylex.props(styles_9.s8c694c13).className || '',
            banner ? stylex.props(styles_6.s77be7ef7).className || '' : '',
          )}
        >
          <ImageIcon className={stylex.props(styles.s6e8f8a6d).className || ''} />
        </div>
        {/* Content */}
        <div className={stylex.props(styles_2.s89507f83).className || ''}>
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
                  stylex.props(
                    styles_5.sc05281e3,
                    styles_5.s597c48d,
                    styles_5.scdbaf625,
                    styles_5.s29df1839,
                    styles_5.s60f53bca,
                    styles_5.sa1762f51,
                    styles_5.sa16ea943,
                    styles_5.s8e879397,
                    styles_5.sa602a1e3,
                  ).className || '',
                  stylex.props(styles_7.sd507cda3).className || '',
                  stylex.props(banner ? styles_3.sc41b2606 : styles_3.sab7cc61b).className || '',
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
