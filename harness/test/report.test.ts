import assert from 'node:assert/strict'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import test from 'node:test'
import os from 'node:os'
import path from 'node:path'
import {assertWithEvidence} from '../src/assert.js'
import type {BrowserDriver} from '../src/driver.js'
import {PageDriver} from '../src/page-driver.js'
import type {FrameRecorder} from '../src/recorder.js'
import {escapeMarkdownText, markdownReport, mdInlineCode, writeReports} from '../src/report.js'
import type {WebTestReport} from '../src/types.js'
import type {Page} from 'playwright-core'

function report(overrides: Partial<WebTestReport> = {}): WebTestReport {
  return {
    run: {
      runId: 'run-test',
      framework: 'seed-web-harness',
      status: 'pass',
      suites: [],
      retries: 0,
      stdout: '',
      stderr: '',
    },
    scenarioTestCase: {
      id: 'scenario',
      name: 'Minimal scenario',
      status: 'pass',
      attempts: [{index: 1, status: 'pass'}],
    },
    steps: [
      {id: 'step-1', action: 'goto', description: 'Open page', startedAt: '2025-01-01T00:00:00.000Z', status: 'pass'},
    ],
    assertions: [
      {
        id: 'assertion-1',
        kind: 'title',
        expected: 'Example',
        actual: 'Example',
        status: 'pass',
        evidence: ['frames/0001.png'],
        message: 'Title matches',
      },
    ],
    evidence: {
      screenshots: ['frames/0001.png'],
      consoleLogs: [],
      annotations: [],
    },
    findings: [],
    ...overrides,
  }
}

class MissingElementDriver extends PageDriver {
  public constructor() {
    super()
    const missingLocator = {
      waitFor: async () => {
        throw new Error('element did not appear')
      },
      filter: () => ({
        first: () => ({
          waitFor: async () => {
            throw new Error('element did not appear')
          },
        }),
      }),
      innerText: async () => {
        throw new Error('element did not appear')
      },
      getAttribute: async () => {
        throw new Error('element did not appear')
      },
    }
    this.page = {
      locator: () => missingLocator,
      waitForFunction: async () => undefined,
    } as unknown as Page
  }

  public async launch(): Promise<void> {}

  public async open(): Promise<Page> {
    return this.activePage()
  }

  public async close(): Promise<void> {}
}

test('markdownReport renders PASS, assertions, screenshots, and no findings', () => {
  const markdown = markdownReport(report())
  assert.match(markdown, /\*\*Result:\*\* PASS/)
  assert.match(markdown, /\*\*PASS\*\* Title matches/)
  assert.match(markdown, /!\[frames\/0001\.png\]\(frames\/0001\.png\)/)
  assert.match(markdown, /- None/)
})

test('markdownReport renders FAIL assertions and findings', () => {
  const markdown = markdownReport(
    report({
      run: {...report().run, status: 'fail'},
      scenarioTestCase: {...report().scenarioTestCase, status: 'fail'},
      assertions: [{...report().assertions[0], status: 'fail', actual: 'Wrong', message: 'Title mismatch'}],
      findings: [
        {
          id: 'finding-1',
          severity: 'high',
          title: 'Title mismatch',
          status: 'confirmed',
          reproSteps: ['Open page'],
          expected: 'Example',
          actual: 'Wrong',
          evidence: ['frames/0001.png'],
        },
      ],
    }),
  )
  assert.match(markdown, /\*\*Result:\*\* FAIL/)
  assert.match(markdown, /\*\*FAIL\*\* Title mismatch/)
  assert.match(markdown, /HIGH\*\* Title mismatch: Wrong/)
  assert.doesNotMatch(markdown, /- None/)
})

