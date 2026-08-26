import * as stylex from '@stylexjs/stylex'
import {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {useSubscribeToNotifications} from '@shm/shared/models/email-notifications'
import {useState} from 'react'
import {Button} from './button'
import {Input} from './components/input'
import {cn} from './utils'
const styles = stylex.create({
  s62c182b1: {
    fontWeight: '600',
  },
  s8d8eae3a: {
    color: 'var(--foreground)',
    marginBottom: 'calc(0.25rem * 3)',
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
    fontWeight: '600',
  },
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  s402349c2: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
interface InlineSubscribeBoxProps {
  accountId: string
  notifyServiceHost: string
  accountMeta?: HMMetadata
  className?: string
}
export function InlineSubscribeBox({accountId, notifyServiceHost, accountMeta, className}: InlineSubscribeBoxProps) {
  const [email, setEmail] = useState('')
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const {mutate, isPending, error: mutationError} = useSubscribeToNotifications()
  const error = mutationError instanceof Error ? mutationError.message : null
  const handleSubscribe = () => {
    if (!email.trim()) return
    mutate(
      {
        notifyServiceHost,
        action: 'subscribe',
        email,
        accountId,
        notifyOwnedDocChange: true,
        notifySiteDiscussions: true,
      },
      {
        onSuccess: () => {
          setSuccessEmail(email)
          setEmail('')
        },
      },
    )
  }
  if (successEmail) {
    return (
      <div
        className={cn(
          'mx-auto my-6 max-w-2xl rounded-lg border border-green-200 bg-green-50 px-6 py-5 dark:border-green-800 dark:bg-green-950',
          className,
        )}
      >
        <p className="text-sm text-green-800 dark:text-green-200">
          <span className={stylex.props(styles.s62c182b1).className || ''}>{successEmail}</span> will be notified when{' '}
          <span className={stylex.props(styles.s62c182b1).className || ''}>{accountMeta?.name || 'this space'}</span> is
          updated.
        </p>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'mx-auto my-6 max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 px-6 py-5 dark:border-yellow-200/30 dark:bg-yellow-50/10',
        className,
      )}
    >
      <p className={stylex.props(styles.s8d8eae3a).className || ''}>
        Do you like what you are reading? Subscribe to receive updates.
      </p>
      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className={stylex.props(styles.se658ac14).className || ''}>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          disabled={isPending}
          className="flex-1 bg-white dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubscribe()
          }}
        />
        <Button
          variant="brand"
          size="sm"
          onClick={handleSubscribe}
          disabled={!email.trim() || isPending}
          className="plausible-event-name=inline-subscribe text-white"
        >
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      <p className={stylex.props(styles.s402349c2).className || ''}>Unsubscribe anytime</p>
    </div>
  )
}
