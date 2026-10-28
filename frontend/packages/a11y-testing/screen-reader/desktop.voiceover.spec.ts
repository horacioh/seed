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
    await app.evaluate(({app, BrowserWindow}) => {
      app.focus({steal: true})
      BrowserWindow.getAllWindows()[0]?.focus()
    })
    await voiceOver.clearSpokenPhraseLog()
    await voiceOver.press('Tab')
    await expect(skipLink).toBeFocused()
    await expectSpoken(voiceOver, 'skip to content')
    await expectSpoken(voiceOver, 'link')

    await voiceOver.clearSpokenPhraseLog()
    await voiceOver.press('F6')
    const backButton = page
      .locator('header[data-a11y-region="titlebar"]')
      .getByRole('button', {name: 'Back', exact: true})
    await expect(backButton).toBeFocused()
    await expectSpoken(voiceOver, 'Back')
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
