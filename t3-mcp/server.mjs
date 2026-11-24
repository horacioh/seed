// t3-mcp: a small MCP server that runs inside the T3 Code container and shells out
// to the T3 CLI. Plain Node ESM, zero runtime dependencies. Single entry file —
// fetched as one file from raw.githubusercontent.com and run with `node server.mjs`.
//
// See README.md for the deployment recipe and security model.

import * as crypto from 'node:crypto'
import * as fs from 'node:fs/promises'
import * as http from 'node:http'
import * as os from 'node:os'
import * as path from 'node:path'
import {execFile} from 'node:child_process'
import {createReadStream} from 'node:fs'
import {Readable} from 'node:stream'

const SERVER_VERSION = '0.2.0'
const SUPPORTED_PROTOCOL_VERSIONS = new Set(['2025-06-18', '2025-03-26', '2024-11-05'])
const DEFAULT_PROTOCOL_VERSION = '2025-06-18'
const CLI_TIMEOUT_MS = 60_000
const MAX_STDERR_BYTES = 2048
/** Cap on an incoming /mcp request body. */
const MAX_REQUEST_BODY_BYTES = 1024 * 1024
const MAX_WEBHOOK_BODY_BYTES = 60 * 1024
const MAX_INFLIGHT_CLI = 4
const ARTIFACT_ID_BYTES = 16
const ARTIFACT_MAX_FILES = 20
const ARTIFACT_MAX_FILE_BYTES = 50 * 1024 * 1024
const ARTIFACT_ID_RE = /^[A-Za-z0-9_-]{22}$/
const ARTIFACT_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/
const ARTIFACT_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'webm', 'mp4'])
const ARTIFACT_CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  webm: 'video/webm',
  mp4: 'video/mp4',
}

// Notification events a tool may subscribe to. The default (omitted) keeps the historical
// thread.finished-only behavior. `thread.finished` arms the one-shot run watch (which also fires
// thread.needs_input). `pull_request.merged` arms a merge subscription.
const NOTIFY_EVENTS = ['thread.finished', 'pull_request.merged']
const NOTIFY_EVENTS_SCHEMA = {
  type: 'array',
  items: {type: 'string', enum: NOTIFY_EVENTS},
  minItems: 1,
  uniqueItems: true,
}

// ─── Config ──────────────────────────────────────────────────────────────────

function parseConfig(env = process.env) {
  const token = env.T3_MCP_TOKEN
  if (!token) throw new Error('T3_MCP_TOKEN is required (Bearer token for /mcp)')
  const projects = (env.T3_MCP_PROJECTS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (projects.length === 0) throw new Error('T3_MCP_PROJECTS is required (comma-separated T3 project ids)')
  let t3Bin = env.T3_MCP_T3_BIN ?? 't3'
  // Accept a JSON argv array so tests can point at a fake CLI: ["node","/path/fake-t3.mjs"]
  try {
    const parsed = JSON.parse(t3Bin)
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string') && parsed.length > 0) {
      t3Bin = parsed
    }
  } catch {
    // not JSON — treat as a single binary name on PATH
  }
  const webhookPrefixes = (env.T3_MCP_WEBHOOK_PREFIXES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizePrefix)
  const stateDir = env.T3_MCP_STATE_DIR ?? path.join(os.homedir(), '.t3-mcp')
  const artifactsDir = env.T3_MCP_ARTIFACTS_DIR ?? path.join(stateDir, 'artifacts')
  const artifactsBaseUrl = env.T3_MCP_ARTIFACTS_BASE_URL?.trim().replace(/\/$/, '') || ''
  // Test hook: lower the per-file byte cap without writing 50 MB. Not for production use.
  const artifactMaxFileBytes = env.T3_MCP_TEST_ARTIFACT_MAX_BYTES
    ? parseInt(env.T3_MCP_TEST_ARTIFACT_MAX_BYTES, 10)
    : ARTIFACT_MAX_FILE_BYTES
  // Used when start_thread names no model: `t3 thread start` refuses to start without one when the
  // project has no default model.
  const defaultProvider = env.T3_MCP_DEFAULT_PROVIDER?.trim() || ''
  const defaultModel = env.T3_MCP_DEFAULT_MODEL?.trim() || ''
  if (Boolean(defaultProvider) !== Boolean(defaultModel)) {
    throw new Error('T3_MCP_DEFAULT_PROVIDER and T3_MCP_DEFAULT_MODEL must be set together')
  }
  return {
    defaultProvider,
    defaultModel,
    token,
    hostname: env.T3_MCP_HOST ?? '0.0.0.0',
    port: parseInt(env.T3_MCP_PORT ?? '3774', 10),
    t3Bin,
    projects,
    defaultProject: projects[0],
    webhookPrefixes,
    stateDir,
    artifactsDir,
    artifactsBaseUrl,
    artifactMaxFileBytes,
    pollSecs: parseInt(env.T3_MCP_POLL_SECS ?? '15', 10),
    prPollSecs: parsePositiveInt(env.T3_MCP_PR_POLL_SECS, '60', 'T3_MCP_PR_POLL_SECS'),
  }
}

