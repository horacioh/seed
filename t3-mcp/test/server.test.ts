import {afterEach, beforeEach, describe, expect, test} from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const SERVER = path.join(import.meta.dir, '..', 'server.mjs')
const FAKE_T3 = path.join(import.meta.dir, 'fake-t3.mjs')

function makeConfig(overrides = {}) {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 't3-mcp-test-'))
  const statePath = path.join(stateDir, 'state.json')
  fs.writeFileSync(statePath, JSON.stringify({threads: {}}))
  return {
    token: 'test-token',
    hostname: '127.0.0.1',
    port: 0,
    t3Bin: JSON.stringify(['node', FAKE_T3]),
    projects: ['proj-allowed'],
    defaultProject: 'proj-allowed',
    webhookPrefixes: ['https://example.com/hook/'],
    stateDir,
    pollSecs: 1,
    prPollSecs: 1,
    statePath,
    ...overrides,
  }
}

async function startServer(cfg) {
  const env = {
    ...process.env,
    T3_MCP_TOKEN: cfg.token,
    T3_MCP_HOST: cfg.hostname,
    T3_MCP_PORT: String(cfg.port),
    T3_MCP_T3_BIN: cfg.t3Bin,
    T3_MCP_PROJECTS: cfg.projects.join(','),
    T3_MCP_WEBHOOK_PREFIXES: cfg.webhookPrefixes.join(','),
    T3_MCP_STATE_DIR: cfg.stateDir,
    T3_MCP_POLL_SECS: String(cfg.pollSecs),
    T3_MCP_PR_POLL_SECS: String(cfg.prPollSecs),
    T3_FAKE_STATE: cfg.statePath,
    ...(cfg.extraEnv ?? {}),
  }
  const proc = Bun.spawn(['node', SERVER], {env, stdout: 'pipe', stderr: 'pipe'})
  // Wait for the server to listen by reading stderr line by line.
  const reader = proc.stderr.getReader()
  const decoder = new TextDecoder()
  let base = ''
  let acc = ''
  for (let i = 0; i < 60 && !base; i++) {
    const {value, done} = await reader.read()
    if (done) break
    acc += decoder.decode(value, {stream: true})
    const m = /listening on http:\/\/([^\s]+)/.exec(acc)
    if (m) {
      const hostPort = m[1].split('/')[0]
      base = `http://${hostPort}`
    }
  }
  reader.releaseLock()
  if (!base) throw new Error('server did not start')
  return {
    base,
    stop: async () => {
      proc.kill('SIGTERM')
      await proc.exited.catch(() => {})
    },
  }
}

function authHeaders(base, key = 'test-token') {
  return {authorization: `Bearer ${key}`, 'content-type': 'application/json'}
}

