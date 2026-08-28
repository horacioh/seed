import * as stylex from '@stylexjs/stylex'
import {
  isLocalAgentServer,
  LOCAL_AGENT_SERVER_LABEL,
  useAcceptAgentInvite,
  useAgentAccountsSync,
  useAgentInviteLists,
  useAgentLists,
  useAgentServerHealths,
  useDeclineAgentInvite,
  useAgentServerUrls,
  useAgentWebSocketSubscription,
  useLocalAgentServerUrl,
  useSpaceAgents,
} from './models'
import {useSelectedAccountId} from './account'
import {useNavigate} from './navigation'
import {hostnameStripProtocol} from '@shm/shared'
import {abbreviateUid} from '@shm/shared/utils/abbreviate'
import {Button} from '@shm/ui/button'
import {Container, PanelContainer} from '@shm/ui/container'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {Bot, Check, CircleUserRound, Mail, Settings, X} from 'lucide-react'
import React, {useMemo} from 'react'
import {AgentListRow} from './agent-row'
import {CreateAgentDialog, ManageAgentAccountsDialog, ModelProvidersDialog} from './dialogs'
import {AgentsNoAccountPage} from './no-account'
import {getAgentsPlatform} from './platform'
import {AgentServersDialog} from './server-settings'
const styles_6 = stylex.create({
  sbe30145e: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)',
  },
  s460ef3a3: {
    backgroundColor: 'oklch(72.3% 0.219 149.579)',
  },
})
const styles_5 = stylex.create({
  sd5276459: {
    display: 'inline-block',
  },
  s32692dad: {
    width: 'calc(0.25rem * 2.5)',
    height: 'calc(0.25rem * 2.5)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s43a3ad5d: {
    verticalAlign: 'middle',
  },
  s5ac553fa: {
    backgroundColor: 'var(--destructive)',
  },
})
const styles_4 = stylex.create({
  s2ae8e6d: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    color: 'var(--primary)',
    display: 'flex',
    width: 'calc(var(--spacing) * 11)',
    height: 'calc(var(--spacing) * 11)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  s883798c7: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s284af276: {
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  s718fede5: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    color: 'var(--primary)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-bold)',
  },
  sf8314d9d: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    color: 'var(--primary)',
    display: 'flex',
    width: 'calc(var(--spacing) * 9)',
    height: 'calc(var(--spacing) * 9)',
    flex: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
  },
})
const styles_3 = stylex.create({
  scd6e56f9: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  scf771367: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
})
const styles_2 = stylex.create({
  sa4a9384c: {
    maxWidth: '56rem',
    gap: 'calc(0.25rem * 6)',
    paddingBlock: 'calc(0.25rem * 8)',
  },
  sa4681c45: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  se30fd43e: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
  },
})
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
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sca3de96a: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sbbe27b51: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
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
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s3566be63: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sf2f4c151: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  s12583799: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s597c48d: {
    display: 'block',
  },
})
function AgentsListPage() {
  const selectedAccountId = useSelectedAccountId()
  // Agent servers reject unauthenticated requests, so without an active account there is nothing
  // this page can load — gate it entirely rather than showing rows that would all fail.
  if (!selectedAccountId) return <AgentsNoAccountPage />
  return <AgentsListContent selectedAccountId={selectedAccountId} />
}
function AgentsListContent({selectedAccountId}: {selectedAccountId: string}) {
  // Keep every account these agents can author as synced locally, so they are immediately
  // mentionable and openable elsewhere in the app.
  useAgentAccountsSync()
  const navigate = useNavigate()
  const serverUrlsQuery = useAgentServerUrls()
  const serverUrls = serverUrlsQuery.data || []
  const localServerUrl = useLocalAgentServerUrl()
  const agentQueries = useAgentLists(serverUrls, selectedAccountId)
  const inviteQueries = useAgentInviteLists(serverUrls, selectedAccountId)
  const healthQueries = useAgentServerHealths(serverUrls)
  const providersDialog = useAppDialog(ModelProvidersDialog)
  const manageAccountsDialog = useAppDialog(ManageAgentAccountsDialog)
  const createAgentDialog = useAppDialog(CreateAgentDialog)
  const serverSettingsDialog = useAppDialog(AgentServersDialog)
  // Platforms with a settings window (desktop) open it; the rest manage servers in a dialog here.
  const openServerSettings = (getAgentsPlatform().useOpenServerSettings ?? (() => null))()
  const agents = useMemo(
    () =>
      serverUrls.flatMap((serverUrl, index) =>
        (agentQueries[index]?.data || []).map((agent) => ({
          ...agent,
          serverUrl,
        })),
      ),
    [agentQueries, serverUrls],
  )
  const invites = useMemo(
    () =>
      serverUrls.flatMap((serverUrl, index) =>
        (inviteQueries[index]?.data || []).map((invite) => ({
          ...invite,
          serverUrl,
        })),
      ),
    [inviteQueries, serverUrls],
  )
  const spaceAgents = useSpaceAgents(selectedAccountId)
  // Only the ones the user does not already have. A space owner's own agents belong under "All
  // Agents" below, where they can be opened and edited; what this section is for is the visitor
  // case, where every list comes back empty and the space's published agents are the only way in.
  const publishedAgents = useMemo(
    () =>
      spaceAgents.agents.filter(
        (option) => !agents.some((agent) => agent.serverUrl === option.serverUrl && agent.id === option.agent.id),
      ),
    [agents, spaceAgents.agents],
  )
  const isLoadingAgents = agentQueries.some((query) => query.isFetching && !query.data)
  const agentError = agentQueries.find((query) => query.isError)?.error
  const createAgentDisabledReason = !serverUrls.length ? 'Configure an agent server before creating an agent.' : null
  return (
    <PanelContainer className={stylex.props(styles.sac38f2ae).className || ''}>
      <Container className={stylex.props(styles_2.sa4a9384c).className || ''}>
        <div className={stylex.props(styles.s584ecc36).className || ''}>
          <div className={stylex.props(styles.s86ff3e5).className || ''}>
            <div className={stylex.props(styles_4.s2ae8e6d).className || ''}>
              <Bot className={stylex.props(styles.sca3de96a).className || ''} />
            </div>
            <SizableText size="2xl" weight="bold">
              Agents
            </SizableText>
          </div>
        </div>

        <section className={stylex.props(styles.sfbc6e28e).className || ''}>
          <div className={stylex.props(styles.sbbe27b51).className || ''}>
            <SizableText weight="bold">Agent Servers</SizableText>
            <Tooltip content="Configure agent servers">
              <Button onClick={() => (openServerSettings ? openServerSettings() : serverSettingsDialog.open(true))}>
                <Settings className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </Tooltip>
          </div>
          {serverUrls.map((serverUrl, index) => {
            const health = healthQueries[index]
            const status = health?.isLoading ? 'Checking…' : health?.isError ? 'Offline' : 'Online'
            const isLocal = isLocalAgentServer(serverUrl, localServerUrl.data)
            // The local server is part of the app, so an "online" indicator on it is noise. A
            // failure still shows, because that is a real problem the user needs to see.
            const showStatusDot = !isLocal || health?.isError
            return (
              <AgentServerSubscription key={serverUrl} serverUrl={serverUrl} selectedAccountId={selectedAccountId}>
                <div
                  className={stylex.props(styles_4.s883798c7).className || ''}
                  onClick={() =>
                    navigate({
                      key: 'agent-server',
                      serverUrl,
                    })
                  }
                >
                  <div className={stylex.props(styles_2.sa4681c45).className || ''}>
                    <SizableText
                      size="xs"
                      className={stylex.props(isLocal ? styles_3.scd6e56f9 : styles_3.scf771367).className || ''}
                    >
                      {isLocal ? LOCAL_AGENT_SERVER_LABEL : hostnameStripProtocol(serverUrl)}
                    </SizableText>
                    {showStatusDot ? (
                      <Tooltip content={status} asChild>
                        <span
                          data-testid="agent-server-status-dot"
                          data-status={health?.isLoading ? 'loading' : health?.isError ? 'error' : 'online'}
                          className={
                            (stylex.props(
                              styles_5.sd5276459,
                              styles_5.s32692dad,
                              styles_5.s775755af,
                              styles_5.s43a3ad5d,
                            ).className || '') +
                            ' ' +
                            (health?.isLoading
                              ? stylex.props(styles_6.sbe30145e).className || ''
                              : health?.isError
                                ? stylex.props(styles_5.s5ac553fa).className || ''
                                : stylex.props(styles_6.s460ef3a3).className || '')
                          }
                        />
                      </Tooltip>
                    ) : null}
                  </div>
                  <div className={stylex.props(styles.s86ff3e4).className || ''}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={stylex.props(styles_4.s284af276).className || ''}
                      onClick={(event) => {
                        event.stopPropagation()
                        manageAccountsDialog.open({
                          serverUrl,
                          selectedAccountId,
                        })
                      }}
                    >
                      <CircleUserRound className={stylex.props(styles.sca3de968).className || ''} />
                      Accounts
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={stylex.props(styles_4.s284af276).className || ''}
                      onClick={(event) => {
                        event.stopPropagation()
                        providersDialog.open({
                          serverUrl,
                          selectedAccountId,
                        })
                      }}
                    >
                      <Settings className={stylex.props(styles.sca3de968).className || ''} />
                      Providers
                    </Button>
                  </div>
                </div>
              </AgentServerSubscription>
            )
          })}
          {!serverUrls.length ? <SizableText color="muted">No agent servers configured.</SizableText> : null}
        </section>

        {providersDialog.content}
        {manageAccountsDialog.content}
        {createAgentDialog.content}
        {serverSettingsDialog.content}

        {invites.length ? (
          <section className={stylex.props(styles.sfbc6e28f).className || ''}>
            <div className={stylex.props(styles.s86ff3e4).className || ''}>
              <Mail className={stylex.props(styles.s3566be63).className || ''} />
              <SizableText weight="bold">Invites</SizableText>
              <span className={stylex.props(styles_4.s718fede5).className || ''}>{invites.length}</span>
            </div>
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              {invites.map((invite) => (
                <AgentInviteRow
                  key={`${invite.serverUrl}:${invite.agentId}`}
                  invite={invite}
                  selectedAccountId={selectedAccountId}
                />
              ))}
            </div>
          </section>
        ) : null}

        {publishedAgents.length ? (
          <section className={stylex.props(styles.sfbc6e28f).className || ''}>
            <SizableText weight="bold">Agents in this space</SizableText>
            <div className={stylex.props(styles.sfbc6e28e).className || ''}>
              {publishedAgents.map(({serverUrl, agent}) => (
                <AgentListRow
                  key={`${serverUrl}:${agent.id}`}
                  agentId={agent.id}
                  name={agent.definition.name}
                  status={agent.status}
                  serverUrl={serverUrl}
                  accessRole={agent.accessRole}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className={stylex.props(styles.sfbc6e28f).className || ''}>
          <div className={stylex.props(styles.sbbe27b51).className || ''}>
            <SizableText weight="bold">All Agents</SizableText>
            <Tooltip content={createAgentDisabledReason || 'Create Agent'}>
              <span>
                <Button
                  className={stylex.props(styles_4.s284af276).className || ''}
                  onClick={() =>
                    createAgentDialog.open({
                      serverUrls,
                      selectedAccountId,
                    })
                  }
                  disabled={!!createAgentDisabledReason}
                >
                  <Bot className={stylex.props(styles.sca3de968).className || ''} />
                  Create Agent
                </Button>
              </span>
            </Tooltip>
          </div>
          {isLoadingAgents ? <SizableText color="muted">Loading agents…</SizableText> : null}
          {agentError ? (
            <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
              {agentError instanceof Error ? agentError.message : 'Could not load agents'}
            </SizableText>
          ) : null}
          {!isLoadingAgents && !agents.length ? <SizableText color="muted">No agents yet.</SizableText> : null}
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            {agents.map((agent) => (
              <AgentListRow
                key={`${agent.serverUrl}:${agent.id}`}
                agentId={agent.id}
                name={agent.definition.name}
                status={agent.status}
                serverUrl={agent.serverUrl}
                accessRole={agent.accessRole}
              />
            ))}
          </div>
        </section>
      </Container>
    </PanelContainer>
  )
}
function AgentInviteRow({
  invite,
  selectedAccountId,
}: {
  invite: {
    agentId: string
    agentName: string
    ownerAccountId: string
    role: 'reader' | 'writer'
    serverUrl: string
  }
  selectedAccountId: string
}) {
  const navigate = useNavigate()
  const accept = useAcceptAgentInvite(invite.serverUrl, selectedAccountId)
  const decline = useDeclineAgentInvite(invite.serverUrl, selectedAccountId)
  const pending = accept.isLoading || decline.isLoading
  return (
    <div className={stylex.props(styles.sf2f4c151).className || ''}>
      <div className={stylex.props(styles_4.sf8314d9d).className || ''}>
        <Bot className={stylex.props(styles.sca3de968).className || ''} />
      </div>
      <div className={stylex.props(styles_2.se30fd43e).className || ''}>
        <SizableText weight="bold" className={stylex.props(styles.s12583799).className || ''}>
          {invite.agentName}
        </SizableText>
        <SizableText size="xs" color="muted" className={stylex.props(styles.s597c48d).className || ''}>
          {invite.role === 'writer' ? 'Write collaborator' : 'Read collaborator'} · invited by{' '}
          {abbreviateUid(invite.ownerAccountId)}
        </SizableText>
      </div>
      <Button
        size="sm"
        onClick={() =>
          accept.mutate(invite.agentId, {
            onSuccess: (result) => {
              if (result._ !== 'AcceptAgentInviteResponse') return
              navigate({
                key: 'agent',
                agentId: invite.agentId,
                serverUrl: invite.serverUrl,
              })
            },
          })
        }
        disabled={pending}
      >
        <Check className={stylex.props(styles.sca3de968).className || ''} /> Accept
      </Button>
      <Button variant="ghost" size="sm" onClick={() => decline.mutate(invite.agentId)} disabled={pending}>
        <X className={stylex.props(styles.sca3de968).className || ''} /> Decline
      </Button>
    </div>
  )
}
function AgentServerSubscription({
  serverUrl,
  selectedAccountId,
  children,
}: {
  serverUrl: string
  selectedAccountId: string
  children: React.ReactNode
}) {
  useAgentWebSocketSubscription(serverUrl, selectedAccountId, `account/${selectedAccountId}`)
  return <>{children}</>
}
export default AgentsListPage
