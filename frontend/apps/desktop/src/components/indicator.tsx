import * as stylex from '@stylexjs/stylex'
import {HTMLAttributes} from 'react'
const styles = stylex.create({
  sf3524627: {
    display: 'flex',
    width: 'calc(0.25rem * 4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export function OnlineIndicator({
  online,
  ...props
}: {
  online: boolean
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={stylex.props(styles.sf3524627).className || ''} {...props}>
      <div
        className={`size-2 rounded-full ${online ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-600'}`}
      />
    </div>
  )
}
