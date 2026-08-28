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
const styles_7 = stylex.create({
  sa1abe441: {
    ':is([class~="group/account"]:hover *)': {
      opacity: '100%',
    },
  },
})
const styles_6 = stylex.create({
  sb5495d44: {
    ':is([data-state="open"])': {
      opacity: '100%',
    },
  },
})
const styles_5 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s79cfa1b2: {
    ':focus-visible': {
      opacity: '100%',
    },
  },
})
const styles_4 = stylex.create({
  sb965bd94: {
    backgroundColor: 'var(--sidebar)',
    display: 'flex',
    width: '260px',
    flexShrink: '0',
    flexDirection: 'column',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderColor: 'var(--overlay-10)',
  },
  sc518d51c: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderColor: 'var(--overlay-10)',
    padding: 'calc(var(--spacing) * 2)',
  },
  s755b6f2d: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'var(--overlay-5)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    textAlign: 'left',
  },
  s60421a34: {
    borderColor: 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
    display: 'flex',
    width: 'calc(var(--spacing) * 7)',
    height: 'calc(var(--spacing) * 7)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
  },
  s98038632: {
    backgroundColor: 'var(--sidebar-accent)',
    color: 'var(--sidebar-accent-foreground)',
  },
  s90d53a04: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--overlay-5)',
      },
    },
  },
  scef8c0f8: {
    position: 'absolute',
    top: '50%',
    right: 'calc(var(--spacing) * 1)',
    display: 'flex',
    width: 'calc(var(--spacing) * 7)',
    height: 'calc(var(--spacing) * 7)',
    translate: '0 -50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s453fe492: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--overlay-10)',
      },
    },
  },
  s51dacfe: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--overlay-5)',
      },
    },
  },
})
const styles_3 = stylex.create({
  s349b2e: {
    paddingRight: 'calc(0.25rem * 9)',
  },
  s98038632: {
    backgroundColor: 'var(--sidebar-accent)',
    color: 'var(--sidebar-accent-foreground)',
  },
  s54eab7fa: {
    opacity: '80%',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const styles_2 = stylex.create({
  s3c9fa21a: {
    display: 'flex',
    height: '100%',
    minHeight: 'calc(0.25rem * 0)',
    width: '100%',
  },
  sb7004975: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
  },
  sf88046cc: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflowY: 'auto',
  },
  s5cc90427: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
  },
})
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
    <div className={stylex.props(styles_2.s3c9fa21a).className || ''}>
      <div className={stylex.props(styles_4.sb965bd94).className || ''}>
        <div className={stylex.props(styles_4.sc518d51c).className || ''}>
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
            <button onClick={onAddAccount} className={stylex.props(styles_4.s755b6f2d).className || ''}>
              <div className={stylex.props(styles_4.s60421a34).className || ''}>
                <Plus className={stylex.props(styles.sca3de968).className || ''} />
              </div>
              <span className={stylex.props(styles_2.sb7004975).className || ''}>Add account</span>
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

      <div className={stylex.props(styles_2.sf88046cc).className || ''}>{children}</div>
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
    <div className={cn(stylex.props(styles_5.sdef3facc).className || '', 'group/account')}>
      <button
        onClick={onClick}
        className={cn(
          stylex.props(styles.s3a2c3b6d).className || '',
          stylex.props(menu ? styles_3.s349b2e : null).className || '',
          stylex.props(active ? styles_4.s98038632 : styles_4.s90d53a04).className || '',
        )}
      >
        <div className={stylex.props(styles.sf032ed6c).className || ''}>{icon}</div>
        <div className={stylex.props(styles_2.s5cc90427).className || ''}>
          <span className={stylex.props(styles.s59c17cd3).className || ''}>{label}</span>
          {sublabel ? (
            <span
              className={cn(
                stylex.props(styles.s2cbbeae1).className || '',
                stylex.props(active ? styles_3.s54eab7fa : styles_3.sf2718385).className || '',
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
          stylex.props(styles_4.scef8c0f8).className || '',
          stylex.props(styles_5.s765a26ee, styles_5.s79cfa1b2).className || '',
          stylex.props(styles_6.sb5495d44).className || '',
          stylex.props(styles_7.sa1abe441).className || '',
          stylex.props(styles_4.s453fe492).className || '',
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
    <button onClick={onClick} className={stylex.props(styles_4.s51dacfe).className || ''}>
      <div className={stylex.props(styles.sadd927ca).className || ''}>{icon}</div>
      <span className={stylex.props(styles.s9d4b128d).className || ''}>{label}</span>
    </button>
  )
}
