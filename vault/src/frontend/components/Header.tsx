import logoUrl from '@/frontend/assets/hypermedia-logo.png'
import {useActions, useAppState} from '@/frontend/store'
import {ChevronDown, LogOut} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'

/**
 * Application header with user info and logout button.
 */
export function Header() {
  const {session} = useAppState()
  const actions = useActions()
  return (
    <header className="border-border dark:bg-background z-20 flex w-full transform-gpu flex-row items-center gap-2 border-b bg-white p-4 transition-transform duration-200">
      <div className="flex shrink-0 items-center self-stretch">
        <div className="flex justify-center">
          <Link
            to="/"
            className="!text-foreground hover:!text-foreground flex shrink-0 items-center justify-center gap-2 !no-underline hover:!no-underline"
          >
            <img src={logoUrl} alt="" className="size-6 rounded-full" />
            <p className="text-foreground shrink-0 text-center font-bold whitespace-nowrap select-none md:text-left">
              Hypermedia Identity
            </p>
          </Link>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {session?.authenticated && <AccountMenu email={session.email || ''} onSignOut={actions.handleLogout} />}
      </div>
    </header>
  )
}

function AccountMenu({email, onSignOut}: {email: string; onSignOut: () => void}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuItemRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    menuItemRef.current?.focus()
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close()
        triggerRef.current?.focus()
      }
    }
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('click', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [open, close])

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={email}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="account-menu-actions"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className="text-foreground flex max-w-full min-w-0 items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="min-w-0 truncate whitespace-nowrap">{email}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id="account-menu-actions"
        hidden={!open}
        className="bg-popover border-border absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-md border py-1 shadow-md"
      >
        <button
          ref={menuItemRef}
          type="button"
          onClick={() => {
            close()
            onSignOut()
          }}
          className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none dark:text-red-400"
        >
          <LogOut aria-hidden="true" className="size-3.5" />
          Log out
        </button>
      </div>
    </div>
  )
}
