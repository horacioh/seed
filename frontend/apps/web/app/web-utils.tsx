import * as stylex from '@stylexjs/stylex'
import type {HMResourceVisibility, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {
  createInspectNavRouteFromRoute,
  hmId,
  routeToUrl,
  useJoinSite,
  useRouteLink,
  useUniversalAppContext,
} from '@shm/shared'
import {DEFAULT_GATEWAY_URL} from '@shm/shared/constants'
import {useIsSiteOwner} from '@shm/shared/models/capabilities'
import {useAccount} from '@shm/shared/models/entity'
import {isNotificationEventRead} from '@shm/shared/models/notification-read-logic'
import {hmIdToURL} from '@shm/shared/utils/entity-id-url'
import {useNavigate, useNavRoute} from '@shm/shared/utils/navigation'
import {ButtonLink} from '@shm/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shm/ui/components/dropdown-menu'
import {createCopyLinkMenuItem} from '@shm/ui/copy-link-menu'
import {copyUrlToClipboardWithFeedback} from '@shm/ui/copy-to-clipboard'
import {createDocumentVersionsPanelRoute} from '@shm/ui/document-versions-panel'
import {HypermediaHostBanner} from '@shm/ui/hm-host-banner'
import {HMIcon} from '@shm/ui/hm-icon'
import {Add} from '@shm/ui/icons'
import {JoinButton} from '@shm/ui/join-button'
import {MobilePanelSheet} from '@shm/ui/mobile-panel-sheet'
import {MenuItemType} from '@shm/ui/options-dropdown'
import {createEmailSubscribersMenuItem} from '@shm/ui/site-email-subscribers'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {useMedia} from '@shm/ui/use-media'
import {cn} from '@shm/ui/utils'
import {
  Bell,
  ExternalLink,
  FilePlus2,
  Globe,
  History,
  Import as ImportIcon,
  Layers,
  LayoutList,
  Lock,
  LogOut,
  Plus,
  Search,
  User,
  UserCog,
} from 'lucide-react'
import {ReactNode, useCallback, useMemo, useRef, useState} from 'react'
import {LogoutDialog, useCreateAccount, useLocalKeyPair} from './auth'
import {createWebDocumentDraft, createWebDocumentDraftFromMarkdownFile} from './document-edit/web-create-draft'
import {getVaultAccountSettingsUrl} from './vault-links'
import {useCreateSpaceDialog, useHasExistingSpace} from './web-create-space-dialog'
import {useWebNotificationInbox, useWebNotificationReadState} from './web-notifications'
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sb76e9daa: {
    display: 'none',
  },
  s72c9931d: {
    display: 'flex',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(70.7% 0.022 261.325)',
  },
  sbb6a26b2: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(70.7% 0.022 261.325)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s69a761ef: {
    backgroundColor: 'var(--border)',
    marginInline: 'calc(0.25rem * 4)',
    height: '1px',
  },
  s40a3db72: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingTop: 'calc(0.25rem * 2)',
    paddingBottom: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  se53a44a3: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s3566be63: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s4113cfca: {
    display: 'flex',
    cursor: 'pointer',
    borderRadius: 'calc(infinity * 1px)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-lg)',
  },
  s8fc7e6c6: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s59c17cd3: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  sf0fd1379: {
    backgroundColor: 'var(--border)',
    height: '1px',
  },
  s8c5e3586: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sdda8cd7: {
    color: 'var(--muted-foreground)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 1)',
    paddingBottom: 'calc(0.25rem * 0.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sb136bac9: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s76b0b3a9: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s24831944: {
    position: 'relative',
    height: 'calc(0.25rem * 8)',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
    padding: 'calc(0.25rem * 0)',
  },
})
export function useWebMenuItems(
  docId: UnpackedHypermediaId,
  options?: {
    includeInspect?: boolean
  },
): MenuItemType[] {
  const route = useNavRoute()
  const navigate = useNavigate()
  const {onCopyReference, onPushReference, origin, originHomeId, experiments} = useUniversalAppContext()
  const includeInspect = options?.includeInspect !== false
  // Email subscribers is offered on the home document for the site owner,
  // matching the desktop document options menu.
  const {isSiteOwner} = useIsSiteOwner(docId.path?.length ? undefined : docId.uid)
  const inspectRoute = useMemo(() => {
    if (!includeInspect) return null
    const wrappedRoute = createInspectNavRouteFromRoute(route)
    return wrappedRoute?.key === 'inspect' ? wrappedRoute : null
  }, [includeInspect, route])
  const allDocumentsId = originHomeId ? hmId(originHomeId.uid) : hmId(docId.uid)
  return useMemo(
    () => [
      createCopyLinkMenuItem({
        advanced: experiments?.advancedCopyLinkOptions,
        canonical: {
          copy:
            (onCopyReference ? () => onCopyReference(docId) : null) ??
            (typeof window !== 'undefined' ? () => copyUrlToClipboardWithFeedback(window.location.href, 'Link') : null),
        },
        gateway: {
          copy: async () => {
            const url = routeToUrl(route, {
              hostname: origin ?? DEFAULT_GATEWAY_URL,
              originHomeId,
            })
            if (url) await copyUrlToClipboardWithFeedback(url, 'Gateway')
            onPushReference?.(docId)
          },
        },
        hypermedia: {
          copy: () => copyUrlToClipboardWithFeedback(hmIdToURL(docId), 'Hypermedia'),
        },
      }),
      {
        key: 'versions',
        label: 'Versions history',
        icon: <History className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: () => {
          navigate({
            key: 'document',
            id: docId,
            panel: createDocumentVersionsPanelRoute(docId),
          })
        },
      },
      {
        key: 'directory',
        label: 'Sub documents',
        icon: <Layers className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: () =>
          navigate({
            key: 'directory',
            id: docId,
          }),
      },
      {
        key: 'all-documents',
        label: 'All Documents',
        icon: <LayoutList className={stylex.props(styles.sca3de968).className || ''} />,
        onClick: () =>
          navigate({
            key: 'all-documents',
            id: allDocumentsId,
          }),
      },
      ...(isSiteOwner
        ? [
            createEmailSubscribersMenuItem({
              navigate,
            }),
          ]
        : []),
      ...(inspectRoute
        ? [
            {
              key: 'inspect',
              label: 'Inspect Document',
              icon: <Search className={stylex.props(styles.sca3de968).className || ''} />,
              onClick: () => {
                navigate(inspectRoute)
              },
            } satisfies MenuItemType,
          ]
        : []),
    ],
    [
      allDocumentsId,
      docId,
      inspectRoute,
      isSiteOwner,
      navigate,
      onCopyReference,
      onPushReference,
      origin,
      originHomeId,
      route,
      experiments?.advancedCopyLinkOptions,
    ],
  )
}

