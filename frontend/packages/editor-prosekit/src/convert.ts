import type {EditorAdapter} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {Mark, Node as PMNode, Schema} from 'prosekit/pm/model'
import {ATOM_BLOCK_TYPES, defineSeedSchema, HM_TO_NODE, NODE_TO_HM} from './schema'

type AnyBlock = Record<string, any> & {type: string; id: string}
type Annotation = Record<string, any> & {type: string; starts?: number[]; ends?: number[]}

/** Placeholder character an inline `Embed` annotation covers. */
export const INLINE_EMBED_CHAR = '\uFFFC'

const ATOM_NODES = new Set<string>(Object.values(ATOM_BLOCK_TYPES))

/** HM annotation types that map 1:1 to ProseKit marks. */
const SIMPLE_MARKS: Record<string, string> = {
  Bold: 'bold',
  Italic: 'italic',
  Underline: 'underline',
  Strike: 'strike',
  Code: 'code',
}
const VALUE_MARKS: Record<string, string> = {TextColor: 'textColor', BackgroundColor: 'backgroundColor'}
const MARK_TO_HM: Record<string, string> = Object.fromEntries(
  Object.entries({...SIMPLE_MARKS, ...VALUE_MARKS, Link: 'link'}).map(([hm, mark]) => [mark, hm]),
)

