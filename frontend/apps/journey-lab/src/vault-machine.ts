import {assign, createActor, sendTo, setup} from 'xstate'
import {SOURCE_REVISION} from './catalogue.ts'
import {traceSchema, type EventName, type Milestone, type Trace, type TraceStep} from './trace.ts'

/** Simulation events contain outcomes, never real passwords, codes or key material. */
export type JourneyEvent = {type: EventName; milliseconds?: number}

type Context = {now: number; challengedAt: number; attempts: number; conflicts: number; milestones: Milestone[]}
const add = (context: Context, ...milestones: Milestone[]) => ({
  milestones: [...new Set([...context.milestones, ...milestones])],
})

const vault = setup({types: {events: {} as JourneyEvent}}).createMachine({
  initial: 'idle',
  states: {
    idle: {on: {'challenge.created': 'challenged'}},
    challenged: {on: {'code.accepted': 'verified'}},
    verified: {on: {'password.wrapped': 'secured', 'passkey.prf': 'secured'}},
    secured: {on: {'vault.persisted': 'durable'}},
    durable: {},
  },
})
const daemon = setup({types: {events: {} as JourneyEvent}}).createMachine({
  initial: 'empty',
  states: {
    empty: {on: {'profile.signed': 'signed'}},
    signed: {on: {'profile.stored': 'stored'}},
    stored: {on: {'profile.indexed': 'indexed', 'profile.remote': 'remote'}},
    indexed: {on: {'profile.remote': 'remote'}},
    remote: {},
  },
})
const mail = setup({types: {events: {} as JourneyEvent}}).createMachine({
  initial: 'idle',
  on: {'challenge.created': '.queued'},
  states: {idle: {}, queued: {on: {'email.delivered': 'delivered'}}, delivered: {}},
})

/** Browser orchestration plus separately inspectable vault, daemon and mail actors.
 * Only accepted protocol outcomes are forwarded; network effects belong in adapters, never guards.
 */
export const vaultJourneyMachine = setup({
  types: {context: {} as Context, events: {} as JourneyEvent},
  actors: {vault, daemon, mail},
  guards: {
    expired: ({context}) => context.now - context.challengedAt >= 900_000,
    resendAllowed: ({context}) => context.now - context.challengedAt >= 60_000,
    attemptsExhausted: ({context}) => context.attempts >= 2,
    retryExhausted: ({context}) => context.conflicts >= 1,
    stored: ({context}) => context.milestones.includes('profileStored'),
    recoveryAvailable: ({context}) => context.milestones.includes('recoveryCredential'),
  },
  actions: {
    advanceTime: assign(({context, event}) => ({now: context.now + (event.milliseconds ?? 0)})),
    challenge: assign(({context}) => ({challengedAt: context.now, attempts: 0, ...add(context, 'challenge')})),
    wrongCode: assign(({context}) => ({attempts: context.attempts + 1})),
    conflict: assign(({context}) => ({conflicts: context.conflicts + 1})),
    verified: assign(({context}) => add(context, 'emailVerified')),
    credential: assign(({context}) => add(context, 'credential')),
    recovery: assign(({context}) => add(context, 'recoveryCredential')),
    identity: assign(({context}) => add(context, 'identityGenerated')),
    persist: assign(({context}) => add(context, 'encryptedDurable')),
    sign: assign(({context}) => add(context, 'profileSigned')),
    store: assign(({context}) => add(context, 'profileStored')),
    index: assign(({context}) => add(context, 'profileIndexed')),
    remote: assign(({context}) => add(context, 'remoteAvailable')),
    contact: assign(({context}) => add(context, 'contactStored')),
    notify: assign(({context}) => add(context, 'notifyRegistered')),
    fresh: assign(({context}) => add(context, 'freshSession')),
    unlock: assign(({context}) => add(context, 'sameIdentity')),
    recover: assign(({context}) => add(context, 'recoveryProven')),
    toVault: sendTo('vault', ({event}) => event),
    toDaemon: sendTo('daemon', ({event}) => event),
    toMail: sendTo('mail', ({event}) => event),
  },
}).createMachine({
  id: 'vault-account',
  context: {now: 0, challengedAt: 0, attempts: 0, conflicts: 0, milestones: []},
  invoke: [
    {id: 'vault', src: 'vault'},
    {id: 'daemon', src: 'daemon'},
    {id: 'mail', src: 'mail'},
  ],
  initial: 'email',
  on: {
    'time.advance': {actions: ['advanceTime']},
    'profile.indexed': {guard: 'stored', actions: ['index', 'toDaemon']},
    'profile.remote': {guard: 'stored', actions: ['remote', 'toDaemon']},
  },
  states: {
    email: {on: {'email.submit': 'prelogin'}},
    prelogin: {on: {'email.available': 'challenging'}},
    challenging: {on: {'challenge.created': {target: 'code', actions: ['challenge', 'toVault', 'toMail']}}},
    code: {
      always: {guard: 'expired', target: 'expired'},
      on: {
        'email.delivered': {actions: ['toMail']},
        'code.accepted': {target: 'auth', actions: ['verified', 'toVault']},
        'code.wrong': [
          {guard: 'attemptsExhausted', target: 'exhausted', actions: ['wrongCode']},
          {actions: ['wrongCode']},
        ],
        'code.bindingRejected': {target: 'code'},
        'code.resend': {guard: 'resendAllowed', target: 'challenging'},
      },
    },
    expired: {on: {'code.resend': {guard: 'resendAllowed', target: 'challenging'}}},
    exhausted: {on: {'code.resend': {guard: 'resendAllowed', target: 'challenging'}}},
    auth: {on: {'credential.password': 'password', 'credential.passkey': 'passkey'}},
    password: {on: {'password.wrapped': {target: 'recovery', actions: ['credential', 'toVault']}}},
    recovery: {on: {'recovery.saved': {target: 'identity', actions: ['recovery']}}},
    passkey: {
      on: {
        'passkey.prf': {target: 'identity', actions: ['credential', 'toVault']},
        'passkey.unsupported': 'unsupported',
      },
    },
    unsupported: {on: {'credential.password': 'password'}},
    identity: {on: {'identity.generated': {target: 'saving', actions: ['identity']}}},
    saving: {
      on: {
        'vault.persisted': {target: 'signing', actions: ['persist', 'toVault']},
        'vault.conflict': [
          {guard: 'retryExhausted', target: 'saveFailed'},
          {target: 'reloading', actions: ['conflict']},
        ],
        'vault.failed': 'saveFailed',
      },
    },
    reloading: {on: {'vault.reloaded': 'saving'}},
    saveFailed: {},
    signing: {on: {'profile.signed': {target: 'storing', actions: ['sign', 'toDaemon']}, 'profile.failed': 'partial'}},
    storing: {on: {'profile.stored': {target: 'contact', actions: ['store', 'toDaemon']}, 'profile.failed': 'partial'}},
    contact: {on: {'contact.stored': {target: 'notifying', actions: ['contact']}, 'contact.failed': 'notifying'}},
    notifying: {
      on: {
        'notify.skipped': 'fresh',
        'notify.registered': {target: 'fresh', actions: ['notify']},
        'notify.failed': 'partial',
      },
    },
    partial: {on: {'session.fresh': {target: 'signin', actions: ['fresh']}}},
    fresh: {on: {'session.fresh': {target: 'signin', actions: ['fresh']}}},
    signin: {on: {'session.unlocked': {target: 'complete', actions: ['unlock']}, 'session.mismatch': 'mismatch'}},
    complete: {on: {'recovery.start': {guard: 'recoveryAvailable', target: 'recovering'}}},
    recovering: {
      on: {'recovery.unlocked': {target: 'recovered', actions: ['recover']}, 'session.mismatch': 'mismatch'},
    },
    recovered: {},
    mismatch: {},
  },
})

