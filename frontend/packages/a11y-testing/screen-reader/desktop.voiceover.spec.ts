import {expect} from '@playwright/test'
import {voiceOverTest as test} from './fixtures'
import {launchUnpackagedApp} from './launch-electron'

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
    await expect(page.getByRole('button', {name: /close window/i})).toBeVisible()
    await expect
      .poll(async () => (await voiceOver.spokenPhraseLog()).join('\n').toLowerCase())
      .toContain('close window')

    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('F6')
    }
    for (const regionName of ['banner', 'sidebar', 'main']) {
      await expect.poll(async () => (await voiceOver.spokenPhraseLog()).join('\n').toLowerCase()).toContain(regionName)
    }

    await page.getByRole('link', {name: /skip to content/i}).focus()
    await expect
      .poll(async () => (await voiceOver.spokenPhraseLog()).join('\n').toLowerCase())
      .toContain('skip to content')
  } finally {
    await app.close()
  }
})
