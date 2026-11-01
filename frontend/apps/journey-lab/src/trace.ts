import {z} from 'zod'
import {SOURCE_REVISION} from './catalogue.ts'

/** Payload-free semantic events: no credentials, content, email, CIDs or URLs can enter a trace. */
export const eventNames = [
  'email.submit',
  'email.available',
  'challenge.created',
  'email.delivered',
  'code.accepted',
  'code.wrong',
  'code.bindingRejected',
  'code.resend',
  'time.advance',
  'credential.password',
  'password.wrapped',
  'recovery.saved',
  'credential.passkey',
  'passkey.prf',
  'passkey.unsupported',
  'identity.generated',
  'vault.persisted',
  'vault.conflict',
  'vault.reloaded',
  'vault.failed',
  'profile.signed',
  'profile.stored',
  'profile.indexed',
  'profile.remote',
  'profile.failed',
  'contact.stored',
  'contact.failed',
  'notify.skipped',
  'notify.registered',
  'notify.failed',
  'session.fresh',
  'session.unlocked',
  'session.mismatch',
  'recovery.start',
  'recovery.unlocked',
] as const

/** Explicit browser modes; durable facts are stored separately in context. */
export const stateNames = [
  'email',
  'prelogin',
  'challenging',
  'code',
  'expired',
  'exhausted',
  'auth',
  'password',
  'recovery',
  'passkey',
  'unsupported',
  'identity',
  'saving',
  'reloading',
  'saveFailed',
  'signing',
  'storing',
  'contact',
  'notifying',
  'partial',
  'fresh',
  'signin',
  'complete',
  'recovering',
  'recovered',
  'mismatch',
] as const

/** Evidence milestones deliberately separate signing, persistence, queryability and availability. */
export const milestoneNames = [
  'challenge',
  'emailVerified',
  'credential',
  'recoveryCredential',
  'identityGenerated',
  'encryptedDurable',
  'profileSigned',
  'profileStored',
  'profileIndexed',
  'remoteAvailable',
  'contactStored',
  'notifyRegistered',
  'freshSession',
  'sameIdentity',
  'recoveryProven',
] as const

/** Resource aliases describe locations without revealing identity/key mappings. */
export const resourceNames = [
  'challenge',
  'session',
  'wrappedCredential',
  'recoveryCredential',
  'encryptedVault',
  'profileSignature',
  'daemonBlock',
  'profileIndex',
  'remoteProfile',
  'contact',
] as const

/** Independent observations produced by a local adapter, not model transition actions. */
export const checkNames = [
  'emptyEnvironment',
  'emailBinding',
  'wrongCode',
  'expiredCode',
  'attemptLimit',
  'resendCooldown',
  'wrappedCredentials',
  'encryptedStorage',
  'versionConflict',
  'profileSignature',
  'profileIndexed',
  'contactSignature',
  'freshPasswordSignin',
  'recoverySignin',
  'foreignAccountDenied',
  'postSaveFailure',
  'noSecretExport',
  'browserRegistration',
  'desktopCreation',
  'passkeyPrf',
  'remoteAvailability',
] as const

const boundedInteger = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)
const stepSchema = z
  .object({
    seq: boundedInteger,
    time: boundedInteger,
    event: z.enum(eventNames),
    state: z.enum(stateNames),
    milestones: z.array(z.enum(milestoneNames)).max(milestoneNames.length),
    resources: z.array(z.enum(resourceNames)).max(resourceNames.length),
    actors: z
      .object({
        vault: z.enum(['idle', 'challenged', 'verified', 'secured', 'durable']),
        daemon: z.enum(['empty', 'signed', 'stored', 'indexed', 'remote']),
        mail: z.enum(['idle', 'queued', 'delivered']),
      })
      .strict(),
  })
  .strict()
const observationSchema = z
  .object({
    check: z.enum(checkNames),
    result: z.enum(['passed', 'failed', 'unsupported', 'unobserved']),
    adapter: z.enum(['sqlite', 'http', 'browser', 'daemon', 'supervisor']),
  })
  .strict()

