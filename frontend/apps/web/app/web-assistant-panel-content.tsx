import * as stylex from '@stylexjs/stylex'
import {useAssistantPanel} from '@/assistant-panel-state'
import {useCreateAccount, useLocalKeyPair, useLocalKeyPairLoaded} from '@/auth'
import {registerWebAgentsPlatform} from '@/web-agents-platform'
import {AssistantPanel} from '@shm/ui/agents/assistant-panel'
import {Button} from '@shm/ui/button'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {X} from 'lucide-react'

// Register the web platform adapter before any agents UI renders. This module only loads from the
// panel's client-lazy chunk (and the /hm/agents pages register the same adapter — the call is
// idempotent), so the registration never runs during SSR of other pages.
const styles = stylex.create({
  s3b59b99: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 12)',
  },
  s2f33c551: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  sec2fc073: {
    borderColor: 'var(--border)',
    display: 'flex',
    height: 'calc(0.25rem * 10)',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 1)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s20f7f9f0: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 4)',
    textAlign: 'center',
  },
})
registerWebAgentsPlatform()

/** Client-only body of the assistant panel: sign-in gate plus the shared panel. */
export default function WebAssistantPanelContent({
  showClose = false,
}: {
  /** Render a close button in the panel header (the side panel has no other way to dismiss it). */
  showClose?: boolean
}) {
  const panel = useAssistantPanel()
  const onClose = showClose ? panel.close : undefined
  const keyPairLoaded = useLocalKeyPairLoaded()
  const keyPair = useLocalKeyPair()
  if (!keyPairLoaded) {
    return (
      <div className={stylex.props(styles.s3b59b99).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (!keyPair) return <SignedOutPanel onClose={onClose} />
  return (
    <AssistantPanel
      initialSessionId={panel.sessionId}
      newChatRequest={panel.newChatRequest}
      onSessionChange={panel.setSessionId}
      onClose={onClose}
    />
  )
}
function SignedOutPanel({onClose}: {onClose?: () => void}) {
  const {content, createAccount} = useCreateAccount({})
  return (
    <div className={stylex.props(styles.s2f33c551).className || ''}>
      <div className={stylex.props(styles.sec2fc073).className || ''}>
        <SizableText size="sm" className={stylex.props(styles.s129e46b3).className || ''}>
          Agents
        </SizableText>
        {onClose ? (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
            title="Close agents panel"
            aria-label="Close agents panel"
          >
            <X className={stylex.props(styles.sca3de968).className || ''} />
          </button>
        ) : null}
      </div>
      <div className={stylex.props(styles.s20f7f9f0).className || ''}>
        <SizableText size="sm" color="muted">
          Sign in to chat with your agents. Your local web identity signs every agent action.
        </SizableText>
        <Button
          size="sm"
          onClick={() =>
            createAccount({
              source: 'login',
            })
          }
        >
          Sign in
        </Button>
      </div>
      {content}
    </div>
  )
}
