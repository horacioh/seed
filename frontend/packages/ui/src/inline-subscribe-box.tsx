import * as stylex from '@stylexjs/stylex'
import {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {useSubscribeToNotifications} from '@shm/shared/models/email-notifications'
import {useState} from 'react'
import {Button} from './button'
import {Input} from './components/input'
import {cn} from './utils'
const styles_3 = stylex.create({
  sb42feb5d: {
    flex: '1',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s2daecf89: {
    color: '#fff',
  },
})
const styles_2 = stylex.create({
  s5dffd66f: {
    marginInline: 'auto',
    marginBlock: 'calc(var(--spacing) * 6)',
    maxWidth: 'var(--container-2xl)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--tone-green-200)',
    backgroundColor: 'var(--tone-green-50)',
    paddingInline: 'calc(var(--spacing) * 6)',
    paddingBlock: 'calc(var(--spacing) * 5)',
  },
  s34803560: {
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    color: 'var(--tone-green-800)',
  },
  se56a8f2: {
    marginInline: 'auto',
    marginBlock: 'calc(var(--spacing) * 6)',
    maxWidth: 'var(--container-2xl)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--tone-yellow-200-2)',
    backgroundColor: 'var(--tone-yellow-50-2)',
    paddingInline: 'calc(var(--spacing) * 6)',
    paddingBlock: 'calc(var(--spacing) * 5)',
  },
  sebc127e2: {
    marginBottom: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    color: 'var(--tone-red-600)',
  },
})
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
      <div className={cn(stylex.props(styles_2.s5dffd66f).className || '', className)}>
        <p className={stylex.props(styles_2.s34803560).className || ''}>
          <span className={stylex.props(styles.s62c182b1).className || ''}>{successEmail}</span> will be notified when{' '}
          <span className={stylex.props(styles.s62c182b1).className || ''}>{accountMeta?.name || 'this space'}</span> is
          updated.
        </p>
      </div>
    )
  }
  return (
    <div className={cn(stylex.props(styles_2.se56a8f2).className || '', className)}>
      <p className={stylex.props(styles.s8d8eae3a).className || ''}>
        Do you like what you are reading? Subscribe to receive updates.
      </p>
      {error && <p className={stylex.props(styles_2.sebc127e2).className || ''}>{error}</p>}
      <div className={stylex.props(styles.se658ac14).className || ''}>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          disabled={isPending}
          className={stylex.props(styles_3.sb42feb5d, styles_3.s605ce4a1).className || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubscribe()
          }}
        />
        <Button
          variant="brand"
          size="sm"
          onClick={handleSubscribe}
          disabled={!email.trim() || isPending}
          className={stylex.props(styles_3.s2daecf89).className || ''}
        >
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      <p className={stylex.props(styles.s402349c2).className || ''}>Unsubscribe anytime</p>
    </div>
  )
}
