import React, {useEffect, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {useSelector} from '@xstate/react'
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Download,
  FlaskConical,
  GitCompare,
  LockKeyhole,
  Network,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  Upload,
  X,
} from 'lucide-react'
import {journeys, phases, sourceUrl} from './catalogue.ts'
import {importTrace, inspectTrace, type Trace, type TraceStep} from './trace.ts'
import {createSimulation, scenarios, transitionsFor} from './vault-machine.ts'
import './styles.css'

const labels: Record<string, string> = {
  email: 'Email entry',
  prelogin: 'Check account',
  challenging: 'Create challenge',
  code: 'Await code',
  expired: 'Expired',
  exhausted: 'Attempts exhausted',
  auth: 'Choose credential',
  password: 'Wrap with password',
  recovery: 'Save recovery words',
  passkey: 'WebAuthn + PRF',
  unsupported: 'PRF unsupported',
  identity: 'Create Seed identity',
  saving: 'Save encrypted state',
  reloading: 'Reload + merge',
  saveFailed: 'Save failed',
  signing: 'Sign Profile',
  storing: 'Store blob',
  contact: 'Join default site',
  notifying: 'Register notifications',
  partial: 'Partial publication',
  fresh: 'Await fresh session',
  signin: 'Fresh sign-in',
  complete: 'Identity recovered',
  recovering: 'Recovery sign-in',
  recovered: 'Recovery proven',
  mismatch: 'Identity mismatch',
}
const resourceDetails = {
  challenge: ['Email challenge', 'Vault SQLite · hashed code + binding'],
  session: ['Authenticated session', 'Vault SQLite + browser cookie'],
  wrappedCredential: ['Wrapped DEK', 'Vault SQLite · no plaintext key'],
  recoveryCredential: ['Recovery credential', 'Vault SQLite · wrapped DEK'],
  encryptedVault: ['Encrypted vault', 'Vault SQLite · seed inside ciphertext'],
  profileSignature: ['Signed Profile', 'Browser memory · public blob'],
  daemonBlock: ['Profile block', 'Local daemon blockstore'],
  profileIndex: ['Indexed profile', 'Local daemon query result'],
  remoteProfile: ['Remote profile', 'Independent server / peer read'],
  contact: ['Default-site Contact', 'Local daemon blockstore'],
} satisfies Record<TraceStep['resources'][number], string[]>