function parsePositiveInt(raw, fallback, name) {
  const s = raw ?? fallback
  const n = parseInt(s, 10)
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} must be a positive integer (got ${JSON.stringify(raw ?? s)})`)
  }
  return n
}

function normalizePrefix(prefix) {
  // Normalize via URL so prefix matches use a canonical form (trailing slash preserved).
  try {
    const u = new URL(prefix)
    return u.toString()
  } catch {
    return prefix
  }
}

// ─── Logging (never log tokens, message contents, or webhook secret path) ───

function log(level, msg) {
  const ts = new Date().toISOString()
  console.error(`[${ts}] [${level}] ${msg}`)
}
function redactUrl(url) {
  try {
    const u = new URL(url)
    const segs = u.pathname.split('/').filter(Boolean)
    if (segs.length > 0) segs[segs.length - 1] = '***'
    u.pathname = '/' + segs.join('/')
    return u.toString()
  } catch {
    return '<invalid url>'
  }
}

// ─── Timing-safe token compare ───────────────────────────────────────────────

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab) // constant-time dummy compare
    return false
  }
  return crypto.timingSafeEqual(ab, bb)
}

// ─── CLI runner ──────────────────────────────────────────────────────────────

let inflightCli = 0

function runCli(cfg, args, opts = {}) {
  return new Promise((resolve, reject) => {
    if (inflightCli >= MAX_INFLIGHT_CLI) {
      reject(new Error('too many concurrent CLI calls'))
      return
    }
    inflightCli += 1
    const bin = Array.isArray(cfg.t3Bin) ? cfg.t3Bin[0] : cfg.t3Bin
    const baseArgs = Array.isArray(cfg.t3Bin) ? cfg.t3Bin.slice(1) : []
    const fullArgs = [...baseArgs, ...args]
    const child = execFile(
      bin,
      fullArgs,
      {timeout: CLI_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024, windowsHide: true},
      (err, stdout, stderr) => {
        inflightCli -= 1
        if (err) {
          const code = err.code ?? 'exit'
          const trimmedStderr = (stderr ?? '').slice(0, MAX_STDERR_BYTES).trim()
          const msg = trimmedStderr || err.message || 'CLI error'
          reject(new Error(`t3 ${args[0] ?? ''} failed (${code}): ${msg}`))
          return
        }
        resolve({stdout, stderr})
      },
    )
    if (opts.stdin && child.stdin) {
      child.stdin.end(opts.stdin)
    } else if (child.stdin) {
      child.stdin.end()
    }
  })
}

async function cliJson(cfg, args, opts) {
  const {stdout} = await runCli(cfg, args, opts)
  try {
    return JSON.parse(stdout)
  } catch {
    throw new Error(`t3 ${args[0] ?? ''}: unparseable output`)
  }
}

// ─── Thread helpers ──────────────────────────────────────────────────────────

async function showThread(cfg, threadId, messages = 5) {
  return cliJson(cfg, ['thread', 'show', threadId, '--messages', String(messages), '--json'])
}

async function assertThreadAllowed(cfg, threadId) {
  const data = await showThread(cfg, threadId, 3)
  const projectId = data?.thread?.projectId
  if (!projectId || !cfg.projects.includes(projectId)) {
    throw new ToolError('Thread is not in an allowed project')
  }
  return data
}

function assertProjectAllowed(cfg, projectId) {
  if (!projectId || !cfg.projects.includes(projectId)) {
    throw new ToolError('Project is not in the allowlist')
  }
}

function assertWebhookAllowed(cfg, url) {
  if (cfg.webhookPrefixes.length === 0) {
    throw new ToolError('Notifications are disabled (T3_MCP_WEBHOOK_PREFIXES is unset)')
  }
  let u
  try {
    u = new URL(url)
  } catch {
    throw new ToolError('notifyWebhookUrl is not a valid URL')
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new ToolError('notifyWebhookUrl must be http(s)')
  }
  const s = u.toString()
  if (!cfg.webhookPrefixes.some((p) => s.startsWith(p))) {
    throw new ToolError('notifyWebhookUrl does not match an allowed prefix')
  }
  return s
}

// Parse and validate the notifyEvents argument. Runs at the tool boundary before any side effect.
// Returns the armed list (duplicates collapsed). Defaults to ['thread.finished'] when omitted.
function parseNotifyEvents(args) {
  if (args.notifyEvents === undefined) return ['thread.finished']
  if (!args.notifyWebhookUrl) {
    throw new ToolError('notifyEvents requires notifyWebhookUrl')
  }
  const v = args.notifyEvents
  if (!Array.isArray(v)) {
    throw new ToolError('notifyEvents must be an array')
  }
  if (v.length === 0) {
    throw new ToolError('notifyEvents must not be empty')
  }
  const allowed = NOTIFY_EVENTS.join(', ')
  const seen = new Set()
  for (const item of v) {
    if (typeof item !== 'string' || !NOTIFY_EVENTS.includes(item)) {
      throw new ToolError(`notifyEvents: unknown event "${item}"; allowed: ${allowed}`)
    }
    seen.add(item)
  }
  return [...seen]
}

// ─── Tool error ──────────────────────────────────────────────────────────────

class ToolError extends Error {}

// ─── Tools ───────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_threads',
    description:
      'List T3 Code threads in a project. Returns thread summaries (id, title, status, latest run, model, pull requests).',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'T3 project id. Defaults to the first allowed project.',
        },
        limit: {
          type: 'integer',
          description: 'Maximum threads to return (default 20, max 100).',
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: 'start_thread',
    description:
      'Start a new T3 Code thread with an initial message. The thread runs with the project runtime mode (full access for the seed project). An artifact directory is created for before/after evidence (screenshots/videos); the message tells the agent where to save them, and the returned artifactsUrl is a base URL the agents server can download files from by plain URL (no auth). Pass notifyWebhookUrl to be notified when the run finishes and/or when an associated PR merges.',
    inputSchema: {
      type: 'object',
      required: ['message'],
      properties: {
        message: {type: 'string', description: 'Initial message for the agent.'},
        title: {type: 'string', description: 'Thread title. Defaults to the message first line.'},
        project: {type: 'string', description: 'T3 project id. Defaults to the first allowed project.'},
        worktree: {
          type: 'string',
          description: 'Base ref (branch/tag/commit) for a new git worktree the thread runs in.',
        },
        branch: {type: 'string', description: 'Branch name for the new worktree.'},
        provider: {
          type: 'string',
          description: 'Provider instance id, given together with model. Omit both to use the server default.',
        },
        model: {
          type: 'string',
          description: 'Model slug, given together with provider. Omit both to use the server default.',
        },
        notifyWebhookUrl: {
          type: 'string',
          description:
            'https URL (matching an allowed prefix) to POST subscribed events to. Required when notifyEvents is given.',
        },
        notifyEvents: {
          ...NOTIFY_EVENTS_SCHEMA,
          description:
            'Events to subscribe to. Defaults to ["thread.finished"]. "thread.finished" fires once when a run that began after arming finishes (also fires thread.needs_input). "pull_request.merged" sends one event per associated PR that is merged, including PRs merged before subscribing; stays armed after runs finish.',
        },
      },
    },
  },
  {
    name: 'send_message',
    description:
      'Send a message to an existing T3 Code thread. A busy thread queues it as its next turn. Pass notifyWebhookUrl to be notified when the run finishes and/or when an associated PR merges.',
    inputSchema: {
      type: 'object',
      required: ['threadId', 'message'],
      properties: {
        threadId: {type: 'string', description: 'Thread id.'},
        message: {type: 'string', description: 'Message for the agent.'},
        notifyWebhookUrl: {
          type: 'string',
          description:
            'https URL (matching an allowed prefix) to POST subscribed events to. Required when notifyEvents is given.',
        },
        notifyEvents: {
          ...NOTIFY_EVENTS_SCHEMA,
          description: 'Events to subscribe to. Defaults to ["thread.finished"]. See start_thread for semantics.',
        },
      },
    },
  },
  {
    name: 'get_thread',
    description:
      'Read a T3 Code thread: its status, branch, run info, recent messages, and any saved evidence artifacts (screenshots/videos with downloadable URLs).',
    inputSchema: {
      type: 'object',
      required: ['threadId'],
      properties: {
        threadId: {type: 'string', description: 'Thread id.'},
        messages: {
          type: 'integer',
          description: 'Number of recent messages to return (default 5, max 50).',
          minimum: 1,
          maximum: 50,
        },
      },
    },
  },
  {
    name: 'watch_thread',
    description:
      'Subscribe to events for a thread. With notifyEvents ["thread.finished"] (default) arms a one-shot notification for the next finished run (or immediately if already idle with a run never notified to that URL). With ["pull_request.merged"] arms a merge subscription that sends one event per associated PR that is merged, including PRs merged before subscribing; stays armed after runs finish.',
    inputSchema: {
      type: 'object',
      required: ['threadId', 'notifyWebhookUrl'],
      properties: {
        threadId: {type: 'string', description: 'Thread id.'},
        notifyWebhookUrl: {
          type: 'string',
          description: 'https URL (matching an allowed prefix) to POST events to.',
        },
        notifyEvents: {
          ...NOTIFY_EVENTS_SCHEMA,
          description: 'Events to subscribe to. Defaults to ["thread.finished"]. See start_thread for semantics.',
        },
      },
    },
  },
  {
    name: 'unwatch_thread',
    description: 'Remove every armed notification for a thread: the one-shot run watch and any merge subscription.',
    inputSchema: {
      type: 'object',
      required: ['threadId'],
      properties: {
        threadId: {type: 'string', description: 'Thread id.'},
      },
    },
  },
]

async function toolListThreads(cfg, args) {
  const project = args.project ?? cfg.defaultProject
  assertProjectAllowed(cfg, project)
  const limit = clampInt(args.limit, 20, 1, 100)
  const threads = await cliJson(cfg, ['thread', 'list', '--project', project, '--json'])
  const list = Array.isArray(threads) ? threads.slice(0, limit) : []
  return {project, threads: list}
}

async function toolStartThread(cfg, args, req) {
  const project = args.project ?? cfg.defaultProject
  assertProjectAllowed(cfg, project)
  if ((args.provider && !args.model) || (args.model && !args.provider)) {
    throw new ToolError('provider and model must be given together')
  }
  // Validate notifyEvents at the boundary, before any side effect (like the URL check below).
  const events = parseNotifyEvents(args)
  // Checked before starting, so a rejected URL never leaves a thread behind.
  let normalizedUrl = null
  if (args.notifyWebhookUrl) {
    normalizedUrl = assertWebhookAllowed(cfg, args.notifyWebhookUrl)
  }
  // Create an artifact directory for this thread's before/after evidence.
  const {artifactId, dir, baseUrl} = await createArtifactDir(cfg, req)
  const artifactsUrl = `${baseUrl}/artifacts/${artifactId}/`
  const evidenceBlock =
    `\n\n---\nEvidence directory: ${dir}\n` +
    'Save before/after screenshots or recordings for this task there as flat files named like ' +
    'before-*.png / after-*.webm (allowed: png, jpg, jpeg, gif, webp, webm, mp4; max 50 MB each). ' +
    'Do not put secrets or private data in them; they will be published.'
  const message = args.message + evidenceBlock
  const cliArgs = ['thread', 'start']
  if (args.title) cliArgs.push('--title', args.title)
  const provider = args.provider ?? cfg.defaultProvider
  const model = args.model ?? cfg.defaultModel
  if (provider && model) cliArgs.push('--provider', provider, '--model', model)
  if (args.worktree) cliArgs.push('--worktree', args.worktree)
  if (args.branch) cliArgs.push('--branch', args.branch)
  cliArgs.push('--json', project, '-')
  let stdout
  let threadId
  try {
    const r = await runCli(cfg, cliArgs, {stdin: message})
    stdout = r.stdout
    try {
      const obj = JSON.parse(stdout)
      threadId = obj.threadId ?? obj.id ?? obj.thread?.threadId
    } catch {
      threadId = stdout.trim().split(/\s+/)[0]
    }
  } catch (err) {
    // Thread start failed — remove the empty artifact dir.
    await fs.rm(dir, {recursive: true, force: true}).catch(() => {})
    throw err
  }
  if (!threadId) {
    await fs.rm(dir, {recursive: true, force: true}).catch(() => {})
    throw new ToolError('thread start did not return a thread id')
  }
  // Persist the mapping threadId → {artifactId, dir, baseUrl}.
  state.artifacts.set(threadId, {threadId, artifactId, dir, baseUrl})
  persistArtifacts(cfg)
  let title = args.title ?? ''
  let link = ''
  let status = 'running'
  // Prefer JSON output; fall back to parsing a bare id from text.
  try {
    const obj = JSON.parse(stdout)
    title = title || (obj.title ?? obj.thread?.title ?? '')
    link = obj.link ?? obj.thread?.link ?? ''
    status = obj.status ?? obj.thread?.status ?? 'running'
  } catch {
    // text reply — title/link/status unknown
  }
  // `thread start --json` does not include the link, so read it back.
  const data = await showThread(cfg, threadId, 1)
  title = title || (data.thread?.title ?? '')
  link = link || (data.thread?.link ?? '')
  status = data.thread?.status ?? status
  const armed = []
  if (events.includes('thread.finished') && normalizedUrl) {
    // Every run of a brand-new thread is one this call started, so any finished run counts.
    armWatch(cfg, threadId, normalizedUrl, null)
    armed.push('thread.finished')
  }
  if (events.includes('pull_request.merged') && normalizedUrl) {
    await armPrWatch(cfg, threadId, normalizedUrl, project)
    armed.push('pull_request.merged')
  }
  return {
    threadId,
    title,
    link,
    status,
    watching: armed.length > 0,
    notifyEvents: armed,
    artifactsDir: dir,
    artifactsUrl,
  }
}

async function toolSendMessage(cfg, args) {
  // The run that exists before sending is not the one this message starts, so it is the watch's baseline.
  const before = await assertThreadAllowed(cfg, args.threadId)
  const events = parseNotifyEvents(args)
  let normalizedUrl = null
  if (args.notifyWebhookUrl) {
    normalizedUrl = assertWebhookAllowed(cfg, args.notifyWebhookUrl)
  }
  const {stdout} = await runCli(cfg, ['thread', 'send', '--json', args.threadId, '-'], {stdin: args.message})
  let status = 'running'
  try {
    const obj = JSON.parse(stdout)
    status = obj.status ?? obj.thread?.status ?? 'running'
  } catch {
    // text reply — status unknown, assume running
  }
  const armed = []
  if (events.includes('thread.finished') && normalizedUrl) {
    armWatch(cfg, args.threadId, normalizedUrl, before.thread?.latestRunId ?? null)
    armed.push('thread.finished')
  }
  if (events.includes('pull_request.merged') && normalizedUrl) {
    await armPrWatch(cfg, args.threadId, normalizedUrl, before.thread?.projectId ?? '')
    armed.push('pull_request.merged')
  }
  return {threadId: args.threadId, status, watching: armed.length > 0, notifyEvents: armed}
}

async function toolGetThread(cfg, args) {
  const data = await assertThreadAllowed(cfg, args.threadId)
  const messages = clampInt(args.messages, 5, 1, 50)
  let result
  if (messages !== 3) {
    // re-fetch with the requested message count
    const full = await showThread(cfg, args.threadId, messages)
    result = {thread: full.thread, messages: full.messages ?? []}
  } else {
    result = {thread: data.thread, messages: data.messages ?? []}
  }
  result.artifacts = await listArtifacts(cfg, args.threadId)
  return result
}

async function toolWatchThread(cfg, args) {
  const data = await assertThreadAllowed(cfg, args.threadId)
  const events = parseNotifyEvents(args)
  const normalizedUrl = assertWebhookAllowed(cfg, args.notifyWebhookUrl)
  const armed = []
  if (events.includes('thread.finished')) {
    // No baseline: notify for the run in progress, or right away for the latest run of an idle thread.
    armWatch(cfg, args.threadId, normalizedUrl, null)
    armed.push('thread.finished')
  }
  if (events.includes('pull_request.merged')) {
    await armPrWatch(cfg, args.threadId, normalizedUrl, data.thread?.projectId ?? '')
    armed.push('pull_request.merged')
  }
  return {threadId: args.threadId, watching: true, notifyEvents: armed}
}

async function toolUnwatchThread(cfg, args) {
  // Allow unwatch even if the thread is not in an allowed project? The brief says
  // every tool taking a threadId must first thread show and refuse. Honor that.
  await assertThreadAllowed(cfg, args.threadId)
  const removed = unwatch(cfg, args.threadId)
  return {threadId: args.threadId, removed: removed}
}

function clampInt(v, def, min, max) {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : def
  return Math.max(min, Math.min(max, n))
}

// ─── Watcher ─────────────────────────────────────────────────────────────────

// A watch = {threadId, url, afterRunId, createdAt, needsInputFired}
// afterRunId: the latestRunId when armed (or null for a brand-new thread). Fire when
// a run that began after arming has finished (activeRunId === null && latestRunId
// differs from afterRunId). Also fire once with thread.needs_input if
// pendingRequestCount > 0, then keep watching for the finish.

function armWatch(cfg, threadId, url, latestRunId) {
  const watch = {
    threadId,
    url,
    afterRunId: latestRunId ?? null,
    createdAt: new Date().toISOString(),
    needsInputFired: false,
  }
  state.watches.set(threadId, watch)
  persistWatches(cfg)
  log('info', `watch armed thread=${threadId} url=${redactUrl(url)} afterRun=${latestRunId ?? 'null'}`)
}

function unwatch(cfg, threadId) {
  const hadWatch = state.watches.delete(threadId)
  // Remove every merge subscription for this thread.
  let hadPr = false
  for (const key of [...state.prWatches.keys()]) {
    if (key.startsWith(threadId + '\n')) {
      state.prWatches.delete(key)
      hadPr = true
    }
  }
  if (hadWatch) persistWatches(cfg)
  if (hadPr) persistPrWatches(cfg)
  return hadWatch || hadPr
}

// Shared webhook POST. Returns 'delivered' (2xx), 'conflict' (409 — receiver already holds the key),
// 'retry' (408/425/429/5xx/network/timeout), or 'rejected' (any other non-2xx).
async function postWebhook(url, idempotencyKey, bodyString) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: Buffer.from(bodyString),
      signal: AbortSignal.timeout(15_000),
    })
    if (res.status >= 200 && res.status < 300) return 'delivered'
    if (res.status === 409) return 'conflict'
    if (res.status === 408 || res.status === 425 || res.status === 429 || res.status >= 500) return 'retry'
    return 'rejected'
  } catch {
    // Network error or timeout → retry on the next cycle.
    return 'retry'
  }
}

async function pollLoop(cfg) {
  if (state.pollRunning) return
  state.pollRunning = true
  try {
    // Snapshot so a fire that removes a watch does not mutate the map mid-iteration.
    const watches = [...state.watches.values()]
    // Poll sequentially to avoid CLI storms; max 4 in flight is enforced by runCli.
    for (const watch of watches) {
      try {
        await pollOne(cfg, watch)
      } catch (err) {
        log('warn', `poll thread=${watch.threadId} error: ${err.message}`)
      }
    }
  } finally {
    state.pollRunning = false
  }
}

async function pollOne(cfg, watch) {
  let data
  try {
    data = await showThread(cfg, watch.threadId, 3)
  } catch (err) {
    // If the thread is gone/invalid, drop the watch.
    log('warn', `poll thread=${watch.threadId} show failed: ${err.message}`)
    return
  }
  const thread = data.thread
  if (!thread) return
  const activeRunId = thread.activeRunId ?? null
  const latestRunId = thread.latestRunId ?? null
  const pending = thread.pendingRequestCount ?? 0

  // needs_input event: fire once when pendingRequestCount > 0.
  if (pending > 0 && !watch.needsInputFired) {
    watch.needsInputFired = true
    await fireNotification(cfg, watch, 'thread.needs_input', thread, data.messages ?? [])
    // Keep watching for the finish; do not remove.
    return
  }

  // finished event: activeRunId is null and a run that began after arming finished.
  if (activeRunId === null && latestRunId && latestRunId !== watch.afterRunId) {
    const ok = await fireNotification(cfg, watch, 'thread.finished', thread, data.messages ?? [])
    if (ok) {
      state.watches.delete(watch.threadId)
      persistWatches(cfg)
    }
    // On failure (5xx/network), keep the watch and retry on a later poll.
  }
}

async function fireNotification(cfg, watch, event, thread, messages) {
  const runId = thread.latestRunId ?? ''
  const idempotencyKey = sanitizeKey(`t3-${watch.threadId}-${runId}-${event}`)
  const lastAssistant = lastAssistantText(messages, runId)
  const artifacts = await listArtifacts(cfg, thread.threadId)
  const payload = {
    event,
    threadId: thread.threadId,
    title: thread.title ?? '',
    link: thread.link ?? '',
    status: thread.status ?? '',
    runId,
    branch: thread.branch ?? null,
    worktreePath: thread.worktreePath ?? null,
    pullRequests: thread.pullRequests ?? [],
    project: thread.projectId ?? '',
    artifacts,
    lastAssistantMessage: truncateTail(lastAssistant, 4000),
    messages: truncateMessages(messages, 8),
  }
  let body = Buffer.from(JSON.stringify(payload))
  // If over budget, drop messages first (artifacts list is small and more useful to the agent).
  if (body.length > MAX_WEBHOOK_BODY_BYTES) {
    const trimmed = {...payload, messages: [], lastAssistantMessage: truncateTail(lastAssistant, 2000)}
    body = Buffer.from(JSON.stringify(trimmed))
  }
  if (body.length > MAX_WEBHOOK_BODY_BYTES) {
    log('warn', `webhook body ${body.length}B exceeds ${MAX_WEBHOOK_BODY_BYTES}B; dropping`)
    return false
  }
  log('info', `notify event=${event} thread=${watch.threadId} key=${idempotencyKey}`)
  const result = await postWebhook(watch.url, idempotencyKey, body.toString())
  if (result === 'delivered' || result === 'conflict') {
    log('info', `notify ${result} thread=${watch.threadId} event=${event}`)
    return true
  }
  if (result === 'rejected') {
    log('warn', `notify rejected (4xx) dropping watch thread=${watch.threadId}`)
    state.watches.delete(watch.threadId)
    persistWatches(cfg)
    return true // treated as resolved so the caller does not retry
  }
  // retry: keep the watch and retry on a later poll.
  log('warn', `notify retry thread=${watch.threadId} event=${event}`)
  return false
}

// ─── PR merge detection ──────────────────────────────────────────────────────

async function listThreads(cfg, project) {
  return cliJson(cfg, ['thread', 'list', '--project', project, '--json'])
}

// Associated PRs = pullRequests items with source !== 'stack-dismissed', a string url and an integer number.
function associatedPrs(thread) {
  const prs = thread?.pullRequests
  if (!Array.isArray(prs)) return []
  return prs.filter(
    (p) => p && p.source !== 'stack-dismissed' && typeof p.url === 'string' && Number.isInteger(p.number),
  )
}

function prShape(p) {
  return {
    url: p.url,
    repository: p.repository ?? '',
    number: p.number,
    host: p.host ?? '',
    source: p.source ?? '',
    state: p.state ?? null,
  }
}

// eventId for a merged PR. GitHub names are case-insensitive, so host/repository are lowercased
// before hashing so the same merge always produces the same id regardless of casing.
function prMergedEventId(threadId, pr) {
  const host = (pr.host ?? '').toLowerCase()
  const repository = (pr.repository ?? '').toLowerCase()
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify([threadId, host, repository, pr.number]))
    .digest('hex')
    .slice(0, 32)
  return `t3-pr-merged-${pr.number}-${hash}`
}

function buildPrMergedPayload(thread, pr, allPrs, project) {
  return {
    event: 'pull_request.merged',
    eventId: prMergedEventId(thread.threadId, pr),
    threadId: thread.threadId,
    title: thread.title ?? '',
    link: thread.link ?? '',
    project,
    pullRequest: prShape(pr),
    pullRequests: allPrs.map(prShape),
  }
}

async function prPollLoop(cfg) {
  if (state.prPollRunning) return
  state.prPollRunning = true
  try {
    // Group subs by project. Skip projects not in cfg.projects.
    const byProject = new Map()
    for (const sub of state.prWatches.values()) {
      if (!cfg.projects.includes(sub.project)) continue
      if (!byProject.has(sub.project)) byProject.set(sub.project, [])
      byProject.get(sub.project).push(sub)
    }
    // Per-cycle cache of show fallbacks, keyed by threadId. A `gone` result drops every sub of that
    // thread, so the show runs at most once per thread per cycle even with multiple subs.
    const shown = new Map()
    for (const [project, subs] of byProject) {
      let threads
      try {
        const arr = await listThreads(cfg, project)
        threads = Array.isArray(arr) ? arr : []
      } catch (err) {
        log('warn', `pr-poll project=${project} list failed: ${err.message}`)
        // Skip this project's subs this cycle.
        continue
      }
      const byThread = new Map()
      for (const t of threads) {
        if (t && typeof t.threadId === 'string') byThread.set(t.threadId, t)
      }
      for (const sub of subs) {
        try {
          await prPollOne(cfg, sub, byThread, shown)
        } catch (err) {
          log('warn', `pr-poll thread=${sub.threadId} error: ${err.message}`)
        }
      }
    }
  } finally {
    state.prPollRunning = false
  }
}

async function prPollOne(cfg, sub, byThread, shown) {
  const key = prWatchKey(sub.threadId, sub.url)
  // Identity-safe: bail if the sub was replaced or removed before we start.
  if (state.prWatches.get(key) !== sub) return
  let thread = byThread.get(sub.threadId)
  if (!thread) {
    // Fall back to one show per thread per cycle, cached in `shown`.
    let cached = shown.get(sub.threadId)
    if (!cached) {
      let data
      try {
        data = await showThread(cfg, sub.threadId, 1)
      } catch (err) {
        const msg = err.message ?? ''
        if (/is no longer available/.test(msg)) {
          cached = {gone: true}
        } else {
          log('warn', `pr-poll thread=${sub.threadId} show failed: ${err.message}`)
          cached = {error: true}
        }
      }
      if (!cached) {
        const t = data?.thread
        cached = t ? {thread: t} : {error: true}
      }
      shown.set(sub.threadId, cached)
    }
    if (cached.gone) {
      log('info', `pr-poll thread=${sub.threadId} no longer available; dropping sub`)
      if (state.prWatches.get(key) === sub) {
        state.prWatches.delete(key)
        await persistPrWatches(cfg)
      }
      return
    }
    if (cached.error) return
    const t = cached.thread
    const projectId = t.projectId
    if (!projectId || !cfg.projects.includes(projectId)) return
    thread = t
  }
  const prs = associatedPrs(thread)
  // Detect newly-merged PRs and enqueue pending deliveries with frozen bodies.
  let added = false
  for (const pr of prs) {
    if (pr.state !== 'merged') continue
    const eventId = prMergedEventId(sub.threadId, pr)
    if (sub.delivered.includes(eventId) || sub.pending.some((p) => p.eventId === eventId)) continue
    const payload = buildPrMergedPayload(thread, pr, prs, sub.project)
    sub.pending.push({eventId, body: JSON.stringify(payload), attempts: 0})
    added = true
    log('info', `pr-poll enqueued event=${eventId} thread=${sub.threadId}`)
  }
  if (added) {
    // Persist before the first POST so retries and restarts send identical bytes.
    await persistPrWatches(cfg)
  }
  // Deliver pending oldest first.
  for (const pending of [...sub.pending]) {
    // Identity-safe: bail if the sub was replaced or removed during an await.
    if (state.prWatches.get(key) !== sub) return
    const result = await postWebhook(sub.url, pending.eventId, pending.body)
    if (state.prWatches.get(key) !== sub) return
    if (result === 'delivered' || result === 'conflict') {
      sub.pending = sub.pending.filter((p) => p.eventId !== pending.eventId)
      if (!sub.delivered.includes(pending.eventId)) sub.delivered.push(pending.eventId)
      await persistPrWatches(cfg)
      log('info', `pr-poll ${result} event=${pending.eventId} thread=${sub.threadId}`)
    } else if (result === 'retry') {
      pending.attempts += 1
      await persistPrWatches(cfg)
      log('warn', `pr-poll retry event=${pending.eventId} thread=${sub.threadId} attempts=${pending.attempts}`)
      return // stop this sub's deliveries for this cycle
    } else {
      // rejected: drop the whole sub.
      log('warn', `pr-poll rejected event=${pending.eventId} thread=${sub.threadId}; dropping sub`)
      state.prWatches.delete(key)
      await persistPrWatches(cfg)
      return
    }
  }
  // After delivering: if pending is empty, ≥1 associated PR, every one merged or closed, and ≥1 merged,
  // remove the sub. A sub with only closed PRs, or no PRs, stays armed so a replacement PR is caught.
  if (state.prWatches.get(key) !== sub) return
  if (sub.pending.length === 0 && prs.length >= 1) {
    const anyMerged = prs.some((p) => p.state === 'merged')
    const allDone = prs.every((p) => p.state === 'merged' || p.state === 'closed')
    if (anyMerged && allDone) {
      log('info', `pr-poll all associated PRs merged/closed thread=${sub.threadId}; removing sub`)
      state.prWatches.delete(key)
      await persistPrWatches(cfg)
    }
  }
}

function lastAssistantText(messages, runId) {
  const forRun = messages.filter((m) => m.role === 'assistant' && (runId ? m.runId === runId : true))
  const last = forRun[forRun.length - 1]
  return last?.text ?? ''
}

function truncate(s, max) {
  if (typeof s !== 'string') return ''
  if (s.length <= max) return s
  return s.slice(0, max) + '…'
}

// Keeps the end of a reply: a thread's structured result block comes last.
function truncateTail(s, max) {
  if (typeof s !== 'string') return ''
  if (s.length <= max) return s
  return '…' + s.slice(s.length - max)
}

function truncateMessages(messages, maxCount) {
  const list = Array.isArray(messages) ? messages.slice(-maxCount) : []
  return list.map((m) => ({
    role: m.role ?? '',
    runId: m.runId ?? '',
    text: truncate(m.text ?? '', 2000),
  }))
}

function sanitizeKey(s) {
  // [A-Za-z0-9._:-], ≤128 chars, start alnum.
  let cleaned = s.replace(/[^A-Za-z0-9._:-]/g, '')
  cleaned = cleaned.replace(/^[^A-Za-z0-9]+/, '')
  return cleaned.slice(0, 128)
}

// ─── Watch persistence ───────────────────────────────────────────────────────

const state = {
  watches: new Map(),
  prWatches: new Map(),
  artifacts: new Map(),
  pollRunning: false,
  pollTimer: null,
  prPollRunning: false,
  prPollTimer: null,
}

async function loadWatches(cfg) {
  const file = path.join(cfg.stateDir, 'watches.json')
  try {
    const raw = await fs.readFile(file, 'utf8')
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      for (const w of arr) {
        if (w && typeof w.threadId === 'string' && typeof w.url === 'string') {
          state.watches.set(w.threadId, {...w, needsInputFired: w.needsInputFired ?? false})
        }
      }
    }
    log('info', `loaded ${state.watches.size} watches from ${file}`)
  } catch (err) {
    if (err.code !== 'ENOENT') log('warn', `could not load watches: ${err.message}`)
  }
}

function persistWatches(cfg) {
  const file = path.join(cfg.stateDir, 'watches.json')
  const arr = [...state.watches.values()]
  // Atomic write: temp file + rename.
  fs.mkdir(cfg.stateDir, {recursive: true})
    .then(() => fs.writeFile(file + '.tmp', JSON.stringify(arr, null, 2)))
    .then(() => fs.rename(file + '.tmp', file))
    .catch((err) => log('warn', `could not persist watches: ${err.message}`))
}

// ─── PR merge subscription persistence ───────────────────────────────────────
//
// A subscription = {threadId, url, project, createdAt, delivered: [eventId…], pending: [{eventId, body, attempts}]}
// Keyed by `${threadId}\n${url}` in state.prWatches. `body` is the exact JSON string sent on the wire so
// retries and restarts produce byte-identical requests.

function prWatchKey(threadId, url) {
  return `${threadId}\n${url}`
}

async function armPrWatch(cfg, threadId, url, project) {
  const key = prWatchKey(threadId, url)
  if (state.prWatches.has(key)) {
    // Keep the existing sub so its delivery history survives a re-arm.
    return
  }
  const sub = {
    threadId,
    url,
    project,
    createdAt: new Date().toISOString(),
    delivered: [],
    pending: [],
  }
  state.prWatches.set(key, sub)
  await persistPrWatches(cfg)
  log('info', `pr-watch armed thread=${threadId} url=${redactUrl(url)} project=${project}`)
}

async function loadPrWatches(cfg) {
  const file = path.join(cfg.stateDir, 'pr-watches.json')
  try {
    const raw = await fs.readFile(file, 'utf8')
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      for (const s of arr) {
        if (!validPrSub(s)) continue
        state.prWatches.set(prWatchKey(s.threadId, s.url), {
          threadId: s.threadId,
          url: s.url,
          project: s.project,
          createdAt: s.createdAt ?? new Date().toISOString(),
          delivered: s.delivered,
          pending: s.pending,
        })
      }
    }
    log('info', `loaded ${state.prWatches.size} pr-watches from ${file}`)
  } catch (err) {
    if (err.code !== 'ENOENT') log('warn', `could not load pr-watches: ${err.message}`)
  }
}

function validPrSub(s) {
  if (!s || typeof s.threadId !== 'string' || typeof s.url !== 'string' || typeof s.project !== 'string') return false
  if (!Array.isArray(s.delivered) || !s.delivered.every((e) => typeof e === 'string')) return false
  if (!Array.isArray(s.pending)) return false
  for (const p of s.pending) {
    if (
      !p ||
      typeof p.eventId !== 'string' ||
      typeof p.body !== 'string' ||
      typeof p.attempts !== 'number' ||
      !Number.isFinite(p.attempts)
    ) {
      return false
    }
  }
  return true
}

// Serialized atomic writer: a promise chain where each write snapshots the map at write time,
// writes `.tmp`, then renames. Failures are logged and never reject the chain. Awaitable.
let prWatchesWriteChain = Promise.resolve()

function persistPrWatches(cfg) {
  const file = path.join(cfg.stateDir, 'pr-watches.json')
  const snapshot = [...state.prWatches.values()]
  prWatchesWriteChain = prWatchesWriteChain
    .catch(() => {})
    .then(() => fs.mkdir(cfg.stateDir, {recursive: true}))
    .then(() => fs.writeFile(file + '.tmp', JSON.stringify(snapshot, null, 2)))
    .then(() => fs.rename(file + '.tmp', file))
    .catch((err) => log('warn', `could not persist pr-watches: ${err.message}`))
  return prWatchesWriteChain
}

// ─── Artifact mapping persistence ────────────────────────────────────────────

async function loadArtifacts(cfg) {
  const file = path.join(cfg.stateDir, 'artifacts.json')
  try {
    const raw = await fs.readFile(file, 'utf8')
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      for (const a of arr) {
        if (a && typeof a.threadId === 'string' && typeof a.artifactId === 'string') {
          state.artifacts.set(a.threadId, a)
        }
      }
    }
    log('info', `loaded ${state.artifacts.size} artifact mappings from ${file}`)
  } catch (err) {
    if (err.code !== 'ENOENT') log('warn', `could not load artifacts: ${err.message}`)
  }
}

function persistArtifacts(cfg) {
  const file = path.join(cfg.stateDir, 'artifacts.json')
  const arr = [...state.artifacts.values()]
  fs.mkdir(cfg.stateDir, {recursive: true})
    .then(() => fs.writeFile(file + '.tmp', JSON.stringify(arr, null, 2)))
    .then(() => fs.rename(file + '.tmp', file))
    .catch((err) => log('warn', `could not persist artifacts: ${err.message}`))
}

function newArtifactId() {
  return crypto.randomBytes(ARTIFACT_ID_BYTES).toString('base64url')
}

function artifactBaseUrl(cfg, req) {
  if (cfg.artifactsBaseUrl) return cfg.artifactsBaseUrl
  // Derive from the incoming request Host header so the URL is reachable from the agent.
  const host = req?.headers?.get('host') ?? `127.0.0.1:${cfg.port}`
  return `http://${host}`
}

