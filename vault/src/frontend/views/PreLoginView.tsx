import {WebAuthnAbortService} from '@simplewebauthn/browser'
import type React from 'react'
import {useEffect, useRef, useState} from 'react'
import {ErrorMessage} from '@/frontend/components/ErrorMessage'
import {Spinner} from '@/frontend/components/Spinner'
import * as navigation from '@/frontend/navigation'
import {StepIndicator} from '@/frontend/components/StepIndicator'
import {Alert, AlertDescription} from '@/frontend/components/ui/alert'
import {Button} from '@/frontend/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/frontend/components/ui/card'
import {Input} from '@/frontend/components/ui/input'
import {Label} from '@/frontend/components/ui/label'
import {useActions, useAppState} from '@/frontend/store'

/**
 * Initial view for email entry before sign in/registration.
 * Attempts conditional mediation (passkey autofill) on mount so that users
 * with resident passkeys can sign in without typing their email.
 */
export function PreLoginView() {
  const {
    email,
    inviteOnly,
    inviteCode,
    loading,
    error,
    sessionExpired,
    sessionCheckError,
    sessionCheckPending,
    passkeySupported,
    session,
    sessionChecked,
    delegationRequest,
    vaultConnectionRequest,
  } = useAppState()
  const actions = useActions()
  const autoSubmittedRef = useRef(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const showEmailError = emailTouched && email.trim().length > 0 && !emailValid

  useEffect(() => {
    if (sessionChecked) {
      actions.handleConditionalLogin()
    }
    return () => WebAuthnAbortService.cancelCeremony()
  }, [actions, sessionChecked])

  // Auto-submit only when the delegation URL provided the matching email.
  useEffect(() => {
    if (
      sessionChecked &&
      !session?.authenticated &&
      delegationRequest?.email &&
      email === delegationRequest.email &&
      !loading &&
      !autoSubmittedRef.current
    ) {
      autoSubmittedRef.current = true
      actions.handlePreLogin()
    }
  }, [sessionChecked, session, delegationRequest, email, loading, actions])

  if (!sessionChecked) {
    return <Spinner label="Checking your session" />
  }

  if (session?.authenticated) {
    return <navigation.HashNavigate to="/" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValid) {
      setEmailTouched(true)
      return
    }
    await actions.handlePreLogin()
  }

  return (
    <Card>
      <CardHeader>
        <StepIndicator currentStep={1} />
        {vaultConnectionRequest?.siteName ? (
          <>
            <CardTitle as="h1" tabIndex={-1} className="text-left text-xl">
              Sign in to join {vaultConnectionRequest.siteName}
            </CardTitle>
            <CardDescription className="text-left">Enter the email linked to your Hypermedia identity.</CardDescription>
          </>
        ) : vaultConnectionRequest ? (
          <>
            <CardTitle as="h1" tabIndex={-1} className="text-left text-xl">
              Connect your desktop app
            </CardTitle>
            <CardDescription className="text-left">
              Sign in to continue connecting this vault to Seed desktop.
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle as="h1" tabIndex={-1} className="text-left text-xl">
              What&apos;s your email?
            </CardTitle>
            <CardDescription className="text-left">We'll send a verification code.</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {sessionCheckError ? (
          <Alert id="session-check-error" variant="destructive" className="mb-4">
            <AlertDescription className="flex flex-col gap-2">
              <span>{sessionCheckError}</span>
              {sessionCheckPending ? <output aria-live="polite">Checking your session…</output> : null}
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                loading={sessionCheckPending}
                onClick={() => void actions.checkSession()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        {sessionExpired ? (
          <ErrorMessage id="session-expired-error" message="Your session expired. Sign in again to continue." />
        ) : null}
        <ErrorMessage id="pre-login-error" message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Enter your email to continue</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => actions.setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={showEmailError || (!!error && !inviteOnly)}
              aria-describedby={
                [showEmailError && 'email-error', error && !inviteOnly && 'pre-login-error']
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              className={showEmailError ? 'border-destructive focus-visible:border-destructive' : undefined}
              autoComplete="email"
            />
            <p id="email-error" className="text-destructive text-sm" role="alert">
              {showEmailError ? "That doesn't look like a valid email" : null}
            </p>
          </div>

          {inviteOnly && (
            <div className="space-y-2">
              <Label htmlFor="invite">Invitation code</Label>
              <Input
                id="invite"
                name="invite"
                type="text"
                placeholder="Paste your invitation code"
                value={inviteCode}
                onChange={(e) => actions.setInviteCode(e.target.value)}
                aria-invalid={!!error && inviteOnly}
                aria-describedby={error && inviteOnly ? 'pre-login-error' : undefined}
                autoComplete="off"
                spellCheck={false}
                required={inviteOnly}
              />
              <p className="text-muted-foreground text-sm">
                This vault is invite-only. A code is required to create a new account; existing accounts sign in as
                usual.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              By continuing, you agree to our{' '}
              <a
                href="https://hyper.media/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              >
                Terms and Privacy Policy
              </a>
              .
            </p>
          </div>

          <Button type="submit" loading={loading} disabled={!emailValid} className="w-full">
            Send code
          </Button>
        </form>

        {passkeySupported && (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            <button
              type="button"
              className="hover:text-foreground cursor-pointer underline underline-offset-2 transition-colors"
              onClick={actions.handleModalPasskeyLogin}
              disabled={loading}
            >
              Sign in with a passkey
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
