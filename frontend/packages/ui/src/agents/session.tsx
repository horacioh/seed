import * as stylex from '@stylexjs/stylex'
import {agentAccessCanChat, agentAccessCanWrite} from './access'
import {type AgentRunActivity, type AgentSessionTriggerContext} from './client'
import {AgentRunStatusBar, useRunStartedAt} from './agent-run-status'
import {SessionSummaryBanner} from './session-children'
import {useChatAutoScroll} from './chat-autoscroll'
import {AgentErrorRow, AssistantMessageParts, ChatMessageBubble} from './message-rendering'
import {
  addOptimisticSessionMessage,
  type AgentSessionDraftMessage,
  getDefaultAgentServerUrl,
  useAgentAccountsSync,
  useAgentDetail,
  useAgentServerUrl,
  useAgentSession,
  useAgentTriggers,
  useAgentWebSocketSubscription,
  useDeleteAgentSession,
  useMessageAgentSession,
  useRetrySession,
  useRun,
  useSessionRuns,
  useStopAgentSession,
  useUpdateAgentSession,
} from './models'
import {
  buildAgentSessionChatRows,
  interleaveRunRecords,
  buildAgentSessionUrl,
  chatRowHasPendingToolCall,
  frozenRunIds,
  getSharedEventIdFromHash,
  retryableErrorRowKey,
  type AgentSessionChatRow as AgentSessionChatRowData,
} from './agent-session-rows'
import {type ChatMessagePart} from './chat-parts'
import {useSelectedAccountId} from './account'
import {useNavigate} from './navigation'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@shm/ui/components/alert-dialog'
import {DialogDescription, DialogTitle} from '@shm/ui/components/dialog'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {Container, PanelContainer} from '@shm/ui/container'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {ArrowDown, CornerLeftUp, ExternalLink, Info, Link2, ScrollText, Trash2} from 'lucide-react'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {AgentHeader, AgentSubpageHeader, SessionModelBadge} from './header'
import {RunRecordCard, SessionRunCard} from './run-card'
import {AgentRichMessageComposer, SUB_SESSION_DRIVEN_MESSAGE, TERMINAL_RUN_STATUSES} from './rich-message-composer'
import {getTriggerActivityRoute, summarizeTriggerSource, TriggerContextView} from './trigger-types'

/**
 * Header affordances for a sub-session: where it came from, and whether it is still someone else's
 * to drive. A parked parent leaves this page silent for minutes, so the banner is what makes that
 * legible rather than looking like a stalled chat.
 */
