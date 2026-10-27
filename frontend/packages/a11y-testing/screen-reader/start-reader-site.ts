import {createDocumentUpdate} from '../../../apps/cli/src/test/account-helpers'
import {FIXTURE_ACCOUNT} from '../../../apps/cli/src/test/fixture-seed'
import {setupTestEnv} from '../../../../tests/integration/test-env'

const env = await setupTestEnv({
  webPort: 3000,
  daemonHttpPort: 58001,
  daemonGrpcPort: 58002,
  daemonP2pPort: 58000,
})

const daemonUrl = 'http://localhost:58001'
const homeOperations = [
  {type: 'SetAttributes', attrs: [{key: ['name'], value: 'A11y Reader Demo'}]},
  {
    type: 'ReplaceBlock',
    block: {
      id: 'a11y-home-heading',
      type: 'Heading',
      text: 'Reader accessibility checklist',
      annotations: [],
    },
  },
  {type: 'ReplaceBlock', block: {id: 'navigation', type: 'Group'}},
  {
    type: 'ReplaceBlock',
    block: {
      id: 'a11y-nav-guide',
      type: 'Link',
      text: 'Guide',
      link: `hm://${FIXTURE_ACCOUNT.accountId}/a11y-reader`,
      annotations: [],
    },
  },
  {
    type: 'ReplaceBlock',
    block: {
      id: 'a11y-nav-nested',
      type: 'Link',
      text: 'Nested guide',
      link: `hm://${FIXTURE_ACCOUNT.accountId}/a11y-reader/nested`,
      annotations: [],
    },
  },
  {type: 'MoveBlocks', parent: '', blocks: ['a11y-home-heading']},
  {type: 'MoveBlocks', parent: 'navigation', blocks: ['a11y-nav-guide', 'a11y-nav-nested']},
]

await createDocumentUpdate(daemonUrl, FIXTURE_ACCOUNT, '', homeOperations as any)
await createDocumentUpdate(daemonUrl, FIXTURE_ACCOUNT, 'a11y-reader', [
  {type: 'SetAttributes', attrs: [{key: ['name'], value: 'Accessibility Guide'}]},
  {
    type: 'ReplaceBlock',
    block: {id: 'a11y-guide-heading', type: 'Heading', text: 'A nested document', annotations: []},
  },
  {type: 'MoveBlocks', parent: '', blocks: ['a11y-guide-heading']},
])
await createDocumentUpdate(daemonUrl, FIXTURE_ACCOUNT, 'a11y-reader/nested', [
  {type: 'SetAttributes', attrs: [{key: ['name'], value: 'Nested Accessibility Guide'}]},
  {
    type: 'ReplaceBlock',
    block: {id: 'a11y-nested-heading', type: 'Heading', text: 'Nested guide section', annotations: []},
  },
  {type: 'MoveBlocks', parent: '', blocks: ['a11y-nested-heading']},
])

console.log(`Seeded screen-reader site at ${env.web.baseUrl}`)
await new Promise<void>(() => {})
