import * as stylex from '@stylexjs/stylex'
import React, {useRef, useState} from 'react'
import {Wrench} from 'lucide-react'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {getSeedTool, type JsonSchema} from '@seed-hypermedia/agents-protocol'
import {useAgentServerHealth, useInvokeSessionTool} from './models'
import {
  DEFAULT_AGENT_TOOLS,
  getToolAvailability,
  normalizeStoredAgentTools,
  type AgentServerWebCapabilities,
} from './agent-tools'

/**
 * The user's side of the symmetric log: run read, write, or any callable tool yourself, in this
 * thread. The call and its result land on the shared session log as actor-'user' events the agent
 * reads on its next turn — same verbs, same log, no side channel.
 */
const styles_3 = stylex.create({
  sabad945e: {
    minHeight: 'calc(0.25rem * 20)',
  },
  sabad943f: {
    minHeight: 'calc(0.25rem * 10)',
  },
  sabad9462: {
    minHeight: 'calc(0.25rem * 24)',
  },
})
const styles_2 = stylex.create({
  s3731c254: {
    '@media ((max-width: 639px))': {
      width: 'calc(var(--spacing) * 10)',
      height: 'calc(var(--spacing) * 10)',
    },
  },
  s3471db8d: {
    borderColor: 'color-mix(in oklab, var(--primary) 30%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    color: 'var(--primary)',
    marginBottom: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    fontSize: '11px',
  },
  s3b50288c: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--accent)',
      },
    },
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s5c1b099e: {
    color: 'var(--muted-foreground)',
    minWidth: 'calc(var(--spacing) * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
  },
  sadb58fa1: {
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
  },
})
const styles = stylex.create({
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sf8684703: {
    width: 'calc(0.25rem * 80)',
    padding: 'calc(0.25rem * 2)',
  },
  s25987553: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 0.5)',
  },
  s374a31e2: {
    paddingInline: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 1)',
    paddingBottom: 'calc(0.25rem * 1.5)',
  },
  s6321fdc7: {
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1.5)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s21672182: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 1)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function UserToolPalette({
  serverUrl,
  accountId,
  sessionId,
  agentTools,
  agentToolsLoading,
  disabled,
  onStartSession,
  onSessionStarted,
}: {
  serverUrl: string
  accountId: string | null
  /** Absent for a draft composer: tool calls land on a session's log, so no session yet means the
   * first run creates one via {@link onStartSession} — or, without that, a disabled palette. */
  sessionId?: string
  /** The agent definition's tools array; undefined means the default grant set. */
  agentTools?: string[]
  /** True while the agent definition is still loading — the callable list must wait, not grant-all. */
  agentToolsLoading?: boolean
  disabled?: boolean
  /** Draft mode: creates the session the first tool run needs, so a tool call can start a session
   * the same way a first message does. */
  onStartSession?: () => Promise<string>
  /** Called once a tool run that created its own session finishes, e.g. to navigate to it. */
  onSessionStarted?: (sessionId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const invoke = useInvokeSessionTool(serverUrl, accountId)
  const health = useAgentServerHealth(serverUrl)
  /** Session a draft-mode run created, so a contract-miss retry or a failed call reuses it
   * instead of opening another. */
  const startedSessionIdRef = useRef<string | null>(null)
  const capabilities: AgentServerWebCapabilities | undefined = health.data
    ? {
        ...(health.data.webTools ?? {
          search: true,
          readBrowser: true,
        }),
        codeExec: health.data.codeExec,
        codeExecReason: health.data.codeExecReason,
        codeExecReasonCode: health.data.codeExecReasonCode,
      }
    : undefined
  const callables = agentToolsLoading
    ? null
    : normalizeStoredAgentTools(agentTools ?? DEFAULT_AGENT_TOOLS).filter(
        (name) => name !== 'publish' && getSeedTool(name) && getToolAvailability(name, capabilities).available,
      )

  /** True when the server answered with the tool's contract instead of running it (touch-expand). */
  function isContractMiss(output: unknown): boolean {
    if (typeof output !== 'object' || output === null) return false
    const value = output as {
      validationErrors?: unknown
      contract?: unknown
    }
    return value.validationErrors !== undefined || value.contract !== undefined
  }
  async function run(verb: 'read' | 'write' | 'call', input: unknown) {
    setNotice(null)
    try {
      let targetSessionId = sessionId ?? startedSessionIdRef.current
      if (!targetSessionId) {
        if (!onStartSession) return
        targetSessionId = await onStartSession()
        startedSessionIdRef.current = targetSessionId
      }
      const startedHere = !sessionId && startedSessionIdRef.current === targetSessionId
      const response = await invoke.mutateAsync({
        sessionId: targetSessionId,
        verb,
        input,
      })
      if (response._ === 'InvokeSessionToolResponse') {
        if (response.error) {
          toast.error(response.error)
        } else if (isContractMiss(response.output)) {
          // The tool answered with its contract, not a result — keep the form open to retry.
          setNotice(
            'Input didn’t match the tool’s contract — see the contract row in the thread, adjust, and run again.',
          )
          return
        }
      }
      setOpen(false)
      setSelected(null)
      // Even a failed call lands on the new session's log, so surface the session either way.
      if (startedHere) onSessionStarted?.(targetSessionId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tool call failed')
    }
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSelected(null)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={stylex.props(styles_2.s3731c254).className || ''}
          disabled={disabled || (!sessionId && !onStartSession)}
          title={
            sessionId || onStartSession
              ? 'Run a tool yourself — the agent sees the result'
              : 'Send a message to start the session before running tools'
          }
        >
          <Wrench className={stylex.props(styles.s3269316e).className || ''} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={stylex.props(styles.sf8684703).className || ''}>
        {notice ? <div className={stylex.props(styles_2.s3471db8d).className || ''}>{notice}</div> : null}
        {selected === null ? (
          <div className={stylex.props(styles.s25987553).className || ''}>
            <SizableText size="xs" color="muted" className={stylex.props(styles.s374a31e2).className || ''}>
              Run a tool as yourself. The result lands on this thread's log for both of you.
            </SizableText>
            <PaletteRow
              label="Read"
              hint="~/memory, ~/tools, hm://, https://, activity:"
              onPick={() => setSelected('read')}
            />
            <PaletteRow label="Write" hint="~/memory, ~/tools, hm://, ipfs://" onPick={() => setSelected('write')} />
            {callables === null ? (
              <SizableText size="xs" color="muted" className={stylex.props(styles.s6321fdc7).className || ''}>
                Loading this agent's tools…
              </SizableText>
            ) : (
              callables.map((name) => (
                <PaletteRow
                  key={name}
                  label={getSeedTool(name)?.label ?? name}
                  hint={name}
                  onPick={() => setSelected(name)}
                />
              ))
            )}
          </div>
        ) : selected === 'read' ? (
          <ReadForm
            busy={invoke.isPending}
            onBack={() => setSelected(null)}
            onRun={(input) => void run('read', input)}
          />
        ) : selected === 'write' ? (
          <WriteForm
            busy={invoke.isPending}
            onBack={() => setSelected(null)}
            onRun={(input) => void run('write', input)}
          />
        ) : (
          <CallableForm
            name={selected}
            busy={invoke.isPending}
            onBack={() => setSelected(null)}
            onRun={(input) =>
              void run('call', {
                tool: selected,
                input,
              })
            }
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
function PaletteRow({label, hint, onPick}: {label: string; hint: string; onPick: () => void}) {
  return (
    <button type="button" onClick={onPick} className={stylex.props(styles_2.s3b50288c).className || ''}>
      <span className={stylex.props(styles.s129e46b3).className || ''}>{label}</span>
      <span className={stylex.props(styles_2.s5c1b099e).className || ''}>{hint}</span>
    </button>
  )
}
function FormShell({
  title,
  busy,
  canRun,
  onBack,
  onRun,
  children,
}: {
  title: string
  busy: boolean
  canRun: boolean
  onBack: () => void
  onRun: () => void
  children: React.ReactNode
}) {
  return (
    <form
      className={stylex.props(styles.s21672182).className || ''}
      onSubmit={(event) => {
        event.preventDefault()
        if (canRun && !busy) onRun()
      }}
    >
      <div className={stylex.props(styles.s78289774).className || ''}>
        <SizableText size="sm" weight="bold">
          {title}
        </SizableText>
        <Button size="sm" variant="ghost" type="button" onClick={onBack}>
          Back
        </Button>
      </div>
      {children}
      <Button size="sm" type="submit" disabled={!canRun || busy}>
        {busy ? 'Running…' : 'Run'}
      </Button>
    </form>
  )
}
/** Shared input styling for the tool palette forms. */
const fieldStyles = stylex.create({
  field: {
    width: '100%',
    borderRadius: '0.375rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    paddingInline: '0.5rem',
    paddingBlock: '0.375rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    outline: {
      default: null,
      ':focus': 'none',
    },
  },
})
const fieldClass = stylex.props(fieldStyles.field).className || ''
function ReadForm({busy, onBack, onRun}: {busy: boolean; onBack: () => void; onRun: (input: unknown) => void}) {
  const [address, setAddress] = useState('')
  return (
    <FormShell
      title="Read"
      busy={busy}
      canRun={!!address.trim()}
      onBack={onBack}
      onRun={() =>
        onRun({
          address: address.trim(),
        })
      }
    >
      <input
        autoFocus
        className={fieldClass}
        placeholder="~/memory/notes.md · hm://… · https://…"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
    </FormShell>
  )
}
function WriteForm({busy, onBack, onRun}: {busy: boolean; onBack: () => void; onRun: (input: unknown) => void}) {
  const [address, setAddress] = useState('')
  const [content, setContent] = useState('')
  const [optionsJson, setOptionsJson] = useState('')
  function submit() {
    let options: unknown
    if (optionsJson.trim()) {
      try {
        options = JSON.parse(optionsJson)
      } catch {
        toast.error('Options must be valid JSON')
        return
      }
    }
    onRun({
      address: address.trim(),
      ...(content
        ? {
            content,
          }
        : {}),
      ...(options !== undefined
        ? {
            options,
          }
        : {}),
    })
  }
  return (
    <FormShell title="Write" busy={busy} canRun={!!address.trim()} onBack={onBack} onRun={submit}>
      <input
        autoFocus
        className={fieldClass}
        placeholder="~/memory/notes.md · hm://account/path"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <textarea
        className={stylex.props(styles_3.sabad945e).className || ''}
        placeholder="Content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <textarea
        className={stylex.props(styles_3.sabad943f).className || ''}
        placeholder='Options JSON (optional), e.g. {"name": "My Doc"}'
        value={optionsJson}
        onChange={(event) => setOptionsJson(event.target.value)}
      />
    </FormShell>
  )
}

/** Form fields generated from the tool's registry input schema; deep shapes fall back to JSON. */
function CallableForm({
  name,
  busy,
  onBack,
  onRun,
}: {
  name: string
  busy: boolean
  onBack: () => void
  onRun: (input: unknown) => void
}) {
  const tool = getSeedTool(name)
  const schema: JsonSchema = tool?.inputSchema ?? {
    type: 'object',
  }
  const properties = schema.properties ?? {}
  const required = new Set(schema.required ?? [])
  const simple = Object.entries(properties).every(
    ([, prop]) =>
      prop.type === 'string' || prop.type === 'number' || prop.type === 'integer' || prop.type === 'boolean',
  )
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [rawJson, setRawJson] = useState('{}')
  if (!simple) {
    return (
      <FormShell
        title={tool?.label ?? name}
        busy={busy}
        canRun
        onBack={onBack}
        onRun={() => {
          try {
            onRun(JSON.parse(rawJson))
          } catch {
            toast.error('Input must be valid JSON')
          }
        }}
      >
        <textarea
          autoFocus
          className={stylex.props(styles_3.sabad9462).className || ''}
          value={rawJson}
          onChange={(event) => setRawJson(event.target.value)}
        />
      </FormShell>
    )
  }
  const requiredFilled = Array.from(required).every((key) => {
    const value = values[key]
    return typeof value === 'boolean' ? true : !!String(value ?? '').trim()
  })
  const numericErrors = Object.entries(properties).flatMap(([key, prop]) => {
    if (prop.type !== 'number' && prop.type !== 'integer') return []
    const value = values[key]
    if (value === undefined || value === '' || typeof value === 'boolean') return []
    return Number.isNaN(Number(value)) ? [key] : []
  })
  function submit() {
    const input: Record<string, unknown> = {}
    for (const [key, prop] of Object.entries(properties)) {
      const value = values[key]
      if (value === undefined || value === '') continue
      if (prop.type === 'number' || prop.type === 'integer') {
        input[key] = Number(value)
      } else if (prop.type === 'boolean') {
        input[key] = value === true
      } else {
        input[key] = value
      }
    }
    onRun(input)
  }
  return (
    <FormShell
      title={tool?.label ?? name}
      busy={busy}
      canRun={requiredFilled && numericErrors.length === 0}
      onBack={onBack}
      onRun={submit}
    >
      {Object.entries(properties).map(([key, prop], index) => (
        <label key={key} className={stylex.props(styles.sfbc6e28d).className || ''}>
          <span className={stylex.props(styles_2.sadb58fa1).className || ''}>
            {key}
            {required.has(key) ? ' *' : ''}
            {numericErrors.includes(key) ? (
              <span className={stylex.props(styles.s8a2570e2).className || ''}> — must be a number</span>
            ) : null}
          </span>
          {prop.type === 'boolean' ? (
            <input
              type="checkbox"
              className={stylex.props(styles.sca3de968).className || ''}
              checked={values[key] === true}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [key]: event.target.checked,
                }))
              }
            />
          ) : prop.enum ? (
            <select
              className={fieldClass}
              value={String(values[key] ?? '')}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [key]: event.target.value,
                }))
              }
            >
              <option value="">—</option>
              {prop.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              autoFocus={index === 0}
              className={fieldClass}
              placeholder={prop.description?.slice(0, 60)}
              value={String(values[key] ?? '')}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [key]: event.target.value,
                }))
              }
            />
          )}
        </label>
      ))}
    </FormShell>
  )
}