/** Interactive simulator and untrusted-evidence inspector for the vault pilot. */
export function App() {
  const [scenarioId, setScenarioId] = useState('password')
  const scenario = scenarios.find((s) => s.id === scenarioId)!
  const [seed, setSeed] = useState(42)
  const [seedInput, setSeedInput] = useState('42')
  const [sim, setSim] = useState(() => createSimulation(scenario))
  const snapshot = useSelector(sim.actor, (s) => s)
  const [, refresh] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1100)
  const [tab, setTab] = useState<'simulate' | 'evidence' | 'compare'>('simulate')
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [inspectedState, setInspectedState] = useState<string | null>(null)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [imported, setImported] = useState<Trace | null>(null)
  const [error, setError] = useState('')
  const [queuedJourney, setQueuedJourney] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const state = String(snapshot.value)
  const currentPhase = phases.find((phase) => phase.states.includes(state)) ?? phases[0]!
  const phase = phases.find((p) => p.id === selectedPhase) ?? currentPhase
  const trace = sim.trace
  const shownTrace = tab === 'evidence' ? imported : trace
  const last = trace.steps.at(-1)
  const visited = new Set<string>(trace.steps.map((s) => s.state))

  useEffect(() => () => sim.stop(), [sim])
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      try {
        sim.step()
        refresh((v) => v + 1)
        if (sim.done) setPlaying(false)
      } catch {
        setPlaying(false)
        setError('The schedule diverged from the machine. Reset to replay this scenario.')
      }
    }, speed)
    return () => window.clearInterval(timer)
  }, [playing, sim, speed])

  function reset(id = scenarioId, newSeed = seed) {
    setPlaying(false)
    sim.stop()
    setScenarioId(id)
    setSelectedStep(null)
    setSelectedPhase(null)
    setInspectedState(null)
    setError('')
    setSim(createSimulation(scenarios.find((s) => s.id === id)!, newSeed))
  }

  function step() {
    setPlaying(false)
    try {
      sim.step()
      refresh((v) => v + 1)
    } catch {
      setError('The next event is not enabled. Reset to replay.')
    }
  }

  function download() {
    if (!shownTrace) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(shownTrace, null, 2)], {type: 'application/json'}))
    const a = document.createElement('a')
    a.href = url
    a.download = 'seed-vault-journey.trace.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function load(file?: File) {
    setPlaying(false)
    setError('')
    if (!file) return
    try {
      if (file.size > 1_000_000) throw new Error('Trace exceeds the 1 MB limit.')
      setImported(importTrace(await file.text()))
      setSelectedStep(null)
      setTab('evidence')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid trace.')
    }
    if (input.current) input.current.value = ''
  }

  return (
    <div className="lab-shell">
      <aside className="sidebar" aria-label="Journey catalogue">
        <a className="wordmark" href="#">
          <Network size={23} strokeWidth={1.5} />
          <span>
            Seed<span className="wordmark-sub">Journey Lab</span>
          </span>
        </a>
        <div className="catalogue-label">
          EXPLORATION CATALOGUE <span>10</span>
        </div>
        <nav>
          {journeys.map(([id, name, group], index) => (
            <button
              key={id}
              className={`journey-link ${id === 'vault-account' ? 'active' : ''}`}
              onClick={() => (id === 'vault-account' ? setQueuedJourney(null) : setQueuedJourney(id))}
              aria-current={id === 'vault-account' ? 'page' : undefined}
            >
              <span className="journey-number">{String(index + 1).padStart(2, '0')}</span>
              <span>
                {name}
                <small>{id === 'vault-account' ? 'Executable pilot' : group + ' · mapped'}</small>
              </span>
              {id === 'vault-account' && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <FlaskConical size={18} />
          <p>
            A model is a hypothesis.
            <br />
            <strong>Evidence is a separate layer.</strong>
          </p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            JOURNEYS <ChevronRight size={12} /> IDENTITY
          </span>
          <span className="small-status">
            <span className="status-dot" /> Isolated simulation
          </span>
        </header>
        <div className="workspace">
          <div className="page-heading">
            <div>
              <div className="eyebrow">JOURNEY 01 / VAULT</div>
              <h1>
                Create a vault account<span>.</span>
              </h1>
              <p>From an unverified email to a durable, recoverable Seed identity.</p>
            </div>
            <div className="pilot-label">
              <FlaskConical size={15} /> VAULT PILOT
            </div>
          </div>
          <div className="tabs" role="tablist" aria-label="Lab view">
            {(
              [
                ['simulate', 'Simulate', Network],
                ['evidence', 'Evidence', ShieldCheck],
                ['compare', 'Compare clients', GitCompare],
              ] as const
            ).map(([id, title, Icon]) => (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                tabIndex={tab === id ? 0 : -1}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onKeyDown={(event) => {
                  const tabs = Array.from(
                    event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
                  )
                  const index = tabs.indexOf(event.currentTarget)
                  const next =
                    event.key === 'ArrowRight'
                      ? (index + 1) % tabs.length
                      : event.key === 'ArrowLeft'
                        ? (index + tabs.length - 1) % tabs.length
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? tabs.length - 1
                            : null
                  if (next === null) return
                  event.preventDefault()
                  tabs[next]!.focus()
                  tabs[next]!.click()
                }}
                onClick={() => {
                  setPlaying(false)
                  setTab(id)
                }}
              >
                <Icon size={16} />
                {title}
              </button>
            ))}
            <button className="import-button" onClick={() => input.current?.click()}>
              <Upload size={15} /> Import trace
            </button>
            <input
              ref={input}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label="Import redacted trace"
              onChange={(e) => void load(e.target.files?.[0])}
            />
          </div>
          {error && (
            <div role="alert" className="notice error">
              <X size={16} />
              {error}
              <button aria-label="Dismiss error" onClick={() => setError('')}>
                <X size={15} />
              </button>
            </div>
          )}
          {queuedJourney && (
            <div className="notice">
              <Circle size={15} />
              <span>
                {journeys.find(([id]) => id === queuedJourney)?.[1]} is source-mapped, not executable yet. This first
                pilot covers the vault journey.
              </span>
              <button aria-label="Dismiss catalogue notice" onClick={() => setQueuedJourney(null)}>
                <X size={15} />
              </button>
            </div>
          )}
          {tab === 'simulate' && (
            <section id="panel-simulate" role="tabpanel" aria-labelledby="tab-simulate">
              <div className="control-bar">
                <label className="scenario-picker">
                  SCENARIO
                  <select value={scenarioId} onChange={(e) => reset(e.target.value)}>
                    {scenarios.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="seed-picker">
                  SEED
                  <input
                    type="number"
                    min="1"
                    max="4294967295"
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    onBlur={() => {
                      const n = Number(seedInput)
                      if (Number.isInteger(n) && n >= 1 && n <= 0xffffffff) {
                        setSeed(n)
                        reset(scenarioId, n)
                      } else setSeedInput(String(seed))
                    }}
                  />
                </label>
                <div className="playback">
                  <button
                    className="icon-button"
                    title="Reset simulation"
                    aria-label="Reset simulation"
                    onClick={() => reset()}
                  >
                    <RotateCcw size={17} />
                  </button>
                  <button className="primary-button" onClick={() => setPlaying(!playing)} disabled={sim.done}>
                    {playing ? <Pause size={15} /> : <Play size={15} />}
                    {playing ? 'Pause' : 'Play'}
                  </button>
                  <button className="step-button" onClick={step} disabled={sim.done}>
                    <SkipForward size={16} />
                    Step
                  </button>
                  <label className="sr-only" htmlFor="speed">
                    Playback speed
                  </label>
                  <select
                    id="speed"
                    className="speed-select"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  >
                    <option value={1800}>Slow</option>
                    <option value={1100}>1×</option>
                    <option value={400}>Fast</option>
                  </select>
                </div>
              </div>
              <p className="scenario-description">{scenario.description}</p>
              <div className="section-heading">
                <h2>
                  Statechart <span>Browser orchestration + 3 actors</span>
                </h2>
                <span className="clock">LOGICAL TIME {(snapshot.context.now / 1000).toFixed(2)}s</span>
              </div>
              <div className="statechart" aria-label="Vault journey statechart">
                {phases.map((p, index) => {
                  const active = p.id === currentPhase.id
                  return (
                    <React.Fragment key={p.id}>
                      <button
                        className={`phase ${active ? 'is-active' : ''} ${phase.id === p.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedPhase(p.id)}
                        aria-pressed={phase.id === p.id}
                      >
                        <span className="phase-top">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          {active ? (
                            <span className="phase-state">CURRENT</span>
                          ) : (
                            <span className="phase-actor">{p.actor.split(' → ')[0]}</span>
                          )}
                        </span>
                        <strong>{p.title}</strong>
                        <div className="state-list">
                          {p.states.map((s) => (
                            <span
                              key={s}
                              className={`state-chip ${s === state ? 'current' : visited.has(s) ? 'visited' : ''}`}
                            >
                              {s === state ? (
                                <span className="status-dot" />
                              ) : visited.has(s) ? (
                                <Check size={10} />
                              ) : (
                                <Circle size={9} />
                              )}
                              {labels[s]}
                            </span>
                          ))}
                        </div>
                      </button>
                      {index < phases.length - 1 && <ArrowRight className="phase-arrow" size={17} />}
                    </React.Fragment>
                  )
                })}
              </div>
              <div className="phase-inspector">
                <div>
                  <span className="eyebrow">ACTION / {phase.actor}</span>
                  <p>{phase.action}</p>
                </div>
                <div>
                  <span className="eyebrow">GUARDS & COMPLETION</span>
                  <p>{phase.guard}</p>
                </div>
                <div className="source-links">
                  <span className="eyebrow">IMPLEMENTATION</span>
                  {phase.sources.map((s) => (
                    <a key={s.symbol} href={sourceUrl(s)} target="_blank" rel="noreferrer">
                      {s.symbol} <ArrowRight size={12} />
                    </a>
                  ))}
                </div>
              </div>
              <details className="transition-inspector">
                <summary>
                  Inspect executable transitions <span>Events · targets · guards · actions</span>
                </summary>
                <label>
                  State
                  <select value={inspectedState ?? state} onChange={(e) => setInspectedState(e.target.value)}>
                    {phases
                      .flatMap((p) => p.states)
                      .map((s) => (
                        <option key={s} value={s}>
                          {labels[s]}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="transition-list">
                  {transitionsFor(inspectedState ?? state).map((t, i) => (
                    <div key={i}>
                      <code>{t.event}</code>
                      <ArrowRight size={13} />
                      <strong>{labels[t.target] ?? t.target}</strong>
                      <small>
                        {t.guard && `if ${t.guard}`}
                        {t.guard && t.actions && ' · '}
                        {t.actions || (!t.guard && 'No action')}
                      </small>
                    </div>
                  ))}
                  {!transitionsFor(inspectedState ?? state).length && (
                    <p>No state-specific transitions; only inherited observation events are accepted.</p>
                  )}
                  <div>
                    <code>time.advance</code>
                    <ArrowRight size={13} />
                    <strong>Update logical clock</strong>
                    <small>Inherited · advanceTime; expires a pending challenge</small>
                  </div>
                  <div>
                    <code>profile.indexed / profile.remote</code>
                    <ArrowRight size={13} />
                    <strong>Record an observation</strong>
                    <small>Inherited · guarded by stored</small>
                  </div>
                </div>
              </details>
              <div className="milestone-strip">
                {(
                  [
                    ['encryptedDurable', 'Encrypted & durable'],
                    ['profileSigned', 'Signed'],
                    ['profileStored', 'Stored'],
                    ['profileIndexed', 'Indexed'],
                    ['remoteAvailable', 'Remote'],
                  ] as const
                ).map(([id, text]) => (
                  <div key={id} className={last?.milestones.includes(id) ? 'reached' : ''}>
                    {last?.milestones.includes(id) ? <Check size={15} /> : <Circle size={13} />}
                    <span>
                      {text}
                      <small>{last?.milestones.includes(id) ? 'Modeled' : 'Not observed'}</small>
                    </span>
                  </div>
                ))}
              </div>
              <div className="lower-grid">
                <Timeline trace={trace} selected={selectedStep} onSelect={setSelectedStep} />
                <div className="right-stack">
                  <ResourceLedger step={selectedStep === null ? last : trace.steps[selectedStep]} />
                  <Assertions trace={trace} imported={false} />
                </div>
              </div>
              <div className="footnote">
                <LockKeyhole size={13} />
                <span>No live accounts, secrets or network calls. Outcomes are modeled, not verified.</span>
                <button onClick={download} disabled={!trace.steps.length}>
                  <Download size={14} /> Export trace
                </button>
              </div>
              <div className="sr-only" role="status" aria-live="polite">
                {playing ? 'Playing' : sim.done ? 'Schedule complete' : 'Paused'}: {labels[state]}
              </div>
            </section>
          )}
          {tab === 'evidence' && (
            <section id="panel-evidence" role="tabpanel" aria-labelledby="tab-evidence">
              <div className="notice">
                <ShieldCheck size={17} />
                <span>
                  Imported traces are <strong>untrusted claims</strong>, even if they say “local-verification”. Review
                  the runner and rerun locally before relying on them.
                </span>
              </div>
              {!imported ? (
                <div className="empty-state">
                  <Upload size={32} strokeWidth={1} />
                  <h2>Bring the model back to reality.</h2>
                  <p>
                    Run the disposable local verifier, then import its redacted JSON.
                    <br />
                    Hosted simulation never starts a real vault or receives credentials.
                  </p>
                  <code>direnv exec . pnpm --filter @shm/journey-lab verify:local</code>
                  <button className="primary-button" onClick={() => input.current?.click()}>
                    <Upload size={15} /> Import evidence
                  </button>
                </div>
              ) : (
                <>
                  <div className="evidence-heading">
                    <h2>{imported.mode === 'local-verification' ? 'Local runner claims' : 'Imported simulation'}</h2>
                    <span className="untrusted-label">UNTRUSTED IMPORT</span>
                    <button className="step-button" onClick={download}>
                      <Download size={15} />
                      Export
                    </button>
                    <button className="step-button" onClick={() => setImported(null)}>
                      Clear
                    </button>
                  </div>
                  <div className="observation-grid">
                    {imported.observations.length ? (
                      imported.observations.map((o) => (
                        <article key={o.check} className="observation">
                          <span>{o.adapter.toUpperCase()}</span>
                          <strong>{o.check.replace(/([A-Z])/g, ' $1')}</strong>
                          <p>
                            {o.result === 'passed'
                              ? 'Claimed pass'
                              : o.result === 'failed'
                                ? 'Claimed failure'
                                : o.result}
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="muted">No independent observations. Model traces are not verification.</p>
                    )}
                  </div>
                  <Assertions trace={imported} imported />
                  <Timeline trace={imported} selected={selectedStep} onSelect={setSelectedStep} />
                </>
              )}
            </section>
          )}
          {tab === 'compare' && (
            <section id="panel-compare" role="tabpanel" aria-labelledby="tab-compare">
              <div className="comparison-intro">
                <h2>Same milestone. Different client boundaries.</h2>
                <p>
                  Vault account creation runs in the browser. Desktop connection and website delegation are separate
                  journeys—not invented desktop variants.
                </p>
              </div>
              <div className="comparison-table">
                <div className="comparison-row table-head">
                  <span>SEMANTIC MILESTONE</span>
                  <strong>Web / vault browser</strong>
                  <strong>Desktop</strong>
                </div>
                {[
                  ['Verify email', 'Browser-bound challenge + cookie', 'Not a desktop creation step'],
                  ['Secure credentials', 'Password + recovery, or WebAuthn PRF', 'Uses a separate vault-connect flow'],
                  [
                    'Persist encrypted seed',
                    'Encrypted vault state in server SQLite',
                    'No independent creation branch in this pilot',
                  ],
                  ['Publish profile', 'Browser signs → daemon stores', 'No independent creation branch in this pilot'],
                  ['Fresh sign-in', 'Fresh browser decrypts to the same UID', 'Desktop-connect verification deferred'],
                  ['Remote availability', 'Unobserved until independently resolved', 'Unobserved'],
                ].map(([milestone, web, desktop]) => (
                  <div className="comparison-row" key={milestone}>
                    <strong>{milestone}</strong>
                    <span>{web}</span>
                    <span className="muted">{desktop}</span>
                  </div>
                ))}
              </div>
              <p className="footnote">
                Shared server semantics will be reused when the desktop-connect journey is added. No desktop success is
                claimed here.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function Timeline({
  trace,
  selected,
  onSelect,
}: {
  trace: Trace
  selected: number | null
  onSelect: (n: number | null) => void
}) {
  return (
    <section className="timeline-panel">
      <div className="section-heading">
        <h2>
          Event timeline <span>{trace.steps.length} events</span>
        </h2>
        {selected !== null && (
          <button className="text-button" onClick={() => onSelect(null)}>
            Follow latest
          </button>
        )}
      </div>
      <div className="actor-head">
        <span>TIME</span>
        <span>BROWSER → VAULT / MAIL / DAEMON</span>
      </div>
      <div className="timeline-scroll">
        {!trace.steps.length ? (
          <div className="timeline-empty">
            <ArrowDown size={20} />
            <p>
              The environment is empty.
              <br />
              <strong>Step to submit the first email.</strong>
            </p>
          </div>
        ) : (
          trace.steps.map((s, i) => (
            <button
              key={s.seq}
              className={`timeline-event ${selected === i ? 'selected' : ''}`}
              onClick={() => onSelect(selected === i ? null : i)}
              aria-pressed={selected === i}
            >
              <time>{(s.time / 1000).toFixed(2)}s</time>
              <span className="event-mark" />
              <span>
                <strong>{s.event}</strong>
                <small>
                  {labels[s.state]} · vault: {s.actors.vault} · daemon: {s.actors.daemon} · mail: {s.actors.mail}
                </small>
              </span>
              <ChevronRight size={13} />
            </button>
          ))
        )}
      </div>
    </section>
  )
}

function ResourceLedger({step}: {step?: TraceStep}) {
  return (
    <section className="resource-panel">
      <div className="section-heading">
        <h2>
          Resource ledger <span>{step?.resources.length ?? 0} created</span>
        </h2>
        <LockKeyhole size={14} />
      </div>
      {!step?.resources.length ? (
        <p className="resource-empty">No resources yet. Watch where data becomes durable.</p>
      ) : (
        <div className="resource-list">
          {step.resources.map((r) => (
            <div key={r}>
              <span className="resource-icon">
                <LockKeyhole size={13} />
              </span>
              <span>
                <strong>{resourceDetails[r][0]}</strong>
                <small>{resourceDetails[r][1]}</small>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Assertions({trace, imported}: {trace: Trace; imported: boolean}) {
  const assertions = inspectTrace(trace)
  return (
    <section className="assertions-panel">
      <div className="section-heading">
        <h2>{imported ? 'Imported consistency' : 'Model invariants'}</h2>
        <span className="eyebrow">
          {assertions.filter((a) => a.passed).length}/{assertions.length}
        </span>
      </div>
      {assertions.map((a) => (
        <div className={`assertion ${a.passed ? '' : 'failed'}`} key={a.name}>
          {a.passed ? <Check size={13} /> : <X size={13} />}
          <span>{a.name}</span>
        </div>
      ))}
      <p className="assertion-note">
        {trace.steps.length
          ? 'Consistency only. Passing is not proof of real behavior.'
          : 'No events yet; these properties have not been exercised.'}
      </p>
    </section>
  )
}

const root = document.getElementById('root')
if (root) createRoot(root).render(<App />)
