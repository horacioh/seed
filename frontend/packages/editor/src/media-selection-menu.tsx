import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shm/ui/components/dropdown-menu'
import {cn} from '@shm/ui/utils'
import {ArrowLeft, Link, MoreHorizontal, Trash2, Upload} from 'lucide-react'
import {KeyboardEvent, ReactNode, useState} from 'react'
const styles_2 = stylex.create({
  s93a199ef: {
    ':is(.dark *)': {
      backgroundColor: 'oklch(20.5% 0 none)',
    },
  },
})
const styles = stylex.create({
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s382471: {
    zIndex: '20',
  },
  s2ffff9: {
    display: 'flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  s291c6d79: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
      },
    },
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s36c7d4: {
    width: 'calc(0.25rem * 64)',
  },
  s199f26b7: {
    backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sc039b344: {
    ':focus': {
      color: 'var(--destructive)',
    },
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sca3de96b: {
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  sd52b2d2: {
    textTransform: 'uppercase',
  },
  s64e14c29: {
    letterSpacing: '0.025em',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  scdbaf625: {
    width: '100%',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd13f4: {
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  sc807c78b: {
    ':focus': {},
  },
  s4a7318b7: {
    ':focus': {
      boxShadow: '0 0 0 2px var(--ring-color, currentcolor)',
    },
  },
  s6044a01e: {
    justifyContent: 'flex-end',
  },
})
export type MediaSelectionMenuProps = {
  /** Open the file picker for replacing the media with local upload */
  onReplaceFile: () => void
  /** Submit an external URL action */
  onSubmitUrl: (url: string) => void
  /** Remove the block from the editor */
  onDelete: () => void
  /** Current URL stored on the block */
  currentUrl: string
  /** Label for the URL menu item */
  urlMenuLabel: ReactNode
  /** Placeholder text for the URL input */
  urlInputPlaceholder?: string
  /** Label for the delete menu item */
  deleteLabel?: string
  /** Prefix used on data-testid attributes */
  testIdPrefix?: string
  /** Optional block-specific content rendered between the URL item and the delete item. */
  extraContent?: ReactNode
}

/** Floating selection toolbar for a selected media block */
function displayableUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('ipfs://') || url.startsWith('blob:') || url.startsWith('data:')) return ''
  return url
}
export function MediaSelectionMenu({
  onReplaceFile,
  onSubmitUrl,
  onDelete,
  currentUrl,
  urlMenuLabel,
  urlInputPlaceholder,
  deleteLabel,
  testIdPrefix,
  extraContent,
}: MediaSelectionMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mode, setMode] = useState<'main' | 'url'>('main')
  const [urlInput, setUrlInput] = useState(() => displayableUrl(currentUrl))
  const testId = (suffix: string) => (testIdPrefix ? `${testIdPrefix}-${suffix}` : suffix)
  const resetAndClose = () => {
    setDropdownOpen(false)
    // Defer the mode reset so the menu can fully close before the next open
    setTimeout(() => setMode('main'), 0)
  }
  const handleSubmit = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onSubmitUrl(trimmed)
    resetAndClose()
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setMode('main')
    }
  }
  return (
    <div
      className={cn(
        stylex.props(
          styles.s436dc7b6,
          styles.s1a01a0ed,
          styles.s382471,
          styles.s2ffff9,
          styles.sc6ed1702,
          styles.s5d936fa,
          styles.sf79988b7,
          styles.sad8c742c,
          styles.s1aa14,
          styles.s8a6c2964,
        ).className || '',
        stylex.props(styles_2.s93a199ef).className || '',
      )}
      data-testid={testId('selection-menu')}
      // Selection menu shouldn't bubble pointer events into the editor and
      // accidentally move the cursor or kill the block selection.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => {
          setDropdownOpen(open)
          if (!open) setTimeout(() => setMode('main'), 0)
          if (open) setUrlInput(displayableUrl(currentUrl))
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            data-testid={testId('more')}
            className={stylex.props(styles.s291c6d79).className || ''}
          >
            <MoreHorizontal className={stylex.props(styles.sca3de968).className || ''} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className={stylex.props(styles.s36c7d4).className || ''}>
          {mode === 'main' ? (
            <>
              <DropdownMenuItem
                data-testid={testId('replace')}
                onSelect={() => {
                  onReplaceFile()
                  resetAndClose()
                }}
              >
                <Upload className={stylex.props(styles.sca3de968).className || ''} />
                <span>Replace</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid={testId('open-url-input')}
                onSelect={(e) => {
                  e.preventDefault()
                  setMode('url')
                }}
              >
                <Link className={stylex.props(styles.sca3de968).className || ''} />
                <span>{urlMenuLabel}</span>
              </DropdownMenuItem>
              {extraContent && (
                <>
                  <DropdownMenuSeparator className={stylex.props(styles.s199f26b7).className || ''} />
                  {extraContent}
                </>
              )}
              <DropdownMenuSeparator className={stylex.props(styles.s199f26b7).className || ''} />
              <DropdownMenuItem
                data-testid={testId('delete')}
                className={stylex.props(styles.s8a2570e2, styles.sc039b344).className || ''}
                onSelect={() => {
                  onDelete()
                  resetAndClose()
                }}
              >
                <Trash2 className={stylex.props(styles.sca3de968).className || ''} />
                <span>{deleteLabel ?? 'Delete'}</span>
              </DropdownMenuItem>
            </>
          ) : (
            <div
              className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s5d936fb, styles.s1aa14).className || ''}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fa).className || ''}>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  data-testid={testId('url-back')}
                  className={stylex.props(styles.sca3de96b, styles.s291c6d79).className || ''}
                  onClick={() => setMode('main')}
                >
                  <ArrowLeft className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
                <span
                  className={
                    stylex.props(
                      styles.sf2718385,
                      styles.sab7cc79b,
                      styles.s129e46b3,
                      styles.sd52b2d2,
                      styles.s64e14c29,
                    ).className || ''
                  }
                >
                  {urlMenuLabel}
                </span>
              </div>
              <input
                type="url"
                autoFocus
                data-testid={testId('url-input')}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={urlInputPlaceholder ?? 'Paste a URL'}
                className={cn(
                  stylex.props(
                    styles.s1a01a0ed,
                    styles.s436dc7b6,
                    styles.sc05281e3,
                    styles.scdbaf625,
                    styles.sf79988b7,
                    styles.sad8c742c,
                    styles.s34b1ad,
                    styles.sc5dd13f4,
                    styles.sab7cc6fa,
                    styles.sa602a1e3,
                  ).className || '',
                  stylex.props(styles.sc807c78b, styles.s4a7318b7).className || '',
                )}
              />
              <div className={stylex.props(styles.s2ffff9, styles.s6044a01e, styles.s5d936fa).className || ''}>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  data-testid={testId('url-cancel')}
                  onClick={() => setMode('main')}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  data-testid={testId('url-submit')}
                  onClick={handleSubmit}
                  disabled={!urlInput.trim()}
                >
                  Embed
                </Button>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
