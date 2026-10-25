import type {EditorAdapter} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {
  ATOM_BLOCK_TYPES,
  DOCUMENT_ID,
  fromNodeId,
  generateNodeId,
  INLINE_EMBED_CHAR,
  INLINE_STYLES,
  toNodeId,
  type InlineStyle,
} from './schema'

type AnyBlock = Record<string, any> & {type: string; id: string}
type Annotation = Record<string, any> & {type: string; starts?: number[]; ends?: number[]}

/** A Svedit range of a text property (grapheme offsets). */
export type SveditRange = {start_offset: number; end_offset: number; node_id: string}

/** The value of a Svedit `text` property. */
export type SveditText = {content: string; marks: SveditRange[]; annotations: SveditRange[]}

/** A Svedit document: a flat, id-keyed node graph rooted at `document_id`. */
export type SveditDocument = {document_id: string; nodes: Record<string, any>}

/** Formatting of one grapheme: what an `hm_inline` mark carries. */
export type InlineFormat = {styles: InlineStyle[]; link: string; embed: string; embed_json: string}

const EMPTY_FORMAT: InlineFormat = {styles: [], link: '', embed: '', embed_json: ''}
const segmenter = new Intl.Segmenter()

/**
 * Svedit counts offsets in grapheme clusters; HM counts code points. Returns
 * the code point offset at which each grapheme starts, plus the total length
 * as the last entry.
 */
export function graphemeCodePointStarts(text: string): number[] {
  const starts: number[] = []
  let cp = 0
  for (const {segment} of segmenter.segment(text)) {
    starts.push(cp)
    cp += Array.from(segment).length
  }
  starts.push(cp)
  return starts
}

/** Grapheme index for an HM code point offset (rounding into the cluster down or up). */
function toGrapheme(starts: number[], cp: number, roundUp: boolean): number {
  let g = 0
  while (g < starts.length - 1 && starts[g + 1]! <= cp) g++
  return roundUp && starts[g]! < cp && g < starts.length - 1 ? g + 1 : g
}

const isEmptyObject = (v: unknown) =>
  v === undefined || (typeof v === 'object' && v !== null && Object.keys(v as object).length === 0)

function withoutRanges({starts: _s, ends: _e, ...rest}: Annotation) {
  return rest
}

/** Stable key for a format, used to merge adjacent runs. */
export function formatKey(f: InlineFormat): string {
  return JSON.stringify([[...f.styles].sort(), f.link, f.embed, f.embed_json])
}

/** True when the format carries nothing (plain text, no mark needed). */
export function isPlainFormat(f: InlineFormat): boolean {
  return !f.styles.length && !f.link && !f.embed
}

/**
 * Turn per-grapheme formats into disjoint `hm_inline` marks, creating the mark
 * nodes through `create`. Inline embeds always get their own one-grapheme mark.
 */
export function marksFromFormats(
  formats: InlineFormat[],
  create: (node: Record<string, unknown>) => string,
): SveditRange[] {
  const marks: SveditRange[] = []
  let i = 0
  while (i < formats.length) {
    const f = formats[i]!
    let end = i + 1
    if (!f.embed)
      while (end < formats.length && !formats[end]!.embed && formatKey(formats[end]!) === formatKey(f)) end++
    if (!isPlainFormat(f)) {
      const node_id = create({type: 'hm_inline', ...f, styles: [...f.styles]})
      marks.push({start_offset: i, end_offset: end, node_id})
    }
    i = end
  }
  return marks
}

/** Per-grapheme formats of a Svedit text value. */
export function formatsOf(nodes: Record<string, any>, text: SveditText): InlineFormat[] {
  const formats: InlineFormat[] = Array.from(segmenter.segment(text.content), () => EMPTY_FORMAT)
  for (const mark of text.marks) {
    const node = nodes[mark.node_id]
    if (node?.type !== 'hm_inline') continue
    const f: InlineFormat = {
      styles: [...(node.styles ?? [])],
      link: node.link ?? '',
      embed: node.embed ?? '',
      embed_json: node.embed_json ?? '',
    }
    for (let g = mark.start_offset; g < mark.end_offset && g < formats.length; g++) formats[g] = f
  }
  return formats
}

/**
 * Build a Svedit text value from HM text + annotations. Modelled annotations
 * become `hm_inline` marks; anything else (unknown types, extra fields,
 * overlapping links) becomes a data-only `hm_annotation` keeping the whole
 * annotation as JSON, so it is never lost.
 */
