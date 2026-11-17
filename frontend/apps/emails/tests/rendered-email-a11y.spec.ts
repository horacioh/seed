import {expect, test} from '@playwright/test'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import {mkdirSync, readdirSync} from 'node:fs'
import {basename, resolve} from 'node:path'
import {pathToFileURL} from 'node:url'

const previewDir = resolve(process.env.A11Y_EMAIL_OUTPUT_DIR ?? './email-previews')
const artifactDir = resolve(process.env.A11Y_EMAIL_ARTIFACT_DIR ?? './test-results/email-accessibility')
const previewFiles = readdirSync(previewDir).filter((file) => file.endsWith('.html') && file !== 'index.html')

test('all rendered email previews pass light, reflow, and zoom scans', async ({page}) => {
  expect(previewFiles).toHaveLength(10)
  for (const file of previewFiles) {
    await page.goto(pathToFileURL(resolve(previewDir, file)).href)
    await expect(page.locator('h1')).toHaveCount(1)
    await expectNoA11yViolations(page, {modes: ['light', 'reflow-320', 'zoom-200']})
  }
})

test('welcome and mention emails render at 600px and 320px', async ({page}) => {
  mkdirSync(artifactDir, {recursive: true})
  for (const name of ['welcome', 'mention']) {
    for (const width of [600, 320]) {
      await page.setViewportSize({width, height: 900})
      await page.goto(pathToFileURL(resolve(previewDir, `${name}.html`)).href)
      await page.screenshot({
        path: resolve(artifactDir, `${name}-${width}px.png`),
        fullPage: true,
        animations: 'disabled',
      })
    }
  }
})
