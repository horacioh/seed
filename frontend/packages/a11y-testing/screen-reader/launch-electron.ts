import {_electron} from '@playwright/test'
import {readdir} from 'node:fs/promises'
import path from 'node:path'

/** Mirrors the packaged-app launch setup used by the desktop test fixtures. */
export async function launchPackagedApp() {
  const buildDir = process.env.A11Y_DESKTOP_BUILD_DIR
  if (!buildDir) throw new Error('A11Y_DESKTOP_BUILD_DIR must point to the packaged app output')

  const appBundleName = (await readdir(buildDir)).find((name) => name.endsWith('.app'))
  if (!appBundleName) throw new Error(`No packaged macOS app found in ${buildDir}`)

  const appName = appBundleName.slice(0, -'.app'.length)
  return _electron.launch({
    executablePath: path.join(buildDir, appBundleName, 'Contents', 'MacOS', appName),
    args: [],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      VITE_DESKTOP_P2P_PORT: process.env.VITE_DESKTOP_P2P_PORT ?? '58000',
      VITE_DESKTOP_HTTP_PORT: process.env.VITE_DESKTOP_HTTP_PORT ?? '58001',
      VITE_DESKTOP_GRPC_PORT: process.env.VITE_DESKTOP_GRPC_PORT ?? '58002',
      VITE_DESKTOP_APPDATA: process.env.VITE_DESKTOP_APPDATA ?? 'Seed.test',
    },
  })
}
