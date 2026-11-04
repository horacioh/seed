import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync, spawn} from 'node:child_process'

const CASAOS_URL = 'http://127.0.0.1'
const CONFIG_DIR = path.join(os.homedir(), '.config/casaos')
const STORAGE_STATE = path.join(CONFIG_DIR, 'storage-state.json')
const STORE_DIR = path.join(os.homedir(), '.cache/seed-casaos-store')
const STORE_PORT = 8088
const STORE_URL = `http://127.0.0.1:${STORE_PORT}/seed-apps-main.zip`
const APP_DIR = path.resolve('ops/casaos/Apps/Seed')
const SITE_URL = 'http://site.example.com:3567'
const APP_ID = 'seed'

let token

async function api(route, {method = 'GET'} = {}) {
  if (!token) {
    const login = await fetch(`${CASAOS_URL}/v1/users/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: fs.readFileSync(path.join(CONFIG_DIR, 'username'), 'utf8').trim(),
        password: fs.readFileSync(path.join(CONFIG_DIR, 'password'), 'utf8').trim(),
      }),
    })
    if (!login.ok) throw new Error(`CasaOS login failed: ${login.status}`)
    token = (await login.json()).data.token.access_token
  }
  const response = await fetch(`${CASAOS_URL}${route}`, {method, headers: {Authorization: token}})
  if (!response.ok) throw new Error(`CasaOS API ${method} ${route}: ${response.status}`)
  return (await response.json()).data
}

async function seedSources() {
  return (await api('/v2/app_management/appstore')).filter((store) => store.url === STORE_URL)
}

function seedContainers() {
  return execFileSync('docker', ['ps', '-aq', '--filter', `label=com.docker.compose.project=${APP_ID}`], {
    encoding: 'utf8',
  }).trim()
}

function webEnv() {
  const env = JSON.parse(
    execFileSync('docker', ['inspect', '-f', '{{json .Config.Env}}', `${APP_ID}-seed-web-1`], {encoding: 'utf8'}),
  )
  return Object.fromEntries(
    env.map((entry) => [entry.slice(0, entry.indexOf('=')), entry.slice(entry.indexOf('=') + 1)]),
  )
}

/** True once CasaOS reports init exited cleanly, daemon and web running, and Seed Web answers its config API. */
async function siteIsHealthy(baseUrl) {
  let containers
  try {
    containers = (await api(`/v2/app_management/compose/${APP_ID}/containers`)).containers
  } catch {
    return false
  }
  const init = containers['seed-init']
  if (init?.State !== 'exited' || init.ExitCode !== 0) return false
  if (containers['seed-daemon']?.State !== 'running' || containers['seed-web']?.State !== 'running') return false
  if (baseUrl) {
    const env = webEnv()
    if (env.SEED_BASE_URL !== baseUrl || env.SEED_ASSET_HOST !== baseUrl) return false
  }
  const config = await fetch('http://127.0.0.1:3567/hm/api/config').catch(() => null)
  if (!config?.ok) return false
  return Boolean(await config.json().catch(() => null))
}

function buildStoreZip() {
  fs.mkdirSync(STORE_DIR, {recursive: true})
  execFileSync('python3', [
    '-c',
    `import os, sys, zipfile
src, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in sorted(os.listdir(src)):
        z.write(os.path.join(src, name), 'seed-apps-main/Apps/Seed/' + name)`,
    APP_DIR,
    path.join(STORE_DIR, 'seed-apps-main.zip'),
  ])
}

async function ensureStoreServer() {
  const head = await fetch(STORE_URL, {method: 'HEAD'}).catch(() => null)
  if (head?.ok) return
  spawn('python3', ['-m', 'http.server', String(STORE_PORT), '--bind', '127.0.0.1', '--directory', STORE_DIR], {
    detached: true,
    stdio: 'ignore',
  }).unref()
  for (let i = 0; i < 50; i++) {
    if ((await fetch(STORE_URL, {method: 'HEAD'}).catch(() => null))?.ok) return
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Store ZIP is not served at ${STORE_URL}`)
}

async function waitFor(check, what, max = 120_000) {
  const deadline = Date.now() + max
  while (Date.now() < deadline) {
    if (await check()) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Timed out waiting for ${what}`)
}

/** Uninstalls Seed and removes the local Seed app source, so each take starts from a stock CasaOS dashboard. */
export async function prepare() {
  if (Object.keys(await api('/v2/app_management/compose')).includes(APP_ID)) {
    await api(`/v2/app_management/compose/${APP_ID}?delete_config_folder=true`, {method: 'DELETE'})
  }
  await waitFor(() => !seedContainers(), 'CasaOS to remove the Seed containers')
  await waitFor(() => !fs.existsSync(`/DATA/AppData/${APP_ID}`), 'CasaOS to delete /DATA/AppData/seed')
  for (const store of await seedSources()) await api(`/v2/app_management/appstore/${store.id}`, {method: 'DELETE'})
  if ((await seedSources()).length) throw new Error('CasaOS kept the Seed app source')
  buildStoreZip()
  await ensureStoreServer()
}

/** Reuses the saved CasaOS login. */
export function context() {
  return {storageState: STORAGE_STATE}
}

/** CasaOS tutorial browser launch settings. */
export const options = {
  baseUrl: CASAOS_URL,
  browser: {args: ['--host-resolver-rules=MAP site.example.com 127.0.0.1, MAP localhost 127.0.0.1']},
  // The dashboard clock is drawn at 32px on purpose.
  frameGuard: {
    bigTextExempt: '.time',
    loading: ['.animate-spin', '[aria-busy="true"]', '[role="progressbar"]', '.loading-overlay.is-active', '.loader'],
  },
}

async function waitForToasts(page) {
  await page
    .locator('.toast, .notices .notification')
    .first()
    .waitFor({state: 'hidden', timeout: 15_000})
    .catch(() => {})
}

/** Tags the value input next to an environment variable key so it can be located by name. */
async function envValueInput(modal, key) {
  await modal.evaluate((root, name) => {
    for (const input of root.querySelectorAll('input[placeholder="Key"]')) {
      if (input.value !== name) continue
      const row = input.closest('.columns, .field, .is-flex')
      const value = row?.querySelector('input[placeholder="Value"]')
      if (value) value.dataset.envValue = name
    }
  }, key)
  return modal.locator(`input[data-env-value="${key}"]`)
}

/** Captures the asserted CasaOS install walkthrough. */
export default async function capture(r) {
  const page = r.page
  let maskedLines = 0
  // CasaOS shows the registration secret in the Logs tab; mask it before the page renders it.
  await page.route(`**/v2/app_management/compose/${APP_ID}/logs*`, async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/(register\?secret=)[^\s"\\]+/g, (_, prefix) => {
      maskedLines++
      return prefix + '••••••••••••'
    })
    await route.fulfill({response, body})
  })

  const appStoreTile = page.locator('img[src*="appstore"]').first()
  await r.nav('/#/', {waitFor: () => appStoreTile.waitFor({state: 'visible', timeout: 30_000})})
  const dragTip = page.getByText('Drag icons to sort.', {exact: true})
  if (await dragTip.isVisible()) await dragTip.locator('xpath=..').locator('.icon, button').last().click()
  // CasaOS reports the VM's loop devices as new drives ("NaN / 308 MB"); dismiss that card before recording.
  const storageManager = page.getByRole('button', {name: 'Storage Manager'})
  if (await storageManager.isVisible()) {
    const driveCard = page
      .locator('div')
      .filter({has: page.getByText('Found a new drive', {exact: true})})
      .filter({has: storageManager})
      .last()
    await driveCard.locator('.casa-close-outline').first().click()
    await storageManager.waitFor({state: 'hidden', timeout: 5000})
  }
  await r.shot('dashboard')

  const store = page.locator('.modal.is-active').filter({has: page.getByPlaceholder('Search an app...')})
  const search = store.getByPlaceholder('Search an app...')
  await r.click(appStoreTile, {
    name: 'app-store',
    expect: async () => {
      await search.waitFor({state: 'visible', timeout: 15_000})
      await waitFor(
        async () => !(await page.locator('.loading-overlay.is-active:visible, .loader:visible').count()),
        'the App Store to finish loading',
        30_000,
      )
      return true
    },
  })

  const sources = store.getByRole('button', {name: /\d+ apps/})
  const moreApps = store.locator('.dropdown-menu .dropdown-item').filter({hasText: /^\s*More apps\s*$/})
  await r.click(sources, {
    name: 'sources',
    expect: async () => {
      await moreApps.waitFor({state: 'visible', timeout: 5000})
      return true
    },
  })

  const addSource = store.locator('button._sources_input')
  const sourceUrl = addSource.locator('xpath=ancestor::*[.//input][1]').locator('input')
  await r.click(moreApps, {
    name: 'more-apps',
    expect: async () => {
      await addSource.waitFor({state: 'visible', timeout: 5000})
      return true
    },
  })
  await r.type(sourceUrl, STORE_URL, {
    name: 'source-url',
    delay: 20,
    expect: async () => (await sourceUrl.inputValue()) === STORE_URL,
  })
  await r.click(addSource, {
    name: 'add-source',
    allowLoading: true,
    allowToast: true,
    settleMs: 1000,
    expect: async () => {
      await waitFor(async () => (await seedSources()).length === 1, 'CasaOS to register the Seed app source')
      return true
    },
  })
  await waitForToasts(page)

  const seedApp = store.locator('.app-item').filter({has: page.locator('h6', {hasText: /^\s*Seed Hypermedia\s*$/})})
  await r.type(search, 'Seed', {
    name: 'search',
    expect: async () => {
      await seedApp.waitFor({state: 'visible', timeout: 15_000})
      return true
    },
  })

  const install = page.locator('[data-detail-install]')
  await r.click(seedApp.locator('h6'), {
    name: 'app-detail',
    expect: async () => {
      // The detail view slides over the app list, which stays in the DOM. Tag the one Install button that is on top
      // and has stopped moving.
      await waitFor(
        () =>
          page.evaluate(async () => {
            const topmost = () =>
              [...document.querySelectorAll('.modal.is-active button')].filter((button) => {
                if (!/^Install\b/.test(button.textContent.trim())) return false
                const box = button.getBoundingClientRect()
                const x = box.x + box.width / 2
                const y = box.y + box.height / 2
                return x > 0 && x < innerWidth && button.contains(document.elementFromPoint(x, y))
              })
            const first = topmost()
            await new Promise((resolve) => setTimeout(resolve, 300))
            const second = topmost()
            if (first.length !== 1 || second[0] !== first[0]) return false
            const [a, b] = [first[0].getBoundingClientRect(), second[0].getBoundingClientRect()]
            if (a.x !== b.x || a.y !== b.y) return false
            first[0].dataset.detailInstall = ''
            return true
          }),
        'the Seed Hypermedia detail view',
        15_000,
      )
      return (await install.count()) === 1
    },
  })

  await r.click(install, {
    name: 'install',
    allowLoading: true,
    allowToast: true,
    settleMs: 1000,
    expect: async () => {
      await waitFor(
        async () => Object.keys(await api('/v2/app_management/compose')).includes(APP_ID),
        'CasaOS to start installing Seed',
        60_000,
      )
      return true
    },
  })
  await r.poll('installing', {
    every: 2000,
    max: 300_000,
    until: () => siteIsHealthy(),
    allowLoading: true,
    allowToast: true,
  })
  if (!(await siteIsHealthy())) throw new Error('Seed did not come up healthy after install')
  if (!webEnv().SEED_BASE_URL) throw new Error('Seed Web has no SEED_BASE_URL')

  const tile = page.locator('.cards-content').filter({hasText: 'Seed Hypermedia'}).locator('xpath=..')
  await r.nav('/#/', {waitFor: () => tile.waitFor({state: 'visible', timeout: 30_000})})
  await waitForToasts(page)
  await r.shot('installed', {target: tile})

  await tile.hover()
  const settingsItem = page.locator('.dropdown-menu:visible').getByRole('button', {name: 'Settings', exact: true})
  await r.click(tile.locator('.dropdown-trigger'), {
    name: 'tile-menu',
    expect: async () => {
      await settingsItem.waitFor({state: 'visible', timeout: 5000})
      return true
    },
  })

  const settings = page.locator('.modal.is-active').filter({hasText: 'seed Settings'})
  await r.click(settingsItem, {
    name: 'settings',
    expect: async () => {
      await settings.getByRole('button', {name: 'Save'}).waitFor({state: 'visible', timeout: 15_000})
      return true
    },
  })

  const webTab = settings.getByText('seed-web', {exact: true}).first()
  await r.click(webTab, {
    name: 'web-tab',
    expect: async () => {
      const baseUrl = await envValueInput(settings, 'SEED_BASE_URL')
      await baseUrl.waitFor({state: 'visible', timeout: 5000})
      return (await baseUrl.inputValue()) === 'http://casaos.local:3567'
    },
  })

  const terminal = page.locator('.modal.is-active').filter({has: page.locator('.xterm')})
  await r.click(settings.locator('.mdi-console'), {
    name: 'open-logs',
    allowLoading: true,
    expect: async () => {
      await terminal.getByText('Logs', {exact: true}).waitFor({state: 'visible', timeout: 15_000})
      return true
    },
  })
  await r.click(terminal.getByText('Logs', {exact: true}), {
    name: 'logs-tab',
    allowLoading: true,
    settleMs: 1500,
    expect: async () => {
      await waitFor(() => maskedLines > 0, 'the masked registration link in the logs', 30_000)
      return true
    },
  })

  // The Logs tab renders the compose logs as plain text in #logs .content; scroll the registration line into view.
  const logs = terminal.locator('#logs')
  await logs.getByText('Seed registration link', {exact: false}).waitFor({state: 'attached', timeout: 15_000})
  const logText = await logs.locator('.content').innerText()
  if (/register\?secret=(?!•)/.test(logText)) throw new Error('The registration secret is not masked')
  if (!/register\?secret=•/.test(logText)) throw new Error('The Logs tab did not show the masked registration link')
  await logs.evaluate((box) => {
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const index = node.data.indexOf('Seed registration link')
      if (index < 0) continue
      const range = document.createRange()
      range.setStart(node, index)
      range.setEnd(node, index + 1)
      const line = range.getBoundingClientRect()
      box.scrollTop += line.top - box.getBoundingClientRect().top - line.height * 6
      return
    }
    throw new Error('registration line not found')
  })
  await r.shot('registration-link', {target: logs})

  await r.click(terminal.locator('button.delete'), {
    name: 'close-logs',
    expect: async () => {
      await terminal.waitFor({state: 'hidden', timeout: 5000})
      return settings.isVisible()
    },
  })

  for (const [name, key] of [
    ['base-url', 'SEED_BASE_URL'],
    ['asset-host', 'SEED_ASSET_HOST'],
  ]) {
    const input = await envValueInput(settings, key)
    await r.type(input, SITE_URL, {name, delay: 25, expect: async () => (await input.inputValue()) === SITE_URL})
  }

  const restartPolicy = settings
    .locator('#seed-init-content select')
    .filter({has: page.locator('option[value="on-failure"]')})
  await r.click(settings.getByText('seed-init', {exact: true}).first(), {
    name: 'init-tab',
    expect: async () => {
      await restartPolicy.waitFor({state: 'visible', timeout: 5000})
      return true
    },
  })
  // CasaOS saves seed-init's `restart: "no"` as unless-stopped, which loops it and keeps Seed Web from starting.
  await restartPolicy.selectOption('on-failure')
  if ((await restartPolicy.inputValue()) !== 'on-failure') throw new Error('Restart policy did not change')
  await r.shot('restart-policy', {target: restartPolicy, mark: restartPolicy})

  await r.click(settings.getByRole('button', {name: 'Save'}), {
    name: 'save',
    allowLoading: true,
    allowToast: true,
    expect: async () => {
      await settings.waitFor({state: 'hidden', timeout: 30_000})
      return true
    },
  })
  await r.poll('restarting', {
    every: 2000,
    max: 300_000,
    until: () => siteIsHealthy(SITE_URL),
    allowLoading: true,
    allowToast: true,
  })
  if (!(await siteIsHealthy(SITE_URL))) throw new Error('Seed did not come back healthy with the new URL')

  await r.nav(`${SITE_URL}/`)
  const comingSoon = page.getByText(/Seed Hypermedia Space Coming Soon/i)
  await comingSoon.waitFor({state: 'visible', timeout: 30_000})
  await r.shot('site', {target: comingSoon.locator('xpath=../..')})

  const config = execFileSync(
    'curl',
    ['-fsS', '--resolve', 'site.example.com:3567:127.0.0.1', `${SITE_URL}/hm/api/config`],
    {encoding: 'utf8'},
  )
  if (!JSON.parse(config)) throw new Error('Seed config endpoint did not return JSON')
}
