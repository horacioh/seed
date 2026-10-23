import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {autocompletion, type Completion, type CompletionContext, type CompletionResult} from '@codemirror/autocomplete'
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands'
import {
  type ChangeSpec,
  EditorSelection,
  type EditorState,
  type Extension,
  Facet,
  type Range,
  StateEffect,
  StateField,
} from '@codemirror/state'
import {
  Decoration,
  gutter,
  GutterMarker,
  type DecorationSet,
  EditorView,
  keymap,
  showTooltip,
  type Tooltip,
  WidgetType,
} from '@codemirror/view'
import {
  backspaceBlock,
  blockIndexAt,
  indentBlock,
  insertLineBreak,
  listShortcut,
  outdentBlock,
  setChildrenType,
  splitBlock,
} from './commands'
import {type AnyBlock, blockContent, contentPos, isEmbedPlayer, normalizeVideoUrl, parseContent} from './format'
import {assignBlock, createBlockId, seedBlocks} from './state'

/** A mention suggestion: an account or document the user can link inline. */
export type MentionItem = {link: string; title: string; subtitle?: string; kind: 'account' | 'document'}

/** A document resolved for display inside an `Embed` block or mention. */
export type EmbeddedDocument = {title: string; summary?: string; content: HMBlockNode[]}

/**
 * Everything the editor needs from the outside world (same shape as the
 * ProseKit spike), keeping the editor free of app state.
 */
export interface SeedEditorServices {
  /** Search accounts (`@`) or documents (`[[`) for the mention menus. */
  searchMentions(query: string, kind: 'account' | 'document', signal?: AbortSignal): Promise<MentionItem[]>
  /** Load an `hm://` document for embeds and mention labels. */
  loadDocument(link: string): Promise<EmbeddedDocument | null>
  /** Resolve an `ipfs://` (or any) media link to a fetchable URL. */
  fileUrl(link: string): string
  /** Store a file and return its link (`ipfs://…` in the app, an object URL in the harness). */
  uploadFile?(file: File): Promise<string>
}

/** The services the editor's widgets and menus use. */
export const seedServices = Facet.define<SeedEditorServices, SeedEditorServices>({combine: (values) => values[0]!})

const ATOM_TYPES = new Set(['Embed', 'Image', 'Video', 'File', 'Button', 'WebEmbed', 'Query', 'Nostr'])

const documentCache = new Map<string, Promise<EmbeddedDocument | null>>()
function loadDocument(services: SeedEditorServices, link: string) {
  let doc = documentCache.get(link)
  if (!doc) documentCache.set(link, (doc = services.loadDocument(link).catch(() => null)))
  return doc
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...children: Array<Node | string>
) {
  const node = Object.assign(document.createElement(tag), props)
  node.append(...children)
  return node
}

/** Indentation, bullet, number or quote bar in front of a block. */
class PrefixWidget extends WidgetType {
  constructor(
    readonly marker: string | null,
    readonly n: number,
  ) {
    super()
  }
  override eq(other: PrefixWidget) {
    return other.marker === this.marker && other.n === this.n
  }
  toDOM() {
    const text = this.marker === 'Unordered' ? '•' : this.marker === 'Ordered' ? `${this.n}.` : ''
    return el('span', {className: `cm-seed-prefix cm-seed-prefix-${this.marker ?? 'Group'}`}, text)
  }
}

/** An inline `Embed` annotation as a chip showing the account or document name. */
class MentionWidget extends WidgetType {
  constructor(readonly link: string) {
    super()
  }
  override eq(other: MentionWidget) {
    return other.link === this.link
  }
  toDOM(view: EditorView) {
    const isAccount = !this.link.slice(5).includes('/')
    const chip = el(
      'span',
      {className: 'cm-seed-mention', title: this.link},
      (isAccount ? '@' : '') + this.link.slice(5, 17),
    )
    chip.dataset.hmMention = this.link
    loadDocument(view.state.facet(seedServices), this.link).then((doc) => {
      if (doc?.title) chip.textContent = (isAccount ? '@' : '') + doc.title
    })
    return chip
  }
}

/** Small type label in front of a block this editor doesn't model. */
class BadgeWidget extends WidgetType {
  constructor(readonly type: string) {
    super()
  }
  override eq(other: BadgeWidget) {
    return other.type === this.type
  }
  toDOM() {
    return el('span', {className: 'cm-seed-badge'}, this.type)
  }
}

