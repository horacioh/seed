import {afterEach, beforeEach, describe, expect, test} from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {Bridge} from '../src/main.js'
import type {BridgeConfig} from '../src/config.js'

const FAKE_AGENT = path.join(import.meta.dir, '..', 'test', 'fake-acp-agent.ts')

function makeConfig(overrides: Partial<BridgeConfig> = {}): BridgeConfig {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devin-bridge-test-'))
  return {
    apiKey: 'test-key',
    hostname: '127.0.0.1',
    port: 0,
    acpCommand: ['bun', FAKE_AGENT],
    maxConcurrent: 2,
    timeoutSecs: 30,
    mode: 'ask',
    workDir,
    ...overrides,
  }
}

async function startBridge(cfg: BridgeConfig): Promise<{bridge: Bridge; base: string; stop: () => Promise<void>}> {
  const bridge = new Bridge(cfg)
  // Use a dynamic port by binding to 0 then reading the actual port.
  const server = Bun.serve({
    hostname: cfg.hostname,
    port: cfg.port,
    fetch: (req) => bridge.handle(req),
  })
  const base = `http://${server.hostname}:${server.port}`
  return {bridge, base, stop: async () => server.stop()}
}

function authHeaders(key = 'test-key'): Record<string, string> {
  return {authorization: `Bearer ${key}`, 'content-type': 'application/json'}
}

async function post(
  base: string,
  path: string,
  body: unknown,
  headers: Record<string, string> = authHeaders(),
): Promise<Response> {
  return fetch(`${base}${path}`, {method: 'POST', headers, body: JSON.stringify(body)})
}

async function sseChunks(res: Response): Promise<any[]> {
  const text = await res.text()
  const chunks: any[] = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const data = line.slice(6)
    if (data === '[DONE]') {
      chunks.push({done: true})
      continue
    }
    try {
      chunks.push(JSON.parse(data))
    } catch {
      // ignore
    }
  }
  return chunks
}

describe('auth and health', () => {
  let env: ReturnType<typeof startBridge> extends Promise<infer T> ? never : never
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    await stop()
  })

  test('GET /health is open and returns ok', async () => {
    const res = await fetch(`${base}/health`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({status: 'ok'})
  })

  test('/v1/models without auth returns 401', async () => {
    const res = await fetch(`${base}/v1/models`)
    expect(res.status).toBe(401)
    const body: any = await res.json()
    expect(body.error.type).toBe('invalid_request_error')
  })

  test('/v1/models with wrong key returns 401', async () => {
    const res = await fetch(`${base}/v1/models`, {headers: authHeaders('wrong-key')})
    expect(res.status).toBe(401)
  })
})

describe('/v1/models', () => {
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    await stop()
  })

  test('lists default + fake options', async () => {
    const res = await fetch(`${base}/v1/models`, {headers: authHeaders()})
    expect(res.status).toBe(200)
    const body: any = await res.json()
    expect(body.object).toBe('list')
    const ids = body.data.map((m: any) => m.id)
    expect(ids).toContain('default')
    expect(ids).toContain('swe-2-high')
    expect(ids).toContain('claude-sonnet-5-5-medium')
    expect(ids).toContain('gemini-3-8-flash-medium')
  })
})

describe('non-stream text completion', () => {
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    await stop()
  })

  test('returns assistant content and usage', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'SAY:hello world'}]}),
    })
    expect(res.status).toBe(200)
    const body: any = await res.json()
    expect(body.object).toBe('chat.completion')
    expect(body.choices[0].message.role).toBe('assistant')
    expect(body.choices[0].message.content).toBe('hello world')
    expect(body.choices[0].finish_reason).toBe('stop')
    expect(body.usage.total_tokens).toBeGreaterThan(0)
  })
})

describe('streaming text completion', () => {
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    await stop()
  })

  test('streams role, content deltas, finish, usage, [DONE]', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        stream: true,
        stream_options: {include_usage: true},
        messages: [{role: 'user', content: 'SAY:hello'}],
      }),
    })
    expect(res.status).toBe(200)
    const chunks = await sseChunks(res)
    expect(chunks[0].choices[0].delta.role).toBe('assistant')
    const contentDeltas = chunks.filter((c) => c.choices?.[0]?.delta?.content).map((c) => c.choices[0].delta.content)
    expect(contentDeltas.join('')).toBe('hello')
    const finishChunk = chunks.find((c) => c.choices?.[0]?.finish_reason)
    expect(finishChunk.choices[0].finish_reason).toBe('stop')
    const usageChunk = chunks.find((c) => c.usage && c.choices?.length === 0)
    expect(usageChunk).toBeDefined()
    expect(usageChunk.usage.total_tokens).toBeGreaterThan(0)
    expect(chunks[chunks.length - 1].done).toBe(true)
  })
})

