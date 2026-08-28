import * as stylex from '@stylexjs/stylex'
import {cn} from '@shm/ui/utils'
import React, {ReactNode} from 'react'
const styles_3 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s349b27: {
    paddingRight: 'calc(0.25rem * 2)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sb42feb5d: {
    flex: '1',
  },
  s6044a01e: {
    justifyContent: 'flex-end',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
})
const styles_2 = stylex.create({
  s66c84de9: {
    justifyContent: 'flex-end',
    paddingRight: 'calc(0.25rem * 2)',
  },
  s6815e4fc: {
    justifyContent: 'flex-start',
    paddingLeft: 'calc(0.25rem * 2)',
  },
})
const styles = stylex.create({
  sb931bd5b: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    overflow: 'hidden',
    paddingInline: 'calc(0.25rem * 2)',
  },
})
export function TitlebarMainRow({
  sidebarLocked,
  sidebarWidth,
  sidebarControl,
  navigation,
  omnibar,
  actions,
  className,
}: {
  sidebarLocked: boolean
  sidebarWidth?: string
  sidebarControl: ReactNode
  navigation: ReactNode
  omnibar: ReactNode
  actions: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        stylex.props(styles_3.s2ffff9, styles_3.scdbaf625, styles_3.s3f58665f, styles_3.sc6ed1702, styles_3.s349b27)
          .className || '',
        'window-drag',
        className,
      )}
      data-titlebar-layout
    >
      <div
        className={cn(
          stylex.props(styles_3.s2ffff9, styles_3.sf032ed6c, styles_3.sc6ed1702).className || '',
          'window-drag',
          stylex.props(sidebarLocked ? styles_2.s66c84de9 : styles_2.s6815e4fc).className || '',
        )}
        style={
          sidebarLocked && sidebarWidth
            ? {
                width: sidebarWidth,
              }
            : undefined
        }
        data-titlebar-sidebar-region
      >
        {sidebarControl}
      </div>
      <div
        className={
          stylex.props(styles_3.s2ffff9, styles_3.s3f58665f, styles_3.sb42feb5d, styles_3.sc6ed1702).className || ''
        }
        data-titlebar-main-region
      >
        <div
          className={stylex.props(styles_3.s2ffff9, styles_3.sf032ed6c, styles_3.sc6ed1702).className || ''}
          data-titlebar-navigation-region
        >
          {navigation}
        </div>
        <div className={stylex.props(styles.sb931bd5b).className || ''} data-titlebar-omnibar-region>
          {omnibar}
        </div>
      </div>
      <div
        className={
          stylex.props(
            styles_3.s2ffff9,
            styles_3.s3f58665f,
            styles_3.sf032ed6c,
            styles_3.sc6ed1702,
            styles_3.s6044a01e,
            styles_3.s92852dd5,
          ).className || ''
        }
        data-titlebar-actions-region
      >
        {actions}
      </div>
    </div>
  )
}
