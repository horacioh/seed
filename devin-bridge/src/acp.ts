import {type Subprocess} from 'bun'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

/** A content block of an ACP prompt: text or image. */
export type AcpContentBlock = {type: 'text'; text: string} | {type: 'image'; mimeType: string; data: string}

/** A notification emitted by the agent during `session/prompt` carrying assistant text. */
export type AcpMessageChunk = {sessionId: string; text: string}

/** A request the agent makes of the client during a prompt (e.g. permission). */
export type AcpClientRequest = {
  id: number | string
  method: string
  params: unknown
}

/** The result of `session/prompt`. */
export type AcpPromptResult = {
  stopReason: string
  usage?: {totalTokens?: number; inputTokens?: number; outputTokens?: number}
}

/** A model option from a probe session's config. */
export type AcpModelOption = {value: string; name: string}

/** The model list resolved from a probe session. */
export type AcpModelList = {currentValue: string; options: AcpModelOption[]}

type PendingRequest = {
  resolve: (value: unknown) => void
  reject: (err: Error) => void
  method: string
}

type PromptHandlers = {
  /** Called for each `agent_message_chunk` text delta. */
  onChunk: (text: string) => void
  /** Called when the agent sends a client-side request (e.g. permission). */
  onClientRequest?: (req: AcpClientRequest) => void
  /** Optional abort signal; on abort the session is cancelled. */
  signal?: AbortSignal
}

/**
 * JSON-RPC 2.0 client over a long-lived child process's stdin/stdout. The child
 * is lazily spawned on first use and respawned after it exits; pending
 * requests reject when that happens. One child is shared by all requests.
 */
export class AcpClient {
  private child: Subprocess | null = null
  private nextId = 1
  private pending = new Map<number | string, PendingRequest>()
  private promptHandlers = new Map<string, PromptHandlers>()
  private buffer = ''
  private closing = false
  private readonly command: string[]
  private readonly workDir: string
  private readonly mode: string
  private readonly timeoutSecs: number
  private readonly log: (msg: string) => void

  constructor(opts: {
    command: string[]
    workDir: string
    mode: string
    timeoutSecs: number
    log?: (msg: string) => void
  }) {
    this.command = opts.command
    this.workDir = opts.workDir
    this.mode = opts.mode
    this.timeoutSecs = opts.timeoutSecs
    this.log = opts.log ?? (() => {})
  }

  /** Spawns the child if it is not running and performs the `initialize` handshake. */
  async ensureReady(): Promise<void> {
    if (this.child && this.child.exitCode === null && this.child.killed === false) return
    await this.spawn()
    await this.call('initialize', {
      protocolVersion: 1,
      clientCapabilities: {fs: {readTextFile: false, writeTextFile: false}, terminal: false},
    })
  }

  private async spawn(): Promise<void> {
    this.child = Bun.spawn({
      cmd: this.command,
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'inherit',
      env: {...process.env},
      onExit: (child) => {
        this.log(`acp child exited code=${child.exitCode} signal=${child.signalCode}`)
        this.child = null
        const err = new Error('ACP agent exited')
        for (const pending of this.pending.values()) pending.reject(err)
        this.pending.clear()
        this.promptHandlers.clear()
        this.buffer = ''
      },
    })
    this.readLoop()
  }

  private async readLoop(): Promise<void> {
    const child = this.child
    if (!child || !child.stdout) return
    const stdout = child.stdout
    if (typeof stdout === 'number') return
    const reader = stdout.getReader()
    try {
      while (true) {
        const {value, done} = await reader.read()
        if (done) break
        if (value) {
          this.buffer += new TextDecoder().decode(value)
          let nl: number
          while ((nl = this.buffer.indexOf('\n')) >= 0) {
            const line = this.buffer.slice(0, nl).trim()
            this.buffer = this.buffer.slice(nl + 1)
            if (line) this.handleLine(line)
          }
        }
      }
    } catch (err) {
      this.log(`acp read error: ${(err as Error).message}`)
    }
  }

  private handleLine(line: string): void {
    let obj: any
    try {
      obj = JSON.parse(line)
    } catch {
      return
    }
    if (obj.method === 'session/update') {
      this.handleUpdate(obj.params)
      return
    }
    if (obj.id !== undefined && obj.method !== undefined && obj.result === undefined && obj.error === undefined) {
      // A request from the agent to the client.
      this.handleClientRequest(obj)
      return
    }
    if (obj.id !== undefined && (obj.result !== undefined || obj.error !== undefined)) {
      const pending = this.pending.get(obj.id)
      if (pending) {
        this.pending.delete(obj.id)
        if (obj.error) {
          pending.reject(this.toError(obj.error, pending.method))
        } else {
          pending.resolve(obj.result)
        }
      }
    }
  }

  private handleUpdate(params: any): void {
    if (!params || typeof params.sessionId !== 'string') return
    const update = params.update
    if (!update || update.sessionUpdate !== 'agent_message_chunk') return
    const content = update.content
    if (content && content.type === 'text' && typeof content.text === 'string') {
      this.promptHandlers.get(params.sessionId)?.onChunk(content.text)
    }
  }

