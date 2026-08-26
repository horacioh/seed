import * as stylex from '@stylexjs/stylex'
import {ArrowLeft} from 'lucide-react'
import * as React from 'react'
import {Button} from './button'
import {DialogDescription, DialogTitle} from './components/dialog'
import {SeedLogo} from './seed-logo'
const styles = stylex.create({
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  se88f95d7: {
    display: 'flex',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(59.6% 0.145 163.225)',
  },
  s7b38657b: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    color: '#fff',
  },
  sf56ac00b: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  s33b7a7d9: {
    display: 'flex',
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(59.6% 0.145 163.225)',
  },
  sf796cd41: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: '#fff',
  },
  scdbaf625: {
    width: '100%',
  },
  sd78ed2cf: {
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
})
export type CreateAccountDialogSubmit =
  | {
      type: 'register'
    }
  | {
      type: 'login'
    }
  | {
      type: 'custom-id-server'
      url: string
    }
type CreateAccountDialogContentProps = {
  localAccountUnlocked?: boolean
  header?: string
  title: string
  localAccountTitle: string
  localAccountDescription: string
  introDescription?: string
  createIdentityLabel?: string
  existingIdentityLabel?: string
  customIdentityTitle?: string
  defaultCustomIdentityUrl?: string
  customIdentityPlaceholder?: string
  localAccountForm?: React.ReactNode
  initialStep?: 'main' | 'custom-identity'
  onTitleClick?: () => void
  onSubmit: (input: CreateAccountDialogSubmit) => void
}

/** Shared visual content for the create account / sign-in dialog. */
export function CreateAccountDialogContent({
  localAccountUnlocked = false,
  header,
  title,
  localAccountTitle,
  localAccountDescription,
  introDescription = 'Sign in or create your identity to get started.',
  createIdentityLabel = 'Create Identity on Hypermedia',
  existingIdentityLabel = 'Already have a Hypermedia Identity?',
  customIdentityTitle = 'Identity Domain',
  defaultCustomIdentityUrl = '',
  customIdentityPlaceholder,
  localAccountForm,
  initialStep = 'main',
  onTitleClick,
  onSubmit,
}: CreateAccountDialogContentProps) {
  const [step, setStep] = React.useState<'main' | 'custom-identity'>(initialStep)
  const [customIdentityUrl, setCustomIdentityUrl] = React.useState(defaultCustomIdentityUrl)
  if (!localAccountUnlocked && step === 'custom-identity') {
    return (
      <>
        <DialogTitle className="flex items-center gap-2 max-sm:text-base">{customIdentityTitle}</DialogTitle>
        <DialogDescription className="max-sm:text-sm">Enter the URL of your identity server.</DialogDescription>
        <input
          className="rounded border px-3 py-2 text-sm dark:bg-neutral-900"
          value={customIdentityUrl}
          onChange={(e) => setCustomIdentityUrl(e.target.value)}
          placeholder={customIdentityPlaceholder}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customIdentityUrl.trim()) {
              onSubmit({
                type: 'custom-id-server',
                url: customIdentityUrl.trim(),
              })
            }
          }}
        />
        <div className={stylex.props(styles.se658ac14).className || ''}>
          <Button
            variant="ghost"
            size="lg"
            className={stylex.props(styles.sb42feb5d).className || ''}
            onClick={() => setStep('main')}
          >
            <ArrowLeft className={stylex.props(styles.sca3de968).className || ''} />
            Back
          </Button>
          <Button
            variant="default"
            size="lg"
            className={stylex.props(styles.sb42feb5d).className || ''}
            disabled={!customIdentityUrl.trim()}
            onClick={() =>
              onSubmit({
                type: 'custom-id-server',
                url: customIdentityUrl.trim(),
              })
            }
          >
            Connect
          </Button>
        </div>
      </>
    )
  }
  return (
    <>
      {localAccountUnlocked ? (
        <DialogTitle className="max-sm:text-base" onClick={onTitleClick}>
          {localAccountTitle}
        </DialogTitle>
      ) : header ? (
        <>
          <div className={stylex.props(styles.s86ff3e4).className || ''}>
            <div className={stylex.props(styles.se88f95d7).className || ''}>
              <SeedLogo className={stylex.props(styles.s7b38657b).className || ''} />
            </div>
            <span className={stylex.props(styles.sf56ac00b).className || ''}>{header}</span>
          </div>
          <DialogTitle className="text-xl font-bold max-sm:text-lg" onClick={onTitleClick}>
            {title}
          </DialogTitle>
        </>
      ) : (
        <DialogTitle className="flex items-center gap-2 max-sm:text-base" onClick={onTitleClick}>
          <div className={stylex.props(styles.s33b7a7d9).className || ''}>
            <SeedLogo className={stylex.props(styles.sf796cd41).className || ''} />
          </div>
          {title}
        </DialogTitle>
      )}

      {localAccountUnlocked ? (
        <>
          <DialogDescription className="max-sm:text-sm">{localAccountDescription}</DialogDescription>
          {localAccountForm}
        </>
      ) : (
        <>
          <DialogDescription className="max-sm:text-sm">{introDescription}</DialogDescription>

          <Button
            variant="default"
            type="submit"
            size="lg"
            className={stylex.props(styles.scdbaf625).className || ''}
            onClick={() =>
              onSubmit({
                type: 'register',
              })
            }
          >
            {createIdentityLabel}
          </Button>

          <div className={stylex.props(styles.s86ff3e4).className || ''}>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs text-neutral-400 dark:text-neutral-500">Or,</span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className={stylex.props(styles.scdbaf625).className || ''}
            onClick={() =>
              onSubmit({
                type: 'login',
              })
            }
          >
            {existingIdentityLabel}
          </Button>

          <div className={stylex.props(styles.sd78ed2cf).className || ''}>
            <button
              type="button"
              className="cursor-pointer font-medium text-neutral-500 hover:underline dark:text-neutral-400"
              onClick={() => setStep('custom-identity')}
            >
              I have a different identity domain
            </button>
          </div>
        </>
      )}
    </>
  )
}
