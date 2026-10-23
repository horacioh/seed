/**
 * The Seed text format: HM blocks written as a Markdown-like document that
 * CodeMirror edits as plain text. Block ids and loaded payloads never appear
 * in the text; `state.ts` keeps them next to it.
 *
 * - One block per line (multi-line content continues on indented lines).
 * - Nesting is two spaces per level. Children of an `Unordered`, `Ordered` or
 *   `Blockquote` parent start with `- `, `1. ` or `> `.
 * - `# ` heading, fenced ```` ``` ```` code, `$$` math, `![[hm://…|View]]` embed,
 *   `![caption](link)` image and `::Type[text](link)` for every other block type.
 * - Inline: `**bold**`, `*italic*`, `<u>underline</u>`, `~~strike~~`, `` `code` ``,
 *   `[text](url)`, `[[hm://…]]` mention, `<x:N>…</x:N>` for annotations without
 *   syntax (N indexes the block's loaded annotations). `\` escapes; a trailing
 *   `\` continues the block on the next line.
 */

/** Any HM block, including fields and types this editor doesn't know. */
export type AnyBlock = Record<string, any> & {type: string; id: string}
/** Any HM annotation. Offsets are in code points. */
export type Annotation = Record<string, any> & {type: string; starts?: number[]; ends?: number[]}

/** Placeholder character an inline `Embed` annotation covers. */
export const INLINE_EMBED_CHAR = '\uFFFC'

/** HM children types written as a line marker. */
export type ListMarker = 'Unordered' | 'Ordered' | 'Blockquote'
const LIST_TYPES: string[] = ['Unordered', 'Ordered', 'Blockquote']

const TOGGLES: Record<string, string> = {Bold: '**', Italic: '*', Strike: '~~', Code: '`'}
const ESCAPED = new Set(['\\', '*', '~', '`', '[', ']', '<'])

const escapeChar = (ch: string) => (ch === '\n' ? '\\\n' : ESCAPED.has(ch) ? '\\' + ch : ch)
const escapeLink = (link: string, end: string) => link.replace(new RegExp(`[\\\\${end}]`, 'g'), (c) => '\\' + c)
const unescape = (s: string) => s.replace(/\\(.)/gs, '$1')

function isEmptyObject(v: unknown) {
  return v == null || (typeof v === 'object' && Object.keys(v as object).length === 0)
}

/** `account` for `hm://<uid>`, `document` for `hm://<uid>/<path>`. */
export function mentionKindOf(link: string): 'account' | 'document' {
  return link.slice('hm://'.length).includes('/') ? 'document' : 'account'
}

/** How an annotation is written in the text. */
function annotationSyntax(ann: Annotation, chars: string[]): 'toggle' | 'underline' | 'link' | 'mention' | 'opaque' {
  const keys = Object.keys(ann)
  const only = (allowed: string[]) =>
    keys.every((k) => allowed.includes(k)) &&
    isEmptyObject(ann.attributes) &&
    Array.isArray(ann.starts) &&
    Array.isArray(ann.ends) &&
    ann.starts.length === ann.ends.length
  const base = ['type', 'starts', 'ends', 'attributes']
  if (TOGGLES[ann.type] && only(base)) return 'toggle'
  if (ann.type === 'Underline' && only(base)) return 'underline'
  if (ann.type === 'Link' && typeof ann.link === 'string' && only([...base, 'link'])) return 'link'
  const {mentionKind, ...otherAttrs} = (ann.attributes ?? {}) as Record<string, unknown>
  if (
    ann.type === 'Embed' &&
    typeof ann.link === 'string' &&
    ann.link.startsWith('hm://') &&
    keys.every((k) => [...base, 'link'].includes(k)) &&
    isEmptyObject(otherAttrs) &&
    (mentionKind === undefined || mentionKind === mentionKindOf(ann.link)) &&
    ann.starts!.length === 1 &&
    ann.ends![0] === ann.starts![0]! + 1 &&
    chars[ann.starts![0]!] === INLINE_EMBED_CHAR
  )
    return 'mention'
  return 'opaque'
}

