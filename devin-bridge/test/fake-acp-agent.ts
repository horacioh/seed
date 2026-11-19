#!/usr/bin/env bun
/**
 * Scripted ACP agent for tests. Reads newline-delimited JSON-RPC from stdin and
 * replies on stdout. Behavior is driven by the prompt text:
 * - `SAY:<text>` streams `<text>` in `agent_message_chunk` notifications.
 * - `TOOL:<name>:<argsJson>` emits a ```` block for a tool call, split across
 *   chunk boundaries.
 * - `PERM` sends a `session/request_permission` first and records the outcome.
 * - `AUTHFAIL` returns an auth error on `session/new`.
 * - `DELAY:<ms>` keeps the prompt in flight for that long before replying.
 * - `STOP:<reason>` sets the prompt result's stopReason (default `end_turn`).
 *
 * Records `session/set_mode` and `session/set_config_option` calls to a JSON
 * file path given by `DEVIN_FAKE_RECORD` so tests can assert on them.
 */
import * as fs from 'node:fs'
import {TOOL_CALL_OPEN, TOOL_CALL_CLOSE} from '../src/toolcalls.js'

type JsonRpc = {jsonrpc: string; id?: number | string | null; method?: string; params?: any; result?: any; error?: any}

const recordPath = process.env.DEVIN_FAKE_RECORD
const record: {
  setMode: any[]
  setConfigOption: any[]
  permissionOutcomes: any[]
  closes: any[]
  closeWhilePrompting: string[]
  promptStarts: number[]
  promptEnds: number[]
} = {
  setMode: [],
  setConfigOption: [],
  permissionOutcomes: [],
  closes: [],
  closeWhilePrompting: [],
  promptStarts: [],
  promptEnds: [],
}

function write(obj: JsonRpc): void {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

function persist(): void {
  if (recordPath) fs.writeFileSync(recordPath, JSON.stringify(record, null, 2))
}

let sessionId = 'fake-session'
let initialized = false
// Track which sessions currently have a prompt in flight, so we can detect
// a session/close that arrives while a prompt is still running.
const prompting = new Set<string>()

function streamChunks(text: string, sid: string): void {
  // Split text into ~7-char chunks to exercise the streaming splitter.
  const chunkSize = 7
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize)
    write({
      jsonrpc: '2.0',
      method: 'session/update',
      params: {sessionId: sid, update: {sessionUpdate: 'agent_message_chunk', content: {type: 'text', text: chunk}}},
    })
  }
}

