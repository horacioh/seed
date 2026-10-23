import type {EditorAdapter} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {invertedEffects} from '@codemirror/commands'
import {
  EditorState,
  type Extension,
  MapMode,
  RangeSet,
  RangeSetBuilder,
  RangeValue,
  StateEffect,
  StateField,
} from '@codemirror/state'
import {
  type AnyBlock,
  blockContent,
  LIST_TYPES,
  parseContent,
  type ParsedContent,
  type ScannedBlock,
  scanBlocks,
  serializeBlock,
} from './format'

/** What the editor keeps about a block outside the text. */
export type BlockMeta = {
  id: string
  /** The loaded HM block, or a template for a new one (e.g. an upload's `name`). */
  base?: AnyBlock
  /** The modelled fields at load time; equal fields return `base` untouched. */
  baseline?: string
  /** Key order of the loaded `HMBlockNode`. */
  nodeKeys?: string[]
}

/** A scanned block with its identity. */
export type SeedBlock = ScannedBlock & {meta: BlockMeta}

/** Marks the first line of a block; mapped through every transaction. */
class BlockMarker extends RangeValue {
  constructor(readonly meta: BlockMeta) {
    super()
  }
  override eq(other: RangeValue) {
    return other instanceof BlockMarker && other.meta === this.meta
  }
}
BlockMarker.prototype.point = true
BlockMarker.prototype.startSide = -1

/** Value of {@link seedBlocks}: block markers and the scanned blocks, in order. */
export type SeedBlocksValue = {markers: RangeSet<BlockMarker>; blocks: SeedBlock[]}

/** Give the block starting at `pos` (in the new document) this identity. */
export const assignBlock = StateEffect.define<{pos: number; meta: BlockMeta}>({
  map: (value, mapping) => ({pos: mapping.mapPos(value.pos, -1), meta: value.meta}),
})

/** A fresh random block id, in the same 8-character alphabet BlockNote uses. */
export function createBlockId(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

function buildBlocks(text: string, metaAt: (pos: number, index: number) => BlockMeta | undefined): SeedBlocksValue {
  const builder = new RangeSetBuilder<BlockMarker>()
  const used = new Set<string>()
  const blocks = scanBlocks(text).map((scanned, index) => {
    let meta = metaAt(scanned.from, index)
    if (!meta || used.has(meta.id)) meta = {id: createBlockId()}
    used.add(meta.id)
    builder.add(scanned.from, scanned.from, new BlockMarker(meta))
    return {...scanned, meta}
  })
  return {markers: builder.finish(), blocks}
}

/**
 * Block identities next to the text. Each block's first line carries a
 * marker; markers follow their line through edits, new lines get fresh ids,
 * and when two markers land on one line the one whose text survived wins.
 */
export const seedBlocks = StateField.define<SeedBlocksValue>({
  create: (state) => buildBlocks(state.doc.toString(), () => undefined),
  update(value, tr) {
    const assigned = tr.effects.filter((e) => e.is(assignBlock))
    if (!tr.docChanged && !assigned.length) return value
    const byPos = new Map<number, {meta: BlockMeta; lost: boolean}>()
    value.markers.between(0, tr.startState.doc.length, (from, _to, marker) => {
      const pos = tr.changes.mapPos(from, -1)
      const lost = tr.changes.mapPos(from, -1, MapMode.TrackAfter) === null
      const prev = byPos.get(pos)
      if (!prev || (prev.lost && !lost)) byPos.set(pos, {meta: marker.meta, lost})
    })
    for (const e of assigned) byPos.set(e.value.pos, {meta: e.value.meta, lost: false})
    return buildBlocks(tr.state.doc.toString(), (pos) => byPos.get(pos)?.meta)
  },
})

/** Undo brings deleted blocks back with their ids. */
const restoreOnUndo = invertedEffects.of((tr) => {
  if (!tr.docChanged) return []
  const after = new Set(tr.state.field(seedBlocks).blocks.map((b) => b.meta))
  return tr.startState
    .field(seedBlocks)
    .blocks.filter((b) => !after.has(b.meta) || tr.changes.touchesRange(b.from))
    .map((b) => assignBlock.of({pos: b.from, meta: b.meta}))
})

type TreeItem = {block: SeedBlock; children: TreeItem[]}

function buildTree(blocks: SeedBlock[]): TreeItem[] {
  const root: TreeItem[] = []
  const stack: TreeItem[] = []
  for (const block of blocks) {
    const item = {block, children: []}
    stack.length = block.depth
    ;(stack[block.depth - 1]?.children ?? root).push(item)
    stack.push(item)
  }
  return root
}

/** What the editor itself knows about a block: only the fields it models. */
function produceBlock(item: TreeItem): ParsedContent & {fields: AnyBlock} {
  const {meta} = item.block
  const parsed = parseContent(blockContent(item.block), meta.base)
  const {type, ...rest} = parsed.fields
  const fields = {type, id: meta.id, ...rest} as ParsedContent['fields'] & AnyBlock
  const ownedAttrs = [...parsed.ownedAttrs]
  if (item.children.length) {
    const loaded = meta.base?.attributes?.childrenType
    const childrenType = item.children[0]!.block.marker ?? (loaded && !LIST_TYPES.includes(loaded) ? loaded : 'Group')
    fields.attributes.childrenType = childrenType
    ownedAttrs.push('childrenType')
  }
  return {...parsed, fields, ownedAttrs}
}

/**
 * Turn a block back into HM. Untouched blocks return the loaded object itself
 * (byte-for-byte). Edited blocks layer the modelled fields over it, keeping
 * every key and attribute the editor doesn't own.
 */
function blockToHM(item: TreeItem): AnyBlock {
  const {fields, ownedAttrs} = produceBlock(item)
  const {base, baseline} = item.block.meta
  if (base && baseline === JSON.stringify(fields)) return base
  if (!base || base.type !== fields.type) return fields
  const kept: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(base.attributes ?? {})) if (!ownedAttrs.includes(key)) kept[key] = value
  return {...base, ...fields, attributes: {...kept, ...fields.attributes}}
}