/** Union of possibly overlapping or touching ranges. */
function mergeRanges(ranges: Array<[number, number]>) {
  const sorted = ranges.filter(([s, e]) => e > s).sort((a, b) => a[0] - b[0])
  const out: Array<[number, number]> = []
  for (const r of sorted) {
    const last = out[out.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else out.push([r[0], r[1]])
  }
  return out
}

/** Write HM text + annotations as inline Seed text. */
export function serializeInline(text: string, annotations: Annotation[]): string {
  const chars = Array.from(text)
  const opens: string[][] = Array.from({length: chars.length + 1}, () => [])
  const closes: string[][] = Array.from({length: chars.length + 1}, () => [])
  const mentions = new Map<number, string>()
  const toggleRanges: Record<string, Array<[number, number]>> = {}
  const at = (i: number | undefined) => Math.max(0, Math.min(chars.length, i ?? 0))
  const add = (start: number, end: number, open: string, close: string) => {
    opens[at(start)]!.push(open)
    closes[at(end)]!.unshift(close)
  }
  annotations.forEach((ann, n) => {
    const kind = annotationSyntax(ann, chars)
    const starts = ann.starts ?? []
    const ends = ann.ends ?? []
    if (kind === 'mention') mentions.set(starts[0]!, ann.link)
    else if (kind === 'toggle') starts.forEach((s, i) => (toggleRanges[ann.type] ??= []).push([at(s), at(ends[i])]))
    else
      starts.forEach((s, i) => {
        if (kind === 'underline') add(s, ends[i]!, '<u>', '</u>')
        else if (kind === 'link') add(s, ends[i]!, '[', `](${escapeLink(ann.link, ')')})`)
        else add(s, ends[i] ?? s, `<x:${n}>`, `</x:${n}>`)
      })
  })
  for (const [type, ranges] of Object.entries(toggleRanges))
    for (const [s, e] of mergeRanges(ranges)) add(s, e, TOGGLES[type]!, TOGGLES[type]!)
  let out = ''
  for (let i = 0; i <= chars.length; i++) {
    out += closes[i]!.join('') + opens[i]!.join('')
    if (i === chars.length) break
    const mention = mentions.get(i)
    out += mention != null ? `[[${escapeLink(mention, '\\]')}]]` : escapeChar(chars[i]!)
  }
  return out
}

type Token =
  | {kind: 'text'; text: string; from: number; to: number}
  | {kind: 'toggle'; type: string; from: number; to: number}
  | {kind: 'open' | 'close'; key: string; from: number; to: number}
  | {kind: 'mention'; link: string; from: number; to: number}
  | {kind: 'linkOpen'; from: number; to: number}
  | {kind: 'linkClose'; url: string; from: number; to: number}

/** Index of the first unescaped occurrence of `needle` at or after `from`. */
function indexOfUnescaped(src: string, needle: string, from: number) {
  for (let i = from; i < src.length; i++) {
    if (src[i] === '\\') i++
    else if (src.startsWith(needle, i)) return i
  }
  return -1
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    const from = i
    if (c === '\\' && i + 1 < src.length) {
      const ch = String.fromCodePoint(src.codePointAt(i + 1)!)
      i += 1 + ch.length
      tokens.push({kind: 'text', text: ch, from, to: i})
      continue
    }
    if (c === '*') {
      let run = 0
      while (src[i + run] === '*') run++
      for (; run >= 2; run -= 2, i += 2) tokens.push({kind: 'toggle', type: 'Bold', from: i, to: i + 2})
      if (run) tokens.push({kind: 'toggle', type: 'Italic', from: i, to: ++i})
      continue
    }
    if (src.startsWith('~~', i)) {
      tokens.push({kind: 'toggle', type: 'Strike', from, to: (i += 2)})
      continue
    }
    if (c === '`') {
      tokens.push({kind: 'toggle', type: 'Code', from, to: ++i})
      continue
    }
    const tag = c === '<' ? /^<(\/?)(u|x:\d+)>/.exec(src.slice(i, i + 16)) : null
    if (tag) {
      i += tag[0].length
      tokens.push({kind: tag[1] ? 'close' : 'open', key: tag[2]!, from, to: i})
      continue
    }
    if (src.startsWith('[[hm://', i)) {
      const end = indexOfUnescaped(src, ']]', i + 2)
      if (end > 0) {
        tokens.push({kind: 'mention', link: unescape(src.slice(i + 2, end)), from, to: (i = end + 2)})
        continue
      }
    }
    if (c === '[') {
      tokens.push({kind: 'linkOpen', from, to: ++i})
      continue
    }
    if (c === ']' && src[i + 1] === '(') {
      const end = indexOfUnescaped(src, ')', i + 2)
      if (end > 0) {
        tokens.push({kind: 'linkClose', url: unescape(src.slice(i + 2, end)), from, to: (i = end + 1)})
        continue
      }
    }
    const ch = String.fromCodePoint(src.codePointAt(i)!)
    i += ch.length
    tokens.push({kind: 'text', text: ch, from, to: i})
  }
  return tokens
}

