import {expect, test} from '../test/fixtures'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import path from 'node:path'

const artifactDir = '/home/ubuntu/a11y-pr6-artifacts'
const a11yModes = ['light', 'dark', 'reduced-motion', 'zoom-200'] as const

test('onboarding shell is keyboard accessible and has no axe violations', async ({onboardingPage}) => {
  const page = onboardingPage.appData.appWindow

  await expect(page.locator('#main-content')).toHaveCount(1)
  await expect(page.getByRole('heading', {level: 1})).toBeFocused()
  await expectNoA11yViolations(page, {modes: [...a11yModes]})

  await page.locator('a[href="#main-content"]').focus()
  await page.screenshot({path: path.join(artifactDir, 'onboarding-skip-link.png')})
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('home shell landmarks and keyboard window controls are accessible', async ({homePage}) => {
  const {app, appWindow: page} = homePage.appData

  await expect(page.locator('#main-content')).toHaveCount(1)
  await expectNoA11yViolations(page, {modes: [...a11yModes]})

  await page.locator('[data-titlebar-omnibar-region]').click()
  const omnibar = page.getByRole('combobox', {name: 'Search documents or paste a URL'})
  await omnibar.fill('accessibility')
  await expect(omnibar).toHaveAttribute('aria-expanded', 'true')
  await expect(omnibar).toHaveAttribute('aria-controls', 'omnibar-results')
  await page.keyboard.press('ArrowDown')
  const activeDescendant = await omnibar.getAttribute('aria-activedescendant')
  expect(activeDescendant).toBeTruthy()
  await expect(page.locator(`#${activeDescendant}`)).toHaveAttribute('aria-selected', 'true')
  await expectNoA11yViolations(page, {modes: [...a11yModes]})
  await page.keyboard.press('Escape')

  await page.locator('a[href="#main-content"]').focus()
  await page.screenshot({path: path.join(artifactDir, 'home-skip-link-light.png')})

  await page.locator('a[href="#main-content"]').focus()
  await page.keyboard.press('F6')
  await expect(page.locator(':focus').locator('xpath=ancestor-or-self::*[@data-a11y-region="titlebar"]')).toHaveCount(1)
  await page.keyboard.press('F6')
  await expect(page.locator(':focus').locator('xpath=ancestor-or-self::*[@data-a11y-region="sidebar"]')).toHaveCount(1)
  await page.keyboard.press('F6')
  await expect(page.locator(':focus').locator('xpath=ancestor-or-self::*[@data-a11y-region="main"]')).toHaveCount(1)

  if (process.platform !== 'darwin') {
    const minimize = page.getByRole('button', {name: 'Minimize window'})
    await page.locator('a[href="#main-content"]').focus()
    for (let index = 0; index < 40; index += 1) {
      await page.keyboard.press('Tab')
      if (await minimize.evaluate((element) => element === document.activeElement)) break
    }
    await expect(minimize).toBeFocused()
    await page.screenshot({path: path.join(artifactDir, 'home-window-control-focus-light.png')})
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await page.locator('a[href="#main-content"]').focus()
    await page.screenshot({path: path.join(artifactDir, 'home-skip-link-dark.png')})
    await minimize.focus()
    await page.screenshot({path: path.join(artifactDir, 'home-window-control-focus-dark.png')})
  }

  const settingsWindowPromise = app.waitForEvent('window')
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+,' : 'Control+,')
  const settingsWindow = await settingsWindowPromise
  await expect(settingsWindow.locator('#main-content')).toHaveCount(1)
  await expectNoA11yViolations(settingsWindow, {modes: [...a11yModes]})
})