function textFromHM(nodes: Record<string, any>, text: string, annotations: Annotation[]): SveditText {
  const starts = graphemeCodePointStarts(text)
  const graphemes = Array.from(segmenter.segment(text), (s) => s.segment)
  const formats: InlineFormat[] = graphemes.map(() => ({...EMPTY_FORMAT, styles: []}))
  const unknown: SveditRange[] = []
  const create = (node: Record<string, unknown>) => {
    const id = generateNodeId()
    nodes[id] = {id, ...node}
    return id
  }
  const ranges = (ann: Annotation) =>
    (ann.starts ?? []).map(
      (start, i) => [toGrapheme(starts, start, false), toGrapheme(starts, ann.ends?.[i] ?? start, true)] as const,
    )
  for (const ann of annotations) {
    const keys = Object.keys(ann)
    const onlyKeys = (allowed: string[]) => keys.every((k) => allowed.includes(k))
    const rs = ranges(ann)
    const covered = rs.flatMap(([s, e]) => formats.slice(s, e))
    const valid = Array.isArray(ann.starts) && Array.isArray(ann.ends) && ann.starts.length === ann.ends.length
    if (
      valid &&
      (INLINE_STYLES as readonly string[]).includes(ann.type) &&
      onlyKeys(['type', 'starts', 'ends', 'attributes']) &&
      isEmptyObject(ann.attributes)
    ) {
      for (const f of covered) if (!f.styles.includes(ann.type as InlineStyle)) f.styles.push(ann.type as InlineStyle)
      continue
    }
    if (
      valid &&
      ann.type === 'Link' &&
      typeof ann.link === 'string' &&
      ann.link &&
      onlyKeys(['type', 'starts', 'ends', 'link', 'attributes']) &&
      isEmptyObject(ann.attributes) &&
      !covered.some((f) => f.link || f.embed)
    ) {
      for (const f of covered) f.link = ann.link
      continue
    }
    const [only] = rs
    if (
      valid &&
      ann.type === 'Embed' &&
      typeof ann.link === 'string' &&
      rs.length === 1 &&
      only![1] === only![0] + 1 &&
      graphemes[only![0]] === INLINE_EMBED_CHAR &&
      ann.ends![0]! - ann.starts![0]! === 1 &&
      onlyKeys(['type', 'starts', 'ends', 'link', 'attributes']) &&
      !formats[only![0]]!.embed
    ) {
      const f = formats[only![0]]!
      f.embed = ann.link
      f.embed_json = JSON.stringify(withoutRanges(ann))
      continue
    }
    const json = JSON.stringify(withoutRanges(ann))
    for (const [s, e] of rs)
      unknown.push({start_offset: s, end_offset: e, node_id: create({type: 'hm_annotation', json})})
    if (!rs.length) unknown.push({start_offset: 0, end_offset: 0, node_id: create({type: 'hm_annotation', json})})
  }
  return {content: text, marks: marksFromFormats(formats, create), annotations: unknown}
}

/** Serialize a Svedit text value to HM text + annotations (code point offsets). */
export function textToHM(nodes: Record<string, any>, text: SveditText): {text: string; annotations: Annotation[]} {
  const starts = graphemeCodePointStarts(text.content)
  const out: Annotation[] = []
  const byKey = new Map<string, Annotation>()
  const addRange = (key: string, make: () => Annotation, start: number, end: number) => {
    let ann = byKey.get(key)
    if (!ann) {
      ann = make()
      byKey.set(key, ann)
      out.push(ann)
    }
    const last = ann.ends!.length - 1
    if (last >= 0 && ann.ends![last] === start) ann.ends![last] = end
    else {
      ann.starts!.push(start)
      ann.ends!.push(end)
    }
  }
  const marks = [...text.marks].sort((a, b) => a.start_offset - b.start_offset)
  for (const mark of marks) {
    const node = nodes[mark.node_id]
    if (node?.type !== 'hm_inline') continue
    const start = starts[mark.start_offset] ?? 0
    const end = starts[mark.end_offset] ?? start
    for (const style of INLINE_STYLES) {
      if ((node.styles ?? []).includes(style)) addRange(style, () => ({type: style, starts: [], ends: []}), start, end)
    }
    if (node.link)
      addRange('Link' + node.link, () => ({type: 'Link', starts: [], ends: [], link: node.link}), start, end)
    if (node.embed) {
      const base: Annotation = node.embed_json ? JSON.parse(node.embed_json) : {type: 'Embed'}
      out.push({...base, link: node.embed, starts: [start], ends: [start + 1]})
    }
  }
  const sortedAnnotations = [...text.annotations].sort((a, b) => a.start_offset - b.start_offset)
  for (const range of sortedAnnotations) {
    const node = nodes[range.node_id]
    if (node?.type !== 'hm_annotation') continue
    const start = starts[range.start_offset] ?? 0
    const end = starts[range.end_offset] ?? start
    const parsed = JSON.parse(node.json)
    if (range.end_offset === range.start_offset && range.start_offset === 0 && !byKey.has('A' + node.json)) {
      // An annotation that had no ranges at all: keep it as it was.
      out.push(parsed)
      continue
    }
    addRange('A' + node.json, () => ({...parsed, starts: [], ends: []}), start, end)
  }
  return {text: text.content, annotations: out}
}

