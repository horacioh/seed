/**
 * "Never delete what you don't understand." An editor only models some of an
 * HM block's fields. It snapshots the loaded block, and on save
 * {@link restoreBlock} returns the original object when nothing it models
 * changed, or layers what it models over the original otherwise, keeping every
 * key and attribute it doesn't own.
 */

import type {HMBlockNode} from '../hm-types'

/** An HM block as a plain record (unknown block types carry arbitrary keys). */
export type HMBlockRecord = Record<string, any> & {type: string; id: string}

/**
 * What an editor produced for a block: the fields it models, and which
 * attributes it owns (it deleted any owned attribute missing from
 * `fields.attributes`). `all` means every attribute except `childrenType`
 * when the block has no children.
 */
export type ProducedBlock = {fields: HMBlockRecord; ownedAttrs: readonly string[] | 'all'}

/**
 * Per-block data an editor stores next to its own node (a node attribute, a
 * side map keyed by block id, etc.) so {@link restoreBlock} can keep unknown
 * data. Plain JSON, so it survives editor serialization.
 */
export type BlockSnapshot = {
  /** The HM block exactly as loaded. */
  original: HMBlockRecord
  /** `JSON.stringify` of what the editor produced right after loading it. */
  baseline: string
  /** Top-level keys of the loaded `HMBlockNode`, in order. */
  nodeKeys: string[]
  /** Top-level `HMBlockNode` fields other than `block` and `children`, kept as loaded. */
  nodeExtras?: Record<string, unknown>
}

/** Record a freshly loaded block. Call with what the editor produces for the block once loaded. */
export function snapshotBlock(node: HMBlockNode, produced: ProducedBlock): BlockSnapshot {
  const {block, children: _children, ...extras} = node as HMBlockNode & Record<string, unknown>
  return {
    original: block as unknown as HMBlockRecord,
    baseline: JSON.stringify(produced.fields),
    nodeKeys: Object.keys(node),
    ...(Object.keys(extras).length ? {nodeExtras: extras} : {}),
  }
}

/**
 * Add `childrenType` to what an editor produced when the block's children
 * group has one; the group's type is then owned by the editor.
 */
export function withChildrenType(produced: ProducedBlock, childrenType: string | null | undefined): ProducedBlock {
  if (childrenType == null) return produced
  const fields = {...produced.fields, attributes: {...produced.fields.attributes, childrenType}}
  const ownedAttrs = produced.ownedAttrs === 'all' ? 'all' : [...produced.ownedAttrs, 'childrenType']
  return {fields, ownedAttrs}
}

/**
 * The HM block to save. Untouched blocks return the original object itself
 * (byte-for-byte). Edited blocks keep every key and unowned attribute of the
 * original; a block whose type changed drops the old text annotations.
 */
export function restoreBlock(snapshot: BlockSnapshot | null | undefined, produced: ProducedBlock): HMBlockRecord {
  const {fields, ownedAttrs} = produced
  if (!snapshot) return fields
  const {original} = snapshot
  if (snapshot.baseline === JSON.stringify(fields)) return original
  const {annotations: _annotations, ...rest} = original
  const base = original.type === fields.type || 'annotations' in fields ? original : rest
  const attrs = fields.attributes ?? {}
  const keptAttrs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(original.attributes ?? {})) {
    const owned = ownedAttrs === 'all' ? key !== 'childrenType' || 'childrenType' in attrs : ownedAttrs.includes(key)
    if (!owned) keptAttrs[key] = value
  }
  return {...base, ...fields, attributes: {...keptAttrs, ...attrs}}
}

/**
 * Build an `HMBlockNode`, keeping the loaded node's key order, unknown
 * top-level fields and empty `children` array, if any.
 */
export function assembleBlockNode(
  block: HMBlockRecord,
  children: HMBlockNode[],
  snapshot: BlockSnapshot | null | undefined,
): HMBlockNode {
  const keys = snapshot ? [...snapshot.nodeKeys] : ['block']
  if (children.length && !keys.includes('children')) keys.push('children')
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    if (key === 'block') out.block = block
    else if (key === 'children') out.children = children
    else if (snapshot?.nodeExtras && key in snapshot.nodeExtras) out[key] = snapshot.nodeExtras[key]
  }
  return out as unknown as HMBlockNode
}