async function rpc(base, msg, headers = authHeaders()) {
  const res = await fetch(`${base}/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify(msg),
  })
  return {status: res.status, body: await res.json()}
}

async function mcpClient(base, token = 'test-token') {
  const transport = new StreamableHTTPClientTransport(new URL(`${base}/mcp`), {
    requestInit: {headers: {authorization: `Bearer ${token}`}},
  })
  const client = new Client({name: 'test-client', version: '1.0.0'})
  await client.connect(transport, {timeout: 5000})
  return {client, transport, close: async () => client.close()}
}

function seedThread(statePath, thread) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  state.threads[thread.threadId] = thread
  atomicWriteJson(statePath, JSON.stringify(state))
}

function readState(statePath) {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'))
}

// Atomic JSON write: tmp file + rename. The fake CLI treats a half-written state file as
// {threads:{}}, which would read as "no longer available" and drop subs mid-poll.
function atomicWriteJson(filePath, json) {
  const tmp = filePath + '.tmp'
  fs.writeFileSync(tmp, json)
  fs.renameSync(tmp, filePath)
}

function updateState(statePath, fn) {
  const state = readState(statePath)
  fn(state)
  atomicWriteJson(statePath, JSON.stringify(state))
  return state
}

// A fake webhook receiver that mimics the Seed agents server's idempotency rule:
// same Idempotency-Key + same raw body → 202 {duplicate:true}; same key with a different body → 409.
// Records every attempt itself as {key, raw, status}. The override returns one of:
//   null            → normal dedupe handling (recorded in firings + attempts)
//   <status number> → answer that status, recorded in attempts but NOT in firings (e.g. fail-before 503)
//   'fail-after'    → store the firing in the real dedupe map if the key is absent, record the attempt
//                     with status 500, and answer 500 (models a lost response after durable recording)
function makeReceiver() {
  const firings = new Map() // activityKey → raw body bytes (as Buffer)
  const attempts = [] // {key, raw, status}
  let duplicates = 0
  let conflicts = 0
  let attemptOverride = null // (req, key, raw) => null | number | 'fail-after'
  const server = Bun.serve({
    port: 0,
    fetch: async (req) => {
      const key = req.headers.get('Idempotency-Key') ?? ''
      const raw = Buffer.from(await req.arrayBuffer())
      if (attemptOverride) {
        const ov = attemptOverride(req, key, raw)
        if (ov !== null && ov !== undefined) {
          if (ov === 'fail-after') {
            if (!firings.has(key)) firings.set(key, raw)
            attempts.push({key, raw, status: 500})
            return new Response('fail', {status: 500})
          }
          const status = typeof ov === 'number' ? ov : 503
          attempts.push({key, raw, status})
          return new Response('fail', {status})
        }
      }
      const existing = firings.get(key)
      let status = 202
      let respBody: any = {ok: true}
      if (existing) {
        if (existing.equals(raw)) {
          status = 202
          respBody = {duplicate: true}
          duplicates += 1
        } else {
          status = 409
          conflicts += 1
          respBody = {error: 'Idempotency key was already used with a different body'}
        }
      } else {
        firings.set(key, raw)
        status = 202
        respBody = {ok: true}
      }
      attempts.push({key, raw, status})
      return new Response(JSON.stringify(respBody), {status, headers: {'content-type': 'application/json'}})
    },
  })
  return {
    port: server.port,
    attempts,
    get duplicates() {
      return duplicates
    },
    get conflicts() {
      return conflicts
    },
    get firingCount() {
      return firings.size
    },
    stop: () => server.stop(),
    setOverride(fn) {
      attemptOverride = fn
    },
    clearOverride() {
      attemptOverride = null
    },
  }
}

describe('auth and health', () => {
  let stop, base
  beforeEach(async () => {
    const cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('GET /health is open', async () => {
    const res = await fetch(`${base}/health`)
    expect(res.status).toBe(200)
    expect((await res.json()).status).toBe('ok')
  })

  test('POST /mcp without auth returns 401', async () => {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'initialize', params: {}}),
    })
    expect(res.status).toBe(401)
  })

  test('POST /mcp with wrong token returns 401', async () => {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: {authorization: 'Bearer wrong', 'content-type': 'application/json'},
      body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'initialize', params: {}}),
    })
    expect(res.status).toBe(401)
  })

  test('GET /mcp returns 405', async () => {
    const res = await fetch(`${base}/mcp`)
    expect(res.status).toBe(405)
  })

  test('DELETE /mcp returns 405', async () => {
    const res = await fetch(`${base}/mcp`, {method: 'DELETE'})
    expect(res.status).toBe(405)
  })
})

describe('MCP protocol via real SDK client', () => {
  let stop, base, conn
  beforeEach(async () => {
    const cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
    conn = await mcpClient(base)
  })
  afterEach(async () => {
    await conn.close()
    await stop()
  })

  test('initialize returns server info and capabilities', async () => {
    const caps = conn.client.getServerCapabilities()
    expect(caps.tools).toBeDefined()
    const info = conn.client.getServerVersion()
    expect(info.name).toBe('t3-mcp')
  })

  test('tools/list returns all six tools', async () => {
    const {tools} = await conn.client.listTools()
    const names = tools.map((t) => t.name)
    expect(names.sort()).toEqual(
      ['get_thread', 'list_threads', 'send_message', 'start_thread', 'unwatch_thread', 'watch_thread'].sort(),
    )
  })

  test('watch_thread inputSchema has notifyEvents', async () => {
    const {tools} = await conn.client.listTools()
    const watch = tools.find((t) => t.name === 'watch_thread')
    expect(watch.inputSchema.properties.notifyEvents).toBeDefined()
  })

  test('ping succeeds', async () => {
    await conn.client.ping()
    expect(true).toBe(true)
  })
})

describe('list_threads', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
    seedThread(cfg.statePath, {
      threadId: 't1',
      projectId: 'proj-allowed',
      title: 'Thread One',
      status: 'completed',
      latestRunId: 'run:t1:1',
      activeRunId: null,
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })
  afterEach(async () => await stop())

  test('lists threads in the default project', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'list_threads', arguments: {}},
    })
    expect(body.result.structuredContent.threads.length).toBe(1)
    expect(body.result.structuredContent.threads[0].threadId).toBe('t1')
  })

  test('refuses a disallowed project', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'list_threads', arguments: {project: 'proj-forbidden'}},
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('allowlist')
  })
})

describe('start_thread', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('passes message via stdin and returns id/link', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'start_thread',
        arguments: {message: 'hello world\nsecond line', title: 'My Thread'},
      },
    })
    expect(body.result.structuredContent.threadId).toMatch(/^thread-/)
    expect(body.result.structuredContent.title).toBe('My Thread')
    expect(body.result.structuredContent.status).toBe('running')
    // Verify the message was passed via stdin (recorded in fake state), with the evidence block appended.
    const state = readState(cfg.statePath)
    const t = Object.values(state.threads)[0]
    expect(t.messages[0].text).toContain('hello world\nsecond line')
    expect(t.messages[0].text).toContain('Evidence directory:')
    expect(t.messages[0].text).toContain('before-*.png')
  })

  test('refuses a disallowed project', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'hi', project: 'proj-forbidden'}},
    })
    expect(body.result.isError).toBe(true)
  })

  test('provider/model must be given together', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'hi', provider: 'p'}},
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('together')
  })
})

describe('get_thread and project allowlist on threadId', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
    seedThread(cfg.statePath, {
      threadId: 't-ok',
      projectId: 'proj-allowed',
      title: 'OK',
      status: 'completed',
      latestRunId: 'run:t-ok:1',
      activeRunId: null,
      runCount: 1,
      pendingRequestCount: 0,
      messages: [{role: 'assistant', runId: 'run:t-ok:1', text: 'done'}],
    })
    seedThread(cfg.statePath, {
      threadId: 't-bad',
      projectId: 'proj-other',
      title: 'Bad',
      status: 'completed',
      latestRunId: 'run:t-bad:1',
      activeRunId: null,
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })
  afterEach(async () => await stop())

  test('get_thread returns thread and messages for an allowed project', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'get_thread', arguments: {threadId: 't-ok', messages: 5}},
    })
    expect(body.result.structuredContent.thread.threadId).toBe('t-ok')
    expect(body.result.structuredContent.messages.length).toBe(1)
  })

  test('get_thread refuses a thread in a disallowed project', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'get_thread', arguments: {threadId: 't-bad'}},
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('not in an allowed project')
  })
})

describe('webhook prefix enforcement', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
    seedThread(cfg.statePath, {
      threadId: 't-w',
      projectId: 'proj-allowed',
      title: 'W',
      status: 'completed',
      latestRunId: 'run:t-w:1',
      activeRunId: null,
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })
  afterEach(async () => await stop())

  test('watch_thread rejects a URL not matching a prefix', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'watch_thread', arguments: {threadId: 't-w', notifyWebhookUrl: 'https://evil.com/hook'}},
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('prefix')
  })

  test('watch_thread accepts a URL matching a prefix', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'watch_thread', arguments: {threadId: 't-w', notifyWebhookUrl: 'https://example.com/hook/abc'}},
    })
    expect(body.result.structuredContent.watching).toBe(true)
  })
})

describe('watcher fires once after thread finishes', () => {
  let stop, base, cfg, webhookPort, deliveries
  beforeEach(async () => {
    cfg = makeConfig({pollSecs: 1})
    // Fake webhook receiver.
    deliveries = []
    const wh = Bun.serve({
      port: 0,
      fetch: async (req) => {
        const idem = req.headers.get('Idempotency-Key') ?? ''
        const body = await req.json()
        deliveries.push({idem, body})
        return new Response('ok', {status: 200})
      },
    })
    webhookPort = wh.port
    cfg.webhookPrefixes = [`http://127.0.0.1:${webhookPort}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      wh.stop()
    }
    seedThread(cfg.statePath, {
      threadId: 't-run',
      projectId: 'proj-allowed',
      title: 'Running',
      status: 'running',
      latestRunId: 'run:t-run:1',
      activeRunId: 'run:t-run:1',
      runCount: 1,
      pendingRequestCount: 0,
      messages: [{role: 'assistant', runId: 'run:t-run:1', text: 'working'}],
    })
  })
  afterEach(async () => await stop())

  test('fires thread.finished exactly once with correct Idempotency-Key + payload', async () => {
    const url = `http://127.0.0.1:${webhookPort}/hook/t-run`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'watch_thread', arguments: {threadId: 't-run', notifyWebhookUrl: url}},
    })
    // Flip the thread to idle with a new run.
    const state = readState(cfg.statePath)
    state.threads['t-run'].activeRunId = null
    state.threads['t-run'].latestRunId = 'run:t-run:2'
    state.threads['t-run'].status = 'completed'
    // A long reply keeps its end, where the structured result block is.
    state.threads['t-run'].messages = [
      {role: 'assistant', runId: 'run:t-run:2', text: 'x'.repeat(5000) + 'finished result'},
    ]
    atomicWriteJson(cfg.statePath, JSON.stringify(state))
    // Wait for the poll (1s) + fetch.
    for (let i = 0; i < 30 && deliveries.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 200))
    }
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.event).toBe('thread.finished')
    expect(deliveries[0].body.threadId).toBe('t-run')
    expect(deliveries[0].body.runId).toBe('run:t-run:2')
    expect(deliveries[0].body.lastAssistantMessage.endsWith('finished result')).toBe(true)
    expect(deliveries[0].body.lastAssistantMessage.length).toBe(4001)
    expect(deliveries[0].idem).toMatch(/^t3-t-run-run:t-run:2-thread\.finished$/)
    // Wait another poll cycle to confirm no duplicate fire.
    await new Promise((r) => setTimeout(r, 1500))
    expect(deliveries.length).toBe(1)
  })
})