/** Strict allowlist makes redaction structural: free-form messages and unknown fields are rejected. */
export const traceSchema = z
  .object({
    schemaVersion: z.literal(1),
    journey: z.literal('vault-account'),
    sourceRevision: z.literal(SOURCE_REVISION),
    runnerRevision: z
      .string()
      .regex(/^[a-f0-9]{40}$/)
      .optional(),
    mode: z.enum(['simulation', 'local-verification']),
    client: z.enum(['web', 'desktop']),
    seed: z.number().int().min(1).max(0xffffffff),
    steps: z.array(stepSchema).max(2000),
    observations: z.array(observationSchema).max(100),
  })
  .strict()

/** Portable, deliberately non-secret evidence contract. Imported claims are never authenticated. */
export type Trace = z.infer<typeof traceSchema>
/** One normalized actor snapshot after an accepted event. */
export type TraceStep = Trace['steps'][number]
/** A verification assertion with its independent observing layer. */
export type Observation = Trace['observations'][number]
/** Semantic milestone recorded by the model. */
export type Milestone = (typeof milestoneNames)[number]
/** Payload-free event names accepted by the pilot. */
export type EventName = (typeof eventNames)[number]

/** Reject oversized or malformed input before it reaches the UI. No imported label confers trust. */
export function importTrace(text: string): Trace {
  if (new TextEncoder().encode(text).byteLength > 1_000_000) throw new Error('Trace exceeds the 1 MB limit.')
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Invalid trace JSON.')
  }
  const parsed = traceSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid trace: only the versioned, redacted evidence fields are accepted.')
  const trace = parsed.data
  for (let i = 0; i < trace.steps.length; i++) {
    const step = trace.steps[i]!
    if (step.seq !== i || (i > 0 && step.time < trace.steps[i - 1]!.time)) throw new Error('Invalid trace ordering.')
  }
  const checks = trace.observations.map((o) => o.check)
  if (new Set(checks).size !== checks.length) throw new Error('Duplicate observation claims are not accepted.')
  return trace
}

/** Independent temporal assertions; deliberately do not trust snapshot milestone flags. */
export function inspectTrace(trace: Trace) {
  const events = trace.steps.map((s) => s.event)
  const before = (first: EventName, second: EventName) =>
    !events.includes(second) || (events.includes(first) && events.indexOf(first) < events.indexOf(second))
  const claimed = (event: EventName, milestone: Milestone) =>
    events.includes(event) || trace.steps.some((step) => step.milestones.includes(milestone))
  const proof = (check: Observation['check']) =>
    trace.mode === 'simulation' ||
    trace.observations.some((o) => o.check === check && o.result === 'passed' && o.adapter === 'daemon')
  const assertions = [
    {name: 'Encrypted persistence precedes signing', passed: before('vault.persisted', 'profile.signed')},
    {name: 'Signing precedes block storage', passed: before('profile.signed', 'profile.stored')},
    {
      name: 'A query proves indexed visibility',
      passed:
        before('profile.stored', 'profile.indexed') &&
        trace.steps.every(
          (s, i) => !s.milestones.includes('profileIndexed') || events.slice(0, i + 1).includes('profile.indexed'),
        ) &&
        (!claimed('profile.indexed', 'profileIndexed') || proof('profileIndexed')),
    },
    {
      name: 'A remote observation proves availability',
      passed:
        before('profile.stored', 'profile.remote') &&
        trace.steps.every(
          (s, i) => !s.milestones.includes('remoteAvailable') || events.slice(0, i + 1).includes('profile.remote'),
        ) &&
        (!claimed('profile.remote', 'remoteAvailable') || proof('remoteAvailability')),
    },
    {name: 'Fresh sign-in precedes identity comparison', passed: before('session.fresh', 'session.unlocked')},
    {name: 'Recovery requires a saved recovery credential', passed: before('recovery.saved', 'recovery.unlocked')},
    {name: 'No identity mismatch', passed: !events.includes('session.mismatch')},
  ]
  return assertions
}
