import * as stylex from '@stylexjs/stylex'
import {useMyAccountIds} from '@/models/daemon'
import {useNavigate} from '@/utils/useNavigate'
import {hmId, useUniversalAppContext} from '@shm/shared'
import {useStream} from '@shm/shared/use-stream'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {useAccounts} from '@shm/shared/models/entity'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {useHighlighter} from '@shm/ui/highlight-context'
import {HMIcon} from '@shm/ui/hm-icon'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {Plus, Settings} from 'lucide-react'
import {useEffect, useState} from 'react'
import {dispatchOnboardingDialog} from './onboarding'
const styles = stylex.create({
  sc5dbf391: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 4px)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 1)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-sm)',
  },
  s51378f89: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sb832f4b7: {
    height: '100%',
    flex: '1',
    overflowY: 'auto',
  },
  sf2548bf6: {
    flex: '1',
    borderStyle: 'none',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function SidebarFooter({isSidebarVisible = false}: {isSidebarVisible?: boolean}) {
  const {selectedIdentity, setSelectedIdentity} = useUniversalAppContext()
  const selectedIdentityValue = useStream(selectedIdentity)
  const myAccounts = useMyAccountIds()
  const accountQueries = useAccounts(myAccounts.data || [])
  const accountOptions = myAccounts.data
    ?.map((uid, index) => {
      const accountData = accountQueries[index]?.data
      if (!accountData) return null
      return accountData
    })
    .filter((d) => !!d)
  useEffect(() => {
    if (!setSelectedIdentity || !myAccounts.data) return
    if (myAccounts.data.length === 0) {
      if (selectedIdentityValue) setSelectedIdentity(null)
      return
    }
    const isSelectedAccountInvalid = !myAccounts.data.some((option) => option === selectedIdentityValue)
    const firstValidAccount = myAccounts.data[0]
    if (firstValidAccount && (!selectedIdentityValue || isSelectedAccountInvalid)) {
      setSelectedIdentity(firstValidAccount)
    }
  }, [setSelectedIdentity, selectedIdentityValue, myAccounts.data])
  const selectedAccountData = accountQueries.find((q) => q.data?.id?.uid === selectedIdentityValue)?.data
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    if (typeof isSidebarVisible == 'boolean' && isOpen && !isSidebarVisible) {
      setIsOpen(false)
    }
  }, [isSidebarVisible])
  const highlighter = useHighlighter()
  if (!selectedIdentityValue) {
    return (
      <div className={stylex.props(styles.sc5dbf391).className || ''}>
        <CreateAccountButton />
        <AppSettingsButton />
      </div>
    )
  }
  return (
    <div className="dark:bg-background border-border bg-background mb-px flex w-full items-center rounded-md border transition-all duration-200 ease-in-out">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="flex w-full min-w-0 items-center justify-start gap-2 rounded-md bg-transparent px-1 py-1 pr-3"
          {...highlighter(hmId(selectedIdentityValue))}
        >
          <>
            {selectedAccountData ? (
              <HMIcon
                key={selectedAccountData.id?.uid}
                id={selectedAccountData.id}
                name={selectedAccountData.metadata?.name}
                icon={selectedAccountData.metadata?.icon}
                size={24}
              />
            ) : null}

            <p className={stylex.props(styles.s51378f89).className || ''}>
              {selectedAccountData?.metadata?.name || `?${selectedIdentityValue?.slice(-8) || 'Unknown'}`}
            </p>
          </>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          className="z-[51] flex h-full max-h-[500px] flex-col items-stretch gap-2 p-2"
          align="end"
        >
          <ScrollArea className={stylex.props(styles.sb832f4b7).className || ''}>
            {accountOptions?.map((option) =>
              option ? (
                <div
                  key={option.id.uid}
                  className={cn(
                    'hover:bg-sidebar-accent flex flex-row items-center gap-4 rounded-md p-2',
                    selectedAccountData?.id?.uid === option.id.uid ? 'bg-sidebar-accent' : '',
                  )}
                  onClick={() => {
                    setSelectedIdentity?.(option.id.uid || null)
                    setIsOpen(false)
                  }}
                  {...highlighter(option.id)}
                >
                  <HMIcon id={option.id} name={option.metadata?.name} icon={option.metadata?.icon} />
                  {option.metadata?.name || `?${option.id.uid?.slice(-8)}`}
                </div>
              ) : null,
            )}
          </ScrollArea>
          <CreateAccountButton />
        </PopoverContent>
      </Popover>
      <AppSettingsButton />
    </div>
  )
}
function CreateAccountButton({className}: {className?: string}) {
  return (
    <Button
      variant="default"
      className={cn(stylex.props(styles.sf2548bf6).className || '', className)}
      onClick={() => {
        dispatchOnboardingDialog(true)
      }}
    >
      <Plus className={stylex.props(styles.sca3de968).className || ''} />
      Create Account
    </Button>
  )
}
function AppSettingsButton() {
  const navigate = useNavigate()
  return (
    <Tooltip content="App Settings">
      <Button
        size="icon"
        className="hover:bg-muted active:bg-muted shrink-none flex size-8 items-center justify-center rounded-md"
        onClick={(e) => {
          e.preventDefault()
          navigate({
            key: 'settings',
          })
        }}
      >
        <Settings className={stylex.props(styles.sca3de968).className || ''} />
      </Button>
    </Tooltip>
  )
}
export const useIsWindowFocused = ({onFocus, onBlur}: {onFocus?: () => void; onBlur?: () => void}): boolean => {
  const [isFocused, setIsFocused] = useState(document.hasFocus())
  useEffect(() => {
    const handleFocus = () => {
      onFocus?.()
      setIsFocused(true)
    }
    const handleBlur = () => {
      onBlur?.()
      setIsFocused(false)
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])
  return isFocused
}
