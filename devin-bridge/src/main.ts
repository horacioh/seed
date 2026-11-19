import * as crypto from 'node:crypto'
import * as fs from 'node:fs/promises'
import {AcpClient, type AcpContentBlock} from './acp.js'
import {loadConfig, type BridgeConfig} from './config.js'
import {
  errorBody,
  finishReason,
  estimateUsage,
  type ChatCompletionRequest,
  type ChatTool,
  type ModelEntry,
} from './openai.js'
import {renderPrompt, type ChatMessage} from './prompt.js'
import {ToolCallSplitter, type ParsedToolCall} from './toolcalls.js'

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    // Compare against a fixed-length buffer to avoid leaking length info.
    crypto.timingSafeEqual(ab, ab)
    return false
  }
  return crypto.timingSafeEqual(ab, bb)
}

function newId(): string {
  return 'chatcmpl-' + Math.random().toString(36).slice(2, 14)
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'content-type': 'application/json'},
  })
}

type ModelCache = {at: number; models: ModelEntry[]}

class Bridge {
  private readonly cfg: BridgeConfig
  private readonly acp: AcpClient
  private modelCache: ModelCache | null = null
  private readonly semaphore: {active: number; queue: Array<() => void>}

  constructor(cfg: BridgeConfig) {
    this.cfg = cfg
    this.acp = new AcpClient({
      command: cfg.acpCommand,
      workDir: cfg.workDir,
      mode: cfg.mode,
      timeoutSecs: cfg.timeoutSecs,
      log: (msg) => console.error(`[acp] ${msg}`),
    })
    this.semaphore = {active: 0, queue: []}
  }

  private async acquire(): Promise<void> {
    if (this.semaphore.active < this.cfg.maxConcurrent) {
      this.semaphore.active += 1
      return
    }
    await new Promise<void>((resolve) => this.semaphore.queue.push(resolve))
    this.semaphore.active += 1
  }