/** Builds the web document creation submenu item for the document options menu. */
export function useWebCreateDocumentMenuItem({
  locationId,
  signingAccountId,
  canCreate,
  canCreateChildren = true,
  capabilityCid,
}: {
  locationId: UnpackedHypermediaId
  signingAccountId?: string
  canCreate: boolean
  canCreateChildren?: boolean
  capabilityCid?: string
}): {
  menuItem: MenuItemType | null
  content: ReactNode
} {
  const navigate = useNavigate()
  const importInputRef = useRef<HTMLInputElement>(null)
  const createDraft = useCallback(
    (visibility?: HMResourceVisibility) => {
      if (!signingAccountId) return
      console.log('[web-create-doc] menu createDraft', {
        locationId: locationId.id,
        visibility,
        signingAccountId,
      })
      void createWebDocumentDraft({
        locationId,
        signingAccountId,
        visibility,
        capabilityCid,
        persist: false,
        navigate: (route) => navigate(route),
      })
    },
    [capabilityCid, locationId, navigate, signingAccountId],
  )
  const menuItem = useMemo<MenuItemType | null>(() => {
    if (!canCreate || !canCreateChildren || !signingAccountId) return null
    return {
      key: 'new',
      label: 'New',
      icon: <Add className={stylex.props(styles.sca3de968).className || ''} />,
      children: [
        {
          key: 'new-document',
          label: 'New Document',
          icon: <FilePlus2 className={stylex.props(styles.sca3de968).className || ''} />,
          onClick: () => createDraft('PUBLIC'),
        },
        {
          key: 'new-private-document',
          label: 'New Private Document',
          icon: <Lock className={stylex.props(styles.sca3de968).className || ''} />,
          onClick: () => createDraft('PRIVATE'),
        },
        {
          key: 'import',
          label: 'Import Markdown File',
          icon: <ImportIcon className={stylex.props(styles.sca3de968).className || ''} />,
          onClick: () => importInputRef.current?.click(),
        },
      ],
    }
  }, [canCreate, canCreateChildren, createDraft, signingAccountId])
  return {
    menuItem,
    content:
      canCreate && canCreateChildren && signingAccountId ? (
        <input
          ref={importInputRef}
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          className={stylex.props(styles.sb76e9daa).className || ''}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (!file) return
            toast.promise(
              createWebDocumentDraftFromMarkdownFile({
                file,
                locationId,
                signingAccountId,
                capabilityCid,
                navigate: (route) => navigate(route),
              }),
              {
                loading: 'Importing Markdown…',
                success: 'Markdown imported.',
                error: 'Failed to import Markdown.',
              },
            )
          }}
        />
      ) : null,
  }
}
function PlaceholderAvatar({onClick}: {onClick: () => void}) {
  return (
    <button onClick={onClick} className={stylex.props(styles.s72c9931d).className || ''}>
      <User className={stylex.props(styles.sbb6a26b2).className || ''} />
    </button>
  )
}

