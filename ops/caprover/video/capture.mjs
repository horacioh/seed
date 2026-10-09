import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'

const CAPROVER_URL = 'http://localhost:3000'
const API_URL = 'http://127.0.0.1:3000/api/v2'
const PASSWORD_FILE = path.join(os.homedir(), '.config/caprover/password')
const TEMPLATE = path.resolve('ops/caprover/seed.yml')
const APP = 'site'
const DOMAIN = 'site.example.com'
const SERVICES = [APP, `${APP}-daemon`, `${APP}-web`, `${APP}-updater`]
const DATA_VOLUMES = [`${APP}-daemon-data`, `${APP}-web-data`]
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Blurs every 32-character hex value (the registration link secret) before it can reach a screenshot.
const BLUR_SECRETS = `(() => {
  const HEX = /[a-fA-F0-9]{32}/
  const mark = (el) => { el.style.filter = 'blur(7px)'; el.setAttribute('data-secret-blurred', '') }
  const scan = () => {
    for (const input of document.querySelectorAll('input, textarea')) {
      if (HEX.test(input.value) && !input.hasAttribute('data-secret-blurred')) mark(input)
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const hits = []
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (HEX.test(n.nodeValue) && !n.parentElement?.closest('[data-secret-blurred]')) hits.push(n)
    }
    for (const n of hits) {
      const match = n.nodeValue.match(HEX)
      const secret = n.splitText(match.index)
      secret.splitText(match[0].length)
      const span = document.createElement('span')
      secret.replaceWith(span)
      span.append(secret)
      mark(span)
    }
  }
  const start = () => {
    scan()
    new MutationObserver(scan).observe(document.body, {subtree: true, childList: true, characterData: true})
    document.addEventListener('input', scan, true)
  }
  if (document.body) start()
  else document.addEventListener('DOMContentLoaded', start)
})()`

let token
async function login() {
  const password = fs.readFileSync(PASSWORD_FILE, 'utf8').trim()
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {'x-namespace': 'captain', 'content-type': 'application/json'},
    body: JSON.stringify({password}),
  })
  const body = await response.json()
  if (!response.ok || body.status !== 100 || !body.data?.token) throw new Error(`CapRover login failed: ${body.status}`)
  token = body.data.token
  return token
}

async function api(route, {method = 'GET', body} = {}) {
  if (!token) await login()
  const response = await fetch(`${API_URL}${route}`, {
    method,
    headers: {
      'x-namespace': 'captain',
      'x-captain-auth': token,
      ...(body ? {'content-type': 'application/json'} : {}),
    },
    ...(body ? {body: JSON.stringify(body)} : {}),
  })
  const data = await response.json()
  // 100 = OK, 102 = partial success (for example, some volumes could not be deleted yet)
  if (!response.ok || ![100, 102].includes(data.status)) {
    throw new Error(`CapRover API ${method} ${route}: ${data.status} ${data.description}`)
  }
  return data
}

async function seedApps() {
  const {data} = await api('/user/apps/appDefinitions')
  return data.appDefinitions.filter((app) => SERVICES.includes(app.appName))
}

async function seedApp(name) {
  const app = (await seedApps()).find((item) => item.appName === name)
  if (!app) throw new Error(`CapRover has no ${name} app`)
  return app
}

function swarmServices() {
  return execFileSync('docker', ['service', 'ls', '--format', '{{.Name}}'], {encoding: 'utf8'}).split('\n')
}

function dockerVolumes() {
  return execFileSync('docker', ['volume', 'ls', '--format', '{{.Name}}'], {encoding: 'utf8'}).split('\n')
}

