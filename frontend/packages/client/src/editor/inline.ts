/**
 * Editor-neutral inline content. HM stores a block's rich text as `text` plus
 * annotations with code point ranges; editors store runs of marked text.
 * {@link inlineFromHM} and {@link inlineToHM} do the offset, mention and
 * range-merging work once, so an adapter only maps {@link InlineMark}s to its
 * own marks.
 */

/** An HM annotation as stored on a block (ranges in code points). */
export type HMAnnotationLike = Record<string, any> & {type: string; starts?: number[]; ends?: number[]}

/** Placeholder character an inline `Embed` annotation (a mention) covers. */
export const INLINE_EMBED_CHAR = '\uFFFC'

/** Annotation types that map to a plain on/off mark. */
export const SIMPLE_MARK_TYPES = ['Bold', 'Italic', 'Underline', 'Strike', 'Code'] as const
/** An annotation type that maps to a plain on/off mark. */
export type SimpleMarkType = (typeof SIMPLE_MARK_TYPES)[number]

/**
 * A mark on an inline run. `opaque` carries an annotation the kit doesn't
 * model (an unknown type, or a known type with extra fields) unchanged, minus
 * its ranges; editors should keep it as an invisible mark so it survives edits.
 */
export type InlineMark =
  | {kind: 'simple'; type: SimpleMarkType}
  | {kind: 'link'; href: string}
  | {kind: 'color'; type: 'TextColor' | 'BackgroundColor'; value: string}
  | {kind: 'opaque'; annotation: HMAnnotationLike}

/** A piece of inline content: marked text, a mention atom or a line break. */
export type InlineRun =
  | {kind: 'text'; text: string; marks: InlineMark[]}
  | {
      kind: 'mention'
      link: string
      mentionKind: string | null
      /** The loaded `Embed` annotation without ranges, so its extra fields survive; omit for new mentions. */
      annotation?: HMAnnotationLike
      marks: InlineMark[]
    }
  | {kind: 'break'; marks: InlineMark[]}

const PLAIN_KEYS = ['type', 'starts', 'ends', 'link', 'attributes']
const isEmptyObject = (v: unknown) =>
  v === undefined || (typeof v === 'object' && v !== null && Object.keys(v as object).length === 0)

/** An annotation without its `starts` / `ends`. */
export function withoutRanges({starts: _s, ends: _e, ...rest}: HMAnnotationLike): HMAnnotationLike {
  return rest
}

/** A stable identity for a mark; two marks with the same key are the same mark. */
export function markKey(mark: InlineMark): string {
  return JSON.stringify(mark)
}

/**
 * The modelled mark for an annotation, or an `opaque` mark when it has fields
 * the kit doesn't model, so it is never lost.
 */
export function markFromAnnotation(ann: HMAnnotationLike): InlineMark {
  const opaque: InlineMark = {kind: 'opaque', annotation: withoutRanges(ann)}
  if (Object.keys(ann).some((k) => !PLAIN_KEYS.includes(k))) return opaque
  if ((SIMPLE_MARK_TYPES as readonly string[]).includes(ann.type)) {
    return ann.link || !isEmptyObject(ann.attributes) ? opaque : {kind: 'simple', type: ann.type as SimpleMarkType}
  }
  if (ann.type === 'Link') {
    return !ann.link || !isEmptyObject(ann.attributes) ? opaque : {kind: 'link', href: ann.link}
  }
  if (ann.type === 'TextColor' || ann.type === 'BackgroundColor') {
    const attrs = ann.attributes
    if (ann.link || !attrs || Object.keys(attrs).join() !== 'value' || typeof attrs.value !== 'string') return opaque
    return {kind: 'color', type: ann.type, value: attrs.value}
  }
  return opaque
}

function isInlineEmbed(ann: HMAnnotationLike, chars: string[]) {
  const start = ann.starts?.[0]
  return (
    ann.type === 'Embed' &&
    typeof ann.link === 'string' &&
    ann.starts?.length === 1 &&
    ann.ends?.length === 1 &&
    start !== undefined &&
    ann.ends[0] === start + 1 &&
    chars[start] === INLINE_EMBED_CHAR &&
    Object.keys(ann).every((k) => PLAIN_KEYS.includes(k))
  )
}