async function createArtifactDir(cfg, req) {
  const artifactId = newArtifactId()
  const dir = path.join(cfg.artifactsDir, artifactId)
  await fs.mkdir(dir, {recursive: true, mode: 0o755})
  const baseUrl = artifactBaseUrl(cfg, req)
  return {artifactId, dir, baseUrl}
}

async function listArtifacts(cfg, threadId) {
  const mapping = state.artifacts.get(threadId)
  if (!mapping) return []
  try {
    const entries = await fs.readdir(mapping.dir)
    const files = []
    for (const name of entries) {
      if (files.length >= ARTIFACT_MAX_FILES) break
      if (name.startsWith('.')) continue
      if (!ARTIFACT_NAME_RE.test(name)) continue
      const ext = name.split('.').pop()?.toLowerCase() ?? ''
      if (!ARTIFACT_EXT.has(ext)) continue
      const full = path.join(mapping.dir, name)
      let st
      try {
        st = await fs.lstat(full)
      } catch {
        continue
      }
      if (!st.isFile()) continue // skips symlinks (lstat) and dirs
      if (st.size > cfg.artifactMaxFileBytes) continue
      files.push({name, bytes: st.size, contentType: ARTIFACT_CONTENT_TYPES[ext] ?? 'application/octet-stream'})
    }
    files.sort((a, b) => a.name.localeCompare(b.name))
    return files.map((f) => ({
      name: f.name,
      url: `${mapping.baseUrl}/artifacts/${mapping.artifactId}/${encodeURIComponent(f.name)}`,
      bytes: f.bytes,
      contentType: f.contentType,
    }))
  } catch {
    return []
  }
}