// A service is settled when its only running task has been up for a while and no rolling update is in progress.
function serviceSettled(name, minUpMs = 15_000) {
  const service = JSON.parse(execFileSync('docker', ['service', 'inspect', name], {encoding: 'utf8'}))[0]
  if (service.UpdateStatus && service.UpdateStatus.State === 'updating') return false
  const taskIds = execFileSync('docker', ['service', 'ps', name, '-q', '--filter', 'desired-state=running'], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
  if (taskIds.length !== 1) return false
  const task = JSON.parse(execFileSync('docker', ['inspect', taskIds[0]], {encoding: 'utf8'}))[0]
  return task.Status.State === 'running' && Date.now() - Date.parse(task.Status.Timestamp) > minUpMs
}

function seedConfig(scheme = 'http') {
  try {
    const port = scheme === 'https' ? 443 : 80
    const out = execFileSync(
      'curl',
      ['-kfsS', '--max-time', '5', '--resolve', `${DOMAIN}:${port}:127.0.0.1`, `${scheme}://${DOMAIN}/hm/api/config`],
      {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']},
    )
    return JSON.parse(out)
  } catch {
    return null
  }
}

// Shepherd updates the daemon and web services once on start, then logs that it is sleeping.
function shepherdIdle() {
  const logs = execFileSync('docker', ['service', 'logs', '--raw', `${APP}-updater`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return /Sleeping \S+ before next update/.test(logs)
}

function stackHealthy() {
  const running = new Set(swarmServices())
  if (!SERVICES.every((name) => running.has(name))) return false
  if (!SERVICES.every((name) => serviceSettled(name))) return false
  if (!shepherdIdle()) return false
  return Boolean(seedConfig('http')?.peerId)
}

/** Deletes the Seed apps, their data volumes and their project through CapRover. */
export async function prepare() {
  const apps = await seedApps()
  if (apps.length) {
    await api('/user/apps/appDefinitions/delete', {
      method: 'POST',
      body: {appNames: apps.map((app) => app.appName), volumes: DATA_VOLUMES},
    })
  }
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    const services = new Set(swarmServices())
    if (!SERVICES.some((name) => services.has(name))) break
    await sleep(1000)
  }
  if (SERVICES.some((name) => swarmServices().includes(name))) throw new Error('CapRover left Seed services behind')

  // CapRover skips volumes that are still attached while the containers stop; remove them once they are free.
  while (Date.now() < deadline) {
    const leftover = DATA_VOLUMES.filter((volume) => dockerVolumes().includes(volume))
    if (!leftover.length) break
    for (const volume of leftover) {
      try {
        execFileSync('docker', ['volume', 'rm', volume], {stdio: 'ignore'})
      } catch {}
    }
    await sleep(1000)
  }
  const leftover = DATA_VOLUMES.filter((volume) => dockerVolumes().includes(volume))
  if (leftover.length) throw new Error(`Seed data volumes are still present: ${leftover.join(', ')}`)

  const {data} = await api('/user/projects')
  const projects = (data.projects || []).filter((project) => project.name === APP)
  if (projects.length) {
    await api('/user/projects/delete', {method: 'POST', body: {projectIds: projects.map((project) => project.id)}})
  }
  if ((await seedApps()).length) throw new Error('CapRover still lists Seed apps')
}

/** Signs the browser in to CapRover without showing the password. */
export async function context() {
  const authToken = await login()
  return {
    ignoreHTTPSErrors: true,
    storageState: {
      cookies: [],
      origins: [{origin: CAPROVER_URL, localStorage: [{name: 'CAPROVER_AUTH_KEY', value: authToken}]}],
    },
  }
}

/** CapRover tutorial browser launch settings. */
export const options = {
  baseUrl: CAPROVER_URL,
  browser: {
    args: ['--ignore-certificate-errors', `--host-resolver-rules=MAP ${DOMAIN} 127.0.0.1, MAP localhost 127.0.0.1`],
  },
  frameGuard: {
    loading: ['.animate-pulse', '[aria-busy="true"]', '.animate-spin', '[role="progressbar"]', '.ant-spin-spinning'],
    toast: ['[data-sonner-toast]', '.toast', '.ant-message-notice', '.ant-notification-notice'],
  },
}

function field(page, label) {
  return page.locator('h4', {hasText: new RegExp(`^${label}$`)}).locator('xpath=following::input[1]')
}

async function messagesGone(page) {
  await page.locator('.ant-message-notice').first().waitFor({state: 'hidden', timeout: 15_000})
}

async function waitFor(check, {max = 60_000, every = 1000, message}) {
  const deadline = Date.now() + max
  while (Date.now() < deadline) {
    if (await check()) return
    await sleep(every)
  }
  throw new Error(message)
}

/** Captures the asserted CapRover one-click deployment walkthrough. */
export default async function capture(r) {
  const page = r.page
  await page.context().addInitScript(BLUR_SECRETS)

  await r.nav('/#/apps')
  // With no apps yet, CapRover opens the Create A New App panel by default.
  const oneClick = page.getByRole('button', {name: 'One-Click Apps/Databases'})
  await oneClick.waitFor({state: 'visible'})
  await r.shot('apps', {target: oneClick.locator('xpath=ancestor::div[contains(@class, "ant-card")][1]')})

  await r.click(oneClick, {
    name: 'one-click',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/#\/apps\/oneclick$/, {timeout: 10_000})
      await currentPage.getByPlaceholder('Search for an app...').waitFor({state: 'visible', timeout: 30_000})
      return true
    },
    settleMs: 1200,
  })

  const templateCard = page.getByRole('link').filter({has: page.getByText('>> TEMPLATE <<', {exact: true})})
  const search = page.getByPlaceholder('Search for an app...')
  await r.type(search, 'TEMPLATE', {
    name: 'search',
    expect: async () => {
      await templateCard.waitFor({state: 'visible', timeout: 10_000})
      return (await page.locator('.ant-card-hoverable').count()) < 10
    },
  })
  const templateText = page.locator('textarea')
  await r.click(templateCard, {
    name: 'template',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/#\/apps\/oneclick\/templategenerator/, {timeout: 10_000})
      await templateText.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  const source = fs.readFileSync(TEMPLATE, 'utf8')
  await templateText.fill(source)
  if ((await templateText.inputValue()) !== source) throw new Error('Template text was not pasted')
  await r.shot('paste', {target: templateText})

  const setupTitle = page.getByText('Setup your Seed Hypermedia', {exact: true})
  await r.click(page.getByRole('button', {name: /Next/}), {
    name: 'next',
    expect: async () => {
      await setupTitle.waitFor({state: 'visible', timeout: 15_000})
      return true
    },
  })

  const appName = field(page, 'App Name')
  await r.type(appName, APP, {
    name: 'app-name',
    expect: async () => (await appName.inputValue()) === APP,
  })
  const domain = field(page, 'Site domain')
  await r.type(domain, DOMAIN, {
    name: 'domain',
    expect: async () => (await domain.inputValue()) === DOMAIN,
  })

  const secret = field(page, 'Registration link secret')
  await r.center(secret)
  if (!/^[a-f0-9]{32}$/i.test(await secret.inputValue())) throw new Error('CapRover did not generate a link secret')
  if (!/blur/.test(await secret.evaluate((el) => getComputedStyle(el).filter))) {
    throw new Error('Registration link secret is not blurred')
  }
  const secretSection = page.locator('h4', {hasText: /^Registration link secret$/}).locator('xpath=..')
  await r.shot('secret', {target: secretSection})

  const deploy = page.getByRole('button', {name: 'Deploy'})
  const progress = page.getByText('Progress:', {exact: true})
  await r.click(deploy, {
    name: 'deploy',
    expect: async () => {
      await progress.waitFor({state: 'visible', timeout: 15_000})
      return true
    },
    allowLoading: true,
  })

  const finish = page.getByRole('button', {name: 'Finish'})
  await r.poll('wait', {
    every: 2000,
    max: 600_000,
    until: async () => (await finish.isVisible()) && stackHealthy(),
    allowLoading: true,
  })
  if (!(await finish.isVisible()) || !stackHealthy()) throw new Error('Seed stack did not become healthy')

  const instructions = page.locator('.ant-alert').filter({hasText: 'Register from Seed desktop'})
  await r.center(instructions)
  const blurredLink = instructions.locator('[data-secret-blurred]')
  if ((await blurredLink.count()) !== 1) throw new Error('Registration link secret is not blurred')
  await r.shot('instructions', {target: instructions})

  await r.click(finish, {
    name: 'finish',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => !url.hash.includes('/deployment'), {timeout: 10_000})
      return true
    },
  })

  await r.nav('/#/apps')
  const appsTable = page.getByRole('table')
  for (const name of SERVICES) {
    await appsTable.getByRole('link', {name, exact: true}).first().waitFor({state: 'visible', timeout: 15_000})
  }
  await r.shot('apps-list', {target: appsTable})

  const enableHttps = page.getByRole('button', {name: 'Enable HTTPS'})
  await r.click(appsTable.getByRole('link', {name: APP, exact: true}).first(), {
    name: 'open-app',
    expect: async (currentPage) => {
      await currentPage.waitForURL(new RegExp(`#/apps/details/${APP}$`), {timeout: 10_000})
      await enableHttps.waitFor({state: 'visible', timeout: 15_000})
      return true
    },
    settleMs: 800,
  })

  await r.click(enableHttps, {
    name: 'enable-https',
    allowLoading: true,
    expect: async (currentPage) => {
      await waitFor(async () => (await seedApp(APP)).hasDefaultSubDomainSsl, {
        max: 120_000,
        message: 'CapRover did not enable HTTPS',
      })
      await currentPage.getByRole('link', {name: `https://${DOMAIN}`}).waitFor({state: 'visible', timeout: 15_000})
      await messagesGone(currentPage)
      return true
    },
  })

  const forceHttps = page.getByRole('checkbox', {name: /Force HTTPS/})
  await r.click(forceHttps, {
    name: 'force-https',
    expect: async () => forceHttps.isChecked(),
  })

  await r.click(page.getByRole('button', {name: 'Save & Restart'}), {
    name: 'save',
    allowLoading: true,
    expect: async () => {
      await waitFor(async () => (await seedApp(APP)).forceSsl, {
        max: 60_000,
        message: 'CapRover did not save Force HTTPS',
      })
      await messagesGone(page)
      return true
    },
    settleMs: 1500,
  })

  await waitFor(() => serviceSettled(APP, 5000) && Boolean(seedConfig('https')?.peerId), {
    max: 120_000,
    message: 'Seed did not answer over HTTPS',
  })
  const redirect = execFileSync(
    'curl',
    [
      '-sS',
      '-o',
      '/dev/null',
      '-w',
      '%{http_code} %{redirect_url}',
      '--resolve',
      `${DOMAIN}:80:127.0.0.1`,
      `http://${DOMAIN}/`,
    ],
    {encoding: 'utf8'},
  )
  if (!/^30[12] https:\/\//.test(redirect)) throw new Error(`HTTP did not redirect to HTTPS: ${redirect}`)

  await r.nav(`https://${DOMAIN}/`)
  const comingSoonHeading = page.getByText(/Seed Hypermedia Space Coming Soon/i)
  await comingSoonHeading.waitFor({state: 'visible', timeout: 30_000})
  await r.shot('site', {target: comingSoonHeading.locator('xpath=../..')})

  const config = execFileSync(
    'curl',
    ['-kfsS', '--resolve', `${DOMAIN}:443:127.0.0.1`, `https://${DOMAIN}/hm/api/config`],
    {encoding: 'utf8'},
  )
  if (!JSON.parse(config).peerId) throw new Error('Seed config endpoint did not return JSON')
}