/**
 * Site-header join button or avatar with notifications bell
 */
export function WebHeaderActions({siteUid}: {siteUid: string}) {
  const keyPair = useLocalKeyPair()
  const accountId = keyPair?.delegatedAccountUid ?? keyPair?.id
  const {content: createAccountContent, createAccount} = useCreateAccount({})
  const {isJoined, joinSite} = useJoinSite({
    siteUid,
  })
  const logoutDialog = useAppDialog(LogoutDialog, {
    showCloseButton: false,
  })
  const {open: openCreateSpaceDialog, content: createSpaceDialogContent} = useCreateSpaceDialog()
  const {data: hasExistingSpace} = useHasExistingSpace(accountId)
  const canCreateSpace = !hasExistingSpace
  const myAccount = useAccount(accountId || undefined, {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  })
  const account = useMemo(() => {
    if (!myAccount.data?.id) return null
    return {
      id: hmId(myAccount.data.id.uid, {
        latest: true,
      }),
      metadata: myAccount.data.metadata ?? undefined,
    }
  }, [myAccount.data])
  const navigate = useNavigate()
  const vaultAccountSettingsUrl = getVaultAccountSettingsUrl({
    vaultUrl: keyPair?.vaultUrl,
    accountUid: keyPair?.delegatedAccountUid,
  })
  const media = useMedia()
  const isMobile = media.xs
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Show the join button if not joined the site
  if (!keyPair) {
    return (
      <>
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          <PlaceholderAvatar
            onClick={() =>
              createAccount({
                source: 'login',
              })
            }
          />
          <JoinButton
            onClick={() =>
              createAccount({
                source: 'join',
              })
            }
          />
        </div>
        {createAccountContent}
      </>
    )
  }
  const joinButton = !isJoined ? <JoinButton onClick={() => joinSite()} /> : null

  // Show the avatar and bell when logged in.
  const avatarIcon = (
    <HMIcon
      id={
        account?.id ??
        hmId(accountId!, {
          latest: true,
        })
      }
      name={account?.metadata?.name}
      icon={account?.metadata?.icon}
      size={32}
    />
  )

  // When the account already has a site, the dropdown shows a link to it.
  const mySiteUrl = account?.metadata?.siteUrl || null
  const mySiteLabel = mySiteUrl
    ? mySiteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '')
    : account?.metadata?.name || 'My site'
  const goToMySite = () => {
    if (mySiteUrl) window.open(mySiteUrl, '_blank', 'noopener,noreferrer')
    else if (accountId)
      navigate({
        key: 'document',
        id: hmId(accountId, {
          latest: true,
        }),
      })
  }
  const menuItems = (
    <>
      <button
        className="hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => {
          if (accountId) {
            navigate({
              key: 'profile',
              id: hmId(accountId, {
                latest: true,
              }),
            })
          }
          setMobileMenuOpen(false)
        }}
      >
        <User className={stylex.props(styles.sca3de969).className || ''} />
        <span className={stylex.props(styles.sab7cc6fa).className || ''}>My Profile</span>
      </button>
      <div className={stylex.props(styles.s69a761ef).className || ''} />
      <button
        className="hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left disabled:opacity-50"
        onClick={() => {
          if (vaultAccountSettingsUrl) {
            window.open(vaultAccountSettingsUrl, '_blank')
          }
          setMobileMenuOpen(false)
        }}
        disabled={!vaultAccountSettingsUrl}
      >
        <UserCog className={stylex.props(styles.sca3de969).className || ''} />
        <span className={stylex.props(styles.sab7cc6fa).className || ''}>Manage account</span>
      </button>
      <div className={stylex.props(styles.s69a761ef).className || ''} />
      {canCreateSpace ? (
        <button
          className="hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left text-green-600 dark:text-green-500"
          onClick={() => {
            setMobileMenuOpen(false)
            openCreateSpaceDialog()
          }}
        >
          <Plus className={stylex.props(styles.sca3de969).className || ''} />
          <span className={stylex.props(styles.sab7cc6fa).className || ''}>Create my site</span>
        </button>
      ) : (
        <>
          <div className={stylex.props(styles.s40a3db72).className || ''}>My site</div>
          <button
            className="hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left"
            onClick={() => {
              setMobileMenuOpen(false)
              goToMySite()
            }}
          >
            <Globe className={stylex.props(styles.sca3de969).className || ''} />
            <span className={stylex.props(styles.se53a44a3).className || ''}>{mySiteLabel}</span>
            {mySiteUrl ? <ExternalLink className={stylex.props(styles.s3566be63).className || ''} /> : null}
          </button>
        </>
      )}
      <div className={stylex.props(styles.s69a761ef).className || ''} />
      <button
        className="text-destructive hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => {
          setMobileMenuOpen(false)
          logoutDialog.open({})
        }}
      >
        <LogOut className={stylex.props(styles.sca3de969).className || ''} />
        <span className={stylex.props(styles.sab7cc6fa).className || ''}>Log out</span>
      </button>
    </>
  )
  return (
    <>
      {isMobile ? (
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          {keyPair.notifyServerUrl ? <NotifsButton /> : null}
          <button className={stylex.props(styles.s4113cfca).className || ''} onClick={() => setMobileMenuOpen(true)}>
            {avatarIcon}
          </button>
          {joinButton}
          <MobilePanelSheet isOpen={mobileMenuOpen} title="" onClose={() => setMobileMenuOpen(false)}>
            <div className={stylex.props(styles.s8fc7e6c6).className || ''}>
              {avatarIcon}
              <div className="min-w-0">
                <p className={stylex.props(styles.s59c17cd3).className || ''}>{account?.metadata?.name || 'Account'}</p>
              </div>
            </div>
            <div className={stylex.props(styles.sf0fd1379).className || ''} />
            {menuItems}
          </MobilePanelSheet>
        </div>
      ) : (
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          {keyPair.notifyServerUrl ? <NotifsButton /> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={stylex.props(styles.s4113cfca).className || ''}>{avatarIcon}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="min-w-[200px]">
              <div className={stylex.props(styles.s8c5e3586).className || ''}>
                {avatarIcon}
                <div className="min-w-0">
                  <p className={stylex.props(styles.s59c17cd3).className || ''}>
                    {account?.metadata?.name || 'Account'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
              <DropdownMenuItem
                onClick={() => {
                  if (accountId) {
                    navigate({
                      key: 'profile',
                      id: hmId(accountId, {
                        latest: true,
                      }),
                    })
                  }
                }}
              >
                <User className={stylex.props(styles.sca3de968).className || ''} />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (vaultAccountSettingsUrl) {
                    window.open(vaultAccountSettingsUrl, '_blank')
                  }
                }}
                disabled={!vaultAccountSettingsUrl}
              >
                <UserCog className={stylex.props(styles.sca3de968).className || ''} />
                Manage account
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
              {canCreateSpace ? (
                <DropdownMenuItem
                  onClick={openCreateSpaceDialog}
                  className="text-green-600 focus:text-green-600 dark:text-green-500 dark:focus:text-green-500"
                >
                  <Plus className="size-4 text-green-600 dark:text-green-500" />
                  Create my site
                </DropdownMenuItem>
              ) : (
                <>
                  <div className={stylex.props(styles.sdda8cd7).className || ''}>My site</div>
                  <DropdownMenuItem onClick={goToMySite}>
                    <Globe className={stylex.props(styles.sca3de968).className || ''} />
                    <span className={stylex.props(styles.sb136bac9).className || ''}>{mySiteLabel}</span>
                    {mySiteUrl ? <ExternalLink className={stylex.props(styles.s76b0b3a9).className || ''} /> : null}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
              <DropdownMenuItem variant="destructive" onClick={() => logoutDialog.open({})}>
                <LogOut className={stylex.props(styles.sca3de968).className || ''} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {joinButton}
        </div>
      )}
      {logoutDialog.content}
      {createAccountContent}
      {createSpaceDialogContent}
    </>
  )
}

/**
 * Shared shell for site-scoped web pages that need consistent top-level chrome.
 */
export function WebSitePageShell({children, siteUid}: {children?: ReactNode; siteUid: string}) {
  const {origin, originHomeId} = useUniversalAppContext()
  const shouldShowHostBanner = origin && originHomeId && siteUid !== originHomeId.uid
  return (
    <>
      {shouldShowHostBanner ? <HypermediaHostBanner origin={origin} /> : null}
      {children}
    </>
  )
}
function NotifsButton() {
  const storedView = typeof window !== 'undefined' ? localStorage.getItem('seed-notifications-view') : null
  const linkProps = useRouteLink({
    key: 'notifications',
    view: storedView === 'unread' ? 'unread' : undefined,
  })
  const route = useNavRoute()
  const isActive = route.key === 'notifications'
  const {originHomeId} = useUniversalAppContext()
  const siteUid = originHomeId?.uid
  const inbox = useWebNotificationInbox(siteUid)
  const readState = useWebNotificationReadState(siteUid)
  const unreadCount = useMemo(() => {
    const notifications = inbox.data?.notifications ?? []
    if (!notifications.length || !readState.data) return 0
    return notifications.filter(
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
      <ButtonLink
        className={cn(stylex.props(styles.s24831944).className || '', isActive && 'dark:bg-muted bg-black/5')}
        variant="ghost"
        size="icon"
        aria-current={isActive ? 'page' : undefined}
        {...linkProps}
      >
        <Bell className={stylex.props(styles.sca3de968).className || ''} />
        {unreadCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-lg bg-red-500 px-1 text-[12px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </ButtonLink>
    </Tooltip>
  )
}
