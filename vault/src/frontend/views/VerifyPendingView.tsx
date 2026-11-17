import {type FormEvent, useEffect, useState} from 'react'
import {Alert, AlertDescription} from '@/frontend/components/ui/alert'
import {Button} from '@/frontend/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/frontend/components/ui/card'
import {CodeInput} from '@shm/ui/components/code-input'
import {StepIndicator} from '@/frontend/components/StepIndicator'
import * as navigation from '@/frontend/navigation'
import {useActions, useAppState} from '@/frontend/store'

function Countdown({expireTime}: {expireTime: number}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const timeLeft = Math.max(0, Math.ceil((expireTime - now) / 1000))
  const minutes = Math.floor(timeLeft / 60)
  const remainingSeconds = timeLeft % 60
  const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`

  return (
    <>
      <p>Code expires in {formattedTime}.</p>
      {timeLeft === 0 ? (
        <output aria-live="polite" className="block">
          Your verification code has expired. Resend a new code to continue.
        </output>
      ) : null}
    </>
  )
}

/** View shown while waiting for the user to enter an email verification code. */
export function VerifyPendingView() {
  const {email, error, loading, verificationExpireTime} = useAppState()
  const actions = useActions()
  const navigate = navigation.useHashNavigate()
  const [code, setCode] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    actions.handleRegisterVerify(code)
  }

  return (
    <Card>
      <CardHeader>
        <StepIndicator currentStep={2} />
        <CardTitle as="h1" tabIndex={-1} className="text-left text-xl">
          Check your inbox
        </CardTitle>
        <CardDescription className="text-left">
          We sent a 4-digit code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">4-digit verification code</legend>
            <CodeInput
              value={code}
              onChange={(newCode) => setCode(newCode)}
              onComplete={(fullCode) => {
                if (!loading) actions.handleRegisterVerify(fullCode)
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'verification-error' : undefined}
            />
          </fieldset>

          <Button type="submit" loading={loading} disabled={code.length !== 4} className="w-full">
            Verify
          </Button>
        </form>

        <div className="text-muted-foreground mt-4 space-y-1 text-center text-sm">
          <Countdown expireTime={verificationExpireTime || Date.now() + 15 * 60 * 1000} />
          <p>
            Didn't get it? Check spam or{' '}
            <button
              type="button"
              aria-label="Resend verification code"
              className="text-primary underline hover:opacity-80"
              onClick={() => actions.handleStartRegistration()}
              disabled={loading}
            >
              resend code
            </button>
            .
          </p>
        </div>

        {error && (
          <Alert id="verification-error" variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/')}>
          ← Back
        </Button>
      </CardContent>
    </Card>
  )
}