function readOnlyBlocks(services: SeedEditorServices, blocks: HMBlockNode[], depth = 0): HTMLElement[] {
  return blocks.flatMap(({block, children}) => {
    const b = block as AnyBlock
    const node =
      b.type === 'Image'
        ? el('img', {src: services.fileUrl(b.link), alt: b.text ?? ''})
        : el(b.type === 'Heading' ? 'h3' : 'p', {}, String(b.text ?? '').replaceAll('\uFFFC', '•'))
    node.style.marginLeft = `${depth * 16}px`
    return [node, ...readOnlyBlocks(services, children ?? [], depth + 1)]
  })
}

/** Embed, media, file, button, web-embed and query blocks rendered as a preview. */
class AtomWidget extends WidgetType {
  constructor(
    readonly block: AnyBlock,
    readonly from: number,
    readonly key = JSON.stringify(block),
  ) {
    super()
  }
  override eq(other: AtomWidget) {
    return other.key === this.key && other.from === this.from
  }
  toDOM(view: EditorView) {
    const services = view.state.facet(seedServices)
    const {type, link = '', text = '', attributes = {}} = this.block
    const box = el('div', {className: `cm-seed-atom cm-seed-atom-${type}`})
    box.addEventListener('mousedown', (event) => {
      if ((event.target as HTMLElement).closest('button, video, iframe, a')) return
      event.preventDefault()
      view.dispatch({selection: {anchor: this.from}})
      view.focus()
    })
    if (type === 'Embed') {
      const view0 = attributes.view === 'Card' ? 'Card' : 'Content'
      const bar = el('div', {className: 'cm-seed-embed-bar'}, el('span', {}, link))
      for (const v of ['Content', 'Card']) {
        const button = el('button', {type: 'button', textContent: v})
        if (v === view0) button.dataset.active = 'true'
        button.addEventListener('mousedown', (event) => {
          event.preventDefault()
          const line = view.state.doc.lineAt(this.from)
          const content = view.state.doc.sliceString(this.from, line.to)
          view.dispatch({
            changes: {
              from: this.from,
              to: line.to,
              insert: content.replace(/(\|[^\]]*)?\]\]$/, v === 'Card' ? '|Card]]' : ']]'),
            },
          })
        })
        bar.append(button)
      }
      const body = el('div', {className: 'cm-seed-embed-body'}, 'Loading…')
      box.append(bar, body)
      loadDocument(services, link).then((doc) => {
        body.replaceChildren()
        if (!doc) body.append(`Could not load ${link}`)
        else if (view0 === 'Card') body.append(el('strong', {}, doc.title), el('p', {}, doc.summary ?? ''))
        else body.append(el('h2', {}, doc.title), ...readOnlyBlocks(services, doc.content.slice(0, 8)))
      })
    } else if (type === 'Image') {
      if (!link)
        box.append(el('div', {className: 'cm-seed-empty'}, 'Image: type a URL inside ( ), or drop/paste a file'))
      else {
        const img = el('img', {src: services.fileUrl(link), alt: text})
        if (attributes.width) img.width = Number(attributes.width)
        box.append(img)
        if (text) box.append(el('figcaption', {}, text.replaceAll('\uFFFC', '•')))
      }
    } else if (type === 'Video') {
      if (!link) box.append(el('div', {className: 'cm-seed-empty'}, 'Video: paste a YouTube/Vimeo URL or drop a file'))
      else if (isEmbedPlayer(link))
        box.append(el('iframe', {src: link, allow: 'autoplay; fullscreen; picture-in-picture', allowFullscreen: true}))
      else {
        const video = el('video', {src: services.fileUrl(link), controls: true})
        video.autoplay = !!attributes.autoplay
        video.loop = !!attributes.loop
        video.muted = !!attributes.muted
        box.append(video)
      }
    } else if (type === 'File') {
      box.append(
        el('a', {href: services.fileUrl(link), target: '_blank', rel: 'noreferrer'}, `📎 ${attributes.name || link}`),
      )
    } else if (type === 'Button') {
      box.append(el('span', {className: 'cm-seed-button'}, text || attributes.name || 'Button'))
    } else if (type === 'Query') {
      box.append(`Query · ${attributes.style ?? 'List'} · ${JSON.stringify(attributes.query?.includes ?? [])}`)
    } else {
      box.append(el('a', {href: link, target: '_blank', rel: 'noreferrer'}, link || type))
    }
    return box
  }
  override ignoreEvent() {
    return true
  }
}

