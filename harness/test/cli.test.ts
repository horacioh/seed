import assert from 'node:assert/strict'
import test from 'node:test'
import {parseArgs} from '../src/cli.js'

test('parseArgs applies defaults', () => {
  assert.deepEqual(parseArgs([]), {cdp: 'http://localhost:29229', out: 'artifacts'})
})

test('parseArgs accepts every supported flag', () => {
  assert.deepEqual(
    parseArgs([
      '--url',
      'https://example.com',
      '--scenario',
      '/tmp/scenario.ts',
      '--cdp',
      'http://127.0.0.1:1',
      '--out',
      'out',
    ]),
    {
      url: 'https://example.com',
      scenario: '/tmp/scenario.ts',
      cdp: 'http://127.0.0.1:1',
      out: 'out',
    },
  )
})

test('parseArgs rejects unknown flags', () => {
  assert.throws(() => parseArgs(['--unknown']), /Unknown argument: --unknown/)
})

test('parseArgs rejects missing values', () => {
  for (const option of ['--url', '--scenario', '--cdp', '--out']) {
    assert.throws(() => parseArgs([option]), new RegExp(`${option} requires a value`))
    assert.throws(() => parseArgs([option, '--other']), new RegExp(`${option} requires a value`))
  }
})

test('parseArgs accepts explicit Electron paths and repeatable args', () => {
  assert.deepEqual(
    parseArgs([
      '--electron-main',
      '/tmp/app.asar/main.js',
      '--electron-executable',
      '/tmp/electron',
      '--electron-arg',
      '--no-sandbox',
      '--electron-arg',
      '--inspect',
    ]),
    {
      cdp: 'http://localhost:29229',
      out: 'artifacts',
      electronMain: '/tmp/app.asar/main.js',
      electronExecutable: '/tmp/electron',
      electronArgs: ['--no-sandbox', '--inspect'],
    },
  )
})

test('parseArgs rejects an Electron main path without an executable', () => {
  assert.throws(
    () => parseArgs(['--electron-main', '/tmp/main.js']),
    /--electron-main and --electron-executable must be provided together/,
  )
})

test('parseArgs rejects an Electron executable without a main path', () => {
  assert.throws(
    () => parseArgs(['--electron-executable', '/tmp/electron']),
    /--electron-main and --electron-executable must be provided together/,
  )
})

test('parseArgs rejects Electron paths combined with a URL', () => {
  assert.throws(
    () =>
      parseArgs([
        '--url',
        'https://example.com',
        '--electron-main',
        '/tmp/main.js',
        '--electron-executable',
        '/tmp/electron',
      ]),
    /--url cannot be combined with an Electron target/,
  )
})
