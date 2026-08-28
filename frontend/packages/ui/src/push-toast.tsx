import * as stylex from '@stylexjs/stylex'
import {hostnameStripProtocol, StateStream} from '@shm/shared'
import {useStream} from '@shm/shared/use-stream'
const styles_2 = stylex.create({
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
})
const styles = stylex.create({
  sa176bd57: {
    fontWeight: '100',
  },
})
export type PushResourceStatus = {
  hosts: {
    host: string
    status: 'success' | 'error' | 'pending'
    peerId?: string
    message?: string
  }[]
}

/** Counts of completed (success or error) and total destination hosts. */
function pushProgress(state: PushResourceStatus | null | undefined): {
  done: number
  total: number
} {
  const total = state?.hosts.length ?? 0
  const done = state?.hosts.filter((h) => h.status === 'success' || h.status === 'error').length ?? 0
  return {
    done,
    total,
  }
}

/**
 * Compact push-status toast for the "copy link" action. Shows a single
 * summary line; during loading it surfaces progress as "(done/total)" once
 * destination hosts are known.
 */
export function CopiedToast({
  pushStatus,
  status,
  errorMessage,
}: {
  pushStatus: StateStream<PushResourceStatus | null>
  status: 'loading' | 'success' | 'error'
  errorMessage?: string
}) {
  const state = useStream(pushStatus)
  const {done, total} = pushProgress(state)
  if (status === 'loading') {
    const progress = total > 0 ? ` (${done}/${total})` : ''
    return <p>{`Copied URL. Pushing…${progress}`}</p>
  }
  if (status === 'success') {
    const suffix = total > 0 ? ` to ${total} server${total === 1 ? '' : 's'}` : ' to servers'
    return <p>{`Copied URL. Pushed${suffix}`}</p>
  }
  return <p>{errorMessage ? `Copied URL. Failed to push: ${errorMessage}` : 'Copied URL. Failed to push to servers'}</p>
}
export function PublishedToast({
  pushStatus,
  status,
  errorMessage,
}: {
  pushStatus: StateStream<PushResourceStatus | null>
  status: 'loading' | 'success' | 'error'
  errorMessage?: string
}) {
  return (
    <PushToast
      pushStatus={pushStatus}
      status={status}
      baseMessage="Published on your node"
      errorMessage={errorMessage}
    />
  )
}

/**
 * Compact push-status toast used by the unified editor's pushDocument actor.
 * Shows a single summary line without the per-host breakdown. During loading
 * it surfaces progress as "(done/total)" once destination hosts are known.
 */
export function PushedToast({
  pushStatus,
  status,
  errorMessage,
}: {
  pushStatus: StateStream<PushResourceStatus | null>
  status: 'loading' | 'success' | 'error'
  errorMessage?: string
}) {
  const state = useStream(pushStatus)
  const {done, total} = pushProgress(state)
  if (status === 'loading') {
    const progress = total > 0 ? ` (${done}/${total})` : ''
    return <p>{`Publishing to servers…${progress}`}</p>
  }
  if (status === 'success') {
    const suffix = total > 0 ? ` to ${total} server${total === 1 ? '' : 's'}` : ' to servers'
    return <p>{`Published${suffix}`}</p>
  }
  return <p>{errorMessage ? `Failed to push to servers: ${errorMessage}` : 'Failed to push to servers'}</p>
}
export function PushToast({
  pushStatus,
  status,
  baseMessage,
  errorMessage,
}: {
  pushStatus: StateStream<PushResourceStatus | null>
  status: 'loading' | 'success' | 'error'
  baseMessage: string
  errorMessage?: string
}) {
  const state = useStream(pushStatus)
  const hosts = state?.hosts || []
  let statusMessage = baseMessage
  if (status === 'success') {
    statusMessage += ' and pushed to all spaces.'
  } else if (status === 'error') {
    statusMessage += ' but failed to push. Your content will be distributed eventually.'
  } else {
    // loading
    statusMessage += '. Now pushing to spaces:'
  }
  return (
    <>
      {errorMessage ? <p className={stylex.props(null).className || ''}>{errorMessage}</p> : <p>{statusMessage}</p>}
      {hosts.map(({host, message, status}) => {
        return (
          <p
            key={host}
            className={stylex.props(status === 'error' ? styles_2.s8a2570e2 : styles_2.sf2718385).className || ''}
          >
            <span>{hostnameStripProtocol(host)}</span>
            <span className={stylex.props(styles.sa176bd57).className || ''}>{` - ${message || 'Syncing...'}`}</span>
          </p>
        )
      })}
    </>
  )
}