const setFocused = StateEffect.define<boolean>()
/** Whether the editor has focus: syntax is only revealed around the cursor while editing. */
const focused = StateField.define<boolean>({
  create: () => false,
  update: (value, tr) => tr.effects.reduce((v, e) => (e.is(setFocused) ? e.value : v), value),
  provide: () => EditorView.focusChangeEffect.of((_state, focusing) => setFocused.of(focusing)),
})

function blockDecorations(state: EditorState): {decorations: DecorationSet; atomic: DecorationSet} {
  const decorations: Range<Decoration>[] = []
  const atomic: Range<Decoration>[] = []
  const selection = state.field(focused, false) ? state.selection.ranges : []
  const counters: number[] = []
  for (const block of state.field(seedBlocks).blocks) {
    const editing = selection.some((r) => r.to >= block.from && r.from <= block.to)
    const parsed = parseContent(blockContent(block), block.meta.base)
    const type = parsed.fields.type
    counters.length = block.depth + 1
    counters[block.depth] = block.marker === 'Ordered' ? (counters[block.depth] ?? 0) + 1 : 0
    const classes = ['cm-seed-line', `cm-seed-${type}`]
    if (block.marker === 'Blockquote') classes.push('cm-seed-quote')
    const style = `padding-left: ${block.depth * 24 + 4}px`
    block.segments.forEach((seg, i) => {
      const line = state.doc.lineAt(seg.from)
      const fence = (type === 'Code' || type === 'Math') && (i === 0 || i === block.segments.length - 1)
      decorations.push(
        Decoration.line({
          class: [...classes, i ? 'cm-seed-cont' : '', fence ? 'cm-seed-fence' : ''].join(' '),
          attributes: {style},
        }).range(line.from),
      )
      const prefixFrom = i === 0 ? block.from : line.from
      if (seg.from > prefixFrom) {
        const deco = Decoration.replace(i === 0 ? {widget: new PrefixWidget(block.marker, counters[block.depth]!)} : {})
        decorations.push(deco.range(prefixFrom, seg.from))
        atomic.push(deco.range(prefixFrom, seg.from))
      }
    })
    const base = block.meta.base?.type === type ? block.meta.base : undefined
    const merged = {
      ...base,
      ...parsed.fields,
      attributes: {...base?.attributes, ...parsed.fields.attributes},
    } as AnyBlock
    if (ATOM_TYPES.has(type)) {
      const widget = new AtomWidget(merged, block.contentFrom)
      if (!editing && block.segments.length === 1 && block.to > block.contentFrom)
        decorations.push(Decoration.replace({widget}).range(block.contentFrom, block.to))
      else decorations.push(Decoration.widget({widget, side: 1}).range(block.to))
      if (!editing) continue
    }
    if (!parsed.inline) continue
    const at = (offset: number) => contentPos(block, parsed.inline!.offset + offset)
    if (!editing && parsed.inline.offset > 0) {
      const hide = Decoration.replace(ATOM_TYPES.has(type) || type === 'Heading' ? {} : {widget: new BadgeWidget(type)})
      decorations.push(hide.range(block.contentFrom, at(0)))
      const tail = contentPos(block, blockContent(block).length)
      const inlineEnd = at(parsed.inline.length)
      if (tail > inlineEnd) decorations.push(Decoration.replace({}).range(inlineEnd, tail))
    }
    const {preview} = parsed.inline.result
    for (const m of preview.marks)
      if (m.to > m.from)
        decorations.push(
          Decoration.mark({class: `cm-seed-mark-${m.type}`, attributes: m.link ? {title: m.link} : undefined}).range(
            at(m.from),
            at(m.to),
          ),
        )
    if (!editing)
      for (const [from, to] of preview.syntax) decorations.push(Decoration.replace({}).range(at(from), at(to)))
    for (const m of preview.mentions) {
      const from = at(m.from)
      const to = at(m.to)
      if (selection.some((r) => r.head > from && r.head < to)) continue
      const deco = Decoration.replace({widget: new MentionWidget(m.link)})
      decorations.push(deco.range(from, to))
      atomic.push(deco.range(from, to))
    }
  }
  return {decorations: Decoration.set(decorations, true), atomic: Decoration.set(atomic, true)}
}