/** Split HM text + annotations into runs. Newlines become `break` runs. */
export function inlineFromHM(text: string, annotations: HMAnnotationLike[] = []): InlineRun[] {
  const chars = Array.from(text)
  const marksAt: Map<string, InlineMark>[] = chars.map(() => new Map())
  const mentionAt = new Map<number, HMAnnotationLike>()
  for (const ann of annotations) {
    if (isInlineEmbed(ann, chars) && !mentionAt.has(ann.starts![0]!)) {
      mentionAt.set(ann.starts![0]!, ann)
      continue
    }
    const mark = markFromAnnotation(ann)
    const key = markKey(mark)
    ;(ann.starts ?? []).forEach((start, i) => {
      const end = Math.min(ann.ends?.[i] ?? start, chars.length)
      for (let p = Math.max(0, start); p < end; p++) marksAt[p]!.set(key, mark)
    })
  }
  const runs: InlineRun[] = []
  let current: {text: string; key: string; marks: InlineMark[]} | null = null
  const flush = () => {
    if (current) runs.push({kind: 'text', text: current.text, marks: current.marks})
    current = null
  }
  chars.forEach((ch, i) => {
    const marks = [...marksAt[i]!.values()]
    const mention = mentionAt.get(i)
    if (mention) {
      flush()
      const annotation = withoutRanges(mention)
      runs.push({
        kind: 'mention',
        link: mention.link,
        mentionKind: mention.attributes?.mentionKind ?? null,
        annotation,
        marks,
      })
      return
    }
    if (ch === '\n') {
      flush()
      runs.push({kind: 'break', marks})
      return
    }
    const key = [...marksAt[i]!.keys()].sort().join('|')
    if (current && current.key !== key) flush()
    if (!current) current = {text: '', key, marks}
    current.text += ch
  })
  flush()
  return runs
}

function annotationFromMark(mark: InlineMark, starts: number[], ends: number[]): HMAnnotationLike {
  switch (mark.kind) {
    case 'opaque':
      return {...mark.annotation, starts, ends}
    case 'simple':
      return {type: mark.type, starts, ends}
    case 'link':
      return {type: 'Link', starts, ends, link: mark.href}
    case 'color':
      return {type: mark.type, starts, ends, attributes: {value: mark.value}}
  }
}

/**
 * Join runs back into HM text + annotations. Annotations come out in order of
 * first appearance, with every range of the same mark in one annotation, so
 * the result is equivalent to, not always identical to, what was loaded;
 * `restoreBlock` returns the loaded block when nothing changed.
 */
export function inlineToHM(runs: InlineRun[]): {text: string; annotations: HMAnnotationLike[]} {
  let text = ''
  let pos = 0
  const byKey = new Map<string, {mark: InlineMark; starts: number[]; ends: number[]}>()
  const order: Array<HMAnnotationLike | string> = []
  for (const run of runs) {
    const len = run.kind === 'text' ? Array.from(run.text).length : 1
    if (run.kind === 'text') text += run.text
    else if (run.kind === 'break') text += '\n'
    else {
      text += INLINE_EMBED_CHAR
      const range = {starts: [pos], ends: [pos + 1]}
      if (run.annotation) order.push({...run.annotation, type: 'Embed', link: run.link, ...range})
      else {
        const attributes = run.mentionKind ? {attributes: {mentionKind: run.mentionKind}} : {}
        order.push({type: 'Embed', link: run.link, ...range, ...attributes})
      }
    }
    for (const mark of run.marks) {
      const key = markKey(mark)
      let entry = byKey.get(key)
      if (!entry) {
        entry = {mark, starts: [], ends: []}
        byKey.set(key, entry)
        order.push(key)
      }
      const last = entry.ends.length - 1
      if (last >= 0 && entry.ends[last] === pos) entry.ends[last] = pos + len
      else {
        entry.starts.push(pos)
        entry.ends.push(pos + len)
      }
    }
    pos += len
  }
  const annotations = order.map((a) => {
    if (typeof a !== 'string') return a
    const {mark, starts, ends} = byKey.get(a)!
    return annotationFromMark(mark, starts, ends)
  })
  return {text, annotations}
}