test('errored steps use the run FAIL verdict in Markdown and HTML', async () => {
  const errored = report({
    run: {...report().run, status: 'fail'},
    scenarioTestCase: {...report().scenarioTestCase, status: 'fail'},
    steps: [
      {
        id: 'step-error',
        action: 'click',
        description: 'Click missing button',
        startedAt: '2025-01-01T00:00:00.000Z',
        status: 'error',
      },
    ],
    assertions: [],
    evidence: {...report().evidence, screenshots: []},
    findings: [
      {
        id: 'finding-1',
        severity: 'high',
        title: 'Click missing button',
        status: 'confirmed',
        reproSteps: ['Click missing button'],
        expected: 'Step completes',
        actual: 'Locator did not resolve',
        evidence: [],
      },
    ],
  })
  const markdown = markdownReport(errored)
  assert.match(markdown, /\*\*Result:\*\* FAIL/)
  assert.doesNotMatch(markdown, /\*\*Result:\*\* PASS/)

  const runDir = await mkdtemp(path.join(os.tmpdir(), 'seed-harness-report-'))
  try {
    await writeReports(runDir, errored)
    const html = await readFile(path.join(runDir, 'report.html'), 'utf8')
    assert.match(html, />FAIL<\/strong>/)
    assert.doesNotMatch(html, />PASS<\/strong>/)
  } finally {
    await rm(runDir, {recursive: true, force: true})
  }
})

test('writeReports recursively redacts JSON-escaped secret values', async () => {
  const secret = 'quoted "secret"'
  const runDir = await mkdtemp(path.join(os.tmpdir(), 'seed-harness-report-secret-'))
  try {
    await writeReports(
      runDir,
      report({
        evidence: {...report().evidence, screenshots: []},
        assertions: [{...report().assertions[0], actual: `Observed ${secret}`}],
      }),
      [secret],
    )
    const results = await readFile(path.join(runDir, 'results.json'), 'utf8')
    assert.doesNotMatch(results, /quoted \\"secret\\"/)
    assert.match(results, /\[REDACTED\]/)
  } finally {
    await rm(runDir, {recursive: true, force: true})
  }
})