describe('watcher needs_input event', () => {
  let stop, base, cfg, webhookPort, deliveries
  beforeEach(async () => {
    cfg = makeConfig({pollSecs: 1})
    deliveries = []
    const wh = Bun.serve({
      port: 0,
      fetch: async (req) => {
        deliveries.push({idem: req.headers.get('Idempotency-Key') ?? '', body: await req.json()})
        return new Response('ok', {status: 200})
      },
    })
    webhookPort = wh.port
    cfg.webhookPrefixes = [`http://127.0.0.1:${webhookPort}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      wh.stop()
    }
    seedThread(cfg.statePath, {
      threadId: 't-input',
      projectId: 'proj-allowed',
      title: 'Needs Input',
      status: 'running',
      latestRunId: 'run:t-input:1',
      activeRunId: 'run:t-input:1',
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })
  afterEach(async () => await stop())

  test('fires thread.needs_input when pendingRequestCount > 0', async () => {
    const url = `http://127.0.0.1:${webhookPort}/hook/t-input`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'watch_thread', arguments: {threadId: 't-input', notifyWebhookUrl: url}},
    })
    const state = readState(cfg.statePath)
    state.threads['t-input'].pendingRequestCount = 1
    atomicWriteJson(cfg.statePath, JSON.stringify(state))
    for (let i = 0; i < 30 && deliveries.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 200))
    }
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.event).toBe('thread.needs_input')
  })
})

describe('watcher 5xx retry then success', () => {
  let stop, base, cfg, webhookPort, deliveries, attempts
  beforeEach(async () => {
    cfg = makeConfig({pollSecs: 1})
    deliveries = []
    attempts = 0
    const wh = Bun.serve({
      port: 0,
      fetch: async (req) => {
        attempts += 1
        if (attempts === 1) return new Response('fail', {status: 500})
        const body = await req.json()
        deliveries.push({idem: req.headers.get('Idempotency-Key') ?? '', body})
        return new Response('ok', {status: 200})
      },
    })
    webhookPort = wh.port
    cfg.webhookPrefixes = [`http://127.0.0.1:${webhookPort}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      wh.stop()
    }
    seedThread(cfg.statePath, {
      threadId: 't-5xx',
      projectId: 'proj-allowed',
      title: '5xx',
      status: 'running',
      latestRunId: 'run:t-5xx:1',
      activeRunId: 'run:t-5xx:1',
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })
  afterEach(async () => await stop())

  test('retries on 5xx and succeeds on the next poll', async () => {
    const url = `http://127.0.0.1:${webhookPort}/hook/t-5xx`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'watch_thread', arguments: {threadId: 't-5xx', notifyWebhookUrl: url}},
    })
    const state = readState(cfg.statePath)
    state.threads['t-5xx'].activeRunId = null
    state.threads['t-5xx'].latestRunId = 'run:t-5xx:2'
    state.threads['t-5xx'].status = 'completed'
    atomicWriteJson(cfg.statePath, JSON.stringify(state))
    for (let i = 0; i < 40 && deliveries.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 200))
    }
    expect(deliveries.length).toBe(1)
    expect(attempts).toBe(2)
  })
})

describe('watcher 4xx drop', () => {
  let stop, base, cfg, webhookPort, attempts
  beforeEach(async () => {
    cfg = makeConfig({pollSecs: 1})
    attempts = 0
    const wh = Bun.serve({
      port: 0,
      fetch: async () => {
        attempts += 1
        return new Response('bad', {status: 404})
      },
    })
    webhookPort = wh.port
    cfg.webhookPrefixes = [`http://127.0.0.1:${webhookPort}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      wh.stop()
    }
    seedThread(cfg.statePath, {
      threadId: 't-4xx',
      projectId: 'proj-allowed',
      title: '4xx',
      status: 'running',
      latestRunId: 'run:t-4xx:1',
      activeRunId: 'run:t-4xx:1',
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })
  afterEach(async () => await stop())

  test('drops the watch on 4xx', async () => {
    const url = `http://127.0.0.1:${webhookPort}/hook/t-4xx`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'watch_thread', arguments: {threadId: 't-4xx', notifyWebhookUrl: url}},
    })
    const state = readState(cfg.statePath)
    state.threads['t-4xx'].activeRunId = null
    state.threads['t-4xx'].latestRunId = 'run:t-4xx:2'
    state.threads['t-4xx'].status = 'completed'
    atomicWriteJson(cfg.statePath, JSON.stringify(state))
    for (let i = 0; i < 30 && attempts === 0; i++) {
      await new Promise((r) => setTimeout(r, 200))
    }
    expect(attempts).toBe(1)
    // The watch file should no longer contain this thread.
    await new Promise((r) => setTimeout(r, 500))
    const watches = JSON.parse(fs.readFileSync(path.join(cfg.stateDir, 'watches.json'), 'utf8'))
    expect(watches.find((w) => w.threadId === 't-4xx')).toBeUndefined()
  })
})

describe('watches persist across restart', () => {
  let cfg
  beforeEach(() => {
    cfg = makeConfig({pollSecs: 1})
    seedThread(cfg.statePath, {
      threadId: 't-persist',
      projectId: 'proj-allowed',
      title: 'Persist',
      status: 'running',
      latestRunId: 'run:t-persist:1',
      activeRunId: 'run:t-persist:1',
      runCount: 1,
      pendingRequestCount: 0,
      messages: [],
    })
  })

  test('a watch armed before restart is resumed after restart', async () => {
    const s1 = await startServer(cfg)
    await rpc(s1.base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-persist', notifyWebhookUrl: 'https://example.com/hook/persist'},
      },
    })
    // Wait for the async persist to land on disk.
    for (let i = 0; i < 30; i++) {
      try {
        const watches = JSON.parse(fs.readFileSync(path.join(cfg.stateDir, 'watches.json'), 'utf8'))
        if (watches.find((w) => w.threadId === 't-persist')) break
      } catch {}
      await new Promise((r) => setTimeout(r, 100))
    }
    await s1.stop()
    // Restart the server with the same state dir.
    const s2 = await startServer(cfg)
    // The watch file should still contain the watch.
    const watches = JSON.parse(fs.readFileSync(path.join(cfg.stateDir, 'watches.json'), 'utf8'))
    expect(watches.find((w) => w.threadId === 't-persist')).toBeDefined()
    await s2.stop()
  })
})