/** A fresh random block id, in the same 8-character alphabet BlockNote uses. */
export function createBlockId(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

let cachedSchema: Schema | undefined
/** The ProseMirror schema built from {@link defineSeedSchema}. */
export function getSeedSchema(): Schema {
  cachedSchema ??= defineSeedSchema().schema!
  return cachedSchema
}

const isEmptyObject = (v: unknown) =>
  v === undefined || (typeof v === 'object' && v !== null && Object.keys(v as object).length === 0)

function withoutRanges({starts: _s, ends: _e, ...rest}: Annotation) {
  return rest
}

/**
 * Map an HM annotation to a ProseKit mark, or `null` when the annotation isn't
 * a plain instance of a modelled type. Anything with fields we don't model is
 * kept whole in a generic `hmAnnotation` mark instead, so it is never lost.
 */
function knownMark(schema: Schema, ann: Annotation): Mark | null {
  const extraKeys = Object.keys(ann).filter((k) => !['type', 'starts', 'ends', 'link', 'attributes'].includes(k))
  if (extraKeys.length) return null
  const simple = SIMPLE_MARKS[ann.type]
  if (simple) {
    if (ann.link || !isEmptyObject(ann.attributes)) return null
    return schema.marks[simple]!.create()
  }
  if (ann.type === 'Link') {
    if (!ann.link || !isEmptyObject(ann.attributes)) return null
    return schema.marks.link!.create({href: ann.link})
  }
  const valueMark = VALUE_MARKS[ann.type]
  if (valueMark) {
    const attrs = ann.attributes
    if (ann.link || !attrs || Object.keys(attrs).join() !== 'value' || typeof attrs.value !== 'string') return null
    return schema.marks[valueMark]!.create({color: attrs.value})
  }
  return null
}

function isInlineEmbed(ann: Annotation, chars: string[]) {
  const start = ann.starts?.[0]
  return (
    ann.type === 'Embed' &&
    typeof ann.link === 'string' &&
    ann.starts?.length === 1 &&
    ann.ends?.length === 1 &&
    start !== undefined &&
    ann.ends[0] === start + 1 &&
    chars[start] === INLINE_EMBED_CHAR &&
    Object.keys(ann).every((k) => ['type', 'starts', 'ends', 'link', 'attributes'].includes(k))
  )
}

/** Build ProseMirror inline content from HM text + annotations (code point offsets). */
function inlineFromHM(schema: Schema, text: string, annotations: Annotation[]): PMNode[] {
  const chars = Array.from(text)
  const marksAt: (readonly Mark[])[] = chars.map(() => [])
  const mentionAt = new Map<number, Annotation>()
  for (const ann of annotations) {
    if (isInlineEmbed(ann, chars) && !mentionAt.has(ann.starts![0]!)) {
      mentionAt.set(ann.starts![0]!, ann)
      continue
    }
    const mark = knownMark(schema, ann) ?? schema.marks.hmAnnotation!.create({annotation: withoutRanges(ann)})
    ;(ann.starts ?? []).forEach((start, i) => {
      const end = Math.min(ann.ends?.[i] ?? start, chars.length)
      for (let p = Math.max(0, start); p < end; p++) marksAt[p] = mark.addToSet(marksAt[p]!)
    })
  }
  const nodes: PMNode[] = []
  let run = ''
  let runMarks: readonly Mark[] = []
  const flush = () => {
    if (run) nodes.push(schema.text(run, runMarks))
    run = ''
  }
  chars.forEach((ch, i) => {
    const marks = marksAt[i]!
    const mention = mentionAt.get(i)
    if (mention) {
      flush()
      nodes.push(
        schema.nodes.hmMention!.create(
          {
            link: mention.link,
            mentionKind: mention.attributes?.mentionKind ?? null,
            annotation: withoutRanges(mention),
          },
          null,
          marks,
        ),
      )
      return
    }
    if (run && !sameMarks(marks, runMarks)) flush()
    if (!run) runMarks = marks
    run += ch
  })
  flush()
  return nodes
}

function sameMarks(a: readonly Mark[], b: readonly Mark[]) {
  return a.length === b.length && a.every((m, i) => m.eq(b[i]!))
}

function markKey(mark: Mark): string {
  if (mark.type.name === 'hmAnnotation') return 'A' + JSON.stringify(mark.attrs.annotation)
  return mark.type.name + JSON.stringify(mark.attrs)
}

/** Serialize ProseMirror inline content to HM text + annotations. */
function inlineToHM(content: PMNode): {text: string; annotations: Annotation[]} {
  let text = ''
  let pos = 0
  const byKey = new Map<string, {mark: Mark; starts: number[]; ends: number[]}>()
  const annotations: Array<Annotation | string> = []
  const addRange = (mark: Mark, start: number, end: number) => {
    const key = markKey(mark)
    let entry = byKey.get(key)
    if (!entry) {
      entry = {mark, starts: [], ends: []}
      byKey.set(key, entry)
      annotations.push(key)
    }
    const last = entry.ends.length - 1
    if (last >= 0 && entry.ends[last] === start) entry.ends[last] = end
    else {
      entry.starts.push(start)
      entry.ends.push(end)
    }
  }
  content.forEach((child) => {
    const len = child.isText ? Array.from(child.text!).length : 1
    if (child.isText) text += child.text
    else if (child.type.name === 'hmMention') {
      text += INLINE_EMBED_CHAR
      const base: Annotation = child.attrs.annotation ?? {type: 'Embed', link: child.attrs.link}
      annotations.push({...base, link: child.attrs.link, starts: [pos], ends: [pos + 1]})
    }
    for (const mark of child.marks) addRange(mark, pos, pos + len)
    pos += len
  })
  return {
    text,
    annotations: annotations.map((a) => {
      if (typeof a !== 'string') return a
      const {mark, starts, ends} = byKey.get(a)!
      if (mark.type.name === 'hmAnnotation') return {...mark.attrs.annotation, starts, ends}
      const type = MARK_TO_HM[mark.type.name]!
      if (type === 'Link') return {type, starts, ends, link: mark.attrs.href}
      if (VALUE_MARKS[type]) return {type, starts, ends, attributes: {value: mark.attrs.color}}
      return {type, starts, ends}
    }),
  }
}

/** Build the content node (the first child of a `blockNode`) for an HM block. */
function contentFromHM(schema: Schema, block: AnyBlock): PMNode {
  const nodeName = HM_TO_NODE[block.type]
  const text: string = typeof block.text === 'string' ? block.text : ''
  if (nodeName && ATOM_NODES.has(nodeName)) {
    return schema.nodes[nodeName]!.create({link: block.link ?? '', text, attributes: block.attributes ?? {}})
  }
  if (nodeName === 'codeBlock' || nodeName === 'hmMath') {
    const attrs = nodeName === 'codeBlock' ? {language: block.attributes?.language ?? ''} : null
    return schema.nodes[nodeName]!.create(attrs, text ? schema.text(text) : null)
  }
  const inline = inlineFromHM(schema, text, Array.isArray(block.annotations) ? block.annotations : [])
  if (nodeName === 'paragraph' || nodeName === 'heading') return schema.nodes[nodeName]!.create(null, inline)
  return schema.nodes.hmUnknown!.create({hmType: block.type}, inline)
}

type Produced = {fields: AnyBlock; ownedAttrs: string[] | 'all'}

/** What the editor itself knows about a block: only the fields it models. */
function produceBlock(blockNode: PMNode): Produced {
  const content = blockNode.firstChild!
  const group = blockNode.childCount > 1 ? blockNode.child(1) : null
  const id: string = blockNode.attrs.id
  const name = content.type.name
  const type: string = name === 'hmUnknown' ? content.attrs.hmType : NODE_TO_HM[name]!
  let fields: AnyBlock
  let ownedAttrs: string[] | 'all' = []
  if (ATOM_NODES.has(name)) {
    fields = {type, id, text: content.attrs.text, link: content.attrs.link, attributes: {...content.attrs.attributes}}
    ownedAttrs = 'all'
  } else if (name === 'codeBlock') {
    fields = {
      type,
      id,
      text: content.textContent,
      attributes: content.attrs.language ? {language: content.attrs.language} : {},
    }
    ownedAttrs = ['language']
  } else if (name === 'hmMath') {
    fields = {type, id, text: content.textContent, attributes: {}}
  } else {
    fields = {type, id, ...inlineToHM(content), attributes: {}}
  }
  if (group && group.attrs.childrenType != null) {
    fields.attributes.childrenType = group.attrs.childrenType
    if (ownedAttrs !== 'all') ownedAttrs = [...ownedAttrs, 'childrenType']
  }
  return {fields, ownedAttrs}
}

function blockNodeFromHM(schema: Schema, node: HMBlockNode): PMNode {
  const block = node.block as AnyBlock
  const children = node.children ?? []
  const content = [contentFromHM(schema, block)]
  if (children.length) {
    const childrenType = (block.attributes as any)?.childrenType ?? null
    content.push(
      schema.nodes.blockGroup!.create(
        {childrenType},
        children.map((c) => blockNodeFromHM(schema, c)),
      ),
    )
  }
  const draft = schema.nodes.blockNode!.create({id: block.id}, content)
  return schema.nodes.blockNode!.create(
    {
      id: block.id,
      original: block,
      baseline: JSON.stringify(produceBlock(draft).fields),
      nodeKeys: Object.keys(node),
    },
    content,
  )
}

/**
 * Turn a `blockNode` back into an HM block. Untouched blocks return the
 * original object itself (byte-for-byte). Edited blocks layer the modelled
 * fields over the original, keeping every key and attribute the editor
 * doesn't own.
 */
function blockToHM(blockNode: PMNode): AnyBlock {
  const {fields, ownedAttrs} = produceBlock(blockNode)
  const original: AnyBlock | null = blockNode.attrs.original
  if (original && blockNode.attrs.baseline === JSON.stringify(fields)) return original
  if (!original) return fields
  const keptAttrs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(original.attributes ?? {})) {
    const owned =
      ownedAttrs === 'all' ? key !== 'childrenType' || 'childrenType' in fields.attributes : ownedAttrs.includes(key)
    if (!owned) keptAttrs[key] = value
  }
  return {...original, ...fields, attributes: {...keptAttrs, ...fields.attributes}}
}

function blockNodeToHM(blockNode: PMNode): HMBlockNode {
  const group = blockNode.childCount > 1 ? blockNode.child(1) : null
  const children: HMBlockNode[] = []
  group?.forEach((child) => children.push(blockNodeToHM(child)))
  const block = blockToHM(blockNode) as HMBlockNode['block']
  // Keep the loaded node's key order and its empty `children` array, if any.
  const keys: string[] = blockNode.attrs.nodeKeys ?? ['block']
  if (children.length && !keys.includes('children')) keys.push('children')
  const out: Record<string, unknown> = {}
  for (const key of keys) out[key] = key === 'block' ? block : children
  return out as HMBlockNode
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