const livePreview = StateField.define<{decorations: DecorationSet; atomic: DecorationSet}>({
  create: blockDecorations,
  update: (value, tr) =>
    tr.docChanged || tr.selection || tr.effects.some((e) => e.is(setFocused)) ? blockDecorations(tr.state) : value,
  provide: (field) => [
    EditorView.decorations.from(field, (v) => v.decorations),
    EditorView.atomicRanges.of((view) => view.state.field(field).atomic),
  ],
})

function mentionSource(context: CompletionContext): Promise<CompletionResult | null> | null {
  const account = context.matchBefore(/(?:^|[\s(])@[^\s@[\]]*$/)
  const document = account ? null : context.matchBefore(/\[\[(?!hm:)[^\]\n]*$/)
  const match = account ?? document
  if (!match) return null
  const from = account ? match.from + match.text.indexOf('@') : match.from
  const query = context.state.sliceDoc(from + (account ? 1 : 2), context.pos)
  const kind = account ? 'account' : 'document'
  const controller = new AbortController()
  context.addEventListener('abort', () => controller.abort())
  return context.state
    .facet(seedServices)
    .searchMentions(query, kind, controller.signal)
    .then((items) => ({
      from,
      filter: false,
      options: items.map(
        (item): Completion => ({
          label: item.title || item.link,
          detail: item.subtitle,
          type: item.kind === 'account' ? 'account' : 'document',
          apply: `[[${item.link}]]`,
        }),
      ),
    }))
    .catch(() => null)
}

/** Insert new blocks after the cursor block (replacing it when empty), with template payloads. */
function insertBlocksAfter(view: EditorView, lines: Array<{text: string; base?: AnyBlock}>) {
  const {state} = view
  const block = state.field(seedBlocks).blocks[blockIndexAt(state, state.selection.main.head)]!
  const empty = block.to === block.contentFrom
  const prefix = state.doc.sliceString(block.from, block.contentFrom)
  const insertAt = empty ? block.contentFrom : block.to
  let insert = ''
  const effects = lines.map((line, i) => {
    const reuse = empty && i === 0
    const pos = reuse ? block.from : insertAt + insert.length + 1
    insert += (reuse ? '' : '\n' + prefix) + line.text
    return assignBlock.of({pos, meta: {id: reuse ? block.meta.id : createBlockId(), base: line.base}})
  })
  view.dispatch({
    changes: {from: insertAt, insert},
    selection: {anchor: insertAt + insert.length},
    effects,
    scrollIntoView: true,
    userEvent: 'input',
  })
}

/** Upload files and insert them as Image / Video / File blocks. */
export async function insertFiles(view: EditorView, files: File[]) {
  const services = view.state.facet(seedServices)
  if (!services.uploadFile || !files.length) return false
  const lines = await Promise.all(
    files.map(async (file) => {
      const link = await services.uploadFile!(file)
      const type = file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'File'
      const text = type === 'Image' ? `![](${link})` : `::${type}[](${link})`
      return {text, base: {type, id: '', attributes: {name: file.name}}}
    }),
  )
  insertBlocksAfter(view, lines)
  return true
}

function pickFiles(view: EditorView, accept: string) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.addEventListener('change', () => insertFiles(view, Array.from(input.files ?? [])))
  input.click()
}

const SLASH_ITEMS: Array<{
  label: string
  detail: string
  text?: string
  cursor?: number
  run?: (view: EditorView) => void
}> = [
  {label: 'Heading', detail: '# ', text: '# '},
  {label: 'Code block', detail: '```', text: '```\n\n```', cursor: 4},
  {label: 'Math', detail: '$$', text: '$$\n\n$$', cursor: 3},
  {label: 'Image', detail: 'from URL', text: '![]()', cursor: 4},
  {label: 'Upload image', detail: 'file', run: (view) => pickFiles(view, 'image/*')},
  {label: 'Video', detail: 'YouTube / Vimeo / URL', text: '::Video[]()', cursor: 10},
  {label: 'Upload video', detail: 'file', run: (view) => pickFiles(view, 'video/*')},
  {label: 'Embed', detail: 'hm:// document', text: '![[hm://]]', cursor: 8},
  {label: 'Button', detail: '::Button', text: '::Button[Label]()', cursor: 16},
  {label: 'Bullet list', detail: 'children', run: (view) => setChildrenType('Unordered')(view)},
  {label: 'Numbered list', detail: 'children', run: (view) => setChildrenType('Ordered')(view)},
  {label: 'Quote', detail: 'children', run: (view) => setChildrenType('Blockquote')(view)},
]

function slashSource(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/\/\w*$/)
  if (!match) return null
  const block = context.state.field(seedBlocks).blocks[blockIndexAt(context.state, match.from)]!
  if (match.from !== block.contentFrom) return null
  const query = match.text.slice(1).toLowerCase()
  return {
    from: match.from,
    filter: false,
    options: SLASH_ITEMS.filter((item) => item.label.toLowerCase().includes(query)).map((item) => ({
      label: item.label,
      detail: item.detail,
      type: 'keyword',
      apply: (view: EditorView, _c: Completion, from: number, to: number) => {
        view.dispatch({
          changes: {from, to, insert: item.text?.replace(/\n/g, '\n' + ' '.repeat(from - block.from)) ?? ''},
          selection: {
            anchor:
              from +
              (item.cursor ?? item.text?.length ?? 0) +
              (item.cursor && item.text?.slice(0, item.cursor).includes('\n') ? from - block.from : 0),
          },
        })
        item.run?.(view)
      },
    })),
  }
}

