import type {EditorAdapter} from '@seed-hypermedia/client/editor-adapter'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import type {SerializedEditorState} from 'lexical'

type AnyBlock = Record<string, any> & {type: string; id: string}
type Annotation = Record<string, any> & {type: string; starts?: number[]; ends?: number[]}
type JSONNode = Record<string, any> & {type: string}

/** The editor document the Lexical adapter works with: Lexical's own serialized editor state. */
export type SeedLexicalDoc = SerializedEditorState

/** Placeholder character an inline `Embed` annotation covers. */
export const INLINE_EMBED_CHAR = '\uFFFC'

/** HM block types rendered as a {@link SeedAtomNode} decorator. */
export const ATOM_BLOCK_TYPES = ['Embed', 'Image', 'Video', 'File', 'Button', 'WebEmbed', 'Query', 'Nostr']

/** Lexical text format bits (see `TEXT_TYPE_TO_FORMAT` in lexical) for the HM annotations with a 1:1 mapping. */
export const FORMAT_BITS: Record<string, number> = {Bold: 1, Italic: 2, Strike: 4, Underline: 8, Code: 16}
const COLOR_CSS: Record<string, string> = {TextColor: 'color', BackgroundColor: 'background-color'}

/** A fresh random block id, in the same 8-character alphabet BlockNote uses. */
export function createBlockId(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

const isEmptyObject = (v: unknown) =>
  v === undefined || (typeof v === 'object' && v !== null && Object.keys(v as object).length === 0)

function withoutRanges({starts: _s, ends: _e, ...rest}: Annotation) {
  return rest
}

const element = (type: string, children: JSONNode[], state?: Record<string, unknown>): JSONNode => ({
  children,
  direction: null,
  format: '',
  indent: 0,
  type,
  version: 1,
  ...(state ? {$: state} : {}),
})

/** Per-character formatting while building runs. */
type CharStyle = {format: number; link: string | null; colors: Record<string, string>; extras: Annotation[]}

/**
 * Classify an annotation: a format bit, a link, a colour, or `null` when it has
 * fields we don't model (kept whole in the text's `hmExtra` state instead).
 */
function knownAnnotation(ann: Annotation): {bit?: number; link?: string; color?: [string, string]} | null {
  if (Object.keys(ann).some((k) => !['type', 'starts', 'ends', 'link', 'attributes'].includes(k))) return null
  const bit = FORMAT_BITS[ann.type]
  if (bit) return ann.link || !isEmptyObject(ann.attributes) ? null : {bit}
  if (ann.type === 'Link') return ann.link && isEmptyObject(ann.attributes) ? {link: ann.link} : null
  if (COLOR_CSS[ann.type]) {
    const attrs = ann.attributes
    if (ann.link || !attrs || Object.keys(attrs).join() !== 'value' || typeof attrs.value !== 'string') return null
    if (/[;:]/.test(attrs.value)) return null
    return {color: [ann.type, attrs.value]}
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

/** CSS `style` string Lexical text nodes use for HM colours. */
function styleOf(colors: Record<string, string>) {
  return Object.entries(colors)
    .map(([type, value]) => `${COLOR_CSS[type]}: ${value};`)
    .join(' ')
}

function colorsOf(style: string | undefined): [string, string][] {
  const out: [string, string][] = []
  for (const [type, css] of Object.entries(COLOR_CSS)) {
    const m = (style ?? '').match(new RegExp(`(?:^|;\\s*)${css}:\\s*([^;]+);?`))
    if (m) out.push([type, m[1]!.trim()])
  }
  return out
}

const textNode = (text: string, s: CharStyle): JSONNode => ({
  detail: 0,
  format: s.format,
  mode: 'normal',
  style: styleOf(s.colors),
  text,
  type: 'text',
  version: 1,
  ...(s.extras.length ? {$: {hmExtra: s.extras}} : {}),
})

/** Build Lexical inline JSON from HM text + annotations (code point offsets). */
function inlineFromHM(text: string, annotations: Annotation[]): JSONNode[] {
  const chars = Array.from(text)
  const styles: CharStyle[] = chars.map(() => ({format: 0, link: null, colors: {}, extras: []}))
  const mentionAt = new Map<number, Annotation>()
  for (const ann of annotations) {
    if (isInlineEmbed(ann, chars) && !mentionAt.has(ann.starts![0]!)) {
      mentionAt.set(ann.starts![0]!, ann)
      continue
    }
    const known = knownAnnotation(ann)
    ;(ann.starts ?? []).forEach((start, i) => {
      const end = Math.min(ann.ends?.[i] ?? start, chars.length)
      for (let p = Math.max(0, start); p < end; p++) {
        const s = styles[p]!
        if (known?.bit) s.format |= known.bit
        else if (known?.link && s.link === null) s.link = known.link
        else if (known?.color && !(known.color[0] in s.colors)) s.colors[known.color[0]] = known.color[1]
        else if (!s.extras.includes(ann)) s.extras.push(ann)
      }
    })
  }
  // Store extras without ranges, sharing one object per annotation so equal runs merge.
  const bodies = new Map<Annotation, Annotation>()
  for (const s of styles)
    s.extras = s.extras.map((a) => bodies.get(a) ?? bodies.set(a, withoutRanges(a) as Annotation).get(a)!)

  const out: JSONNode[] = []
  let linkNode: JSONNode | null = null
  let run = ''
  let runStyle: CharStyle | null = null
  const target = () => (linkNode ? linkNode.children : out)
  const flush = () => {
    if (run) target().push(textNode(run, runStyle!))
    run = ''
  }
  const key = (s: CharStyle) => JSON.stringify([s.format, s.colors, s.extras])
  chars.forEach((ch, i) => {
    const s = styles[i]!
    if (s.link !== (linkNode?.url ?? null)) {
      flush()
      linkNode = s.link === null ? null : {...element('link', []), rel: null, target: null, title: null, url: s.link}
      if (linkNode) out.push(linkNode)
    }
    const mention = mentionAt.get(i)
    if (mention) {
      flush()
      const state: Record<string, unknown> = {link: mention.link, annotation: withoutRanges(mention)}
      if (s.format) state.format = s.format
      if (Object.keys(s.colors).length) state.style = styleOf(s.colors)
      if (s.extras.length) state.hmExtra = s.extras
      target().push({type: 'seed-mention', version: 1, $: state})
      return
    }
    if (ch === '\n') {
      flush()
      target().push({type: 'linebreak', version: 1})
      return
    }
    if (run && key(s) !== key(runStyle!)) flush()
    if (!run) runStyle = s
    run += ch
  })
  flush()
  return out
}

/** Serialize Lexical inline JSON to HM text + annotations. */
function inlineToHM(children: JSONNode[]): {text: string; annotations: Annotation[]} {
  let text = ''
  let pos = 0
  const byKey = new Map<string, {ann: Annotation; starts: number[]; ends: number[]}>()
  const order: Array<Annotation | string> = []
  const addRange = (key: string, ann: Annotation, start: number, end: number) => {
    let entry = byKey.get(key)
    if (!entry) {
      entry = {ann, starts: [], ends: []}
      byKey.set(key, entry)
      order.push(key)
    }
    const last = entry.ends.length - 1
    if (last >= 0 && entry.ends[last] === start) entry.ends[last] = end
    else {
      entry.starts.push(start)
      entry.ends.push(end)
    }
  }
  const addStyled = (node: JSONNode, link: string | null, len: number) => {
    const format: number = node.format ?? node.$?.format ?? 0
    for (const [type, bit] of Object.entries(FORMAT_BITS)) if (format & bit) addRange(type, {type}, pos, pos + len)
    if (link !== null) addRange('L' + link, {type: 'Link', link}, pos, pos + len)
    for (const [type, value] of colorsOf(node.style ?? node.$?.style))
      addRange(type + value, {type, attributes: {value}}, pos, pos + len)
    for (const extra of (node.$?.hmExtra ?? []) as Annotation[])
      addRange('A' + JSON.stringify(extra), extra, pos, pos + len)
  }
  const walk = (nodes: JSONNode[], link: string | null) => {
    for (const node of nodes) {
      if (node.type === 'link' || node.type === 'autolink') {
        walk(node.children ?? [], node.url ?? null)
        continue
      }
      if (node.type === 'seed-mention') {
        const linkTo: string = node.$?.link ?? ''
        const base: Annotation = node.$?.annotation ?? {type: 'Embed', link: linkTo}
        text += INLINE_EMBED_CHAR
        order.push({...base, link: linkTo, starts: [pos], ends: [pos + 1]})
        addStyled(node, link, 1)
        pos += 1
        continue
      }
      const t =
        node.type === 'linebreak' ? '\n' : node.type === 'tab' ? '\t' : typeof node.text === 'string' ? node.text : ''
      if (!t) continue
      const len = Array.from(t).length
      text += t
      addStyled(node, link, len)
      pos += len
    }
  }
  walk(children, null)
  const annotations = order.map((a) => {
    if (typeof a !== 'string') return a
    const {ann, starts, ends} = byKey.get(a)!
    const {type, ...rest} = ann
    return {type, starts, ends, ...rest}
  })
  return {text, annotations}
}

/** Plain text of a code block's children (text, line breaks, tabs). */
function plainText(children: JSONNode[] = []): string {
  return children
    .map((c) => (c.type === 'linebreak' ? '\n' : c.type === 'tab' ? '\t' : typeof c.text === 'string' ? c.text : ''))
    .join('')
}

function plainChildren(text: string): JSONNode[] {
  const out: JSONNode[] = []
  text.split('\n').forEach((line, i) => {
    if (i) out.push({type: 'linebreak', version: 1})
    if (line) out.push(textNode(line, {format: 0, link: null, colors: {}, extras: []}))
  })
  return out
}

/** Build the content node (first child of a `seed-block`) for an HM block. */
function contentFromHM(block: AnyBlock): JSONNode {
  const text: string = typeof block.text === 'string' ? block.text : ''
  if (ATOM_BLOCK_TYPES.includes(block.type)) {
    return {
      type: 'seed-atom',
      version: 1,
      $: {hmType: block.type, link: block.link ?? '', text, attributes: block.attributes ?? {}},
    }
  }
  if (block.type === 'Math') return {type: 'seed-math', version: 1, $: {text}}
  if (block.type === 'Code')
    return {...element('code', plainChildren(text)), language: block.attributes?.language || null}
  const inline = inlineFromHM(text, Array.isArray(block.annotations) ? block.annotations : [])
  return {...element('seed-text', inline), textFormat: 0, textStyle: '', $: {hmType: block.type}}
}

type Produced = {fields: AnyBlock; ownedAttrs: string[] | 'all'}

/** What the editor itself knows about a block: only the fields it models. */
function produceBlock(blockNode: JSONNode): Produced {
  const [content, group] = blockNode.children as JSONNode[]
  const id: string = blockNode.$?.hmId ?? ''
  let fields: AnyBlock
  let ownedAttrs: string[] | 'all' = []
  if (content?.type === 'seed-atom') {
    const s = content.$ ?? {}
    fields = {type: s.hmType, id, text: s.text ?? '', link: s.link ?? '', attributes: {...s.attributes}}
    ownedAttrs = 'all'
  } else if (content?.type === 'code') {
    const text = plainText(content.children)
    fields = {type: 'Code', id, text, attributes: content.language ? {language: content.language} : {}}
    ownedAttrs = ['language']
  } else if (content?.type === 'seed-math') {
    fields = {type: 'Math', id, text: content.$?.text ?? '', attributes: {}}
  } else {
    fields = {type: content?.$?.hmType ?? 'Paragraph', id, ...inlineToHM(content?.children ?? []), attributes: {}}
  }
  const childrenType = group ? group.$?.childrenType : blockNode.$?.childrenType
  if (childrenType != null) {
    fields.attributes.childrenType = childrenType
    if (ownedAttrs !== 'all') ownedAttrs = [...ownedAttrs, 'childrenType']
  }
  return {fields, ownedAttrs}
}

function blockNodeFromHM(node: HMBlockNode): JSONNode {
  const block = node.block as AnyBlock
  const children = node.children ?? []
  const content = [contentFromHM(block)]
  if (children.length) {
    const childrenType = (block.attributes as any)?.childrenType ?? null
    content.push(
      element('seed-group', children.map(blockNodeFromHM), childrenType == null ? undefined : {childrenType}),
    )
  }
  const draft = element('seed-block', content, {hmId: block.id})
  return element('seed-block', content, {
    hmId: block.id,
    hmOriginal: block,
    hmBaseline: JSON.stringify(produceBlock(draft).fields),
    hmNodeKeys: Object.keys(node),
  })
}

/**
 * Turn a `seed-block` back into an HM block. Untouched blocks return the
 * original object itself (byte-for-byte). Edited blocks layer the modelled
 * fields over the original, keeping every key and attribute the editor
 * doesn't own.
 */
function blockToHM(blockNode: JSONNode): AnyBlock {
  const {fields, ownedAttrs} = produceBlock(blockNode)
  const original: AnyBlock | null = blockNode.$?.hmOriginal ?? null
  if (original && blockNode.$?.hmBaseline === JSON.stringify(fields)) return original
  if (!original) return fields
  const keptAttrs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(original.attributes ?? {})) {
    const owned =
      ownedAttrs === 'all' ? key !== 'childrenType' || 'childrenType' in fields.attributes : ownedAttrs.includes(key)
    if (!owned) keptAttrs[key] = value
  }
  return {...original, ...fields, attributes: {...keptAttrs, ...fields.attributes}}
}

function blockNodeToHM(blockNode: JSONNode): HMBlockNode {
  const group = (blockNode.children as JSONNode[])[1]
  const children = ((group?.children ?? []) as JSONNode[]).filter((c) => c.type === 'seed-block').map(blockNodeToHM)
  const block = blockToHM(blockNode) as HMBlockNode['block']
  // Keep the loaded node's key order and its empty `children` array, if any.
  const keys: string[] = [...(blockNode.$?.hmNodeKeys ?? ['block'])]
  if (children.length && !keys.includes('children')) keys.push('children')
  const out: Record<string, unknown> = {}
  for (const key of keys) out[key] = key === 'block' ? block : children
  return out as HMBlockNode
}

/** Load an HM tree into a serialized Lexical editor state of the Seed nodes. */
export function fromHM(blocks: HMBlockNode[]): SeedLexicalDoc {
  const nodes = blocks.map(blockNodeFromHM)
  if (!nodes.length) {
    nodes.push(element('seed-block', [contentFromHM({type: 'Paragraph', id: '', text: ''})], {hmId: createBlockId()}))
  }
  return {root: element('root', nodes) as any}
}

/** Serialize a Lexical editor state (`editorState.toJSON()`) of the Seed nodes to HM blocks. */
export function toHM(doc: SeedLexicalDoc): HMBlockNode[] {
  return (doc.root.children as JSONNode[]).filter((c) => c.type === 'seed-block').map(blockNodeToHM)
}

/** The Lexical implementation of the editor adapter contract. */
export const lexicalAdapter: EditorAdapter<SeedLexicalDoc> = {name: 'lexical', fromHM, toHM}
