import * as stylex from '@stylexjs/stylex'
import {UserCheck, UserPlus} from 'lucide-react'
const styles_2 = stylex.create({
  s2369980f: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--surface-gray)',
    padding: 'calc(var(--spacing) * 2)',
    fontWeight: 'var(--font-weight-bold)',
    boxShadow: 'var(--shadow-lg)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray-100)',
      },
    },
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export interface FollowButtonProps {
  onClick: () => void
  disabled?: boolean
  isFollowing?: boolean
}

/**
 * Shared Follow button component used on both web and desktop.
 * Shows "Follow" when not following, "Following" when already following.
 */
export function FollowButton({onClick, disabled, isFollowing}: FollowButtonProps) {
  return (
    <button className={stylex.props(styles_2.s2369980f).className || ''} onClick={onClick} disabled={disabled}>
      {isFollowing ? (
        <>
          <UserCheck className={stylex.props(styles.sca3de968).className || ''} />
          Following
        </>
      ) : (
        <>
          <UserPlus className={stylex.props(styles.sca3de968).className || ''} />
          Follow
        </>
      )}
    </button>
  )
}