async function handle(line: string): Promise<void> {
  let msg: JsonRpc
  try {
    msg = JSON.parse(line)
  } catch {
    return
  }
  if (msg.method === 'initialize') {
    write({
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        protocolVersion: 1,
        agentCapabilities: {promptCapabilities: {image: true, audio: false, embeddedContext: true}},
        authMethods: [{id: 'devin-browser', name: 'Log in with browser', description: 'Sign in via your browser'}],
      },
    })
    initialized = true
    return
  }
  if (msg.method === 'session/new') {
    if (process.env.DEVIN_FAKE_AUTHFAIL === '1') {
      write({
        jsonrpc: '2.0',
        id: msg.id,
        error: {code: -32000, message: 'Not authenticated: please run devin auth login'},
      })
      return
    }
    sessionId = 'fake-' + Math.random().toString(36).slice(2, 8)
    write({
      jsonrpc: '2.0',
      id: msg.id,
      result: {
        sessionId,
        modes: {currentModeId: 'accept-edits', availableModes: [{id: 'accept-edits'}, {id: 'ask'}, {id: 'plan'}]},
        configOptions: [
          {
            id: 'mode',
            type: 'select',
            currentValue: 'accept-edits',
            options: [{value: 'accept-edits'}, {value: 'ask'}, {value: 'plan'}],
          },
          {
            id: 'model',
            type: 'select',
            currentValue: 'swe-2-high',
            options: [
              {value: 'swe-2-high', name: 'SWE-2'},
              {value: 'claude-sonnet-5-5-medium', name: 'Claude Sonnet 5.5'},
              {value: 'gemini-3-8-flash-medium', name: 'Gemini 3.8 Flash'},
            ],
          },
        ],
      },
    })
    return
  }
  if (msg.method === 'session/set_mode') {
    record.setMode.push(msg.params)
    persist()
    write({jsonrpc: '2.0', id: msg.id, result: {}})
    return
  }
  if (msg.method === 'session/set_config_option') {
    record.setConfigOption.push(msg.params)
    persist()
    if (msg.params?.configId === 'model') {
      const valid = ['swe-2-high', 'claude-sonnet-5-5-medium', 'gemini-3-8-flash-medium']
      if (!valid.includes(msg.params.value)) {
        write({
          jsonrpc: '2.0',
          id: msg.id,
          error: {code: -32602, message: `Invalid value '${msg.params.value}' for config option 'model'`},
        })
        return
      }
    }
    write({jsonrpc: '2.0', id: msg.id, result: {configOptions: []}})
    return
  }
  if (msg.method === 'session/prompt') {
    const promptText = (msg.params?.prompt ?? []).map((b: any) => (b.type === 'text' ? b.text : '')).join('')
    const sid = msg.params?.sessionId ?? sessionId
    prompting.add(sid)
    // EXIT: close the prompt then exit the process to test respawn.
    if (promptText.includes('EXIT')) {
      write({jsonrpc: '2.0', id: msg.id, result: {stopReason: 'end_turn', usage: {totalTokens: 1}}})
      setTimeout(() => process.exit(0), 50)
      return
    }
    // Permission mode
    if (promptText.includes('PERM')) {
      const permId = Math.floor(Math.random() * 100000)
      write({
        jsonrpc: '2.0',
        id: permId,
        method: 'session/request_permission',
        params: {
          sessionId: sid,
          options: [
            {optionId: 'allow_once', kind: 'allow_once'},
            {optionId: 'reject_once', kind: 'reject_once'},
          ],
        },
      })
      // Wait for the client's response; we read it from stdin in the main loop.
    }
    record.promptStarts.push(Date.now())
    persist()
    // DELAY:<ms> keeps the prompt in flight, so a close or a second prompt that arrives meanwhile is observable.
    const delayMatch = /DELAY:(\d+)/.exec(promptText)
    if (delayMatch) await new Promise((resolve) => setTimeout(resolve, Number(delayMatch[1])))
    // SAY: mode
    const sayMatch = /SAY:([^\n]*)/.exec(promptText)
    if (sayMatch && sayMatch[1] !== undefined) {
      streamChunks(sayMatch[1], sid)
    }
    // TOOL: mode — emit a tool-call block split across chunks.
    const toolMatch = /TOOL:([a-zA-Z0-9_]+):([^\n]*)/.exec(promptText)
    if (toolMatch) {
      const name = toolMatch[1]
      const args = toolMatch[2]
      const block = `${TOOL_CALL_OPEN}\n{"name":"${name}","arguments":${args}}\n${TOOL_CALL_CLOSE}`
      // Split the block into chunks that cross the opening and closing tags.
      const mid = Math.floor(block.length / 2)
      for (const chunk of [block.slice(0, mid), block.slice(mid)]) {
        write({
          jsonrpc: '2.0',
          method: 'session/update',
          params: {
            sessionId: sid,
            update: {sessionUpdate: 'agent_message_chunk', content: {type: 'text', text: chunk}},
          },
        })
      }
    }
    const stopMatch = /STOP:([a-z_]+)/.exec(promptText)
    const stopReason = stopMatch ? stopMatch[1] : 'end_turn'
    prompting.delete(sid)
    record.promptEnds.push(Date.now())
    persist()
    write({jsonrpc: '2.0', id: msg.id, result: {stopReason, usage: {totalTokens: 10, inputTokens: 5, outputTokens: 5}}})
    return
  }
  if (msg.method === 'session/close') {
    const sid = msg.params?.sessionId
    if (sid && prompting.has(sid)) record.closeWhilePrompting.push(sid)
    record.closes.push(msg.params)
    persist()
    write({jsonrpc: '2.0', id: msg.id, result: {}})
    return
  }
  if (msg.method === 'session/cancel') {
    // Acknowledge cancel as a no-op notification.
    return
  }
  // Respond to permission outcome (a response with id matching the perm request).
  if (msg.id !== undefined && msg.result !== undefined && msg.method === undefined) {
    record.permissionOutcomes.push(msg.result)
    persist()
    return
  }
  // Unknown request with id: respond with method not found.
  if (msg.id !== undefined && msg.method !== undefined) {
    write({jsonrpc: '2.0', id: msg.id, error: {code: -32601, message: 'Method not found'}})
    return
  }
}

async function main(): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of Bun.stdin.stream()) {
    buffer += decoder.decode(chunk)
    let nl: number
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (line) void handle(line)
    }
  }
  persist()
}

await main()