/** Turn unpaired syntax tokens back into literal text. */
function pairTokens(tokens: Token[]) {
  const asText = (i: number, src: string) => {
    const t = tokens[i]!
    tokens[i] = {kind: 'text', text: src.slice(t.from, t.to), from: t.from, to: t.to}
  }
  return (src: string) => {
    const lastToggle: Record<string, number> = {}
    const toggleCount: Record<string, number> = {}
    const open: Record<string, number[]> = {}
    tokens.forEach((t, i) => {
      if (t.kind === 'toggle') {
        toggleCount[t.type] = (toggleCount[t.type] ?? 0) + 1
        lastToggle[t.type] = i
      } else if (t.kind === 'open' || t.kind === 'linkOpen') {
        ;(open[t.kind === 'open' ? t.key : 'link'] ??= []).push(i)
      } else if (t.kind === 'close' || t.kind === 'linkClose') {
        const stack = open[t.kind === 'close' ? t.key : 'link']
        if (stack?.length) stack.pop()
        else asText(i, src)
      }
    })
    for (const [type, count] of Object.entries(toggleCount)) if (count % 2) asText(lastToggle[type]!, src)
    for (const stack of Object.values(open)) for (const i of stack) asText(i, src)
  }
}

/** Live-preview hints for a parsed inline run, in source offsets. */
export type InlinePreview = {
  /** Syntax ranges hidden off the cursor line. */
  syntax: Array<[number, number]>
  /** Styled ranges (the text between a pair of delimiters). */
  marks: Array<{from: number; to: number; type: string; link?: string}>
  /** `[[hm://…]]` mentions, rendered as chips. */
  mentions: Array<{from: number; to: number; link: string}>
}

/** Result of parsing inline Seed text. */
export type InlineResult = {text: string; annotations: Annotation[]; preview: InlinePreview}

/**
 * Parse inline Seed text into HM text + annotations. `original` are the
 * block's loaded annotations, which `<x:N>` tokens refer to.
 */
export function parseInline(src: string, original: Annotation[] = []): InlineResult {
  const tokens = tokenize(src)
  pairTokens(tokens)(src)
  const preview: InlinePreview = {syntax: [], marks: [], mentions: []}
  const groups = new Map<string, Annotation & {starts: number[]; ends: number[]}>()
  const range = (key: string, base: Annotation, start: number, end: number) => {
    let ann = groups.get(key)
    if (!ann) groups.set(key, (ann = {...base, starts: [], ends: []}))
    ann.starts.push(start)
    ann.ends.push(end)
  }
  const toggles: Record<string, {pos: number; src: number}> = {}
  const opened: Record<string, Array<{pos: number; src: number}>> = {}
  let text = ''
  let pos = 0
  for (const t of tokens) {
    if (t.kind === 'text') {
      if (t.to - t.from > t.text.length && t.text.length <= 2) preview.syntax.push([t.from, t.from + 1])
      text += t.text
      pos += Array.from(t.text).length
      continue
    }
    if (t.kind === 'mention') {
      range(`m${pos}`, {type: 'Embed', link: t.link, attributes: {mentionKind: mentionKindOf(t.link)}}, pos, pos + 1)
      preview.mentions.push({from: t.from, to: t.to, link: t.link})
      text += INLINE_EMBED_CHAR
      pos++
      continue
    }
    preview.syntax.push([t.from, t.to])
    if (t.kind === 'toggle') {
      const start = toggles[t.type]
      if (!start) toggles[t.type] = {pos, src: t.to}
      else {
        delete toggles[t.type]
        if (pos > start.pos) range(t.type, {type: t.type}, start.pos, pos)
        preview.marks.push({from: start.src, to: t.from, type: t.type})
      }
    } else if (t.kind === 'open' || t.kind === 'linkOpen') {
      ;(opened[t.kind === 'open' ? t.key : 'link'] ??= []).push({pos, src: t.to})
    } else {
      const key = t.kind === 'close' ? t.key : 'link'
      const start = opened[key]!.pop()!
      if (t.kind === 'linkClose') {
        range(`Link ${t.url}`, {type: 'Link', link: t.url}, start.pos, pos)
        preview.marks.push({from: start.src, to: t.from, type: 'Link', link: t.url})
      } else if (key === 'u') {
        if (pos > start.pos) range('Underline', {type: 'Underline'}, start.pos, pos)
        preview.marks.push({from: start.src, to: t.from, type: 'Underline'})
      } else {
        const base = original[Number(key.slice(2))]
        if (base) range(key, base, start.pos, pos)
        preview.marks.push({from: start.src, to: t.from, type: base?.type ?? 'Unknown'})
      }
    }
  }
  const annotations = [...groups.values()].sort((a, b) => a.starts[0]! - b.starts[0]!)
  return {text, annotations, preview}
}

