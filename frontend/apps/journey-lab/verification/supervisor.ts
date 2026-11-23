import {spawn, type ChildProcess} from 'node:child_process'
import {mkdtemp, mkdir, rm} from 'node:fs/promises'
import {createServer} from 'node:net'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {once} from 'node:events'

/** Reserve an unused loopback TCP port without inspecting or terminating other listeners. */
export async function unusedPort(): Promise<number> {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not allocate a local port.')
  const port = address.port
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  return port
}

/** Construct from an allowlist, not a copy of process.env: no relay, SMTP, analytics or production secrets. */
export function isolatedEnvironment(home: string, source: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return {
    PATH: source.PATH,
    LD_LIBRARY_PATH: source.LD_LIBRARY_PATH,
    HOME: home,
    TMPDIR: home,
    NODE_ENV: 'development',
    SEED_VAULT_DEFAULT_NOTIFY_SERVER: '',
    SEED_VAULT_SMTP_HOST: '',
    SEED_VAULT_EMAIL_RELAY_URL: '',
    SEED_VAULT_ADMIN_SECRET: '',
    SEED_VAULT_INVITE_ONLY: 'false',
    DO_NOT_TRACK: '1',
  }
}

/** Supervisor owns only its directory and children; failed port binds are errors, never permission to kill listeners. */
export async function createSupervisor() {
  const directory = await mkdtemp(path.join(tmpdir(), 'seed-journey-'))
  await mkdir(path.join(directory, 'home'))
  const children: ChildProcess[] = []
  const waits = new Set<() => void>()
  let closed = false
  return {
    directory,
    spawn(command: string, args: string[], cwd: string, extra: NodeJS.ProcessEnv = {}) {
      if (closed) throw new Error('Supervisor is closed.')
      const child = spawn(command, args, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
        env: {...isolatedEnvironment(path.join(directory, 'home')), ...extra},
      })
      children.push(child)
      let output = ''
      let failed = false
      const listeners = new Set<() => void>()
      const collect = (data: Buffer) => {
        // Private, bounded capture. Raw stdout may contain verification codes and is never exported or echoed.
        output = (output + data.toString()).slice(-128_000)
        for (const listener of listeners) listener()
      }
      child.stdout!.on('data', collect)
      child.stderr!.on('data', collect)
      child.on('error', () => {
        failed = true
        for (const listener of listeners) listener()
      })
      child.on('exit', () => {
        failed = true
        for (const listener of listeners) listener()
      })
      return {
        child,
        discardOutput() {
          output = ''
        },
        async waitFor(pattern: RegExp, timeout = 60_000): Promise<RegExpMatchArray> {
          return new Promise((resolve, reject) => {
            const cleanup = () => {
              clearTimeout(timer)
              listeners.delete(check)
              waits.delete(cancel)
            }
            const cancel = () => {
              cleanup()
              reject(new Error('Owned process stopped.'))
            }
            const check = () => {
              const match = output.match(pattern)
              if (match) {
                cleanup()
                resolve(match)
              } else if (failed) {
                cleanup()
                reject(new Error('Owned process exited before readiness. Raw output withheld.'))
              }
            }
            const timer = setTimeout(() => {
              cleanup()
              reject(new Error('Owned process readiness timed out. Raw output withheld.'))
            }, timeout)
            waits.add(cancel)
            listeners.add(check)
            check()
          })
        },
      }
    },
    async close() {
      if (closed) return
      closed = true
      for (const cancel of waits) cancel()
      await Promise.all(
        children.map(async (child) => {
          if (child.exitCode !== null || child.signalCode !== null || !child.pid) return
          const exited = once(child, 'exit').catch(() => undefined)
          const pid = child.pid
          const stop = (signal: NodeJS.Signals) => {
            try {
              process.kill(-pid, signal)
            } catch {
              child.kill(signal)
            }
          }
          stop('SIGTERM')
          const timer = setTimeout(() => {
            if (child.exitCode === null && child.signalCode === null) stop('SIGKILL')
          }, 5000)
          await exited
          clearTimeout(timer)
        }),
      )
      await rm(directory, {recursive: true, force: true})
    },
  }
}