describe('batch JSON-RPC', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('handles a batch of requests', async () => {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: authHeaders(base),
      body: JSON.stringify([
        {jsonrpc: '2.0', id: 1, method: 'ping'},
        {jsonrpc: '2.0', id: 2, method: 'ping'},
      ]),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.length).toBe(2)
    expect(body[0].id).toBe(1)
    expect(body[1].id).toBe(2)
  })

  test('all-notification batch returns 202', async () => {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: authHeaders(base),
      body: JSON.stringify([{jsonrpc: '2.0', method: 'notifications/initialized'}]),
    })
    expect(res.status).toBe(202)
  })
})

describe('watcher arming from start_thread, send_message and watch_thread', () => {
  let stop, base, cfg, webhookUrl, deliveries
  beforeEach(async () => {
    cfg = makeConfig({pollSecs: 1})
    deliveries = []
    const wh = Bun.serve({
      port: 0,
      fetch: async (req) => {
        deliveries.push({idem: req.headers.get('Idempotency-Key') ?? '', body: await req.json()})
        return new Response('ok', {status: 202})
      },
    })
    webhookUrl = `http://127.0.0.1:${wh.port}/hook/secret`
    cfg.webhookPrefixes = [`http://127.0.0.1:${wh.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      wh.stop()
    }
  })
  afterEach(async () => await stop())

  /** Marks a fake thread's active run as finished with an assistant reply. */
  function finishRun(threadId, text) {
    const state = readState(cfg.statePath)
    const t = state.threads[threadId]
    t.activeRunId = null
    t.status = 'completed'
    t.messages = [...(t.messages ?? []), {role: 'assistant', runId: t.latestRunId, text}]
    atomicWriteJson(cfg.statePath, JSON.stringify(state))
  }

  async function waitForDeliveries(n) {
    for (let i = 0; i < 40 && deliveries.length < n; i++) await new Promise((r) => setTimeout(r, 200))
  }

  async function callTool(name, args) {
    const {body} = await rpc(base, {jsonrpc: '2.0', id: 1, method: 'tools/call', params: {name, arguments: args}})
    expect(body.result.isError).toBeFalsy()
    return body.result.structuredContent
  }

  test('start_thread with notifyWebhookUrl notifies when the first run finishes', async () => {
    const started = await callTool('start_thread', {message: 'do it', notifyWebhookUrl: webhookUrl})
    expect(started.watching).toBe(true)
    finishRun(started.threadId, 'first run done')
    await waitForDeliveries(1)
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.event).toBe('thread.finished')
    expect(deliveries[0].body.lastAssistantMessage).toBe('first run done')
  })

  test('send_message with notifyWebhookUrl notifies for the run the message started, not the earlier one', async () => {
    seedThread(cfg.statePath, {
      threadId: 't-idle',
      projectId: 'proj-allowed',
      title: 'Idle',
      status: 'completed',
      latestRunId: 'run:t-idle:1',
      activeRunId: null,
      runCount: 1,
      pendingRequestCount: 0,
      messages: [{role: 'assistant', runId: 'run:t-idle:1', text: 'old'}],
    })
    await callTool('send_message', {threadId: 't-idle', message: 'again', notifyWebhookUrl: webhookUrl})
    // The new run is in progress: nothing yet, and the old finished run must not count.
    await new Promise((r) => setTimeout(r, 1500))
    expect(deliveries.length).toBe(0)
    finishRun('t-idle', 'second run done')
    await waitForDeliveries(1)
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.runId).not.toBe('run:t-idle:1')
    expect(deliveries[0].body.lastAssistantMessage).toBe('second run done')
  })

  test('watch_thread on an idle thread notifies right away with its latest run', async () => {
    seedThread(cfg.statePath, {
      threadId: 't-done',
      projectId: 'proj-allowed',
      title: 'Done',
      status: 'completed',
      latestRunId: 'run:t-done:1',
      activeRunId: null,
      runCount: 1,
      pendingRequestCount: 0,
      messages: [{role: 'assistant', runId: 'run:t-done:1', text: 'result'}],
    })
    await callTool('watch_thread', {threadId: 't-done', notifyWebhookUrl: webhookUrl})
    await waitForDeliveries(1)
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.runId).toBe('run:t-done:1')
  })
})

describe('start_thread model selection', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig({extraEnv: {T3_MCP_DEFAULT_PROVIDER: 'prov-default', T3_MCP_DEFAULT_MODEL: 'model-default'}})
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  async function start(args) {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: args},
    })
    expect(body.result.isError).toBeFalsy()
    return readState(cfg.statePath).threads[body.result.structuredContent.threadId]
  }

  test('uses the server default model when none is given', async () => {
    const t = await start({message: 'hi'})
    expect(t.providerInstanceId).toBe('prov-default')
    expect(t.model).toBe('model-default')
  })

  test('an explicit provider and model win over the default', async () => {
    const t = await start({message: 'hi', provider: 'prov-x', model: 'model-x'})
    expect(t.providerInstanceId).toBe('prov-x')
    expect(t.model).toBe('model-x')
  })
})

// ─── Artifacts ────────────────────────────────────────────────────────────────

describe('artifacts: start_thread creates dir and appends evidence block', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('returns artifactsUrl built from the request Host', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it'}},
    })
    const sc = body.result.structuredContent
    expect(sc.artifactsUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/artifacts\/[A-Za-z0-9_-]{22}\/$/)
    expect(sc.artifactsDir).toContain('artifacts')
    // The dir should exist on disk.
    expect(fs.existsSync(sc.artifactsDir)).toBe(true)
    // The evidence block should be in the message.
    const state = readState(cfg.statePath)
    const t = Object.values(state.threads)[0]
    expect(t.messages[0].text).toContain(sc.artifactsDir)
    expect(t.messages[0].text).toContain('Evidence directory:')
  })
})

describe('artifacts: base URL override', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig({extraEnv: {T3_MCP_ARTIFACTS_BASE_URL: 'https://artifacts.example.com'}})
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('uses the override instead of the request Host', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it'}},
    })
    expect(body.result.structuredContent.artifactsUrl).toMatch(
      /^https:\/\/artifacts\.example\.com\/artifacts\/[A-Za-z0-9_-]{22}\/$/,
    )
  })
})

describe('artifacts: mapping persists across restart', () => {
  let cfg
  beforeEach(() => {
    cfg = makeConfig()
  })

  test('artifact mapping is reloaded from artifacts.json after restart', async () => {
    const s1 = await startServer(cfg)
    const {body} = await rpc(s1.base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it'}},
    })
    const threadId = body.result.structuredContent.threadId
    const artifactsDir = body.result.structuredContent.artifactsDir
    // Write a file into the artifact dir.
    fs.writeFileSync(path.join(artifactsDir, 'after-1.png'), 'png-bytes')
    // Wait for artifacts.json to land.
    for (let i = 0; i < 30; i++) {
      try {
        const arr = JSON.parse(fs.readFileSync(path.join(cfg.stateDir, 'artifacts.json'), 'utf8'))
        if (arr.find((a) => a.threadId === threadId)) break
      } catch {}
      await new Promise((r) => setTimeout(r, 100))
    }
    await s1.stop()
    // Restart with the same state dir.
    const s2 = await startServer(cfg)
    // get_thread should still list the artifact.
    const {body: gt} = await rpc(s2.base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'get_thread', arguments: {threadId, messages: 1}},
    })
    expect(gt.result.structuredContent.artifacts.length).toBe(1)
    expect(gt.result.structuredContent.artifacts[0].name).toBe('after-1.png')
    await s2.stop()
  })
})

describe('artifacts: GET /artifacts/<id>/<name>', () => {
  let stop, base, cfg, artifactId, artifactDir, threadId
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
    // Start a thread to get an artifact dir.
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it'}},
    })
    threadId = body.result.structuredContent.threadId
    artifactDir = body.result.structuredContent.artifactsDir
    const artifactsUrl = body.result.structuredContent.artifactsUrl
    // Extract the artifact id from the URL.
    artifactId = artifactsUrl.match(/\/artifacts\/([A-Za-z0-9_-]{22})\//)[1]
  })
  afterEach(async () => await stop())

  test('serves an allowed file with correct type/length/headers', async () => {
    fs.writeFileSync(path.join(artifactDir, 'before-1.png'), 'png-data-bytes')
    const res = await fetch(`${base}/artifacts/${artifactId}/before-1.png`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(res.headers.get('content-length')).toBe(String(Buffer.byteLength('png-data-bytes')))
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    expect(await res.text()).toBe('png-data-bytes')
  })

  test('HEAD works without a body', async () => {
    fs.writeFileSync(path.join(artifactDir, 'after-1.webm'), 'webm-data')
    const res = await fetch(`${base}/artifacts/${artifactId}/after-1.webm`, {method: 'HEAD'})
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('video/webm')
    expect(res.headers.get('content-length')).toBe(String(Buffer.byteLength('webm-data')))
    expect(await res.text()).toBe('')
  })

  test('404 for unknown id', async () => {
    const res = await fetch(`${base}/artifacts/AAAAAAAAAAAAAAAAAAAAAAAA/before-1.png`)
    expect(res.status).toBe(404)
  })

  test('404 for malformed id', async () => {
    const res = await fetch(`${base}/artifacts/short/before-1.png`)
    expect(res.status).toBe(404)
  })

  test('404 for path traversal in name', async () => {
    fs.writeFileSync(path.join(artifactDir, 'real.png'), 'data')
    const res = await fetch(`${base}/artifacts/${artifactId}/..%2Fx.png`)
    expect(res.status).toBe(404)
  })

  test('404 for dotfile name', async () => {
    fs.writeFileSync(path.join(artifactDir, '.hidden.png'), 'data')
    const res = await fetch(`${base}/artifacts/${artifactId}/.hidden.png`)
    expect(res.status).toBe(404)
  })

  test('404 for disallowed extension', async () => {
    fs.writeFileSync(path.join(artifactDir, 'a.txt'), 'data')
    const res = await fetch(`${base}/artifacts/${artifactId}/a.txt`)
    expect(res.status).toBe(404)
  })

  test('404 for symlink', async () => {
    fs.writeFileSync(path.join(artifactDir, 'real.png'), 'real-data')
    fs.symlinkSync('real.png', path.join(artifactDir, 'link.png'))
    const res = await fetch(`${base}/artifacts/${artifactId}/link.png`)
    expect(res.status).toBe(404)
  })

  test('404 for oversize file (test hook lowers cap)', async () => {
    // Restart the server with a tiny cap.
    await stop()
    cfg.extraEnv = {T3_MCP_TEST_ARTIFACT_MAX_BYTES: '10'}
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
    fs.writeFileSync(path.join(artifactDir, 'big.png'), 'this is more than 10 bytes')
    const res = await fetch(`${base}/artifacts/${artifactId}/big.png`)
    expect(res.status).toBe(404)
  })
})

describe('artifacts: get_thread includes artifacts list', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('get_thread returns artifacts array (empty when none)', async () => {
    const {body: startBody} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it'}},
    })
    const threadId = startBody.result.structuredContent.threadId
    const artifactDir = startBody.result.structuredContent.artifactsDir
    // No files yet → empty array.
    const {body: gt1} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'get_thread', arguments: {threadId, messages: 1}},
    })
    expect(gt1.result.structuredContent.artifacts).toEqual([])
    // Add files → listed.
    fs.writeFileSync(path.join(artifactDir, 'before-1.png'), 'a')
    fs.writeFileSync(path.join(artifactDir, 'after-1.webm'), 'bb')
    const {body: gt2} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'get_thread', arguments: {threadId, messages: 1}},
    })
    const arts = gt2.result.structuredContent.artifacts
    expect(arts.length).toBe(2)
    expect(arts[0].name).toBe('after-1.webm')
    expect(arts[0].contentType).toBe('video/webm')
    expect(arts[0].bytes).toBe(2)
    expect(arts[0].url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/artifacts\//)
    expect(arts[1].name).toBe('before-1.png')
    expect(arts[1].contentType).toBe('image/png')
  })
})

describe('artifacts: webhook payload includes artifacts list', () => {
  let stop, base, cfg, webhookPort, deliveries
  beforeEach(async () => {
    cfg = makeConfig({pollSecs: 1})
    deliveries = []
    const wh = Bun.serve({
      port: 0,
      fetch: async (req) => {
        deliveries.push({idem: req.headers.get('Idempotency-Key') ?? '', body: await req.json()})
        return new Response('ok', {status: 200})
      },
    })
    webhookPort = wh.port
    cfg.webhookPrefixes = [`http://127.0.0.1:${webhookPort}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      wh.stop()
    }
  })
  afterEach(async () => await stop())

  test('thread.finished payload includes artifacts', async () => {
    const webhookUrl = `http://127.0.0.1:${webhookPort}/hook/secret`
    const {body: startBody} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it', notifyWebhookUrl: webhookUrl}},
    })
    const threadId = startBody.result.structuredContent.threadId
    const artifactDir = startBody.result.structuredContent.artifactsDir
    // Save an evidence file.
    fs.writeFileSync(path.join(artifactDir, 'after-1.png'), 'evidence')
    // Finish the run.
    const state = readState(cfg.statePath)
    state.threads[threadId].activeRunId = null
    state.threads[threadId].status = 'completed'
    state.threads[threadId].messages = [
      ...(state.threads[threadId].messages ?? []),
      {role: 'assistant', runId: state.threads[threadId].latestRunId, text: 'done'},
    ]
    atomicWriteJson(cfg.statePath, JSON.stringify(state))
    // Wait for delivery.
    for (let i = 0; i < 40 && deliveries.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 200))
    }
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.event).toBe('thread.finished')
    expect(deliveries[0].body.artifacts.length).toBe(1)
    expect(deliveries[0].body.artifacts[0].name).toBe('after-1.png')
    expect(deliveries[0].body.artifacts[0].url).toMatch(/\/artifacts\//)
  })
})

