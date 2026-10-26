import type {EditorAdapter} from '@seed-hypermedia/client/editor-adapter'
import {blockKind, ownedAttributes} from '@seed-hypermedia/client/editor/blocks'
import {createBlockId} from '@seed-hypermedia/client/editor/ids'
import {inlineFromHM, inlineToHM, type InlineMark, type InlineRun} from '@seed-hypermedia/client/editor/inline'
import {
  assembleBlockNode,
  restoreBlock,
  snapshotBlock,
  withChildrenType,
  type BlockSnapshot,
  type HMBlockRecord,
  type ProducedBlock,
} from '@seed-hypermedia/client/editor/preserve'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {Mark, Node as PMNode, Schema} from 'prosekit/pm/model'
import {defineSeedSchema, HM_TO_NODE, NODE_TO_HM} from './schema'

export {createBlockId}
export {INLINE_EMBED_CHAR} from '@seed-hypermedia/client/editor/inline'

/** HM annotation types that map 1:1 to ProseKit marks, and the colour marks. */
const SIMPLE_MARKS = {Bold: 'bold', Italic: 'italic', Underline: 'underline', Strike: 'strike', Code: 'code'} as const
const COLOR_MARKS = {TextColor: 'textColor', BackgroundColor: 'backgroundColor'} as const
const MARK_TO_SIMPLE = Object.fromEntries(Object.entries(SIMPLE_MARKS).map(([hm, mark]) => [mark, hm]))
const MARK_TO_COLOR = Object.fromEntries(Object.entries(COLOR_MARKS).map(([hm, mark]) => [mark, hm]))

let cachedSchema: Schema | undefined

/** The ProseMirror schema built from {@link defineSeedSchema}. */
export function getSeedSchema(): Schema {
  cachedSchema ??= defineSeedSchema().schema!
  return cachedSchema
}

function markToPM(schema: Schema, mark: InlineMark): Mark {
  switch (mark.kind) {
    case 'simple':
      return schema.marks[SIMPLE_MARKS[mark.type]]!.create()
    case 'link':
      return schema.marks.link!.create({href: mark.href})
    case 'color':
      return schema.marks[COLOR_MARKS[mark.type]]!.create({color: mark.value})
    case 'opaque':
      return schema.marks.hmAnnotation!.create({annotation: mark.annotation})
  }
}

function markFromPM(mark: Mark): InlineMark {
  const name = mark.type.name
  if (name === 'link') return {kind: 'link', href: mark.attrs.href}
  if (MARK_TO_SIMPLE[name]) return {kind: 'simple', type: MARK_TO_SIMPLE[name] as keyof typeof SIMPLE_MARKS}
  if (MARK_TO_COLOR[name])
    return {kind: 'color', type: MARK_TO_COLOR[name] as keyof typeof COLOR_MARKS, value: mark.attrs.color}
  return {kind: 'opaque', annotation: mark.attrs.annotation}
}

/** ProseMirror inline content for neutral runs. */
function runsToPM(schema: Schema, runs: InlineRun[]): PMNode[] {
  return runs.map((run) => {
    const marks = run.marks.reduce<readonly Mark[]>((set, m) => markToPM(schema, m).addToSet(set), [])
    if (run.kind === 'text') return schema.text(run.text, marks)
    // A newline in HM text is a line break inside the block, not a new block.
    if (run.kind === 'break') return schema.nodes.hardBreak!.create(null, null, marks)
    const attrs = {link: run.link, mentionKind: run.mentionKind, annotation: run.annotation ?? null}
    return schema.nodes.hmMention!.create(attrs, null, marks)
  })
}

/** Neutral runs for ProseMirror inline content. */
function runsFromPM(content: PMNode): InlineRun[] {
  const runs: InlineRun[] = []
  content.forEach((child) => {
    const marks = child.marks.map(markFromPM)
    if (child.isText) runs.push({kind: 'text', text: child.text!, marks})
    else if (child.type.name === 'hardBreak') runs.push({kind: 'break', marks})
    else if (child.type.name === 'hmMention') {
      const {link, mentionKind, annotation} = child.attrs
      runs.push({kind: 'mention', link, mentionKind, ...(annotation ? {annotation} : {}), marks})
    }
  })
  return runs
}