// ─── MCP JSON-RPC dispatch ────────────────────────────────────────────────────

function jsonRpcError(id, code, message, data) {
  const err = {code, message}
  if (data !== undefined) err.data = data
  return {jsonrpc: '2.0', id, error: err}
}

function jsonRpcResult(id, result) {
  return {jsonrpc: '2.0', id, result}
}

function isNotification(msg) {
  return msg && (msg.id === null || msg.id === undefined) && typeof msg.method === 'string'
}

async function handleRpc(cfg, msg, req) {
  if (!msg || typeof msg !== 'object' || typeof msg.method !== 'string') {
    return jsonRpcError(msg?.id ?? null, -32600, 'Invalid Request')
  }
  const {id, method, params} = msg
  // Notifications get HTTP 202 empty (handled by caller); but if dispatched here, return null.
  if (isNotification(msg)) return null
  try {
    switch (method) {
      case 'initialize':
        return handleInitialize(id, params)
      case 'notifications/initialized':
        return null
      case 'ping':
        return jsonRpcResult(id, {})
      case 'tools/list':
        return jsonRpcResult(id, {tools: TOOLS})
      case 'tools/call':
        return await handleToolCall(cfg, id, params, req)
      default:
        return jsonRpcError(id, -32601, 'Method not found')
    }
  } catch (err) {
    const code = err.code === -32602 ? -32602 : -32603
    return jsonRpcError(id, code, err.message || 'Internal error')
  }
}

