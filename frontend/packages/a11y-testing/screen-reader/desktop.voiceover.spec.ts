import {expect} from '@playwright/test'
import {voiceOverTest as test} from './fixtures'
import {launchUnpackagedApp} from './launch-electron'
import {expectSpoken} from './scenarios'

test.afterEach(async ({voiceOver}, testInfo) => {
  await testInfo.attach('spoken-phrase-log.txt', {
    body: (await voiceOver.spokenPhraseLog()).join('\n'),
    contentType: 'text/plain',
  })
})

test('desktop shell announcements', async ({voiceOver}) => {
  const app = await launchUnpackagedApp()

  try {
    const page = await app.firstWindow()
    const backButton = page
      .locator('header[data-a11y-region="titlebar"]')
      .getByRole('button', {name: 'Back', exact: true})
    await expect(backButton).toBeVisible()
    await backButton.focus()
    await expectSpoken(voiceOver, 'Back')
    await expectSpoken(voiceOver, 'button')

    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('F6')
    }
    for (const regionName of ['banner', 'sidebar', 'main']) {
      await expectSpoken(voiceOver, regionName)
    }

    await page.getByRole('link', {name: /skip to content/i}).focus()
    await expectSpoken(voiceOver, 'skip to content')
  } finally {
    await app.close()
  }
})