/** What the editor itself knows about a block: only the fields it models. */
function produceBlock(nodes: Record<string, any>, node: any): AnyBlock {
  const {text, annotations} = textToHM(nodes, node.content)
  const attributes = JSON.parse(node.attributes || '{}')
  if (node.children_type) attributes.childrenType = node.children_type
  const fields: AnyBlock = {type: node.block_type, id: fromNodeId(node.id), text, annotations, attributes}
  if (node.link || ATOM_BLOCK_TYPES.includes(node.block_type)) fields.link = node.link
  return fields
}

/**
 * Turn an `hm_block` node back into an HM block. Untouched blocks return the
 * original exactly as loaded (byte-for-byte). Edited blocks layer the modelled
 * fields over the original, keeping every top-level key the editor doesn't own.
 * Attributes are always kept: the node stores all of them.
 */
function blockToHM(nodes: Record<string, any>, node: any): AnyBlock {
  const fields = produceBlock(nodes, node)
  if (!node.hm_original) return fields
  if (node.hm_baseline === JSON.stringify(fields)) return JSON.parse(node.hm_original)
  const original: AnyBlock = JSON.parse(node.hm_original)
  const merged: AnyBlock = {...original, ...fields}
  if (!('annotations' in original) && !fields.annotations.length) delete merged.annotations
  if (!('text' in original) && !fields.text) delete merged.text
  return merged
}

function nodeToHM(nodes: Record<string, any>, nodeId: string): HMBlockNode {
  const node = nodes[nodeId]
  const children = (node.children?.nodes ?? []).map((id: string) => nodeToHM(nodes, id))
  const block = blockToHM(nodes, node) as HMBlockNode['block']
  // Keep the loaded node's key order and its empty `children` array, if any.
  const keys: string[] = node.hm_node_keys?.length ? [...node.hm_node_keys] : ['block']
  if (children.length && !keys.includes('children')) keys.push('children')
  const out: Record<string, unknown> = {}
  for (const key of keys) out[key] = key === 'block' ? block : children
  return out as HMBlockNode
}

/** An empty `node_array` value. */
export function emptyNodeArray(nodes: string[] = []) {
  return {nodes, marks: [], annotations: []}
}

/** A new, never-published `hm_block` node (no original to preserve). */
export function newBlockNode(id: string, blockType = 'Paragraph', content?: SveditText) {
  return {
    id,
    type: 'hm_block',
    block_type: blockType,
    content: content ?? {content: '', marks: [], annotations: []},
    children: emptyNodeArray(),
    children_type: '',
    link: '',
    attributes: '{}',
    hm_original: '',
    hm_baseline: '',
    hm_node_keys: [],
  }
}

function blockFromHM(nodes: Record<string, any>, hmNode: HMBlockNode): string {
  const block = hmNode.block as AnyBlock
  const id = toNodeId(block.id)
  const childIds = (hmNode.children ?? []).map((child) => blockFromHM(nodes, child))
  const {childrenType, ...otherAttributes} = (block.attributes ?? {}) as Record<string, unknown>
  const typedChildren = typeof childrenType === 'string'
  const node = {
    ...newBlockNode(id, block.type),
    content: textFromHM(
      nodes,
      typeof block.text === 'string' ? block.text : '',
      Array.isArray(block.annotations) ? block.annotations : [],
    ),
    children: emptyNodeArray(childIds),
    children_type: typedChildren ? childrenType : '',
    link: typeof block.link === 'string' ? block.link : '',
    attributes: JSON.stringify(typedChildren || childrenType === undefined ? otherAttributes : block.attributes),
    hm_original: JSON.stringify(block),
    hm_node_keys: Object.keys(hmNode),
  }
  nodes[id] = node
  node.hm_baseline = JSON.stringify(produceBlock(nodes, node))
  return id
}

/** Load an HM tree into a Svedit document of {@link seedSchema}. */
export function fromHM(blocks: HMBlockNode[]): SveditDocument {
  const nodes: Record<string, any> = {}
  const body = blocks.map((b) => blockFromHM(nodes, b))
  if (!body.length) {
    const id = generateNodeId()
    nodes[id] = newBlockNode(id)
    body.push(id)
  }
  nodes[DOCUMENT_ID] = {id: DOCUMENT_ID, type: 'hm_document', body: emptyNodeArray(body)}
  return {document_id: DOCUMENT_ID, nodes}
}

/** Serialize a Svedit document of {@link seedSchema} to HM blocks. */
export function toHM(doc: SveditDocument): HMBlockNode[] {
  return doc.nodes[doc.document_id].body.nodes.map((id: string) => nodeToHM(doc.nodes, id))
}

/** The Svedit implementation of the editor adapter contract. */
export const sveditAdapter: EditorAdapter<SveditDocument> = {name: 'svedit', fromHM, toHM}
