import {expect} from '@playwright/test'
import {voiceOverTest as test} from './fixtures'
import {launchUnpackagedApp} from './launch-electron'
import {attachSpokenPhraseLog, expectSpoken} from './scenarios'

test.afterEach(async ({voiceOver}, testInfo) => {
  await attachSpokenPhraseLog(voiceOver, testInfo)
})

test('desktop shell announcements', async ({voiceOver}) => {
  const app = await launchUnpackagedApp()

  try {
    const page = await app.firstWindow()
    const skipLink = page.getByRole('link', {name: /skip to content/i})
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    await expectSpoken(voiceOver, 'skip to content')

    await page.keyboard.press('F6')
    const backButton = page
      .locator('header[data-a11y-region="titlebar"]')
      .getByRole('button', {name: 'Back', exact: true})
    await expect(backButton).toBeFocused()
    await expectSpoken(voiceOver, 'Back')
    await expectSpoken(voiceOver, 'button')

    await page.keyboard.press('F6')
    await expectSpoken(voiceOver, 'sidebar')
    await page.keyboard.press('F6')
    await expectSpoken(voiceOver, 'main')
    await page.keyboard.press('F6')
    await expectSpoken(voiceOver, 'banner')
  } finally {
    await app.close()
  }
})
