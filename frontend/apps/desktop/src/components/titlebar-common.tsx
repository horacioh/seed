import * as stylex from '@stylexjs/stylex'
import {domainResolver} from '@/grpc-client'
import {roleCanWrite, useSelectedAccountCapability} from '@/models/access-control'
import {DEFAULT_AGENT_SERVER_URL} from '@/agents-defaults'
import {
  agentRouteServerUrl,
  isLocalAgentServer,
  LOCAL_AGENT_SERVER_LABEL,
  useAgentSession,
  useLocalAgentServerUrl,
} from '@shm/ui/agents/models'
import {useForceVaultSync, useLogout, useMyAccountIds, useVaultStatus} from '@/models/daemon'
import {useExistingDraft} from '@/models/drafts'
import {useGatewayUrl} from '@/models/gateway-settings'
import {useNotificationInbox} from '@/models/notification-inbox'
import {isNotificationEventRead, useLocalNotificationReadState} from '@/models/notification-read-state'
import {
  agentSessionUrl,
  agentTriggerUrl,
  agentUrl,
  resolveOmnibarUrlToRoute,
  selectValidatedOmnibarSiteUrl,
} from '@/omnibar-url'
import {useSelectedAccount, useSelectedAccountId} from '@/selected-account'
import {SidebarContext} from '@/sidebar-context'
import {client} from '@/trpc'
import {pathNameify} from '@/utils/path'
import {useNavigate} from '@/utils/useNavigate'
import {useListenAppEvent} from '@/utils/window-events'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useUniversalAppContext} from '@shm/shared'
import {VaultBackendMode, VaultConnectionStatus} from '@shm/shared/client/.generated/daemon/v1alpha/daemon_pb'
import {DEFAULT_GATEWAY_URL} from '@shm/shared/constants'
import {useAccount, useAccounts, useDomain, useResource} from '@shm/shared/models/entity'
import {queryKeys} from '@shm/shared/models/query-keys'
import {DocumentRoute, FeedRoute, NavRoute} from '@shm/shared/routes'
import {useStream} from '@shm/shared/use-stream'
import {createWebHMUrl, hmId, routeToUrl, unpackHmId} from '@shm/shared/utils/entity-id-url'
import {useNavigationDispatch, useNavigationState, useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shm/ui/components/dropdown-menu'
import {LogoutVaultDialog} from '@shm/ui/components/logout-vault-dialog'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {HMIcon} from '@shm/ui/hm-icon'
import {Back, Forward, UploadCloud} from '@shm/ui/icons'
import {Spinner} from '@shm/ui/spinner'
import {TitlebarSection} from '@shm/ui/titlebar'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {useQuery} from '@tanstack/react-query'
import {
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Lock,
  LogIn,
  LogOut,
  PanelLeft,
  Plus,
  Search,
  Settings,
  User,
  UserCog,
} from 'lucide-react'
import {ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {BookmarkButton} from './bookmarking'
import {BookmarksPopover} from './bookmarks-popover'
import {CopyReferenceButton} from './copy-reference-button'
import {useCreateAccountDialog} from './create-account'
import {useDesktopAuthDialog} from './desktop-auth-dialog'
import {usePublishSite} from './publish-site'
import {SearchInput, SearchInputHandle} from './search-input'
import {TitleBarProps} from './titlebar'

// Route keys that have an id and support DocOptionsButton
const styles_6 = stylex.create({
  sfb4c68be: {
    '::placeholder': {
      color: 'var(--muted-foreground)',
    },
  },
})
const styles_5 = stylex.create({
  s7c401ed0: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sdef3facc: {
    position: 'relative',
  },
  s18c13: {
    height: 'calc(0.25rem * 8)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sc5a0131: {
    borderColor: 'transparent',
  },
  s2ffff9: {
    display: 'flex',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s382452: {
    zIndex: '10',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  sc5dd1033: {
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s9faef944: {
    cursor: 'text',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  s3484a1: {
    paddingLeft: 'calc(0.25rem * 2)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s82357e4e: {
    width: 'var(--radix-popover-trigger-width)',
  },
  sf887c4ab: {
    minWidth: '400px',
  },
  s7c401ecf: {
    borderStyle: 'solid',
    borderWidth: '0px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  sa0080bc5: {
    boxShadow: 'none',
  },
})
const styles_4 = stylex.create({
  s9888f71c: {
    cursor: 'default',
    borderColor: 'var(--overlay-15)',
    backgroundColor: 'var(--overlay-10)',
    boxShadow: 'var(--shadow-xs)',
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'var(--overlay-20)',
        backgroundColor: 'var(--overlay-15)',
      },
    },
  },
  sc5a0131: {
    borderColor: 'transparent',
  },
  s92ffee34: {
    display: 'flex',
    height: 'calc(var(--spacing) * 5)',
    minWidth: 'calc(var(--spacing) * 5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-red-500)',
    paddingInline: 'calc(var(--spacing) * 1)',
    fontSize: '12px',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-white)',
  },
  s908b9122: {
    width: '320px',
    borderRadius: 'var(--radius-2xl)',
    padding: 'calc(var(--spacing) * 0)',
  },
  s1272d10: {
    display: 'flex',
    width: 'calc(var(--spacing) * 11)',
    height: 'calc(var(--spacing) * 11)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-10)',
    backgroundColor: 'var(--surface-translucent)',
  },
  sab3e94c3: {
    marginBlock: 'calc(var(--spacing) * 0)',
    backgroundColor: 'var(--overlay-10)',
  },
  sd0b844d5: {
    backgroundColor: 'var(--surface-muted-sunken)',
    display: 'flex',
    width: 'calc(var(--spacing) * 11)',
    height: 'calc(var(--spacing) * 11)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  s549e562e: {
    width: '260px',
  },
  sfb2e96dc: {
    margin: 'calc(var(--spacing) * 1)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--overlay-10)',
    backgroundColor: 'var(--surface-black-tint)',
    padding: 'calc(var(--spacing) * 1)',
  },
  s6a2552da: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 2)',
  },
  sc32e317e: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  s191d0534: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    ':disabled': {
      opacity: '60%',
    },
  },
  sc04d6692: {
    backgroundColor: 'var(--overlay-10)',
  },
  s592e9984: {
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'var(--border)',
        backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
    backgroundColor: 'var(--surface-contrast)',
  },
  s92b9805b: {
    borderColor: 'var(--primary)',
    backgroundColor: 'var(--surface-contrast)',
  },
  s623ccd8d: {
    ':focus-within': {
      boxShadow: '0 0 0 1px currentcolor',
    },
  },
  s8974ddde: {
    minWidth: 'calc(var(--spacing) * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    outlineStyle: 'none',
  },
  s82dde684: {
    borderColor: 'var(--border)',
    maxHeight: '280px',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: 'var(--surface)',
    padding: 'calc(var(--spacing) * 2)',
    boxShadow: 'var(--shadow-2xl)',
  },
})
const styles_3 = stylex.create({
  sc5a0131: {
    borderColor: 'transparent',
  },
  s34b56c: {
    paddingBlock: 'calc(0.25rem * 0)',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
})
const styles_2 = stylex.create({
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
  s584bf345: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    textAlign: 'left',
  },
  safdaede1: {
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s242145e8: {
    color: 'var(--muted-foreground)',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  see307b2f: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s946f13fd: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
  },
  s9ccd4aa7: {
    maxWidth: '42rem',
  },
  see8a63b2: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    overflow: 'hidden',
  },
  s2618e1af: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    minWidth: 'calc(0.25rem * 6)',
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sb53e5ce9: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  s3566be63: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s48010636: {
    cursor: 'pointer',
    gap: 'calc(0.25rem * 3)',
    borderRadius: '0',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  se0a4e204: {
    fontSize: '0.875rem',
    lineHeight: '1.25',
    fontWeight: '500',
  },
  s6d876997: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    fontSize: '0.875rem',
    lineHeight: '1.25',
  },
  s2f251391: {
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    borderRadius: '0',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s3facd310: {
    cursor: 'pointer',
    gap: 'calc(0.25rem * 3)',
    borderRadius: '0',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sf9c0c009: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  s59c17cd3: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  sf8eef924: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s2b214c4f: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s8a0ec2b7: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flexShrink: '0',
    opacity: '60%',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s8bcb4b84: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
    paddingInline: 'calc(0.25rem * 2)',
  },
  s69c7b445: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 0.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  s2cc286a6: {
    marginRight: 'calc(0.25rem * 1)',
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s26a52803: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    flexShrink: '0',
  },
})
const DOC_OPTIONS_ROUTE_KEYS = [
  'document',
  'feed',
  'activity',
  'comments',
  'directory',
  'collaborators',
  'inspect',
  'all-documents',
  'metadata',
] as const
type DocOptionsRouteKey = (typeof DOC_OPTIONS_ROUTE_KEYS)[number]
const OMNIBAR_DOMAIN_STALE_TIME_MS = 3 * 60 * 60 * 1000
function getUrlHostname(url?: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname || null
  } catch {
    return null
  }
}
function isDocOptionsRoute(route: NavRoute): route is NavRoute & {
  key: DocOptionsRouteKey
  id: UnpackedHypermediaId
} {
  return DOC_OPTIONS_ROUTE_KEYS.includes(route.key as DocOptionsRouteKey) && 'id' in route
}
export function DocOptionsButton(_props: {
  onPublishSite: (input: {id: UnpackedHypermediaId; step?: 'seed-host-custom-domain'}) => void
}) {
  return null
}
function NotificationButton() {
  const accountUid = useSelectedAccountId()
  if (!accountUid) return null
  return <NotificationButtonForAccount accountUid={accountUid} />
}
function NotificationButtonForAccount({accountUid}: {accountUid: string}) {
  const navigate = useNavigate()
  const route = useNavRoute()
  const inbox = useNotificationInbox(accountUid)
  const readState = useLocalNotificationReadState(accountUid)
  const isActive = route.key === 'notifications'
  const persistedView = useQuery({
    queryKey: [queryKeys.SETTINGS, 'notifications-view'],
    queryFn: () => client.appSettings.getSetting.query('notifications-view'),
  })
  const unreadCount = useMemo(() => {
    if (!inbox.data || !readState.data) return 0
    return inbox.data.filter(
      (item) =>
        !isNotificationEventRead({
          readState: readState.data,
          eventId: item.feedEventId,
          eventAtMs: item.eventAtMs,
        }),
    ).length
  }, [inbox.data, readState.data])
  return (
    <Tooltip content="Notifications" asChild>
      <Button
        className={cn(
          stylex.props(styles_5.s7c401ed0, styles_5.sdef3facc, styles_5.s18c13, styles_5.s775755af, styles_5.s1aa13)
            .className || '',
          'window-no-drag',
          stylex.props(isActive ? styles_4.s9888f71c : styles_4.sc5a0131).className || '',
        )}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={isActive || undefined}
        onClick={
          isActive
            ? undefined
            : () => {
                const view = persistedView.data === 'unread' ? ('unread' as const) : undefined
                navigate({
                  key: 'notifications',
                  view,
                })
              }
        }
      >
        <Bell className={stylex.props(styles.sca3de968).className || ''} />
        {unreadCount > 0 ? (
          <span className={stylex.props(styles_4.s92ffee34).className || ''}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </Button>
    </Tooltip>
  )
}
export function AccountProfileButton() {
  const navigate = useNavigate()
  const accountUid = useSelectedAccountId()
  const selectedAccount = useSelectedAccount()
  const {selectedIdentity, setSelectedIdentity} = useUniversalAppContext()
  const selectedIdentityValue = useStream(selectedIdentity)
  const myAccountIds = useMyAccountIds()
  const accountQueries = useAccounts(myAccountIds.data || [])
  const vaultStatus = useVaultStatus()
  const {isPending: isForceVaultSyncPending, mutate: forceVaultSync} = useForceVaultSync()
  const remoteVaultConnected = vaultStatus.data?.connectionStatus === VaultConnectionStatus.CONNECTED
  const canLogOut = vaultStatus.data?.backendMode === VaultBackendMode.REMOTE
  const [menuOpen, setMenuOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const requestedSyncForMenuOpen = useRef(false)
  const createAccountDialog = useCreateAccountDialog()
  const authDialog = useDesktopAuthDialog()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const logout = useLogout({
    onSuccess: () => {
      setLogoutOpen(false)
      toast.success('Logged out')
      authDialog.close()
      setSelectedIdentity?.(null)
      navigate({
        key: 'onboarding',
      })
    },
    onError: (error) => {
      toast.error('Failed to log out: ' + (error instanceof Error ? error.message : String(error)))
    },
  })
  const accountOptions = myAccountIds.data?.map((uid, index) => {
    const accountData = accountQueries[index]?.data
    // Fall back to a bare id-only entry so un-onboarded keys (no profile
    // metadata yet) still appear and remain selectable in the switcher,
    // instead of being filtered out and stranding a valid daemon key.
    return (
      accountData ?? {
        id: hmId(uid),
        metadata: null,
      }
    )
  })
  const hasAccounts = !!myAccountIds.data?.length
  useEffect(() => {
    if (myAccountIds.data?.length === 0 && selectedIdentityValue) {
      setSelectedIdentity?.(null)
    }
  }, [myAccountIds.data, selectedIdentityValue, setSelectedIdentity])
  useEffect(() => {
    if (!menuOpen) {
      requestedSyncForMenuOpen.current = false
      return
    }
    if (!remoteVaultConnected || isForceVaultSyncPending || requestedSyncForMenuOpen.current) return
    requestedSyncForMenuOpen.current = true
    forceVaultSync(undefined, {
      onError: () => {
        // Best-effort refresh when the account switcher opens.
      },
    })
  }, [forceVaultSync, isForceVaultSyncPending, menuOpen, remoteVaultConnected])
  if (!hasAccounts) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={
                stylex.props(
                  styles_5.s7c401ed0,
                  styles_5.sdef3facc,
                  styles_5.sca3de96c,
                  styles_5.s92852dd5,
                  styles_5.s775755af,
                  styles_5.sc5a0131,
                  styles_5.s1aa13,
                ).className || ''
              }
            >
              <div className={stylex.props(styles.sb53e5ce9).className || ''}>
                <User className={stylex.props(styles.s3566be63).className || ''} />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className={stylex.props(styles_4.s908b9122).className || ''}>
            <DropdownMenuItem
              className={stylex.props(styles.s48010636).className || ''}
              onClick={() =>
                authDialog.open({
                  initialSubmit: {
                    type: 'login',
                  },
                })
              }
            >
              <div className={stylex.props(styles_4.s1272d10).className || ''}>
                <LogIn className={stylex.props(styles.sca3de969).className || ''} />
              </div>
              <div className={stylex.props(styles_2.se30fd43e).className || ''}>
                <p className={stylex.props(styles.se0a4e204).className || ''}>Sign in</p>
                <p className={stylex.props(styles.s6d876997).className || ''}>I already have a Hypermedia identity</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={stylex.props(styles_4.sab3e94c3).className || ''} />
            <DropdownMenuItem
              className={stylex.props(styles.s48010636).className || ''}
              onClick={() =>
                authDialog.open({
                  initialSubmit: {
                    type: 'register',
                  },
                })
              }
            >
              <div className={stylex.props(styles_4.sd0b844d5).className || ''}>
                <Plus className={stylex.props(styles.sca3de969).className || ''} />
              </div>
              <div className={stylex.props(styles_2.se30fd43e).className || ''}>
                <p className={stylex.props(styles.se0a4e204).className || ''}>Create my identity</p>
                <p className={stylex.props(styles.s6d876997).className || ''}>New to Seed Hypermedia</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={stylex.props(styles_4.sab3e94c3).className || ''} />
            <DropdownMenuItem
              className={stylex.props(styles.s2f251391).className || ''}
              onClick={() =>
                authDialog.open({
                  initialStep: 'custom-identity',
                })
              }
            >
              I have a different identity domain
            </DropdownMenuItem>
            <DropdownMenuSeparator className={stylex.props(styles_4.sab3e94c3).className || ''} />
            <DropdownMenuItem
              className={stylex.props(styles.s3facd310).className || ''}
              onClick={() =>
                navigate({
                  key: 'settings',
                })
              }
            >
              <Settings className={stylex.props(styles.sca3de968).className || ''} />
              App settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {authDialog.content}
      </>
    )
  }
  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          setMenuOpen(open)
          if (!open) setSwitcherOpen(false)
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            className={
              stylex.props(
                styles_5.s7c401ed0,
                styles_5.sdef3facc,
                styles_5.sca3de96c,
                styles_5.s92852dd5,
                styles_5.s775755af,
                styles_5.sc5a0131,
                styles_5.s1aa13,
              ).className || ''
            }
          >
            {accountUid ? (
              <HMIcon
                id={hmId(accountUid)}
                name={selectedAccount?.metadata?.name}
                icon={selectedAccount?.metadata?.icon}
                size={32}
              />
            ) : (
              <div className={stylex.props(styles.sb53e5ce9).className || ''}>
                <User className={stylex.props(styles.s3566be63).className || ''} />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className={stylex.props(styles_4.s549e562e).className || ''}>
          {/* Account header + switcher */}
          <div className={stylex.props(styles_4.sfb2e96dc).className || ''}>
            <button
              className={stylex.props(styles_4.s6a2552da).className || ''}
              onClick={() => setSwitcherOpen(!switcherOpen)}
            >
              {accountUid ? (
                <HMIcon
                  id={hmId(accountUid)}
                  name={selectedAccount?.metadata?.name}
                  icon={selectedAccount?.metadata?.icon}
                  size={32}
                />
              ) : (
                <div className={stylex.props(styles.sf9c0c009).className || ''}>
                  <User className={stylex.props(styles.s3566be63).className || ''} />
                </div>
              )}
              <div className={stylex.props(styles_2.s584bf345).className || ''}>
                <p className={stylex.props(styles.s59c17cd3).className || ''}>
                  {selectedAccount?.metadata?.name || 'Account'}
                </p>
              </div>
              {switcherOpen ? (
                <ChevronUp className={stylex.props(styles.sf8eef924).className || ''} />
              ) : (
                <ChevronDown className={stylex.props(styles.sf8eef924).className || ''} />
              )}
            </button>
            {switcherOpen && (
              <>
                <div
                  className={stylex.props(styles_4.sc32e317e).className || ''}
                  style={{
                    background: [
                      'linear-gradient(var(--popover) 33%, transparent) center top',
                      'linear-gradient(transparent, var(--popover) 66%) center bottom',
                      'radial-gradient(farthest-side at 50% 0, oklch(0 0 0 / 0.12), transparent) center top',
                      'radial-gradient(farthest-side at 50% 100%, oklch(0 0 0 / 0.12), transparent) center bottom',
                    ].join(', '),
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 40px, 100% 40px, 100% 6px, 100% 6px',
                    backgroundAttachment: 'local, local, scroll, scroll',
                  }}
                >
                  {/* The selected account is already shown in the header above, so it is not repeated as an option. */}
                  {accountOptions?.map((option) =>
                    option && option.id.uid !== selectedIdentityValue ? (
                      <button
                        key={option.id.uid}
                        className={stylex.props(styles_4.s6a2552da).className || ''}
                        onClick={() => {
                          setSelectedIdentity?.(option.id.uid || null)
                          setSwitcherOpen(false)
                        }}
                      >
                        <HMIcon id={option.id} name={option.metadata?.name} icon={option.metadata?.icon} size={32} />
                        <p className={stylex.props(styles_2.safdaede1).className || ''}>
                          {option.metadata?.name || `?${option.id.uid?.slice(-8)}`}
                        </p>
                      </button>
                    ) : null,
                  )}
                </div>
                <button
                  className={stylex.props(styles_4.s191d0534).className || ''}
                  onClick={() => {
                    setMenuOpen(false)
                    createAccountDialog.open({})
                  }}
                >
                  <div className={stylex.props(styles.sb53e5ce9).className || ''}>
                    <Plus className={stylex.props(styles.sca3de968).className || ''} />
                  </div>
                  <p className={stylex.props(styles.sab7cc6fa).className || ''}>Create account</p>
                </button>
              </>
            )}
          </div>
          <DropdownMenuSeparator className={stylex.props(styles_4.sc04d6692).className || ''} />
          {accountUid && (
            <DropdownMenuItem
              onClick={() => {
                navigate({
                  key: 'profile',
                  id: hmId(accountUid),
                })
              }}
            >
              <User className={stylex.props(styles.sca3de968).className || ''} />
              My Profile
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() =>
              navigate({
                key: 'account-settings',
              })
            }
          >
            <UserCog className={stylex.props(styles.sca3de968).className || ''} />
            Account Settings
          </DropdownMenuItem>
          {/* <DropdownMenuItem disabled>
            <Monitor className="size-4" />
            Site settings
           </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={() =>
              navigate({
                key: 'settings',
              })
            }
          >
            <Settings className={stylex.props(styles.sca3de968).className || ''} />
            App settings
          </DropdownMenuItem>
          {canLogOut ? (
            <>
              <DropdownMenuSeparator className={stylex.props(styles_4.sc04d6692).className || ''} />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setMenuOpen(false)
                  setLogoutOpen(true)
                }}
              >
                <LogOut className={stylex.props(styles.sca3de968).className || ''} />
                Log out
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutVaultDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        busy={logout.isLoading}
        onLogOut={() => logout.mutate()}
      />
      {authDialog.content}
      {createAccountDialog.content}
    </>
  )
}
export function PageActionButtons(props: TitleBarProps) {
  const route = useNavRoute()
  return (
    <TitlebarSection>
      {route.key == 'document' || route.key == 'feed' ? <DocumentTitlebarButtons route={route} /> : null}
      <BookmarksPopover />
      <NotificationButton />
      <AccountProfileButton />
    </TitlebarSection>
  )
}
function DocumentTitlebarButtons({route}: {route: DocumentRoute | FeedRoute}) {
  const {id} = route
  const publishSite = usePublishSite()
  const isHomeDoc = !id.path?.length
  const capability = useSelectedAccountCapability(id)
  const canEditDoc = roleCanWrite(capability?.role)
  const entity = useResource(id)
  const showPublishSiteButton =
    isHomeDoc && canEditDoc && entity.data?.type == 'document' && !entity.data.document?.metadata.siteUrl
  return (
    <TitlebarSection>
      {showPublishSiteButton ? (
        <Button
          variant="default"
          onClick={() =>
            publishSite.open({
              id,
            })
          }
          size="sm"
        >
          Publish to Web Domain
          <UploadCloud className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      ) : null}
      {publishSite.content}
    </TitlebarSection>
  )
}
export function NavigationButtons() {
  const state = useNavigationState()
  const dispatch = useNavigationDispatch()
  if (!state) return null
  return (
    <div className={stylex.props(styles_5.s2ffff9, styles_5.sf032ed6c).className || ''}>
      <Button
        size="icon"
        onClick={() =>
          dispatch({
            type: 'pop',
          })
        }
        variant="ghost"
        disabled={state.routeIndex <= 0}
        className={stylex.props(styles_5.sf032ed6c).className || ''}
      >
        <Back className={stylex.props(styles.sca3de968).className || ''} />
      </Button>

      <Button
        size="icon"
        onClick={() =>
          dispatch({
            type: 'forward',
          })
        }
        disabled={state.routeIndex >= state.routes.length - 1}
        className={stylex.props(styles_5.sf032ed6c).className || ''}
      >
        <Forward className={stylex.props(styles.sca3de968).className || ''} />
      </Button>
    </div>
  )
}
export function NavMenuButton({left}: {left?: ReactNode}) {
  const ctx = useContext(SidebarContext)
  const isLocked = useStream(ctx?.isLocked)
  const icon = <PanelLeft className={stylex.props(styles.sca3de968).className || ''} />
  let tooltip = 'Lock Sidebar Open'
  let onPress = ctx?.onLockSidebarOpen
  let key = 'lock'
  if (isLocked) {
    tooltip = 'Close Sidebar'
    onPress = ctx?.onCloseSidebar
    key = 'close'
  }

  // Add a state to track the last click time to debounce clicks
  const lastClickTime = useRef(0)
  const handleClick = () => {
    if (onPress) {
      const now = Date.now()
      // Only process click if it's been more than 300ms since the last click
      if (now - lastClickTime.current > 300) {
        onPress()
        lastClickTime.current = now
      }
    }
  }
  return (
    <div className={stylex.props(styles.s2b214c4f).className || ''}>
      {left || <div />}
      {ctx && (
        <div className={stylex.props(styles_5.sdef3facc, styles_5.s382452).className || ''}>
          <Tooltip
            content={tooltip}
            key={key} // use this key to make sure the component is unmounted when changes, to blur the button and make tooltip disappear
          >
            <Button
              size="icon"
              key={key}
              aria-label={tooltip}
              className={stylex.props(styles.sf032ed6c).className || ''}
              onClick={handleClick}
            >
              {icon}
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
export function TitlebarTitle() {
  const route = useNavRoute()
  if (route.key !== 'document') return null
  return (
    // @ts-expect-error
    <View userSelect="none" minWidth={100}>
      {/* @ts-expect-error */}
      <DocumentTitle
        id={hmId(route.id.uid, {
          path: route.id.path,
        })}
      />
      {/* @ts-expect-error */}
    </View>
  )
}

// =============================================================================
// OMNIBAR COMPONENT
// =============================================================================

type OmnibarMode = 'idle' | 'focused' | 'search'

/** Label for non-document routes */
function getRouteLabel(route: NavRoute): string | null {
  switch (route.key) {
    case 'onboarding':
      return 'Welcome to Seed Hypermedia'
    case 'library':
      return 'Library'
    case 'agents':
      return 'Agents'
    case 'drafts':
      return 'Drafts'
    case 'contacts':
      return 'Contacts'
    case 'bookmarks':
      return 'Bookmarks'
    case 'settings':
      return 'Settings'
    case 'api-inspector':
      return 'API Inspector'
    case 'query-documents':
      return 'Query Documents'
    case 'explore':
      return 'Explore'
    case 'notifications':
      return 'Notifications'
    case 'draft':
      return 'Draft'
    default:
      return null
  }
}
const ACCOUNT_SETTINGS_TAB_LABELS: Record<string, string> = {
  devices: 'Devices',
  notifications: 'Notifications',
}

/**
 * Breadcrumb shown in the omnibar for the Account Settings page: "Identity
 * Settings" for the vault view, or "<Account name> › <Tab>" when an account is
 * selected.
 */
function AccountSettingsOmnibarLabel({
  accountUid,
  tab,
  isVault,
}: {
  accountUid?: string
  tab?: string
  isVault: boolean
}) {
  const account = useAccount(isVault ? undefined : accountUid)
  if (isVault || !accountUid) {
    return <span className={stylex.props(styles_2.s242145e8).className || ''}>Identity Settings</span>
  }
  const name = account.data?.metadata?.name || 'Account'
  const tabLabel = ACCOUNT_SETTINGS_TAB_LABELS[tab ?? 'devices'] ?? 'Devices'
  return (
    <span className={stylex.props(styles_2.see307b2f).className || ''}>
      <span className={stylex.props(styles.s6e724d66).className || ''}>{name}</span>
      <ChevronRight className={stylex.props(styles.s8a0ec2b7).className || ''} />
      <span className={stylex.props(styles.sf032ed6c).className || ''}>{tabLabel}</span>
    </span>
  )
}

/**
 * Token shown instead of a URL for agents routes on the desktop-managed local server.
 *
 * The local server's address is an implementation detail whose port is reassigned every launch, so
 * there is nothing meaningful to display, select, or copy — the route gets a named place instead.
 */
function LocalAgentsOmnibarToken() {
  return (
    <div className={stylex.props(styles_2.s946f13fd).className || ''}>
      <div
        className={
          stylex.props(
            styles_5.s5fd609e3,
            styles_5.sf2718385,
            styles_5.s2ffff9,
            styles_5.sc6ed1702,
            styles_5.s5d936fa,
            styles_5.s775755af,
            styles_5.s34b1ad,
            styles_5.sc5dd1033,
            styles_5.sab7cc79b,
          ).className || ''
        }
      >
        <Bot className={stylex.props(styles.sca3de967).className || ''} />
        <span>{LOCAL_AGENT_SERVER_LABEL}</span>
      </div>
    </div>
  )
}

/**
 * Hook to construct displayable URL from current route
 * Priority: validated custom siteUrl > gatewayUrl (never hm://)
 * Returns displayUrl (always shown) and copyableUrl (null for new doc drafts)
 */
function useCurrentRouteUrl(): {
  displayUrl: string | null
  copyableUrl: string | null
} {
  const route = useNavRoute()
  const gwUrl = useGatewayUrl().data || DEFAULT_GATEWAY_URL
  const accountUid = useSelectedAccountId()
  const localAgentServerUrl = useLocalAgentServerUrl()
  // Agents routes on the desktop-managed server have no usable URL: the port is reassigned every
  // launch, so displaying or copying "localhost:<port>/agents/…" only misleads. The omnibar shows
  // the LOCAL_AGENT_SERVER_LABEL token instead.
  const isLocalAgentsRoute = isLocalAgentServer(agentRouteServerUrl(route) || '', localAgentServerUrl.data)
  const agentSession = useAgentSession(
    route.key === 'agent-session' ? route.serverUrl || DEFAULT_AGENT_SERVER_URL : undefined,
    accountUid,
    route.key === 'agent-session' ? route.sessionId : undefined,
  )

  // Get account entity to check for siteUrl
  const routeId = getRouteId(route)

  // Resolve draft (if any) attached to this route. `useExistingDraft` matches
  // listed drafts against the document route id (post-DraftRouteRedirect every
  // route is `key: 'document'`).
  const existingDraft = useExistingDraft(route)
  const draft = existingDraft || null

  // Resolve uid for siteUrl lookup: route > draft fields
  const lookupUid = routeId?.uid || draft?.editUid || draft?.locationUid
  const accountEntity = useResource(lookupUid ? hmId(lookupUid) : null)
  const entitySiteUrl = accountEntity.data?.type === 'document' ? accountEntity.data.document?.metadata?.siteUrl : null
  // Entity metadata is authoritative; otherwise consider the hostname from the current route.
  const candidateSiteUrl = entitySiteUrl || routeId?.hostname || null
  const candidateSiteHostname = getUrlHostname(candidateSiteUrl)
  const gatewayHostname = getUrlHostname(gwUrl)
  const shouldValidateSiteUrl =
    !!candidateSiteHostname && !!lookupUid && candidateSiteHostname !== gatewayHostname && candidateSiteUrl !== gwUrl
  const domainInfo = useDomain(shouldValidateSiteUrl ? candidateSiteHostname : null, {
    enabled: shouldValidateSiteUrl,
    forceCheck: true,
    retry: false,
    staleTime: OMNIBAR_DOMAIN_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })
  const validatedSiteUrl = selectValidatedOmnibarSiteUrl({
    candidateSiteUrl,
    gatewayUrl: gwUrl,
    accountUid: lookupUid,
    registeredAccountUid: domainInfo.data?.registeredAccountUid,
    domainStatus: domainInfo.data?.status,
    isDomainLoading: domainInfo.isLoading,
  })

  // Resource lookup for the current route id. The resource type tells us
  // whether a published document actually exists at this path — anything other
  // than `'document'` means the URL must not be copyable yet.
  const routeResource = useResource(routeId)
  const hasPublishedResource = routeResource.data?.type === 'document'

  // Location-only draft (no `editUid`) = unpublished new doc. We use this even
  // while `useResource` is still loading so the copy button never flashes on
  // for a placeholder path.
  const isLocationOnlyDraft = !!draft && !draft.editUid
  const draftTitle = draft?.metadata?.name
  return useMemo(() => {
    if (route.key === 'draft') {
      const hostname = validatedSiteUrl || gwUrl
      if (route.editUid) {
        const url = createWebHMUrl(route.editUid, {
          path: route.editPath,
          hostname,
          originHomeId: validatedSiteUrl ? hmId(route.editUid) : undefined,
        })
        return {
          displayUrl: url,
          copyableUrl: url,
        }
      }
      if (route.locationUid) {
        const pathSegment = draftTitle?.trim() ? pathNameify(draftTitle) : route.id
        const newPath = [...(route.locationPath || []), pathSegment]
        const url = createWebHMUrl(route.locationUid, {
          path: newPath,
          hostname,
          originHomeId: validatedSiteUrl ? hmId(route.locationUid) : undefined,
        })
        return {
          displayUrl: url,
          copyableUrl: null,
        }
      }
      return {
        displayUrl: null,
        copyableUrl: null,
      }
    }
    if (route.key === 'agent-server') {
      if (isLocalAgentsRoute)
        return {
          displayUrl: null,
          copyableUrl: null,
        }
      const url = `${route.serverUrl}/agents`
      return {
        displayUrl: url,
        copyableUrl: url,
      }
    }
    if (route.key === 'agent') {
      if (isLocalAgentsRoute)
        return {
          displayUrl: null,
          copyableUrl: null,
        }
      const url =
        route.tab === 'triggers' && route.triggerId
          ? agentTriggerUrl(route.serverUrl || DEFAULT_AGENT_SERVER_URL, route.agentId, route.triggerId)
          : agentUrl(route.serverUrl || DEFAULT_AGENT_SERVER_URL, route.agentId, route.tab, route.memoryPath)
      return {
        displayUrl: url,
        copyableUrl: url,
      }
    }
    if (route.key === 'agent-session') {
      if (isLocalAgentsRoute)
        return {
          displayUrl: null,
          copyableUrl: null,
        }
      const agentId = route.agentId || agentSession.data?.session.agentId
      if (agentId) {
        const url = agentSessionUrl(route.serverUrl || DEFAULT_AGENT_SERVER_URL, agentId, route.sessionId)
        return {
          displayUrl: url,
          copyableUrl: url,
        }
      }
      return {
        displayUrl: null,
        copyableUrl: null,
      }
    }
    if (routeId) {
      // Unpublished new doc with a location-only draft attached — show
      // slugified preview URL, never copyable.
      if (!hasPublishedResource && isLocationOnlyDraft && draft) {
        const hostname = validatedSiteUrl || gwUrl
        const pathSegment = draftTitle?.trim() ? pathNameify(draftTitle) : draft.id
        const parentPath = routeId.path?.slice(0, -1) ?? []
        const newPath = [...parentPath, pathSegment]
        const url = createWebHMUrl(routeId.uid, {
          path: newPath,
          hostname,
          originHomeId: validatedSiteUrl ? hmId(routeId.uid) : undefined,
        })
        return {
          displayUrl: url,
          copyableUrl: null,
        }
      }

      // Standard route URL. Only mark copyable once we've confirmed a published
      // document exists at this id — guards against copying placeholder URLs
      // while drafts/resources are still loading.
      const url = routeToUrl(route, {
        hostname: validatedSiteUrl || gwUrl,
        originHomeId: validatedSiteUrl ? hmId(routeId.uid) : undefined,
      })
      return {
        displayUrl: url,
        copyableUrl: hasPublishedResource ? url : null,
      }
    }
    if (route.key === 'inspect-ipfs') {
      const url = routeToUrl(route, {
        hostname: validatedSiteUrl || gwUrl,
      })
      return {
        displayUrl: url,
        copyableUrl: url,
      }
    }
    return {
      displayUrl: null,
      copyableUrl: null,
    }
  }, [
    routeId,
    route,
    validatedSiteUrl,
    gwUrl,
    draftTitle,
    draft,
    isLocationOnlyDraft,
    hasPublishedResource,
    agentSession.data,
    isLocalAgentsRoute,
  ])
}

/**
 * Extract ID from route if applicable. After `DraftRouteRedirect`, drafts are
 * served on the `document` route, so we no longer special-case `key: 'draft'`
 * here; unpublished drafts surface via `useResource(routeId)` being not-found.
 */
function getRouteId(route: NavRoute): UnpackedHypermediaId | null {
  if (
    route.key === 'document' ||
    route.key === 'feed' ||
    route.key === 'inspect' ||
    route.key === 'activity' ||
    route.key === 'directory' ||
    route.key === 'collaborators' ||
    route.key === 'comments' ||
    route.key === 'all-documents' ||
    route.key === 'metadata' ||
    route.key === 'profile' ||
    route.key === 'contact' ||
    route.key === 'site-profile' ||
    route.key === 'site-settings'
  ) {
    return route.id
  }
  if (route.key === 'explore') {
    return route.context.type === 'site' ? route.context.id : null
  }
  if (route.key === 'site-settings-emails') {
    return route.accountUid ? hmId(route.accountUid) : null
  }
  return null
}

/**
 * Check if current route has a document that can show URL
 */
function isUrlDisplayableRoute(route: NavRoute): boolean {
  return (
    route.key === 'document' ||
    route.key === 'feed' ||
    route.key === 'inspect' ||
    route.key === 'inspect-ipfs' ||
    route.key === 'activity' ||
    route.key === 'directory' ||
    route.key === 'collaborators' ||
    route.key === 'comments' ||
    route.key === 'all-documents' ||
    route.key === 'metadata' ||
    (route.key === 'explore' && route.context.type === 'site') ||
    route.key === 'site-profile' ||
    route.key === 'site-settings-emails' ||
    route.key === 'site-settings'
  )
}

/**
 * Hook to manage omnibar state machine
 */
function useOmnibarState(currentUrl: string | null) {
  const [mode, setMode] = useState<OmnibarMode>('idle')
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const focus = useCallback(
    (selectAll: boolean = true) => {
      if (currentUrl) {
        setInputValue(currentUrl)
        setMode('focused')
        // Select all text after a tick
        setTimeout(() => {
          if (inputRef.current && selectAll) {
            inputRef.current.select()
          }
        }, 0)
      } else {
        setInputValue('')
        setMode('search')
      }
    },
    [currentUrl],
  )
  const focusSearch = useCallback(() => {
    setInputValue('')
    setMode('search')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [])
  const blur = useCallback(() => {
    setMode('idle')
    setInputValue('')
  }, [])
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)
      // If user clears URL content and starts typing non-URL text, switch to search
      if (mode === 'focused' && value !== currentUrl) {
        // Check if it looks like a URL
        const looksLikeUrl =
          value.startsWith('http://') ||
          value.startsWith('https://') ||
          value.startsWith('hm://') ||
          (value.includes('.') && !value.includes(' '))
        if (!looksLikeUrl) {
          setMode('search')
        }
      }
    },
    [mode, currentUrl],
  )
  return {
    mode,
    setMode,
    inputValue,
    setInputValue,
    inputRef,
    focus,
    focusSearch,
    blur,
    handleInputChange,
  }
}

/**
 * Main Omnibar component - browser-like address/search bar
 */
export function Omnibar() {
  const route = useNavRoute()
  const navigate = useNavigate()
  const {displayUrl, copyableUrl} = useCurrentRouteUrl()
  const localAgentServerUrl = useLocalAgentServerUrl()
  // Mirrors useCurrentRouteUrl: these routes yield no URL, so the idle bar shows a token instead.
  const isLocalAgentsRoute = isLocalAgentServer(agentRouteServerUrl(route) || '', localAgentServerUrl.data)
  const publishSite = usePublishSite()
  const searchInputRef = useRef<SearchInputHandle>(null)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const routeId = getRouteId(route)
  const existingDraft = useExistingDraft(route)
  // Location-only draft (no `editUid`) means an unpublished new doc.
  const isNewDraft = !!(existingDraft && !existingDraft.editUid)
  const isUnsharable = !copyableUrl || isNewDraft

  // Pass null to the omnibar state when the URL isn't shareable so the focused
  // input doesn't prefill with it.
  const {mode, inputValue, inputRef, focus, focusSearch, blur, handleInputChange} = useOmnibarState(
    isUnsharable ? null : copyableUrl,
  )

  // Listen for keyboard shortcuts
  useListenAppEvent('focus_omnibar', (event) => {
    if (event.mode === 'url') {
      focus(true)
    } else {
      focusSearch()
    }
  })

  // Also listen for legacy open_launcher event
  useListenAppEvent('open_launcher', () => {
    focusSearch()
  })

  // Handle URL navigation - returns true if navigation was synchronous
  const handleUrlNavigation = useCallback(
    async (url: string): Promise<boolean> => {
      const route = await resolveOmnibarUrlToRoute(url, {
        domainResolver,
      })
      if (route) {
        navigate(route)
        return true
      }
      return false
    },
    [navigate],
  )

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        blur()
      } else if (e.key === 'Enter') {
        if (mode === 'focused') {
          e.preventDefault()
          const url = inputValue.trim()
          if (url) {
            // Check if it's an HTTP URL that needs async resolution
            const isHttpUrl = url.startsWith('http://') || url.startsWith('https://')
            const unpacked = unpackHmId(url)
            if (unpacked) {
              // Sync navigation - blur immediately
              handleUrlNavigation(url)
              blur()
            } else if (isHttpUrl) {
              // Async resolution - blur after navigation completes
              handleUrlNavigation(url).then(() => blur())
            } else {
              blur()
            }
          } else {
            blur()
          }
        } else if (mode === 'search') {
          e.preventDefault()
          searchInputRef.current?.handleEnter()
        }
      } else if (e.key === 'ArrowUp' && mode === 'search') {
        e.preventDefault()
        searchInputRef.current?.handleArrowUp()
      } else if (e.key === 'ArrowDown' && mode === 'search') {
        e.preventDefault()
        searchInputRef.current?.handleArrowDown()
      }
    },
    [blur, mode, inputValue, handleUrlNavigation],
  )

  // Handle click on idle state to focus
  const handleContainerClick = useCallback(() => {
    if (mode === 'idle') {
      focus(true)
    }
  }, [mode, focus])

  // Handle blur for focused URL mode only
  const handleInputBlur = useCallback(() => {
    // Small delay to allow clicks to register
    setTimeout(() => {
      if (mode === 'focused') {
        blur()
      }
    }, 150)
  }, [mode, blur])

  // Private drafts surface via the existing draft record, not the route schema —
  // post-DraftRouteRedirect the route is `document` even for unpublished drafts.
  const isPrivate = !!(existingDraft && existingDraft.visibility === 'PRIVATE')
  const routeLabel = getRouteLabel(route)
  const displayText = displayUrl || routeLabel || ''

  // Render indicators on the right
  const indicators = isPrivate ? (
    <div className={stylex.props(styles.s8bcb4b84).className || ''}>
      <div className={stylex.props(styles.s69c7b445).className || ''}>
        <Lock className={stylex.props(styles.sca3de967).className || ''} />
        <span>Private</span>
      </div>
    </div>
  ) : null

  // Idle state - show URL
  if (mode === 'idle') {
    return (
      <div
        className={cn(
          stylex.props(
            styles_5.s1a01a0ed,
            styles_5.s2ffff9,
            styles_5.s3f58665f,
            styles_5.sb42feb5d,
            styles_5.s9faef944,
            styles_5.sc6ed1702,
            styles_5.s5d936fb,
            styles_5.s92852dd5,
            styles_5.s775755af,
            styles_5.s7c401ed1,
            styles_5.s3484a1,
          ).className || '',
          'no-window-drag',
          stylex.props(styles_4.s592e9984).className || '',
          stylex.props(styles.sf7fb00e8).className || '',
          stylex.props(styles_2.s9ccd4aa7).className || '',
          stylex.props(routeId ? styles_3.s34b56c : styles_3.s34b56d).className || '',
        )}
        onClick={handleContainerClick}
      >
        <div className={stylex.props(styles_2.see8a63b2).className || ''}>
          {isLocalAgentsRoute ? (
            <LocalAgentsOmnibarToken />
          ) : route.key === 'account-settings' ? (
            <AccountSettingsOmnibarLabel
              accountUid={route.accountUid}
              tab={route.tab}
              isVault={route.view === 'vault'}
            />
          ) : (
            <span
              className={cn(
                stylex.props(styles_2.s242145e8).className || '',
                // Drafts that haven't been published yet have no shareable URL
                stylex.props(isUnsharable && styles_3.sa145969).className || '',
              )}
              style={
                isUnsharable
                  ? {
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }
                  : undefined
              }
              onCopy={
                isUnsharable
                  ? (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  : undefined
              }
            >
              {displayText}
            </span>
          )}
          {indicators}
        </div>
        {routeId ? (
          <div className={stylex.props(styles.s2cc286a6).className || ''} onClick={(e) => e.stopPropagation()}>
            <BookmarkButton id={routeId} className={stylex.props(styles_2.s2618e1af).className || ''} />
            {/* Hide copy-reference when
                the doc's URL isn't shareable */}
            {!isUnsharable && (
              <CopyReferenceButton
                docId={routeId}
                isBlockFocused={false}
                latest
                className={stylex.props(styles_2.s2618e1af).className || ''}
              />
            )}
          </div>
        ) : null}
        {publishSite.content}
      </div>
    )
  }

  // Focused URL state - show editable URL input
  if (mode === 'focused') {
    return (
      <div
        className={cn(
          stylex.props(
            styles_5.s2ffff9,
            styles_5.s3f58665f,
            styles_5.sb42feb5d,
            styles_5.sc6ed1702,
            styles_5.s5d936fb,
            styles_5.s92852dd5,
            styles_5.s775755af,
            styles_5.sad8c742c,
            styles_5.s34b1ad,
            styles_5.s34b56d,
          ).className || '',
          'no-window-drag',
          stylex.props(styles_4.s92b9805b).className || '',
          stylex.props(styles_4.s623ccd8d).className || '',
          stylex.props(styles_2.s9ccd4aa7).className || '',
        )}
      >
        <Search className={stylex.props(styles.s26a52803).className || ''} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          className={cn(
            stylex.props(styles_4.s8974ddde).className || '',
            stylex.props(styles_6.sfb4c68be).className || '',
          )}
          autoFocus
        />
        {indicators}
      </div>
    )
  }

  // Search state - input in titlebar, results in dropdown
  return (
    <Popover open={true} onOpenChange={(open) => !open && blur()}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            stylex.props(
              styles_5.s2ffff9,
              styles_5.s3f58665f,
              styles_5.sb42feb5d,
              styles_5.sc6ed1702,
              styles_5.s5d936fb,
              styles_5.s92852dd5,
              styles_5.s775755af,
              styles_5.sad8c742c,
              styles_5.s34b1ad,
              styles_5.s34b56d,
            ).className || '',
            'no-window-drag',
            stylex.props(styles_4.s92b9805b).className || '',
            stylex.props(styles_4.s623ccd8d).className || '',
            stylex.props(styles_2.s9ccd4aa7).className || '',
          )}
        >
          <Search className={stylex.props(styles.s26a52803).className || ''} />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              stylex.props(styles_4.s8974ddde).className || '',
              stylex.props(styles_6.sfb4c68be).className || '',
            )}
            placeholder="Search documents or paste a URL…"
            autoFocus
          />
          {isSearchLoading ? <Spinner className={stylex.props(styles.s26a52803).className || ''} /> : null}
          {indicators}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className={
          stylex.props(
            styles_5.s82357e4e,
            styles_5.sf887c4ab,
            styles_5.s7c401ecf,
            styles_5.s60f53bca,
            styles_5.s1aa13,
            styles_5.sa0080bc5,
          ).className || ''
        }
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className={stylex.props(styles_4.s82dde684).className || ''}>
          <SearchInput
            ref={searchInputRef}
            onClose={blur}
            externalSearch={inputValue}
            onExternalSearchChange={handleInputChange}
            hideInput={true}
            onLoadingChange={setIsSearchLoading}
            onSelect={({id, route: selectedRoute}) => {
              if (selectedRoute) {
                navigate(selectedRoute)
              } else if (id) {
                toast.error('Failed to open selected item: ' + id)
              }
              blur()
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
