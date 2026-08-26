import * as stylex from '@stylexjs/stylex'
import {Copy, Import, Key, KeyRound, MoreHorizontal, Pencil, Plus, Trash} from 'lucide-react'
import {type ReactNode} from 'react'
import {cn} from '../utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

/** Per-account options exposed via the row's 3-dots menu. */
const styles = stylex.create({
  sadd927ca: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    width: 'calc(0.25rem * 7)',
    height: 'calc(0.25rem * 7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s36a9a940: {
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s5e8f1f38: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  sfeae037d: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
    overflowY: 'auto',
    paddingInline: 'calc(0.25rem * 2)',
  },
  s21590a02: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
    padding: 'calc(0.25rem * 2)',
  },
  s3a2c3b6d: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 2)',
    textAlign: 'left',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s59c17cd3: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  s2cbbeae1: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s9d4b128d: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
})
export type AccountSettingsAccountMenu = {
  onEditProfile: () => void
  onCopyId: () => void
  onExportKey: () => void
  onDelete: () => void
}
export type AccountSettingsAccount = {
  id: string
  name: string
  /** Rendered avatar/icon for the account (platform provides HMIcon, an <img>, etc.). */
  icon: ReactNode
  /** Optional per-account options menu (Copy account ID / Export key / Delete account). */
  menu?: AccountSettingsAccountMenu
}

/**
 * Shared account-settings shell used by both the desktop app and the web vault:
 * a left sidebar (Identity Settings entry + selectable account list + Add account /
 * Import identity) and a detail pane (`children`).
 *
 * Routing-agnostic: the platform wires `onSelect*` to its own router (the desktop
 * nav route, or react-router on the web) so every state gets a real URL, and
 * passes the resulting `selectedAccountId` / `isVaultSelected` back in.
 */
export function AccountSettingsLayout({
  accounts,
  selectedAccountId,
  isVaultSelected,
  vaultEmail,
  onSelectVault,
  onSelectAccount,
  onAddAccount,
  onImportKey,
  children,
}: {
  accounts: AccountSettingsAccount[]
  selectedAccountId: string | null
  isVaultSelected: boolean
  /** Email shown under the Identity Settings entry (the signed-in remote vault email). */
  vaultEmail?: string
  onSelectVault: () => void
  onSelectAccount: (id: string) => void
  onAddAccount?: () => void
  onImportKey?: () => void
  children: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 w-full">
      <div className="bg-sidebar flex w-[260px] shrink-0 flex-col border-r border-black/10 dark:border-white/10">
        <div className="border-b border-black/10 p-2 dark:border-white/10">
          <SidebarItem
            icon={
              <div className={stylex.props(styles.sadd927ca).className || ''}>
                <Key className={stylex.props(styles.sca3de968).className || ''} />
              </div>
            }
            label="Identity Settings"
            sublabel={vaultEmail}
            active={isVaultSelected}
            onClick={onSelectVault}
          />
        </div>

        <div className={stylex.props(styles.s36a9a940).className || ''}>
          <p className={stylex.props(styles.s5e8f1f38).className || ''}>Accounts</p>
        </div>

        <div className={stylex.props(styles.sfeae037d).className || ''}>
          {accounts.map((account) => (
            <SidebarItem
              key={account.id}
              icon={account.icon}
              label={account.name}
              active={!isVaultSelected && account.id === selectedAccountId}
              onClick={() => onSelectAccount(account.id)}
              menu={account.menu}
            />
          ))}
          {onAddAccount ? (
            <button
              onClick={onAddAccount}
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="border-muted-foreground/40 flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed">
                <Plus className={stylex.props(styles.sca3de968).className || ''} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Add account</span>
            </button>
          ) : null}
        </div>

        {onImportKey ? (
          <div className={stylex.props(styles.s21590a02).className || ''}>
            <SidebarAction
              icon={<Import className={stylex.props(styles.sca3de968).className || ''} />}
              label="Import identity"
              onClick={onImportKey}
            />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
function SidebarItem({
  icon,
  label,
  sublabel,
  active,
  onClick,
  menu,
}: {
  icon: ReactNode
  label: string
  sublabel?: string
  active: boolean
  onClick: () => void
  menu?: AccountSettingsAccountMenu
}) {
  return (
    <div className="group/account relative">
      <button
        onClick={onClick}
        className={cn(
          stylex.props(styles.s3a2c3b6d).className || '',
          menu ? 'pr-9' : '',
          active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-black/5 dark:hover:bg-white/5',
        )}
      >
        <div className={stylex.props(styles.sf032ed6c).className || ''}>{icon}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={stylex.props(styles.s59c17cd3).className || ''}>{label}</span>
          {sublabel ? (
            <span
              className={cn(
                stylex.props(styles.s2cbbeae1).className || '',
                active ? 'opacity-80' : 'text-muted-foreground',
              )}
            >
              {sublabel}
            </span>
          ) : null}
        </div>
      </button>
      {menu ? <AccountOptionsMenu menu={menu} /> : null}
    </div>
  )
}

/** The hover-revealed 3-dots options menu for an account row. */
function AccountOptionsMenu({menu}: {menu: AccountSettingsAccountMenu}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account options"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-md',
          'opacity-0 group-hover/account:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100',
          'hover:bg-black/10 dark:hover:bg-white/10',
        )}
      >
        <MoreHorizontal className={stylex.props(styles.sca3de968).className || ''} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            menu.onEditProfile()
          }}
        >
          <Pencil className={stylex.props(styles.sca3de968).className || ''} />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            menu.onCopyId()
          }}
        >
          <Copy className={stylex.props(styles.sca3de968).className || ''} />
          Copy account ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            menu.onExportKey()
          }}
        >
          <KeyRound className={stylex.props(styles.sca3de968).className || ''} />
          Export key
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={(event) => {
            event.stopPropagation()
            menu.onDelete()
          }}
        >
          <Trash className={stylex.props(styles.sca3de968).className || ''} />
          Delete account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function SidebarAction({icon, label, onClick}: {icon: ReactNode; label: string; onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5"
    >
      <div className={stylex.props(styles.sadd927ca).className || ''}>{icon}</div>
      <span className={stylex.props(styles.s9d4b128d).className || ''}>{label}</span>
    </button>
  )
}
