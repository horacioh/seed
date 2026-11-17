import {expect, test} from '../test/fixtures'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'
import type {Page} from '@playwright/test'
import path from 'node:path'

const artifactDir = '/home/ubuntu/a11y-pr6-artifacts'
const a11yModes = ['light', 'dark', 'reduced-motion', 'zoom-200'] as const
const a11yOptions = {modes: [...a11yModes], legacyMode: true}

test.setTimeout(120_000)

async function settleTransitions(page: Page) {
  await page.evaluate(async () => {
    const transitions = document.getAnimations().filter((animation) => animation.constructor.name === 'CSSTransition')
    await Promise.all(transitions.map((transition) => transition.finished.catch(() => undefined)))
  })
}

test('onboarding shell is keyboard accessible and has no axe violations', async ({onboardingPage}) => {
  const page = onboardingPage.appData.appWindow

  await expect(page.locator('#main-content')).toHaveCount(1)
  await expectNoA11yViolations(page, a11yOptions)

  await page.screenshot({path: path.join(artifactDir, 'onboarding-step-1.png')})
  await page.keyboard.press('Tab')
  await expect(page.locator('a[href="#main-content"]')).toBeFocused()
  await page.screenshot({path: path.join(artifactDir, 'onboarding-skip-link.png')})
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('home shell landmarks and keyboard window controls are accessible', async ({homePage}) => {
  const {app, appWindow: page} = homePage.appData

  await expect(page.locator('#main-content')).toHaveCount(1)
  const sidebar = page.locator('[data-a11y-region="sidebar"]')
  const sidebarScrollRegion = sidebar.locator(':scope > .flex-1.overflow-y-auto')
  const joinedSite = sidebar.getByRole('button', {name: /Seed|Hypermedia|Untitled/i}).first()
  await expect(sidebar.getByText('Joined Spaces', {exact: true})).toBeVisible()
  await expect(joinedSite).toBeVisible()
  await expect(page.getByRole('separator', {name: 'Resize sidebar'})).toHaveCSS('position', 'absolute')
  await expect
    .poll(async () => {
      const [scrollBox, siteBox] = await Promise.all([sidebarScrollRegion.boundingBox(), joinedSite.boundingBox()])
      return Boolean(
        scrollBox &&
          siteBox &&
          siteBox.y >= scrollBox.y &&
          siteBox.y + siteBox.height <= scrollBox.y + scrollBox.height,
      )
    })
    .toBe(true)
  await expectNoA11yViolations(page, a11yOptions)

  await page.locator('[data-titlebar-omnibar-region]').click()
  const omnibar = page.getByRole('combobox', {name: 'Search documents or paste a URL'})
  await omnibar.fill('accessibility')
  await expect(omnibar).toHaveAttribute('aria-expanded', 'true')
  await expect(omnibar).toHaveAttribute('aria-controls', 'omnibar-results')
  await page.keyboard.press('ArrowDown')
  const activeDescendant = await omnibar.getAttribute('aria-activedescendant')
  expect(activeDescendant).toBeTruthy()
  await expect(page.locator(`[id="${activeDescendant}"]`)).toHaveAttribute('aria-label', /\S+/)
  await expectNoA11yViolations(page, a11yOptions)
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
    await settleTransitions(page)
    await page.locator('a[href="#main-content"]').focus()
    await page.screenshot({path: path.join(artifactDir, 'home-skip-link-dark.png')})
    await minimize.focus()
    await settleTransitions(page)
    await page.screenshot({path: path.join(artifactDir, 'home-window-control-focus-dark.png')})
  }

  const originalViewport = page.viewportSize()
  if (originalViewport) {
    await page.setViewportSize({width: 640, height: originalViewport.height})
    const siteFileBrowser = page.getByRole('complementary', {name: 'Site documents'})
    if (await siteFileBrowser.isVisible()) {
      await page.getByRole('button', {name: 'Collapse file browser'}).click()
      await expect(siteFileBrowser).toBeHidden()
    }
    const sidebar = page.locator('[data-a11y-region="sidebar"]')
    await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1)
    await expect(sidebar).toHaveAttribute('hidden', '')
    await expect(sidebar).toHaveCSS('display', 'none')
    await expect(sidebar.getByText('Home', {exact: true}).first()).toBeHidden()
    await page.screenshot({path: path.join(artifactDir, 'home-sidebar-collapsed-640.png')})
    const documentWidth = await page.evaluate(() => ({
      scrollWidth: document.scrollingElement?.scrollWidth ?? 0,
      clientWidth: document.scrollingElement?.clientWidth ?? 0,
    }))
    expect(documentWidth.scrollWidth).toBeLessThanOrEqual(documentWidth.clientWidth + 1)
    await page.setViewportSize(originalViewport)
  }

  const settingsWindowPromise = app.waitForEvent('window')
  await page.getByRole('button', {name: 'Open account menu'}).click()
  await page.getByRole('menuitem', {name: 'App settings'}).click()
  const settingsWindow = await settingsWindowPromise
  await expect(settingsWindow.locator('#main-content')).toBeVisible()
  await expect(settingsWindow.getByRole('button', {name: 'General settings'})).toBeVisible()
  await expectNoA11yViolations(settingsWindow, a11yOptions)
})
