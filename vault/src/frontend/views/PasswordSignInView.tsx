import {ErrorMessage} from '@/frontend/components/ErrorMessage'
import {PasswordInput} from '@/frontend/components/PasswordInput'
import {Spinner} from '@/frontend/components/Spinner'
import {Button} from '@/frontend/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/frontend/components/ui/card'
import * as navigation from '@/frontend/navigation'
import {useActions, useAppState} from '@/frontend/store'
import {X} from 'lucide-react'
import type React from 'react'

/**
 * Password sign-in for an existing user.
 */
export function PasswordSignInView() {
  const {email, password, loading, error, sessionExpired, sessionChecked} = useAppState()
  const actions = useActions()
  const navigate = navigation.useHashNavigate()

  if (!sessionChecked) {
    return <Spinner label="Checking your session" />
  }
  if (!email) {
    return <navigation.HashNavigate to="/" replace />
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void actions.handleLogin()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle as="h1" tabIndex={-1} className="text-left text-xl">
            Sign in with password
          </CardTitle>
          <button
            type="button"
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground -mr-1 cursor-pointer transition-colors"
            onClick={() => navigate('/')}
          >
            <X className="size-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {sessionExpired ? <ErrorMessage message="Your session expired. Sign in again to continue." /> : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invisible (not display:none, which password managers may skip) username field, so a
              saved password is stored under this email and picked out from other saved logins. */}
          <input
            type="text"
            name="username"
            aria-label="Email address"
            value={email}
            autoComplete="username"
            className="pointer-events-none absolute m-0 h-0 w-0 opacity-0"
            readOnly
            tabIndex={-1}
          />
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Add password"
            value={password}
            onChange={(value) => {
              actions.setPassword(value)
              if (error) actions.setError('')
            }}
            autoComplete="current-password"
            error={error}
          />

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="underline"
              onClick={() => {
                actions.setError('')
                navigate('/login/recover')
              }}
            >
              Forgot password?
            </Button>
          </div>

          <Button type="submit" loading={loading} disabled={!password || !!error} className="w-full">
            Continue
          </Button>
        </form>

        <Button
          variant="link"
          className="mt-2 w-full"
          disabled={loading}
          onClick={() => {
            actions.setError('')
            navigate('/login')
          }}
        >
          ← Back
        </Button>
      </CardContent>
    </Card>
  )
}
