import * as stylex from '@stylexjs/stylex'
import {BlockNoteEditor} from '../../core/BlockNoteEditor'
import {BlockSchema} from '../../core/extensions/Blocks/api/blockTypes'
import {imageGalleryPluginKey} from '../../core/extensions/ImageGallery/ImageGalleryPlugin'
import {ChevronLeft, ChevronRight, X} from 'lucide-react'
import {useCallback, useEffect} from 'react'
import {createPortal} from 'react-dom'
import {useEditorForceUpdate} from '../hooks/useEditorForceUpdate'

/** Props for the ImageGalleryOverlay component. */
const styles = stylex.create({
  s5cee774: {
    position: 'fixed',
  },
  s74a79380: {
    inset: 'calc(0.25rem * 0)',
  },
  s3824ce: {
    zIndex: '50',
  },
  s2ffff9: {
    display: 'flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s199f27af: {
    backgroundColor: 'color-mix(in oklab, #000 90%, transparent)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s1ad53cdb: {
    width: '100%',
    height: '100%',
  },
  s67010d77: {
    position: 'absolute',
  },
  sbe0abfee: {
    left: 'calc(0.25rem * 4)',
  },
  sbbfc415c: {
    top: '50%',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s29e9cf3e: {
    color: 'color-mix(in oklab, #fff 80%, transparent)',
  },
  s25eca887: {
    ':hover': {
      '@media (hover: hover)': {
        color: '#fff',
      },
    },
  },
  s62362947: {
    maxHeight: '90vh',
  },
  s7867cc29: {
    maxWidth: '90vw',
  },
  s4dd0fc46: {
    objectFit: 'contain',
  },
  s478fb0c3: {
    right: 'calc(0.25rem * 4)',
  },
  s696c5bc: {
    top: 'calc(0.25rem * 4)',
  },
  s808fc112: {
    bottom: 'calc(0.25rem * 4)',
  },
  s665a770e: {
    left: '50%',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
})
export type ImageGalleryOverlayProps<BSchema extends BlockSchema> = {
  /** The BlockNote editor instance whose plugin state drives the overlay. */
  editor: BlockNoteEditor<BSchema>
  /**
   * Optional resolver that converts an IPFS or internal URL to a displayable
   * HTTP URL. The raw `url` value from the image node is passed in and the
   * return value is used as the `src` on the `<img>` element. When omitted
   * the URL is used as-is.
   */
  resolveImageUrl?: (url: string) => string
}

/**
 * Full-screen image gallery overlay driven by the `ImageGalleryPlugin`.
 *
 * Renders into `document.body` via a React portal so that it sits above all
 * other page content regardless of where the editor is mounted.
 *
 * Keyboard shortcuts:
 * - `ArrowLeft` / `ArrowRight` — navigate between images
 * - `Escape` — close the overlay
 *
 * The component re-renders on every editor transaction so that it always
 * reflects the latest plugin state.
 */
export function ImageGalleryOverlay<BSchema extends BlockSchema>({
  editor,
  resolveImageUrl,
}: ImageGalleryOverlayProps<BSchema>) {
  // Re-render whenever the editor emits a transaction (plugin state may change).
  useEditorForceUpdate(editor._tiptapEditor)
  const view = editor.prosemirrorView
  const pluginState = imageGalleryPluginKey.getState(view.state)
  const dispatch = useCallback(
    (action: Parameters<typeof view.state.tr.setMeta>[1]) => {
      view.dispatch(view.state.tr.setMeta(imageGalleryPluginKey, action))
    },
    [view],
  )
  const handleClose = useCallback(
    () =>
      dispatch({
        type: 'close',
      }),
    [dispatch],
  )
  const handleNext = useCallback(
    () =>
      dispatch({
        type: 'next',
      }),
    [dispatch],
  )
  const handlePrev = useCallback(
    () =>
      dispatch({
        type: 'prev',
      }),
    [dispatch],
  )
  useEffect(() => {
    if (!pluginState?.isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pluginState?.isOpen, handleNext, handlePrev, handleClose])
  if (!pluginState?.isOpen) return null
  const {images, activeIndex} = pluginState
  const activeImage = images[activeIndex]
  if (!activeImage) return null
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < images.length - 1
  const showCounter = images.length > 1
  const resolvedSrc = resolveImageUrl ? resolveImageUrl(activeImage.url) : activeImage.url
  const overlay = (
    <div
      className={
        stylex.props(
          styles.s5cee774,
          styles.s74a79380,
          styles.s3824ce,
          styles.s2ffff9,
          styles.sc6ed1702,
          styles.sce22ca32,
          styles.s199f27af,
        ).className || ''
      }
      onClick={handleClose}
      role="dialog"
      aria-modal
      aria-label="Image gallery"
    >
      {/* Prevent clicks on the inner wrapper from bubbling to the backdrop. */}
      <div
        className={
          stylex.props(styles.sdef3facc, styles.s2ffff9, styles.s1ad53cdb, styles.sc6ed1702, styles.sce22ca32)
            .className || ''
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous button */}
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className={
              stylex.props(
                styles.s67010d77,
                styles.sbe0abfee,
                styles.sbbfc415c,
                styles.s1aa15,
                styles.s29e9cf3e,
                styles.s25eca887,
              ).className || ''
            }
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <img
          key={activeIndex}
          src={resolvedSrc}
          alt={activeImage.name}
          className={stylex.props(styles.s62362947, styles.s7867cc29, styles.s4dd0fc46).className || ''}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Next button */}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className={
              stylex.props(
                styles.s67010d77,
                styles.s478fb0c3,
                styles.sbbfc415c,
                styles.s1aa15,
                styles.s29e9cf3e,
                styles.s25eca887,
              ).className || ''
            }
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className={
            stylex.props(styles.s67010d77, styles.s478fb0c3, styles.s696c5bc, styles.s29e9cf3e, styles.s25eca887)
              .className || ''
          }
          aria-label="Close gallery"
        >
          <X size={24} />
        </button>

        {/* Counter */}
        {showCounter && (
          <div
            className={
              stylex.props(styles.s67010d77, styles.s808fc112, styles.s665a770e, styles.sab7cc6fa, styles.s29e9cf3e)
                .className || ''
            }
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
  return createPortal(overlay, document.body)
}
