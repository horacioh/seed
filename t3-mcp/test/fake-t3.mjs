#!/usr/bin/env node
// Fake T3 CLI for tests. Backed by a JSON state file (path in T3_FAKE_STATE) so
// tests can flip a thread from running to idle. Supports: thread list/show/start/send.
import * as fs from 'node:fs'

const statePath = process.env.T3_FAKE_STATE

function loadState() {
  if (!statePath) return {threads: {}}
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'))
  } catch {
    return {threads: {}}
  }
}

function saveState(state) {
  if (!statePath) return
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
}

function readStdinSync() {
  // Read all of stdin synchronously. fs.readFileSync(0) blocks until EOF and
  // works reliably with both heredoc and execFile piped input.
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

async function readStdin() {
  return readStdinSync()
}

function threadSummary(t) {
  return {
    threadId: t.threadId,
    projectId: t.projectId,
    title: t.title,
    link: t.link ?? `https://app.t3.codes/threads/test/${t.threadId}`,
    status: t.status,
    latestRunId: t.latestRunId ?? null,
    providerInstanceId: t.providerInstanceId ?? 'fake',
    model: t.model ?? 'fake-model',
    runtimeMode: t.runtimeMode ?? 'full-access',
    settled: t.settled ?? false,
    pullRequests: t.pullRequests ?? [],
    createdAt: t.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: t.updatedAt ?? '2026-01-01T00:00:00.000Z',
  }
}

const argv = process.argv.slice(2)
// Boolean flags take no value; value flags consume the next arg.
const BOOL_FLAGS = new Set(['json', 'wait'])
const flags = {}
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a.startsWith('--')) {
    const name = a.slice(2)
    if (BOOL_FLAGS.has(name)) {
      flags[name] = true
    } else {
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        flags[name] = next
        i++
      } else {
        flags[name] = true
      }
    }
  } else {
    positional.push(a)
  }
}

const cmd = positional[0]
const sub = positional[1]

async function main() {
  if (cmd !== 'thread') {
    process.stderr.write(`fake-t3: unknown command ${cmd}\n`)
    process.exit(1)
  }
  const state = loadState()
  if (sub === 'list') {
    const project = flags.project
    const threads = Object.values(state.threads)
      .filter((t) => !project || t.projectId === project)
      .map(threadSummary)
    if (flags.json) {
      process.stdout.write(JSON.stringify(threads))
    } else {
      process.stdout.write(threads.map((t) => t.threadId).join('\n'))
    }
    return
  }
  if (sub === 'show') {
    const threadId = positional[2]
    const t = state.threads[threadId]
    if (!t) {
      process.stderr.write(`thread not found: ${threadId}\n`)
      process.exit(1)
    }
    const messages = t.messages ?? []
    const n = flags.messages ? parseInt(flags.messages, 10) : 5
    const out = {
      thread: {
        threadId: t.threadId,
        projectId: t.projectId,
        title: t.title,
        link: t.link ?? `https://app.t3.codes/threads/test/${t.threadId}`,
        status: t.status,
        latestRunId: t.latestRunId ?? null,
        activeRunId: t.activeRunId ?? null,
        providerInstanceId: t.providerInstanceId ?? 'fake',
        model: t.model ?? 'fake-model',
        runtimeMode: t.runtimeMode ?? 'full-access',
        branch: t.branch ?? null,
        worktreePath: t.worktreePath ?? null,
        runCount: t.runCount ?? 1,
        pendingRequestCount: t.pendingRequestCount ?? 0,
        pullRequests: t.pullRequests ?? [],
        settled: t.settled ?? false,
        createdAt: t.createdAt ?? '2026-01-01T00:00:00.000Z',
        updatedAt: t.updatedAt ?? '2026-01-01T00:00:00.000Z',
      },
      messages: messages.slice(-n),
    }
    if (flags.json) {
      process.stdout.write(JSON.stringify(out))
    } else {
      process.stdout.write(JSON.stringify(out, null, 2))
    }
    return
  }
  if (sub === 'start') {
    const project = positional[2]
    const messageArg = positional[3]
    const message = messageArg === '-' ? await readStdin() : messageArg ?? ''
    const threadId = 'thread-' + Math.random().toString(36).slice(2, 10)
    const title = flags.title ?? message.split('\n')[0].slice(0, 80)
    const t = {
      threadId,
      projectId: project,
      title,
      status: 'running',
      latestRunId: 'run:' + threadId + ':1',
      activeRunId: 'run:' + threadId + ':1',
      runCount: 1,
      pendingRequestCount: 0,
      messages: [{role: 'user', runId: 'run:' + threadId + ':1', text: message}],
      pullRequests: [],
      branch: flags.branch ?? null,
      worktreePath: null,
      providerInstanceId: flags.provider ?? null,
      model: flags.model ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    state.threads[threadId] = t
    saveState(state)
    if (flags.json) {
      process.stdout.write(JSON.stringify({threadId, title, link: t.link, status: 'running'}))
    } else {
      process.stdout.write(threadId)
    }
    return
  }
  if (sub === 'send') {
    const threadId = positional[2]
    const messageArg = positional[3]
    const message = messageArg === '-' ? await readStdin() : messageArg ?? ''
    const t = state.threads[threadId]
    if (!t) {
      process.stderr.write(`thread not found: ${threadId}\n`)
      process.exit(1)
    }
    t.messages.push({role: 'user', runId: t.latestRunId, text: message})
    // Start a new run if idle; if busy, queue.
    if (t.activeRunId === null) {
      const runNum = (t.runCount ?? 0) + 1
      const runId = 'run:' + threadId + ':' + runNum
      t.latestRunId = runId
      t.activeRunId = runId
      t.runCount = runNum
      t.status = 'running'
    }
    t.updatedAt = new Date().toISOString()
    saveState(state)
    if (flags.json) {
      process.stdout.write(JSON.stringify({threadId, status: t.status}))
    } else {
      process.stdout.write(threadId)
    }
    return
  }
  process.stderr.write(`fake-t3: unknown thread subcommand ${sub}\n`)
  process.exit(1)
}

await main()