/** Wrap the selection in a pair of delimiters (or unwrap it). */
export function toggleWrap(open: string, close = open) {
  return (view: EditorView) => {
    view.dispatch(
      view.state.changeByRange((range) => {
        const {doc} = view.state
        if (
          doc.sliceString(range.from - open.length, range.from) === open &&
          doc.sliceString(range.to, range.to + close.length) === close
        )
          return {
            changes: [
              {from: range.from - open.length, to: range.from},
              {from: range.to, to: range.to + close.length},
            ],
            range: EditorSelection.range(range.from - open.length, range.to - open.length),
          }
        return {
          changes: [
            {from: range.from, insert: open},
            {from: range.to, insert: close},
          ],
          range: EditorSelection.range(range.from + open.length, range.to + open.length),
        }
      }),
    )
    return true
  }
}

const FORMATS: Array<[string, string, string?]> = [
  ['B', '**'],
  ['I', '*'],
  ['U', '<u>', '</u>'],
  ['S', '~~'],
  ['</>', '`'],
]

const formatToolbar = StateField.define<Tooltip | null>({
  create: () => null,
  update(_value, tr) {
    const range = tr.state.selection.main
    if (range.empty) return null
    return {
      pos: range.from,
      above: true,
      create: (view) => {
        const dom = el('div', {className: 'cm-seed-toolbar'})
        for (const [label, open, close] of FORMATS) {
          const button = el('button', {type: 'button', textContent: label})
          button.addEventListener('mousedown', (e) => {
            e.preventDefault()
            toggleWrap(open, close)(view)
          })
          dom.append(button)
        }
        const link = el('button', {type: 'button', textContent: 'Link'})
        link.addEventListener('mousedown', (e) => {
          e.preventDefault()
          const url = window.prompt('Link URL')
          if (url) toggleWrap('[', `](${url.replace(/[\\)]/g, (c) => '\\' + c)})`)(view)
        })
        dom.append(link)
        return {dom}
      },
    }
  },
  provide: (field) => showTooltip.from(field),
})

const pasteAndDrop = EditorView.domEventHandlers({
  paste(event, view) {
    const files = Array.from(event.clipboardData?.files ?? [])
    if (files.length) {
      void insertFiles(view, files)
      return true
    }
    const text = event.clipboardData?.getData('text/plain').trim() ?? ''
    if (!/^https?:\/\/\S+$/.test(text) || !/youtu\.?be|vimeo/.test(text)) return false
    const link = normalizeVideoUrl(text)
    const block = view.state.field(seedBlocks).blocks[blockIndexAt(view.state, view.state.selection.main.head)]!
    if (!link || block.to !== block.contentFrom) return false
    view.dispatch({
      changes: {from: block.contentFrom, insert: `::Video[](${link})`},
      selection: {anchor: block.contentFrom + `::Video[](${link})`.length},
      userEvent: 'input.paste',
    })
    return true
  },
  drop(event, view) {
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (!files.length) return false
    event.preventDefault()
    const pos = view.posAtCoords({x: event.clientX, y: event.clientY})
    if (pos != null) view.dispatch({selection: {anchor: pos}})
    insertFiles(view, files)
    return true
  },
})

