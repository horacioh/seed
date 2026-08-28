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
const styles_5 = stylex.create({
  s37120a61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
  },
  s99df37d7: {
    ':active': {
      backgroundColor: 'var(--muted)',
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
})
const styles_4 = stylex.create({
  s2695158b: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    marginBottom: '1px',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    transitionProperty: 'all',
    transitionTimingFunction: 'var(--ease-in-out)',
    transitionDuration: '200ms',
  },
  s121241b3: {
    zIndex: '51',
    display: 'flex',
    height: '100%',
    maxHeight: '500px',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'calc(var(--spacing) * 2)',
    padding: 'calc(var(--spacing) * 2)',
  },
  s6c9281ff: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--sidebar-accent)',
        color: 'var(--sidebar-accent-foreground)',
      },
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 'calc(var(--spacing) * 2)',
  },
})
const styles_3 = stylex.create({
  s6438c2e3: {
    backgroundColor: 'var(--sidebar-accent)',
  },
})
const styles_2 = stylex.create({
  s4cce74fd: {
    display: 'flex',
    width: '100%',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    paddingInline: 'calc(0.25rem * 1)',
    paddingBlock: 'calc(0.25rem * 1)',
    paddingRight: 'calc(0.25rem * 3)',
  },
})
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
    boxShadow: 'var(--shadow-sm)',
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
    <div className={stylex.props(styles_4.s2695158b).className || ''}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className={stylex.props(styles_2.s4cce74fd).className || ''}
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
        <PopoverContent side="right" className={stylex.props(styles_4.s121241b3).className || ''} align="end">
          <ScrollArea className={stylex.props(styles.sb832f4b7).className || ''}>
            {accountOptions?.map((option) =>
              option ? (
                <div
                  key={option.id.uid}
                  className={cn(
                    stylex.props(styles_4.s6c9281ff).className || '',
                    stylex.props(selectedAccountData?.id?.uid === option.id.uid ? styles_3.s6438c2e3 : null)
                      .className || '',
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
        className={
          stylex.props(
            styles_5.s37120a61,
            styles_5.s99df37d7,
            styles_5.s2ffff9,
            styles_5.sca3de96c,
            styles_5.sc6ed1702,
            styles_5.sce22ca32,
            styles_5.sf79988b7,
          ).className || ''
        }
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
