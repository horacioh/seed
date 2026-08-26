import * as stylex from '@stylexjs/stylex'
import {
  getDefaultAgentServerUrl,
  useAgentAccountsSync,
  useAgentList,
  useAgentServerUrl,
  useAgentWebSocketSubscription,
} from './models'
import {useSelectedAccountId} from './account'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {Container, PanelContainer} from '@shm/ui/container'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {Bot, CircleUserRound, Settings} from 'lucide-react'
import {AgentListRow} from './agent-row'
import {CreateAgentDialog, ManageAgentAccountsDialog, ModelProvidersDialog} from './dialogs'
import {AgentBreadcrumb} from './header'
import {AgentsNoAccountPage} from './no-account'
const styles = stylex.create({
  sac38f2ae: {
    overflowY: 'auto',
  },
  s584ecc36: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  sf7ae36cf: {
    marginTop: 'calc(0.25rem * 1)',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
  sa8bae6d0: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
})
export default function AgentServerPage() {
  const route = useNavRoute()
  const selectedAccountId = useSelectedAccountId()
  if (route.key !== 'agent-server') return null
  // Agent servers reject unauthenticated requests, so without an active account there is nothing
  // this page can load — gate it entirely rather than showing requests that would all fail.
  if (!selectedAccountId) return <AgentsNoAccountPage />
  return <AgentServerContent routeServerUrl={route.serverUrl} selectedAccountId={selectedAccountId} />
}
function AgentServerContent({routeServerUrl, selectedAccountId}: {routeServerUrl: string; selectedAccountId: string}) {
  // Keep every account these agents can author as synced locally, so they are immediately
  // mentionable and openable elsewhere in the app.
  useAgentAccountsSync()
  const serverUrlQuery = useAgentServerUrl()
  const serverUrl = routeServerUrl || serverUrlQuery.data || getDefaultAgentServerUrl() || ''
  const agents = useAgentList(serverUrl, selectedAccountId)
  const providersDialog = useAppDialog(ModelProvidersDialog)
  const manageAccountsDialog = useAppDialog(ManageAgentAccountsDialog)
  const createAgentDialog = useAppDialog(CreateAgentDialog)
  useAgentWebSocketSubscription(serverUrl, selectedAccountId, `account/${selectedAccountId}`)
  return (
    <PanelContainer className={stylex.props(styles.sac38f2ae).className || ''}>
      <Container className="max-w-4xl gap-4 pt-4 pb-8">
        <AgentBreadcrumb serverUrl={serverUrl} />
        <header className={stylex.props(styles.s584ecc36).className || ''}>
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <div className={stylex.props(styles.s86ff3e4).className || ''}>
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <Bot className={stylex.props(styles.sca3de969).className || ''} />
                </div>
                <SizableText size="2xl" weight="bold">
                  Agents server
                </SizableText>
              </div>
              <SizableText size="sm" color="muted" className={stylex.props(styles.sf7ae36cf).className || ''}>
                {serverUrl}
              </SizableText>
            </div>
          </div>
          <div className={stylex.props(styles.sa8bae6d0).className || ''}>
            <Tooltip content="Create Agent">
              <span>
                <Button
                  className="max-sm:min-h-10"
                  onClick={() =>
                    createAgentDialog.open({
                      serverUrls: [serverUrl],
                      selectedAccountId,
                    })
                  }
                >
                  <Bot className={stylex.props(styles.sca3de968).className || ''} />
                  Create Agent
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="outline"
              className="max-sm:min-h-10"
              onClick={() =>
                manageAccountsDialog.open({
                  serverUrl,
                  selectedAccountId,
                })
              }
            >
              <CircleUserRound className={stylex.props(styles.sca3de968).className || ''} />
              Accounts
            </Button>
            <Button
              variant="outline"
              className="max-sm:min-h-10"
              onClick={() =>
                providersDialog.open({
                  serverUrl,
                  selectedAccountId,
                })
              }
            >
              <Settings className={stylex.props(styles.sca3de968).className || ''} />
              Providers
            </Button>
          </div>
        </header>

        {providersDialog.content}
        {manageAccountsDialog.content}
        {createAgentDialog.content}

        <section className={stylex.props(styles.sfbc6e28f).className || ''}>
          <SizableText weight="bold">Agents</SizableText>
          {agents.isLoading ? <SizableText color="muted">Loading agents…</SizableText> : null}
          {agents.isError ? (
            <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
              {agents.error instanceof Error ? agents.error.message : 'Could not load agents'}
            </SizableText>
          ) : null}
          {!agents.isLoading && !agents.data?.length ? (
            <SizableText color="muted">No agents on this server yet.</SizableText>
          ) : null}
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            {(agents.data || []).map((agent) => (
              <AgentListRow
                key={agent.id}
                agentId={agent.id}
                name={agent.definition.name}
                status={agent.status}
                serverUrl={serverUrl}
                accessRole={agent.accessRole}
              />
            ))}
          </div>
        </section>
      </Container>
    </PanelContainer>
  )
}
