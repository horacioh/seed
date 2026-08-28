import * as stylex from '@stylexjs/stylex'
import {Button} from './button'
const styles = stylex.create({
  s2daecf89: {
    color: '#fff',
  },
})
export interface JoinButtonProps {
  onClick: () => void
  disabled?: boolean
}

/**
 * Shared Join button component used on both web and desktop.
 * - Web: triggers account creation or joins site
 * - Desktop: joins site and subscribes for P2P syncing
 */
export function JoinButton({onClick, disabled}: JoinButtonProps) {
  return (
    <Button
      variant="brand"
      size="sm"
      className={stylex.props(styles.s2daecf89).className || ''}
      onClick={onClick}
      disabled={disabled}
    >
      Join
    </Button>
  )
}
