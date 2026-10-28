import {execFileSync} from 'node:child_process'
import {mkdir, writeFile} from 'node:fs/promises'
import {expect} from '@playwright/test'
import {voiceOverTest as test} from './fixtures'
import {launchUnpackagedApp} from './launch-electron'
import {attachSpokenPhraseLog, expectSpoken, tabUntilPhrase} from './scenarios'

test.afterEach(async ({voiceOver}, testInfo) => {
  await attachSpokenPhraseLog(voiceOver, testInfo)
})

test('desktop shell announcements', {tag: '@sr-report'}, async ({voiceOver}, testInfo) => {
  const app = await launchUnpackagedApp()

  try {
    const page = await app.firstWindow()
    const main = page.locator('#main-content')
    await expect(main).toBeVisible()
    const onboarding = page.getByRole('heading', {name: 'Welcome to Seed Hypermedia'})
    if (await onboarding.isVisible()) {
      const homeLink = page
        .locator('[data-a11y-region="sidebar"] button')
        .filter({hasText: /Seed|Hypermedia|Untitled/i})
        .first()
      await homeLink.click()
      await onboarding.waitFor({state: 'detached'})
    }
    await expect(main).toBeVisible()
    const skipLink = page.getByRole('link', {name: 'Skip to content'})
    await expect(skipLink).toBeVisible()
    await app.evaluate(({app, BrowserWindow}) => {
      app.focus({steal: true})
      BrowserWindow.getAllWindows()[0]?.focus()
    })
    await mkdir(testInfo.outputDir, {recursive: true})
    const screenshotPath = testInfo.outputPath('screen.png')
    execFileSync('screencapture', ['-x', screenshotPath])
    await testInfo.attach('screen.png', {path: screenshotPath, contentType: 'image/png'})
    const frontmostProcess = execFileSync(
      'osascript',
      ['-e', 'tell application "System Events" to get name of first process whose frontmost is true'],
      {encoding: 'utf8'},
    ).trim()
    const frontmostProcessPath = testInfo.outputPath('frontmost-process.txt')
    await writeFile(frontmostProcessPath, `${frontmostProcess}\n`, 'utf8')
    await testInfo.attach('frontmost-process.txt', {path: frontmostProcessPath, contentType: 'text/plain'})

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await tabUntilPhrase(voiceOver, 'Skip to content')
    await expectSpoken(voiceOver, 'link')
    await voiceOver.clearSpokenPhraseLog()
    await voiceOver.act()
    await expect(page.locator('#main-content')).toBeFocused()
    await expectSpoken(voiceOver, 'heading level 1')
    await expectSpoken(voiceOver, 'Welcome to Seed Hypermedia')

    await voiceOver.clearSpokenPhraseLog()
    await tabUntilPhrase(voiceOver, 'Close Sidebar')
    await expectSpoken(voiceOver, 'Close Sidebar')
    await expectSpoken(voiceOver, 'button')

    await voiceOver.clearSpokenPhraseLog()
    await voiceOver.press('F6')
    await expectSpoken(voiceOver, 'sidebar')
    await voiceOver.clearSpokenPhraseLog()
    await voiceOver.press('F6')
    await expectSpoken(voiceOver, 'main')
    await voiceOver.clearSpokenPhraseLog()
    await voiceOver.press('F6')
    await expectSpoken(voiceOver, 'banner')
  } finally {
    await app.close()
  }
})