describe('tool calls', () => {
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    await stop()
  })

  test('non-stream parses tool call from split chunks', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        messages: [{role: 'user', content: 'TOOL:get_weather:{"city":"SF"}'}],
        tools: [
          {type: 'function', function: {name: 'get_weather', description: 'get weather', parameters: {type: 'object'}}},
        ],
      }),
    })
    expect(res.status).toBe(200)
    const body: any = await res.json()
    expect(body.choices[0].finish_reason).toBe('tool_calls')
    expect(body.choices[0].message.content).toBeNull()
    const tc = body.choices[0].message.tool_calls[0]
    expect(tc.type).toBe('function')
    expect(tc.function.name).toBe('get_weather')
    expect(JSON.parse(tc.function.arguments)).toEqual({city: 'SF'})
    expect(tc.id).toMatch(/^call_/)
  })

  test('stream parses tool call from split chunks', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        stream: true,
        messages: [{role: 'user', content: 'TOOL:get_weather:{"city":"SF"}'}],
        tools: [
          {type: 'function', function: {name: 'get_weather', description: 'get weather', parameters: {type: 'object'}}},
        ],
      }),
    })
    expect(res.status).toBe(200)
    const chunks = await sseChunks(res)
    const toolCallChunks = chunks.filter((c) => c.choices?.[0]?.delta?.tool_calls)
    expect(toolCallChunks.length).toBe(1)
    const tc = toolCallChunks[0].choices[0].delta.tool_calls[0]
    expect(tc.function.name).toBe('get_weather')
    expect(JSON.parse(tc.function.arguments)).toEqual({city: 'SF'})
    expect(tc.id).toMatch(/^call_/)
    const finish = chunks.find((c) => c.choices?.[0]?.finish_reason)
    expect(finish.choices[0].finish_reason).toBe('tool_calls')
    expect(chunks[chunks.length - 1].done).toBe(true)
  })

  test('unknown tool name stays text', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        messages: [{role: 'user', content: 'TOOL:unknown_fn:{}'}],
        tools: [
          {type: 'function', function: {name: 'get_weather', description: 'get weather', parameters: {type: 'object'}}},
        ],
      }),
    })
    expect(res.status).toBe(200)
    const body: any = await res.json()
    expect(body.choices[0].finish_reason).toBe('stop')
    expect(body.choices[0].message.content).toContain('unknown_fn')
  })
})

describe('permission request', () => {
  let stop: () => Promise<void>
  let base: string
  let recordPath: string

  beforeEach(async () => {
    recordPath = path.join(os.tmpdir(), `devin-bridge-record-${Math.random().toString(36).slice(2)}.json`)
    const cfg = makeConfig({acpCommand: ['bun', FAKE_AGENT]})
    process.env.DEVIN_FAKE_RECORD = recordPath
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    delete process.env.DEVIN_FAKE_RECORD
    await stop()
    fs.rmSync(recordPath, {force: true})
  })

  test('answers permission request with the reject option', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'PERM SAY:done'}]}),
    })
    expect(res.status).toBe(200)
    await res.json()
    // Allow the fake agent to persist the record.
    await new Promise((r) => setTimeout(r, 100))
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
    expect(record.permissionOutcomes.length).toBe(1)
    expect(record.permissionOutcomes[0].outcome.outcome).toBe('selected')
    expect(record.permissionOutcomes[0].outcome.optionId).toBe('reject_once')
  })
})

describe('model selection', () => {
  let stop: () => Promise<void>
  let base: string
  let recordPath: string

  beforeEach(async () => {
    recordPath = path.join(os.tmpdir(), `devin-bridge-record-${Math.random().toString(36).slice(2)}.json`)
    process.env.DEVIN_FAKE_RECORD = recordPath
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    delete process.env.DEVIN_FAKE_RECORD
    await stop()
    fs.rmSync(recordPath, {force: true})
  })

  test('known model calls set_config_option', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'claude-sonnet-5-5-medium', messages: [{role: 'user', content: 'SAY:ok'}]}),
    })
    expect(res.status).toBe(200)
    await res.json()
    await new Promise((r) => setTimeout(r, 100))
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
    expect(
      record.setConfigOption.some((c: any) => c.configId === 'model' && c.value === 'claude-sonnet-5-5-medium'),
    ).toBe(true)
  })

  test('unknown model returns 400', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'nonexistent-xyz', messages: [{role: 'user', content: 'SAY:ok'}]}),
    })
    expect(res.status).toBe(400)
    const body: any = await res.json()
    expect(body.error.message).toContain('model not found')
  })

  test('mode is set to ask', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'SAY:ok'}]}),
    })
    expect(res.status).toBe(200)
    await res.json()
    await new Promise((r) => setTimeout(r, 100))
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
    expect(record.setMode.some((m: any) => m.modeId === 'ask')).toBe(true)
  })
})

