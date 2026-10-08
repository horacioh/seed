import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'

const COOLIFY_URL = 'http://localhost:8000'
const API_URL = `${COOLIFY_URL}/api/v1`
const PROJECT_UUID = 'n5nnxdsvsmls18z90uxmxirg'
const SERVER_UUID = '5eq5rioqls2zo5kozzedwb4c'
const PROJECT_PATH = `/project/${PROJECT_UUID}/environment/e0f8nivpbvv8owofo1dlgnmz`
const STORAGE_STATE = path.join(os.homedir(), '.config/coolify/storage-state.json')
const API_TOKEN = path.join(os.homedir(), '.config/coolify/api-token')
const SITE_COMPOSE = path.resolve('ops/coolify/seed-site.yaml')
const UPDATER_COMPOSE = path.resolve('ops/coolify/seed-updater.yaml')

async function api(route, {method = 'GET', body} = {}) {
  const token = fs.readFileSync(API_TOKEN, 'utf8').trim()
  const response = await fetch(`${API_URL}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? {'Content-Type': 'application/json'} : {}),
    },
    ...(body ? {body: JSON.stringify(body)} : {}),
  })
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!response.ok) throw new Error(`Coolify API ${method} ${route}: ${response.status} ${JSON.stringify(data)}`)
  return data
}

function belongsToProject(service, environmentIds) {
  return (
    environmentIds.has(Number(service.environment_id)) ||
    service.environment?.project_uuid === PROJECT_UUID ||
    service.project_uuid === PROJECT_UUID
  )
}

function isSeedCompose(service) {
  const source = [service.name, service.docker_compose_raw, service.docker_compose].filter(Boolean).join('\n')
  return /seed|SERVICE_PASSWORD_SEEDLINK/i.test(source)
}

function seedDataVolumes() {
  return execFileSync('docker', ['volume', 'ls', '--format', '{{.Name}}'], {encoding: 'utf8'})
    .split('\n')
    .filter((name) => /seed-(daemon|web)-data/i.test(name))
}

async function pasteCompose(r, file, beat) {
  const page = r.page
  const editorInput = page.getByRole('textbox', {name: 'Editor content'})
  const editor = page.locator('.monaco-editor')
  await editorInput.waitFor({state: 'visible'})
  const source = fs.readFileSync(file, 'utf8')
  await page.evaluate((text) => navigator.clipboard.writeText(text), source)
  await editor.click({position: {x: 120, y: 80}})
  await page.keyboard.press('Control+V')
  await page.waitForFunction(
    (text) => window.monaco?.editor.getModels().some((model) => model.getValue() === text),
    source,
  )
  await r.shot(beat, {target: editor})
}

/** Clears existing Seed Compose resources and their data volumes through Coolify. */
export async function prepare() {
  const server = await api(`/servers/${SERVER_UUID}`)
  if (!server.settings?.is_reachable || !server.settings?.is_usable) {
    throw new Error('Coolify localhost server is not validated and usable')
  }
  const project = await api(`/projects/${PROJECT_UUID}`)
  const environmentIds = new Set((project.environments || []).map((environment) => Number(environment.id)))
  if (!environmentIds.size) throw new Error('Seed sites project has no environments')
  const services = await api('/services')
  const targets = services.filter((service) => belongsToProject(service, environmentIds) && isSeedCompose(service))

  for (const service of targets) {
    await api(
      `/services/${encodeURIComponent(
        service.uuid,
      )}?delete_volumes=true&delete_connected_networks=true&delete_configurations=true&docker_cleanup=true`,
      {method: 'DELETE'},
    )
  }

  const pending = new Set(targets.map((service) => service.uuid))
  const deadline = Date.now() + 60_000
  while ((pending.size || seedDataVolumes().length) && Date.now() < deadline) {
    const current = await api('/services')
    const remaining = new Set(current.map((service) => service.uuid))
    for (const uuid of pending) if (!remaining.has(uuid)) pending.delete(uuid)
    if (pending.size || seedDataVolumes().length) await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  if (pending.size) throw new Error(`Timed out waiting for Coolify to remove services: ${[...pending].join(', ')}`)
  const volumes = seedDataVolumes()
  if (volumes.length) throw new Error(`Coolify left Seed data volumes behind: ${volumes.join(', ')}`)
}

/** Configures the browser session for Coolify and clipboard paste. */
export function context() {
  return {
    storageState: STORAGE_STATE,
    ignoreHTTPSErrors: true,
  }
}

/** Coolify tutorial browser launch settings. */
export const options = {
  baseUrl: COOLIFY_URL,
  browser: {
    args: ['--ignore-certificate-errors', '--host-resolver-rules=MAP site.example.com 127.0.0.1'],
  },
}

/** Captures the asserted Coolify deployment walkthrough. */
export default async function capture(r) {
  const page = r.page
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {origin: COOLIFY_URL})
  await r.nav(PROJECT_PATH)

  const acceptNotifications = page.getByRole('button', {name: 'Accept and close'})
  if (await acceptNotifications.isVisible()) await acceptNotifications.first().click()
  const maybeLater = page.getByRole('button', {name: 'Maybe next time'})
  if (await maybeLater.isVisible()) await maybeLater.first().click()

  const projectHeading = page.getByRole('heading', {name: 'No resources yet'})
  await projectHeading.waitFor({state: 'visible'})
  await r.shot('project', {target: projectHeading, allowEmpty: true})

  const addResource = page.getByRole('main').getByRole('link', {name: 'New resource'})
  await r.click(addResource, {
    name: 'new-resource',
    allowEmpty: true,
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/new$/, {timeout: 10_000})
      return currentPage.url().endsWith('/new')
    },
  })

  const dockerCompose = page.getByRole('button', {name: /Docker Compose/})
  await r.click(dockerCompose, {
    name: 'docker-compose',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.searchParams.has('destination'), {timeout: 10_000})
      const query = new URL(currentPage.url()).searchParams
      return query.get('type') === 'docker-compose-empty' && query.has('destination')
    },
  })

  await pasteCompose(r, SITE_COMPOSE, 'paste')

  const createSite = page.getByRole('button', {name: /^Create service$/i})
  await r.click(createSite, {
    name: 'create',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/service\//, {timeout: 30_000})
      return currentPage.url().includes('/service/')
    },
    settleMs: 1200,
  })

  const service = await api('/services')
  const project = await api(`/projects/${PROJECT_UUID}`)
  const environmentIds = new Set((project.environments || []).map((environment) => Number(environment.id)))
  const siteService = service.find((item) => belongsToProject(item, environmentIds) && isSeedCompose(item))
  if (!siteService) throw new Error('Coolify did not create the Seed site Compose resource')

  const sitePageUrl = `${COOLIFY_URL}${PROJECT_PATH}/service/${siteService.uuid}`
  await r.nav(sitePageUrl)
  const composeResources = page.getByRole('heading', {name: 'Compose resources'}).locator('xpath=../../..')
  await r.shot('services', {target: composeResources})

  const domainTab = page.getByRole('link', {name: 'Domains', exact: true})
  await r.click(domainTab, {
    name: 'domain',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/domains$/, {timeout: 10_000})
      return currentPage.getByRole('heading', {name: 'Domains'}).isVisible()
    },
  })

  const proxyCard = page.getByRole('main').locator('section').filter({hasText: 'Seed Proxy'})
  const domainSettings = proxyCard.getByRole('button', {name: /^Settings for /})
  await r.click(domainSettings, {
    name: 'domain-edit',
    expect: async (currentPage) => {
      await currentPage
        .getByRole('heading', {name: 'Domain settings', exact: true})
        .waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  const settingsHeading = page.getByRole('heading', {name: 'Domain settings', exact: true})
  const settingsPanel = settingsHeading.locator('xpath=../..')
  const protocol = settingsPanel.getByLabel('Protocol')
  await r.click(protocol, {
    name: 'protocol-menu',
    expect: async () => (await protocol.getAttribute('aria-expanded')) === 'true',
  })
  const httpsOption = page.getByText('https', {exact: true}).last()
  await r.click(httpsOption, {
    name: 'protocol-https',
    expect: async () => (await protocol.getAttribute('title')) === 'https',
  })
  await r.shot('protocol', {target: protocol})
  const domain = settingsPanel.getByLabel('Domain')
  await r.type(domain, 'site.example.com', {
    name: 'domain-name',
    expect: async () => (await domain.inputValue()) === 'site.example.com',
  })
  const saveDomain = settingsPanel.getByRole('button', {name: /^Save$/i})
  await r.click(saveDomain, {
    name: 'save',
    expect: async () => {
      await settingsHeading.waitFor({state: 'hidden', timeout: 10_000})
      return true
    },
  })

  const deploySite = page.getByRole('button', {name: /^Deploy$/i})
  await r.click(deploySite, {
    name: 'deploy',
    expect: async (currentPage) => {
      await currentPage
        .getByText(/deployment|deploying/i)
        .first()
        .waitFor({state: 'visible', timeout: 15_000})
      return true
    },
    allowToast: true,
    settleMs: 800,
  })

  const statusList = page.getByRole('main')
  await r.poll('wait', {
    every: 1000,
    max: 240_000,
    until: async () => {
      const text = await statusList.innerText()
      return (
        /Seed Proxy[\s\S]{0,180}healthy/i.test(text) &&
        /Seed Web[\s\S]{0,180}healthy/i.test(text) &&
        /Seed Daemon[\s\S]{0,180}running/i.test(text)
      )
    },
  })
  const statusText = await statusList.innerText()
  if (!/Seed Init[\s\S]{0,180}exited/i.test(statusText)) {
    throw new Error('Seed Init did not reach Exited after the first setup')
  }
  await r.shot('running', {allowEmpty: true})

  const envTab = page.getByRole('link', {name: 'Environment Variables'})
  await r.click(envTab, {
    name: 'secret',
    expect: async (currentPage) => currentPage.getByRole('heading', {name: /Environment Variables/}).isVisible(),
  })
  const secretRow = page.getByRole('row', {name: /SERVICE_PASSWORD_SEEDLINK/})
  await secretRow.waitFor({state: 'visible'})
  const copySecret = secretRow.getByRole('button', {name: /copy/i})
  await r.click(copySecret, {
    name: 'copy-secret',
    expect: async (currentPage) => currentPage.getByRole('status').isVisible(),
    allowToast: true,
  })

  await r.nav(PROJECT_PATH)
  const addUpdater = page.getByRole('main').getByRole('link', {name: 'New resource'})
  await r.click(addUpdater, {
    name: 'updater-resource',
    allowEmpty: true,
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/new$/, {timeout: 10_000})
      return currentPage.url().endsWith('/new')
    },
  })
  await r.click(page.getByRole('button', {name: /Docker Compose/}), {
    name: 'updater-compose',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.searchParams.has('destination'), {timeout: 10_000})
      const query = new URL(currentPage.url()).searchParams
      return query.get('type') === 'docker-compose-empty' && query.has('destination')
    },
  })
  await pasteCompose(r, UPDATER_COMPOSE, 'updater-paste')

  await r.click(page.getByRole('button', {name: /^Create service$/i}), {
    name: 'updater-create',
    expect: async (currentPage) => {
      await currentPage.waitForURL(/\/service\//, {timeout: 30_000})
      return currentPage.url().includes('/service/')
    },
    settleMs: 1000,
  })
  const updaterProject = await api(`/projects/${PROJECT_UUID}`)
  const updaterEnvironmentIds = new Set(
    (updaterProject.environments || []).map((environment) => Number(environment.id)),
  )
  const updaterService = (await api('/services')).find(
    (item) =>
      belongsToProject(item, updaterEnvironmentIds) &&
      /seed-updater/i.test([item.name, item.docker_compose_raw, item.docker_compose].filter(Boolean).join('\n')),
  )
  if (!updaterService) throw new Error('Coolify did not create the Seed updater Compose resource')

  const deployUpdater = page.getByRole('button', {name: /^Deploy$/i})
  await r.click(deployUpdater, {
    name: 'updater-deploy',
    expect: async (currentPage) => {
      await currentPage
        .getByText(/deployment|deploying/i)
        .first()
        .waitFor({state: 'visible', timeout: 15_000})
      return true
    },
    allowToast: true,
    settleMs: 800,
  })
  await r.poll('updater-running', {
    every: 1000,
    max: 120_000,
    until: async () => /running/i.test(await page.getByRole('main').innerText()),
  })

  await r.nav('https://site.example.com/')
  await page.getByText(/Seed Hypermedia Space Coming Soon/i).waitFor({state: 'visible', timeout: 30_000})
  await r.shot('site', {target: page.getByText(/Seed Hypermedia Space Coming Soon/i)})

  const config = execFileSync(
    'curl',
    ['-kfsS', '--resolve', 'site.example.com:443:127.0.0.1', 'https://site.example.com/hm/api/config'],
    {encoding: 'utf8'},
  )
  if (!JSON.parse(config)) throw new Error('Seed config endpoint did not return JSON')
}
