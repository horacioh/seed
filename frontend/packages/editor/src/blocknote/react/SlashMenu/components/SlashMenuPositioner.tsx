import * as stylex from '@stylexjs/stylex'
import Tippy from '@tippyjs/react'
import {FC, useEffect, useMemo, useRef, useState} from 'react'
import {
  BlockNoteEditor,
  BlockSchema,
  DefaultBlockSchema,
  SlashMenuProsemirrorPlugin,
  SuggestionsMenuState,
} from '../../../core'
import {ReactSlashMenuItem} from '../ReactSlashMenuItem'
import {DefaultSlashMenu} from './DefaultSlashMenu'
const styles = stylex.create({
  s61fdcb43: {
    maxHeight: '50vh',
  },
  s34a81de0: {
    width: '90vw',
  },
  sac38f2ae: {
    overflowY: 'auto',
  },
  saae5326: {
    '@media ((min-width: 640px))': {
      maxHeight: 'none',
    },
  },
  s9f801665: {
    '@media ((min-width: 640px))': {
      width: 'auto',
    },
  },
  sffb0e2c7: {
    '@media ((min-width: 640px))': {
      overflow: 'visible',
    },
  },
})
export type SlashMenuProps<BSchema extends BlockSchema = DefaultBlockSchema> = Pick<
  SlashMenuProsemirrorPlugin<BSchema, any>,
  'itemCallback'
> &
  Pick<SuggestionsMenuState<ReactSlashMenuItem<BSchema>>, 'filteredItems' | 'keyboardHoveredItemIndex'>
export const SlashMenuPositioner = <BSchema extends BlockSchema = DefaultBlockSchema>(props: {
  editor: BlockNoteEditor<BSchema>
  slashMenu?: FC<SlashMenuProps<BSchema>>
}) => {
  const [show, setShow] = useState<boolean>(false)
  const [filteredItems, setFilteredItems] = useState<ReactSlashMenuItem<BSchema>[]>()
  const [keyboardHoveredItemIndex, setKeyboardHoveredItemIndex] = useState<number>()
  const scroller = useRef<HTMLElement | null>(null)
  const referencePos = useRef<DOMRect>()
  useEffect(() => {
    setTimeout(() => {
      scroller.current = document.getElementById('scroll-page-wrapper')
    }, 100)
  }, [])
  useEffect(() => {
    return props.editor.slashMenu!.onUpdate((slashMenuState) => {
      setShow(slashMenuState.show)
      setFilteredItems(slashMenuState.filteredItems)
      setKeyboardHoveredItemIndex(slashMenuState.keyboardHoveredItemIndex)
      referencePos.current = slashMenuState.referencePos
    })
  }, [props.editor])
  const getReferenceClientRect = useMemo(
    () => {
      if (!referencePos.current) {
        return undefined
      }
      let boundingRect = referencePos.current!

      // When the menu is activated from the inline plus button, the suggestion
      // plugin decorates the whole block and Tippy ends up anchoring the menu
      // to the block's left edge. Detect that case and replace it with a zero
      // width rect at the cursor so the menu appears next to the cursor.
      if (boundingRect.width > 32) {
        const view = (props.editor as any)?._tiptapEditor?.view as
          | {
              state: {
                selection: {
                  from: number
                }
              }
              coordsAtPos: (pos: number) =>
                | DOMRect
                | {
                    top: number
                    left: number
                    bottom: number
                    right: number
                  }
            }
          | undefined
        if (view) {
          try {
            const coords = view.coordsAtPos(view.state.selection.from)
            boundingRect = {
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              right: coords.left,
              width: 0,
              height: coords.bottom - coords.top,
            } as DOMRect
          } catch {
            // posAtCoords can throw on stale positions. Fall back to the
            // original block rect rather than crash.
          }
        }
      }
      const newRect = {
        top: boundingRect.top,
        right: boundingRect.right,
        bottom: boundingRect.bottom,
        left: boundingRect.left,
        width: boundingRect.width,
        height: boundingRect.height,
      }
      if (boundingRect.bottom > window.innerHeight * 0.75) {
        newRect.top = boundingRect.top - 200
        newRect.bottom = boundingRect.top + 50
      }
      return () => newRect as DOMRect
    },
    [referencePos.current], // eslint-disable-line
  )
  const slashMenuElement = useMemo(() => {
    if (!filteredItems || keyboardHoveredItemIndex === undefined) {
      return null
    }
    const SlashMenu = props.slashMenu || DefaultSlashMenu
    return (
      <SlashMenu
        filteredItems={filteredItems}
        itemCallback={(item) => props.editor.slashMenu!.itemCallback(item)}
        keyboardHoveredItemIndex={keyboardHoveredItemIndex}
      />
    )
  }, [filteredItems, keyboardHoveredItemIndex, props.editor.slashMenu!, props.slashMenu])
  return (
    <Tippy
      // Always append to document.body so the popup escapes any container
      // stacking context.
      appendTo={document.body}
      content={
        <div
          className={
            stylex.props(
              styles.s61fdcb43,
              styles.s34a81de0,
              styles.sac38f2ae,
              styles.saae5326,
              styles.s9f801665,
              styles.sffb0e2c7,
            ).className || ''
          }
        >
          {slashMenuElement}
        </div>
      }
      getReferenceClientRect={getReferenceClientRect}
      interactive={true}
      visible={show}
      animation={'fade'}
      placement="auto"
      zIndex={100000}
    />
  )
}
