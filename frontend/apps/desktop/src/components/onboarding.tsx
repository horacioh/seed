import * as stylex from '@stylexjs/stylex'
import {grpcClient} from '@/grpc-client'
import {desktopUniversalClient} from '@/desktop-universal-client'
import {
  useDisconnectVault,
  useImportKey,
  useListKeys,
  NamedKey,
  useRegisterKey,
  useStartVaultConnection,
  useVaultStatus,
} from '@/models/daemon'
import {client} from '@/trpc'
import {buildVaultConnectionURL, normalizeVaultOriginURL} from '@/utils/vault-connection'
import {fileUpload} from '@/utils/file-upload'
import {getImportKeyFilePathError, normalizeImportKeyFilePath} from '@/utils/onboarding-import'
import {extractWords, isWordsValid} from '@/utils/onboarding'
import {useNavigate} from '@/utils/useNavigate'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {eventStream, postAccountCreateAction, useOpenUrl, useUniversalAppContext} from '@shm/shared'
import {DAEMON_HTTP_URL, IS_PROD_DESKTOP} from '@shm/shared/constants'
import {invalidateQueries} from '@shm/shared/models/query-client'
import {queryKeys} from '@shm/shared/models/query-keys'
import {useMutation} from '@tanstack/react-query'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {CheckboxField} from '@shm/ui/components/checkbox'
import {Dialog, DialogContent, DialogOverlay, DialogPortal} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {Label} from '@shm/ui/components/label'
import {ScrollArea} from '@shm/ui/components/scroll-area'
import {Textarea} from '@shm/ui/components/textarea'
import {Prev as ArrowLeft} from '@shm/ui/icons'
import {Spinner} from '@shm/ui/spinner'
import {SizableText, Text} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {cn} from '@shm/ui/utils'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {VaultBackendMode, VaultConnectionStatus} from '@shm/shared/client/.generated/daemon/v1alpha/daemon_pb'
import {useAppContext} from '../app-context'
import {
  cleanupOnboardingFormData,
  getOnboardingState,
  ImageData,
  ImageValidationError,
  OnboardingState,
  OnboardingStep,
  resetOnboardingState,
  setHasCompletedOnboarding,
  setHasSkippedOnboarding,
  setInitialAccountIdCount,
  setOnboardingFormData,
  setOnboardingStep,
  validateImage,
} from '../app-onboarding'
import {ImageForm} from '../pages/image-form'
import {
  AnalyticsIcon,
  ArchiveIcon,
  CollabIcon,
  ContentIcon,
  DiscordIcon,
  FullLogoIcon,
  PublishIcon,
} from './onboarding-icons'
const styles_5 = stylex.create({
  s5d936f9: {
    gap: '0px',
  },
  s1aa13: {
    padding: '0px',
  },
})
const styles_4 = stylex.create({
  s1e767afe: {
    height: '90vh',
  },
  se46f4f49: {
    maxHeight: '900px',
  },
  s4a3a1c3b: {
    minHeight: '500px',
  },
  s34a81de0: {
    width: '90vw',
  },
  s9471d058: {
    maxWidth: '900px',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sb42feb5d: {
    flex: '1',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fd: {
    gap: 'calc(0.25rem * 4)',
  },
  scdbaf625: {
    width: '100%',
  },
  s8be9953d: {
    maxWidth: '400px',
  },
  s34a2ab: {
    paddingTop: 'calc(0.25rem * 4)',
  },
  s2f77d9f6: {
    alignSelf: 'center',
  },
  s334592: {
    marginTop: 'calc(0.25rem * 8)',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  sc51978d2: {
    opacity: '100%',
  },
  sc9aa04b1: {
    resize: 'none',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s8c05c43f: {
    maxWidth: '420px',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s67010d77: {
    position: 'absolute',
  },
  s478fb0c3: {
    right: 'calc(0.25rem * 4)',
  },
  s696c5bc: {
    top: 'calc(0.25rem * 4)',
  },
  s3824af: {
    zIndex: '40',
  },
  sda323b8f: {
    maxHeight: '300px',
  },
  s55fea1c7: {
    width: '300px',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s54eab7fa: {
    opacity: '80%',
  },
  s8a6c2948: {
    boxShadow: 'var(--shadow-lg)',
  },
  s1bfab962: {
    color: 'var(--primary)',
  },
  s5b77e87a: {
    backgroundColor: 'var(--primary)',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  sab1aaa95: {
    height: '600px',
  },
  s5b1d2ba4: {
    width: '600px',
  },
  s5d936ff: {
    gap: 'calc(0.25rem * 6)',
  },
  s34d3daa: {
    left: 'calc(0.25rem * 15)',
  },
  scc41f197: {
    top: 'calc(0.25rem * 10)',
  },
  s808fc112: {
    bottom: 'calc(0.25rem * 4)',
  },
  s665a770e: {
    left: '50%',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s9ba3c2d7: {
    bottom: 'calc(0.25rem * 2.5)',
  },
  sa2668a48: {
    right: 'calc(0.25rem * 2.5)',
  },
})
const styles_3 = stylex.create({
  s1cbfcb5c: {
    display: 'flex',
    width: '200px',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(var(--spacing) * 2)',
  },
  s7414e440: {
    display: 'flex',
    minHeight: '100px',
    width: '100%',
    maxWidth: '100px',
    minWidth: '100px',
    flex: 'none',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
  },
  s2572fbd8: {
    color: 'var(--muted-foreground)',
    maxWidth: '520px',
    textAlign: 'center',
  },
  s9f675995: {
    display: 'flex',
    width: '100%',
    maxWidth: '520px',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    paddingTop: 'calc(var(--spacing) * 4)',
  },
  s392c3e3c: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--background) 70%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
  },
  s835dd77d: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--background) 70%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
  },
  s8940018d: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--background) 70%, transparent)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
  },
  s218f9d94: {
    display: 'flex',
    width: '100%',
    maxWidth: '420px',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    paddingTop: 'calc(var(--spacing) * 4)',
  },
  seefaa4fb: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--background) 70%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
  },
  s112f1dd6: {
    display: 'flex',
    width: '100%',
    maxWidth: '400px',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    paddingTop: 'calc(var(--spacing) * 4)',
  },
  s1550f449: {
    color: 'var(--muted-foreground)',
    maxWidth: '360px',
  },
  sac9de943: {
    display: 'flex',
    height: 'auto',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--color-blue-200)',
    padding: 'calc(var(--spacing) * 4)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-blue-300)',
      },
    },
  },
  s578137d0: {
    backgroundColor: 'var(--brand-tint)',
    display: 'flex',
    height: 'auto',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 'calc(var(--spacing) * 4)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_2 = stylex.create({
  s1ad53cdb: {
    width: '100%',
    height: '100%',
  },
  sf121320d: {
    color: 'oklch(52.7% 0.154 150.069)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s5b77e87a: {
    backgroundColor: 'var(--primary)',
  },
  s5f844f91: {
    backgroundColor: 'oklch(87.2% 0.01 258.338)',
  },
})
const styles = stylex.create({
  s28ee3cbb: {
    display: 'flex',
    width: '100%',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 6)',
    paddingInline: 'calc(0.25rem * 0)',
  },
  sefb6846e: {
    display: 'flex',
    flex: '1',
    justifyContent: 'center',
  },
  s208ecacf: {
    display: 'flex',
    height: 'calc(0.25rem * 20)',
    justifyContent: 'flex-start',
  },
  scbf57ab1: {
    color: 'var(--secondary-foreground)',
    textAlign: 'center',
  },
  s236e44da: {
    color: 'var(--muted-foreground)',
    textAlign: 'center',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s6667179e: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 3)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sd3210856: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s21fb93a9: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s8c7183dc: {
    color: 'var(--secondary-foreground)',
  },
  s5d77118: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s6384a814: {
    fontFamily: 'var(--font-mono)',
    wordBreak: 'break-all',
  },
  s188ef301: {
    marginTop: 'auto',
    display: 'flex',
    gap: 'calc(0.25rem * 4)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  s21fb93ab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  se658ac15: {
    display: 'flex',
    gap: 'calc(0.25rem * 3)',
  },
  sea4b85de: {
    width: 'calc(0.25rem * 13)',
    height: 'calc(0.25rem * 13)',
    flexShrink: '0',
  },
  s486e68e8: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  sa8ecfe2d: {
    color: 'var(--secondary-foreground)',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sa37b3229: {
    width: 'calc(0.25rem * 2)',
    height: 'calc(0.25rem * 2)',
    borderRadius: 'calc(infinity * 1px)',
  },
  s930eca2c: {
    marginBottom: 'calc(0.25rem * 6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
    boxShadow: 'var(--shadow-lg)',
  },
})
interface OnboardingProps {
  onComplete: () => void
  modal?: boolean
}
interface ProfileFormData {
  name: string
  icon?: ImageData
}
export const [dispatchEditPopover, editPopoverEvents] = eventStream<boolean>()
export const [dispatchOnboardingDialog, onboardingDialogEvents] = eventStream<boolean>()
export function OnboardingDialog() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    return onboardingDialogEvents.subscribe((open) => {
      setOpen(open)
    })
  }, [])
  const handleOpenChange = (val: boolean) => {
    dispatchOnboardingDialog(val)
    setOpen(val)
  }
  if (!open) return null
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className={
            stylex.props(
              styles_4.s1e767afe,
              styles_4.se46f4f49,
              styles_4.s4a3a1c3b,
              styles_4.s34a81de0,
              styles_4.s9471d058,
            ).className || ''
          }
          contentClassName={stylex.props(styles_5.s5d936f9, styles_5.s1aa13).className || ''}
          showCloseButton={false}
        >
          <Onboarding
            modal={true}
            onComplete={() => {
              handleOpenChange(false)
            }}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
