import * as stylex from '@stylexjs/stylex'
import {AlertCircle} from '@shm/ui/icons'
import {NavigationButtons, NavMenuButton} from './titlebar-common'
import {WindowsLinuxTitleBar} from './windows-linux-titlebar'
const styles = stylex.create({
  sdb540db7: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
    paddingInline: 'calc(0.25rem * 0)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s22db9e54: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s5f1364d1: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(63.7% 0.237 25.331)',
  },
})
export default function ErrorBarWindowsLinux() {
  return (
    <WindowsLinuxTitleBar
      left={
        <div className={stylex.props(styles.sdb540db7).className || ''}>
          <NavMenuButton />
          <NavigationButtons />
        </div>
      }
      title={
        <div className={stylex.props(styles.s22db9e54).className || ''}>
          <AlertCircle size={16} className={stylex.props(styles.s5f1364d1).className || ''} />
        </div>
      }
    />
  )
}