function handleInitialize(id, params) {
  const requested = params?.protocolVersion
  const protocolVersion =
    typeof requested === 'string' && SUPPORTED_PROTOCOL_VERSIONS.has(requested) ? requested : DEFAULT_PROTOCOL_VERSION
  return jsonRpcResult(id, {
    protocolVersion,
    capabilities: {tools: {listChanged: false}},
    serverInfo: {name: 't3-mcp', version: SERVER_VERSION},
  })
}

async function handleToolCall(cfg, id, params, req) {
  const name = params?.name
  const args = params?.arguments ?? {}
  if (typeof name !== 'string') {
    return jsonRpcError(id, -32602, 'Missing tool name')
  }
  const tool = TOOLS.find((t) => t.name === name)
  if (!tool) return jsonRpcError(id, -32602, `Unknown tool: ${name}`)
  try {
    const result = await dispatchTool(cfg, name, args, req)
    return jsonRpcResult(id, {
      content: [{type: 'text', text: JSON.stringify(result, null, 2)}],
      structuredContent: result,
    })
  } catch (err) {
    if (err instanceof ToolError) {
      return jsonRpcResult(id, {isError: true, content: [{type: 'text', text: err.message}]})
    }
    return jsonRpcResult(id, {isError: true, content: [{type: 'text', text: err.message || 'tool error'}]})
  }
}

