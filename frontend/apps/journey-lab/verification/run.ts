import {execFileSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {DatabaseSync} from 'node:sqlite'
import {randomBytes, timingSafeEqual} from 'node:crypto'
import * as blobs from '@seed-hypermedia/client/blobs'
import * as encryption from '@seed-hypermedia/client/encryption'
import * as vault from '@seed-hypermedia/client/vault'
import {SOURCE_REVISION} from '../src/catalogue.ts'
import {importTrace, type EventName, type Observation} from '../src/trace.ts'
import {createSimulation, scenarios} from '../src/vault-machine.ts'
import {createSupervisor, unusedPort} from './supervisor.ts'

const root = fileURLToPath(new URL('../../../../', import.meta.url))
const app = fileURLToPath(new URL('../', import.meta.url))
const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64url')
const bytes = (value: string) => new Uint8Array(Buffer.from(value, 'base64url'))

class VaultClient {
  private cookies = new Map<string, string>()
  constructor(private origin: string) {}
  async request(method: string, route: string, body?: unknown) {
    const response = await fetch(`${this.origin}/vault/api${route}`, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
      headers: {
        'Content-Type': 'application/json',
        Cookie: [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; '),
      },
      ...(body === undefined ? {} : {body: JSON.stringify(body)}),
    })
    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(';')[0]!
      const split = pair.indexOf('=')
      if (split !== -1) this.cookies.set(pair.slice(0, split), pair.slice(split + 1))
    }
    return {status: response.status, json: (await response.json()) as Record<string, unknown>}
  }
  async ok(method: string, route: string, body?: unknown) {
    const result = await this.request(method, route, body)
    if (result.status !== 200) throw new Error('Local vault operation failed; sensitive response withheld.')
    return result.json
  }
}

function stringField(json: Record<string, unknown>, field: string): string {
  const value = json[field]
  if (typeof value !== 'string') throw new Error('Unexpected local response shape.')
  return value
}