describe('artifacts: failed thread start removes the dir', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    // Point the fake CLI at a state path that doesn't exist so thread start fails.
    // Actually, we need the fake CLI to fail. We'll use a non-existent fake binary.
    cfg.t3Bin = JSON.stringify(['node', '-e', 'process.exit(1)'])
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('removes the artifact dir when thread start fails', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {name: 'start_thread', arguments: {message: 'do it'}},
    })
    expect(body.result.isError).toBe(true)
    // No artifact dirs should exist.
    const artifactsRoot = path.join(cfg.stateDir, 'artifacts')
    if (fs.existsSync(artifactsRoot)) {
      const dirs = fs.readdirSync(artifactsRoot)
      expect(dirs.length).toBe(0)
    }
  })
})

// ─── PR merge subscription tests ──────────────────────────────────────────────

function pr(threadId, number, state, overrides = {}) {
  return {
    host: 'github.com',
    repository: 'owner/repo',
    number,
    url: `https://github.com/owner/repo/pull/${number}`,
    source: 'created',
    state,
    ...overrides,
  }
}

function idleThread(threadId, prs = [], overrides = {}) {
  return {
    threadId,
    projectId: 'proj-allowed',
    title: 'T-' + threadId,
    status: 'completed',
    latestRunId: 'run:' + threadId + ':1',
    activeRunId: null,
    runCount: 1,
    pendingRequestCount: 0,
    messages: [],
    pullRequests: prs,
    ...overrides,
  }
}

