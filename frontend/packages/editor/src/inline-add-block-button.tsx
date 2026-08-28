import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {cn} from '@shm/ui/utils'
import {Plus} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {isSlashMenuEnabled, slashMenuPluginKey} from './blocknote/core/extensions/SlashMenu/SlashMenuPlugin'
import type {HyperMediaEditor} from './types'
const styles_2 = stylex.create({
  scad6aa7f: {
    transform: 'scale(0.95, 0.95)',
  },
})
const styles = stylex.create({
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s53b5c178: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--primary)',
      },
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  s18c12: {
    height: 'calc(0.25rem * 7)',
  },
  s1c461: {
    width: 'calc(0.25rem * 7)',
  },
  s3f586665: {
    minWidth: 'calc(0.25rem * 6)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s8880a929: {
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sa042964f: {
    ':hover': {
      '@media (hover: hover)': {
        scale: '110% 110%',
      },
    },
  },
  s25eca887: {
    ':hover': {
      '@media (hover: hover)': {
        color: '#fff',
      },
    },
  },
  s4dfd873: {
    ':active': {
      scale: '95% 95%',
    },
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
type Position = {
  top: number
  left: number
}
function AddBlockButton({
  onClick,
  className,
  title = 'Insert block',
}: {
  onClick: (e: React.MouseEvent) => void
  className?: string
  title?: string
}) {
  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        stylex.props(
          styles.sf2718385,
          styles.s53b5c178,
          styles.s2ffff9,
          styles.sca3de96a,
          styles.s18c12,
          styles.s1c461,
          styles.s3f586665,
          styles.sc6ed1702,
          styles.sce22ca32,
          styles.s775755af,
          styles.s8880a929,
          styles.sa042964f,
          styles.s25eca887,
          styles.s4dfd873,
        ).className || '',
        stylex.props(styles_2.scad6aa7f).className || '',
        className,
      )}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <Plus className={stylex.props(styles.sca3de968).className || ''} />
    </Button>
  )
}

/**
 * Renders the plus button at the current cursor block if it's empty.
 * Inserts a slash on click. Mounted as a sibling of the editor,
 * positioned via a portal to document.body
 */
export function InlineAddBlockButton({editor}: {editor: HyperMediaEditor}) {
  const [pos, setPos] = useState<Position | null>(null)
  // Track last placement to not rerender on every keystroke.
  const lastRef = useRef<Position | null>(null)
  useEffect(() => {
    const ttEditor = editor._tiptapEditor
    if (!ttEditor) return
    const computePos = (): Position | null => {
      if (!editor.isEditable) return null
      const view = ttEditor.view
      const state = view.state
      if (!isSlashMenuEnabled(state)) return null
      const {anchor} = state.selection
      const $anchor = state.doc.resolve(anchor)
      const textblock = $anchor.parent
      if (!textblock.isTextblock || textblock.childCount > 0) return null
      // Code blocks are textblocks too, but inserting a block from an empty
      // line inside them makes no sense — suppress the button there.
      if (textblock.type.name === 'code-block' || textblock.type.spec.code) return null
      // Disable the button for table cells.
      for (let d = $anchor.depth; d > 0; d--) {
        const ancestor = $anchor.node(d)
        if (ancestor.type.name === 'tableCell' || ancestor.type.name === 'tableHeader') {
          return null
        }
      }
      // Check if the cursor's block is a list item.
      let inList = false
      for (let d = $anchor.depth; d > 0; d--) {
        const node = $anchor.node(d)
        if (node.type.name !== 'blockChildren') continue
        const listType = node.attrs.listType
        if (listType === 'Unordered' || listType === 'Ordered' || listType === 'Blockquote') {
          inList = true
        }
        break
      }
      try {
        const coords = view.coordsAtPos(anchor)
        return {
          top: (coords.top + coords.bottom) / 2 + window.scrollY,
          left: coords.left + window.scrollX - (inList ? 56 : 32),
        }
      } catch {
        return null
      }
    }
    const measurePos = () => {
      const next = computePos()
      const last = lastRef.current
      const same = !!next && !!last && next.top === last.top && next.left === last.left
      if (same) return
      if (!next && !last) return
      lastRef.current = next
      setPos(next)
    }

    // Multi-trigger approach to reliably catch when the block type changes.
    let pendingFrame: number | null = null
    const scheduleUpdate = () => {
      if (pendingFrame != null) return
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = null
        measurePos()
      })
    }
    const resizeObserver = new ResizeObserver(measurePos)
    resizeObserver.observe(ttEditor.view.dom)
    const mutationObserver = new MutationObserver(measurePos)
    mutationObserver.observe(ttEditor.view.dom, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-content-type'],
    })

    // After any content event, also schedule a delayed measure so
    // even a late React commit gets picked up.
    let pendingTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleDelayedUpdate = () => {
      if (pendingTimer != null) clearTimeout(pendingTimer)
      pendingTimer = setTimeout(() => {
        pendingTimer = null
        measurePos()
      }, 80)
    }
    const onPmEvent = () => {
      scheduleUpdate()
      scheduleDelayedUpdate()
    }
    scheduleUpdate()
    ttEditor.on('selectionUpdate', onPmEvent)
    ttEditor.on('update', onPmEvent)
    window.addEventListener('scroll', scheduleUpdate, true)
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (pendingFrame != null) cancelAnimationFrame(pendingFrame)
      if (pendingTimer != null) clearTimeout(pendingTimer)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      ttEditor.off('selectionUpdate', onPmEvent)
      ttEditor.off('update', onPmEvent)
      window.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [editor])
  if (!pos) return null
  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 10,
        transform: 'translateY(-50%)',
      }}
    >
      <AddBlockButton
        title="Insert block"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const view = editor._tiptapEditor.view
          view.focus()
          // Open the slash menu programmatically without inserting the trigger character.
          view.dispatch(
            view.state.tr.scrollIntoView().setMeta(slashMenuPluginKey, {
              activate: true,
            }),
          )
        }}
      />
    </div>,
    document.body,
  )
}