async function dispatchTool(cfg, name, args, req) {
  switch (name) {
    case 'list_threads':
      return toolListThreads(cfg, args)
    case 'start_thread':
      return toolStartThread(cfg, args, req)
    case 'send_message':
      return toolSendMessage(cfg, args)
    case 'get_thread':
      return toolGetThread(cfg, args)
    case 'watch_thread':
      return toolWatchThread(cfg, args)
    case 'unwatch_thread':
      return toolUnwatchThread(cfg, args)
    default:
      throw new ToolError(`Unknown tool: ${name}`)
  }
}

// ─── HTTP server ─────────────────────────────────────────────────────────────

function authorize(cfg, req) {
  const auth = req.headers.get('authorization') ?? ''
  const m = /^Bearer\s+(.+)$/.exec(auth)
  if (!m || m[1] === undefined) return false
  return timingSafeEqualStr(m[1], cfg.token)
}

function jsonResp(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'content-type': 'application/json'},
  })
}

async function handleRequest(cfg, req) {
  const url = new URL(req.url)
  if (url.pathname === '/health' && req.method === 'GET') {
    return jsonResp(200, {status: 'ok'})
  }
  // Artifact capability URL: GET/HEAD /artifacts/<id>/<name> — no bearer auth.
  if (url.pathname.startsWith('/artifacts/')) {
    return handleArtifactRequest(cfg, url, req)
  }
  if (url.pathname === '/mcp') {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return new Response(null, {status: 405})
    }
    if (req.method !== 'POST') {
      return new Response(null, {status: 405})
    }
    if (!authorize(cfg, req)) {
      return jsonResp(401, {jsonrpc: '2.0', id: null, error: {code: -32001, message: 'Unauthorized'}})
    }
    let body
    try {
      body = await req.json()
    } catch {
      return jsonResp(400, {jsonrpc: '2.0', id: null, error: {code: -32700, message: 'Parse error'}})
    }
    // Batch or single.
    if (Array.isArray(body)) {
      const results = []
      for (const msg of body) {
        const r = await handleRpc(cfg, msg, req)
        if (r) results.push(r)
      }
      if (results.length === 0) return new Response(null, {status: 202})
      return jsonResp(200, results)
    }
    const r = await handleRpc(cfg, body, req)
    if (r === null) return new Response(null, {status: 202})
    return jsonResp(200, r)
  }
  return new Response(null, {status: 404})
}

