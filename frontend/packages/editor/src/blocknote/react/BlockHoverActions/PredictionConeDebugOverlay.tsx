import * as stylex from '@stylexjs/stylex'
import {createPortal} from 'react-dom'
import {useEffect, useRef, useState} from 'react'
import {BlockNoteEditor} from '../../core/BlockNoteEditor'
import {BlockSchema} from '../../core/extensions/Blocks/api/blockTypes'
import {
  BlockHoverActionsProsemirrorPlugin,
  PredictionConeDebugState,
} from '../../core/extensions/BlockHoverActions/BlockHoverActionsPlugin'

/**
 * Prediction cone debug overlay.
 *
 * Renders an SVG triangle via a React portal into `document.body` that shows
 * the prediction cone when enabled and a hover card is active. Points A→B→C
 * trace the triangle from the cone origin to the card's near edge.
 *
 * The overlay uses `pointer-events: none` so it never interferes with mouse
 * interaction. Gating on `developerTools` is handled by the consumer.
 *
 * The cone state is "sticky" — once shown, it remains visible at its last
 * known position even when the plugin emits null. This makes the cone easier
 * to inspect in the debugger since it doesn't vanish the moment the user
 * stops moving the pointer.
 */
const styles = stylex.create({
  s5cee774: {
    position: 'fixed',
  },
  s74a79380: {
    inset: 'calc(0.25rem * 0)',
  },
  s6c4ecf36: {
    zIndex: '9998',
  },
  s1ad53cdb: {
    width: '100%',
    height: '100%',
  },
})
export function PredictionConeDebugOverlay<BSchema extends BlockSchema = BlockSchema>({
  editor,
}: {
  editor: BlockNoteEditor<BSchema>
}) {
  type EditorWithCone = BlockNoteEditor<BSchema> & {
    blockHoverActions?: BlockHoverActionsProsemirrorPlugin<BSchema> | null
  }
  const plugin = (editor as EditorWithCone).blockHoverActions
  const [coneState, setConeState] = useState<PredictionConeDebugState | null>(null)
  const stickyRef = useRef<PredictionConeDebugState | null>(null)
  useEffect(() => {
    if (!plugin) return
    return plugin.onConeDebug((state) => {
      if (state) {
        stickyRef.current = state
      }
      setConeState(state ?? stickyRef.current)
    })
  }, [plugin])

  // Always render through the last known sticky state so the cone is
  // inspectable between mouse movements.
  const visible = coneState ?? stickyRef.current
  if (!visible) return null
  const {origin, cardTop, cardBottom} = visible
  const trianglePoints = `${origin.x},${origin.y} ${cardTop.x},${cardTop.y} ${cardBottom.x},${cardBottom.y}`
  const overlay = (
    <svg
      className={stylex.props(styles.s5cee774, styles.s74a79380, styles.s6c4ecf36, styles.s1ad53cdb).className || ''}
      style={{
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* The prediction cone triangle */}
      <polygon
        points={trianglePoints}
        fill="rgba(59, 130, 246, 0.08)"
        stroke="rgba(59, 130, 246, 0.3)"
        strokeWidth={1}
      />

      {/* Origin dot — where the pointer was when the hover card opened */}
      <circle cx={origin.x} cy={origin.y} r={4} fill="rgba(59, 130, 246, 0.5)" />

      {/* Card top edge dot */}
      <circle cx={cardTop.x} cy={cardTop.y} r={3} fill="rgba(59, 130, 246, 0.4)" />

      {/* Card bottom edge dot */}
      <circle cx={cardBottom.x} cy={cardBottom.y} r={3} fill="rgba(59, 130, 246, 0.4)" />
    </svg>
  )
  return createPortal(overlay, document.body)
}