  private handleClientRequest(req: any): void {
    if (req.method === 'session/request_permission') {
      const sessionId = req.params?.sessionId
      const handlers = typeof sessionId === 'string' ? this.promptHandlers.get(sessionId) : undefined
      handlers?.onClientRequest?.({id: req.id, method: req.method, params: req.params})
      const options: any[] = Array.isArray(req.params?.options) ? req.params.options : []
      const reject = options.find((o) => o?.kind === 'reject_once' || o?.kind === 'reject_always')
      const outcome = reject
        ? {outcome: {outcome: 'selected', optionId: reject.optionId}}
        : {outcome: {outcome: 'cancelled'}}
      this.write({jsonrpc: '2.0', id: req.id, result: outcome})
      return
    }
    // Any other client-directed request is unsupported.
    this.write({
      jsonrpc: '2.0',
      id: req.id,
      error: {code: -32601, message: `Unsupported client request: ${req.method}`},
    })
  }

  private toError(err: any, method: string): Error {
    const message = typeof err.message === 'string' ? err.message : `ACP ${method} failed`
    const e = new Error(message) as Error & {code?: number; data?: unknown; isAuth?: boolean}
    if (typeof err.code === 'number') e.code = err.code
    if (err.data !== undefined) e.data = err.data
    if (/auth|login|unauthenticated|credential/i.test(message)) e.isAuth = true
    return e
  }

  private write(obj: unknown): void {
    const child = this.child
    if (!child || !child.stdin) return
    const stdin = child.stdin
    if (typeof stdin === 'number') return
    stdin.write(JSON.stringify(obj) + '\n')
  }

  /** Sends a JSON-RPC request and resolves with its result. */
  call<T = unknown>(method: string, params?: unknown): Promise<T> {
    if (!this.child) {
      return Promise.reject(new Error('ACP agent is not running'))
    }
    const id = this.nextId++
    const promise = new Promise<T>((resolve, reject) => {
      this.pending.set(id, {resolve: resolve as (v: unknown) => void, reject, method})
      this.write({jsonrpc: '2.0', id, method, params: params ?? {}})
    })
    return promise
  }

  /** Creates a fresh session, sets the configured mode, and returns the session id. */
  async newSession(cwd: string): Promise<string> {
    const result = await this.call<{sessionId: string}>('session/new', {cwd, mcpServers: []})
    const sessionId = result.sessionId
    await this.call('session/set_mode', {sessionId, modeId: this.mode}).catch(() => {})
    return sessionId
  }

  /** Sets the model for a session; throws on an unknown model value. */
  async setModel(sessionId: string, model: string): Promise<void> {
    await this.call('session/set_config_option', {sessionId, configId: 'model', value: model})
  }

  /** Probes a throwaway session to read the available model options. */
  async probeModels(): Promise<AcpModelList> {
    await this.ensureReady()
    const cwd = await this.makeWorkDir()
    let sessionId: string | undefined
    try {
      const result = await this.call<{sessionId: string; configOptions: any[]}>('session/new', {cwd, mcpServers: []})
      sessionId = result.sessionId
      const modelOption = result.configOptions.find((c) => c.id === 'model')
      const options: AcpModelOption[] = Array.isArray(modelOption?.options)
        ? modelOption.options.map((o: any) => ({value: o.value, name: o.name ?? o.value}))
        : []
      return {currentValue: modelOption?.currentValue ?? '', options}
    } finally {
      if (sessionId) await this.close(sessionId).catch(() => {})
      await fs.rm(cwd, {recursive: true, force: true}).catch(() => {})
    }
  }

  /** Runs a prompt, streaming `agent_message_chunk` text via `onChunk`. */
  async prompt(sessionId: string, prompt: AcpContentBlock[], handlers: PromptHandlers): Promise<AcpPromptResult> {
    this.promptHandlers.set(sessionId, handlers)
    let timer: ReturnType<typeof setTimeout> | undefined
    let aborted = false
    const onAbort = () => {
      aborted = true
      this.write({jsonrpc: '2.0', method: 'session/cancel', params: {sessionId}})
    }
    if (handlers.signal) {
      if (handlers.signal.aborted) onAbort()
      else handlers.signal.addEventListener('abort', onAbort, {once: true})
    }
    if (this.timeoutSecs > 0) {
      timer = setTimeout(() => {
        if (!aborted) {
          aborted = true
          this.write({jsonrpc: '2.0', method: 'session/cancel', params: {sessionId}})
        }
      }, this.timeoutSecs * 1000)
    }
    try {
      const result = await this.call<AcpPromptResult>('session/prompt', {sessionId, prompt})
      return result
    } finally {
      if (timer) clearTimeout(timer)
      if (handlers.signal) handlers.signal.removeEventListener('abort', onAbort)
      this.promptHandlers.delete(sessionId)
    }
  }

  /** Closes a session, ignoring errors. */
  async close(sessionId: string): Promise<void> {
    await this.call('session/close', {sessionId}).catch(() => {})
  }

  /** Sends a session/cancel notification (fire-and-forget). */
  async cancel(sessionId: string): Promise<void> {
    this.write({jsonrpc: '2.0', method: 'session/cancel', params: {sessionId}})
  }

  /** Creates a fresh empty working directory under the configured root. */
  async makeWorkDir(): Promise<string> {
    await fs.mkdir(this.workDir, {recursive: true})
    const dir = path.join(this.workDir, `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    await fs.mkdir(dir, {recursive: true})
    return dir
  }

  /** Tears down the child process. */
  async stop(): Promise<void> {
    this.closing = true
    const child = this.child
    if (child) {
      try {
        const stdin = child.stdin
        if (stdin && typeof stdin !== 'number') stdin.end()
      } catch {
        // ignore
      }
      try {
        await child
      } catch {
        // ignore
      }
    }
    this.child = null
  }
}
