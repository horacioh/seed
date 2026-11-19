import * as os from 'node:os'
import * as path from 'node:path'

/**
 * Parsed configuration for the devin-bridge server, derived once from the
 * environment at startup. Internal APIs receive these values as-is; only this
 * module normalizes or validates environment input.
 */
export type BridgeConfig = {
  /** Required bearer token clients must present for any `/v1` endpoint. */
  apiKey: string
  /** Network hostname to bind. */
  hostname: string
  /** TCP port to bind. */
  port: number
  /** JSON array argv used to spawn the Devin ACP child. */
  acpCommand: string[]
  /** Maximum number of concurrent ACP prompts. */
  maxConcurrent: number
  /** Per-prompt timeout in seconds. */
  timeoutSecs: number
  /** ACP mode id to set on each new session (e.g. `ask`). */
  mode: string
  /** Root directory under which per-request working directories are created. */
  workDir: string
}

function parsePositiveInt(value: string | undefined, fallback: number, label: string): number {
  if (value === undefined || value.trim() === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`Invalid ${label}: ${value}`)
  return parsed
}

function parseAcpCommand(value: string | undefined): string[] {
  const raw = value?.trim() ?? ''
  if (raw === '') return ['devin', 'acp']
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.some((part) => typeof part !== 'string')) {
      throw new Error('must be a JSON array of strings')
    }
    if (parsed.length === 0) throw new Error('must be a non-empty JSON array')
    return parsed
  } catch (err) {
    throw new Error(`Invalid DEVIN_BRIDGE_ACP_COMMAND: ${(err as Error).message}`)
  }
}

/** Parses the bridge configuration from `process.env`, throwing on a missing required value. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): BridgeConfig {
  const apiKey = env.DEVIN_BRIDGE_API_KEY?.trim() ?? ''
  if (apiKey === '') throw new Error('DEVIN_BRIDGE_API_KEY is required')

  const hostname = env.DEVIN_BRIDGE_HOSTNAME?.trim() || '0.0.0.0'
  const port = parsePositiveInt(env.DEVIN_BRIDGE_PORT, 8787, 'DEVIN_BRIDGE_PORT')
  const acpCommand = parseAcpCommand(env.DEVIN_BRIDGE_ACP_COMMAND)
  const maxConcurrent = parsePositiveInt(env.DEVIN_BRIDGE_MAX_CONCURRENT, 2, 'DEVIN_BRIDGE_MAX_CONCURRENT')
  const timeoutSecs = parsePositiveInt(env.DEVIN_BRIDGE_TIMEOUT_SECS, 600, 'DEVIN_BRIDGE_TIMEOUT_SECS')
  const mode = env.DEVIN_BRIDGE_MODE?.trim() || 'ask'
  const workDir = env.DEVIN_BRIDGE_WORK_DIR?.trim() || path.join(os.tmpdir(), 'devin-bridge')
  return {apiKey, hostname, port, acpCommand, maxConcurrent, timeoutSecs, mode, workDir}
}
