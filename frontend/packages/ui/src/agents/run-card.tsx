import * as stylex from '@stylexjs/stylex'
import {type RunInfo, type RunJournalEntryInfo, type RunPlan, type RunStatus} from './client'
import {ToolCallLine} from './message-rendering'
import {ParkedRunActions} from './run-parked-actions'
import {
  RunWorkHierarchy,
  PlanStepRow,
  RunErrorChip,
  RunTimerProgress,
  descendantsOf,
  isTerminalRun,
  journalToolParts,
  runTitle,
  useRunTreeView,
  type PlanSettle,
} from './run-work'
import {formatElapsed, formatTokenCount} from './agent-run-status'
import {useCancelRun, useRun, useSessionRuns, type AgentRunTreeLiveState} from './models'
import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {ChevronDown, ChevronRight, Info, Loader2} from 'lucide-react'
import React, {useEffect, useMemo, useRef, useState} from 'react'

/**
 * What a parked run is actually waiting for, in words — or nothing, when the card's own title says
 * enough.
 *
 * "Waiting" alone is the least useful thing a card can say about a run that may sit for hours: the
 * question a person has is always WHY, and whether it is on them. Each wait reason answers that —
 * a budget pause and an approval need a human, a sleep does not. A run parked on its children just
 * keeps its title: the child rows below already show what is running, and a "waiting on N" line
 * would be one more spinner saying the same thing.
 */
const styles_6 = stylex.create({
  s63f7e9c: {
    padding: 'calc(0.25rem * 2.5)',
  },
})
const styles_5 = stylex.create({
  s948be48c: {
    flex: 'none',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sc5cefc73: {
    paddingInline: 'calc(0.25rem * 1.5)',
  },
  sc5dd1033: {
    paddingBlock: 'calc(0.25rem * 0.5)',
  },
  s55426dfb: {
    fontSize: '10px',
  },
  s37120a61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
  },
  s597c48d: {
    display: 'block',
  },
  scdbaf625: {
    width: '100%',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  sc5cef8b2: {
    paddingInline: 'calc(0.25rem * 0.5)',
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  sf28e7398: {
    backgroundColor: 'var(--card)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  s335490: {
    marginInline: 'calc(0.25rem * 2)',
  },
  s3301f9: {
    marginBottom: 'calc(0.25rem * 1)',
  },
  s1aa15: {
    padding: 'calc(0.25rem * 2)',
  },
  s3301fa: {
    marginBottom: 'calc(0.25rem * 2)',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
})
const styles_4 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s9926ee50: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--background) 70%, transparent)',
      },
    },
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  sc43c4bb3: {
    backgroundColor: 'color-mix(in oklab, var(--background) 60%, transparent)',
  },
  sc1af6c99: {
    padding: 'calc(0.25rem * 0.75)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s79cfa1b2: {
    ':focus-visible': {
      opacity: '100%',
    },
  },
})
const styles_3 = stylex.create({
  sc8799f62: {
    color: 'var(--muted-foreground)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    fontSize: '11px',
  },
  s4dcd84ff: {
    fontSize: '10px',
    color: 'var(--tone-amber-700)',
  },
  s12cef23f: {
    color: 'var(--muted-foreground)',
    fontSize: '11px',
  },
  sf909c1d5: {
    backgroundColor: 'var(--primary)',
    height: '100%',
    borderRadius: 'calc(infinity * 1px)',
    transitionProperty: 'width',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: '300ms',
  },
  s86f9a095: {
    maxHeight: '85vh',
    width: 'min(44rem, calc(100vw - 2rem))',
  },
  s5a8a4e5d: {
    color: 'var(--muted-foreground)',
    marginLeft: 'auto',
    fontSize: '10px',
  },
  sba564dce: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    alignSelf: 'flex-start',
    fontSize: '11px',
  },
  s95470d06: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    marginTop: 'calc(var(--spacing) * 1)',
    maxHeight: 'calc(var(--spacing) * 40)',
    overflowY: 'auto',
    borderRadius: '0.25rem',
    padding: 'calc(var(--spacing) * 1.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    lineHeight: 'calc(var(--spacing) * 4)',
  },
  sce02dbff: {
    backgroundColor: 'color-mix(in oklab, var(--background) 80%, transparent)',
    marginBlock: 'calc(var(--spacing) * 0.5)',
    maxHeight: 'calc(var(--spacing) * 40)',
    overflow: 'auto',
    borderRadius: '0.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 1.5)',
    whiteSpace: 'pre-wrap',
  },
  s12ce7de0: {
    color: 'var(--muted-foreground)',
    fontSize: '10px',
  },
  sb7d5d124: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    maxHeight: 'calc(var(--spacing) * 64)',
    overflow: 'auto',
    borderRadius: '0.25rem',
    padding: 'calc(var(--spacing) * 1.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    lineHeight: 'calc(var(--spacing) * 4)',
    whiteSpace: 'pre',
  },
  sba2034f1: {
    color: 'var(--muted-foreground)',
    flex: 'none',
    fontSize: '10px',
    fontVariantNumeric: '   tabular-nums ',
  },
})
const styles_2 = stylex.create({
  sb7676096: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
  s19dfa8ea: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
  },
  s3a419cb2: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
    overflowY: 'auto',
  },
  s9c9141f4: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 0.5)',
  },
})
const styles = stylex.create({
  s77d4c9c4: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
    marginRight: 'calc(0.25rem * 6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 2.5)',
  },
  s3b87a119: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    flex: 'none',
    animation: 'spin 1s linear infinite',
  },
  s255e9b3e: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sa0238737: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s948be48c: {
    flex: 'none',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s6bbccae4: {
    backgroundColor: 'var(--muted)',
    height: 'calc(0.25rem * 1)',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'calc(infinity * 1px)',
  },
  s438f8b66: {
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 1)',
  },
  sd266775: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 1)',
  },
  se6c9d13: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
    flex: 'none',
  },
  s54eab7db: {
    opacity: '70%',
  },
  s257f847e: {
    marginTop: 'calc(0.25rem * 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 0.5)',
  },
})
function parkedLabel(run: RunInfo): string | undefined {
  const wait = run.wait
  if (wait?.reason === 'budget-pause') return wait.label || 'Paused: out of time budget'
  if (wait?.reason === 'event') {
    const until = wait.wakeAt ? ` (until ${formatWakeTime(wait.wakeAt)})` : ''
    return `${wait.label || 'Waiting for something to happen'}${until}`
  }
  if (wait?.reason === 'timer' && wait.wakeAt) return `Sleeping until ${formatWakeTime(wait.wakeAt)}`
  return undefined
}

