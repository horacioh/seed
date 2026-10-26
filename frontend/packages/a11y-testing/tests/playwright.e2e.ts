import {expect, test} from '@playwright/test'
import {expectNoA11yViolations} from '../src/playwright'

const pageStart = '<!doctype html><html lang="en"><head><title>Accessibility test</title></head><body>'

test('includes the mode label when a page has violations', async ({page}) => {
  await page.setContent(
    `${pageStart}<main><h1>Example</h1><button><svg aria-hidden="true"></svg></button><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="></main></body></html>`,
  )

  await expect(expectNoA11yViolations(page, {modes: ['light']})).rejects.toThrow(/\[?Mode: light/)
})

test('passes an accessible page in all six modes', async ({page}) => {
  await page.setContent(`${pageStart}<main><h1>Example</h1><button>Save</button></main></body></html>`)

  await expectNoA11yViolations(page, {
    modes: ['light', 'dark', 'forced-colors', 'reduced-motion', 'reflow-320', 'zoom-200'],
  })
})

test('reports horizontal overflow in the reflow mode', async ({page}) => {
  await page.setContent(
    `${pageStart}<main><h1>Example</h1><div style="width: 600px; height: 1px"></div></main></body></html>`,
  )

  await expect(expectNoA11yViolations(page, {modes: ['reflow-320']})).rejects.toThrow(/reflow/)
})
