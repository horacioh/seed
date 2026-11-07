/**
 * Editor adapter contract.
 *
 * Seed's canonical document format is the HM block tree (`HMBlockNode[]`).
 * Any rich-text editor (BlockNote today, ProseKit in the spike) plugs in by
 * converting between its own document model and HM blocks. Everything after
 * `toHM` — diffing against the published version and producing document
 * operations — is shared and editor-independent.
 *
 * This module must stay framework-free: no editor, React or DOM imports.
 */

import {computeReplaceOps, createBlocksMap, hmBlockNodeToBlockNode, toAPIBlockNode} from './block-diff'
import type {DocumentOperation} from './change'
import type {HMBlockNode} from './hm-types'

/**
 * The contract every editor implementation fulfils.
 *
 * Rules every implementation must honour (and test):
 * - Block ids survive load → edit → save. New blocks get fresh ids; existing
 *   blocks keep theirs.
 * - Never delete what you don't understand: unknown block types, unknown
 *   attributes, unknown annotations and unknown top-level block keys must
 *   come back out of `toHM` byte-for-byte when the user didn't touch them,
 *   and unknown blocks must still render their text and children.
 */
export interface EditorAdapter<EditorDoc> {
  /** Stable identifier of the editor implementation, e.g. `prosekit`. */
  readonly name: string
  /** Load HM blocks into the editor's document model. */
  fromHM(blocks: HMBlockNode[]): EditorDoc
  /** Serialize the editor's document model back to HM blocks. */
  toHM(doc: EditorDoc): HMBlockNode[]
}

/**
 * Shared save path: turn an edited HM tree into the document operations that
 * update `published` to `edited`.
 *
 * Uses the same block-id-trusting diff as `seed document update`: existing
 * ids are diffed for content changes, unknown ids are created, missing ids are
 * deleted, and sibling order changes produce `MoveBlocks`. An untouched
 * document yields no operations.
 */
export function hmDocumentOperations(published: HMBlockNode[], edited: HMBlockNode[]): DocumentOperation[] {
  const oldMap = createBlocksMap(published.map(toAPIBlockNode))
  return computeReplaceOps(oldMap, edited.map(hmBlockNodeToBlockNode))
}

/**
 * Collect every block id in an HM tree, depth-first. Handy for asserting that
 * ids survive an editor round trip.
 */
export function collectHMBlockIds(blocks: HMBlockNode[]): string[] {
  const ids: string[] = []
  const walk = (nodes: HMBlockNode[]) => {
    for (const node of nodes) {
      ids.push(node.block.id)
      if (node.children) walk(node.children)
    }
  }
  walk(blocks)
  return ids
}