/** Alt-↑/↓: move the block with its children, keeping their ids. */
export function moveBlock(direction: -1 | 1) {
  return (view: EditorView) => {
    const {state} = view
    const {blocks} = state.field(seedBlocks)
    const index = blockIndexAt(state, state.selection.main.head)
    const subtree = (i: number) => {
      let end = i + 1
      while (end < blocks.length && blocks[end]!.depth > blocks[i]!.depth) end++
      return end
    }
    const depth = blocks[index]!.depth
    const end = subtree(index)
    let other = -1
    if (direction < 0) {
      for (let i = index - 1; i >= 0 && blocks[i]!.depth >= depth; i--)
        if (blocks[i]!.depth === depth) {
          other = i
          break
        }
    } else if (end < blocks.length && blocks[end]!.depth === depth) other = end
    if (other < 0) return false
    const [a, b] = direction < 0 ? [other, index] : [index, other]
    const bEnd = subtree(b)
    const from = blocks[a]!.from
    const mid = blocks[b]!.from
    const to = blocks[bEnd - 1]!.to
    const first = state.doc.sliceString(from, mid - 1)
    const second = state.doc.sliceString(mid, to)
    const effects = [
      ...blocks.slice(b, bEnd).map((x) => assignBlock.of({pos: from + x.from - mid, meta: x.meta})),
      ...blocks.slice(a, b).map((x) => assignBlock.of({pos: from + second.length + 1 + x.from - from, meta: x.meta})),
    ]
    const rel = state.selection.main.head - blocks[index]!.from
    const anchor = (direction < 0 ? from : from + second.length + 1) + rel
    view.dispatch({
      changes: {from, to, insert: second + '\n' + first},
      effects,
      selection: {anchor},
      scrollIntoView: true,
      userEvent: 'move.line',
    })
    return true
  }
}

/**
 * Move block `index` (with its children) before block `target`, or after the last block when `target` is the block
 * count. The subtree is re-indented to the target's depth and keeps its ids.
 */
export function moveBlockTo(view: EditorView, index: number, target: number): boolean {
  const {state} = view
  const {blocks} = state.field(seedBlocks)
  let end = index + 1
  while (end < blocks.length && blocks[end]!.depth > blocks[index]!.depth) end++
  if (target >= index && target <= end) return false
  const source = blocks[index]!
  const last = blocks[end - 1]!
  const toEnd = target >= blocks.length
  const dest = toEnd ? null : blocks[target]!
  const prefix = dest ? state.doc.sliceString(dest.from, dest.contentFrom) : ''
  const delta = (dest?.depth ?? 0) - source.depth
  const startLine = state.doc.lineAt(source.from).number
  const lines = state.doc.sliceString(source.from, last.to).split('\n')
  const moved = lines.map((line, i) => {
    if (i === 0) return prefix + state.doc.sliceString(source.contentFrom, state.doc.lineAt(source.from).to)
    if (delta > 0 && line) return '  '.repeat(delta) + line
    return delta < 0 ? line.replace(new RegExp(`^ {0,${-2 * delta}}`), '') : line
  })
  const lineOffsets: number[] = []
  moved.reduce((offset, line) => (lineOffsets.push(offset), offset + line.length + 1), 0)
  const text = moved.join('\n')
  const removeFrom = source.from > 0 ? source.from - 1 : source.from
  const removeTo = source.from > 0 ? last.to : last.to + 1
  const removed = removeTo - removeFrom
  let start: number
  const changes: ChangeSpec[] = [{from: removeFrom, to: removeTo}]
  if (dest && target < index) {
    changes.unshift({from: dest.from, to: dest.from, insert: text + '\n'})
    start = dest.from
  } else if (dest) {
    changes.push({from: dest.from, to: dest.from, insert: text + '\n'})
    start = dest.from - removed
  } else {
    changes.push({from: state.doc.length, to: state.doc.length, insert: '\n' + text})
    start = state.doc.length - removed + 1
  }
  const effects = blocks
    .slice(index, end)
    .map((block) =>
      assignBlock.of({pos: start + lineOffsets[state.doc.lineAt(block.from).number - startLine]!, meta: block.meta}),
    )
  if (dest) effects.push(assignBlock.of({pos: start + text.length + 1, meta: dest.meta}))
  view.dispatch({changes, effects, selection: {anchor: start + prefix.length}, userEvent: 'move.drop'})
  return true
}

