import {CSSProperties, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState} from 'react'
import {MdDragIndicator} from 'react-icons/md'
import {Menu, useMantineTheme} from '@mantine/core'
import {BlockSchema} from '../../../../core'
import {setupBlockDraggable} from '../../../../core/extensions/SideMenu/pragmatic-dnd-bridge'
import {DefaultDragHandleMenu} from '../DragHandleMenu/DefaultDragHandleMenu'
import {SideMenuProps} from '../SideMenuPositioner'

export const DragHandle = <BSchema extends BlockSchema>(props: SideMenuProps<BSchema>) => {
  const theme = useMantineTheme()
  const dragRef = useRef<HTMLDivElement>(null)
  const [menuOpened, setMenuOpened] = useState(false)

  useEffect(() => {
    const el = dragRef.current
    if (!el) return
    if (!props.editor.dragStateManager || !props.editor.editorDragId) return

    return setupBlockDraggable(
      el,
      el,
      () => props.block?.id,
      props.editor,
      props.editor.dragStateManager,
      props.editor.editorDragId,
    )
  }, [props.editor, props.block?.id])

  useEffect(() => {
    if (!menuOpened) return
    const container = dragRef.current
    if (!container) return
    let focusedMenuItem = false
    const normalizeMenuContent = () => {
      const menuContent = container.querySelector<HTMLElement>('[data-menu-dropdown]')
      menuContent?.setAttribute('role', 'presentation')
      menuContent?.removeAttribute('tabindex')
      if (!focusedMenuItem) {
        const firstEnabledMenuItem = container.querySelector<HTMLElement>('[data-menu-item]:not([disabled])')
        if (firstEnabledMenuItem) {
          firstEnabledMenuItem.focus()
          focusedMenuItem = true
        }
      }
    }
    const observer = new MutationObserver(normalizeMenuContent)
    observer.observe(container, {childList: true, subtree: true, attributes: true, attributeFilter: ['tabindex']})
    normalizeMenuContent()
    return () => observer.disconnect()
  }, [menuOpened])

  useEffect(() => {
    const container = dragRef.current
    if (!container) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !(event.target instanceof Node) || !container.contains(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      setMenuOpened(false)
      requestAnimationFrame(() => props.editor.focus())
    }
    document.addEventListener('keydown', handleEscape, true)
    return () => document.removeEventListener('keydown', handleEscape, true)
  }, [props.editor])

  return (
    <div ref={dragRef} data-drag-handle>
      <Menu
        position="right-start"
        withinPortal={false}
        opened={menuOpened}
        onOpen={() => setMenuOpened(true)}
        onClose={() => setMenuOpened(false)}
      >
        <Menu.Target>
          <button
            type="button"
            aria-label="Block options"
            aria-haspopup="menu"
            aria-expanded={menuOpened}
            className="text-muted-foreground flex size-6 items-center justify-center rounded-md hover:bg-[var(--block-note-handle-hover-bg)] hover:text-[var(--block-note-handle-hover-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            style={
              {
                '--block-note-handle-hover-bg': theme.other.hovered?.background || theme.colors.gray[1],
                '--block-note-handle-hover-text': theme.other.hovered?.text || theme.black,
                borderRadius: theme.radius.sm,
              } as CSSProperties
            }
            onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
              if (event.key === 'Escape') {
                setMenuOpened(false)
                requestAnimationFrame(() => props.editor.focus())
              }
            }}
          >
            <MdDragIndicator size={24} data-test={'dragHandle'} />
          </button>
        </Menu.Target>
        <DefaultDragHandleMenu
          editor={props.editor}
          block={props.block}
          onEscape={() => {
            setMenuOpened(false)
            requestAnimationFrame(() => props.editor.focus())
          }}
        />
      </Menu>
    </div>
  )
}