describe('auth failure', () => {
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    process.env.DEVIN_FAKE_AUTHFAIL = '1'
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    delete process.env.DEVIN_FAKE_AUTHFAIL
    await stop()
  })

  test('returns 503 with sign-in message', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'SAY:ok'}]}),
    })
    expect(res.status).toBe(503)
    const body: any = await res.json()
    expect(body.error.message).toContain('devin auth login')
  })
})

describe('child respawn after exit', () => {
  let stop: () => Promise<void>
  let base: string

  beforeEach(async () => {
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    await stop()
  })

  test('serves a request after the child exits and is respawned', async () => {
    // First request spawns the child and completes; the EXIT marker makes the
    // fake agent exit after responding.
    const res1 = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'EXIT'}]}),
    })
    expect(res1.status).toBe(200)
    // Wait for the onExit handler to clear the child.
    await new Promise((r) => setTimeout(r, 300))
    // Next request forces a respawn and completes normally.
    const res2 = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'DELAY:300\nSAY:second'}]}),
    })
    expect(res2.status).toBe(200)
    const body2: any = await res2.json()
    expect(body2.choices[0].message.content).toBe('second')
  })
})

describe('streaming cleanup', () => {
  let stop: () => Promise<void>
  let base: string
  let recordPath: string

  beforeEach(async () => {
    recordPath = path.join(os.tmpdir(), `devin-bridge-record-${Math.random().toString(36).slice(2)}.json`)
    process.env.DEVIN_FAKE_RECORD = recordPath
    const cfg = makeConfig()
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    delete process.env.DEVIN_FAKE_RECORD
    await stop()
    fs.rmSync(recordPath, {force: true})
  })

  test('streaming request never closes the session mid-prompt', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        stream: true,
        messages: [{role: 'user', content: 'DELAY:300\nSAY:hello'}],
      }),
    })
    expect(res.status).toBe(200)
    // Consume the full stream so cleanup runs at stream end, not mid-prompt.
    await res.text()
    await new Promise((r) => setTimeout(r, 150))
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
    expect(record.closeWhilePrompting.length).toBe(0)
    expect(record.closes.length).toBe(1)
  })

  test('non-stream request records a close after the prompt finishes', async () => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({model: 'default', messages: [{role: 'user', content: 'SAY:hello'}]}),
    })
    expect(res.status).toBe(200)
    await res.json()
    await new Promise((r) => setTimeout(r, 150))
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
    expect(record.closeWhilePrompting.length).toBe(0)
    expect(record.closes.length).toBe(1)
  })
})

describe('streaming concurrency', () => {
  let stop: () => Promise<void>
  let base: string
  let recordPath: string

  beforeEach(async () => {
    recordPath = path.join(os.tmpdir(), `devin-bridge-record-${Math.random().toString(36).slice(2)}.json`)
    process.env.DEVIN_FAKE_RECORD = recordPath
    const cfg = makeConfig({maxConcurrent: 1})
    const started = await startBridge(cfg)
    base = started.base
    stop = started.stop
  })

  afterEach(async () => {
    delete process.env.DEVIN_FAKE_RECORD
    await stop()
    fs.rmSync(recordPath, {force: true})
  })

  test('with MAX_CONCURRENT=1 a second streaming request does not start before the first finishes', async () => {
    // Start two streaming requests concurrently. With maxConcurrent=1 the second
    // must wait for the first stream to finish (cleanup releases the slot).
    const req1 = fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        stream: true,
        messages: [{role: 'user', content: 'DELAY:300\nSAY:first'}],
      }),
    })
    const req2 = fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        model: 'default',
        stream: true,
        messages: [{role: 'user', content: 'DELAY:300\nSAY:second'}],
      }),
    })
    const [res1, res2] = await Promise.all([req1, req2])
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    // Consume both streams fully.
    const [t1, t2] = await Promise.all([res1.text(), res2.text()])
    expect(t1).toContain('[DONE]')
    expect(t2).toContain('[DONE]')
    await new Promise((r) => setTimeout(r, 150))
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
    // Both sessions should have been closed (no mid-prompt closes).
    expect(record.closeWhilePrompting.length).toBe(0)
    expect(record.closes.length).toBe(2)
    expect(record.promptStarts.length).toBe(2)
    expect(record.promptStarts[1]).toBeGreaterThanOrEqual(record.promptEnds[0])
  })
})