/** Prefix `\` when inline text would otherwise read as block syntax. */
function escapeLineStart(s: string) {
  return /^(#|\$\$|!\[|::|[-+>](?: |$)|\d+\.(?: |$)| )/.test(s) ? '\\' + s : s
}

/** Write one block's own content (no indentation or list marker). */
export function serializeBlock(block: AnyBlock): string {
  const text: string = typeof block.text === 'string' ? block.text : ''
  const annotations: Annotation[] = Array.isArray(block.annotations) ? block.annotations : []
  const link: string = typeof block.link === 'string' ? block.link : ''
  switch (block.type) {
    case 'Paragraph':
      return escapeLineStart(serializeInline(text, annotations))
    case 'Heading':
      return '# ' + serializeInline(text, annotations)
    case 'Code': {
      const longest = Math.max(0, ...Array.from(text.matchAll(/`+/g), (m) => m[0].length))
      const fence = '`'.repeat(Math.max(3, longest + 1))
      return `${fence}${block.attributes?.language ?? ''}\n${text}\n${fence}`
    }
    case 'Math':
      if (!text.split('\n').includes('$$')) return `$$\n${text}\n$$`
      break
    case 'Embed': {
      const view = block.attributes?.view
      if (!text && !annotations.length && link && !/[\]|\\\n]/.test(link))
        return `![[${link}${view && view !== 'Content' ? '|' + view : ''}]]`
      break
    }
    case 'Image':
      return `![${serializeInline(text, annotations)}](${escapeLink(link, ')')})`
  }
  return `::${block.type}[${serializeInline(text, annotations)}]` + (link ? `(${escapeLink(link, ')')})` : '')
}

/** What the editor models of one block: its fields and the attributes it owns. */
export type ParsedContent = {
  fields: Record<string, any> & {type: string; attributes: Record<string, unknown>}
  ownedAttrs: string[]
  /** Where the inline source sits inside the content, and its parse. */
  inline?: {offset: number; length: number; result: InlineResult}
}

/** Index of the last unescaped `](` in `src`, or -1. */
function lastLinkSplit(src: string) {
  let found = -1
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\\') i++
    else if (src.startsWith('](', i)) found = i
  }
  return found
}

/**
 * Parse one block's content. `base` is the block it was loaded from (or a
 * template); `<x:N>` tokens refer to its annotations.
 */
export function parseContent(content: string, base?: AnyBlock): ParsedContent {
  const original: Annotation[] = Array.isArray(base?.annotations) ? base!.annotations : []
  const inline = (type: string, offset: number, src: string, extra: Record<string, unknown> = {}): ParsedContent => {
    const result = parseInline(src, original)
    return {
      fields: {type, text: result.text, annotations: result.annotations, ...extra, attributes: {}},
      ownedAttrs: [],
      inline: {offset, length: src.length, result},
    }
  }
  const fence = /^`{3,}/.exec(content)
  if (fence) {
    const lines = content.split('\n')
    const closed = lines.length > 1 && lines[lines.length - 1] === fence[0]
    const language = lines[0]!.slice(fence[0].length)
    return {
      fields: {
        type: 'Code',
        text: lines.slice(1, closed ? -1 : undefined).join('\n'),
        attributes: language ? {language} : {},
      },
      ownedAttrs: ['language'],
    }
  }
  if (content === '$$' || content.startsWith('$$\n')) {
    const lines = content.split('\n')
    const closed = lines.length > 1 && lines[lines.length - 1] === '$$'
    return {
      fields: {type: 'Math', text: lines.slice(1, closed ? -1 : undefined).join('\n'), attributes: {}},
      ownedAttrs: [],
    }
  }
  const embed = /^!\[\[([^\]|\n]*)(?:\|([^\]\n]*))?\]\]$/.exec(content)
  if (embed) {
    return {
      fields: {type: 'Embed', text: '', link: embed[1], attributes: {view: embed[2] || 'Content'}},
      ownedAttrs: ['view'],
    }
  }
  const directive = /^::([^\s[\]]+)\[/.exec(content)
  if (content.startsWith('![') || directive) {
    const type = directive ? directive[1]! : 'Image'
    const start = directive ? directive[0].length : 2
    const split = content.endsWith(')') ? lastLinkSplit(content) : -1
    if (split >= start) {
      let link = unescape(content.slice(split + 2, -1))
      if (type === 'Video') link = normalizeVideoUrl(link) ?? link
      return inline(type, start, content.slice(start, split), {link})
    }
    if (directive) return inline(type, start, content.endsWith(']') ? content.slice(start, -1) : content.slice(start))
  }
  if (content.startsWith('# ')) return inline('Heading', 2, content.slice(2))
  return inline('Paragraph', 0, content)
}

/** A block as found by {@link scanBlocks}: where it is and its own content. */
export type ScannedBlock = {
  /** Offset of the block's first line. */
  from: number
  /** Offset just after the block's last line. */
  to: number
  depth: number
  marker: ListMarker | null
  /** Offset where the content starts, after indentation and marker. */
  contentFrom: number
  /** Content per line, with indentation stripped, and where each piece starts. */
  segments: Array<{from: number; text: string}>
}

/** The text of a scanned block's content. */
export function blockContent(block: ScannedBlock): string {
  return block.segments.map((s) => s.text).join('\n')
}

/** Map an offset inside {@link blockContent} to a document offset. */
export function contentPos(block: ScannedBlock, offset: number): number {
  for (const seg of block.segments) {
    if (offset <= seg.text.length) return seg.from + offset
    offset -= seg.text.length + 1
  }
  const last = block.segments[block.segments.length - 1]!
  return last.from + last.text.length
}

/** Split the text into blocks, following the rules in the module comment. */
export function scanBlocks(text: string): ScannedBlock[] {
  const lines: Array<{from: number; text: string}> = []
  let offset = 0
  for (const line of text.split('\n')) {
    lines.push({from: offset, text: line})
    offset += line.length + 1
  }
  const blocks: ScannedBlock[] = []
  let prevDepth = -1
  for (let i = 0; i < lines.length; ) {
    const {from, text: line} = lines[i++]!
    const indent = /^ */.exec(line)![0].length
    const depth = Math.min(Math.floor(indent / 2), prevDepth + 1)
    const markerMatch = depth > 0 ? /^(-|>|\d+\.)( |$)/.exec(line.slice(indent)) : null
    const marker: ListMarker | null = !markerMatch
      ? null
      : markerMatch[1] === '-'
        ? 'Unordered'
        : markerMatch[1] === '>'
          ? 'Blockquote'
          : 'Ordered'
    const column = indent + (markerMatch?.[0].length ?? 0)
    const segments = [{from: from + column, text: line.slice(column)}]
    const first = segments[0]!.text
    const fence = /^`{3,}/.exec(first)?.[0] ?? (first === '$$' ? '$$' : null)
    const next = () => {
      const l = lines[i]!
      const lead = /^ */.exec(l.text)![0].length
      const strip = Math.min(lead, column)
      return {lead, seg: {from: l.from + strip, text: l.text.slice(strip)}}
    }
    if (fence) {
      while (i < lines.length) {
        const {lead, seg} = next()
        if (seg.text.trim() && lead < column) break
        segments.push(seg)
        i++
        if (seg.text === fence) break
      }
    } else {
      while (i < lines.length && /(^|[^\\])(\\\\)*\\$/.test(segments[segments.length - 1]!.text)) {
        segments.push(next().seg)
        i++
      }
    }
    const last = segments[segments.length - 1]!
    blocks.push({from, to: last.from + last.text.length, depth, marker, contentFrom: from + column, segments})
    prevDepth = depth
  }
  return blocks
}

/** The YouTube video id in a URL, or `false` (same parser as the BlockNote editor). */
export function youtubeParser(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7]!.length == 11 ? match[7] : false
}

/**
 * The link BlockNote stores for a pasted video URL: YouTube and Vimeo become
 * their embed players, other `http(s)` URLs are rejected (`null`) and any
 * other scheme (`ipfs://`, `blob:`) is kept as a file.
 */
export function normalizeVideoUrl(url: string): string | null {
  if (!/^https?:\/\//.test(url)) return url
  if (url.includes('youtu.be') || url.includes('youtube')) {
    const id = youtubeParser(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (url.includes('vimeo')) {
    const urlArray = url.split('/')
    return `https://player.vimeo.com/video/${urlArray[urlArray.length - 1]}`
  }
  return null
}

/** Whether a link is a YouTube/Vimeo player URL rather than a video file. */
export function isEmbedPlayer(link: string) {
  return link.startsWith('https://www.youtube.com/embed/') || link.startsWith('https://player.vimeo.com/video/')
}

export {LIST_TYPES}
