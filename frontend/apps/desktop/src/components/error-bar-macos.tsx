import * as stylex from '@stylexjs/stylex'
import {TitlebarWrapper} from '@shm/ui/titlebar'
import {AlertCircle} from 'lucide-react'
import {NavMenuButton, NavigationButtons} from './titlebar-common'
const styles = stylex.create({
  s5f6cd3a4: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s22db9e54: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s51ab7e65: {
    color: 'var(--destructive)',
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export default function ErrorBar() {
  return (
    <TitlebarWrapper>
      <div className={stylex.props(styles.s5f6cd3a4).className || ''}>
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          <NavMenuButton />
          <NavigationButtons />
        </div>
        <div className={stylex.props(styles.s22db9e54).className || ''}>
          <AlertCircle className={stylex.props(styles.s51ab7e65).className || ''} />
        </div>
      </div>
    </TitlebarWrapper>
  )
}