/** Read the executable graph directly, so the inspector cannot drift from machine transitions. */
export function transitionsFor(state: string) {
  const node = vaultJourneyMachine.getStateNodeById(`vault-account.${state}`)
  return [...node.transitions].flatMap(([event, transitions]) =>
    transitions.map((transition) => ({
      event,
      target: transition.target?.map((target) => target.key).join(', ') || state,
      guard:
        typeof transition.guard === 'string'
          ? transition.guard
          : transition.guard
            ? String(
                typeof transition.guard === 'object' && 'type' in transition.guard
                  ? transition.guard.type
                  : 'predicate',
              )
            : '',
      actions: transition.actions
        .map((action) =>
          typeof action === 'string'
            ? action
            : typeof action === 'object' && 'type' in action
              ? String(action.type)
              : 'effect',
        )
        .join(' · '),
    })),
  )
}

/** An event schedule includes explicit controlled-time advances for expiry and cooldown. */
export type Scenario = {id: string; title: string; description: string; events: JourneyEvent[]}
const events = (...types: EventName[]): JourneyEvent[] => types.map((type) => ({type}))
const start = events('email.submit', 'email.available', 'challenge.created', 'email.delivered')
const password = events(
  'code.accepted',
  'credential.password',
  'password.wrapped',
  'recovery.saved',
  'identity.generated',
)
const publication = events(
  'vault.persisted',
  'profile.signed',
  'profile.stored',
  'profile.indexed',
  'contact.stored',
  'notify.skipped',
)
const signin = events('session.fresh', 'session.unlocked')