  private release(): void {
    this.semaphore.active -= 1
    const next = this.semaphore.queue.shift()
    if (next) next()
  }

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname === '/health' && req.method === 'GET') return json(200, {status: 'ok'})
    if (url.pathname.startsWith('/v1')) {
      if (!this.authorize(req))
        return json(401, errorBody('Missing or invalid API key', 'invalid_request_error', 'invalid_api_key'))
      if (url.pathname === '/v1/models' && req.method === 'GET') return this.handleModels()
      if (url.pathname === '/v1/chat/completions' && req.method === 'POST') return this.handleChat(req)
      return json(404, errorBody('Not found', 'invalid_request_error'))
    }
    return json(404, errorBody('Not found', 'invalid_request_error'))
  }

  private authorize(req: Request): boolean {
    const auth = req.headers.get('authorization') ?? ''
    const match = /^Bearer\s+(.+)$/.exec(auth)
    if (!match || match[1] === undefined) return false
    return timingSafeEqual(match[1], this.cfg.apiKey)
  }

  private async handleModels(): Promise<Response> {
    if (this.modelCache && Date.now() - this.modelCache.at < 10 * 60 * 1000) {
      return json(200, {object: 'list', data: this.modelCache.models})
    }
    try {
      const list = await this.acp.probeModels()
      const data: ModelEntry[] = [{id: 'default', object: 'model', owned_by: 'devin'}]
      for (const opt of list.options) data.push({id: opt.value, object: 'model', owned_by: 'devin'})
      this.modelCache = {at: Date.now(), models: data}
      return json(200, {object: 'list', data})
    } catch (err) {
      return this.acpErrorToResponse(err)
    }
  }

  private async handleChat(req: Request): Promise<Response> {
    let body: ChatCompletionRequest
    try {
      body = (await req.json()) as ChatCompletionRequest
    } catch {
      return json(400, errorBody('Invalid JSON body', 'invalid_request_error'))
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json(400, errorBody('messages must be a non-empty array', 'invalid_request_error'))
    }
    const tools = Array.isArray(body.tools) ? body.tools : undefined
    const toolNames = tools?.map((t) => t.function.name) ?? null
    const promptBlocks = renderPrompt({messages: body.messages as ChatMessage[], tools, toolChoice: body.tool_choice})
    const promptChars = promptBlocks.reduce((n, b) => n + (b.type === 'text' ? b.text.length : 0), 0)

    await this.acquire()
    let sessionId: string | undefined
    let cwd: string | undefined
    // Cleanup runs once when the request finishes: here for non-stream and failed requests, at the
    // end of the stream (finish, error, or client cancel) once a stream has been handed back.
    let cleaned = false
    const cleanup = async () => {
      if (cleaned) return
      cleaned = true
      if (sessionId) await this.acp.close(sessionId).catch(() => {})
      if (cwd) await fs.rm(cwd, {recursive: true, force: true}).catch(() => {})
      this.release()
    }
    let streaming = false
    try {
      await this.acp.ensureReady()
      cwd = await this.acp.makeWorkDir()
      sessionId = await this.acp.newSession(cwd)
      if (body.model && body.model !== 'default') {
        try {
          await this.acp.setModel(sessionId, body.model)
        } catch (err) {
          const e = err as Error & {code?: number}
          if (typeof e.code === 'number' && e.code === -32602) {
            return json(400, errorBody(`model not found: ${body.model}`, 'invalid_request_error'))
          }
          throw err
        }
      }
      if (body.stream === true) {
        const response = this.streamChat(req, sessionId, promptBlocks, toolNames, promptChars, body, cleanup)
        streaming = true
        return response
      }
      return await this.nonStreamChat(req, sessionId, promptBlocks, toolNames, promptChars, body)
    } catch (err) {
      return this.acpErrorToResponse(err)
    } finally {
      if (!streaming) await cleanup()
    }
  }

  private async nonStreamChat(
    req: Request,
    sessionId: string,
    promptBlocks: AcpContentBlock[],
    toolNames: string[] | null,
    promptChars: number,
    body: ChatCompletionRequest,
  ): Promise<Response> {
    const splitter = new ToolCallSplitter(toolNames)
    let text = ''
    const toolCalls: ParsedToolCall[] = []
    const result = await this.acp.prompt(sessionId, promptBlocks, {
      onChunk: (delta) => {
        text += delta
      },
      signal: req.signal,
    })
    const fed = splitter.feed(text)
    const flushed = splitter.flush()
    const allText = fed.text + flushed.text
    for (const tc of [...fed.toolCalls, ...flushed.toolCalls]) toolCalls.push(tc)
    const completionChars = allText.length + toolCalls.reduce((n, tc) => n + tc.function.arguments.length, 0)
    const finish = toolCalls.length > 0 ? 'tool_calls' : finishReason(result.stopReason)
    const message: {role: 'assistant'; content: string | null; tool_calls?: ParsedToolCall[]} = {
      role: 'assistant',
      content: toolCalls.length > 0 ? null : allText || null,
    }
    if (toolCalls.length > 0) message.tool_calls = toolCalls
    const usage = estimateUsage(promptChars, completionChars)
    return json(200, {
      id: newId(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model,
      choices: [{index: 0, message, finish_reason: finish}],
      usage,
    })
  }

  private streamChat(
    req: Request,
    sessionId: string,
    promptBlocks: AcpContentBlock[],
    toolNames: string[] | null,
    promptChars: number,
    body: ChatCompletionRequest,
    cleanup: () => Promise<void>,
  ): Response {
    const id = newId()
    const created = Math.floor(Date.now() / 1000)
    const model = body.model
    const includeUsage = body.stream_options?.include_usage === true
    const splitter = new ToolCallSplitter(toolNames)
    let completionChars = 0
    let toolCallIndex = 0
    let stopReason: string | undefined
    let cancelled = false

    const stream = new ReadableStream({
      start: async (controller) => {
        const encoder = new TextEncoder()
        // After a client cancel the controller rejects enqueues; chunks still arriving from ACP are dropped
        // here instead of throwing inside the ACP read loop.
        const send = (obj: unknown) => {
          if (!cancelled) controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
        }
        const sendDone = () => {
          if (!cancelled) controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        }
        send({
          id,
          object: 'chat.completion.chunk',
          created,
          model,
          choices: [{index: 0, delta: {role: 'assistant', content: ''}, finish_reason: null}],
        })
        try {
          const result = await this.acp.prompt(sessionId, promptBlocks, {
            onChunk: (delta) => {
              const {text, toolCalls} = splitter.feed(delta)
              if (text) {
                completionChars += text.length
                send({
                  id,
                  object: 'chat.completion.chunk',
                  created,
                  model,
                  choices: [{index: 0, delta: {content: text}, finish_reason: null}],
                })
              }
              for (const tc of toolCalls) {
                completionChars += tc.function.arguments.length
                send({
                  id,
                  object: 'chat.completion.chunk',
                  created,
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: {
                        tool_calls: [
                          {
                            index: toolCallIndex,
                            id: tc.id,
                            type: 'function',
                            function: {name: tc.function.name, arguments: tc.function.arguments},
                          },
                        ],
                      },
                      finish_reason: null,
                    },
                  ],
                })
                toolCallIndex += 1
              }
            },
            signal: req.signal,
          })
          stopReason = result.stopReason
          const flushed = splitter.flush()
          if (flushed.text) {
            completionChars += flushed.text.length
            send({
              id,
              object: 'chat.completion.chunk',
              created,
              model,
              choices: [{index: 0, delta: {content: flushed.text}, finish_reason: null}],
            })
          }
          for (const tc of flushed.toolCalls) {
            completionChars += tc.function.arguments.length
            send({
              id,
              object: 'chat.completion.chunk',
              created,
              model,
              choices: [
                {
                  index: 0,
                  delta: {
                    tool_calls: [
                      {
                        index: toolCallIndex,
                        id: tc.id,
                        type: 'function',
                        function: {name: tc.function.name, arguments: tc.function.arguments},
                      },
                    ],
                  },
                  finish_reason: null,
                },
              ],
            })
            toolCallIndex += 1
          }
          const finish = toolCallIndex > 0 ? 'tool_calls' : finishReason(stopReason)
          send({
            id,
            object: 'chat.completion.chunk',
            created,
            model,
            choices: [{index: 0, delta: {}, finish_reason: finish}],
          })
          if (includeUsage) {
            const usage = estimateUsage(promptChars, completionChars)
            send({id, object: 'chat.completion.chunk', created, model, choices: [], usage})
          }
          sendDone()
        } catch (err) {
          const message = (err as Error).message || 'stream error'
          send({error: {message, type: 'server_error'}})
        } finally {
          if (!cancelled) controller.close()
          await cleanup()
        }
      },
      cancel: async () => {
        // Client disconnected: cancel the ACP session, then run cleanup.
        cancelled = true
        await this.acp.cancel(sessionId).catch(() => {})
        await cleanup()
      },
    })
    return new Response(stream, {
      headers: {'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive'},
    })
  }

  private acpErrorToResponse(err: unknown): Response {
    const e = err as Error & {isAuth?: boolean}
    if (e.isAuth) {
      return json(
        503,
        errorBody(
          'Devin CLI is not signed in. Run "devin auth login --force-manual-token-flow" in the devin-bridge container.',
          'server_error',
          'devin_not_signed_in',
        ),
      )
    }
    return json(502, errorBody(e.message || 'ACP failure', 'server_error', 'acp_error'))
  }
}

async function main(): Promise<void> {
  const cfg = loadConfig()
  const bridge = new Bridge(cfg)
  const server = Bun.serve({
    hostname: cfg.hostname,
    port: cfg.port,
    fetch: (req) => bridge.handle(req),
  })
  console.log(`devin-bridge listening on http://${server.hostname}:${server.port}`)
}

export {Bridge, main}

if (import.meta.main) await main()
