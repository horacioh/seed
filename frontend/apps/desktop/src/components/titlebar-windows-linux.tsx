import * as stylex from '@stylexjs/stylex'
import {CloseButton, WindowsLinuxWindowControls} from '@/components/window-controls'
import {useSidebarContext, useSidebarWidth} from '@/sidebar-context'
import {useStream} from '@shm/shared/use-stream'
import {TitlebarWrapper, TitleText} from '@shm/ui/titlebar'
import {TitleBarProps} from './titlebar'
import {NavigationButtons, NavMenuButton, Omnibar, PageActionButtons} from './titlebar-common'
import {TitlebarMainRow} from './titlebar-layout'
import './titlebar-windows-linux.css'
import {SystemMenu} from './windows-linux-titlebar'
const styles_3 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  sb42244d4: {
    height: '100%',
  },
})
const styles_2 = stylex.create({
  s3f582e10: {
    minHeight: 'calc(0.25rem * 0)',
  },
  title: {
    marginInline: '1rem',
  },
})
const styles = stylex.create({
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  s517412d1: {
    borderBottomColor: 'var(--border)',
    display: 'flex',
    height: 'calc(0.25rem * 6)',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
})
export default function TitleBarWindows(props: TitleBarProps) {
  const sidebarWidth = useSidebarWidth()
  const sidebarContext = useSidebarContext()
  const isSidebarLocked = !!useStream(sidebarContext.isLocked)
  if (props.clean) {
    return (
      <TitlebarWrapper className={stylex.props(styles_2.s3f582e10).className || ''}>
        <div className={stylex.props(styles_3.s2ffff9, styles_3.s34b1ad).className || ''}>
          <div
            className={
              stylex.props(styles_3.s2ffff9, styles_3.sb42feb5d, styles_3.sc6ed1702, styles_3.sce22ca32).className || ''
            }
          >
            <TitleText weight="bold" className={stylex.props(styles_2.title).className || ''}>
              {props.cleanTitle}
            </TitleText>
          </div>
          <div className={stylex.props(styles_3.s2ffff9).className || ''}>
            <CloseButton />
          </div>
        </div>
      </TitlebarWrapper>
    )
  }
  return (
    <WindowsLinuxTitleBar
      content={
        <TitlebarMainRow
          sidebarLocked={isSidebarLocked}
          sidebarWidth={sidebarWidth}
          sidebarControl={<NavMenuButton />}
          navigation={<NavigationButtons />}
          omnibar={<Omnibar />}
          actions={<PageActionButtons />}
        />
      }
    />
  )
}
export function WindowsLinuxTitleBar({content, platform}: {content: React.ReactNode; platform?: string}) {
  return (
    <div className={stylex.props(styles.s783f19f3).className || ''}>
      <div
        className={stylex.props(styles.s517412d1).className || ''}
        style={{
          backgroundColor: 'var(--background)',
        }}
      >
        <SystemMenu />
        <div className={stylex.props(styles_3.s2ffff9, styles_3.sb42244d4, styles_3.sb42feb5d).className || ''} />
        <WindowsLinuxWindowControls />
      </div>

      {/* @ts-expect-error */}
      <TitlebarWrapper platform={platform}>{content}</TitlebarWrapper>
    </div>
  )
}