function readPrWatches(cfg) {
  const file = path.join(cfg.stateDir, 'pr-watches.json')
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
}

async function waitForAttempts(receiver, n, ms = 4000) {
  for (let i = 0; i < ms / 100 && receiver.attempts.length < n; i++) await new Promise((r) => setTimeout(r, 100))
}

async function waitForPrWatchesFile(cfg, pred, ms = 4000) {
  for (let i = 0; i < ms / 100; i++) {
    try {
      if (pred(readPrWatches(cfg))) return
    } catch {}
    await new Promise((r) => setTimeout(r, 100))
  }
}

describe('pull_request.merged: case A — only merged fires, settled/closed do not', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-a', [pr('t-a', 1, 'open'), pr('t-a', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('idle thread with open PRs → no delivery; settled/closed → no delivery; merge → one delivery', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-a`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-a', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    // Idle thread with open PRs: no delivery at all (proves no thread.finished).
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(0)
    // Set settled/settledAt and make #2 closed: still nothing.
    updateState(cfg.statePath, (s) => {
      s.threads['t-a'].settled = true
      s.threads['t-a'].settledAt = '2026-01-01T00:00:00.000Z'
      s.threads['t-a'].pullRequests = [pr('t-a', 1, 'open'), pr('t-a', 2, 'closed')]
    })
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(0)
    // Make #1 merged: exactly one delivery.
    updateState(cfg.statePath, (s) => {
      s.threads['t-a'].pullRequests = [pr('t-a', 1, 'merged'), pr('t-a', 2, 'closed')]
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    const a = receiver.attempts[0]
    const body = JSON.parse(a.raw.toString())
    expect(body.event).toBe('pull_request.merged')
    expect(body.threadId).toBe('t-a')
    expect(body.pullRequest.url).toBe('https://github.com/owner/repo/pull/1')
    expect(body.pullRequest.repository).toBe('owner/repo')
    expect(body.eventId).toBe(a.key)
    expect(a.key).toMatch(/^t3-pr-merged-1-[0-9a-f]{32}$/)
    // Wait 2 more cycles: still one.
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(1)
    // The sub is gone from pr-watches.json (all associated PRs merged/closed with ≥1 merged).
    await waitForPrWatchesFile(cfg, (arr) => arr.length === 0)
    expect(readPrWatches(cfg).length).toBe(0)
  }, 20000)
})

describe('pull_request.merged: case B — closed PR keeps sub; a later merge fires', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-b', [pr('t-b', 1, 'closed')]))
  })
  afterEach(async () => await stop())

  test('lone closed PR keeps the sub; adding #2 merged gives exactly one event for #2', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-b`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-b', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(0)
    expect(readPrWatches(cfg).length).toBe(1)
    updateState(cfg.statePath, (s) => {
      s.threads['t-b'].pullRequests = [pr('t-b', 1, 'closed'), pr('t-b', 2, 'merged')]
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    const body = JSON.parse(receiver.attempts[0].raw.toString())
    expect(body.pullRequest.number).toBe(2)
  }, 20000)
})

describe('pull_request.merged: case C — start_thread with both events', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
  })
  afterEach(async () => await stop())

  test('both events armed; finished fires first; merge fires after a PR merges', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-c`
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'start_thread',
        arguments: {message: 'do it', notifyWebhookUrl: url, notifyEvents: ['thread.finished', 'pull_request.merged']},
      },
    })
    const sc = body.result.structuredContent
    expect(sc.notifyEvents.sort()).toEqual(['pull_request.merged', 'thread.finished'])
    const threadId = sc.threadId
    // Finish the run → thread.finished arrives.
    updateState(cfg.statePath, (s) => {
      s.threads[threadId].activeRunId = null
      s.threads[threadId].status = 'completed'
      s.threads[threadId].messages = [{role: 'assistant', runId: s.threads[threadId].latestRunId, text: 'done'}]
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    expect(JSON.parse(receiver.attempts[0].raw.toString()).event).toBe('thread.finished')
    // watches.json no longer has the run watch, but pr-watches.json still has the sub.
    await waitForPrWatchesFile(cfg, (arr) => arr.find((w) => w.threadId === threadId))
    const watches = JSON.parse(fs.readFileSync(path.join(cfg.stateDir, 'watches.json'), 'utf8'))
    expect(watches.find((w) => w.threadId === threadId)).toBeUndefined()
    expect(readPrWatches(cfg).find((w) => w.threadId === threadId)).toBeDefined()
    // Add a merged PR → pull_request.merged arrives.
    updateState(cfg.statePath, (s) => {
      s.threads[threadId].pullRequests = [pr(threadId, 1, 'merged')]
    })
    await waitForAttempts(receiver, 2)
    expect(receiver.attempts.length).toBe(2)
    expect(JSON.parse(receiver.attempts[1].raw.toString()).event).toBe('pull_request.merged')
  }, 20000)
})

describe('pull_request.merged: case D — fail-before then success', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-d', [pr('t-d', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('first attempt fail-before (503), then success — identical key and bytes, no third', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-d`
    let attemptCount = 0
    receiver.setOverride(() => {
      attemptCount += 1
      // First attempt: fail-before (503, not recorded in the dedupe map).
      return attemptCount === 1 ? 503 : null
    })
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-d', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    updateState(cfg.statePath, (s) => {
      s.threads['t-d'].pullRequests = [pr('t-d', 2, 'merged')]
    })
    await waitForAttempts(receiver, 2)
    expect(receiver.attempts.length).toBe(2)
    // Both attempts have identical key and identical raw bytes.
    expect(receiver.attempts[0].key).toBe(receiver.attempts[1].key)
    expect(receiver.attempts[0].raw.equals(receiver.attempts[1].raw)).toBe(true)
    // No third attempt.
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(2)
  }, 20000)
})

