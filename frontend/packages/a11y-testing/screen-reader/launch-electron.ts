import {_electron} from '@playwright/test'
import {existsSync} from 'node:fs'
import path from 'node:path'

/** Mirrors the desktop test fixture environment while launching the built main entry with Electron. */
export async function launchUnpackagedApp() {
  const desktopRoot = path.resolve(process.cwd(), '../../apps/desktop')
  const repoRoot = path.resolve(process.cwd(), '../../..')
  const mainPath = path.join(desktopRoot, '.vite', 'build', 'main.js')
  const electronBin = path.join(repoRoot, 'node_modules', '.bin', 'electron')
  if (!existsSync(mainPath)) throw new Error(`Desktop main entry was not built at ${mainPath}`)
  if (!existsSync(electronBin)) throw new Error(`Electron executable was not found at ${electronBin}`)

  return _electron.launch({
    executablePath: electronBin,
    args: [mainPath],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      VITE_DESKTOP_P2P_PORT: process.env.VITE_DESKTOP_P2P_PORT ?? '5800',
      VITE_DESKTOP_HTTP_PORT: process.env.VITE_DESKTOP_HTTP_PORT ?? '58001',
      VITE_DESKTOP_GRPC_PORT: process.env.VITE_DESKTOP_GRPC_PORT ?? '58002',
      VITE_DESKTOP_APPDATA: process.env.VITE_DESKTOP_APPDATA ?? 'appData.test.local',
    },
  })
}
