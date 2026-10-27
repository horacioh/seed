// @ts-expect-error
import {Block, BlockNoteEditor, HMBlockSchema} from '@'
import {getBlockSiblingIndex} from '../../../../core/BlockNoteEditor'
import {updateGroup} from '../../../../../block-utils'
import {Box, Menu} from '@mantine/core'
import {Forward, RefreshCcw} from '@shm/ui/icons'
import groupBy from 'lodash/groupBy'
import forEach from 'lodash/forEach'
import {useCallback, useEffect, useRef, useState} from 'react'
import {
  RiChatQuoteLine,
  RiCodeBoxLine,
  RiHeading,
  RiListOrdered,
  RiListUnordered,
  RiMenuLine,
  RiText,
} from 'react-icons/ri'
import {CopyLinkToBlockButton} from './DefaultButtons/CopyLinkToBlockButton'
import {RemoveBlockButton} from './DefaultButtons/RemoveBlockButton'
import {DragHandleMenu, DragHandleMenuProps} from './DragHandleMenu'
import {DragHandleMenuItem} from './DragHandleMenuItem'

export const DefaultDragHandleMenu = <BSchema extends HMBlockSchema>(
  props: DragHandleMenuProps<BSchema> & {onEscape?: () => void},
) => {
  const {index, count} = getBlockSiblingIndex(props.editor._tiptapEditor.state, props.block.id)

  return (
    <DragHandleMenu onEscape={props.onEscape}>
      <DragHandleMenuItem
        disabled={index <= 0}
        onClick={() => {
          if (props.editor.moveBlock(props.block, 'up')) props.editor.announceAccessibilityMessage('Moved block up')
        }}
      >
        Move up
      </DragHandleMenuItem>
      <DragHandleMenuItem
        disabled={index < 0 || index >= count - 1}
        onClick={() => {
          if (props.editor.moveBlock(props.block, 'down')) props.editor.announceAccessibilityMessage('Moved block down')
        }}
      >
        Move down
      </DragHandleMenuItem>
      <RemoveBlockButton {...props}>Delete</RemoveBlockButton>
      <TurnIntoMenu {...props} />
      <CopyLinkToBlockButton {...props} />
    </DragHandleMenu>
  )
}

function TurnIntoMenu(props: DragHandleMenuProps<HMBlockSchema>) {
  const [opened, setOpened] = useState(false)

  const menuCloseTimer = useRef<NodeJS.Timeout | undefined>()
  const menuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!opened) return
    const container = menuContainerRef.current
    if (!container) return
    const normalizeMenuContent = () => {
      const menuContent = container.querySelector<HTMLElement>('[data-menu-dropdown]')
      menuContent?.setAttribute('role', 'presentation')
      menuContent?.removeAttribute('tabindex')
    }
    const observer = new MutationObserver(normalizeMenuContent)
    observer.observe(container, {childList: true, subtree: true, attributes: true, attributeFilter: ['tabindex']})
    normalizeMenuContent()
    return () => observer.disconnect()
  }, [opened])

  const startMenuCloseTimer = useCallback(() => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current)
    }
    menuCloseTimer.current = setTimeout(() => {
      setOpened(false)
    }, 250)
  }, [])

  const stopMenuCloseTimer = useCallback(() => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current)
    }
    setOpened(true)
  }, [])

  const groups = groupBy(turnIntoItems, (i) => i.group)
  const renderedItems: any[] = []
  let index = 0

  forEach(groups, (groupedItems) => {
    renderedItems.push(
      <Menu.Label key={groupedItems[0]?.group} role="presentation">
        {groupedItems[0]?.group}
      </Menu.Label>,
    )

    for (const item of groupedItems) {
      renderedItems.push(
        <Menu.Item
          key={item.label}
          onClick={() => {
            item.onClick(props)
          }}
          component="div"
          icon={<item.Icon size={12} />}
        >
          {item.label}
        </Menu.Item>,
      )
      index++
    }
  })

  if (!props.block.type) {
    return null
  }

  return (
    <div ref={menuContainerRef} role="presentation">
      <Menu opened={opened} position="right" trigger="hover" withinPortal={false}>
        <Menu.Target>
          <button
            type="button"
            role="menuitem"
            aria-label="Turn into"
            aria-haspopup="menu"
            aria-expanded={opened}
            className="flex w-full items-center gap-2"
            onMouseOver={stopMenuCloseTimer}
            onMouseLeave={startMenuCloseTimer}
            onFocus={stopMenuCloseTimer}
            onBlur={startMenuCloseTimer}
          >
            <RefreshCcw size={14} />
            <span style={{flex: 1}}>Turn into</span>
            <Box style={{display: 'flex', alignItems: 'center'}}>
              <Forward size={12} />
            </Box>
          </button>
        </Menu.Target>
        <Menu.Dropdown
          role="menu"
          aria-label="Turn into"
          onMouseLeave={startMenuCloseTimer}
          onMouseOver={stopMenuCloseTimer}
          style={{marginLeft: '5px'}}
        >
          {renderedItems}
        </Menu.Dropdown>
      </Menu>
    </div>
  )
}

var turnIntoItems = [
  {
    label: 'Paragraph',
    group: 'Block operations',
    Icon: RiText,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      editor.updateBlock(block, {
        type: 'paragraph',
        props: {},
      })
    },
  },
  {
    label: 'Heading',
    group: 'Block operations',
    Icon: RiHeading,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      editor.updateBlock(block, {
        type: 'heading',
        props: {},
      })
    },
  },
  {
    label: 'Code',
    group: 'Block operations',
    Icon: RiCodeBoxLine,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      editor.updateBlock(
        block,
        {
          type: 'code-block',
          props: {},
          content: block.content,
        },
        true,
      )
    },
  },
  // {
  //   label: 'Block Quote',
  //   group: 'Group operations',
  //   Icon: RiChatQuoteFill,
  //   onClick: ({
  //     block,
  //     editor,
  //   }: {
  //     block: Block<HMBlockSchema>
  //     editor: BlockNoteEditor<HMBlockSchema>
  //   }) => {
  //     editor.focus()
  //     updateGroup(editor, block, 'Blockquote')
  //   },
  // },
  {
    label: 'Bullet item',
    group: 'Group operations',
    Icon: RiListUnordered,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      updateGroup(editor, block, 'Unordered')
    },
  },
  {
    label: 'Numbered item',
    group: 'Group operations',
    Icon: RiListOrdered,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      updateGroup(editor, block, 'Ordered')
    },
  },
  {
    label: 'Group item',
    group: 'Group operations',
    Icon: RiMenuLine,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      updateGroup(editor, block, 'Group')
    },
  },

  {
    label: 'Blockquote item',
    group: 'Group operations',
    Icon: RiChatQuoteLine,
    onClick: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) => {
      editor.focus()
      updateGroup(editor, block, 'Blockquote')
    },
  },
]
