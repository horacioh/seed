import * as stylex from '@stylexjs/stylex'
import {ArrowLeft} from 'lucide-react'
import * as React from 'react'
import {Button} from './button'
import {DialogDescription, DialogTitle} from './components/dialog'
import {SeedLogo} from './seed-logo'
const styles_2 = stylex.create({
  s7aab10d6: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    '@media ((max-width: 639px))': {
      fontSize: 'var(--text-base)',
      lineHeight: 'var(--text-base--line-height)',
    },
  },
  s652f45e3: {
    '@media ((max-width: 639px))': {
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--text-sm--line-height)',
    },
  },
  sfeedb1e8: {
    borderRadius: '0.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    backgroundColor: 'var(--surface-neutral-900)',
  },
  sd66d801a: {
    '@media ((max-width: 639px))': {
      fontSize: 'var(--text-base)',
      lineHeight: 'var(--text-base--line-height)',
    },
  },
  s9629c8d: {
    fontSize: 'var(--text-xl)',
    lineHeight: 'var(--text-xl--line-height)',
    fontWeight: 'var(--font-weight-bold)',
    '@media ((max-width: 639px))': {
      fontSize: 'var(--text-lg)',
      lineHeight: 'var(--text-lg--line-height)',
    },
  },
  s940b6441: {
    height: '1px',
    flex: '1',
    backgroundColor: 'var(--tone-neutral-200-2)',
  },
  s3380dfe6: {
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    color: 'var(--tone-neutral-400-2)',
  },
  s89485e16: {
    cursor: 'pointer',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--tone-neutral-500)',
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
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
        <DialogTitle className={stylex.props(styles_2.s7aab10d6).className || ''}>{customIdentityTitle}</DialogTitle>
        <DialogDescription className={stylex.props(styles_2.s652f45e3).className || ''}>
          Enter the URL of your identity server.
        </DialogDescription>
        <input
          className={stylex.props(styles_2.sfeedb1e8).className || ''}
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
        <DialogTitle className={stylex.props(styles_2.sd66d801a).className || ''} onClick={onTitleClick}>
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
          <DialogTitle className={stylex.props(styles_2.s9629c8d).className || ''} onClick={onTitleClick}>
            {title}
          </DialogTitle>
        </>
      ) : (
        <DialogTitle className={stylex.props(styles_2.s7aab10d6).className || ''} onClick={onTitleClick}>
          <div className={stylex.props(styles.s33b7a7d9).className || ''}>
            <SeedLogo className={stylex.props(styles.sf796cd41).className || ''} />
          </div>
          {title}
        </DialogTitle>
      )}

      {localAccountUnlocked ? (
        <>
          <DialogDescription className={stylex.props(styles_2.s652f45e3).className || ''}>
            {localAccountDescription}
          </DialogDescription>
          {localAccountForm}
        </>
      ) : (
        <>
          <DialogDescription className={stylex.props(styles_2.s652f45e3).className || ''}>
            {introDescription}
          </DialogDescription>

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
            <div className={stylex.props(styles_2.s940b6441).className || ''} />
            <span className={stylex.props(styles_2.s3380dfe6).className || ''}>Or,</span>
            <div className={stylex.props(styles_2.s940b6441).className || ''} />
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
              className={stylex.props(styles_2.s89485e16).className || ''}
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
