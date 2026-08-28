import * as stylex from '@stylexjs/stylex'
import {copyUrlToClipboardWithFeedback} from '@shm/ui/copy-to-clipboard'
import {Link} from '@shm/ui/icons'
import {HMBlockSchema} from '../../../../../../schema'
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
export function CopyLinkToBlockButton<BSchema extends HMBlockSchema>({block, editor}: DragHandleMenuProps<BSchema>) {
  const url = editor.getResourceUrl?.(block.id)
  if (!url) return null
  return (
    <DragHandleMenuItem
      onClick={() => {
        copyUrlToClipboardWithFeedback(url, 'Block')
      }}
    >
      <div className={stylex.props(styles.s2ffff9, styles.s5d936fb).className || ''}>
        <Link size={14} />
        Copy link to Block
      </div>
    </DragHandleMenuItem>
  )
}
