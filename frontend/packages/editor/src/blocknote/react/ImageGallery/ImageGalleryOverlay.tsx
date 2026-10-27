import {BlockNoteEditor} from '../../core/BlockNoteEditor'
import {BlockSchema} from '../../core/extensions/Blocks/api/blockTypes'
import {imageGalleryPluginKey} from '../../core/extensions/ImageGallery/ImageGalleryPlugin'
import {ChevronLeft, ChevronRight, X} from 'lucide-react'
import {useCallback, useEffect, useRef} from 'react'
import {createPortal} from 'react-dom'
import {useEditorForceUpdate} from '../hooks/useEditorForceUpdate'

/** Props for the ImageGalleryOverlay component. */
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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  const dispatch = useCallback(
    (action: Parameters<typeof view.state.tr.setMeta>[1]) => {
      view.dispatch(view.state.tr.setMeta(imageGalleryPluginKey, action))
    },
    [view],
  )

  const handleClose = useCallback(() => dispatch({type: 'close'}), [dispatch])
  const handleNext = useCallback(() => dispatch({type: 'next'}), [dispatch])
  const handlePrev = useCallback(() => dispatch({type: 'prev'}), [dispatch])

  useEffect(() => {
    if (!pluginState?.isOpen) {
      if (wasOpenRef.current) openerRef.current?.focus()
      wasOpenRef.current = false
      return
    }

    if (!wasOpenRef.current) {
      const activeImage = pluginState.images[pluginState.activeIndex]
      openerRef.current =
        Array.from((view.dom as HTMLElement).querySelectorAll<HTMLElement>('[data-media-block-id]')).find(
          (element) => element.dataset.mediaBlockId === activeImage?.blockId,
        ) ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
      wasOpenRef.current = true
      requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button')?.focus())
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'Escape') handleClose()
      else if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pluginState?.activeIndex, pluginState?.images, pluginState?.isOpen, handleNext, handlePrev, handleClose, view])

  if (!pluginState?.isOpen) return null

  const {images, activeIndex} = pluginState
  const activeImage = images[activeIndex]
  if (!activeImage) return null

  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < images.length - 1
  const showCounter = images.length > 1

  const resolvedSrc = resolveImageUrl ? resolveImageUrl(activeImage.url) : activeImage.url

  const overlay = (
    <dialog
      ref={dialogRef}
      open
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-black/90 p-0"
      aria-modal={true}
      aria-label="Image gallery"
    >
      <div className="relative flex size-full items-center justify-center">
        {/* Previous button */}
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="focus-visible:outline-ring absolute top-1/2 left-4 -translate-y-1/2 p-2 text-white/80 outline-offset-2 hover:text-white focus-visible:outline-2"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <img
          key={activeIndex}
          src={resolvedSrc}
          alt={activeImage.alt || ''}
          data-missing-alt={!activeImage.alt || undefined}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />

        {/* Next button */}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="focus-visible:outline-ring absolute top-1/2 right-4 -translate-y-1/2 p-2 text-white/80 outline-offset-2 hover:text-white focus-visible:outline-2"
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
          className="focus-visible:outline-ring absolute top-4 right-4 text-white/80 outline-offset-2 hover:text-white focus-visible:outline-2"
          aria-label="Close gallery"
        >
          <X size={24} />
        </button>

        {/* Counter */}
        {showCounter && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </dialog>
  )

  return createPortal(overlay, document.body)
}
