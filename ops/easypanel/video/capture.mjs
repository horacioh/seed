import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import {execFileSync, spawnSync} from 'node:child_process'

const EASYPANEL_URL = 'http://localhost:3000'
const PROJECT = 'seed'
const PROJECT_PATH = `/projects/${PROJECT}`
const SITE_URL = 'https://site.example.com'
const CONFIG_DIR = path.join(os.homedir(), '.config/easypanel')
const CREDENTIALS = path.join(CONFIG_DIR, 'credentials')
const STORAGE_STATE = path.join(CONFIG_DIR, 'storage-state.json')
const SCHEMA = path.resolve('ops/easypanel/seed.json')
const SECRET_KEY = 'SEED_LINK_SECRET'
const SERVICES = ['daemon', 'web', 'updater']
const VOLUMES = [`${PROJECT}_daemon_data`, `${PROJECT}_web_data`]

let token

async function trpc(route, input, {method = input === undefined ? 'GET' : 'POST', auth = true} = {}) {
  const url = new URL(`/api/trpc/${route}`, EASYPANEL_URL)
  if (method === 'GET' && input !== undefined) url.searchParams.set('input', JSON.stringify({json: input}))
  const response = await fetch(url, {
    method,
    headers: {
      ...(auth ? {Authorization: `Bearer ${token}`} : {}),
      ...(method === 'POST' ? {'Content-Type': 'application/json'} : {}),
    },
    ...(method === 'POST' ? {body: JSON.stringify({json: input ?? {}})} : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`Easypanel ${route}: ${response.status} ${data?.json?.message || ''}`)
  return data?.json ?? data?.result?.data?.json
}

async function login() {
  const [email, password] = fs.readFileSync(CREDENTIALS, 'utf8').trim().split('\n')
  const session = await trpc('auth.login', {email, password}, {auth: false})
  if (!session?.token) throw new Error('Easypanel login did not return a session token')
  token = session.token
}

function docker(...args) {
  return execFileSync('docker', args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']})
}

function seedServices() {
  return docker('service', 'ls', '--format', '{{.Name}} {{.Replicas}}')
    .split('\n')
    .filter((line) => line.startsWith(`${PROJECT}_`))
}

function seedVolumes() {
  return docker('volume', 'ls', '--format', '{{.Name}}')
    .split('\n')
    .filter((name) => VOLUMES.includes(name))
}

function replicasReady(service) {
  const line = seedServices().find((item) => item.startsWith(`${PROJECT}_${service} `))
  return line?.split(' ')[1] === '1/1'
}

function siteConfig() {
  try {
    const body = execFileSync(
      'curl',
      ['-kfsS', '--max-time', '5', '--resolve', 'site.example.com:443:127.0.0.1', `${SITE_URL}/hm/api/config`],
      {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']},
    )
    return JSON.parse(body)
  } catch {
    return null
  }
}

function webRefusedPlaceholder() {
  const {stdout, stderr} = spawnSync('docker', ['service', 'logs', '--raw', `${PROJECT}_web`], {encoding: 'utf8'})
  return `${stdout}${stderr}`.includes(`${SECRET_KEY} must be set to a unique secret`)
}

async function webEnv() {
  const project = await trpc('projects.inspectProject', {projectName: PROJECT})
  return project.services.find((service) => service.name === 'web')?.env || ''
}

async function waitFor(check, {max, every = 1000, label}) {
  const deadline = Date.now() + max
  while (Date.now() < deadline) {
    if (await check()) return
    await new Promise((resolve) => setTimeout(resolve, every))
  }
  throw new Error(`Timed out waiting for ${label}`)
}

async function waitForToasts(page) {
  await page
    .locator('[data-sonner-toast]')
    .first()
    .waitFor({state: 'hidden', timeout: 15_000})
    .catch(() => {})
  await page.waitForFunction(() => !document.querySelector('[data-sonner-toast]'), null, {timeout: 15_000})
}

/** Destroys the earlier Seed project and its volumes through Easypanel, so every take starts empty. */
export async function prepare() {
  await login()
  const projects = await trpc('projects.listProjects')
  if (projects.some((project) => project.name === PROJECT)) {
    await trpc('projects.destroyProject', {name: PROJECT})
  }
  await waitFor(() => seedServices().length === 0, {max: 90_000, label: 'Seed services to be removed'})
  await waitFor(
    () => {
      for (const volume of seedVolumes()) {
        const holders = docker(
          'ps',
          '-a',
          '--filter',
          `volume=${volume}`,
          '--format',
          '{{.ID}} {{.Label "com.docker.swarm.service.name"}}',
        )
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split(' '))
        const foreign = holders.find(([, service]) => !service?.startsWith(`${PROJECT}_`))
        if (foreign) throw new Error(`${volume} is used by a container outside the ${PROJECT} project`)
        try {
          if (holders.length) docker('rm', '-f', ...holders.map(([id]) => id))
          docker('volume', 'rm', volume)
        } catch {}
      }
      return seedVolumes().length === 0
    },
    {max: 60_000, label: 'Seed volumes to be removed'},
  )
  if (siteConfig()) throw new Error(`${SITE_URL} still answers after removing the project`)
}

/** Signs the browser in with a fresh Easypanel session token kept outside the repository. */
export function context() {
  const state = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf8'))
  for (const origin of state.origins) {
    for (const item of origin.localStorage) {
      if (item.name !== 'easypanel') continue
      const value = JSON.parse(item.value)
      value.state.token = token
      item.value = JSON.stringify(value)
    }
  }
  return {storageState: state, ignoreHTTPSErrors: true}
}

/** Easypanel tutorial browser launch settings. */
export const options = {
  baseUrl: EASYPANEL_URL,
  browser: {
    args: [
      '--ignore-certificate-errors',
      '--host-resolver-rules=MAP site.example.com 127.0.0.1, MAP localhost 127.0.0.1',
    ],
  },
}

// Blurs the registration secret in the environment editor and the server IP in the sidebar.
function maskSecrets(key) {
  const masks = new Map()
  const tick = () => {
    for (const button of document.querySelectorAll('button')) {
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(button.textContent.trim())) button.style.filter = 'blur(6px)'
    }
    const seen = new Set()
    for (const line of document.querySelectorAll('.cm-line')) {
      const text = line.textContent
      const value = text.slice(key.length + 1)
      if (!text.startsWith(`${key}=`) || !value || value === 'REPLACE_WITH_SECRET') continue
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      let offset = 0
      let started = false
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const end = offset + node.length
        if (!started && end > key.length + 1) {
          range.setStart(node, key.length + 1 - offset)
          started = true
        }
        if (started) range.setEnd(node, node.length)
        offset = end
      }
      const rect = range.getBoundingClientRect()
      let mask = masks.get(line)
      if (!mask) {
        mask = document.createElement('div')
        mask.style.cssText =
          'position:fixed;pointer-events:none;z-index:2147483647;border-radius:4px;background:#e4e4e2'
        document.documentElement.append(mask)
        masks.set(line, mask)
      }
      Object.assign(mask.style, {
        left: `${rect.left - 3}px`,
        top: `${rect.top - 2}px`,
        width: `${rect.width + 6}px`,
        height: `${rect.height + 4}px`,
      })
      seen.add(line)
    }
    for (const [line, mask] of masks) {
      if (!seen.has(line)) {
        mask.remove()
        masks.delete(line)
      }
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** Captures the asserted Easypanel deployment walkthrough. */
export default async function capture(r) {
  const page = r.page
  await r.context.addInitScript(maskSecrets, SECRET_KEY)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {origin: EASYPANEL_URL})
  await r.nav('/')

  const createProject = page.getByRole('button', {name: 'Create Project'})
  await r.shot('dashboard', {target: createProject})

  const projectDialog = page.getByRole('dialog', {name: 'Create Project'})
  await r.click(createProject, {
    name: 'create-project',
    expect: async () => {
      await projectDialog.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })
  const projectName = projectDialog.getByRole('textbox', {name: 'Name'})
  await r.type(projectName, PROJECT, {
    name: 'project-name',
    expect: async () => (await projectName.inputValue()) === PROJECT,
  })
  await r.click(projectDialog.getByRole('button', {name: 'Create'}), {
    name: 'project-create',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname === PROJECT_PATH, {timeout: 15_000})
      await currentPage.getByText('Your project is empty').waitFor({state: 'visible', timeout: 10_000})
      return true
    },
    allowToast: true,
  })
  await waitForToasts(page)

  await r.click(page.locator(`a[href="${PROJECT_PATH}/create"]`).first(), {
    name: 'new-service',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname === `${PROJECT_PATH}/create`, {timeout: 10_000})
      return true
    },
  })
  const fromSchema = page.getByRole('button', {name: 'Create From Schema'})
  await r.click(page.getByRole('button', {name: 'Custom', exact: true}), {
    name: 'custom',
    expect: async () => {
      await fromSchema.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })
  const schemaDialog = page.getByRole('dialog', {name: 'Create From Schema'})
  await r.click(fromSchema, {
    name: 'schema',
    expect: async () => {
      await schemaDialog.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  const schema = schemaDialog.getByRole('textbox', {name: 'Schema'})
  const source = fs.readFileSync(SCHEMA, 'utf8').replaceAll('seed.example.com', 'site.example.com')
  await page.evaluate((text) => navigator.clipboard.writeText(text), source)
  await schema.click()
  await page.keyboard.press('Control+V')
  if ((await schema.inputValue()) !== source) throw new Error('The schema textbox does not contain seed.json')
  await schema.evaluate((textarea) => {
    const at = textarea.value.indexOf('"host": "site.example.com"')
    textarea.setSelectionRange(at, at)
    textarea.blur()
    textarea.focus()
    textarea.setSelectionRange(at, at)
  })
  await r.shot('paste', {target: schema})

  await r.click(schemaDialog.getByRole('button', {name: 'Create'}), {
    name: 'create',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname.startsWith(`${PROJECT_PATH}/app/`), {timeout: 30_000})
      return true
    },
    allowToast: true,
    allowLoading: true,
    settleMs: 1200,
  })
  await waitFor(
    () => SERVICES.every((service) => seedServices().some((line) => line.startsWith(`${PROJECT}_${service} `))),
    {
      max: 30_000,
      label: 'Easypanel to create the daemon, web and updater services',
    },
  )
  await waitFor(webRefusedPlaceholder, {max: 60_000, label: 'Seed web to reject the placeholder secret'})
  await waitForToasts(page)

  const webLink = page.locator(`a[href="${PROJECT_PATH}/app/web"]`)
  await r.click(webLink, {
    name: 'web',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname === `${PROJECT_PATH}/app/web`, {timeout: 10_000})
      await currentPage.locator('.xterm').waitFor({state: 'visible', timeout: 10_000})
      return true
    },
    settleMs: 2500,
  })

  const editor = page.locator('.cm-content')
  await r.click(page.locator(`a[href="${PROJECT_PATH}/app/web/environment"]`), {
    name: 'environment',
    expect: async () => {
      await editor.getByText(`${SECRET_KEY}=REPLACE_WITH_SECRET`).waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  const secretKey = page.locator('.cm-line span').filter({hasText: new RegExp(`^${SECRET_KEY}$`)})
  const secret = crypto.randomBytes(24).toString('hex')
  await r.click(secretKey, {
    name: 'secret-line',
    expect: async () =>
      editor.evaluate((element) => element.contains(document.activeElement) || element === document.activeElement),
    keepFocus: true,
  })
  await secretKey.click()
  await page.keyboard.press('End')
  for (const _ of 'REPLACE_WITH_SECRET') await page.keyboard.press('Shift+ArrowLeft')
  await page.keyboard.insertText(secret)
  const secretLine = page.locator('.cm-line').filter({hasText: new RegExp(`^${SECRET_KEY}=`)})
  const secretReplaced = await editor.evaluate(
    (element, [key, value]) => {
      const lines = [...element.querySelectorAll('.cm-line')].filter((line) => line.textContent.startsWith(`${key}=`))
      return lines.length === 1 && lines[0].textContent === `${key}=${value}`
    },
    [SECRET_KEY, secret],
  )
  if (!secretReplaced) throw new Error(`${SECRET_KEY} was not replaced in the editor`)
  await page.waitForTimeout(300)
  await r.shot('secret', {target: secretLine})

  await r.click(page.getByRole('button', {name: 'Save', exact: true}), {
    name: 'save',
    expect: async (currentPage) => {
      await currentPage.locator('[data-sonner-toast]').filter({hasText: 'Env updated'}).waitFor({timeout: 10_000})
      return (await webEnv()).includes(`${SECRET_KEY}=${secret}`)
    },
    allowToast: true,
  })
  await waitForToasts(page)

  const deployedBefore = docker('service', 'inspect', '--format', '{{.UpdatedAt}}', `${PROJECT}_web`).trim()
  await r.click(page.getByRole('button', {name: 'Deploy', exact: true}), {
    name: 'deploy',
    expect: async (currentPage) => {
      await currentPage.locator('[data-sonner-toast]').filter({hasText: 'App deployed'}).waitFor({timeout: 30_000})
      return docker('service', 'inspect', '--format', '{{.UpdatedAt}}', `${PROJECT}_web`).trim() !== deployedBefore
    },
    allowToast: true,
    allowLoading: true,
  })
  await waitForToasts(page)

  await r.click(page.locator(`a[href="${PROJECT_PATH}/app/web"]`).last(), {
    name: 'overview',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname === `${PROJECT_PATH}/app/web`, {timeout: 10_000})
      return true
    },
  })
  const siteIsReady = () => SERVICES.every(replicasReady) && Boolean(siteConfig())
  await r.poll('wait', {every: 1000, max: 180_000, until: siteIsReady, allowLoading: true})
  if (!siteIsReady()) throw new Error('Seed web did not come up behind https://site.example.com')

  await r.nav(`${PROJECT_PATH}/app/web`)
  await r.shot('running', {target: page.locator(`a[href="${PROJECT_PATH}/app/daemon"]`).locator('xpath=../..')})

  await r.click(page.locator(`a[href="${PROJECT_PATH}/app/web/domains"]`), {
    name: 'domains',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname.endsWith('/app/web/domains'), {timeout: 10_000})
      await currentPage.getByText('site.example.com').first().waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  await r.click(page.locator(`a[href="${PROJECT_PATH}/app/updater"]`), {
    name: 'updater',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname === `${PROJECT_PATH}/app/updater`, {timeout: 10_000})
      await currentPage.locator('.xterm').waitFor({state: 'visible', timeout: 10_000})
      return replicasReady('updater')
    },
    settleMs: 2500,
  })

  await r.nav(`${SITE_URL}/`)
  const comingSoonHeading = page.getByText(/Seed Hypermedia Space Coming Soon/i)
  await comingSoonHeading.waitFor({state: 'visible', timeout: 30_000})
  await r.shot('site', {target: comingSoonHeading.locator('xpath=../..')})

  if (!siteConfig()) throw new Error('Seed config endpoint did not return JSON')
}
