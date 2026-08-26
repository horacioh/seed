import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {Container, PanelContainer} from '@shm/ui/container'
import {SizableText} from '@shm/ui/text'
import {Bot, LogIn} from 'lucide-react'
import {getAgentsPlatform, type AgentsSignInPrompt} from './platform'

// The platform is registered once before render and never swapped, so resolving the optional
// sign-in hook through a wrapper keeps hook order stable across renders.
const styles = stylex.create({
  sac38f2ae: {
    overflowY: 'auto',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  s6533d573: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 6)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
const useSignInPromptHook: () => AgentsSignInPrompt = () => {
  return (
    getAgentsPlatform().useSignInPrompt ??
    (() => ({
      hasAccounts: false,
    }))
  )()
}

/**
 * Agent servers only accept authenticated requests, so without an active account the page cannot
 * talk to any of them — including the local one. Instead of rendering server rows whose requests
 * would all fail, explain the blocker and offer the fix.
 */
export function AgentsNoAccountPage() {
  const {hasAccounts, signIn, dialog} = useSignInPromptHook()
  return (
    <PanelContainer className={stylex.props(styles.sac38f2ae).className || ''}>
      <Container className="max-w-4xl gap-6 py-8">
        <div className={stylex.props(styles.s86ff3e5).className || ''}>
          <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
            <Bot className={stylex.props(styles.sca3de96a).className || ''} />
          </div>
          <SizableText size="2xl" weight="bold">
            Agents
          </SizableText>
        </div>

        <section className={stylex.props(styles.s6533d573).className || ''}>
          <SizableText weight="bold">Sign in to use agents</SizableText>
          <SizableText color="muted">
            {hasAccounts
              ? 'Agent servers require an authenticated account. Select an account from the account menu in the top-right corner to continue.'
              : 'Agent servers require an authenticated account. Sign in or create an account to get started.'}
          </SizableText>
          {!hasAccounts && signIn ? (
            <Button onClick={() => signIn()}>
              <LogIn className={stylex.props(styles.sca3de968).className || ''} />
              Sign in
            </Button>
          ) : null}
        </section>

        {dialog}
      </Container>
    </PanelContainer>
  )
}
