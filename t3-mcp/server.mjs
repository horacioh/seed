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

const SERVER_VERSION = '0.1.0'
const SUPPORTED_PROTOCOL_VERSIONS = new Set(['2025-06-18', '2025-03-26', '2024-11-05'])
const DEFAULT_PROTOCOL_VERSION = '2025-06-18'
const CLI_TIMEOUT_MS = 60_000
const MAX_STDERR_BYTES = 2048
/** Cap on an incoming /mcp request body. */
const MAX_REQUEST_BODY_BYTES = 1024 * 1024
const MAX_WEBHOOK_BODY_BYTES = 60 * 1024
const MAX_INFLIGHT_CLI = 4

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
  return {
    token,
    hostname: env.T3_MCP_HOST ?? '0.0.0.0',
    port: parseInt(env.T3_MCP_PORT ?? '3774', 10),
    t3Bin,
    projects,
    defaultProject: projects[0],
    webhookPrefixes,
    stateDir,
    pollSecs: parseInt(env.T3_MCP_POLL_SECS ?? '15', 10),
  }
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
      'Start a new T3 Code thread with an initial message. The thread runs with the project runtime mode (full access for the seed project). Pass notifyWebhookUrl to be notified when the run finishes.',
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
        provider: {type: 'string', description: 'Provider instance id. Must be given with --model.'},
        model: {type: 'string', description: 'Model slug. Must be given with --provider.'},
        notifyWebhookUrl: {
          type: 'string',
          description:
            'https URL (matching an allowed prefix) to POST a thread.finished event to when the run completes.',
        },
      },
    },
  },
  {
    name: 'send_message',
    description:
      'Send a message to an existing T3 Code thread. A busy thread queues it as its next turn. Pass notifyWebhookUrl to be notified when the run finishes.',
    inputSchema: {
      type: 'object',
      required: ['threadId', 'message'],
      properties: {
        threadId: {type: 'string', description: 'Thread id.'},
        message: {type: 'string', description: 'Message for the agent.'},
        notifyWebhookUrl: {
          type: 'string',
          description:
            'https URL (matching an allowed prefix) to POST a thread.finished event to when the run completes.',
        },
      },
    },
  },
  {
    name: 'get_thread',
    description: 'Read a T3 Code thread: its status, branch, run info, and recent messages.',
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
      'Arm a notification for a thread next finished run (or immediately if already idle with a run never notified to that URL).',
    inputSchema: {
      type: 'object',
      required: ['threadId', 'notifyWebhookUrl'],
      properties: {
        threadId: {type: 'string', description: 'Thread id.'},
        notifyWebhookUrl: {
          type: 'string',
          description: 'https URL (matching an allowed prefix) to POST events to.',
        },
      },
    },
  },
  {
    name: 'unwatch_thread',
    description: 'Remove any armed notification for a thread.',
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

async function toolStartThread(cfg, args) {
  const project = args.project ?? cfg.defaultProject
  assertProjectAllowed(cfg, project)
  if ((args.provider && !args.model) || (args.model && !args.provider)) {
    throw new ToolError('provider and model must be given together')
  }
  const cliArgs = ['thread', 'start']
  if (args.title) cliArgs.push('--title', args.title)
  if (args.provider && args.model) cliArgs.push('--provider', args.provider, '--model', args.model)
  if (args.worktree) cliArgs.push('--worktree', args.worktree)
  if (args.branch) cliArgs.push('--branch', args.branch)
  cliArgs.push('--json', project, '-')
  const {stdout} = await runCli(cfg, cliArgs, {stdin: args.message})
  let threadId
  let title = args.title ?? ''
  let link = ''
  let status = 'running'
  // Prefer JSON output; fall back to parsing a bare id from text.
  try {
    const obj = JSON.parse(stdout)
    threadId = obj.threadId ?? obj.id ?? obj.thread?.threadId
    title = title || (obj.title ?? obj.thread?.title ?? '')
    link = obj.link ?? obj.thread?.link ?? ''
    status = obj.status ?? obj.thread?.status ?? 'running'
  } catch {
    threadId = stdout.trim().split(/\s+/)[0]
  }
  if (!threadId) throw new ToolError('thread start did not return a thread id')
  let watching = false
  if (args.notifyWebhookUrl) {
    assertWebhookAllowed(cfg, args.notifyWebhookUrl)
    const data = await showThread(cfg, threadId, 3)
    title = title || (data.thread?.title ?? '')
    link = link || (data.thread?.link ?? '')
    status = data.thread?.status ?? status
    // Every run of a brand-new thread is one this call started, so any finished run counts.
    armWatch(cfg, threadId, args.notifyWebhookUrl, null)
    watching = true
  }
  return {threadId, title, link, status, watching}
}

async function toolSendMessage(cfg, args) {
  // The run that exists before sending is not the one this message starts, so it is the watch's baseline.
  const before = await assertThreadAllowed(cfg, args.threadId)
  let watching = false
  if (args.notifyWebhookUrl) {
    assertWebhookAllowed(cfg, args.notifyWebhookUrl)
  }
  const {stdout} = await runCli(cfg, ['thread', 'send', '--json', args.threadId, '-'], {stdin: args.message})
  let status = 'running'
  try {
    const obj = JSON.parse(stdout)
    status = obj.status ?? obj.thread?.status ?? 'running'
  } catch {
    // text reply — status unknown, assume running
  }
  if (args.notifyWebhookUrl) {
    armWatch(cfg, args.threadId, args.notifyWebhookUrl, before.thread?.latestRunId ?? null)
    watching = true
  }
  return {threadId: args.threadId, status, watching}
}

async function toolGetThread(cfg, args) {
  const data = await assertThreadAllowed(cfg, args.threadId)
  const messages = clampInt(args.messages, 5, 1, 50)
  if (messages !== 3) {
    // re-fetch with the requested message count
    const full = await showThread(cfg, args.threadId, messages)
    return {thread: full.thread, messages: full.messages ?? []}
  }
  return {thread: data.thread, messages: data.messages ?? []}
}

async function toolWatchThread(cfg, args) {
  await assertThreadAllowed(cfg, args.threadId)
  assertWebhookAllowed(cfg, args.notifyWebhookUrl)
  // No baseline: notify for the run in progress, or right away for the latest run of an idle thread.
  armWatch(cfg, args.threadId, args.notifyWebhookUrl, null)
  return {threadId: args.threadId, watching: true}
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
  const had = state.watches.delete(threadId)
  if (had) persistWatches(cfg)
  return had
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
    lastAssistantMessage: truncate(lastAssistant, 4000),
    messages: truncateMessages(messages, 8),
  }
  const body = Buffer.from(JSON.stringify(payload))
  if (body.length > MAX_WEBHOOK_BODY_BYTES) {
    log('warn', `webhook body ${body.length}B exceeds ${MAX_WEBHOOK_BODY_BYTES}B; dropping`)
    return false
  }
  log('info', `notify event=${event} thread=${watch.threadId} key=${idempotencyKey}`)
  try {
    const res = await fetch(watch.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body,
      signal: AbortSignal.timeout(15_000),
    })
    if (res.status >= 200 && res.status < 300) {
      log('info', `notify ${res.status} thread=${watch.threadId} event=${event}`)
      return true
    }
    if (res.status >= 400 && res.status < 500) {
      log('warn', `notify ${res.status} (4xx) dropping watch thread=${watch.threadId}`)
      state.watches.delete(watch.threadId)
      persistWatches(cfg)
      return true // treated as resolved so the caller does not retry
    }
    log('warn', `notify ${res.status} (5xx) will retry thread=${watch.threadId}`)
    return false
  } catch (err) {
    log('warn', `notify network error will retry thread=${watch.threadId}: ${err.message}`)
    return false
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
  pollRunning: false,
  pollTimer: null,
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

async function handleRpc(cfg, msg) {
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
        return await handleToolCall(cfg, id, params)
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

async function handleToolCall(cfg, id, params) {
  const name = params?.name
  const args = params?.arguments ?? {}
  if (typeof name !== 'string') {
    return jsonRpcError(id, -32602, 'Missing tool name')
  }
  const tool = TOOLS.find((t) => t.name === name)
  if (!tool) return jsonRpcError(id, -32602, `Unknown tool: ${name}`)
  try {
    const result = await dispatchTool(cfg, name, args)
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

async function dispatchTool(cfg, name, args) {
  switch (name) {
    case 'list_threads':
      return toolListThreads(cfg, args)
    case 'start_thread':
      return toolStartThread(cfg, args)
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
        const r = await handleRpc(cfg, msg)
        if (r) results.push(r)
      }
      if (results.length === 0) return new Response(null, {status: 202})
      return jsonResp(200, results)
    }
    const r = await handleRpc(cfg, body)
    if (r === null) return new Response(null, {status: 202})
    return jsonResp(200, r)
  }
  return new Response(null, {status: 404})
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const cfg = parseConfig()
  await loadWatches(cfg)
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
      const ab = await fetchRes.arrayBuffer()
      res.end(Buffer.from(ab))
    } else {
      res.end()
    }
  })
  server.listen(cfg.port, cfg.hostname, () => {
    const addr = server.address()
    const actualPort = typeof addr === 'object' && addr ? addr.port : cfg.port
    log('info', `t3-mcp listening on http://${cfg.hostname}:${actualPort}`)
  })
  // Start the poll loop.
  state.pollTimer = setInterval(
    () => {
      pollLoop(cfg).catch((err) => log('error', `pollLoop: ${err.message}`))
    },
    Math.max(1, cfg.pollSecs) * 1000,
  )
  // Graceful shutdown.
  const shutdown = () => {
    clearInterval(state.pollTimer)
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

export {parseConfig, handleRequest, TOOLS, dispatchTool, armWatch, unwatch, pollOne, fireNotification}