function itemToHM(item: TreeItem): HMBlockNode {
  const children = item.children.map(itemToHM)
  const block = blockToHM(item) as HMBlockNode['block']
  // Keep the loaded node's key order and its empty `children` array, if any.
  const keys = [...(item.block.meta.nodeKeys ?? ['block'])]
  if (children.length && !keys.includes('children')) keys.push('children')
  const out: Record<string, unknown> = {}
  for (const key of keys) out[key] = key === 'block' ? block : children
  return out as HMBlockNode
}

/** Write HM blocks as Seed text, with the identity of each block in text order. */
export function serializeDoc(blocks: HMBlockNode[]): {text: string; metas: BlockMeta[]} {
  const lines: string[] = []
  const metas: BlockMeta[] = []
  const walk = (nodes: HMBlockNode[], depth: number, childrenType: unknown) =>
    nodes.forEach((node, i) => {
      const block = node.block as AnyBlock
      const marker =
        depth === 0
          ? ''
          : childrenType === 'Unordered'
            ? '- '
            : childrenType === 'Ordered'
              ? `${i + 1}. `
              : childrenType === 'Blockquote'
                ? '> '
                : ''
      const prefix = '  '.repeat(depth) + marker
      const [first, ...rest] = serializeBlock(block).split('\n')
      lines.push(prefix + first, ...rest.map((l) => (l ? ' '.repeat(prefix.length) + l : l)))
      metas.push({id: block.id, base: block, nodeKeys: Object.keys(node)})
      walk(node.children ?? [], depth + 1, block.attributes?.childrenType)
    })
  walk(blocks, 0, undefined)
  return {text: lines.join('\n'), metas}
}

/** The core extensions every Seed CodeMirror state needs. */
export function seedCore(): Extension {
  return [seedBlocks, restoreOnUndo]
}

/** Create an editor state holding these HM blocks. */
export function createSeedState(blocks: HMBlockNode[], extensions: Extension = []): EditorState {
  const {text, metas} = serializeDoc(blocks)
  const initial = seedBlocks.init((state) => {
    const value = buildBlocks(state.doc.toString(), (_pos, index) => metas[index])
    const walk = (items: TreeItem[]) =>
      items.forEach((item) => {
        if (item.block.meta.base) item.block.meta.baseline = JSON.stringify(produceBlock(item).fields)
        walk(item.children)
      })
    walk(buildTree(value.blocks))
    return value
  })
  return EditorState.create({doc: text, extensions: [initial, restoreOnUndo, extensions]})
}

/** The blocks of a state as an HM tree. */
export function toHM(state: EditorState): HMBlockNode[] {
  return buildTree(state.field(seedBlocks).blocks).map(itemToHM)
}

/** Load HM blocks into a bare editor state (no view extensions). */
export function fromHM(blocks: HMBlockNode[]): EditorState {
  return createSeedState(blocks)
}

/** The CodeMirror implementation of the editor adapter contract. */
export const codemirrorAdapter: EditorAdapter<EditorState> = {name: 'codemirror', fromHM, toHM}
