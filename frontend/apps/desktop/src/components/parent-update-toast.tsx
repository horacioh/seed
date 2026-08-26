import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
const styles = stylex.create({
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sa3871be7: {
    height: 'auto',
    padding: 'calc(0.25rem * 0)',
  },
})
export function ParentUpdateToast({message, onViewParent}: {message: string; onViewParent: () => void}) {
  return (
    <div className={stylex.props(styles.s86ff3e4).className || ''}>
      <span>{message}</span>
      <Button
        size="xs"
        variant="link"
        className={stylex.props(styles.sa3871be7).className || ''}
        onClick={onViewParent}
      >
        View parent
      </Button>
    </div>
  )
}