// ─── Artifact capability URL handler ─────────────────────────────────────────
// GET/HEAD /artifacts/<id>/<name> — no bearer auth (capability URL). The port is
// only reachable on the internal Docker network. Validates id/name and streams
// the file without buffering it in memory.

async function handleArtifactRequest(cfg, url, req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return new Response(null, {status: 405})
  }
  // pathname = /artifacts/<id>/<name>
  const rest = url.pathname.slice('/artifacts/'.length)
  const slash = rest.indexOf('/')
  if (slash < 0) return artifactNotFound()
  const id = rest.slice(0, slash)
  const name = rest.slice(slash + 1)
  if (!ARTIFACT_ID_RE.test(id)) return artifactNotFound()
  if (!name || !ARTIFACT_NAME_RE.test(name)) return artifactNotFound()
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (!ARTIFACT_EXT.has(ext)) return artifactNotFound()
  // Look up the mapping by artifactId (state.artifacts is keyed by threadId).
  let entry = null
  for (const m of state.artifacts.values()) {
    if (m.artifactId === id) {
      entry = m
      break
    }
  }
  if (!entry) return artifactNotFound()
  const full = path.join(entry.dir, name)
  // Resolve and ensure the real path is inside the mapped dir (no traversal).
  const dirResolved = path.resolve(entry.dir)
  const fullResolved = path.resolve(full)
  if (!fullResolved.startsWith(dirResolved + path.sep)) return artifactNotFound()
  let st
  try {
    st = await fs.lstat(fullResolved)
  } catch {
    return artifactNotFound()
  }
  // lstat rejects symlinks at this path (lstat does not follow); require a regular file.
  if (!st.isFile()) return artifactNotFound()
  if (st.size > cfg.artifactMaxFileBytes) return artifactNotFound()
  const contentType = ARTIFACT_CONTENT_TYPES[ext] ?? 'application/octet-stream'
  const headers = {
    'content-type': contentType,
    'content-length': String(st.size),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  }
  if (req.method === 'HEAD') {
    return new Response(null, {status: 200, headers})
  }
  return new Response(Readable.toWeb(createReadStream(fullResolved)), {status: 200, headers})
}

