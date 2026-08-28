import * as stylex from '@stylexjs/stylex'
import {useHideOnDocumentScroll} from '@shm/shared/models/use-document-machine'
import {Link, MessageSquare} from 'lucide-react'
import {TextSelection} from 'prosemirror-state'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {BlockNoteEditor} from '../../core/BlockNoteEditor'
import {BlockSchema} from '../../core/extensions/Blocks/api/blockTypes'
import {
  RangeSelectionProsemirrorPlugin,
  RangeSelectionState,
} from '../../core/extensions/RangeSelection/RangeSelectionPlugin'

/**
 * Helper type: once `rangeSelection` is registered on the editor the property
 * will be present.  The optional cast lets us detect the absence at runtime
 * without a TypeScript error.
 */
const styles = stylex.create({
  s56bd391d: {
    backgroundColor: 'var(--popover)',
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
  s8880a929: {
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s8c9096d3: {
    transitionDuration: '150ms',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s95afba94: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
  },
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
})
type EditorWithRangeSelection<BSchema extends BlockSchema> = BlockNoteEditor<BSchema> & {
  rangeSelection?: RangeSelectionProsemirrorPlugin<BSchema> | null
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by {@link RangeSelectionPositioner}.
 */
export type RangeSelectionPositionerProps<BSchema extends BlockSchema = BlockSchema> = {
  /** The BlockNote editor instance. */
  editor: EditorWithRangeSelection<BSchema>
  /**
   * Called when the user clicks the "Copy Link" button.
   *
   * @param blockId   The `data-id` of the block containing the selection.
   * @param rangeStart  Zero-based Unicode codepoint offset of selection start.
   * @param rangeEnd    Zero-based Unicode codepoint offset of selection end.
   */
  onCopyFragmentLink?: (blockId: string, rangeStart: number, rangeEnd: number) => void
  /**
   * Called when the user clicks the "Comment" button.
   *
   * @param blockId   The `data-id` of the block containing the selection.
   * @param rangeStart  Zero-based Unicode codepoint offset of selection start.
   * @param rangeEnd    Zero-based Unicode codepoint offset of selection end.
   */
  onComment?: (blockId: string, rangeStart: number, rangeEnd: number) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a small floating bubble with "Cite" and "Comment" actions anchored
 * above the current text selection.
 *
 * Subscribes to the editor's `rangeSelection` plugin via the EventEmitter and
 * positions itself using the selection's bounding rect.  The bubble is only
 * visible when the editor is in **read-only** mode and there is a non-empty
 * text selection (the plugin suppresses emissions otherwise).
 *
 * @example
 * ```tsx
 * <RangeSelectionPositioner
 *   editor={editor}
 *   onCite={(blockId, start, end) => openCiteModal(blockId, start, end)}
 *   onComment={(blockId, start, end) => openCommentThread(blockId, start, end)}
 * />
 * ```
 */
export function RangeSelectionPositioner<BSchema extends BlockSchema = BlockSchema>({
  editor,
  onCopyFragmentLink,
  onComment,
}: RangeSelectionPositionerProps<BSchema>) {
  const [selectionState, setSelectionState] = useState<RangeSelectionState>({
    show: false,
    blockId: null,
    rangeStart: null,
    rangeEnd: null,
    referenceRect: null,
  })
  const rectRef = useRef<DOMRect | null>(null)
  const lastTouchActionAtRef = useRef(0)
  useEffect(() => {
    const plugin = editor.rangeSelection
    if (!plugin) {
      return
    }
    return plugin.onUpdate((state) => {
      rectRef.current = state.referenceRect
      setSelectionState(state)
    })
  }, [editor])

  // Hide the bubble on document scroll.
  useHideOnDocumentScroll(
    useCallback(() => {
      setSelectionState({
        show: false,
        blockId: null,
        rangeStart: null,
        rangeEnd: null,
        referenceRect: null,
      })
    }, []),
  )

  // Hide on visualViewport resize (e.g. mobile soft-keyboard opens). The
  // OS selection rect we cached becomes stale once the layout shifts.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return
    const handle = () => {
      setSelectionState({
        show: false,
        blockId: null,
        rangeStart: null,
        rangeEnd: null,
        referenceRect: null,
      })
    }
    vv.addEventListener('resize', handle)
    return () => {
      vv.removeEventListener('resize', handle)
    }
  }, [])
  if (
    !selectionState.show ||
    !selectionState.referenceRect ||
    !selectionState.blockId ||
    selectionState.rangeStart === null ||
    selectionState.rangeEnd === null
  ) {
    return null
  }
  const rect = selectionState.referenceRect
  const {blockId, rangeStart, rangeEnd} = selectionState
  const clearTextSelection = () => {
    setSelectionState({
      show: false,
      blockId: null,
      rangeStart: null,
      rangeEnd: null,
      referenceRect: null,
    })
    clearEditorTextSelection(editor)
  }
  const runCopyFragmentLink = () => {
    onCopyFragmentLink?.(blockId, rangeStart, rangeEnd)
    clearTextSelection()
  }
  const runComment = () => {
    onComment?.(blockId, rangeStart, rangeEnd)
    clearTextSelection()
  }
  const suppressSyntheticClick = () => {
    lastTouchActionAtRef.current = Date.now()
  }
  const shouldIgnoreSyntheticClick = () => Date.now() - lastTouchActionAtRef.current < 700

  // Position the bubble centered above the selection, 8 px above the top edge.
  // `fixed` positioning lets us use the viewport-relative coords from
  // getBoundingClientRect / posToDOMRect directly. Clamp to the visual viewport
  // so the bubble does not fall under the iOS selection magnifier or off-screen.
  const viewportWidth = typeof window !== 'undefined' ? window.visualViewport?.width ?? window.innerWidth ?? 1024 : 1024
  const viewportHeight =
    typeof window !== 'undefined' ? window.visualViewport?.height ?? window.innerHeight ?? 768 : 768
  const desiredLeft = rect.left + rect.width / 2
  const clampedLeft = Math.min(Math.max(desiredLeft, 60), Math.max(60, viewportWidth - 60))
  // Keep an extra 48px margin below the top of the viewport so the bubble does
  // not get clipped under a sticky header / iOS dynamic island.
  const desiredTop = rect.top - 8
  const clampedTop = Math.min(Math.max(desiredTop, 48), Math.max(48, viewportHeight - 48))
  const bubbleStyle: React.CSSProperties = {
    position: 'fixed',
    top: clampedTop,
    left: clampedLeft,
    transform: 'translate(-50%, -100%)',
    zIndex: 50,
  }
  return (
    <div style={bubbleStyle} onMouseDown={stopPropagation} onTouchStart={stopPropagationTouch}>
      <div
        className={
          stylex.props(
            styles.s56bd391d,
            styles.s2ffff9,
            styles.sc6ed1702,
            styles.s5d936fa,
            styles.sf79988b7,
            styles.sad8c742c,
            styles.s1aa14,
            styles.s8a6c2964,
            styles.s8880a929,
            styles.s8c9096d3,
          ).className || ''
        }
      >
        {onCopyFragmentLink && (
          <button
            type="button"
            aria-label="Copy link to selection"
            title="Copy Link"
            className={
              stylex.props(styles.sf2718385, styles.s95afba94, styles.sae6a97a5, styles.s529492ad, styles.s1aa15)
                .className || ''
            }
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              suppressSyntheticClick()
              runCopyFragmentLink()
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (shouldIgnoreSyntheticClick()) return
              runCopyFragmentLink()
            }}
          >
            <Link size={16} />
          </button>
        )}
        {onComment && (
          <button
            type="button"
            aria-label="Comment on selection"
            title="Comment"
            className={
              stylex.props(styles.sf2718385, styles.s95afba94, styles.sae6a97a5, styles.s529492ad, styles.s1aa15)
                .className || ''
            }
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              suppressSyntheticClick()
              runComment()
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (shouldIgnoreSyntheticClick()) return
              runComment()
            }}
          >
            <MessageSquare size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Prevents mousedown events on the bubble from clearing the editor selection. */
function stopPropagation(e: React.MouseEvent) {
  e.stopPropagation()
}

/** Prevents touchstart events on the bubble from collapsing the OS text
 * selection. Without this, tapping the bubble on iOS deselects the text
 * before the click handler can read it. */
function stopPropagationTouch(e: React.TouchEvent) {
  // Don't preventDefault here — that would block subsequent click events
  // generated by the touch. Only stop propagation so the OS keeps the selection.
  e.stopPropagation()
}

/** Clears the visible browser/ProseMirror selection after fragment actions. */
function clearEditorTextSelection<BSchema extends BlockSchema>(editor: EditorWithRangeSelection<BSchema>) {
  const view = editor._tiptapEditor?.view
  if (view && !view.isDestroyed) {
    const {state} = view
    const pos = Math.min(Math.max(state.selection.to, 0), state.doc.content.size)
    try {
      view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)))
    } catch {
      // Ignore invalid positions; clearing the native selection below is still useful.
    }
  }
  if (typeof window !== 'undefined') {
    window.getSelection()?.removeAllRanges()
  }
}
