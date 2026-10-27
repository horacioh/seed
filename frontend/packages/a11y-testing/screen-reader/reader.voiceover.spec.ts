import {voiceOverTest} from './fixtures'
import {
  runEditorScenario,
  runHeadingScenario,
  runLandmarkScenario,
  runSkipLinkScenario,
  runVaultScenario,
} from './scenarios'

voiceOverTest.afterEach(async ({voiceOver}, testInfo) => {
  await testInfo.attach('spoken-phrase-log.txt', {
    body: (await voiceOver.spokenPhraseLog()).join('\n'),
    contentType: 'text/plain',
  })
})

voiceOverTest('web reader skip link', async ({page, voiceOver}) => {
  await runSkipLinkScenario(page, voiceOver)
})

voiceOverTest('web reader heading navigation', async ({page, voiceOver}) => {
  await runHeadingScenario(page, voiceOver)
})

voiceOverTest('web reader landmark navigation', async ({page, voiceOver}) => {
  await runLandmarkScenario(page, voiceOver)
})

voiceOverTest('editor announcements', async ({page, voiceOver}) => {
  await runEditorScenario(page, voiceOver)
})

voiceOverTest('vault email and submit error', async ({page, voiceOver}) => {
  await runVaultScenario(page, voiceOver)
})
