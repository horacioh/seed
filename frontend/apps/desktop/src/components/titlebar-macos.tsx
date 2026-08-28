import * as stylex from '@stylexjs/stylex'
import {useSidebarContext, useSidebarWidth} from '@/sidebar-context'
import {useStream} from '@shm/shared/use-stream'
import {TitleText, TitlebarWrapper} from '@shm/ui/titlebar'
import {TitleBarProps} from './titlebar'
import {NavMenuButton, NavigationButtons, Omnibar, PageActionButtons} from './titlebar-common'
import {TitlebarMainRow} from './titlebar-layout'
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
})
const styles_3 = stylex.create({
  s348cc135: {
    width: '72px',
  },
})
const styles_2 = stylex.create({
  s3f582e10: {
    minHeight: 'calc(0.25rem * 0)',
  },
})
const styles = stylex.create({
  s112d13d8: {
    textAlign: 'center',
    fontWeight: '700',
  },
})
export default function TitleBarMacos(props: TitleBarProps) {
  const {clean, cleanTitle, ...restProps} = props
  const sidebarWidth = useSidebarWidth()
  const sidebarContext = useSidebarContext()
  const isSidebarLocked = !!useStream(sidebarContext.isLocked)
  if (clean) {
    return (
      <TitlebarWrapper className={stylex.props(styles_2.s3f582e10).className || ''} {...restProps}>
        <div
          className={
            stylex.props(styles_4.s2ffff9, styles_4.scdbaf625, styles_4.sc6ed1702, styles_4.sce22ca32).className || ''
          }
        >
          <TitleText className={stylex.props(styles.s112d13d8).className || ''}>{cleanTitle}</TitleText>
        </div>
      </TitlebarWrapper>
    )
  }
  return (
    <TitlebarWrapper {...restProps}>
      <TitlebarMainRow
        sidebarLocked={isSidebarLocked}
        sidebarWidth={sidebarWidth}
        sidebarControl={
          <NavMenuButton
            left={
              isSidebarLocked ? undefined : (
                <div
                  className={stylex.props(styles_3.s348cc135).className || ''} // this width to stay away from the macOS window traffic lights
                />
              )
            }
          />
        }
        navigation={<NavigationButtons />}
        omnibar={<Omnibar />}
        actions={<PageActionButtons {...restProps} />}
      />
    </TitlebarWrapper>
  )
}
