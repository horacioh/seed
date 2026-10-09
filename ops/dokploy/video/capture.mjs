import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'

const DOKPLOY_URL = 'http://localhost:3000'
const API_URL = `${DOKPLOY_URL}/api`
const CONFIG_DIR = path.join(os.homedir(), '.config/dokploy')
const API_TOKEN = path.join(CONFIG_DIR, 'api-token')
const STORAGE_STATE = path.join(CONFIG_DIR, 'storage-state.json')
const TEMPLATE_DIR = path.resolve('ops/dokploy/seed')
const PROJECT_NAME = 'Seed sites'
const ENVIRONMENT_NAME = 'production'
const SERVICE_NAME = 'Seed site'
const HOST = 'site.example.com'
let environment

async function api(route, body) {
  const token = fs.readFileSync(API_TOKEN, 'utf8').trim()
  const response = await fetch(`${API_URL}/${route}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'x-api-key': token,
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
  if (!response.ok) throw new Error(`Dokploy API ${route}: ${response.status} ${JSON.stringify(data).slice(0, 300)}`)
  return data
}

async function findEnvironment() {
  const projects = await api('project.all')
  const project = projects.find((item) => item.name === PROJECT_NAME)
  if (!project) return undefined
  const full = await api(`project.one?projectId=${encodeURIComponent(project.projectId)}`)
  const env = full.environments?.find((item) => item.name === ENVIRONMENT_NAME)
  return env && {projectId: project.projectId, environmentId: env.environmentId, compose: env.compose || []}
}

function seedResources(appNames) {
  const list = (args) => execFileSync('docker', args, {encoding: 'utf8'}).split('\n').filter(Boolean)
  const owned = (name) => appNames.some((appName) => name.startsWith(`${appName}`))
  return [
    ...list(['ps', '-a', '--format', '{{.Names}}']).filter(owned),
    ...list(['volume', 'ls', '--format', '{{.Name}}']).filter(owned),
  ]
}

// Dokploy prints the registration secret in the template review and the environment editor, and the deploy
// webhook token on the Deployments tab. Cover those values with a solid bar before any frame is painted.
function redactSecrets() {
  const style = `
    [data-seed-redact='value'] { color: transparent !important; background: #d4d4d8 !important; border-radius: 4px;
      transition: none !important; }
    [data-seed-redact='line'] { position: relative; }
    [data-seed-redact='line']::after { content: ''; position: absolute; top: 0.4rem; bottom: 0.4rem;
      left: calc(0.5rem + 17ch); right: 0.5rem; background: #d4d4d8; border-radius: 4px; }
  `
  const tag = () => {
    if (!document.getElementById('seed-redact-style') && document.head) {
      const el = document.createElement('style')
      el.id = 'seed-redact-style'
      el.textContent = style
      document.head.append(el)
    }
    const wanted = new Map()
    for (const key of document.querySelectorAll('.cm-line > span:first-child')) {
      if (key.textContent !== 'SEED_LINK_SECRET') continue
      for (let el = key.nextElementSibling; el; el = el.nextElementSibling) wanted.set(el, 'value')
    }
    const texts = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let node; (node = texts.nextNode()); ) {
      if (/^SEED_LINK_SECRET=(?!\$\{)\S/.test(node.textContent)) wanted.set(node.parentElement, 'line')
      else if (/\/api\/deploy\/compose\/\S/.test(node.textContent)) wanted.set(node.parentElement, 'value')
    }
    for (const el of document.querySelectorAll('input')) {
      if (/\/api\/deploy\/compose\/\S/.test(el.value)) wanted.set(el, 'value')
    }
    // CodeMirror reuses line nodes, so drop marks from elements that no longer hold a secret.
    for (const el of document.querySelectorAll('[data-seed-redact]')) if (!wanted.has(el)) delete el.dataset.seedRedact
    for (const [el, mode] of wanted) if (el.dataset.seedRedact !== mode) el.dataset.seedRedact = mode
  }
  new MutationObserver(tag).observe(document, {childList: true, subtree: true, characterData: true})
  document.addEventListener('DOMContentLoaded', tag)
  // Input values change without DOM mutations, so re-tag before every paint.
  const onFrame = () => {
    tag()
    requestAnimationFrame(onFrame)
  }
  requestAnimationFrame(onFrame)
}

async function assertRedacted(page) {
  const leaks = await page.evaluate(() => {
    const out = []
    const hidden = (el) => getComputedStyle(el).color === 'rgba(0, 0, 0, 0)'
    for (const key of document.querySelectorAll('.cm-line > span:first-child')) {
      if (key.textContent !== 'SEED_LINK_SECRET') continue
      const rest = [...key.parentElement.childNodes].slice(1)
      const masked = /^•+$/.test(key.parentElement.textContent.replace('SEED_LINK_SECRET=', ''))
      const clear = rest.some((node) => (node.nodeType === 3 ? node.textContent !== '=' : !hidden(node)))
      if (clear && !masked) out.push('environment editor')
    }
    const texts = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let node; (node = texts.nextNode()); ) {
      const el = node.parentElement
      if (/^SEED_LINK_SECRET=(?!\$\{)\S/.test(node.textContent) && getComputedStyle(el, '::after').content === 'none')
        out.push('template review')
      if (/\/api\/deploy\/compose\/\S/.test(node.textContent) && !hidden(el)) out.push('deploy webhook')
    }
    for (const el of document.querySelectorAll('input')) {
      if (/\/api\/deploy\/compose\/\S/.test(el.value) && !hidden(el)) out.push('deploy webhook input')
    }
    return out
  })
  if (leaks.length) throw new Error(`Unredacted secret on screen: ${leaks.join(', ')}`)
  return true
}

/** Removes earlier Seed Compose services and their containers and volumes from the Seed sites project. */
export async function prepare() {
  if (!(await findEnvironment()))
    await api('project.create', {name: PROJECT_NAME, description: 'Self-hosted Seed Hypermedia sites'})
  environment = await findEnvironment()
  if (!environment) throw new Error(`Dokploy project ${PROJECT_NAME} has no ${ENVIRONMENT_NAME} environment`)
  const targets = []
  for (const {composeId} of environment.compose) {
    const compose = await api(`compose.one?composeId=${encodeURIComponent(composeId)}`)
    if (/seedhypermedia\//.test(compose.composeFile || '')) targets.push(compose)
  }
  for (const compose of targets) await api('compose.delete', {composeId: compose.composeId, deleteVolumes: true})
  const appNames = targets.map((compose) => compose.appName)
  const deadline = Date.now() + 90_000
  while (appNames.length && seedResources(appNames).length && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  const left = appNames.length ? seedResources(appNames) : []
  if (left.length) throw new Error(`Dokploy left Seed containers or volumes behind: ${left.join(', ')}`)
  environment = await findEnvironment()
  if (environment.compose.some((compose) => compose.name === SERVICE_NAME)) {
    throw new Error(`A service named ${SERVICE_NAME} is still in ${PROJECT_NAME}`)
  }
}

/** Reuses the saved Dokploy login session. */
export function context() {
  return {storageState: STORAGE_STATE, ignoreHTTPSErrors: true}
}

/** Dokploy tutorial browser launch settings. */
export const options = {
  baseUrl: DOKPLOY_URL,
  browser: {
    args: ['--ignore-certificate-errors', `--host-resolver-rules=MAP ${HOST} 127.0.0.1, MAP localhost 127.0.0.1`],
  },
}

/** Captures the asserted Dokploy deployment walkthrough. */
export default async function capture(r) {
  const page = r.page
  await page.context().addInitScript(redactSecrets)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {origin: DOKPLOY_URL})
  const environmentPath = `/dashboard/project/${environment.projectId}/environment/${environment.environmentId}`
  await r.nav(environmentPath)
  if (!page.url().includes(environmentPath)) {
    throw new Error(`Dokploy session expired (landed on ${page.url()}); refresh ${STORAGE_STATE}`)
  }
  const main = page.getByRole('main')
  const createService = page.getByRole('button', {name: 'Create Service'})
  await createService.waitFor({state: 'visible'})
  await r.shot('project', {target: createService, allowEmpty: true})

  const importOption = page.getByRole('menuitem', {name: 'Import'})
  await r.click(createService, {
    name: 'create-service',
    allowEmpty: true,
    expect: async () => {
      await importOption.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })
  const importDialog = page.getByRole('dialog').filter({has: page.getByRole('heading', {name: 'Import Compose'})})
  await r.click(importOption, {
    name: 'import-option',
    allowEmpty: true,
    expect: async () => {
      await importDialog.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  const nameInput = importDialog.getByLabel('Name', {exact: true})
  await r.type(nameInput, SERVICE_NAME, {
    name: 'name',
    expect: async () => (await nameInput.inputValue()) === SERVICE_NAME,
  })

  const payload = Buffer.from(
    JSON.stringify(
      {
        compose: fs.readFileSync(path.join(TEMPLATE_DIR, 'docker-compose.yml'), 'utf8'),
        config: fs.readFileSync(path.join(TEMPLATE_DIR, 'template.toml'), 'utf8'),
      },
      null,
      2,
    ),
  ).toString('base64')
  const configuration = importDialog.getByLabel('Configuration (Base64)')
  await page.evaluate((text) => navigator.clipboard.writeText(text), payload)
  await configuration.click()
  await page.keyboard.press('Control+V')
  if ((await configuration.inputValue()) !== payload) throw new Error('The base64 template did not paste')
  await r.shot('paste', {target: configuration})

  const review = page.getByRole('dialog').filter({has: page.getByRole('heading', {name: 'Template Information'})})
  await r.click(importDialog.getByRole('button', {name: 'Load', exact: true}), {
    name: 'load',
    expect: async (currentPage) => {
      await review.getByRole('heading', {name: 'Environment Variables'}).waitFor({state: 'attached', timeout: 15_000})
      await review
        .getByText(/^Host: .+\.sslip\.io$/)
        .first()
        .waitFor({state: 'attached', timeout: 15_000})
      return assertRedacted(currentPage)
    },
  })

  const serviceCard = main.getByText(SERVICE_NAME, {exact: true})
  await r.click(review.getByRole('button', {name: 'Import', exact: true}), {
    name: 'import',
    allowToast: true,
    expect: async (currentPage) => {
      await review.waitFor({state: 'hidden', timeout: 20_000})
      await importDialog.waitFor({state: 'hidden', timeout: 10_000})
      // Dokploy hands focus back to the Create Service menu, which reopens.
      if (await importOption.isVisible()) await currentPage.keyboard.press('Escape')
      await importOption.waitFor({state: 'hidden', timeout: 10_000})
      await serviceCard.waitFor({state: 'visible', timeout: 20_000})
      environment = await findEnvironment()
      return environment.compose.some((compose) => compose.name === SERVICE_NAME)
    },
  })
  const compose = environment.compose.find((item) => item.name === SERVICE_NAME)
  const servicePath = `${environmentPath}/services/compose/${compose.composeId}`
  await page.locator('[data-sonner-toast]').first().waitFor({state: 'detached', timeout: 15_000})

  await r.click(serviceCard, {
    name: 'open-service',
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.pathname === servicePath, {timeout: 15_000})
      await currentPage.getByRole('tab', {name: 'Domains'}).waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  const panel = page.getByRole('tabpanel')
  await r.click(page.getByRole('tab', {name: 'Domains'}), {
    name: 'domains',
    expect: async () => {
      await panel.getByText('seed-daemon', {exact: true}).waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })

  for (const [prefix, serviceName] of [
    ['web', 'seed-web'],
    ['daemon', 'seed-daemon'],
  ]) {
    const card = () =>
      panel
        .locator('div')
        .filter({has: page.getByText(serviceName, {exact: true})})
        .filter({has: page.getByRole('switch')})
        .last()
    const dialog = page.getByRole('dialog').filter({hasText: 'In this section you can edit a domain'})
    await r.click(card().getByRole('button').first(), {
      name: `${prefix}-domain`,
      expect: async () => {
        await dialog.getByLabel('Host', {exact: true}).waitFor({state: 'visible', timeout: 10_000})
        return true
      },
    })
    const host = dialog.getByLabel('Host', {exact: true})
    await r.type(host, HOST, {name: `${prefix}-host`, expect: async () => (await host.inputValue()) === HOST})
    const provider = dialog.getByRole('combobox').last()
    if ((await provider.innerText()).trim() !== 'None') throw new Error('Expected the None certificate provider')
    const letsEncrypt = page.getByRole('option', {name: "Let's Encrypt", exact: true})
    await r.click(provider, {
      name: `${prefix}-cert-menu`,
      expect: async () => {
        await letsEncrypt.waitFor({state: 'visible', timeout: 10_000})
        return true
      },
    })
    await r.click(letsEncrypt, {
      name: `${prefix}-cert`,
      expect: async () => {
        await letsEncrypt.waitFor({state: 'hidden', timeout: 10_000})
        return (await provider.innerText()).trim() === "Let's Encrypt"
      },
    })
    await r.click(dialog.getByRole('button', {name: 'Update', exact: true}), {
      name: `${prefix}-update`,
      allowToast: true,
      expect: async () => {
        await dialog.waitFor({state: 'hidden', timeout: 10_000})
        await card().getByText(HOST, {exact: true}).waitFor({state: 'visible', timeout: 10_000})
        await card().getByText('Cert: letsencrypt').waitFor({state: 'visible', timeout: 10_000})
        const domains = await api(`domain.byComposeId?composeId=${encodeURIComponent(compose.composeId)}`)
        const domain = domains.find((item) => item.serviceName === serviceName)
        return domain?.host === HOST && domain.certificateType === 'letsencrypt' && domain.https
      },
    })
    await page.locator('[data-sonner-toast]').first().waitFor({state: 'detached', timeout: 15_000})
  }

  const editor = panel.locator('.cm-editor')
  await r.click(page.getByRole('tab', {name: 'Environment'}), {
    name: 'environment',
    expect: async () => {
      await editor.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })
  const line = (key) => panel.locator('.cm-line').filter({hasText: new RegExp(`^${key}=`)})
  const reveal = panel.getByRole('button', {name: 'Toggle bold'})
  await r.click(reveal, {
    name: 'reveal',
    expect: async (currentPage) => {
      await line('SEED_DOMAIN').waitFor({state: 'visible', timeout: 10_000})
      return assertRedacted(currentPage)
    },
  })
  for (const [key, value, beat] of [
    ['SEED_DOMAIN', HOST, 'env-domain'],
    ['SEED_BASE_URL', `https://${HOST}`, 'env-base-url'],
  ]) {
    await r.type(line(key), `${key}=${value}`, {
      name: beat,
      expect: async (currentPage) =>
        (await line(key).textContent()) === `${key}=${value}` && assertRedacted(currentPage),
    })
  }
  await r.click(panel.getByRole('button', {name: 'Save', exact: true}), {
    name: 'env-save',
    allowToast: true,
    expect: async (currentPage) => {
      await panel.getByText('You have unsaved changes').waitFor({state: 'hidden', timeout: 10_000})
      if (!(await panel.getByRole('button', {name: 'Save', exact: true}).isDisabled())) return false
      const env = (await api(`compose.one?composeId=${encodeURIComponent(compose.composeId)}`)).env.split('\n')
      return (
        env.includes(`SEED_DOMAIN=${HOST}`) &&
        env.includes(`SEED_BASE_URL=https://${HOST}`) &&
        assertRedacted(currentPage)
      )
    },
  })
  await page.locator('[data-sonner-toast]').first().waitFor({state: 'detached', timeout: 15_000})

  const deploy = page.getByRole('button', {name: 'Deploy', exact: true})
  await r.click(page.getByRole('tab', {name: 'General'}), {
    name: 'general',
    expect: async () => {
      await deploy.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })
  const confirm = page.getByRole('alertdialog').filter({hasText: 'Are you sure you want to deploy this compose?'})
  await r.click(deploy, {
    name: 'deploy',
    expect: async () => {
      await confirm.waitFor({state: 'visible', timeout: 10_000})
      return true
    },
  })
  await r.click(confirm.getByRole('button', {name: 'Confirm', exact: true}), {
    name: 'deploy-confirm',
    allowToast: true,
    allowLoading: true,
    expect: async (currentPage) => {
      await currentPage.waitForURL((url) => url.searchParams.get('tab') === 'deployments', {timeout: 15_000})
      await panel.getByText('Manual deployment').first().waitFor({state: 'visible', timeout: 15_000})
      return assertRedacted(currentPage)
    },
  })

  const containerStates = () =>
    new Map(
      execFileSync(
        'docker',
        ['ps', '-a', '--filter', `name=^${compose.appName}-`, '--format', '{{.Names}}\t{{.State}}\t{{.Status}}'],
        {encoding: 'utf8'},
      )
        .split('\n')
        .filter(Boolean)
        .map((row) => {
          const [name, state, status] = row.split('\t')
          return [name.slice(compose.appName.length + 1).replace(/-\d+$/, ''), {state, status}]
        }),
    )
  const siteConfig = () => {
    try {
      return JSON.parse(
        execFileSync('curl', ['-kfsS', '--resolve', `${HOST}:443:127.0.0.1`, `https://${HOST}/hm/api/config`], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }),
      )
    } catch {
      return undefined
    }
  }
  const siteIsReady = async (currentPage) => {
    const [deployment] = await api(`deployment.allByCompose?composeId=${encodeURIComponent(compose.composeId)}`)
    const states = containerStates()
    return (
      deployment?.status === 'done' &&
      states.get('seed-web')?.state === 'running' &&
      states.get('seed-daemon')?.state === 'running' &&
      /\(healthy\)/.test(states.get('seed-updater')?.status || '') &&
      states.get('seed-init')?.status.startsWith('Exited (0)') &&
      Boolean(siteConfig()?.peerId) &&
      assertRedacted(currentPage)
    )
  }
  await r.poll('wait', {every: 1000, max: 300_000, until: siteIsReady, allowLoading: true, allowToast: true})
  if (!(await siteIsReady(page)))
    throw new Error('The Seed stack did not come up: deployment, containers or /hm/api/config')

  await r.nav(`${servicePath}?tab=containers`)
  const table = panel.getByRole('table')
  for (const [service, state] of [
    ['seed-web', 'running'],
    ['seed-daemon', 'running'],
    ['seed-updater', 'running'],
    ['seed-init', 'exited'],
  ]) {
    await table
      .getByRole('row')
      .filter({hasText: `${compose.appName}-${service}-1`})
      .getByText(state, {exact: true})
      .waitFor({state: 'visible', timeout: 15_000})
  }
  await r.shot('running', {target: table})

  await r.nav(`https://${HOST}/`)
  const comingSoon = page.getByText(/Seed Hypermedia Space Coming Soon/i)
  await comingSoon.waitFor({state: 'visible', timeout: 30_000})
  await r.shot('site', {target: comingSoon.locator('xpath=../..')})
  if (!siteConfig()) throw new Error('Seed config endpoint did not return JSON')
}