/** Build the content node (the first child of a `blockNode`) for an HM block. */
function contentFromHM(schema: Schema, block: HMBlockRecord): PMNode {
  const kind = blockKind(block.type)
  const nodeName = HM_TO_NODE[block.type]!
  const text: string = typeof block.text === 'string' ? block.text : ''
  if (kind === 'atom') {
    return schema.nodes[nodeName]!.create({link: block.link ?? '', text, attributes: block.attributes ?? {}})
  }
  if (kind === 'code' || kind === 'math') {
    const attrs = kind === 'code' ? {language: block.attributes?.language ?? ''} : null
    return schema.nodes[nodeName]!.create(attrs, text ? schema.text(text) : null)
  }
  const inline = runsToPM(schema, inlineFromHM(text, Array.isArray(block.annotations) ? block.annotations : []))
  if (kind === 'text') return schema.nodes[nodeName]!.create(null, inline)
  return schema.nodes.hmUnknown!.create({hmType: block.type}, inline)
}

/** What the editor itself knows about a block: only the fields it models. */
function produceBlock(blockNode: PMNode): ProducedBlock {
  const content = blockNode.firstChild!
  const group = blockNode.childCount > 1 ? blockNode.child(1) : null
  const id: string = blockNode.attrs.id
  const name = content.type.name
  const type: string = name === 'hmUnknown' ? content.attrs.hmType : NODE_TO_HM[name]!
  const kind = blockKind(type)
  let fields: HMBlockRecord
  if (kind === 'atom') {
    fields = {type, id, text: content.attrs.text, link: content.attrs.link, attributes: {...content.attrs.attributes}}
  } else if (kind === 'code') {
    const attributes = content.attrs.language ? {language: content.attrs.language} : {}
    fields = {type, id, text: content.textContent, attributes}
  } else if (kind === 'math') {
    fields = {type, id, text: content.textContent, attributes: {}}
  } else {
    fields = {type, id, ...inlineToHM(runsFromPM(content)), attributes: {}}
  }
  return withChildrenType({fields, ownedAttrs: ownedAttributes(kind)}, group?.attrs.childrenType)
}

function blockNodeFromHM(schema: Schema, node: HMBlockNode): PMNode {
  const block = node.block as unknown as HMBlockRecord
  const children = node.children ?? []
  const content = [contentFromHM(schema, block)]
  if (children.length) {
    const childrenType = block.attributes?.childrenType ?? null
    content.push(
      schema.nodes.blockGroup!.create(
        {childrenType},
        children.map((c) => blockNodeFromHM(schema, c)),
      ),
    )
  }
  const draft = schema.nodes.blockNode!.create({id: block.id}, content)
  return schema.nodes.blockNode!.create({id: block.id, snapshot: snapshotBlock(node, produceBlock(draft))}, content)
}

function blockNodeToHM(blockNode: PMNode): HMBlockNode {
  const group = blockNode.childCount > 1 ? blockNode.child(1) : null
  const children: HMBlockNode[] = []
  group?.forEach((child) => children.push(blockNodeToHM(child)))
  const snapshot: BlockSnapshot | null = blockNode.attrs.snapshot
  return assembleBlockNode(restoreBlock(snapshot, produceBlock(blockNode)), children, snapshot)
}

/** Load an HM tree into a ProseMirror document of the Seed ProseKit schema. */
export function fromHM(blocks: HMBlockNode[], schema: Schema = getSeedSchema()): PMNode {
  const nodes = blocks.map((b) => blockNodeFromHM(schema, b))
  if (!nodes.length) nodes.push(schema.nodes.blockNode!.create({id: createBlockId()}, schema.nodes.paragraph!.create()))
  return schema.nodes.doc!.create(null, nodes)
}

/** Serialize a ProseMirror document of the Seed ProseKit schema to HM blocks. */
export function toHM(doc: PMNode): HMBlockNode[] {
  const out: HMBlockNode[] = []
  doc.forEach((child) => out.push(blockNodeToHM(child)))
  return out
}

/** The ProseKit implementation of the editor adapter contract. */
export const prosekitAdapter: EditorAdapter<PMNode> = {name: 'prosekit', fromHM: (blocks) => fromHM(blocks), toHM}