/** Failure schedules are modeled hypotheses until a local adapter reproduces the same outcomes. */
export const scenarios: Scenario[] = [
  {
    id: 'password',
    title: 'Password + recovery',
    description: 'Create, persist, publish, then decrypt in two fresh sessions.',
    events: [...start, ...password, ...publication, ...signin, ...events('recovery.start', 'recovery.unlocked')],
  },
  {
    id: 'wrong-code',
    title: 'Wrong code → retry',
    description: 'One rejected code must not create a session or consume the identity.',
    events: [...start, ...events('code.wrong'), ...password, ...publication, ...signin],
  },
  {
    id: 'exhausted',
    title: 'Three wrong codes',
    description: 'The third wrong attempt deletes the challenge. Resend is required.',
    events: [...start, ...events('code.wrong', 'code.wrong', 'code.wrong')],
  },
  {
    id: 'expiry',
    title: 'Challenge expires',
    description: 'Advance the logical clock beyond the real fifteen-minute lifetime.',
    events: [...start, {type: 'time.advance', milliseconds: 900_000}],
  },
  {
    id: 'binding',
    title: 'Another browser’s code',
    description: 'A correct code without its browser binding must not authenticate.',
    events: [...start, ...events('code.bindingRejected')],
  },
  {
    id: 'conflict',
    title: '409 → reload + merge',
    description: 'Preserve the generated identity while merging the latest encrypted vault.',
    events: [...start, ...password, ...events('vault.conflict', 'vault.reloaded'), ...publication, ...signin],
  },
  {
    id: 'save-failed',
    title: 'Encrypted save fails',
    description: 'No profile is published, and no durable identity is claimed.',
    events: [...start, ...password, ...events('vault.failed')],
  },
  {
    id: 'partial',
    title: 'Profile fails after save',
    description: 'The encrypted seed survives a failed publication and fresh sign-in still recovers it.',
    events: [...start, ...password, ...events('vault.persisted', 'profile.failed'), ...signin],
  },
  {
    id: 'contact-failed',
    title: 'Optional contact fails',
    description: 'Best-effort default-site joining must not erase the saved identity.',
    events: [
      ...start,
      ...password,
      ...publication.slice(0, 4),
      ...events('contact.failed', 'notify.skipped'),
      ...signin,
    ],
  },
  {
    id: 'notify-failed',
    title: 'Notification setup fails',
    description: 'Post-save failure is separate from both seed durability and profile visibility.',
    events: [...start, ...password, ...publication.slice(0, 5), ...events('notify.failed'), ...signin],
  },
  {
    id: 'passkey',
    title: 'Passkey / PRF branch',
    description: 'Model only: current creation bypasses recovery. Real PRF remains unverified.',
    events: [
      ...start,
      ...events('code.accepted', 'credential.passkey', 'passkey.prf', 'identity.generated'),
      ...publication,
      ...signin,
    ],
  },
  {
    id: 'fallback',
    title: 'No PRF → password',
    description: 'Unsupported authenticators fall back without claiming a working passkey.',
    events: [
      ...start,
      ...events(
        'code.accepted',
        'credential.passkey',
        'passkey.unsupported',
        'credential.password',
        'password.wrapped',
        'recovery.saved',
        'identity.generated',
      ),
      ...publication,
      ...signin,
    ],
  },
]

const resourceMilestones = {
  challenge: 'challenge',
  session: 'emailVerified',
  wrappedCredential: 'credential',
  recoveryCredential: 'recoveryCredential',
  encryptedVault: 'encryptedDurable',
  profileSignature: 'profileSigned',
  daemonBlock: 'profileStored',
  profileIndex: 'profileIndexed',
  remoteProfile: 'remoteAvailable',
  contact: 'contactStored',
} as const

/** A deterministic simulator owns its actors and clock; reset constructs a completely new instance. */
export function createSimulation(scenario: Scenario, seed = 42) {
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw new Error('Seed must be a non-zero uint32.')
  const actor = createActor(vaultJourneyMachine).start()
  let random = seed >>> 0
  let cursor = 0
  const trace: Trace = {
    schemaVersion: 1,
    journey: 'vault-account',
    sourceRevision: SOURCE_REVISION,
    mode: 'simulation',
    client: 'web',
    seed,
    steps: [],
    observations: [],
  }
  return {
    actor,
    trace,
    get done() {
      return cursor >= scenario.events.length
    },
    get next() {
      return scenario.events[cursor]
    },
    step(override?: JourneyEvent): TraceStep | undefined {
      const event = override ?? scenario.events[cursor]
      if (!event) return undefined
      if (!actor.getSnapshot().can(event))
        throw new Error(`Event ${event.type} is not enabled in ${actor.getSnapshot().value}.`)
      if (event.type === 'time.advance' && (!Number.isSafeInteger(event.milliseconds) || event.milliseconds! < 0))
        throw new Error('Invalid logical time advance.')
      random ^= random << 13
      random ^= random >>> 17
      random ^= random << 5
      actor.send({type: 'time.advance', milliseconds: 30 + ((random >>> 0) % 170)})
      if (!actor.getSnapshot().can(event)) throw new Error('Logical time changed the enabled transitions.')
      actor.send(event)
      if (!override) cursor++
      const snapshot = actor.getSnapshot()
      const milestones = snapshot.context.milestones
      const step = traceSchema.shape.steps.element.parse({
        seq: trace.steps.length,
        time: snapshot.context.now,
        event: event.type,
        state: snapshot.value,
        milestones,
        resources: Object.entries(resourceMilestones)
          .filter(([, milestone]) => milestones.includes(milestone))
          .map(([resource]) => resource),
        actors: {
          vault: snapshot.children.vault?.getSnapshot().value,
          daemon: snapshot.children.daemon?.getSnapshot().value,
          mail: snapshot.children.mail?.getSnapshot().value,
        },
      })
      trace.steps.push(step)
      return step
    },
    stop() {
      actor.stop()
    },
  }
}
