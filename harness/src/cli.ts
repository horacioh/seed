import {createInterface} from 'node:readline'
import {spawn, type ChildProcess} from 'node:child_process'
import {fileURLToPath, pathToFileURL} from 'node:url'
import path from 'node:path'
import {runScenario} from './runner.js'
import type {Scenario, ScenarioModule} from './types.js'

interface CliOptions {
  url?: string
  scenario?: string
  cdp: string
  out: string
  electronMain?: string
  electronExecutable?: string
  electronArgs?: string[]
}

/** Parse the small command-line surface for the standalone harness. */
export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {cdp: 'http://localhost:29229', out: 'artifacts'}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--') continue
    if (arg === '--url') options.url = requiredValue(argv, ++index, arg)
    else if (arg === '--scenario') options.scenario = requiredValue(argv, ++index, arg)
    else if (arg === '--cdp') options.cdp = requiredValue(argv, ++index, arg)
    else if (arg === '--out') options.out = requiredValue(argv, ++index, arg)
    else if (arg === '--electron-main') options.electronMain = requiredValue(argv, ++index, arg)
    else if (arg === '--electron-executable') options.electronExecutable = requiredValue(argv, ++index, arg)
    else if (arg === '--electron-arg') (options.electronArgs ??= []).push(requiredValue(argv, ++index, arg, true))
    else throw new Error(`Unknown argument: ${arg}`)
  }
  if (Boolean(options.electronMain) !== Boolean(options.electronExecutable)) {
    throw new Error('--electron-main and --electron-executable must be provided together')
  }
  if (options.url && (options.electronMain || options.electronExecutable)) {
    throw new Error('--url cannot be combined with an Electron target')
  }
  return options
}

/** Run the default, custom-scenario, or generic web workflow. */
export async function main(argv = process.argv.slice(2)): Promise<number> {
  const options = parseArgs(argv)
  const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const scenario = await loadScenario(options, harnessRoot)
  let server: ChildProcess | undefined
  try {
    if (!options.url && !options.scenario && !options.electronMain) {
      server = spawn(process.execPath, [path.join(harnessRoot, 'sample-app', 'serve.mjs')], {
        cwd: harnessRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      await waitForReadyLine(server)
    }
    const result = await runScenario(scenario, {
      cdpUrl: options.cdp,
      outputRoot: path.resolve(harnessRoot, options.out),
      electron:
        options.electronMain && options.electronExecutable
          ? {
              main: options.electronMain,
              executable: options.electronExecutable,
              args: options.electronArgs,
            }
          : undefined,
    })
    const runDir = path.dirname(result.reportPath)
    process.stdout.write(`Web harness completed: ${scenario.name}\n`)
    for (const file of ['results.json', 'markers.json', 'report.html', 'RUN-REPORT.md', 'video.mp4', 'dom.html']) {
      process.stdout.write(`${path.join(runDir, file)}\n`)
    }
    process.stdout.write(`${path.join(runDir, 'frames')}\n`)
    return result.failed ? 1 : 0
  } finally {
    server?.kill('SIGTERM')
  }
}

async function loadScenario(options: CliOptions, harnessRoot: string): Promise<Scenario> {
  if (options.scenario) {
    const module = (await import(pathToFileURL(path.resolve(options.scenario)).href)) as ScenarioModule
    return module.scenario
  }
  if (!options.url) {
    const scenarioFile = options.electronMain ? 'sample.electron.ts' : 'sample.web.ts'
    const module = (await import(
      pathToFileURL(path.join(harnessRoot, 'scenarios', scenarioFile)).href
    )) as ScenarioModule
    return module.scenario
  }
  return {
    name: `Generic web smoke: ${options.url}`,
    description: 'Navigate to a web application and verify basic document readiness.',
    steps: [
      {action: 'goto', url: options.url, description: `Navigate to ${options.url}`},
      {action: 'assert', kind: 'title', expected: true, description: 'Page title is non-empty'},
      {action: 'assert', kind: 'visible', locator: {css: 'body'}, expected: true, description: 'Page body is visible'},
    ],
  }
}

function requiredValue(argv: string[], index: number, option: string, allowFlagValue = false): string {
  const value = argv[index]
  if (!value || (!allowFlagValue && value.startsWith('--'))) throw new Error(`${option} requires a value`)
  return value
}

/**
 * Wait for the event-driven ready line with a deadline failsafe, not synchronization.
 */
function waitForReadyLine(server: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server.stdout) {
      reject(new Error('Sample server stdout is unavailable'))
      return
    }
    const lines = createInterface({input: server.stdout})
    let stderr = ''
    let settled = false
    const deadline = setTimeout(() => {
      finish(new Error(`sample server did not start within 10s${stderr ? `: ${stderr.trim()}` : ''}`))
    }, 10_000)
    const finish = (error?: Error): void => {
      if (settled) return
      settled = true
      clearTimeout(deadline)
      lines.close()
      if (error) reject(error)
      else resolve()
    }
    lines.on('line', (line) => {
      if (line.startsWith('HARNESS_SAMPLE_READY ')) {
        finish()
      }
    })
    server.once('error', (error) => finish(error))
    server.once('close', (code, signal) => {
      finish(
        new Error(
          `sample server did not start (exited with code ${code ?? 'unknown'}${signal ? `, signal ${signal}` : ''})${
            stderr ? `: ${stderr.trim()}` : ''
          }`,
        ),
      )
    })
    server.once('exit', (code, signal) => {
      finish(
        new Error(
          `sample server did not start (exited with code ${code ?? 'unknown'}${signal ? `, signal ${signal}` : ''})${
            stderr ? `: ${stderr.trim()}` : ''
          }`,
        ),
      )
    })
    server.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
      process.stderr.write(chunk)
    })
  })
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main()
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
      process.exit(1)
    })
}
