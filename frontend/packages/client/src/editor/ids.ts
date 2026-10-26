/** Block id rules every adapter shares: generation, fresh ids on paste, and validation. */

import type {HMBlockNode} from '../hm-types'
import {CHILDREN_TYPES} from './blocks'

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

/** A new 8-character block id in the alphabet BlockNote uses. */
export function createBlockId(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ID_ALPHABET[b & 63]).join('')
}

/**
 * A copy of `blocks` with a fresh id on every block, for paste and duplicate.
 * Everything else, including unknown fields, is kept.
 */
export function withFreshIds(blocks: HMBlockNode[], newId: () => string = createBlockId): HMBlockNode[] {
  return blocks.map((node) => ({
    ...node,
    block: {...node.block, id: newId()},
    ...(node.children ? {children: withFreshIds(node.children, newId)} : {}),
  })) as HMBlockNode[]
}

/** A problem {@link validateHMTree} found. */
export type HMTreeIssue =
  | {kind: 'missing-id'; path: number[]}
  | {kind: 'duplicate-id'; id: string; path: number[]}
  | {kind: 'unknown-children-type'; id: string; childrenType: unknown}

/**
 * Check the invariants the save path relies on: every block has an id and ids
 * are unique. Editors without a schema (Lexical, CodeMirror) should run this
 * on their `toHM` output in tests. Unknown `childrenType` values are reported
 * but legal: they must be preserved.
 */
export function validateHMTree(blocks: HMBlockNode[]): HMTreeIssue[] {
  const issues: HMTreeIssue[] = []
  const seen = new Set<string>()
  const walk = (nodes: HMBlockNode[], prefix: number[]) =>
    nodes.forEach((node, i) => {
      const path = [...prefix, i]
      const id = node.block?.id
      if (!id) issues.push({kind: 'missing-id', path})
      else if (seen.has(id)) issues.push({kind: 'duplicate-id', id, path})
      else seen.add(id)
      const childrenType = (node.block as {attributes?: Record<string, unknown>} | undefined)?.attributes?.childrenType
      if (id && childrenType != null && !(CHILDREN_TYPES as readonly unknown[]).includes(childrenType)) {
        issues.push({kind: 'unknown-children-type', id, childrenType})
      }
      if (node.children) walk(node.children, path)
    })
  walk(blocks, [])
  return issues
}
