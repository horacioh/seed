import {Block, BlockNoteEditor, BlockSchema} from '../../../../core'
import {Menu, createStyles} from '@mantine/core'
import {ReactNode} from 'react'

export type DragHandleMenuProps<BSchema extends BlockSchema> = {
  editor: BlockNoteEditor<BSchema>
  block: Block<BSchema>
}

export const DragHandleMenu = (props: {children: ReactNode; onEscape?: () => void}) => {
  const {classes} = createStyles({
    root: {
      minWidth: 180,
    },
  })(undefined, {
    name: 'DragHandleMenu',
  })

  return (
    <Menu.Dropdown
      className={classes.root}
      role="menu"
      aria-label="Block options"
      onKeyDownCapture={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          props.onEscape?.()
        }
      }}
    >
      {props.children}
    </Menu.Dropdown>
  )
}
