import {describe, expect, it} from 'vitest'
import {createSimulation, scenarios, transitionsFor} from './vault-machine.ts'
import {importTrace, inspectTrace} from './trace.ts'

const run = (id = 'password', seed = 42) => {
  const sim = createSimulation(scenarios.find((s) => s.id === id)!, seed)
  while (!sim.done) sim.step()
  const trace = structuredClone(sim.trace)
  sim.stop()
  return trace
}

describe('vault journey model', () => {
  it('exposes executable event targets, guards and actions for the inspector', () => {
    expect(transitionsFor('code')).toContainEqual({
      event: 'code.resend',
      target: 'challenging',
      guard: 'resendAllowed',
      actions: '',
    })
    expect(transitionsFor('saving').find((t) => t.event === 'vault.persisted')?.actions).toContain('persist')
    expect(transitionsFor('recovered')).toEqual([])
  })
  it.each(scenarios)('plays $title without violating independent temporal assertions', ({id}) => {
    expect(inspectTrace(run(id)).filter((c) => !c.passed)).toEqual([])
  })
  it('replays/reset identically for the same seed and varies logical latency for another seed', () => {
    expect(run()).toEqual(run())
    expect(run('password', 43).steps.map((s) => s.time)).not.toEqual(run().steps.map((s) => s.time))
  })
  it('separates encrypted, signed, stored, indexed and remote milestones', () => {
    const trace = run()
    const signing = trace.steps.find((s) => s.event === 'profile.signed')!
    expect(signing.milestones).toContain('encryptedDurable')
    expect(signing.milestones).not.toContain('profileStored')
    expect(trace.steps.at(-1)!.milestones).not.toContain('remoteAvailable')
  })
  it('preserves the durable seed across post-save profile failure', () => {
    const trace = run('partial')
    expect(trace.steps.at(-1)!.milestones).toContain('sameIdentity')
    expect(trace.steps.at(-1)!.milestones).not.toContain('profileStored')
  })
  it('does not publish after a failed encrypted save', () => {
    const trace = run('save-failed')
    expect(trace.steps.at(-1)!.state).toBe('saveFailed')
    expect(trace.steps.at(-1)!.milestones).not.toContain('encryptedDurable')
  })
  it('expires challenges on controlled time and stops the third wrong attempt', () => {
    expect(run('expiry').steps.at(-1)!.state).toBe('expired')
    expect(run('exhausted').steps.at(-1)!.state).toBe('exhausted')
  })
  it('guards resend cooldown, session binding and premature indexing', () => {
    const sim = createSimulation(scenarios[0]!)
    for (let i = 0; i < 4; i++) sim.step()
    expect(() => sim.step({type: 'code.resend'})).toThrow('not enabled')
    expect(() => sim.step({type: 'profile.indexed'})).toThrow('not enabled')
    sim.step({type: 'code.bindingRejected'})
    expect(sim.actor.getSnapshot().context.milestones).not.toContain('emailVerified')
    sim.step({type: 'time.advance', milliseconds: 60_000})
    sim.step({type: 'code.resend'})
    expect(sim.actor.getSnapshot().value).toBe('challenging')
    sim.stop()
  })
  it('preserves the current passkey branch without inventing a recovery credential', () => {
    expect(run('passkey').steps.at(-1)!.milestones).not.toContain('recoveryCredential')
  })
})

describe('trace boundary', () => {
  it('round trips only the versioned allowlisted contract', () => {
    const trace = run()
    expect(importTrace(JSON.stringify(trace))).toEqual(trace)
  })
  it.each(['password', 'email', 'cookie', 'privateKey', 'recoveryWords', 'url', '__proto__'])(
    'rejects unknown %s fields',
    (field) => {
      const text = JSON.stringify(run()).replace('"schemaVersion":1', `"schemaVersion":1,"${field}":"sensitive"`)
      expect(() => importTrace(text)).toThrow('Invalid trace')
    },
  )
  it('rejects nested secrets, oversized traces, arbitrary events and malformed JSON without echoing input', () => {
    const trace = run()
    expect(() => importTrace('{secret')).toThrow('Invalid trace JSON')
    expect(() => importTrace(' '.repeat(1_000_001))).toThrow('1 MB')
    expect(() => importTrace(JSON.stringify({...trace, steps: [{...trace.steps[0], password: 'secret'}]}))).toThrow()
    expect(() =>
      importTrace(JSON.stringify({...trace, steps: [{...trace.steps[0], event: 'secret@example.com'}]})),
    ).toThrow()
  })
  it('catches fabricated indexed success independently from the model flags', () => {
    const trace = run()
    trace.steps = trace.steps.filter((s) => s.event !== 'profile.indexed')
    expect(inspectTrace(trace).find((a) => a.name.includes('indexed'))!.passed).toBe(false)
  })
  it('requires an independent daemon query even when a local trace fabricates the indexed event', () => {
    const trace = run()
    trace.mode = 'local-verification'
    expect(inspectTrace(trace).find((a) => a.name.includes('indexed'))?.passed).toBe(false)
    trace.observations = [{check: 'profileIndexed', result: 'passed', adapter: 'daemon'}]
    expect(inspectTrace(trace).find((a) => a.name.includes('indexed'))?.passed).toBe(true)
    trace.observations[0]!.adapter = 'browser'
    expect(inspectTrace(trace).find((a) => a.name.includes('indexed'))?.passed).toBe(false)
  })
  it('rejects remote claims that lack independent availability evidence', () => {
    const trace = run()
    trace.mode = 'local-verification'
    trace.steps.at(-1)!.milestones.push('remoteAvailable')
    expect(inspectTrace(trace).find((a) => a.name.includes('remote'))?.passed).toBe(false)
  })
  it('keeps imported observed claims as claims, without a verified trust field', () => {
    const trace = {
      ...run(),
      mode: 'local-verification',
      observations: [{check: 'encryptedStorage', result: 'passed', adapter: 'sqlite'}],
    }
    expect(importTrace(JSON.stringify(trace)).mode).toBe('local-verification')
    expect(() => importTrace(JSON.stringify({...trace, verified: true}))).toThrow()
  })
})