export function Onboarding({onComplete, modal = false}: OnboardingProps) {
  // Get the global state
  const globalState = getOnboardingState()
  const shouldConfigureVault = globalState.initialAccountIdCount === 0
  const navigate = useNavigate('replace')
  const [account, setAccount] = useState<UnpackedHypermediaId | undefined>(undefined)
  const {selectedIdentity, setSelectedIdentity} = useUniversalAppContext()

  // Initialize local state based on whether we're in modal mode
  const [localState, setLocalState] = useState(() => {
    if (modal) {
      // In modal mode, start fresh regardless of global state
      return {
        hasCompletedOnboarding: false,
        hasSkippedOnboarding: false,
        currentStep: 'welcome' as OnboardingStep,
        formData: {
          name: '',
          icon: undefined,
        },
      }
    }
    // In non-modal mode, use global state
    return globalState
  })

  // Only check global state for completion in non-modal mode
  useEffect(() => {
    const state = modal ? localState : globalState
    if (!modal && (state.hasCompletedOnboarding || state.hasSkippedOnboarding)) {
      console.log('Onboarding already completed or skipped, skipping to main app')
      if (account) {
        // Ensure the account is selected when onboarding was previously completed
        setSelectedIdentity?.(account.uid)
        navigate({
          key: 'document',
          id: account,
        })
      }
      onComplete()
    }
  }, [
    modal,
    globalState.hasCompletedOnboarding,
    globalState.hasSkippedOnboarding,
    account,
    navigate,
    onComplete,
    setSelectedIdentity,
  ])

  // Initialize step from local state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(() => {
    console.log('🔄 Initializing onboarding with state:', localState)
    return localState.currentStep
  })
  const handleSkip = useCallback(() => {
    console.group('🚀 Skipping Onboarding')
    const beforeState = modal ? localState : getOnboardingState()
    console.log('Before state:', beforeState)
    if (modal) {
      setLocalState((prev) => ({
        ...prev,
        hasSkippedOnboarding: true,
      }))
    } else {
      setHasSkippedOnboarding(true)
      // Clean up form data but keep the skipped flag
      cleanupOnboardingFormData()
    }
    const afterState = modal ? localState : getOnboardingState()
    console.log('After state:', afterState)
    console.groupEnd()
    onComplete()
  }, [modal, localState, onComplete])
  const completeOnboarding = useCallback(
    (nextAccount?: UnpackedHypermediaId) => {
      console.log('Completing onboarding')
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          hasCompletedOnboarding: true,
        }))
      } else {
        setHasCompletedOnboarding(true)
        cleanupOnboardingFormData()
      }
      const resolvedAccount = nextAccount ?? account
      if (resolvedAccount) {
        setSelectedIdentity?.(resolvedAccount.uid)
        navigate({
          key: 'document',
          id: resolvedAccount,
        })
      }
      onComplete()
    },
    [account, modal, navigate, onComplete, setSelectedIdentity],
  )
  const handleNext = useCallback(() => {
    console.group('🚀 Next Step in Onboarding')
    const beforeState = modal ? localState : getOnboardingState()
    console.log('Before - Local step:', currentStep)
    console.log('Before - Store state:', beforeState)
    if (currentStep === 'welcome') {
      console.log('Moving from welcome to profile')
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'profile',
        }))
      } else {
        setOnboardingStep('profile')
      }
      setCurrentStep('profile')
    } else if (currentStep === 'profile') {
      const nextStep = shouldConfigureVault ? 'vault' : 'recovery'
      console.log(`Moving from profile to ${nextStep}`)
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: nextStep,
        }))
      } else {
        setOnboardingStep(nextStep)
      }
      setCurrentStep(nextStep)
    } else if (currentStep === 'vault') {
      console.log('Moving from vault to create account')
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'recovery',
        }))
      } else {
        setOnboardingStep('recovery')
      }
      setCurrentStep('recovery')
    } else if (currentStep === 'recovery') {
      console.log('Moving from create account to ready')
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'ready',
        }))
      } else {
        setOnboardingStep('ready')
      }
      setCurrentStep('ready')
    } else if (currentStep === 'existing') {
      console.log('Moving from restore from phrase to ready')
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'ready',
        }))
      } else {
        setOnboardingStep('ready')
      }
      setCurrentStep('ready')
    } else if (currentStep === 'import') {
      console.log('Moving from import to ready')
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'ready',
        }))
      } else {
        setOnboardingStep('ready')
      }
      setCurrentStep('ready')
    } else if (currentStep === 'ready') {
      if (modal) {
        setInitialAccountIdCount(globalState.initialAccountIdCount + 1)
      }
      completeOnboarding()
    }
    const afterState = modal ? localState : getOnboardingState()
    console.log('After - Store state:', afterState)
    console.groupEnd()
  }, [currentStep, modal, localState, completeOnboarding, globalState.initialAccountIdCount, shouldConfigureVault])
  const handleRestoreFromRecoveryPhrase = useCallback(() => {
    if (modal) {
      setLocalState((prev) => ({
        ...prev,
        currentStep: 'existing',
      }))
    } else {
      setOnboardingStep('existing')
    }
    setCurrentStep('existing')
  }, [modal])
  const handleImportKeyFile = useCallback(() => {
    if (modal) {
      setLocalState((prev) => ({
        ...prev,
        currentStep: 'import',
      }))
    } else {
      setOnboardingStep('import')
    }
    setCurrentStep('import')
  }, [modal])
  const handlePrev = useCallback(() => {
    console.group('🚀 Previous Step in Onboarding')
    const beforeState = modal ? localState : getOnboardingState()
    console.log('Before - Local step:', currentStep)
    console.log('Before - Store state:', beforeState)
    if (currentStep === 'recovery') {
      const prevStep = shouldConfigureVault ? 'vault' : 'profile'
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: prevStep,
        }))
      } else {
        setOnboardingStep(prevStep)
      }
      setCurrentStep(prevStep)
    } else if (currentStep === 'vault') {
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'profile',
        }))
      } else {
        setOnboardingStep('profile')
      }
      setCurrentStep('profile')
    } else if (currentStep === 'profile') {
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'welcome',
        }))
      } else {
        setOnboardingStep('welcome')
      }
      setCurrentStep('welcome')
    } else if (currentStep === 'existing') {
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'vault',
        }))
      } else {
        setOnboardingStep('vault')
      }
      setCurrentStep('vault')
    } else if (currentStep === 'import') {
      if (modal) {
        setLocalState((prev) => ({
          ...prev,
          currentStep: 'vault',
        }))
      } else {
        setOnboardingStep('vault')
      }
      setCurrentStep('vault')
    }
    const afterState = modal ? localState : getOnboardingState()
    console.log('After - Store state:', afterState)
    console.groupEnd()
  }, [currentStep, modal, localState, shouldConfigureVault])
  async function handleSubscription(id: UnpackedHypermediaId) {
    console.log('[Onboarding] Starting subscription for account:', {
      uid: id.uid,
      path: '/',
      recursive: true,
    })
    try {
      await grpcClient.subscriptions.subscribe({
        account: id.uid,
        path: '',
        recursive: true,
      })
      invalidateQueries([queryKeys.SUBSCRIPTIONS])
      console.log('[Onboarding] Successfully subscribed to account:', id.uid)
    } catch (error) {
      console.error('[Onboarding] Failed to subscribe to new account!', {
        error,
        accountId: id.uid,
      })
    }
  }
  return (
    <div
      className={cn(
        stylex.props(styles_4.s436dc7b6, styles_4.s2ffff9, styles_4.sb42feb5d, styles_4.s67e351ac).className || '',
        'window-drag',
        stylex.props(!modal && styles_2.s1ad53cdb).className || '',
      )}
    >
      {currentStep === 'welcome' && <WelcomeStep onNext={handleNext} />}
      {currentStep === 'profile' && <ProfileStep onSkip={handleSkip} onNext={handleNext} onPrev={handlePrev} />}
      {currentStep === 'vault' && (
        <VaultStep
          initialAccountIdCount={globalState.initialAccountIdCount}
          onNext={handleNext}
          onPrev={handlePrev}
          onUseRecoveryPhrase={handleRestoreFromRecoveryPhrase}
          onImportKeyFile={handleImportKeyFile}
          onRemoteAccountsReady={(accountId, accountCount) => {
            const syncedAccount = hmId(accountId)
            console.log('🔄 Resolved remote-synced account during onboarding:', syncedAccount)
            setAccount(syncedAccount)
            setSelectedIdentity?.(syncedAccount.uid)
            handleSubscription(syncedAccount)
            setInitialAccountIdCount(accountCount)
            toast.success('Remote vault connected and accounts synced to this device.')
            completeOnboarding(syncedAccount)
          }}
        />
      )}
      {currentStep === 'recovery' && (
        <CreateAccountStep
          onNext={handleNext}
          onPrev={handlePrev}
          onAccountCreate={(id) => {
            console.log('🔄 Setting account:', id)
            setAccount(id)
            setSelectedIdentity?.(id.uid)
            handleSubscription(id)
            setInitialAccountIdCount(globalState.initialAccountIdCount + 1)
          }}
        />
      )}
      {currentStep === 'existing' && (
        <RestoreFromPhraseStep
          onNext={handleNext}
          onPrev={handlePrev}
          onAccountCreate={(id) => {
            console.log('🔄 Setting account:', id)
            setAccount(id)
            setSelectedIdentity?.(id.uid)
            handleSubscription(id)
            setInitialAccountIdCount(globalState.initialAccountIdCount + 1)
          }}
        />
      )}
      {currentStep === 'import' && (
        <ImportKeyStep
          onNext={handleNext}
          onPrev={handlePrev}
          onAccountCreate={(id) => {
            console.log('🔄 Setting account:', id)
            setAccount(id)
            setSelectedIdentity?.(id.uid)
            handleSubscription(id)
            setInitialAccountIdCount(globalState.initialAccountIdCount + 1)
          }}
        />
      )}
      {currentStep === 'ready' && <ReadyStep onComplete={handleNext} />}
      <OnboardingProgress currentStep={currentStep} showVaultStep={shouldConfigureVault} />
    </div>
  )
}
function WelcomeStep({onNext}: {onNext: () => void}) {
  return (
    <StepWrapper>
      <FullLogoIcon />
      <StepTitle>WELCOME TO THE OPEN WEB</StepTitle>
      <div className={stylex.props(styles.s28ee3cbb).className || ''}>
        <div className={stylex.props(styles_3.s1cbfcb5c).className || ''}>
          <div className={stylex.props(styles.sefb6846e).className || ''}>
            <CollabIcon />
          </div>
          <div className={stylex.props(styles.s208ecacf).className || ''}>
            <Text size="lg" className={stylex.props(styles.scbf57ab1).className || ''}>
              Collaborate With Your Peers
            </Text>
          </div>
        </div>

        <div className={stylex.props(styles_3.s1cbfcb5c).className || ''}>
          <div className={stylex.props(styles.sefb6846e).className || ''}>
            <PublishIcon />
          </div>
          <div className={stylex.props(styles.s208ecacf).className || ''}>
            <Text size="lg" className={stylex.props(styles.scbf57ab1).className || ''}>
              Publish To The Web
            </Text>
          </div>
        </div>

        <div className={stylex.props(styles_3.s1cbfcb5c).className || ''}>
          <div className={stylex.props(styles.sefb6846e).className || ''}>
            <ArchiveIcon />
          </div>
          <div className={stylex.props(styles.s208ecacf).className || ''}>
            <Text size="lg" className={stylex.props(styles.scbf57ab1).className || ''}>
              Archive Content, Available Offline
            </Text>
          </div>
        </div>
      </div>

      <div
        className={
          stylex.props(styles_4.s2ffff9, styles_4.s67e351ac, styles_4.sc6ed1702, styles_4.s5d936fd).className || ''
        }
      >
        {/* <Button
          variant="outlined"
          onPress={() => openUrl('https://seed.hyper.media')}
          icon={ExternalLink}
          chromeless
          hoverStyl4={{
            backgroundColor: '$brand11',
            borderColor: 'transparent',
          }}
          focusStyle={{
            backgroundColor: '$brand11',
            borderColor: 'transparent',
          }}
         >
          Getting Started Guides
         </Button> */}
        <Button variant="default" onClick={onNext} id="welcome-next">
          NEXT
        </Button>
      </div>
    </StepWrapper>
  )
}
function ProfileStep({onSkip, onNext, onPrev}: {onSkip?: () => void; onNext: () => void; onPrev: () => void}) {
  // Initialize form data from store
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    const state = getOnboardingState()
    return {
      name: state.formData.name || '',
      icon: state.formData.icon,
    }
  })
  const handleImageUpload = async (file: File) => {
    try {
      const imageData = await fileToImageData(file)
      const newData = {
        ...formData,
        icon: imageData,
      }
      setFormData(newData)
      setOnboardingFormData(newData)
    } catch (error) {
      if (error instanceof ImageValidationError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to process image')
        console.error('Image processing error:', error)
      }
    }
  }
  const handleImageRemove = () => {
    const newData = {
      ...formData,
      icon: undefined,
    }
    setFormData(newData)
    setOnboardingFormData(newData)
  }
  const updateFormData = (updates: Partial<ProfileFormData>) => {
    const newData = {
      ...formData,
      ...updates,
    }
    setFormData(newData)
    setOnboardingFormData(newData)
  }
  useEffect(() => {
    return () => {
      setFormData({
        name: '',
        icon: undefined,
      })
    }
  }, [])
  return (
    <StepWrapper onPrev={onPrev}>
      <StepTitle>CREATE YOUR SPACE</StepTitle>
      <Text size="lg" className={stylex.props(styles.s236e44da).className || ''}>
        Your space is more than just a collection of pages, it's a reflection of who you are or what your brand stands
        for. Whether it's personal, professional, or creative, this is your space to shine.
      </Text>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
        className={
          stylex.props(
            styles_4.s2ffff9,
            styles_4.scdbaf625,
            styles_4.s8be9953d,
            styles_4.sb42feb5d,
            styles_4.s67e351ac,
            styles_4.s5d936fd,
            styles_4.s34a2ab,
          ).className || ''
        }
      >
        <div
          className={
            stylex.props(
              styles_4.s2ffff9,
              styles_4.scdbaf625,
              styles_4.sb42feb5d,
              styles_4.s67e351ac,
              styles_4.s5d936fd,
              styles_4.s34a2ab,
            ).className || ''
          }
        >
          <div className={stylex.props(styles.s783f19f3).className || ''}>
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              value={formData.name}
              onChange={(e) => {
                const text = e.target.value
                updateFormData({
                  name: text,
                })
              }}
              placeholder="Enter your account name"
            />
          </div>

          <div className={stylex.props(styles_3.s7414e440).className || ''}>
            <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              Space Icon
            </Text>
            <ImageForm
              height={100}
              emptyLabel="SPACE ICON"
              suggestedSize="512px x 512px"
              url={formData.icon?.base64}
              uploadOnChange={false}
              onImageUpload={(file) => {
                if (file instanceof File) {
                  handleImageUpload(file)
                }
              }}
              onRemove={() => handleImageRemove()}
            />
          </div>
        </div>
        <div
          className={
            stylex.props(styles_4.s2ffff9, styles_4.s67e351ac, styles_4.s5d936fd, styles_4.s2f77d9f6).className || ''
          }
        >
          <div
            className={
              stylex.props(
                styles_4.s334592,
                styles_4.s2ffff9,
                styles_4.sc6ed1702,
                styles_4.sce22ca32,
                styles_4.s5d936fd,
              ).className || ''
            }
          >
            {onSkip && (
              <Button type="button" onClick={onSkip} variant="link" id="profile-skip">
                SKIP
              </Button>
            )}
            <Button id="profile-next" disabled={!formData.name.trim()} onClick={onNext} variant="default">
              NEXT
            </Button>
          </div>
        </div>
      </form>
    </StepWrapper>
  )
}
function modeFromBackend(backendMode: VaultBackendMode | undefined): 'local' | 'remote' {
  return backendMode === VaultBackendMode.REMOTE ? 'remote' : 'local'
}
function statusFromConnection(connectionStatus: VaultConnectionStatus | undefined): 'connected' | 'disconnected' {
  return connectionStatus === VaultConnectionStatus.CONNECTED ? 'connected' : 'disconnected'
}
function VaultStep({
  initialAccountIdCount,
  onNext,
  onPrev,
  onUseRecoveryPhrase,
  onImportKeyFile,
  onRemoteAccountsReady,
}: {
  initialAccountIdCount: number
  onNext: () => void
  onPrev: () => void
  onUseRecoveryPhrase: () => void
  onImportKeyFile: () => void
  onRemoteAccountsReady: (accountId: string, accountCount: number) => void
}) {
  const openUrl = useOpenUrl()
  const vaultStatus = useVaultStatus()
  const startVaultConnection = useStartVaultConnection()
  const disconnectVault = useDisconnectVault()
  const [selectedMode, setSelectedMode] = useState<'local' | 'remote'>('local')
  const [remoteVaultURL, setRemoteVaultURL] = useState('')
  const listKeys = useListKeys({
    refetchInterval:
      selectedMode === 'remote' && statusFromConnection(vaultStatus.data?.connectionStatus) === 'connected'
        ? 2_000
        : false,
  })
  const hasResolvedRemoteAccounts = useRef(false)
  useEffect(() => {
    setSelectedMode(modeFromBackend(vaultStatus.data?.backendMode))
  }, [vaultStatus.data?.backendMode])
  useEffect(() => {
    if (vaultStatus.data?.remoteVaultUrl) {
      setRemoteVaultURL(vaultStatus.data.remoteVaultUrl)
    }
  }, [vaultStatus.data?.remoteVaultUrl])
  const connectionState = statusFromConnection(vaultStatus.data?.connectionStatus)
  const isPending = startVaultConnection.isPending || disconnectVault.isPending
  const canContinue = selectedMode === 'local' || connectionState === 'connected'
  useEffect(() => {
    if (selectedMode !== 'remote' || connectionState !== 'connected') {
      hasResolvedRemoteAccounts.current = false
      return
    }
    if (initialAccountIdCount !== 0 || hasResolvedRemoteAccounts.current) {
      return
    }
    const syncedKeys = listKeys.data ?? []
    if (syncedKeys.length === 0) {
      return
    }
    hasResolvedRemoteAccounts.current = true
    onRemoteAccountsReady(syncedKeys[0].accountId, syncedKeys.length)
  }, [connectionState, initialAccountIdCount, listKeys.data, onRemoteAccountsReady, selectedMode])
  const handleDisconnect = async () => {
    try {
      await disconnectVault.mutateAsync()
      setSelectedMode('local')
      toast.success('Remote vault disconnected')
      return true
    } catch (error) {
      toast.error('Failed to disconnect remote vault: ' + (error instanceof Error ? error.message : String(error)))
      return false
    }
  }
  const handleModeChange = async (nextMode: 'local' | 'remote') => {
    setSelectedMode(nextMode)
    if (nextMode === 'remote') {
      return
    }
    const daemonMode = modeFromBackend(vaultStatus.data?.backendMode)
    if (daemonMode === 'remote' || connectionState === 'connected') {
      const disconnected = await handleDisconnect()
      if (!disconnected) {
        setSelectedMode('remote')
      }
    }
  }
  const handleStartConnection = async () => {
    let normalizedVaultURL = ''
    try {
      normalizedVaultURL = normalizeVaultOriginURL(remoteVaultURL, 'vault URL')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid vault URL')
      return
    }
    try {
      const vaultConnect = await startVaultConnection.mutateAsync({
        vaultUrl: normalizedVaultURL,
        force: connectionState === 'connected',
      })
      const browserURL = buildVaultConnectionURL(vaultConnect.vaultUrl, vaultConnect.connectToken, DAEMON_HTTP_URL)
      openUrl(browserURL)
      toast.success('Opened Vault Connect. Complete sign-in, then return here.')
    } catch (error) {
      toast.error('Failed to start vault connection: ' + (error instanceof Error ? error.message : String(error)))
    }
  }
  return (
    <StepWrapper onPrev={onPrev}>
      <StepTitle>CHOOSE YOUR VAULT</StepTitle>
      <Text size="lg" className={stylex.props(styles_3.s2572fbd8).className || ''}>
        First choose where Seed should keep your encrypted vault. After that you can create a new account, restore from
        an existing recovery phrase, or import a key file.
      </Text>

      <div className={stylex.props(styles_3.s9f675995).className || ''}>
        <div className={stylex.props(styles_3.s392c3e3c).className || ''}>
          <label className={stylex.props(styles.s6667179e).className || ''}>
            <input
              type="radio"
              name="vault-mode"
              checked={selectedMode === 'local'}
              onChange={() => handleModeChange('local')}
              disabled={isPending}
            />
            <div className={stylex.props(styles.sfbc6e28d).className || ''}>
              <Text size="lg">Local only</Text>
              <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
                Keep your encrypted vault on this device only.
              </Text>
            </div>
          </label>
          <label className={stylex.props(styles.s6667179e).className || ''}>
            <input
              type="radio"
              name="vault-mode"
              checked={selectedMode === 'remote'}
              onChange={() => handleModeChange('remote')}
              disabled={isPending}
            />
            <div className={stylex.props(styles.sfbc6e28d).className || ''}>
              <Text size="lg">Remote sync</Text>
              <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
                Keep the same encrypted vault here and sync a remote copy for multi-device continuity.
              </Text>
            </div>
          </label>
        </div>

        {selectedMode === 'remote' ? (
          <div className={stylex.props(styles_3.s835dd77d).className || ''}>
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              <Label htmlFor="onboarding-vault-url">Remote Vault URL</Label>
              <Input
                id="onboarding-vault-url"
                value={remoteVaultURL}
                onChange={(event) => setRemoteVaultURL(event.currentTarget.value)}
                placeholder="https://example.com/vault"
                disabled={isPending}
              />
            </div>
            <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              Open the Vault Connect to sign in and connect this device before continuing.
            </Text>
            <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
              <Button onClick={handleStartConnection} disabled={isPending || !remoteVaultURL.trim()}>
                {connectionState === 'connected' ? 'Reconnect in Browser' : 'Connect in Browser'}
              </Button>
              {connectionState === 'connected' ? (
                <Button variant="outline" onClick={handleDisconnect} disabled={isPending}>
                  Disconnect
                </Button>
              ) : null}
              <Text
                size="sm"
                className={cn(
                  stylex.props(connectionState === 'connected' ? styles_2.sf121320d : styles_2.sf2718385).className ||
                    '',
                )}
              >
                {connectionState === 'connected' ? 'Remote vault connected.' : 'Waiting for connection.'}
              </Text>
            </div>
            {vaultStatus.data?.syncStatus?.lastSyncError ? (
              <Text size="sm" className={stylex.props(styles.s8a2570e2).className || ''}>
                {vaultStatus.data.syncStatus.lastSyncError}
              </Text>
            ) : null}
          </div>
        ) : (
          <div className={stylex.props(styles_3.s8940018d).className || ''}>
            <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              You can add remote sync later from Settings.
            </Text>
          </div>
        )}

        <div className={stylex.props(styles.sd3210856).className || ''}>
          <Button variant="default" onClick={onNext} disabled={!canContinue}>
            CREATE NEW ACCOUNT
          </Button>
          <div className={stylex.props(styles.s21fb93a9).className || ''}>
            <Button type="button" size="sm" variant="link" onClick={onUseRecoveryPhrase} disabled={!canContinue}>
              Restore from Recovery Phrase
            </Button>
            <Button type="button" size="sm" variant="link" onClick={onImportKeyFile} disabled={!canContinue}>
              Import Key File
            </Button>
          </div>
        </div>
      </div>
    </StepWrapper>
  )
}
function ImportKeyStep({
  onNext,
  onPrev,
  onAccountCreate,
}: {
  onNext: () => void
  onPrev: () => void
  onAccountCreate: (id: UnpackedHypermediaId) => void
}) {
  const {pickKeyImportFile} = useAppContext()
  const importKey = useImportKey()
  const [filePath, setFilePath] = useState('')
  const [password, setPassword] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const handleChooseFile = async () => {
    try {
      const selectedPath = await pickKeyImportFile()
      if (!selectedPath) return
      setFilePath(selectedPath)
      setSubmitError(null)
    } catch (error) {
      console.error('❌ Failed to open key import file picker:', error)
      toast.error('Failed to open file picker')
    }
  }
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const normalizedPath = normalizeImportKeyFilePath(filePath)
    const validationError = getImportKeyFilePathError(normalizedPath)
    setFilePath(normalizedPath)
    if (validationError) {
      setSubmitError(validationError)
      return
    }
    try {
      const importedAccount = await importKey.mutateAsync({
        filePath: normalizedPath,
        password: password.length > 0 ? password : undefined,
      })
      setSubmitError(null)
      onAccountCreate(hmId(importedAccount.accountId))
      onNext()
    } catch (error) {
      console.error('❌ Failed to import account key:', error)
      const message = error instanceof Error ? error.message : 'Unknown import error'
      setSubmitError(message)
      toast.error('Failed to import key: ' + message)
    }
  }
  return (
    <StepWrapper onPrev={onPrev}>
      <StepTitle>IMPORT KEY FILE</StepTitle>
      <Text size="lg" className={stylex.props(styles.s236e44da).className || ''}>
        Choose an exported `.hmkey.json` file. Seed passes the selected file path (and optional password) to the daemon,
        which reads the key file directly from disk.
      </Text>

      <form onSubmit={handleSubmit} className={stylex.props(styles_3.s218f9d94).className || ''}>
        <div className={stylex.props(styles_3.seefaa4fb).className || ''}>
          <Text size="sm" className={stylex.props(styles.s8c7183dc).className || ''}>
            Leave password empty for plaintext exports. Enter a password only if the key file was exported with
            encryption.
          </Text>
        </div>

        {filePath ? (
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              Selected File
            </Text>
            <div className={stylex.props(styles.s5d77118).className || ''}>
              <Text size="sm" className={stylex.props(styles.s6384a814).className || ''}>
                {filePath}
              </Text>
            </div>
          </div>
        ) : null}

        {submitError ? (
          <Text size="sm" className={stylex.props(styles.s8a2570e2).className || ''}>
            {submitError}
          </Text>
        ) : null}

        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <Label htmlFor="import-key-password">Password (optional)</Label>
          <Input
            id="import-key-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            autoComplete="off"
            placeholder="Only needed for encrypted files"
          />
        </div>

        <div className={stylex.props(styles.s188ef301).className || ''}>
          <Button
            type="button"
            variant="outline"
            className={stylex.props(styles.sb42feb5d).className || ''}
            onClick={handleChooseFile}
          >
            Choose File
          </Button>
          <Button
            type="submit"
            variant="default"
            className={stylex.props(styles.sb42feb5d).className || ''}
            disabled={importKey.isPending}
          >
            {importKey.isPending ? 'IMPORTING…' : 'IMPORT KEY'}
          </Button>
        </div>
      </form>
    </StepWrapper>
  )
}
function RestoreFromPhraseStep({
  onNext,
  onPrev,
  onAccountCreate,
}: {
  onNext: () => void
  onPrev: () => void
  onAccountCreate: (id: UnpackedHypermediaId) => void
}) {
  const [secretWords, setSecretWords] = useState('')
  const register = useRegisterKey()
  const saveWords = useMutation({
    mutationFn: (input: Parameters<typeof client.secureStorage.write.mutate>[0]) =>
      client.secureStorage.write.mutate(input),
  })
  const [shouldSaveWords, setShouldSaveWords] = useState(true)
  const mnemonic = useMemo(() => {
    return extractWords(secretWords)
  }, [secretWords])
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      // Validate mnemonic
      const validation = isWordsValid(secretWords)
      if (validation !== true) {
        toast.error(typeof validation === 'string' ? validation : 'Invalid mnemonic')
        console.log('Invalid mnemonic', mnemonic)
        return
      }

      // Create the Account
      let createdAccount
      try {
        console.group('👤 Creating Account from Existing Mnemonics')
        if (!secretWords.trim()) {
          throw new Error('Mnemonics not found')
        }
        createdAccount = await register.mutateAsync({
          mnemonic,
        })
        console.log('✅ Account created:', createdAccount)
        console.groupEnd()
      } catch (error) {
        console.error('❌ Failed to create account:', error)
        toast.error('Failed to create account: ' + (error as Error).message)
        return
      }

      // Save mnemonics to secure storage only if checkbox is checked
      try {
        console.group('💾 Saving Mnemonics')
        console.log('Saving to key:', createdAccount.publicKey)
        console.log('Should save words:', shouldSaveWords)
        if (shouldSaveWords) {
          saveWords.mutate({
            key: createdAccount.publicKey,
            value: secretWords,
          })
          console.log('✅ Mnemonics saved')
        } else {
          console.log('⏭️ Skipping mnemonic save as per user preference')
        }
        console.groupEnd()
      } catch (error) {
        console.error('❌ Failed to save mnemonics:', error)
        toast.error('Failed to save mnemonics: ' + (error as Error).message)
        return
      }
      onAccountCreate(hmId(createdAccount.accountId))
      onNext()
    } catch (error) {
      console.error('❌ Existing account setup failed:', error)
      toast.error('Failed to setup account: ' + (error as Error).message)
    }
  }
  return (
    <StepWrapper onPrev={onPrev}>
      <StepTitle>ADD EXISTING KEY</StepTitle>
      <Text size="lg" className={stylex.props(styles.s236e44da).className || ''}>
        Add the keys to your existing space.
      </Text>

      <form onSubmit={handleSubmit} className={stylex.props(styles_3.s112f1dd6).className || ''}>
        <div className={stylex.props(styles.sfbc6e290).className || ''}>
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              Secret Recovery Phrase
            </Text>
            <Textarea
              placeholder="Enter or paste your Secret Recovery Phrase here…"
              value={secretWords}
              onChange={(e) => setSecretWords(e.target.value)}
              className={stylex.props(styles_4.sc51978d2, styles_4.sc9aa04b1, styles_4.s605ce4a1).className || ''}
            />
          </div>

          <CheckboxField
            id="save-existing-wordss"
            checked={shouldSaveWords}
            onCheckedChange={(v) => setShouldSaveWords(v)}
            variant="brand"
          >
            Store the Secret Recovery Phrase securely on this device.
          </CheckboxField>
        </div>
        <div className={stylex.props(styles.sb42feb5d).className || ''} />
        <div
          className={
            stylex.props(styles_4.s334592, styles_4.s2ffff9, styles_4.sc6ed1702, styles_4.sce22ca32, styles_4.s5d936fd)
              .className || ''
          }
        >
          <Button type="submit" variant="default" disabled={!secretWords.trim()}>
            NEXT
          </Button>
        </div>
      </form>
    </StepWrapper>
  )
}
function CreateAccountStep({
  onNext,
  onPrev,
  onAccountCreate,
}: {
  onNext: () => void
  onPrev: () => void
  onAccountCreate: (id: UnpackedHypermediaId) => void
}) {
  const register = useRegisterKey()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasStarted = useRef(false)
  const generatedMnemonicRef = useRef<string[] | null>(null)
  const createdAccountRef = useRef<NamedKey | null>(null)
  const [formData] = useState<ProfileFormData>(() => {
    const state = getOnboardingState()
    return {
      name: state.formData.name || '',
      icon: state.formData.icon,
    }
  })
  async function handleSubmit() {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      console.group('📝 Starting Profile Submission')
      console.log('Current form data:', formData)
      let icon = ''
      try {
        console.group('🖼️ Processing Images')
        if (formData.icon) {
          const iconFile = base64ToFile(formData.icon)
          const ipfsIcon = await fileUpload(iconFile)
          icon = ipfsIcon
          console.log('✅ Icon uploaded to IPFS:', icon)
        } else {
          console.log('ℹ️ No icon to process')
        }
        console.groupEnd()
      } catch (error) {
        console.error('❌ Failed to upload images:', error)
        throw new Error('Failed to upload images: ' + (error as Error).message)
      }
      let createdAccount
      try {
        console.group('👤 Creating Account')
        createdAccount = createdAccountRef.current
        if (!createdAccount) {
          if (!generatedMnemonicRef.current) {
            const mnemonicResponse = await grpcClient.daemon.genMnemonic({})
            if (!mnemonicResponse.mnemonic.length) {
              throw new Error('Mnemonic generation failed')
            }
            generatedMnemonicRef.current = [...mnemonicResponse.mnemonic]
          }
          createdAccount = await register.mutateAsync({
            mnemonic: generatedMnemonicRef.current,
          })
          createdAccountRef.current = createdAccount
        }
        console.log('✅ Account created:', createdAccount)
        console.groupEnd()
      } catch (error) {
        console.error('❌ Failed to create account:', error)
        throw new Error('Failed to create account: ' + (error as Error).message)
      }
      try {
        console.group('📝 Creating Profile')
        await grpcClient.documents.updateProfile({
          account: createdAccount.accountId,
          profile: {
            name: formData.name,
            icon: icon ? `ipfs://${icon}` : '',
          },
          signingKeyName: createdAccount.publicKey,
        })
        const id = hmId(createdAccount.accountId)
        invalidateQueries([queryKeys.ACCOUNT, id.uid])
        invalidateQueries([queryKeys.LIST_ROOT_DOCUMENTS])
        console.log('✅ Profile created')
        console.groupEnd()
      } catch (error) {
        console.error('❌ Failed to create profile:', error)
        throw new Error('Failed to create profile: ' + (error as Error).message)
      }
      cleanupOnboardingFormData()
      onAccountCreate(hmId(createdAccount.accountId))
      await postAccountCreateAction(
        {
          accountUid: createdAccount.accountId,
        },
        {
          getSigner: desktopUniversalClient.getSigner!,
          publish: desktopUniversalClient.publish,
        },
      )
      console.groupEnd()
      onNext()
    } catch (error) {
      console.error('❌ Profile submission failed:', error)
      console.groupEnd()
      const message = error instanceof Error ? error.message : String(error)
      setSubmitError(message)
      toast.error('Account creation failed: ' + message)
    } finally {
      setIsSubmitting(false)
    }
  }
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    handleSubmit()
  }, [])
  return (
    <StepWrapper onPrev={isSubmitting ? undefined : onPrev}>
      <StepTitle>CREATING YOUR SPACE</StepTitle>
      <div
        className={
          stylex.props(
            styles_4.s2ffff9,
            styles_4.scdbaf625,
            styles_4.s8c05c43f,
            styles_4.sb42feb5d,
            styles_4.s67e351ac,
            styles_4.sc6ed1702,
            styles_4.sce22ca32,
            styles_4.s5d936fd,
            styles_4.s65e234f5,
          ).className || ''
        }
      >
        <Text size="xl" className={stylex.props(styles.sf2718385).className || ''}>
          Seed is creating your account and storing it in this device&apos;s encrypted local vault.
        </Text>
        <Text size="sm" className={stylex.props(styles_3.s1550f449).className || ''}>
          Your account is being set up in this device&apos;s encrypted local vault.
        </Text>

        {isSubmitting ? (
          <div className={stylex.props(styles.s21fb93ab).className || ''}>
            <Spinner />
            <Text size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              This should only take a moment.
            </Text>
          </div>
        ) : submitError ? (
          <>
            <Text size="sm" className={stylex.props(styles.s8a2570e2).className || ''}>
              {submitError}
            </Text>
            <div className={stylex.props(styles.se658ac15).className || ''}>
              <Button
                variant="outline"
                onClick={() => {
                  handleSubmit()
                }}
              >
                Retry
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </StepWrapper>
  )
}
function ReadyStep({onComplete}: {onComplete: () => void}) {
  const openUrl = useOpenUrl()
  return (
    <StepWrapper>
      <StepTitle>READY TO GO</StepTitle>
      <div
        className={
          stylex.props(styles_4.s334592, styles_4.s2ffff9, styles_4.s8be9953d, styles_4.s67e351ac, styles_4.s5d936fd)
            .className || ''
        }
      >
        <div
          className={stylex.props(styles_3.sac9de943).className || ''}
          onClick={() => openUrl('https://discord.gg/7Y7DrhQZFs')}
        >
          <DiscordIcon className={stylex.props(styles.sea4b85de).className || ''} />
          <div className={stylex.props(styles.s486e68e8).className || ''}>
            <SizableText weight="light" className={stylex.props(styles.s8c7183dc).className || ''}>
              Join our Discord
            </SizableText>
            <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              Here you will be able to get support and send feedback.
            </SizableText>
          </div>
        </div>
        <div className={stylex.props(styles_3.s578137d0).className || ''}>
          <ContentIcon className={stylex.props(styles.sea4b85de).className || ''} />
          <div className={stylex.props(styles.s486e68e8).className || ''}>
            <SizableText weight="light" className={stylex.props(styles.s8c7183dc).className || ''}>
              All Content is Public
            </SizableText>
            <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              all content created using Seed Hypermedia is public by default, meaning it can be accessed and shared by
              others within the network
            </SizableText>
          </div>
        </div>
        <div className={stylex.props(styles_3.s578137d0).className || ''}>
          <AnalyticsIcon className={stylex.props(styles.sea4b85de).className || ''} />
          <div className={stylex.props(styles.s486e68e8).className || ''}>
            <SizableText weight="light" className={stylex.props(styles.s8c7183dc).className || ''}>
              Analytics
            </SizableText>
            <SizableText size="sm" className={stylex.props(styles.sf2718385).className || ''}>
              We collect anonymous analytics to improve your experience and enhance the platform.
            </SizableText>
          </div>
        </div>
        <Button variant="default" onClick={onComplete}>
          DONE
        </Button>
      </div>
    </StepWrapper>
  )
}
export function OnboardingDebugBox() {
  const [state, setState] = useState<OnboardingState>(getOnboardingState())
  useEffect(() => {
    // Update state every second to see changes
    const interval = setInterval(() => {
      setState(getOnboardingState())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  if (IS_PROD_DESKTOP) return null
  return (
    <div
      className={
        stylex.props(
          styles_4.s436dc7b6,
          styles_4.s1a01a0ed,
          styles_4.s67010d77,
          styles_4.s478fb0c3,
          styles_4.s696c5bc,
          styles_4.s3824af,
          styles_4.sda323b8f,
          styles_4.s55fea1c7,
          styles_4.sf799889b,
          styles_4.sad8c742c,
          styles_4.s1aa15,
          styles_4.s54eab7fa,
          styles_4.s8a6c2948,
        ).className || ''
      }
    >
      <ScrollArea>
        <div className={stylex.props(styles.s1aa16).className || ''}>
          <Text
            size="md"
            style={{
              fontFamily: 'monospace',
            }}
          >
            Debug: Onboarding State
          </Text>
          <Text
            size="sm"
            style={{
              fontFamily: 'monospace',
            }}
            className={stylex.props(styles.sf2718385).className || ''}
          >
            {JSON.stringify(state, null, 2)}
          </Text>
        </div>
      </ScrollArea>
    </div>
  )
}
function StepTitle({children}: {children: React.ReactNode}) {
  return (
    <Text size="4xl" className={stylex.props(styles_4.s1bfab962, styles_4.s65e234f5).className || ''}>
      {children}
    </Text>
  )
}
function StepWrapper({children, onPrev}: {children: React.ReactNode; onPrev?: () => void}) {
  return (
    <>
      <div
        className={
          stylex.props(
            styles_4.s5b77e87a,
            styles_4.s2ffff9,
            styles_4.sb42feb5d,
            styles_4.s67e351ac,
            styles_4.sc6ed1702,
            styles_4.sce22ca32,
            styles_4.s5d936fd,
            styles_4.s1aa17,
          ).className || ''
        }
      >
        <div
          className={
            stylex.props(
              styles_4.s2ffff9,
              styles_4.sab1aaa95,
              styles_4.s5b1d2ba4,
              styles_4.s67e351ac,
              styles_4.sc6ed1702,
              styles_4.sce22ca32,
              styles_4.s5d936ff,
            ).className || ''
          }
        >
          {onPrev ? (
            <div
              className={
                stylex.props(styles_4.s34d3daa, styles_4.s67010d77, styles_4.scc41f197, styles_4.s3824af).className ||
                ''
              }
            >
              <Button size="icon" onClick={onPrev}>
                <ArrowLeft className={stylex.props(styles.sa8ecfe2d).className || ''} />
              </Button>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </>
  )
}
function OnboardingProgress({currentStep, showVaultStep}: {currentStep: OnboardingStep; showVaultStep: boolean}) {
  const showExistingStep = currentStep === 'existing' || currentStep === 'import'
  return (
    <div
      className={
        stylex.props(
          styles_4.s67010d77,
          styles_4.s808fc112,
          styles_4.s665a770e,
          styles_4.s2ffff9,
          styles_4.s5d936fb,
          styles_4.s34a2ab,
        ).className || ''
      }
    >
      <OnboardingProgressStep active={currentStep === 'welcome'} />
      <OnboardingProgressStep active={currentStep === 'profile'} />
      {showVaultStep ? <OnboardingProgressStep active={currentStep === 'vault'} /> : null}
      {showExistingStep ? (
        <OnboardingProgressStep active={currentStep === 'existing' || currentStep === 'import'} />
      ) : (
        <OnboardingProgressStep active={currentStep === 'recovery'} />
      )}
      <OnboardingProgressStep active={currentStep === 'ready'} />
    </div>
  )
}
function OnboardingProgressStep({active}: {active: boolean}) {
  return (
    <div
      className={cn(
        stylex.props(styles.sa37b3229).className || '',
        stylex.props(active ? styles_2.s5b77e87a : styles_2.s5f844f91).className || '',
      )}
    />
  )
}
async function fileToImageData(file: File): Promise<ImageData> {
  // Validate the file first
  validateImage(file)

  // Convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        base64: reader.result as string,
        type: file.type,
        name: file.name,
        size: file.size,
      })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
function base64ToFile(imageData: ImageData): File {
  // Convert base64 to blob
  // @ts-ignore
  const byteString = atob(imageData.base64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], {
    type: imageData.type,
  })

  // Create File from blob
  return new File([blob], imageData.name, {
    type: imageData.type,
  })
}

// gift, general, police, ticket, slogan, outdoor, health, hockey, wool, taste, dignity, yard

// This component creates a small floating button to reset the onboarding state
// Only shown when explicitly enabled or in development mode
export function ResetOnboardingButton() {
  const handleReset = () => {
    resetOnboardingState()
    toast.success('Onboarding state reset! Refresh to see changes.')
  }
  if (IS_PROD_DESKTOP) return null
  return (
    <div
      className={
        stylex.props(
          styles_4.s67010d77,
          styles_4.s9ba3c2d7,
          styles_4.sa2668a48,
          styles_4.s3824af,
          styles_4.s2ffff9,
          styles_4.s5d936fb,
        ).className || ''
      }
    >
      <Button size="sm" onClick={() => dispatchEditPopover(true)}>
        show Edit Dialog
      </Button>
      <Button variant="destructive" size="sm" onClick={handleReset}>
        Reset Onboarding
      </Button>
    </div>
  )
}
export function CreateAccountBanner() {
  const [show, setShow] = useState(() => {
    const obState = getOnboardingState()
    return !obState.hasCompletedOnboarding && !obState.hasSkippedOnboarding && obState.initialAccountIdCount === 0
  })
  if (!show) return null
  return (
    <div className={stylex.props(styles.s930eca2c).className || ''}>
      <SizableText size="2xl" weight="bold">
        Let's Get Started!
      </SizableText>
      <SizableText>Create an account to get started. It's free and takes less than a minute.</SizableText>
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        <Button
          variant="default"
          onClick={() => {
            dispatchOnboardingDialog(true)
          }}
        >
          Create a Space
        </Button>
        {/* <Button size="#3" chromeless hoverStyle={{bg: '$color44}}>
          I already have a Space
         </Button> */}
      </div>
    </div>
  )
}
