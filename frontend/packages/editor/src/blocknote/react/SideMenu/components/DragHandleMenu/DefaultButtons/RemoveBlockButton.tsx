import * as stylex from '@stylexjs/stylex'
import {BlockSchema} from '../../../../../core'
import {Delete} from '@shm/ui/icons'
import {ReactNode} from 'react'
import {DragHandleMenuProps} from '../DragHandleMenu'
import {DragHandleMenuItem} from '../DragHandleMenuItem'
const styles = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
})
export const RemoveBlockButton = <BSchema extends BlockSchema>(
  props: DragHandleMenuProps<BSchema> & {
    children: ReactNode
  },
) => {
  return (
    <DragHandleMenuItem onClick={() => props.editor.removeBlocks([props.block])}>
      <div className={stylex.props(styles.s2ffff9, styles.s5d936fb).className || ''}>
        <Delete size={14} />
        {props.children}
      </div>
    </DragHandleMenuItem>
  )
}