describe('pull_request.merged: case E — fail-after duplicate', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-e', [pr('t-e', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('fail-after: 1 firing recorded then 500; retry dedupes; nothing after', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-e`
    let attemptCount = 0
    receiver.setOverride(() => {
      attemptCount += 1
      // First attempt: fail-after (store the firing, record the attempt, then 500).
      return attemptCount === 1 ? 'fail-after' : null
    })
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-e', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    updateState(cfg.statePath, (s) => {
      s.threads['t-e'].pullRequests = [pr('t-e', 2, 'merged')]
    })
    await waitForAttempts(receiver, 2)
    expect(receiver.attempts.length).toBe(2)
    // The first attempt durably recorded the firing; the retry is a duplicate.
    expect(receiver.firingCount).toBe(1)
    expect(receiver.duplicates).toBe(1)
    expect(receiver.conflicts).toBe(0)
    // Identical key and bytes across both attempts.
    expect(receiver.attempts[0].key).toBe(receiver.attempts[1].key)
    expect(receiver.attempts[0].raw.equals(receiver.attempts[1].raw)).toBe(true)
    // No third attempt.
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(2)
  }, 20000)
})

describe('pull_request.merged: case F — restart with pending', () => {
  let cfg
  beforeEach(() => {
    cfg = makeConfig({prPollSecs: 1})
    seedThread(cfg.statePath, idleThread('t-f', [pr('t-f', 1, 'open'), pr('t-f', 2, 'open')]))
  })

  test('pending survives restart and delivers identical bytes; second restart → no new attempts', async () => {
    const receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    // Receiver always 503 so a pending entry stays.
    receiver.setOverride(() => 503)
    let s1
    let s2
    let s3
    try {
      s1 = await startServer(cfg)
      const url = `http://127.0.0.1:${receiver.port}/hook/t-f`
      await rpc(s1.base, {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'watch_thread',
          arguments: {threadId: 't-f', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
        },
      })
      // Merge only #1; #2 stays open so the sub persists after delivery.
      updateState(cfg.statePath, (s) => {
        s.threads['t-f'].pullRequests = [pr('t-f', 1, 'merged'), pr('t-f', 2, 'open')]
      })
      // Wait for ≥1 attempt with the pending entry on disk.
      await waitForAttempts(receiver, 1)
      await waitForPrWatchesFile(cfg, (arr) => arr.find((w) => w.threadId === 't-f' && w.pending.length > 0))
      const pendingBefore = readPrWatches(cfg).find((w) => w.threadId === 't-f').pending[0]
      await s1.stop()
      // Switch the receiver to accept (clear override → normal dedupe).
      receiver.clearOverride()
      // Restart with the same state dir.
      s2 = await startServer(cfg)
      // It delivers the SAME key with byte-identical raw.
      await waitForAttempts(receiver, 2)
      const secondAttempt = receiver.attempts[receiver.attempts.length - 1]
      expect(secondAttempt.key).toBe(pendingBefore.eventId)
      expect(Buffer.from(secondAttempt.raw).equals(Buffer.from(pendingBefore.body))).toBe(true)
      // Wait until pr-watches.json shows the sub with the eventId in delivered and pending empty.
      await waitForPrWatchesFile(cfg, (arr) => {
        const w = arr.find((x) => x.threadId === 't-f')
        return w && w.delivered.includes(pendingBefore.eventId) && w.pending.length === 0
      })
      const w = readPrWatches(cfg).find((x) => x.threadId === 't-f')
      expect(w.delivered.includes(pendingBefore.eventId)).toBe(true)
      expect(w.pending.length).toBe(0)
      // Take the attempt count BEFORE starting s3, then wait ~2.5 s and assert unchanged.
      await s2.stop()
      const beforeCount = receiver.attempts.length
      s3 = await startServer(cfg)
      await new Promise((r) => setTimeout(r, 2500))
      expect(receiver.attempts.length).toBe(beforeCount)
    } finally {
      if (s1) await s1.stop()
      if (s2) await s2.stop()
      if (s3) await s3.stop()
      receiver.stop()
    }
  }, 20000)
})

describe('pull_request.merged: case G — 409 keeps sub, eventId in delivered', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-g', [pr('t-g', 1, 'open'), pr('t-g', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('receiver answers 409; one attempt; sub kept with eventId in delivered', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-g`
    receiver.setOverride(() => 409)
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-g', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    // Make #1 merged; #2 stays open so the sub persists.
    updateState(cfg.statePath, (s) => {
      s.threads['t-g'].pullRequests = [pr('t-g', 1, 'merged'), pr('t-g', 2, 'open')]
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    await waitForPrWatchesFile(cfg, (arr) => {
      const w = arr.find((x) => x.threadId === 't-g')
      return w && w.delivered.length === 1 && w.pending.length === 0
    })
    const w = readPrWatches(cfg).find((x) => x.threadId === 't-g')
    expect(w).toBeDefined()
    expect(w.delivered.length).toBe(1)
    expect(w.pending.length).toBe(0)
    // No further attempts.
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(1)
  }, 20000)
})

describe('pull_request.merged: case H — 404 drops the sub', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-h', [pr('t-h', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('receiver answers 404; sub dropped from pr-watches.json', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-h`
    receiver.setOverride(() => 404)
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-h', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    updateState(cfg.statePath, (s) => {
      s.threads['t-h'].pullRequests = [pr('t-h', 2, 'merged')]
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    await waitForPrWatchesFile(cfg, (arr) => arr.length === 0)
    expect(readPrWatches(cfg).length).toBe(0)
  }, 20000)
})

