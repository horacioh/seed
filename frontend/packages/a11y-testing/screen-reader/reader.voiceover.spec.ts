import {voiceOverWebTest as voiceOverTest} from './fixtures'
import {
  attachSpokenPhraseLog,
  runEditorScenario,
  runHeadingScenario,
  runLandmarkScenario,
  runSkipLinkScenario,
  runVaultScenario,
} from './scenarios'

voiceOverTest.afterEach(async ({voiceOver}, testInfo) => {
  await attachSpokenPhraseLog(voiceOver, testInfo)
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

voiceOverTest('editor announcements', {tag: '@sr-report'}, async ({page, voiceOver}) => {
  await runEditorScenario(page, voiceOver)
})

voiceOverTest('vault email and submit error', {tag: '@sr-report'}, async ({page, voiceOver}) => {
  await runVaultScenario(page, voiceOver)
})