async function main() {
  const args = process.argv.slice(2)
  if (
    args.some((arg) => arg !== '--output' && !arg.endsWith('.trace.json')) ||
    (args.length !== 0 && (args.length !== 2 || args[0] !== '--output'))
  ) {
    throw new Error('Usage: verify:local [--output output.trace.json]')
  }
  // A model for a pinned source cannot silently verify changed production implementations.
  execFileSync(
    'git',
    ['diff', '--quiet', SOURCE_REVISION, '--', 'vault/src', 'backend', 'frontend/packages/client/src'],
    {cwd: root, stdio: 'ignore'},
  )
  const runnerRevision = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim()
  const candidates = [
    'seed-daemon-x86_64-unknown-linux-gnu',
    'seed-daemon-aarch64-unknown-linux-gnu',
    'seed-daemon-aarch64-apple-darwin',
    'seed-daemon-x86_64-apple-darwin',
  ]
  const binary = candidates.map((name) => path.join(root, 'plz-out/bin/backend', name)).find(existsSync)
  if (!binary) throw new Error('Build the daemon first: direnv exec . plz build //backend:seed-daemon')
  const supervisor = await createSupervisor()
  const sim = createSimulation(scenarios[0]!, 42)
  const trace = sim.trace
  trace.mode = 'local-verification'
  trace.runnerRevision = runnerRevision
  const start = performance.now()
  let db: DatabaseSync | undefined
  let stage = 'emptyEnvironment'
  const output = path.resolve(args[1] ?? path.join(app, 'vault-api.trace.json'))
  const observations = new Map<Observation['check'], Observation>()
  const note = (check: Observation['check'], result: Observation['result'], adapter: Observation['adapter']) =>
    observations.set(check, {check, result, adapter})
  const check = (name: Observation['check'], passed: boolean, adapter: Observation['adapter']) => {
    stage = name
    note(name, passed ? 'passed' : 'failed', adapter)
    if (!passed) throw new Error('Independent assertion failed.')
  }
  const observe = (event: EventName) => {
    // Projection only: events come from real adapters; state names are the model's interpretation.
    const step = sim.step({type: event})!
    step.time = Math.floor(performance.now() - start)
  }
  const onSignal = () => {
    void supervisor.close().finally(() => process.exit(130))
  }
  process.once('SIGINT', onSignal)
  process.once('SIGTERM', onSignal)
  try {
    const ports: number[] = []
    while (ports.length < 4) {
      const port = await unusedPort()
      if (!ports.includes(port)) ports.push(port)
    }
    const [http, grpc, p2p, port] = ports as [number, number, number, number]
    const daemonUrl = `http://127.0.0.1:${http}`
    const origin = `http://127.0.0.1:${port}`
    const daemonDir = path.join(supervisor.directory, 'daemon')
    check('emptyEnvironment', !existsSync(daemonDir), 'supervisor')
    const daemon = supervisor.spawn(
      binary,
      [
        `-http.port=${http}`,
        `-grpc.port=${grpc}`,
        `-p2p.port=${p2p}`,
        '-p2p.isolated=true',
        '-p2p.bootstrap-peers=none',
        '-p2p.no-relay=true',
        '-lndhub.disabled=true',
        '-log-level=debug',
        `-data-dir=${daemonDir}`,
        `-keystore-dir=${path.join(daemonDir, 'keys')}`,
      ],
      root,
    )
    stage = 'daemonStartup'
    await daemon.waitFor(/DaemonStarted/)
    const dbPath = path.join(supervisor.directory, 'vault.sqlite')
    const server = supervisor.spawn('bun', ['src/main.ts'], path.join(root, 'vault'), {
      SEED_VAULT_HTTP_HOSTNAME: '127.0.0.1',
      SEED_VAULT_HTTP_PORT: String(port),
      SEED_VAULT_RP_ID: '127.0.0.1',
      SEED_VAULT_RP_ORIGIN: origin,
      SEED_VAULT_DB_PATH: dbPath,
      SEED_VAULT_BACKEND_HTTP_BASE_URL: daemonUrl,
      SEED_VAULT_BACKEND_GRPC_BASE_URL: daemonUrl,
      SEED_VAULT_WEB_BASE_URL: origin,
    })
    stage = 'vaultStartup'
    await server.waitFor(/Vault Server is running at/)
    db = new DatabaseSync(dbPath)
    check('emptyEnvironment', Number(db.prepare('SELECT count(*) AS count FROM users').get()!.count) === 0, 'sqlite')
    const primary = new VaultClient(origin)
    const email = 'journey-primary@example.invalid'
    observe('email.submit')
    const preLogin = await primary.ok('POST', '/pre-login', {email})
    if (preLogin.exists !== false) throw new Error('Environment is not empty.')
    observe('email.available')
    await primary.ok('POST', '/register/start', {email})
    observe('challenge.created')
    stage = 'emailDelivery'
    const match = await server.waitFor(/Verification code for [^\n]+: (\d{4})/)
    const code = match[1]!
    const cooldown = await primary.request('POST', '/register/start', {email})
    check('resendCooldown', cooldown.status === 429, 'http')
    const foreign = new VaultClient(origin)
    const bound = await foreign.request('POST', '/register/verify', {code})
    check('emailBinding', bound.status === 400, 'http')
    observe('code.bindingRejected')
    const wrong = code === '0000' ? '1111' : '0000'
    check('wrongCode', (await primary.request('POST', '/register/verify', {code: wrong})).status === 400, 'http')
    observe('code.wrong')
    await primary.ok('POST', '/register/verify', {code})
    observe('code.accepted')
    observe('credential.password')
    const password = b64(randomBytes(24))
    const salt = randomBytes(16)
    const rootKey = await encryption.deriveKeyFromPassword(password, salt)
    const kek = await vault.deriveEncryptionKey(rootKey)
    const auth = await vault.deriveAuthKey(rootKey)
    const dek = randomBytes(64)
    const wrapped = await encryption.encrypt(dek, kek)
    await primary.ok('POST', '/credentials/password', {authKey: b64(auth), salt: b64(salt), wrappedDEK: b64(wrapped)})
    observe('password.wrapped')
    // Recovery-secret wrapping uses exactly the production SDK. Browser word entry is a separate observation.
    const recoverySecret = randomBytes(32)
    const recoveryAuth = await vault.deriveSecretCredentialAuthKey(recoverySecret)
    const recoveryWrapped = await encryption.encrypt(dek, recoverySecret)
    await primary.ok('POST', '/credentials/secret', {
      authKey: b64(recoveryAuth),
      wrappedDEK: b64(recoveryWrapped),
      purpose: 'recovery',
    })
    const credentials = db.prepare('SELECT type, encrypted_dek, metadata FROM credentials').all()
    check(
      'wrappedCredentials',
      credentials.length === 2 &&
        credentials.every((c) => {
          const cipher = c.encrypted_dek as Uint8Array
          return (
            cipher.length > dek.length && !Buffer.from(cipher).includes(dek) && !String(c.metadata).includes(b64(auth))
          )
        }),
      'sqlite',
    )
    observe('recovery.saved')
    const identitySeed = randomBytes(32)
    const uid = vault.accountIdFromSeed(identitySeed)
    const state: vault.State = {version: 2, accounts: [{seed: identitySeed, createTime: Date.now(), delegations: []}]}
    observe('identity.generated')
    const initial = await primary.ok('GET', '/vault')
    const encrypted = await encryption.encrypt(await vault.serializeState(state), dek)
    await primary.ok('POST', '/vault', {version: initial.version, encryptedData: b64(encrypted)})
    const persisted = db.prepare('SELECT encrypted_data, version FROM users').get()!
    check(
      'encryptedStorage',
      timingSafeEqual(Buffer.from(persisted.encrypted_data as Uint8Array), encrypted) &&
        !Buffer.from(persisted.encrypted_data as Uint8Array).includes(identitySeed) &&
        !Buffer.from(persisted.encrypted_data as Uint8Array).includes(dek),
      'sqlite',
    )
    observe('vault.persisted')
    check(
      'versionConflict',
      (await primary.request('POST', '/vault', {version: initial.version, encryptedData: b64(encrypted)})).status ===
        409,
      'http',
    )
    const signer = blobs.nobleKeyPairFromSeed(identitySeed)
    const profile = await blobs.createProfile(signer, {name: 'Disposable journey identity'}, Date.now())
    check('profileSignature', blobs.verify(profile.decoded), 'daemon')
    observe('profile.signed')
    // First make the real daemon reject a corrupt blob, after the seed is already durable.
    const corrupt = new Uint8Array(profile.data)
    corrupt[corrupt.length - 1] = corrupt[corrupt.length - 1]! ^ 1
    const failed = await fetch(`${daemonUrl}/ipfs/${profile.cid}`, {
      method: 'POST',
      body: Buffer.from(corrupt),
      signal: AbortSignal.timeout(15_000),
    })
    const stillSaved = await primary.ok('GET', '/vault')
    check('postSaveFailure', !failed.ok && stringField(stillSaved, 'encryptedData') === b64(encrypted), 'http')
    const stored = await fetch(`${daemonUrl}/ipfs/${profile.cid}`, {
      method: 'POST',
      body: Buffer.from(profile.data),
      signal: AbortSignal.timeout(15_000),
    })
    if (!stored.ok) throw new Error('Local block storage failed.')
    observe('profile.stored')
    // A profile query, not the blob POST acknowledgement, proves indexed/queryable visibility.
    stage = 'profileIndex'
    const indexed = await primary.ok('GET', `/accounts/${encodeURIComponent(uid)}`)
    const indexedProfile = indexed.profile as Record<string, unknown> | undefined
    check('profileIndexed', indexed.id === uid && indexedProfile?.name === 'Disposable journey identity', 'daemon')
    observe('profile.indexed')
    await primary.ok('POST', '/logout')
    const fresh = new VaultClient(origin)
    const preFresh = await fresh.ok('POST', '/pre-login', {email})
    const freshRoot = await encryption.deriveKeyFromPassword(password, bytes(stringField(preFresh, 'salt')))
    await fresh.ok('POST', '/login', {email, authKey: b64(await vault.deriveAuthKey(freshRoot))})
    const reloaded = await fresh.ok('GET', '/vault')
    const passwordCredential = (reloaded.credentials as {kind: string; wrappedDEK: string}[]).find(
      (c) => c.kind === 'password',
    )!
    const freshDek = await encryption.decrypt(
      bytes(passwordCredential.wrappedDEK),
      await vault.deriveEncryptionKey(freshRoot),
    )
    const recovered = await vault.deserializeState(
      await encryption.decrypt(bytes(stringField(reloaded, 'encryptedData')), freshDek),
    )
    check(
      'freshPasswordSignin',
      recovered.accounts.length === 1 && vault.accountIdFromSeed(recovered.accounts[0]!.seed) === uid,
      'http',
    )
    const recoveryClient = new VaultClient(origin)
    await recoveryClient.ok('POST', '/login/recovery', {email, authKey: b64(recoveryAuth)})
    const recoveryData = await recoveryClient.ok('GET', '/vault')
    const recoveryCredential = (recoveryData.credentials as {kind: string; wrappedDEK: string}[]).find(
      (c) => c.kind === 'secret',
    )!
    const recoveryDek = await encryption.decrypt(bytes(recoveryCredential.wrappedDEK), recoverySecret)
    const recoveredAgain = await vault.deserializeState(
      await encryption.decrypt(bytes(stringField(recoveryData, 'encryptedData')), recoveryDek),
    )
    check('recoverySignin', vault.accountIdFromSeed(recoveredAgain.accounts[0]!.seed) === uid, 'http')
    // Negative controls use actual server decisions with fixture-controlled challenge time, not 15-minute sleeps.
    server.discardOutput()
    const other = new VaultClient(origin)
    const otherEmail = 'journey-isolation@example.invalid'
    await other.ok('POST', '/register/start', {email: otherEmail})
    const otherCode = (await server.waitFor(/Verification code for [^\n]+: (\d{4})/))[1]!
    db.prepare('UPDATE email_challenges SET expire_time = ? WHERE email = ?').run(Date.now() - 1, otherEmail)
    check('expiredCode', (await other.request('POST', '/register/verify', {code: otherCode})).status === 400, 'http')
    server.discardOutput()
    await other.ok('POST', '/register/start', {email: otherEmail})
    const validOtherCode = (await server.waitFor(/Verification code for [^\n]+: (\d{4})/))[1]!
    const badOtherCode = validOtherCode === '0000' ? '1111' : '0000'
    for (let i = 0; i < 3; i++) await other.request('POST', '/register/verify', {code: badOtherCode})
    check(
      'attemptLimit',
      (await other.request('POST', '/register/verify', {code: validOtherCode})).status === 400,
      'http',
    )
    db.prepare('DELETE FROM email_challenges WHERE email = ?').run(otherEmail)
    server.discardOutput()
    await other.ok('POST', '/register/start', {email: otherEmail})
    await other.ok('POST', '/register/verify', {
      code: (await server.waitFor(/Verification code for [^\n]+: (\d{4})/))[1]!,
    })
    const otherVault = await other.ok('GET', '/vault')
    const wrongLogin = await new VaultClient(origin).request('POST', '/login', {email: otherEmail, authKey: b64(auth)})
    check('foreignAccountDenied', !otherVault.encryptedData && wrongLogin.status === 401, 'http')
    note('browserRegistration', 'unobserved', 'browser')
    note('desktopCreation', 'unsupported', 'browser')
    note('passkeyPrf', 'unsupported', 'browser')
    note('remoteAvailability', 'unobserved', 'daemon')
    note('contactSignature', 'unobserved', 'daemon')
    trace.observations = [...observations.values()]
    const exported = JSON.stringify(trace)
    check(
      'noSecretExport',
      ![
        email,
        otherEmail,
        code,
        password,
        b64(dek),
        b64(identitySeed),
        b64(auth),
        b64(recoverySecret),
        uid,
        profile.cid.toString(),
      ].some((secret) => exported.includes(secret)),
      'supervisor',
    )
    console.log(
      'Local API/storage assertions passed. Browser registration, passkey PRF and remote availability were not verified.',
    )
  } catch (error) {
    process.exitCode = 1
    console.error(`Local verification stopped at ${stage}. Sensitive diagnostics withheld.`)
    if (error instanceof Error && /^Owned process /.test(error.message)) console.error(error.message)
  } finally {
    trace.observations = [...observations.values()]
    await writeFile(output, JSON.stringify(importTrace(JSON.stringify(trace)), null, 2), {mode: 0o600})
    console.log(`Redacted trace: ${output}`)
    db?.close()
    sim.stop()
    await supervisor.close()
    process.off('SIGINT', onSignal)
    process.off('SIGTERM', onSignal)
  }
}

main().catch(() => {
  console.error(
    'Verifier prerequisites failed. Build the daemon and install the root (pnpm) and vault (Bun) workspaces.',
  )
  process.exitCode = 1
})
