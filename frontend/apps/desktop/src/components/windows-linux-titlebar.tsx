import * as stylex from '@stylexjs/stylex'
import {useIPC, useWindowUtils} from '@/app-context'
import {WindowsLinuxWindowControls} from '@/components/window-controls'
import {useCreateDraft} from '@/models/documents'
import {useSelectedAccountId} from '@/selected-account'
import {useNavigate} from '@/utils/useNavigate'
import {useTriggerWindowEvent} from '@/utils/window-events'
import {defaultRoute} from '@shm/shared/routes'
import {useNavRoute, useNavigationDispatch} from '@shm/shared/utils/navigation'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@shm/ui/components/menubar'
import {AddSquare, Close, CloseAll, Contact, Delete, Hide, Reload, Search, Settings} from '@shm/ui/icons'
import {TitlebarRow, TitlebarSection, TitlebarWrapper} from '@shm/ui/titlebar'
import {useMemo} from 'react'
const styles_2 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  sb42feb5d: {
    flex: '1',
  },
  scad93cc1: {
    minWidth: 'min-content',
  },
  s948be48c: {
    flex: 'none',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s6044a01e: {
    justifyContent: 'flex-end',
  },
  s3484a1: {
    paddingLeft: 'calc(0.25rem * 2)',
  },
})
const styles = stylex.create({
  s1a67a0f6: {
    pointerEvents: 'none',
    display: 'flex',
    height: '100%',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
})
export function WindowsLinuxTitleBar({
  left,
  title,
  right,
}: {
  title: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <TitlebarWrapper
      className="window-drag"
      style={{
        flex: 'none',
      }}
    >
      <TitlebarRow>
        <TitlebarSection>
          <SystemMenu />
        </TitlebarSection>
        <div className={stylex.props(styles_2.s2ffff9, styles_2.sb42feb5d).className || ''} />
        <TitlebarSection>
          <WindowsLinuxWindowControls />
        </TitlebarSection>
      </TitlebarRow>
      <TitlebarRow className="window-drag">
        <div
          className={
            stylex.props(styles_2.s2ffff9, styles_2.scad93cc1, styles_2.s948be48c, styles_2.sc6ed1702).className || ''
          }
        >
          {left}
        </div>
        <div className={stylex.props(styles.s1a67a0f6).className || ''}>{title}</div>
        <div
          className={
            stylex.props(
              styles_2.s2ffff9,
              styles_2.scad93cc1,
              styles_2.s948be48c,
              styles_2.sc6ed1702,
              styles_2.s6044a01e,
            ).className || ''
          }
        >
          {right}
        </div>
      </TitlebarRow>
    </TitlebarWrapper>
  )
}
export function SystemMenu() {
  const {hide, close, quit, minimize, maximize, unmaximize, isMaximized} = useWindowUtils()
  const spawn = useNavigate('spawn')
  const push = useNavigate('push')
  const navDispatch = useNavigationDispatch()
  const route = useNavRoute()
  const triggerFocusedWindow = useTriggerWindowEvent()
  const {invoke} = useIPC()
  const selectedAccountId = useSelectedAccountId()
  const createDraft = useCreateDraft({
    locationUid: selectedAccountId ?? undefined,
    locationPath: [],
  })
  const menuItems = useMemo<MenuItemElement[]>(
    () =>
      [
        {
          id: 'seed',
          title: 'Seed',
          children: [
            {
              id: 'preferences',
              title: 'Preferences…',
              accelerator: 'Ctrl+,',
              onSelect: () =>
                spawn({
                  key: 'settings',
                }),
              icon: <Settings className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'separator',
            },
            {
              id: 'quickswitcher',
              title: 'Search / Open',
              accelerator: 'Ctrl+K',
              onSelect: () =>
                triggerFocusedWindow({
                  type: 'open_launcher',
                }),
              icon: <Search className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'app-update',
              title: 'Check for Updates',
              onSelect: () => window.autoUpdate?.checkForUpdates(),
            },
            {
              id: 'separator',
            },
            {
              id: 'hide',
              title: 'Hide',
              accelerator: 'Ctrl+H',
              onSelect: () => hide(),
              icon: <Hide className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'quit',
              title: 'Quit Seed',
              onSelect: () => quit(),
              icon: <Delete className={stylex.props(styles.sca3de968).className || ''} />,
            },
          ],
        },
        {
          title: 'File',
          id: 'file',
          children: [
            {
              id: 'newdocument',
              title: 'New Document',
              accelerator: 'Ctrl+Alt+N',
              onSelect: () => {
                void createDraft()
              },
              icon: <AddSquare className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'newwindow',
              title: 'New Window',
              accelerator: 'Ctrl+Shift+N',
              onSelect: () => spawn(defaultRoute),
              icon: <AddSquare className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'separator',
            },
            {
              id: 'minimize',
              title: 'Minimize Window',
              accelerator: 'Ctrl+M',
              onSelect: minimize,
            },
            {
              id: 'maximize',
              title: 'Maximize Window',
              accelerator: 'Ctrl+Up',
              onSelect: () => {
                if (isMaximized) {
                  unmaximize()
                } else {
                  maximize()
                }
              },
            },
            {
              id: 'separator',
            },
            {
              id: 'close',
              title: 'Close Window  ',
              accelerator: 'Ctrl+F4',
              onSelect: () => close(),
              icon: <Close className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'closeallwindows',
              title: 'Close all Windows',
              accelerator: 'Ctrl+Shift+Alt+W',
              onSelect: () => invoke('close_all_windows'),
              icon: <CloseAll className={stylex.props(styles.sca3de968).className || ''} />,
            },
          ],
        },
        {
          id: 'view',
          title: 'View',
          children: [
            {
              id: 'back',
              title: 'Back',
              accelerator: 'Ctrl+◀︎',
              onSelect: () =>
                navDispatch({
                  type: 'pop',
                }),
            },
            {
              id: 'forward',
              title: 'Forward',
              accelerator: 'Ctrl+▶︎',
              onSelect: () =>
                navDispatch({
                  type: 'forward',
                }),
            },
            {
              id: 'contacts',
              title: 'Contacts',
              accelerator: 'Ctrl+9',
              onSelect: () =>
                push({
                  key: 'contacts',
                }),
              icon: <Contact className={stylex.props(styles.sca3de968).className || ''} />,
              disabled: route.key == 'contacts',
            },
            {
              id: 'reload',
              title: 'Reload',
              accelerator: 'Ctrl+R',
              onSelect: () => window.location.reload(),
              icon: <Reload className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'forcereload',
              title: 'Force Reload',
              accelerator: 'Ctrl+Shift+R',
              onSelect: () => window.location.reload(),
              icon: <Reload className={stylex.props(styles.sca3de968).className || ''} />,
            },
            {
              id: 'discover',
              title: 'Discover current Document',
              accelerator: 'Ctrl+D',
              disabled: route.key != 'document',
              onSelect: () =>
                triggerFocusedWindow({
                  type: 'discover',
                }),
            },
          ],
        },
      ] as MenuItemElement[],
    [createDraft, close, hide, invoke, spawn, triggerFocusedWindow, route.key, navDispatch, push],
  )
  return (
    <div className={stylex.props(styles_2.s2ffff9, styles_2.s3484a1).className || ''}>
      <Menubar>
        {menuItems.map((item: MenuItemElement) => (
          <MenubarMenu key={item.id}>
            <MenubarTrigger className={stylex.props(styles.sa16ea943).className || ''}>{item.title}</MenubarTrigger>
            <MenubarContent>
              {item.children.map(
                (
                  p:
                    | SubMenuItemElement
                    | {
                        id: 'separator'
                      },
                ) => {
                  if (p.id == 'separator') {
                    return <MenubarSeparator key={p.id} />
                  } else {
                    let item: SubMenuItemElement = p as SubMenuItemElement
                    return (
                      <MenubarItem onClick={item.onSelect} disabled={item.disabled}>
                        {item.title}
                        {item.accelerator && <MenubarShortcut>{item.accelerator}</MenubarShortcut>}
                      </MenubarItem>
                    )
                  }
                },
              )}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    </div>
  )
}
type MenuItemElement = {
  id: string
  title: string
  children: Array<
    | SubMenuItemElement
    | {
        id: 'separator'
      }
  >
}
type SubMenuItemElement = {
  id: string
  title: string
  onSelect: () => void
  icon?: React.ReactNode
  accelerator?: string
  disabled?: boolean
}