describe('pull_request.merged: case I — stack-dismissed PR is not notified', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(
      cfg.statePath,
      idleThread('t-i', [
        pr('t-i', 1, 'merged'),
        pr('t-i', 2, 'merged'),
        pr('t-i', 3, 'merged', {source: 'stack-dismissed'}),
      ]),
    )
  })
  afterEach(async () => await stop())

  test('exactly 2 events with distinct eventIds, none for #3; sub removed; re-subscribe → 2 duplicates', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-i`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-i', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    await waitForAttempts(receiver, 2)
    expect(receiver.attempts.length).toBe(2)
    const ids = receiver.attempts.map((a) => a.key)
    expect(new Set(ids).size).toBe(2)
    expect(ids.find((k) => k.startsWith('t3-pr-merged-3-'))).toBeUndefined()
    expect(receiver.conflicts).toBe(0)
    // Sub removed (all associated PRs merged).
    await waitForPrWatchesFile(cfg, (arr) => arr.length === 0)
    // Subscribe again with the same URL: 2 more attempts with the same eventIds and identical bytes,
    // counted as duplicates === 2.
    await rpc(base, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-i', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    await waitForAttempts(receiver, 4)
    expect(receiver.attempts.length).toBe(4)
    expect(receiver.duplicates).toBe(2)
    expect(receiver.conflicts).toBe(0)
    // Bytes identical across the two rounds.
    const first = receiver.attempts[0]
    const second = receiver.attempts[2]
    expect(first.key).toBe(second.key)
    expect(first.raw.equals(second.raw)).toBe(true)
  }, 20000)
})

describe('pull_request.merged: case J — unwatch removes the sub', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-j', [pr('t-j', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('unwatch_thread → removed:true, pr-watches empty, later merge delivers nothing', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-j`
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-j', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    expect(body.result.structuredContent.notifyEvents).toEqual(['pull_request.merged'])
    await waitForPrWatchesFile(cfg, (arr) => arr.length === 1)
    const {body: unwatchBody} = await rpc(base, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {name: 'unwatch_thread', arguments: {threadId: 't-j'}},
    })
    expect(unwatchBody.result.structuredContent.removed).toBe(true)
    await waitForPrWatchesFile(cfg, (arr) => arr.length === 0)
    expect(readPrWatches(cfg).length).toBe(0)
    // A later merge delivers nothing.
    updateState(cfg.statePath, (s) => {
      s.threads['t-j'].pullRequests = [pr('t-j', 2, 'merged')]
    })
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(0)
  }, 20000)
})

describe('pull_request.merged: case K — validation errors', () => {
  let stop, base, cfg
  beforeEach(async () => {
    cfg = makeConfig()
    const s = await startServer(cfg)
    base = s.base
    stop = s.stop
  })
  afterEach(async () => await stop())

  test('notifyEvents without notifyWebhookUrl fails and creates no thread', async () => {
    const before = Object.keys(readState(cfg.statePath).threads).length
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'start_thread',
        arguments: {message: 'hi', notifyEvents: ['pull_request.merged']},
      },
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('notifyWebhookUrl')
    const after = Object.keys(readState(cfg.statePath).threads).length
    expect(after).toBe(before)
  })

  test('unknown event fails', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'start_thread',
        arguments: {message: 'hi', notifyWebhookUrl: 'https://example.com/hook/x', notifyEvents: ['bogus']},
      },
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('unknown event')
  })

  test('empty array fails', async () => {
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'start_thread',
        arguments: {message: 'hi', notifyWebhookUrl: 'https://example.com/hook/x', notifyEvents: []},
      },
    })
    expect(body.result.isError).toBe(true)
    expect(body.result.content[0].text).toContain('empty')
  })
})

describe('pull_request.merged: case L — archived fallback and deletion', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-arch', [pr('t-arch', 1, 'merged')], {archived: true}))
    seedThread(cfg.statePath, idleThread('t-del', [pr('t-del', 1, 'open')]))
  })
  afterEach(async () => await stop())

  test('archived thread hidden from list still gets the event via show fallback', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-arch`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-arch', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    expect(JSON.parse(receiver.attempts[0].raw.toString()).threadId).toBe('t-arch')
  }, 20000)

  test('subscribed thread deleted from fake state gets its sub dropped', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-del`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-del', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    await waitForPrWatchesFile(cfg, (arr) => arr.find((w) => w.threadId === 't-del'))
    // Delete the thread from the fake state.
    updateState(cfg.statePath, (s) => {
      delete s.threads['t-del']
    })
    await waitForPrWatchesFile(cfg, (arr) => !arr.find((w) => w.threadId === 't-del'))
    expect(readPrWatches(cfg).find((w) => w.threadId === 't-del')).toBeUndefined()
  }, 20000)
})

describe('pull_request.merged: case M — re-arming keeps history', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-m', [pr('t-m', 1, 'open'), pr('t-m', 2, 'open')]))
  })
  afterEach(async () => await stop())

  test('re-arming with the same URL keeps the existing sub and its delivery history', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-m`
    await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-m', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    // Merge #1; #2 stays open so the sub persists after delivery.
    updateState(cfg.statePath, (s) => {
      s.threads['t-m'].pullRequests = [pr('t-m', 1, 'merged'), pr('t-m', 2, 'open')]
    })
    await waitForAttempts(receiver, 1)
    expect(receiver.attempts.length).toBe(1)
    await waitForPrWatchesFile(cfg, (arr) => {
      const w = arr.find((x) => x.threadId === 't-m')
      return w && w.delivered.length === 1
    })
    const deliveredId = readPrWatches(cfg).find((w) => w.threadId === 't-m').delivered[0]
    const beforeCount = receiver.attempts.length
    // Re-arm with the same URL and merge-only events.
    await rpc(base, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'watch_thread',
        arguments: {threadId: 't-m', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    // After ~2.5 s there are no new attempts (the merged #1 is already in delivered).
    await new Promise((r) => setTimeout(r, 2500))
    expect(receiver.attempts.length).toBe(beforeCount)
    // pr-watches.json still has exactly one sub for the thread, with the same delivered history.
    const subs = readPrWatches(cfg).filter((w) => w.threadId === 't-m')
    expect(subs.length).toBe(1)
    expect(subs[0].delivered).toContain(deliveredId)
  }, 20000)
})

describe('pull_request.merged: case N — send_message with merge-only events', () => {
  let stop, base, cfg, receiver
  beforeEach(async () => {
    cfg = makeConfig({prPollSecs: 1})
    receiver = makeReceiver()
    cfg.webhookPrefixes = [`http://127.0.0.1:${receiver.port}/hook/`]
    const s = await startServer(cfg)
    base = s.base
    stop = async () => {
      await s.stop()
      receiver.stop()
    }
    seedThread(cfg.statePath, idleThread('t-n', [pr('t-n', 1, 'open')]))
  })
  afterEach(async () => await stop())

  test('send_message with notifyEvents:["pull_request.merged"] arms the sub but no run watch', async () => {
    const url = `http://127.0.0.1:${receiver.port}/hook/t-n`
    const {body} = await rpc(base, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'send_message',
        arguments: {threadId: 't-n', message: 'go', notifyWebhookUrl: url, notifyEvents: ['pull_request.merged']},
      },
    })
    expect(body.result.structuredContent.notifyEvents).toEqual(['pull_request.merged'])
    // watches.json has no run watch for the thread (the file may not exist when no run watch is armed).
    const watchesPath = path.join(cfg.stateDir, 'watches.json')
    const watches = fs.existsSync(watchesPath) ? JSON.parse(fs.readFileSync(watchesPath, 'utf8')) : []
    expect(watches.find((w) => w.threadId === 't-n')).toBeUndefined()
    // pr-watches.json has the sub.
    await waitForPrWatchesFile(cfg, (arr) => arr.find((w) => w.threadId === 't-n'))
    expect(readPrWatches(cfg).find((w) => w.threadId === 't-n')).toBeDefined()
  }, 20000)
})
