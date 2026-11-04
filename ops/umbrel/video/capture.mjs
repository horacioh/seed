import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'

const UMBREL_URL = 'http://umbrel.local'
const SITE_URL = 'http://umbrel.local:3567'
// umbrel.local only resolves inside the browser (host-resolver-rules), so API calls go to the loopback address.
const API_URL = 'http://127.0.0.1'
const APP_ID = 'seed-site'
// Served by a local git HTTP server on Umbrel's Docker network; it stands in for the public store repository.
const STORE_URL = 'http://git.example.com/your-name/seed-apps'
const STORE_CONTAINER = 'seed-store-git'
const CONFIG_DIR = path.join(os.homedir(), '.config/umbrel')
const STORAGE_STATE = path.join(CONFIG_DIR, 'storage-state.json')
const PASSWORD_FILE = path.join(CONFIG_DIR, 'password')
const SEED_CONTAINERS = ['seed-site_web_1', 'seed-site_daemon_1', 'umbrel_ingress_seed-site']

function session() {
  const state = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf8'))
  const token = state.origins.flatMap((origin) => origin.localStorage).find((e) => e.name === 'umbrel-auth-token')
  return {
    Authorization: `Bearer ${token?.value}`,
    Cookie: state.cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; '),
  }
}

async function trpc(route, input, {mutation = false} = {}) {
  const query = !mutation && input !== undefined ? `?input=${encodeURIComponent(JSON.stringify(input))}` : ''
  const response = await fetch(`${API_URL}/trpc/${route}${query}`, {
    method: mutation ? 'POST' : 'GET',
    headers: {Host: 'umbrel.local', ...session(), ...(mutation ? {'Content-Type': 'application/json'} : {})},
    ...(mutation ? {body: JSON.stringify(input ?? {})} : {}),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`Umbrel ${route}: ${response.status} ${body?.error?.message ?? ''}`)
  return body.result.data
}

// Signs in with the password kept in ~/.config/umbrel and stores a fresh browser session there (mode 600).
async function signIn() {
  const password = fs.readFileSync(PASSWORD_FILE, 'utf8').trim()
  const response = await fetch(`${API_URL}/trpc/user.login`, {
    method: 'POST',
    headers: {Host: 'umbrel.local', 'Content-Type': 'application/json'},
    body: JSON.stringify({password}),
  })
  if (!response.ok) throw new Error(`Umbrel login failed: ${response.status}`)
  const token = (await response.json()).result.data
  const cookies = response.headers.getSetCookie().map((header) => {
    const [pair, ...attributes] = header.split(';').map((part) => part.trim())
    const separator = pair.indexOf('=')
    const expires = attributes.find((attribute) => /^expires=/i.test(attribute))
    return {
      name: pair.slice(0, separator),
      value: pair.slice(separator + 1),
      domain: 'umbrel.local',
      path: '/',
      expires: expires ? Math.floor(Date.parse(expires.slice(8)) / 1000) : -1,
      httpOnly: attributes.some((attribute) => /^httponly$/i.test(attribute)),
      secure: false,
      sameSite: 'Lax',
    }
  })
  const state = {
    cookies,
    origins: [
      {
        origin: UMBREL_URL,
        localStorage: [
          {name: 'umbrel-auth-token', value: token},
          {name: 'auth-token-last-refreshed', value: String(Date.now())},
          {name: 'i18nextLng', value: 'en'},
        ],
      },
    ],
  }
  fs.writeFileSync(STORAGE_STATE, JSON.stringify(state), {mode: 0o600})
  fs.chmodSync(STORAGE_STATE, 0o600)
}

async function waitFor(check, message, max = 120_000) {
  const deadline = Date.now() + max
  while (Date.now() < deadline) {
    if (await check()) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(message)
}

function containerStates() {
  const names = execFileSync('docker', ['ps', '-a', '--format', '{{.Names}}\t{{.State}}'], {encoding: 'utf8'})
  return new Map(
    names
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('\t')),
  )
}

function seedConfig() {
  try {
    return JSON.parse(
      execFileSync('curl', ['-fsS', '--resolve', 'umbrel.local:3567:127.0.0.1', `${SITE_URL}/hm/api/config`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    )
  } catch {
    return null
  }
}

/** Signs in, uninstalls Seed Site and removes the local community store so every take starts from a clean Umbrel. */
export async function prepare() {
  if (containerStates().get(STORE_CONTAINER) !== 'running') {
    throw new Error(`The local community store server (${STORE_CONTAINER}) is not running`)
  }
  await signIn()
  if ((await trpc('apps.state', {appId: APP_ID})).state !== 'not-installed') {
    await trpc('apps.uninstall', {appId: APP_ID}, {mutation: true})
    await waitFor(
      async () => (await trpc('apps.state', {appId: APP_ID})).state === 'not-installed',
      'Umbrel did not uninstall Seed Site',
    )
  }
  const repositories = await trpc('appStore.repositories')
  if (repositories.some((repository) => repository.url === STORE_URL)) {
    await trpc('appStore.removeRepository', {url: STORE_URL}, {mutation: true})
  }
  await waitFor(
    () => SEED_CONTAINERS.every((name) => !containerStates().has(name)),
    'Seed Site containers are still present after uninstall',
  )
}

/** Uses the Umbrel session written by prepare(). */
export function context() {
  return {storageState: STORAGE_STATE}
}

/** Umbrel tutorial browser launch settings. */
export const options = {
  baseUrl: UMBREL_URL,
  browser: {
    args: ['--host-resolver-rules=MAP umbrel.local 127.0.0.1, MAP localhost 127.0.0.1'],
  },
  // The home screen's storage and memory widgets are static role="progressbar" meters, not loading states.
  frameGuard: {loading: ['.animate-pulse', '[data-loading]', '[aria-busy="true"]', '.animate-spin']},
}

/** Captures the asserted Umbrel community store install of Seed Site. */
export default async function capture(r) {
  const page = r.page
  // The dock icon; a fresh home screen also has a "Browse App Store" button.
  const dockAppStore = page.locator('a[href="/app-store"]').filter({hasText: /^$/})
  await r.nav('/', {waitFor: () => dockAppStore.waitFor({state: 'visible'})})
  await r.shot('home')

  await r.click(dockAppStore, {
    name: 'app-store',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/app-store$/, {timeout: 10_000})
      await currentPage.getByRole('heading', {name: 'App Store'}).waitFor({state: 'visible', timeout: 15_000})
      return true
    },
    settleMs: 1500,
  })

  const moreMenu = page.getByRole('button', {name: 'Community App Stores'})
  const storesItem = page.getByRole('menuitem', {name: 'Community App Stores'})
  await r.click(moreMenu, {
    name: 'more-menu',
    expect: async () => {
      await storesItem.waitFor({state: 'visible', timeout: 5000})
      return true
    },
  })

  const storesDialog = page.getByRole('dialog', {name: 'Community App Stores'})
  const storeUrl = storesDialog.getByRole('textbox')
  await r.click(storesItem, {
    name: 'community-stores',
    allowEmpty: true,
    expect: async () => {
      await storeUrl.waitFor({state: 'visible', timeout: 5000})
      return true
    },
  })

  await r.type(storeUrl, STORE_URL, {
    name: 'store-url',
    expect: async () => (await storeUrl.inputValue()) === STORE_URL,
  })

  const storeCard = storesDialog.locator('li').filter({hasText: 'Seed Hypermedia'})
  const openStore = storesDialog.getByRole('link', {name: 'Open'})
  await r.click(storesDialog.getByRole('button', {name: /^Add/}), {
    name: 'add-store',
    allowToast: true,
    expect: async () => {
      await openStore.waitFor({state: 'visible', timeout: 60_000})
      const repositories = await trpc('appStore.repositories')
      return repositories.some((repository) => repository.url === STORE_URL && repository.meta?.id === 'seed')
    },
    settleMs: 800,
    mark: storeCard,
  })

  await r.click(openStore, {
    name: 'open-store',
    allowToast: true,
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/community-app-store\/seed$/, {timeout: 10_000})
      await currentPage.getByRole('link', {name: 'Seed Site'}).waitFor({state: 'visible', timeout: 15_000})
      return true
    },
    settleMs: 1000,
  })
  await r.dismissToasts()

  const install = page.getByRole('button', {name: /^Install/})
  await r.click(page.getByRole('link', {name: 'Seed Site'}), {
    name: 'seed-site',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/community-app-store\/seed\/seed-site$/, {timeout: 10_000})
      await install.waitFor({state: 'visible', timeout: 15_000})
      return (await trpc('apps.state', {appId: APP_ID})).state === 'not-installed'
    },
    settleMs: 1000,
  })

  await r.click(install, {
    name: 'install',
    allowLoading: true,
    expect: async () => {
      await waitFor(
        async () => (await trpc('apps.state', {appId: APP_ID})).state !== 'not-installed',
        'Umbrel did not start installing Seed Site',
        15_000,
      )
      return true
    },
  })

  const siteIsReady = async () => {
    if ((await trpc('apps.state', {appId: APP_ID})).state !== 'ready') return false
    const states = containerStates()
    return SEED_CONTAINERS.every((name) => states.get(name) === 'running') && Boolean(seedConfig()?.peerId)
  }
  await r.poll('wait', {every: 1000, max: 300_000, until: siteIsReady, allowLoading: true})
  if (!(await siteIsReady())) throw new Error('Seed Site did not come up healthy on Umbrel')

  const open = page.getByRole('button', {name: 'Open', exact: true})
  await open.waitFor({state: 'visible', timeout: 15_000})
  await r.shot('installed', {target: open})

  const launchDialog = page.getByRole('dialog', {name: 'Open Seed Site'})
  const passwordRow = launchDialog.getByRole('group', {name: 'Default password'})
  await r.click(open, {
    name: 'open-app',
    expect: async () => {
      await passwordRow.waitFor({state: 'visible', timeout: 10_000})
      // Umbrel masks the password; blur the dots too so not even its length shows.
      await page.addStyleTag({content: '[role="group"][aria-label="Default password"] input{filter:blur(6px)}'})
      return (await passwordRow.locator('input').getAttribute('type')) === 'password'
    },
    mark: passwordRow,
  })

  const popupPromise = page.context().waitForEvent('page', {timeout: 15_000})
  let popup
  await r.click(launchDialog.getByRole('button', {name: 'Open Seed Site'}), {
    name: 'open-site',
    expect: async () => {
      popup = await popupPromise
      await popup.waitForURL(`${SITE_URL}/`, {timeout: 15_000})
      return true
    },
  })
  await popup.close()

  await r.nav(`${SITE_URL}/`)
  const comingSoonHeading = page.getByText(/Seed Hypermedia Space Coming Soon/i)
  await comingSoonHeading.waitFor({state: 'visible', timeout: 30_000})
  await r.shot('site', {target: comingSoonHeading.locator('xpath=../..')})

  if (!seedConfig()) throw new Error('Seed config endpoint did not return JSON')
}
