import {createServer} from 'node:net'
import {once} from 'node:events'
import {existsSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {createSupervisor, isolatedEnvironment, unusedPort} from './supervisor.ts'

describe('disposable verifier boundary', () => {
  it('never inherits delivery, analytics or production credentials', () => {
    const env = isolatedEnvironment('/isolated', {
      PATH: '/bin',
      SMTP_HOST: 'prod',
      NOTIFY_EMAIL_RELAY_URL: 'prod',
      SEED_VAULT_EMAIL_RELAY_TOKEN: 'secret',
      SERVICE_ADMIN_SECRET: 'secret',
      SENTRY_DSN: 'prod',
    })
    expect(env.PATH).toBe('/bin')
    expect(env.NOTIFY_EMAIL_RELAY_URL).toBeUndefined()
    expect(env.SEED_VAULT_EMAIL_RELAY_TOKEN).toBeUndefined()
    expect(env.SERVICE_ADMIN_SECRET).toBeUndefined()
    expect(env.SENTRY_DSN).toBeUndefined()
    expect(env.SEED_VAULT_DEFAULT_NOTIFY_SERVER).toBe('')
  })
  it('allocates ports without touching an existing listener', async () => {
    const server = createServer().listen(0, '127.0.0.1')
    await once(server, 'listening')
    try {
      const port = await unusedPort()
      expect(port).not.toBe((server.address() as {port: number}).port)
      expect(server.listening).toBe(true)
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })
  it('captures private output without echoing it and removes only owned resources', async () => {
    const supervisor = await createSupervisor()
    const directory = supervisor.directory
    try {
      const child = supervisor.spawn(
        process.execPath,
        ['-e', 'process.stdout.write("ready"); setInterval(()=>{}, 10000)'],
        directory,
      )
      await child.waitFor(/ready/)
      expect(existsSync(directory)).toBe(true)
    } finally {
      await supervisor.close()
    }
    expect(existsSync(directory)).toBe(false)
    await supervisor.close()
  })
})