class GripMarker extends GutterMarker {
  override toDOM() {
    return el('span', {className: 'cm-seed-grip', title: 'Drag to move', textContent: '⋮⋮'})
  }
}
const grip = new GripMarker()

/** Drag handle: a grip next to every block that moves it (with its children) to where it is dropped. */
const dragHandle = gutter({
  class: 'cm-seed-handles',
  lineMarker(view, line) {
    const {blocks} = view.state.field(seedBlocks)
    const index = blockIndexAt(view.state, line.from)
    return blocks[index]?.from === line.from ? grip : null
  },
  lineMarkerChange: (update) => update.docChanged,
  domEventHandlers: {
    mousedown(view, line, event) {
      const index = blockIndexAt(view.state, line.from)
      if (view.state.field(seedBlocks).blocks[index]?.from !== line.from) return false
      event.preventDefault()
      const indicator = el('div', {className: 'cm-seed-drop-indicator'})
      view.scrollDOM.appendChild(indicator)
      let target = -1
      const onMove = (e: MouseEvent) => {
        const {blocks} = view.state.field(seedBlocks)
        const y = e.clientY - view.documentTop
        const lineBlock = view.lineBlockAtHeight(y)
        if (y >= view.contentHeight - 8) target = blocks.length
        else if (y > lineBlock.top + lineBlock.height / 2)
          target = Math.min(blocks.length, blockIndexAt(view.state, lineBlock.to) + 1)
        else target = blockIndexAt(view.state, lineBlock.from)
        const top = target < blocks.length ? view.lineBlockAt(blocks[target]!.from).top : view.contentHeight
        const offset = view.documentTop - view.scrollDOM.getBoundingClientRect().top + view.scrollDOM.scrollTop
        indicator.style.top = `${top + offset - 1}px`
      }
      const onUp = (e: MouseEvent) => {
        onMove(e)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        indicator.remove()
        if (target >= 0) moveBlockTo(view, index, target)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      return true
    },
  },
})

/** The Seed editing experience on top of {@link seedBlocks}: keys, live preview, menus, media. */
export function seedEditorExtensions(services: SeedEditorServices): Extension {
  return [
    seedServices.of(services),
    history(),
    EditorView.lineWrapping,
    focused,
    livePreview,
    dragHandle,
    EditorView.theme({
      '.cm-tooltip.cm-tooltip-autocomplete > ul': {fontFamily: 'system-ui, sans-serif', fontSize: '14px'},
    }),
    formatToolbar,
    pasteAndDrop,
    autocompletion({override: [mentionSource, slashSource], icons: false}),
    EditorView.inputHandler.of((view, from, _to, text) => {
      const spec = listShortcut(view.state, from, text)
      if (!spec) return false
      view.dispatch(spec)
      return true
    }),
    keymap.of([
      {key: 'Tab', run: indentBlock},
      {key: 'Shift-Tab', run: outdentBlock},
      {key: 'Enter', run: splitBlock},
      {key: 'Shift-Enter', run: insertLineBreak},
      {key: 'Backspace', run: backspaceBlock},
      {key: 'Alt-ArrowUp', run: moveBlock(-1)},
      {key: 'Alt-ArrowDown', run: moveBlock(1)},
      {key: 'Mod-b', run: toggleWrap('**')},
      {key: 'Mod-i', run: toggleWrap('*')},
      {key: 'Mod-u', run: toggleWrap('<u>', '</u>')},
      {key: 'Mod-Shift-x', run: toggleWrap('~~')},
      {key: 'Mod-e', run: toggleWrap('`')},
      ...historyKeymap,
      ...defaultKeymap,
    ]),
  ]
}