function artifactNotFound() {
  return jsonResp(404, {error: {message: 'not found'}})
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const cfg = parseConfig()
  await loadWatches(cfg)
  await loadPrWatches(cfg)
  await loadArtifacts(cfg)
  const server = http.createServer(async (req, res) => {
    // Adapt Node IncomingMessage to a fetch-style Request for the handler.
    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) for (const vv of v) headers.append(k, vv)
      else if (typeof v === 'string') headers.set(k, v)
    }
    // Bodies are read before auth runs, so they are capped here.
    const chunks = []
    let size = 0
    for await (const c of req) {
      size += c.length
      if (size > MAX_REQUEST_BODY_BYTES) {
        res.writeHead(413, {'content-type': 'application/json'})
        res.end(JSON.stringify({error: {message: 'request body too large'}}))
        req.destroy()
        return
      }
      chunks.push(c)
    }
    const buf = Buffer.concat(chunks)
    const fetchReq = new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
      method: req.method,
      headers,
      body: req.method === 'POST' ? buf : undefined,
    })
    let fetchRes
    try {
      fetchRes = await handleRequest(cfg, fetchReq)
    } catch (err) {
      log('error', `handler: ${err.message}`)
      fetchRes = jsonResp(500, {error: {message: 'internal error'}})
    }
    res.statusCode = fetchRes.status
    for (const [k, v] of fetchRes.headers.entries()) res.setHeader(k, v)
    if (fetchRes.body) {
      // Stream the body instead of buffering (artifact files can be up to 50 MiB).
      const nodeStream = Readable.fromWeb(fetchRes.body)
      nodeStream.on('error', (err) => {
        log('error', `response stream: ${err.message}`)
        res.destroy()
      })
      nodeStream.pipe(res)
    } else {
      res.end()
    }
  })
  server.listen(cfg.port, cfg.hostname, () => {
    const addr = server.address()
    const actualPort = typeof addr === 'object' && addr ? addr.port : cfg.port
    log('info', `t3-mcp listening on http://${cfg.hostname}:${actualPort}`)
  })
  // Start the run-watch poll loop.
  state.pollTimer = setInterval(
    () => {
      pollLoop(cfg).catch((err) => log('error', `pollLoop: ${err.message}`))
    },
    Math.max(1, cfg.pollSecs) * 1000,
  )
  // Start the PR merge poll loop on its own timer.
  state.prPollTimer = setInterval(
    () => {
      prPollLoop(cfg).catch((err) => log('error', `prPollLoop: ${err.message}`))
    },
    Math.max(1, cfg.prPollSecs) * 1000,
  )
  // Graceful shutdown.
  const shutdown = () => {
    clearInterval(state.pollTimer)
    clearInterval(state.prPollTimer)
    server.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error(`fatal: ${err.message}`)
  process.exit(1)
})

export {
  parseConfig,
  handleRequest,
  TOOLS,
  dispatchTool,
  armWatch,
  unwatch,
  pollOne,
  fireNotification,
  postWebhook,
  armPrWatch,
  prPollOne,
  prPollLoop,
  loadPrWatches,
  persistPrWatches,
  prWatchKey,
  prMergedEventId,
  createArtifactDir,
  listArtifacts,
  persistArtifacts,
  loadArtifacts,
  state,
}
