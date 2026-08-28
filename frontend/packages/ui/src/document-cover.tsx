import * as stylex from '@stylexjs/stylex'
import {Download, X} from 'lucide-react'
import {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {Button} from './button'
import {useImageUrl} from './get-file-url'
import {cn} from './utils'
const styles_4 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s1e161c52: {
    height: '25vh',
  },
  scdbaf625: {
    width: '100%',
  },
  s880858c0: {
    flexShrink: '0',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  s67010d77: {
    position: 'absolute',
  },
  s808fc112: {
    bottom: 'calc(0.25rem * 4)',
  },
  s478fb0c3: {
    right: 'calc(0.25rem * 4)',
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
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  s199f2719: {
    backgroundColor: 'color-mix(in oklab, #000 45%, transparent)',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s2daecf89: {
    color: '#fff',
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s8c9099f9: {
    transitionDuration: '200ms',
  },
  s34ec0293: {
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
  s83138179: {
    '@media ((min-width: 768px))': {
      pointerEvents: 'none',
    },
  },
  s3ef704cb: {
    '@media ((min-width: 768px))': {
      opacity: '0%',
    },
  },
  s36cbc45c: {
    '@media ((min-width: 768px))': {
      ':focus-within': {
        pointerEvents: 'auto',
      },
    },
  },
  sf7684838: {
    '@media ((min-width: 768px))': {
      ':focus-within': {
        opacity: '100%',
      },
    },
  },
})
const styles_3 = stylex.create({
  s4bce43ea: {
    position: 'fixed',
    inset: 'calc(var(--spacing) * 0)',
    zIndex: '50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'color-mix(in oklab, var(--color-black) 80%, transparent)',
    WebkitBackdropFilter: 'blur(4px)',
    backdropFilter: 'blur(4px)',
  },
  saa3e1a43: {
    position: 'absolute',
    top: 'calc(var(--spacing) * 4)',
    right: 'calc(var(--spacing) * 4)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'color-mix(in oklab, var(--color-black) 50%, transparent)',
    padding: 'calc(var(--spacing) * 2)',
    color: 'var(--color-white)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--color-black) 70%, transparent)',
      },
    },
  },
  se63b3b6b: {
    height: 'calc(var(--spacing) * 7)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    color: 'var(--color-white)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--color-white) 15%, transparent)',
        color: 'var(--color-white)',
      },
    },
    ':active': {
      backgroundColor: 'color-mix(in oklab, var(--color-white) 20%, transparent)',
    },
  },
  s2fa0e44f: {
    height: 'calc(var(--spacing) * 7)',
    minWidth: 'calc(var(--spacing) * 7)',
    borderRadius: 'calc(var(--radius) - 2px)',
    color: 'var(--color-white)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--color-white) 15%, transparent)',
        color: 'var(--color-white)',
      },
    },
    ':active': {
      backgroundColor: 'color-mix(in oklab, var(--color-white) 20%, transparent)',
    },
  },
})
const styles_2 = stylex.create({
  s4188bcb3: {
    animation: 'enter .15sease0s1normalnone',
    transitionDuration: '300ms',
  },
  s4a4a3f22: {
    animation: 'enter .15sease0s1normalnone',
    transitionDuration: '300ms',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s856bab52: {
    backgroundColor: 'var(--accent)',
  },
})
const styles = stylex.create({
  s7794e038: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s4dd0fc46: {
    objectFit: 'contain',
  },
  s154041a5: {
    transitionProperty: 'transform, translate, scale, rotate',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '200ms',
  },
  s88a3565a: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
})
interface DocumentCoverProps {
  cover?: string
  className?: string
  onRemove?: () => void
  onChangeCover?: (file: File) => Promise<void> | void
}
export function DocumentCover({cover, className, onRemove, onChangeCover}: DocumentCoverProps) {
  const imageUrl = useImageUrl()
  const replacementInputRef = useRef<HTMLInputElement | null>(null)
  const [modalState, setModalState] = useState<'closed' | 'opening' | 'open'>('closed')
  const [isChangingCover, setIsChangingCover] = useState(false)
  const handleDoubleClick = useCallback(() => {
    setModalState('opening')
  }, [])
  const handleClose = useCallback(() => {
    setModalState('closed')
  }, [])
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState === 'open') {
        handleClose()
      }
    },
    [modalState, handleClose],
  )
  const handleAnimationEnd = useCallback(() => {
    if (modalState === 'opening') {
      setModalState('open')
    }
  }, [modalState])
  const handleReplacementChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !onChangeCover) return
      setIsChangingCover(true)
      try {
        await onChangeCover(file)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Failed to change document cover image: ${message}`, error)
      } finally {
        setIsChangingCover(false)
        event.target.value = ''
      }
    },
    [onChangeCover],
  )
  useEffect(() => {
    if (modalState !== 'closed') {
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalState, handleKeyDown])
  if (!cover) return null
  const coverUrl = imageUrl(cover, 'XL')
  const hasCoverActions = !!onChangeCover || !!onRemove || !!coverUrl
  const maximizedContent = modalState !== 'closed' && (
    <div
      className={cn(
        stylex.props(styles_3.s4bce43ea).className || '',
        stylex.props(modalState === 'opening' ? styles_2.s4188bcb3 : null).className || '',
      )}
      onClick={handleClose}
    >
      <div
        className={stylex.props(styles.s7794e038).className || ''}
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
      >
        <img
          alt="Document cover"
          src={imageUrl(cover, 'L')}
          className={cn(
            stylex.props(styles.s4dd0fc46).className || '',
            stylex.props(modalState === 'opening' ? styles_2.s4a4a3f22 : null).className || '',
          )}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '100%',
            height: '100%',
          }}
          onAnimationEnd={handleAnimationEnd}
        />
        <button onClick={handleClose} className={stylex.props(styles_3.saa3e1a43).className || ''} aria-label="Close">
          <X size={20} />
        </button>
      </div>
    </div>
  )
  return (
    <>
      <div
        className={cn(
          stylex.props(
            styles_4.sdef3facc,
            styles_4.s1e161c52,
            styles_4.scdbaf625,
            styles_4.s880858c0,
            styles_4.sc7847ec6,
          ).className || '',
          'group/cover',
          stylex.props(cover ? styles_2.s60f53bca : styles_2.s856bab52).className || '',
          className,
        )}
        onClick={handleDoubleClick}
        title="Click to maximize"
      >
        <img
          alt="Document cover"
          src={coverUrl}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover',
            transition: 'transform 0.2s ease-out',
          }}
          className={stylex.props(styles.s154041a5).className || ''}
        />
        {hasCoverActions ? (
          <div
            data-document-cover-controls
            data-visibility="mobile-visible"
            className={
              stylex.props(
                styles_4.s67010d77,
                styles_4.s808fc112,
                styles_4.s478fb0c3,
                styles_4.s382471,
                styles_4.s2ffff9,
                styles_4.sc6ed1702,
                styles_4.s5d936fa,
                styles_4.sf799889b,
                styles_4.s199f2719,
                styles_4.s1aa14,
                styles_4.s2daecf89,
                styles_4.s486c2d2f,
                styles_4.s8a6c2a27,
                styles_4.s83442393,
                styles_4.s8c9099f9,
                styles_4.s34ec0293,
                styles_4.s83138179,
                styles_4.s3ef704cb,
                styles_4.s36cbc45c,
                styles_4.sf7684838,
              ).className || ''
            }
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            {onChangeCover ? (
              <>
                <input
                  ref={replacementInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Choose replacement cover image"
                  className={stylex.props(styles.s88a3565a).className || ''}
                  tabIndex={-1}
                  onChange={(event) => void handleReplacementChange(event)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  aria-label="Change document cover image"
                  loading={isChangingCover}
                  className={stylex.props(styles_3.se63b3b6b).className || ''}
                  onClick={(event) => {
                    event.stopPropagation()
                    replacementInputRef.current?.click()
                  }}
                >
                  Change
                </Button>
              </>
            ) : null}
            {coverUrl ? (
              <Button
                asChild
                variant="ghost"
                size="iconSm"
                aria-label="Download document cover image"
                className={stylex.props(styles_3.s2fa0e44f).className || ''}
              >
                <a
                  href={coverUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className={stylex.props(styles.s3269316e).className || ''} />
                </a>
              </Button>
            ) : null}
            {onRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                aria-label="Remove document cover image"
                className={stylex.props(styles_3.se63b3b6b).className || ''}
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove()
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      {typeof window !== 'undefined' &&
        (() => {
          return createPortal(maximizedContent, document.body)
        })()}
    </>
  )
}