/**
 * The card's display name, preferring names the model authored over the user's raw message.
 *
 * A user turn's run is titled by whatever the user typed, which reads poorly as a heading
 * ("again, wait 3 minutes and run again"). The plan title names the work when the model published
 * one. A planless turn whose whole work is one delegated child takes that child's briefing title —
 * the model writes those too. Everything else (delegate runs, planned turns) already carries a
 * deliberate title of its own, and a plan's steps name the work without renaming the card.
 */
function cardTitle(run: RunInfo, plan: RunPlan | undefined, childRuns: RunInfo[]): string {
  if (plan?.title) return plan.title
  const isUserTurn = run.origin === 'user' && !run.parentRunId
  if (isUserTurn && !plan?.steps.length && childRuns.length === 1 && childRuns[0]!.title) {
    return childRuns[0]!.title
  }
  return runTitle(run)
}

/** A wake time as a person reads it: a clock time today, a date beyond that. */
function formatWakeTime(wakeAt: number): string {
  const date = new Date(wakeAt)
  const sameDay = new Date().toDateString() === date.toDateString()
  return sameDay
    ? date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    : date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
}

/** How a run's status reads in the header pill. */
const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  queued: 'Queued',
  claimed: 'Starting',
  running: 'Running',
  waiting: 'Waiting',
  succeeded: 'Finished',
  failed: 'Failed',
  canceled: 'Canceled',
}
/**
 * The live progress card pinned above the composer.
 *
 * Shows only while the session's newest run is still going: once it finishes, the record of it lives
 * in the transcript (see {@link RunRecordCard}) and the pinned slot clears so the next turn — or a
 * plain chat reply — is not shadowed by a stale summary. With no live run it falls back to the
 * session's `update_plan` todo list, the same step list fed from a different source.
 */
