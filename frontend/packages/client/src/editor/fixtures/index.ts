/**
 * Shared editor fixtures for adapter tests: one block of every modelled type,
 * plus three real published documents from seed.horacioh.com. Test-only.
 */

import type {HMBlockNode} from '../../hm-types'
import {allBlocks} from './all-blocks'
import horacioHome from './horacio-home.json'
import seedHypermedia from './seed-hypermedia.json'
import weeklyReview from './weekly-review.json'

export {allBlocks}

/** Every shared fixture by name, as HM block trees. */
export const editorFixtures: Record<string, HMBlockNode[]> = {
  'all blocks': allBlocks,
  'horacio home': horacioHome.content as unknown as HMBlockNode[],
  'seed hypermedia': seedHypermedia.content as unknown as HMBlockNode[],
  'weekly review': weeklyReview.content as unknown as HMBlockNode[],
}
