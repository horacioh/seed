import * as stylex from '@stylexjs/stylex'
import {HTMLAttributes} from 'react'
const styles_3 = stylex.create({
  s460ef764: {
    backgroundColor: 'oklch(62.7% 0.194 149.214)',
  },
  s5f845352: {
    backgroundColor: 'oklch(70.7% 0.022 261.325)',
  },
})
const styles_2 = stylex.create({
  sca3de966: {
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
})
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
        className={
          (stylex.props(styles_2.sca3de966, styles_2.s775755af).className || '') +
          ' ' +
          (online ? stylex.props(styles_3.s460ef764).className || '' : stylex.props(styles_3.s5f845352).className || '')
        }
      />
    </div>
  )
}