const styles = stylex.create({
  s6a3cf028: {
    display: 'flex',
    flex: 'none',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 3)',
  },
  se6c9d13: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flex: 'none',
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
  sf57902f3: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
  },
  s12583799: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s6ebbda8: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  s26068628: {
    borderColor: 'var(--border)',
    flex: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  sa0238738: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sb56b7abc: {
    pointerEvents: 'none',
    position: 'sticky',
    bottom: 'calc(0.25rem * 2)',
    display: 'flex',
    justifyContent: 'center',
  },
  s87cca2a6: {
    backgroundColor: 'var(--muted)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
    pointerEvents: 'auto',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1.5)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-lg)',
  },
  s2b00eca2: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
  },
  s25987914: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
  },
  s49ebd2b1: {
    backgroundColor: 'var(--muted)',
    marginRight: 'calc(0.25rem * 6)',
    overflow: 'auto',
    borderRadius: 'var(--radius)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
function SubSessionHeader({
  parentTitle,
  isDriven,
  onOpenParent,
}: {
  parentTitle?: string
  isDriven: boolean
  onOpenParent: () => void
}) {
  return (
    <div className={stylex.props(styles.s6a3cf028).className || ''}>
      <button
        type="button"
        className="bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground flex max-w-full items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs"
        onClick={onOpenParent}
        title="Open the parent session"
      >
        <CornerLeftUp className={stylex.props(styles.se6c9d13).className || ''} />
        <span className="min-w-0 truncate">{parentTitle || 'Parent session'}</span>
      </button>
      {isDriven ? (
        <div className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-1.5 text-xs">
          {SUB_SESSION_DRIVEN_MESSAGE}
        </div>
      ) : null}
    </div>
  )
}
function TriggerContextPopover({
  context,
  onOpenTrigger,
}: {
  context: AgentSessionTriggerContext
  onOpenTrigger: () => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Started by trigger: ${context.triggerName}`}>
          <Info className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="!w-[min(92vw,44rem)]">
        <div className={stylex.props(styles.sfbc6e28f).className || ''}>
          <div className={stylex.props(styles.sf57902f3).className || ''}>
            <div className="min-w-0">
              <SizableText weight="bold">Started by trigger</SizableText>
              <SizableText size="sm" color="muted" className={stylex.props(styles.s12583799).className || ''}>
                {context.triggerName} · {context.activitySummary}
              </SizableText>
            </div>
            <Button variant="outline" size="sm" onClick={onOpenTrigger}>
              Open trigger
            </Button>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <TriggerDetail label="Source" value={summarizeTriggerSource(context.source)} />
            <TriggerDetail label="Activity key" value={context.activityKey} mono />
            <TriggerDetail label="Firing ID" value={context.firingId} mono />
            <TriggerDetail label="Fired at" value={new Date(context.firedAt).toLocaleString()} />
            <TriggerDetail label="Status" value={context.status} />
            {context.error ? <TriggerDetail label="Error" value={context.error} /> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={stylex.props(styles.sfbc6e28d).className || ''}>
              <SizableText size="sm" weight="bold">
                Trigger prompt
              </SizableText>
              <pre className="bg-muted/60 max-h-60 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                {context.prompt}
              </pre>
            </div>
            <div className={stylex.props(styles.sfbc6e28d).className || ''}>
              <SizableText size="sm" weight="bold">
                Activity context passed to session
              </SizableText>
              <pre className="bg-muted/60 max-h-60 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                {JSON.stringify(context.activity, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
function TriggerDetail({label, value, mono}: {label: string; value: string; mono?: boolean}) {
  return (
    <div className="min-w-0">
      <SizableText size="sm" weight="bold">
        {label}
      </SizableText>
      <SizableText size="sm" color="muted" className={`block truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </SizableText>
    </div>
  )
}
function AgentSessionPage({
  sessionId,
  routeServerUrl,
  routeAgentId,
}: {
  sessionId: string
  routeServerUrl?: string
  routeAgentId?: string
}) {
  const selectedAccountId = useSelectedAccountId()
  const navigate = useNavigate()
  const serverUrlQuery = useAgentServerUrl()
  const serverUrl = routeServerUrl || serverUrlQuery.data || getDefaultAgentServerUrl() || ''
  const session = useAgentSession(serverUrl, selectedAccountId, sessionId)
  const agentId = routeAgentId || session.data?.session.agentId
  const agent = useAgentDetail(serverUrl, selectedAccountId, agentId)
  const triggers = useAgentTriggers(serverUrl, selectedAccountId, agentId)
  const messageSession = useMessageAgentSession(serverUrl, selectedAccountId)
  const stopSession = useStopAgentSession(serverUrl, selectedAccountId)
  const updateSession = useUpdateAgentSession(serverUrl, selectedAccountId)
  const deleteSessionDialog = useAppDialog(DeleteAgentSessionDialog, {
    isAlert: true,
  })
  const systemPromptDialog = useAppDialog(SystemPromptDialog)
  const lastSeq = session.data?.events.filter((event) => event.seq !== Number.MAX_SAFE_INTEGER).at(-1)?.seq
  const liveState = useAgentWebSocketSubscription(serverUrl, selectedAccountId, `sessions/${sessionId}`, lastSeq)
  const partialAssistantText = liveState.text
  const [titleDraft, setTitleDraft] = useState('')
  const [titleSaveState, setTitleSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autoScroll = useChatAutoScroll()
  const titleSaveIdRef = useRef(0)
  const loadedSessionId = session.data?.session.id
  const persistedTitle = session.data?.session.title || 'Untitled session'
  const sessionRuns = useSessionRuns(serverUrl, selectedAccountId, sessionId)
  const chatRows = useMemo(
    () =>
      interleaveRunRecords(
        buildAgentSessionChatRows(session.data?.events || [], {
          serverUrl,
          agentId,
          sessionId,
          triggerContext: session.data?.triggerContext ?? null,
        }),
        sessionRuns.data || [],
        // A model-driven agent keeps its checklist on the session, not on the run, so the freeze
        // decision needs it here for the same reason the pinned card does.
        session.data?.session.plan,
      ),
    [
      agentId,
      serverUrl,
      session.data?.events,
      session.data?.session.plan,
      session.data?.triggerContext,
      sessionId,
      sessionRuns.data,
    ],
  )
  // Which runs the scroll already owns, so the pinned slot does not tell the same story twice.
  const frozenRuns = useMemo(() => frozenRunIds(chatRows), [chatRows])
  // Chatters (public chat) may send and retry; only owners/writers may rename, delete, control
  // runs, or run session tools.
  const canChat = !!agent.data && agentAccessCanChat(agent.data.agent.accessRole)
  const canWrite = !!agent.data && agentAccessCanWrite(agent.data.agent.accessRole)
  const isAgentStreaming = session.data?.session.status === 'streaming'
  const isAgentBusy = messageSession.isPending || isAgentStreaming
  const retrySession = useRetrySession(serverUrl, selectedAccountId)
  // Deliberately not gated on the mutation being in flight: the button stays put and shows its
  // pending state until the retried run actually starts streaming, which is what removes the row.
  const retryableRowKey = canChat ? retryableErrorRowKey(chatRows, !!isAgentBusy) : undefined
  const runStartedAt = useRunStartedAt(isAgentBusy)
  // Sub-session affordances: the parent is loaded only for its title/route, and the child's own run
  // to tell "still being driven by the parent" from "finished, yours to continue". That run is a
  // child in the parent's tree, so it is reachable by id (SessionInfo.runId), not by ListRuns.
  const parentSessionId = session.data?.session.parentSessionId
  const parentSession = useAgentSession(serverUrl, selectedAccountId, parentSessionId, {
    poll: false,
  })
  const ownRun = useRun(serverUrl, selectedAccountId, parentSessionId ? session.data?.session.runId : undefined)
  const hasLiveRun = !!ownRun.data && !TERMINAL_RUN_STATUSES.has(ownRun.data.status)
  const isDrivenByParent = !!parentSessionId && (isAgentStreaming || hasLiveRun)
  const triggerActivityRoute = useMemo(
    () => (session.data?.triggerContext ? getTriggerActivityRoute(session.data.triggerContext) : null),
    [session.data?.triggerContext],
  )
  useEffect(() => {
    if (!partialAssistantText) return
    console.info('[agents/ui] rendering streaming assistant partial', {
      sessionId,
      partialLength: partialAssistantText.length,
    })
  }, [partialAssistantText, sessionId])
  useEffect(() => {
    setTitleDraft(persistedTitle)
    setTitleSaveState('idle')
  }, [loadedSessionId])
  useEffect(() => {
    if (titleSaveState === 'idle') setTitleDraft(persistedTitle)
  }, [persistedTitle, titleSaveState])
  useEffect(() => {
    if (!loadedSessionId) return
    const saveId = titleSaveIdRef.current + 1
    titleSaveIdRef.current = saveId
    const title = titleDraft.trim()
    if (!title || title === persistedTitle) {
      setTitleSaveState('idle')
      return
    }
    const timer = setTimeout(() => {
      setTitleSaveState('saving')
      void updateSession
        .mutateAsync({
          sessionId: loadedSessionId,
          title,
        })
        .then(() => {
          if (titleSaveIdRef.current !== saveId) return
          setTitleSaveState('saved')
          setTimeout(() => {
            if (titleSaveIdRef.current === saveId) setTitleSaveState('idle')
          }, 1800)
        })
        .catch((error) => {
          if (titleSaveIdRef.current !== saveId) return
          setTitleSaveState('error')
          toast.error(error instanceof Error ? error.message : 'Could not rename session')
        })
    }, 600)
    return () => clearTimeout(timer)
  }, [loadedSessionId, persistedTitle, titleDraft])
  useEffect(() => {
    autoScroll.resetToBottom()
  }, [sessionId])
  useEffect(() => {
    const eventId = getSharedEventIdFromHash(window.location.hash)
    if (!eventId || !chatRows.some((row) => row.key === eventId)) return
    requestAnimationFrame(
      () =>
        document.getElementById(`event-${eventId}`)?.scrollIntoView({
          block: 'center',
        }),
    )
  }, [chatRows])
  function openDeleteSessionDialog() {
    if (!session.data) return
    const currentSession = session.data.session
    deleteSessionDialog.open({
      serverUrl,
      selectedAccountId: selectedAccountId ?? null,
      sessionId: currentSession.id,
      sessionTitle: currentSession.title || 'Untitled session',
      onDeleted: () =>
        navigate({
          key: 'agent',
          agentId: currentSession.agentId,
          serverUrl,
        }),
    })
  }
  const doSendAgentMessage = useCallback(
    async (message: AgentSessionDraftMessage | AgentSessionDraftMessage[]) => {
      try {
        let messages = Array.isArray(message) ? message : [message]
        const textLength = messages.map((message) => message.text).join('\n').length
        console.info('[agents/ui] sending session message', {
          serverUrl,
          sessionId,
          textLength,
        })
        // The stamped drafts carry the clientMessageIds the optimistic rows were keyed with, so the
        // server's echo replaces those rows instead of rendering beside them.
        if (selectedAccountId) messages = addOptimisticSessionMessage(serverUrl, selectedAccountId, sessionId, messages)
        const result = await messageSession.mutateAsync({
          sessionId,
          message: messages,
        })
        if (result._ !== 'MessageSessionResponse') throw new Error('Unexpected message response')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not send message')
      }
    },
    [messageSession, selectedAccountId, serverUrl, sessionId],
  )
  async function handleSendMessage(message: AgentSessionDraftMessage) {
    await doSendAgentMessage(message)
  }
  const handleRetrySession = useCallback(() => {
    retrySession.mutate(sessionId, {
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not retry this turn'),
    })
  }, [retrySession, sessionId])
  async function handleStopSession() {
    try {
      const result = await stopSession.mutateAsync(sessionId)
      if (!result.stopped) toast.message('No active agent response to stop')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not stop agent response')
    }
  }
  return (
    <PanelContainer className={stylex.props(styles.s6ebbda8).className || ''}>
      <div className={stylex.props(styles.s26068628).className || ''}>
        <Container className="max-w-4xl gap-4 pt-4 pb-4">
          <AgentHeader
            agent={agent.data?.agent}
            agentId={agentId}
            serverUrl={serverUrl}
            activeTab="sessions"
            sessionsCount={agent.data?.sessions.length}
            triggersCount={triggers.data?.length}
            breadcrumbItems={[
              ...(agentId
                ? [
                    {
                      label: 'Sessions',
                      route: {
                        key: 'agent' as const,
                        agentId,
                        serverUrl,
                      },
                    },
                  ]
                : [
                    {
                      label: 'Sessions',
                    },
                  ]),
              {
                label: titleDraft || persistedTitle,
              },
            ]}
          />
        </Container>
      </div>
      <AgentSubpageHeader
        title={titleDraft}
        placeholder="Untitled session"
        onTitleChange={setTitleDraft}
        saveState={titleSaveState}
        disabled={!session.data || !canWrite}
        backLabel="Back to agent sessions"
        onBack={() => {
          const agentId = session.data?.session.agentId
          navigate(
            agentId
              ? {
                  key: 'agent',
                  agentId,
                  serverUrl,
                }
              : {
                  key: 'agents',
                },
          )
        }}
        actions={
          <>
            {deleteSessionDialog.content}
            {systemPromptDialog.content}
            <SessionModelBadge
              agent={agent.data?.agent}
              agentId={session.data?.session.agentId ?? agentId}
              serverUrl={serverUrl}
              sessionId={sessionId}
              modelOverride={session.data?.session.modelOverride}
              canWrite={canWrite}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Show current system prompt"
              onClick={() =>
                systemPromptDialog.open({
                  prompt: session.data?.systemPromptMarkdown || '',
                  updatedAt: session.data?.session.updatedAt,
                })
              }
              disabled={!session.data}
            >
              <ScrollText className={stylex.props(styles.sca3de968).className || ''} />
            </Button>
            <OptionsDropdown
              align="end"
              menuItems={[
                {
                  key: 'copy-session-url',
                  icon: <Link2 className={stylex.props(styles.sca3de968).className || ''} />,
                  label: 'Copy session URL',
                  disabled: !agentId,
                  onClick: () => {
                    const url = buildAgentSessionUrl(serverUrl, agentId, sessionId)
                    if (!url) return
                    void navigator.clipboard?.writeText(url)
                    toast.success('Session URL copied')
                  },
                },
                ...(canWrite
                  ? [
                      {
                        key: 'delete-session',
                        icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
                        label: 'Delete session',
                        variant: 'destructive' as const,
                        onClick: openDeleteSessionDialog,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        }
      >
        {session.data?.triggerContext ? (
          <div className={stylex.props(styles.sa0238738).className || ''}>
            <TriggerContextPopover
              context={session.data.triggerContext}
              onOpenTrigger={() =>
                navigate({
                  key: 'agent',
                  agentId: session.data!.session.agentId,
                  serverUrl,
                  tab: 'triggers',
                  triggerId: session.data!.triggerContext!.triggerId,
                })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open triggering comment or document update"
              onClick={() => {
                if (triggerActivityRoute) navigate(triggerActivityRoute)
              }}
              disabled={!triggerActivityRoute}
            >
              <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
            </Button>
          </div>
        ) : null}
      </AgentSubpageHeader>
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col pr-1 pl-4">
        {session.isLoading ? <SizableText color="muted">Loading session…</SizableText> : null}
        {session.isError ? (
          <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
            {session.error instanceof Error ? session.error.message : 'Could not load session'}
          </SizableText>
        ) : null}
        {session.data ? (
          <div className="flex min-h-0 flex-1 flex-col">
            {parentSessionId ? (
              <SubSessionHeader
                parentTitle={parentSession.data?.session.title}
                isDriven={isDrivenByParent}
                onOpenParent={() =>
                  navigate({
                    key: 'agent-session',
                    agentId: parentSession.data?.session.agentId,
                    sessionId: parentSessionId,
                    serverUrl,
                  })
                }
              />
            ) : null}
            <SessionSummaryBanner description={session.data.session.description} />
            <div
              ref={autoScroll.containerRef}
              onScroll={autoScroll.handleScroll}
              className="min-h-0 flex-1 overflow-y-auto pr-1"
            >
              <div ref={autoScroll.contentRef} className="flex min-h-full flex-col gap-3 pt-4">
                {!chatRows.length ? <SizableText color="muted">No messages yet.</SizableText> : null}
                {chatRows.map((row) => (
                  <div
                    key={row.key}
                    id={`event-${row.key}`}
                    className="target:ring-primary/40 scroll-mt-24 rounded-lg target:ring-2"
                  >
                    <AgentSessionChatRow
                      row={row}
                      serverUrl={serverUrl}
                      agentId={agentId}
                      accountUid={selectedAccountId}
                      liveActivity={chatRowHasPendingToolCall(row) ? liveState.activity : undefined}
                      onRetry={row.key === retryableRowKey ? handleRetrySession : undefined}
                      retryPending={retrySession.isPending}
                      onOpenSession={(childSessionId, childAgentId) =>
                        navigate({
                          key: 'agent-session',
                          agentId: childAgentId,
                          sessionId: childSessionId,
                          serverUrl,
                        })
                      }
                    />
                  </div>
                ))}
                {partialAssistantText ? <PartialAssistantRow text={partialAssistantText} /> : null}
                {isAgentBusy && !(liveState.activity?.phase === 'tool' && chatRows.some(chatRowHasPendingToolCall)) ? (
                  // Hidden while a pending tool row is showing its own live status, to avoid two spinners.
                  <AgentRunStatusBar startedAt={runStartedAt} activity={liveState.activity} usage={liveState.usage} />
                ) : null}
                {autoScroll.showScrollButton ? (
                  <div className={stylex.props(styles.sb56b7abc).className || ''}>
                    <button
                      onClick={autoScroll.scrollToBottom}
                      className={stylex.props(styles.s87cca2a6).className || ''}
                      aria-label="Scroll to latest message"
                    >
                      <ArrowDown className={stylex.props(styles.sca3de968).className || ''} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <SessionRunCard
              serverUrl={serverUrl}
              accountUid={selectedAccountId}
              sessionId={sessionId}
              sessionPlan={session.data.session.plan}
              frozenRunIds={frozenRuns}
              readOnly={!canWrite}
              onOpenSession={(childSessionId, childAgentId) =>
                navigate({
                  key: 'agent-session',
                  agentId: childAgentId,
                  sessionId: childSessionId,
                  serverUrl,
                })
              }
            />
            <AgentRichMessageComposer
              isBusy={isAgentBusy}
              isStreaming={isAgentStreaming}
              disabledMessage={
                !canChat
                  ? 'You have read-only access to this agent.'
                  : isDrivenByParent
                    ? SUB_SESSION_DRIVEN_MESSAGE
                    : undefined
              }
              stopPending={stopSession.isPending}
              serverUrl={serverUrl}
              accountId={selectedAccountId ?? null}
              sessionId={sessionId}
              agentTools={agent.data?.agent.definition.tools}
              agentToolsLoading={agent.isLoading}
              canInvokeTools={canWrite}
              onSend={(message) => void handleSendMessage(message)}
              onStop={() => void handleStopSession()}
            />
          </div>
        ) : null}
      </div>
    </PanelContainer>
  )
}
function SystemPromptDialog({
  input,
}: {
  input: {
    prompt: string
    updatedAt?: number
  }
  onClose: () => void
}) {
  return (
    <div className="flex max-w-[min(92vw,42rem)] min-w-[min(92vw,42rem)] flex-col gap-4">
      <div>
        <DialogTitle>Current system prompt</DialogTitle>
        <DialogDescription>
          This is the markdown prompt that will be sent if this session continues now
          {input.updatedAt ? ` (session updated ${new Date(input.updatedAt).toLocaleString()})` : ''}.
        </DialogDescription>
      </div>
      <pre className="bg-muted/60 max-h-[70vh] overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
        {input.prompt || 'No system prompt configured.'}
      </pre>
    </div>
  )
}
function DeleteAgentSessionDialog({
  input,
  onClose,
}: {
  input: {
    serverUrl: string
    selectedAccountId: string | null
    sessionId: string
    sessionTitle: string
    onDeleted: () => void
  }
  onClose: () => void
}) {
  const deleteSession = useDeleteAgentSession(input.serverUrl, input.selectedAccountId)
  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    try {
      const result = await deleteSession.mutateAsync(input.sessionId)
      if (result._ !== 'DeleteSessionResponse') throw new Error('Unexpected delete response')
      toast.success('Session deleted')
      onClose()
      input.onDeleted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete session')
    }
  }
  return (
    <div className={stylex.props(styles.s2b00eca2).className || ''}>
      <AlertDialogTitle>Delete session?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete “{input.sessionTitle}” and its messages from the agent server. This action cannot
        be undone.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button
            variant="destructive"
            onClick={(event) => void handleDelete(event)}
            disabled={deleteSession.isLoading}
          >
            <Trash2 className={stylex.props(styles.sca3de968).className || ''} />
            Delete session
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  )
}
const PartialAssistantRow = React.memo(function PartialAssistantRow({text}: {text: string}) {
  const parts = useMemo<ChatMessagePart[]>(
    () => [
      {
        type: 'text',
        text,
      },
    ],
    [text],
  )
  return <AssistantMessageParts parts={parts} isStreaming />
})
const AgentSessionChatRow = React.memo(function AgentSessionChatRow({
  row,
  serverUrl,
  agentId,
  accountUid,
  liveActivity,
  onRetry,
  retryPending,
  onOpenSession,
}: {
  row: AgentSessionChatRowData
  serverUrl: string
  agentId?: string
  accountUid?: string | null
  liveActivity?: AgentRunActivity
  /** Set only on a trailing error row, which is the only place a retry is offered. */
  onRetry?: () => void
  retryPending?: boolean
  onOpenSession?: (sessionId: string, agentId?: string) => void
}) {
  if (row.kind === 'message') {
    if (row.triggerContext) {
      // First message of a triggered session: render the human prompt (if any) and a friendly
      // trigger card instead of the raw <trigger_context> text that is sent to the model.
      return (
        <div className={stylex.props(styles.s25987914).className || ''}>
          {row.message.content?.trim() || row.message.blocks?.length ? (
            <ChatMessageBubble
              message={row.message}
              liveActivity={liveActivity}
              serverUrl={serverUrl}
              accountUid={accountUid}
              agentId={agentId}
            />
          ) : null}
          <TriggerContextView
            context={row.triggerContext}
            instructions={row.triggerInstructions}
            serverUrl={serverUrl}
            agentId={agentId}
          />
        </div>
      )
    }
    return (
      <ChatMessageBubble
        message={row.message}
        liveActivity={liveActivity}
        serverUrl={serverUrl}
        accountUid={accountUid}
        agentId={agentId}
      />
    )
  }
  if (row.kind === 'error') {
    return <AgentErrorRow message={row.message} onRetry={onRetry} retryPending={retryPending} />
  }
  if (row.kind === 'run-record') {
    // The pinned card's afterlife: the same card, frozen at the moment the run completed.
    return (
      <RunRecordCard
        serverUrl={serverUrl}
        accountUid={accountUid}
        runId={row.run.id}
        plan={row.plan}
        onOpenSession={onOpenSession}
      />
    )
  }
  return (
    <pre className={stylex.props(styles.s49ebd2b1).className || ''}>{JSON.stringify(row.event.event, null, 2)}</pre>
  )
})
export default function AgentSessionRoutePage() {
  const route = useNavRoute()
  // Keep every account this account's agents can author as synced locally, so they are
  // immediately mentionable and openable elsewhere in the app.
  useAgentAccountsSync()
  if (route.key !== 'agent-session') return null
  return <AgentSessionPage sessionId={route.sessionId} routeServerUrl={route.serverUrl} routeAgentId={route.agentId} />
}