export function SessionRunCard({
  serverUrl,
  accountUid,
  sessionId,
  sessionPlan,
  compact,
  frozenRunIds,
  onOpenSession,
  readOnly = false,
}: {
  serverUrl: string
  accountUid: string | null | undefined
  sessionId: string
  /** `SessionInfo.plan`, rendered as a todo list when no run is live. */
  sessionPlan?: RunPlan
  /** Sidebar sizing: tighter rows, no footer. */
  compact?: boolean
  /**
   * Runs whose card the transcript already holds. A run whose story settled mid-flight is told in
   * the scroll, at the moment it settled; pinning the same card here too would show one story twice,
   * and this copy would be the one that has stopped changing.
   */
  frozenRunIds?: ReadonlySet<string>
  /** Opens the transcript of an agent child run. */
  onOpenSession?: (sessionId: string, agentId?: string) => void
  /** Hides run controls for reader collaborators while preserving live progress. */
  readOnly?: boolean
}) {
  const runs = useSessionRuns(serverUrl, accountUid, sessionId)
  const cancelRun = useCancelRun(serverUrl, accountUid)
  const seedRoot = runs.data?.[0]
  // Gate on the query's view of the status: it lags by at most one poll, and gating on the merged
  // status instead would need the very socket this decides whether to open.
  const seedIsLive = !!seedRoot && !isTerminalRun(seedRoot.status)
  const {runsById, liveState} = useRunTreeView(
    serverUrl,
    accountUid,
    seedIsLive ? seedRoot.rootRunId : undefined,
    seedRoot,
    seedIsLive,
  )
  const root = seedRoot ? runsById[seedRoot.id] ?? seedRoot : undefined
  const children = useMemo(() => (root ? descendantsOf(runsById, root.id) : []), [runsById, root?.id])

  // A plain turn — one model streaming, maybe a few tool calls — is not an orchestration: it
  // renders in the scroll log like it always has. The pinned panel earns its place only when
  // there is a process to supervise: a workflow, spawned children, a parked wait, or a plan.
  const isOrchestration =
    !!root &&
    (root.kind === 'workflow' || children.length > 0 || root.status === 'waiting' || (root.plan?.steps.length ?? 0) > 0)

  // Frozen mid-flight: the transcript is already telling this run's story at the place it settled,
  // so the pinned slot clears early rather than holding a finished summary over the composer.
  if (root && !isTerminalRun(root.status) && frozenRunIds?.has(root.id)) return null
  if (root && isOrchestration && !isTerminalRun(root.status)) {
    return (
      <RunCardShell compact={compact} column>
        <RunCardBody
          serverUrl={serverUrl}
          accountUid={accountUid}
          run={root}
          childRuns={children}
          liveState={liveState}
          plan={root.plan ?? sessionPlan}
          compact={compact}
          onOpenSession={onOpenSession}
          onCancelRun={(runId) => cancelRun.mutate(runId)}
          cancelPending={cancelRun.isPending}
          readOnly={readOnly}
        />
      </RunCardShell>
    )
  }

  // Todo-list fallback. A plan with nothing left to do is just noise once its run is over.
  if (!sessionPlan?.steps.length) return null
  const settled = !!root
  if (settled && sessionPlan.steps.every((step) => step.status === 'done' || step.status === 'skipped')) {
    return null
  }
  return (
    <RunCardShell compact={compact}>
      <RunPlanSteps plan={sessionPlan} compact={compact} settle={settled ? 'idle' : 'live'} />
    </RunCardShell>
  )
}

/**
 * The durable record of one run, rendered inside its `sub_session` / `run_workflow` chat bubble.
 *
 * The pinned card is deliberately transient, so this is where a finished workflow keeps its step
 * list, children, and activity log — in the transcript, at the point in the conversation where it
 * happened. Mounted only while its bubble is expanded, which is what keeps its socket and queries
 * off until someone actually looks.
 */
export function RunRecordCard({
  serverUrl,
  accountUid,
  runId,
  plan,
  onOpenSession,
}: {
  serverUrl: string
  accountUid: string | null | undefined
  runId: string
  /**
   * The checklist to render when the run has none of its own — a model-driven run keeps its plan on
   * the session, and the frozen card would otherwise show a story with its steps missing.
   */
  plan?: RunPlan
  onOpenSession?: (sessionId: string, agentId?: string) => void
}) {
  const run = useRun(serverUrl, accountUid, runId)
  const cancelRun = useCancelRun(serverUrl, accountUid)
  const seed = run.data ?? undefined
  const {runsById, liveState} = useRunTreeView(serverUrl, accountUid, seed?.rootRunId, seed, true)
  const focus = seed ? runsById[seed.id] ?? seed : undefined
  const children = useMemo(() => (focus ? descendantsOf(runsById, focus.id) : []), [runsById, focus?.id])
  if (!focus) {
    return run.isLoading ? <div className={stylex.props(styles_3.sc8799f62).className || ''}>Loading run…</div> : null
  }
  return (
    // Same shell as the pinned card: this IS that card, frozen where the run finished.
    <div className={stylex.props(styles.s77d4c9c4).className || ''}>
      <RunCardBody
        serverUrl={serverUrl}
        accountUid={accountUid}
        run={focus}
        childRuns={children}
        liveState={liveState}
        plan={focus.plan ?? plan}
        onOpenSession={onOpenSession}
        onCancelRun={(id) => cancelRun.mutate(id)}
        cancelPending={cancelRun.isPending}
        transcript
      />
    </div>
  )
}

