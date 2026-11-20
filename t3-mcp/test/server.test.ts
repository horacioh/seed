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
    T3_FAKE_STATE: cfg.statePath,
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
  fs.writeFileSync(statePath, JSON.stringify(state))
}

function readState(statePath) {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'))
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
    // Verify the message was passed via stdin (recorded in fake state).
    const state = readState(cfg.statePath)
    const t = Object.values(state.threads)[0]
    expect(t.messages[0].text).toBe('hello world\nsecond line')
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
    state.threads['t-run'].messages = [{role: 'assistant', runId: 'run:t-run:2', text: 'finished result'}]
    fs.writeFileSync(cfg.statePath, JSON.stringify(state))
    // Wait for the poll (1s) + fetch.
    for (let i = 0; i < 30 && deliveries.length === 0; i++) {
      await new Promise((r) => setTimeout(r, 200))
    }
    expect(deliveries.length).toBe(1)
    expect(deliveries[0].body.event).toBe('thread.finished')
    expect(deliveries[0].body.threadId).toBe('t-run')
    expect(deliveries[0].body.runId).toBe('run:t-run:2')
    expect(deliveries[0].body.lastAssistantMessage).toBe('finished result')
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
    fs.writeFileSync(cfg.statePath, JSON.stringify(state))
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
    fs.writeFileSync(cfg.statePath, JSON.stringify(state))
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
    fs.writeFileSync(cfg.statePath, JSON.stringify(state))
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
    fs.writeFileSync(cfg.statePath, JSON.stringify(state))
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
