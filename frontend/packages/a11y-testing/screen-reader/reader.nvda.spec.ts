import {nvdaTest} from './fixtures'
import {
  attachSpokenPhraseLog,
  runEditorScenario,
  runHeadingScenario,
  runLandmarkScenario,
  runSkipLinkScenario,
  runVaultScenario,
} from './scenarios'

nvdaTest.afterEach(async ({nvda}, testInfo) => {
  await attachSpokenPhraseLog(nvda, testInfo)
})

nvdaTest('web reader skip link', async ({page, nvda}) => {
  await runSkipLinkScenario(page, nvda)
})

nvdaTest('web reader heading navigation', async ({page, nvda}) => {
  await runHeadingScenario(page, nvda)
})

nvdaTest('web reader landmark navigation', async ({page, nvda}) => {
  await runLandmarkScenario(page, nvda)
})

nvdaTest('editor announcements', async ({page, nvda}) => {
  await runEditorScenario(page, nvda)
})

nvdaTest('vault email and submit error', async ({page, nvda}) => {
  await runVaultScenario(page, nvda)
})