test('markdownReport escapes tags without mangling ordinary text', () => {
  const markdown = markdownReport(
    report({
      steps: [
        {
          id: 'step-1',
          action: 'type',
          description: `Don't submit "now" & wait`,
          value: 'a`b',
          startedAt: '2025-01-01T00:00:00.000Z',
          status: 'pass',
        },
      ],
      assertions: [
        {
          ...report().assertions[0],
          actual: 'Wrong',
          message: `Don't submit "now" & wait`,
        },
      ],
      findings: [
        {
          id: 'finding-1',
          severity: 'high',
          title: `Don't submit "now" & wait`,
          status: 'confirmed',
          reproSteps: [],
          expected: 'safe',
          actual: '<img src=x onerror=alert(1)>',
          evidence: [],
        },
      ],
    }),
  )
  assert.ok(markdown.includes('&lt;img src=x onerror=alert\\(1\\)&gt;'))
  assert.match(markdown, /Don't submit "now" & wait/)
  assert.doesNotMatch(markdown, /&#39;|&amp;|&quot;/)
  assert.match(markdown, /`` a`b ``/)
})

test('Markdown helpers handle tags and backtick-safe code spans', () => {
  assert.equal(escapeMarkdownText("<tag> & 'quote'"), "&lt;tag&gt; & 'quote'")
  assert.equal(escapeMarkdownText('![image](https://attacker/pixel)'), '\\!\\[image\\]\\(https://attacker/pixel\\)')
  assert.equal(escapeMarkdownText('[link](javascript:alert(1))'), '\\[link\\]\\(javascript:alert\\(1\\)\\)')
  assert.equal(mdInlineCode('plain'), '`plain`')
  assert.equal(mdInlineCode('a`b'), '`` a`b ``')
  assert.equal(mdInlineCode('a``b'), '``` a``b ```')
})

test('markdownReport neutralizes link and image injection in page text', () => {
  const markdown = markdownReport(
    report({
      assertions: [
        {
          ...report().assertions[0],
          message: '![x](https://attacker/pixel)',
        },
      ],
      findings: [
        {
          id: 'finding-1',
          severity: 'high',
          title: '[link](javascript:alert(1))',
          status: 'confirmed',
          reproSteps: [],
          expected: 'safe',
          actual: '![x](https://attacker/pixel)',
          evidence: [],
        },
      ],
    }),
  )
  assert.match(markdown, /\\!\\\[x\\\]\\\(https:\/\/attacker\/pixel\\\)/)
  assert.match(markdown, /\\\[link\\\]\\\(javascript:alert\\\(1\\\)\\\)/)
  assert.doesNotMatch(markdown, /(?<!\\)\]\(https:\/\/attacker/)
  assert.doesNotMatch(markdown, /(?<!\\)\]\(javascript:/)
})

test('assertWithEvidence preserves a passing verdict when capture fails', async () => {
  const driver = {
    assert: async () => ({status: 'pass', actual: 'observed' as unknown}),
  } as BrowserDriver
  const recorder = {
    capture: async () => {
      throw new Error('simulated capture failure')
    },
  } as unknown as FrameRecorder
  let stderr = ''
  const originalWrite = process.stderr.write
  process.stderr.write = ((chunk: string | Uint8Array) => {
    stderr += String(chunk)
    return true
  }) as typeof process.stderr.write
  try {
    const result = await assertWithEvidence(
      driver,
      recorder,
      'assertion-1',
      'Observed value',
      'text',
      {css: '#value'},
      'observed',
      'Capture failure scenario',
    )
    assert.equal(result.assertion.status, 'pass')
    assert.equal(result.assertion.actual, 'observed')
    assert.deepEqual(result.assertion.evidence, [])
    assert.equal(result.screenshotRef, '')
    assert.match(stderr, /Evidence capture failed for assertion "Observed value": simulated capture failure/)
  } finally {
    process.stderr.write = originalWrite
  }
})

test('assertWithEvidence preserves the observed value for a failed verdict', async () => {
  const driver = {
    assert: async () => ({
      status: 'fail',
      actual: 'observed' as unknown,
      message: 'Expected expected, received observed',
    }),
  } as BrowserDriver
  const recorder = {
    capture: async () => ({framePath: 'frames/0001.png', marker: {}}),
  } as unknown as FrameRecorder
  const result = await assertWithEvidence(
    driver,
    recorder,
    'assertion-1',
    'Observed value',
    'text',
    {css: '#value'},
    'expected',
    'Failed assertion scenario',
  )
  assert.equal(result.assertion.status, 'fail')
  assert.equal(result.assertion.actual, 'observed')
  assert.equal(result.assertion.message, 'Expected expected, received observed')
  assert.deepEqual(result.assertion.evidence, ['frames/0001.png'])
})

test('missing text and attr assertions are recorded as failed assertions', async () => {
  const driver = new MissingElementDriver()
  const recorder = {
    capture: async () => ({framePath: 'frames/0001.png', marker: {}}),
  } as unknown as FrameRecorder
  const textResult = await assertWithEvidence(
    driver,
    recorder,
    'assertion-text',
    'Missing text',
    'text',
    {css: '#missing-text'},
    'Expected text',
    'Missing element scenario',
  )
  const attrResult = await assertWithEvidence(
    driver,
    recorder,
    'assertion-attr',
    'Missing attribute',
    'attr',
    {css: '#missing-attr'},
    'data-state=ready',
    'Missing element scenario',
  )

  assert.equal(textResult.assertion.status, 'fail')
  assert.equal(textResult.assertion.actual, null)
  assert.match(textResult.assertion.message ?? '', /Element not found while reading text/)
  assert.equal(attrResult.assertion.status, 'fail')
  assert.equal(attrResult.assertion.actual, null)
  assert.match(attrResult.assertion.message ?? '', /Element not found while reading attribute/)

  const markdown = markdownReport(
    report({
      run: {...report().run, status: 'fail'},
      assertions: [textResult.assertion, attrResult.assertion],
    }),
  )
  assert.match(markdown, /\*\*Assertions:\*\* 0 passed, 2 failed/)
})