/**
 * Everything a run has to say about itself: status, progress, steps, children, log, cost.
 *
 * Shared by the pinned card and the transcript record so a run looks the same wherever it is read.
 */
function RunCardBody({
  serverUrl,
  accountUid,
  run,
  childRuns,
  liveState,
  plan,
  compact,
  onOpenSession,
  onCancelRun,
  cancelPending,
  readOnly = false,
  transcript = false,
}: {
  /** Agent server this run lives on, so its tool rows can link into the agent's own pages. */
  serverUrl: string
  accountUid: string | null | undefined
  run: RunInfo
  childRuns: RunInfo[]
  liveState: AgentRunTreeLiveState
  plan?: RunPlan
  compact?: boolean
  onOpenSession?: (sessionId: string, agentId?: string) => void
  onCancelRun: (runId: string) => void
  cancelPending: boolean
  readOnly?: boolean
  /** Completed transcript record: checklist first, implementation details collapsed. */
  transcript?: boolean
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isTerminal = isTerminalRun(run.status)
  const isParked = run.status === 'waiting'
  const progress = liveState.progress[run.id]
  const usageTotal = (run.usage?.total ?? 0) + (run.usage?.children?.total ?? 0)
  const planIsComplete =
    !!plan?.steps.length &&
    plan.steps.every((step) => step.status === 'done' || step.status === 'failed' || step.status === 'skipped')
  const isCompletedTranscript =
    transcript &&
    (run.status === 'succeeded' ||
      (planIsComplete && run.status !== 'failed' && run.status !== 'canceled' && !isParked))
  const showRunControls = !isTerminal && !isCompletedTranscript && !readOnly
  const issueCount = childRuns.filter((child) => child.status === 'failed' || child.status === 'canceled').length
  // The journaled call this run's own terminal error points at, for its error inspector.
  const rootErrorToolPart = useMemo(() => {
    const callSeq = run.error?.callSeq
    if (typeof callSeq !== 'number') return undefined
    return journalToolParts(liveState.journal.filter((entry) => entry.runId === run.id)).find(
      (part) => part.id === `wf-${run.id}:${callSeq}`,
    )
  }, [liveState.journal, run.id, run.error?.callSeq])
  useEffect(() => {
    if (isTerminal) setConfirmingCancel(false)
  }, [isTerminal])
  const headerTitle = (isParked ? parkedLabel(run) : undefined) ?? cardTitle(run, plan, childRuns)
  return (
    <>
      <div
        className={
          stylex.props(styles_4.s2ffff9, styles_4.s3f58665f, styles_4.sc6ed1702, styles_4.s5d936fb).className || ''
        }
      >
        {showRunControls ? <Loader2 className={stylex.props(styles.s3b87a119).className || ''} /> : null}
        <span className={stylex.props(styles_2.sb7676096).className || ''} title={headerTitle}>
          {headerTitle}
        </span>
        {/* Technical details live behind the same info bubble every tool row uses, live or done —
            and like those, the bubble shows itself only while the row is hovered. */}
        <span className={stylex.props(styles.s255e9b3e).className || ''}>
          {isCompletedTranscript && issueCount ? (
            <span className={stylex.props(styles_3.s4dcd84ff).className || ''}>
              {issueCount} recovered issue{issueCount === 1 ? '' : 's'}
            </span>
          ) : null}
          <button
            type="button"
            title="Run details"
            aria-label="Run details"
            onClick={() => setDetailsOpen(true)}
            className={
              stylex.props(
                styles_4.s9926ee50,
                styles_4.sf2718385,
                styles_4.sae6a97a5,
                styles_4.sc43c4bb3,
                styles_4.sc1af6c99,
                styles_4.s775755af,
                styles_4.sad8c742c,
                styles_4.s765a26ee,
                styles_4.s83442393,
                styles_4.s79cfa1b2,
              ).className || ''
            }
          >
            <Info className={stylex.props(styles.sca3de967).className || ''} />
          </button>
        </span>
        {!showRunControls ? null : confirmingCancel ? (
          <span className={stylex.props(styles.sa0238737).className || ''}>
            <Button
              size="sm"
              variant="destructive"
              disabled={cancelPending}
              onClick={() => {
                onCancelRun(run.id)
                setConfirmingCancel(false)
              }}
            >
              Cancel run
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingCancel(false)}>
              Keep
            </Button>
          </span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className={stylex.props(styles.s948be48c).className || ''}
            onClick={() => setConfirmingCancel(true)}
          >
            Cancel
          </Button>
        )}
      </div>

      {run.error ? (
        <div className={stylex.props(styles_2.s19dfa8ea).className || ''}>
          <RunErrorChip
            run={run}
            error={run.error}
            errorToolPart={rootErrorToolPart}
            renderToolPart={(part) => (
              <ToolCallLine item={part} serverUrl={serverUrl} accountUid={accountUid} agentId={run.agentId} />
            )}
          />
        </div>
      ) : null}

      {/* The run has stopped and is asking; the answer belongs where the question is. */}
      {!readOnly ? <ParkedRunActions run={run} serverUrl={serverUrl} accountUid={accountUid} /> : null}

      <RunTimerProgress run={run} journal={liveState.journal} wide />

      {progress && !isTerminal ? (
        <div className={stylex.props(styles.sfbc6e28d).className || ''}>
          {progress.label ? (
            <span className={stylex.props(styles_3.s12cef23f).className || ''}>{progress.label}</span>
          ) : null}
          {progress.fraction !== undefined ? (
            <div className={stylex.props(styles.s6bbccae4).className || ''}>
              <div
                className={stylex.props(styles_3.sf909c1d5).className || ''}
                style={{
                  width: `${Math.min(100, Math.max(0, progress.fraction * 100))}%`,
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Live: the work itself stays inline — that is the card's purpose. Finished record: the
          checklist alone tells the story. Everything technical (hierarchy, code, activity) lives
          in the details dialog below in both states. */}
      {isCompletedTranscript ? (
        plan?.steps.length ? (
          <RunPlanSteps plan={plan} compact={compact} settle="run-finished" />
        ) : null
      ) : (
        <RunWorkHierarchy
          run={run}
          childRuns={childRuns}
          plan={plan}
          journal={liveState.journal}
          liveState={liveState}
          compact={compact}
          onOpenSession={onOpenSession}
          onCancelRun={readOnly ? undefined : onCancelRun}
          cancelPending={cancelPending}
          renderToolPart={(part) => (
            <ToolCallLine item={part} serverUrl={serverUrl} accountUid={accountUid} agentId={run.agentId} />
          )}
        />
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={stylex.props(styles_3.s86f9a095).className || ''}>
          <DialogHeader>
            <DialogTitle>Run details</DialogTitle>
            <DialogDescription>{headerTitle}</DialogDescription>
          </DialogHeader>
          <div className={stylex.props(styles_2.s3a419cb2).className || ''}>
            <RunWorkHierarchy
              run={run}
              childRuns={childRuns}
              journal={liveState.journal}
              liveState={liveState}
              compact={compact}
              onOpenSession={onOpenSession}
              renderToolPart={(part) => (
                <ToolCallLine item={part} serverUrl={serverUrl} accountUid={accountUid} agentId={run.agentId} />
              )}
            />
            <RunSourceDrawer runs={[run, ...childRuns]} />
            <RunActivityDrawer journal={liveState.journal} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Status and elapsed time anchor the card's bottom-left; cost keeps the opposite corner. */}
      <div className={stylex.props(styles.s438f8b66).className || ''}>
        <span
          className={
            stylex.props(
              styles_5.s948be48c,
              styles_5.s775755af,
              styles_5.sad8c742c,
              styles_5.sc5cefc73,
              styles_5.sc5dd1033,
              styles_5.s55426dfb,
            ).className || ''
          }
        >
          {/* A budget pause is the one wait a person has to end, so it does not hide behind "Waiting". */}
          {isCompletedTranscript && !isTerminal
            ? 'Plan complete'
            : run.wait?.reason === 'budget-pause'
              ? 'Paused'
              : RUN_STATUS_LABELS[run.status]}
        </span>
        <RunElapsed run={run} />
        {!compact && usageTotal > 0 ? (
          <span className={stylex.props(styles_3.s5a8a4e5d).className || ''}>
            {formatTokenCount(usageTotal)} tokens
          </span>
        ) : null}
      </div>
    </>
  )
}

/** How many journal lines the drawer keeps on screen; older ones scroll out of existence. */
const MAX_ACTIVITY_LINES = 100

/** One rendered journal line: what happened, how loudly to say it, and the full entry behind it. */
type ActivityLine = {
  key: string
  text: string
  tone?: 'error' | 'warn'
  entry: RunJournalEntryInfo
}

/**
 * Renders the journal entries a workflow writes as it runs. Kinds not listed here (`timer`, `fired`,
 * `now`, `plan`, and successful `result`s) are replay bookkeeping, not activity, and would drown the
 * log.
 */
function journalEntryLine(entry: RunJournalEntryInfo): ActivityLine | null {
  const payload = entry.entry as {
    kind?: string
    level?: string
    message?: string
    label?: string
    phase?: string
    ok?: boolean
    op?: string
    tool?: string
    status?: string
    error?: {
      code?: string
      message?: string
    }
  }
  const key = `${entry.runId}:${entry.seq}`
  if (payload.kind === 'log') {
    return {
      key,
      text: `${payload.level || 'info'} · ${payload.message ?? ''}`,
      tone: payload.level === 'error' ? 'error' : payload.level === 'warn' ? 'warn' : undefined,
      entry,
    }
  }
  if (payload.kind === 'step') {
    const phase = payload.phase === 'start' ? 'start' : payload.ok === false ? 'failed' : 'done'
    return {
      key,
      text: `step: ${payload.label ?? payload.phase ?? ''} (${phase})`,
      tone: phase === 'failed' ? 'error' : undefined,
      entry,
    }
  }
  if (payload.kind === 'call') {
    if (payload.op === 'agent')
      return {
        key,
        text: 'agent: sub-session',
        entry,
      }
    return {
      key,
      text: `tool: ${payload.tool ?? 'unknown'}`,
      entry,
    }
  }
  // Successful results are replay bookkeeping, but a failed result is the one place the error
  // message lives — surface it where someone reading the log is looking for it.
  if (payload.kind === 'result' && payload.status === 'failed') {
    return {
      key,
      text: `failed: ${payload.error?.message ?? payload.error?.code ?? 'action failed'}`,
      tone: 'error',
      entry,
    }
  }
  return null
}

/**
 * Collapsible log of what the run has actually been doing.
 *
 * Collapsed by default: a fan-out of a dozen children writes hundreds of lines, and the card's job
 * above this is to stay glanceable. Entries span every run in the tree, oldest first, so the newest
 * line sits at the bottom where the drawer is already scrolled.
 */
function RunActivityDrawer({journal}: {journal: RunJournalEntryInfo[]}) {
  const [open, setOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lines = useMemo(() => {
    const ordered = [...journal].sort((a, b) => a.createdAt - b.createdAt || a.seq - b.seq)
    return ordered
      .map(journalEntryLine)
      .filter((line): line is ActivityLine => line !== null)
      .slice(-MAX_ACTIVITY_LINES)
  }, [journal])

  // Follow the tail, the way a terminal does.
  useEffect(() => {
    if (!open || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [open, lines.length])
  if (!lines.length) return null
  return (
    <div className={stylex.props(styles.sd266775).className || ''}>
      <button
        type="button"
        aria-expanded={open}
        className={stylex.props(styles_3.sba564dce).className || ''}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <ChevronDown className={stylex.props(styles.se6c9d13).className || ''} />
        ) : (
          <ChevronRight className={stylex.props(styles.se6c9d13).className || ''} />
        )}
        Activity
        <span className={stylex.props(styles.s54eab7db).className || ''}>{lines.length}</span>
      </button>
      {open ? (
        <div ref={scrollRef} aria-label="Run activity" className={stylex.props(styles_3.s95470d06).className || ''}>
          {lines.map((line) => (
            <ActivityLineRow key={line.key} line={line} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * One journal line; clicking it unfolds the entry's full payload. What the log line compresses —
 * call inputs, result values, error details — is one click away instead of gone.
 */
function ActivityLineRow({line}: {line: ActivityLine}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        title={open ? 'Hide full entry' : 'Show full entry'}
        className={
          stylex.props(
            styles_5.s37120a61,
            styles_5.s597c48d,
            styles_5.scdbaf625,
            styles_5.s6e724d66,
            styles_5.s529492ad,
            styles_5.sc5cef8b2,
            styles_5.sbf63b0a7,
          ).className || ''
        }
        onClick={() => setOpen((current) => !current)}
      >
        {line.text}
      </button>
      {open ? (
        <pre className={stylex.props(styles_3.sce02dbff).className || ''}>
          {JSON.stringify(line.entry.entry, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}

/**
 * The code a workflow actually runs, verbatim.
 *
 * Agents write these modules; reviewing the run means reading them. Collapsed by default beside the
 * Activity drawer; one section per workflow run in the tree (there is usually exactly one).
 */
function RunSourceDrawer({runs}: {runs: RunInfo[]}) {
  const [open, setOpen] = useState(false)
  const sources = runs.filter((run) => run.kind === 'workflow' && run.sourceText)
  if (!sources.length) return null
  return (
    <div className={stylex.props(styles.sd266775).className || ''}>
      <button
        type="button"
        aria-expanded={open}
        className={stylex.props(styles_3.sba564dce).className || ''}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <ChevronDown className={stylex.props(styles.se6c9d13).className || ''} />
        ) : (
          <ChevronRight className={stylex.props(styles.se6c9d13).className || ''} />
        )}
        Code
      </button>
      {open
        ? sources.map((run) => (
            <div key={run.id} className={stylex.props(styles.s257f847e).className || ''}>
              {sources.length > 1 ? (
                <span className={stylex.props(styles_3.s12ce7de0).className || ''}>{runTitle(run)}</span>
              ) : null}
              <pre
                aria-label={`Workflow source: ${runTitle(run)}`}
                className={stylex.props(styles_3.sb7d5d124).className || ''}
              >
                {run.sourceText}
              </pre>
            </div>
          ))
        : null}
    </div>
  )
}

/** The pinned frame: full composer width, never scrolls away with the transcript. */
function RunCardShell({children, compact, column}: {children: React.ReactNode; compact?: boolean; column?: boolean}) {
  return (
    <div
      className={
        (stylex.props(
          styles_5.s1a01a0ed,
          styles_5.sf28e7398,
          styles_5.s2ffff9,
          styles_5.s948be48c,
          styles_5.s5d936fb,
          styles_5.sf799889b,
          styles_5.sad8c742c,
        ).className || '') +
        ' ' +
        (compact
          ? stylex.props(styles_5.s335490, styles_5.s3301f9, styles_5.s1aa15).className || ''
          : (stylex.props(styles_5.s3301fa).className || '') +
            ' ' +
            (stylex.props(styles_6.s63f7e9c).className || '')) +
        ' ' +
        (column ? stylex.props(styles_5.s67e351ac).className || '' : stylex.props(styles_5.sc6ed1702).className || '')
      }
    >
      {children}
    </div>
  )
}

/** Live elapsed timer for a run, frozen once it finishes. */
function RunElapsed({run}: {run: RunInfo}) {
  const [now, setNow] = useState(() => Date.now())
  const isTerminal = isTerminalRun(run.status)
  useEffect(() => {
    if (isTerminal) return
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isTerminal, run.id])
  const startedAt = run.startedAt ?? run.createdAt
  const endedAt = isTerminal ? run.finishedAt ?? run.updatedAt : now
  return (
    <span className={stylex.props(styles_3.sba2034f1).className || ''} aria-label="Elapsed time">
      {formatElapsed(Math.max(0, endedAt - startedAt))}
    </span>
  )
}

/**
 * The step list, fed by a run's plan or by the session's `update_plan` todo list. Steps only — the
 * plan's title is the card header's job, and repeating it here (the old all-caps line) showed the
 * same words twice in one card.
 */
function RunPlanSteps({plan, compact, settle = 'live'}: {plan: RunPlan; compact?: boolean; settle?: PlanSettle}) {
  return (
    <div className={stylex.props(styles_2.s9c9141f4).className || ''}>
      {plan.steps.map((step) => (
        <PlanStepRow key={step.id} step={step} compact={compact} settle={settle} />
      ))}
    </div>
  )
}
