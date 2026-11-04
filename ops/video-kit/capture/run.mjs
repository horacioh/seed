#!/usr/bin/env node
// Usage: node ops/video-kit/capture/run.mjs <tutorial-folder> --lang en [--format 16x9|9x16] [--headed] [--base URL]
import path from 'node:path'
import {existsSync} from 'node:fs'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {createRecorder} from './rec.mjs'

const args = process.argv.slice(2)
const requestedFolder = args.find((a) => !a.startsWith('--')) || '.'
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const localFolder = path.resolve(requestedFolder)
const folder =
  path.isAbsolute(requestedFolder) || existsSync(localFolder) ? localFolder : path.resolve(repoRoot, requestedFolder)
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`)
  return i >= 0 ? args[i + 1] : d
}
const lang = flag('lang', 'en')
const format = flag('format', '16x9')
if (!['16x9', '9x16'].includes(format)) {
  console.error(`unknown --format ${format}`)
  process.exit(2)
}
const moduleUrl = pathToFileURL(path.join(folder, 'capture.mjs')).href
const mod = await import(moduleUrl)
const options = mod.options || {}
const baseUrl = flag('base', options.baseUrl || 'http://localhost:5173')
const headed = args.includes('--headed')

const persona = format === '9x16' ? 'phone-9x16' : mod.persona || 'desktop'
const take = format === '9x16' ? `${lang}-9x16` : lang
const context = {folder, take, lang, format, baseUrl, persona}
if (mod.prepare) await mod.prepare(context)
const contextOptions = mod.context ? (browser) => mod.context(browser) : options.context || {}
const r = await createRecorder({
  take,
  outDir: folder,
  persona,
  baseUrl,
  lang,
  browserOptions: options.browser || {},
  contextOptions,
  frameGuard: options.frameGuard || {},
  hideSelectors: options.hideSelectors || [],
  headless: !headed,
})
try {
  await mod.default(r, {...context, phone: persona.startsWith('phone')})
  const file = await r.done()
  console.log(`beats written: ${file}`)
} catch (e) {
  console.error('capture failed:', e)
  try {
    await r.page.screenshot({path: path.join(folder, 'shots', `FAILED-${take}.png`)})
  } catch {}
  await r.browser.close()
  process.exit(1)
}
