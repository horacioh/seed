import {BUILTIN_METADATA_KEYS, HMMetadata, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {hmId, hypermediaUrlToHref, useUniversalAppContext} from '@shm/shared'
import {getContactMetadata, getDocumentTitle} from '@shm/shared/content'
import {useDocumentActions} from '@shm/shared/document-actions-context'
import {
  buildVariableLink,
  displayVariable,
  FORMULA_FUNCTIONS,
  parseVariableLink,
  type VariableDisplayResult,
  type VariableLink,
} from '@shm/shared/formulas'
import {useAccount, useResource, useResources} from '@shm/shared/models/entity'
import {useInlineMentions} from '@shm/shared/models/inline-mentions'
import {useRenderResourceStack} from '@shm/shared/render-resource-context'
import {unpackHmId} from '@shm/shared/utils/entity-id-url'
import {AccountIdentityName} from '@shm/ui/account-avatar'
import {useHighlighter} from '@shm/ui/highlight-context'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import Tippy from '@tippyjs/react'
import {forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes} from 'react'
import {Node} from '@tiptap/core'
import {NodeSelection, Plugin, TextSelection} from '@tiptap/pm/state'
import {NodeViewWrapper, ReactNodeViewRenderer} from '@tiptap/react'
import './inline-embed.css'

/** Fallback text used when serializing an inline embed to the clipboard. */
export function inlineEmbedClipboardText(link: string): string {
  return link || ''
}

/**
 * Typing `==` replaces the equals signs with an empty formula chip for the document
 * returned by `getDocId`, which opens its inline formula editor.
 */
export function createFormulaTriggerPlugin(getDocId: () => string | undefined) {
  return new Plugin({
    props: {
      handleTextInput(view, from, to, text) {
        if (text !== '=' || from !== to) return false
        const docId = getDocId()
        const node = view.state.schema.nodes['inline-embed']
        const {$from} = view.state.selection
        if (!docId || !node || $from.parent.type.spec.code || $from.marks().some((m) => m.type.name === 'code'))
          return false
        const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
        if (!/(?:^|[\s(])=$/.test(before)) return false
        const chip = node.create({link: buildVariableLink({docId, kind: 'formula', expr: ''})})
        const tr = view.state.tr.replaceWith(from - 1, to, [chip, view.state.schema.text(' ')])
        view.dispatch(tr.setSelection(TextSelection.create(tr.doc, from - 1 + chip.nodeSize + 1)).scrollIntoView())
        return true
      },
    },
  })
}

let pendingFormulaText: string | null = null

/** Pre-fills the inline editor of the next empty formula chip that mounts (e.g. text typed after `{{`). */
export function setPendingFormulaText(text: string) {
  pendingFormulaText = text
}

/** Creates the TipTap Node for rendering inline-embed mentions in the document. */
export function createInlineEmbedNode() {
  const InlineEmbedNode = Node.create({
    atom: true,
    name: 'inline-embed',
    group: 'inline',
    inline: true,
    addNodeView() {
      return ReactNodeViewRenderer(InlineEmbedNodeComponent)
    },
    renderHTML({node, HTMLAttributes}) {
      return [
        'a',
        {
          ...HTMLAttributes,
          href: HTMLAttributes.link,
          'data-inline-embed': HTMLAttributes.link,
          ...(node.attrs.mentionKind ? {'data-mention-kind': node.attrs.mentionKind} : {}),
        },
        inlineEmbedClipboardText(node.attrs.link),
      ]
    },
    renderText({node}) {
      return inlineEmbedClipboardText(node.attrs.link)
    },
    parseHTML() {
      return [
        {
          tag: `a[data-inline-embed]`,
          priority: 1000,
          getAttrs: (dom) => {
            if (dom instanceof HTMLElement) {
              const value = dom.getAttribute('data-inline-embed')
              if (!value || !unpackHmId(value)) return false
              const kind = dom.getAttribute('data-mention-kind')
              return {link: value, mentionKind: kind === 'account' || kind === 'document' ? kind : null}
            }
            return false
          },
        },
        {
          tag: `span[data-inline-embed]`,
          priority: 1000,
          getAttrs: (dom) => {
            if (dom instanceof HTMLElement) {
              const value = dom.getAttribute('data-inline-embed')
              if (!value || !unpackHmId(value)) return false
              const kind = dom.getAttribute('data-mention-kind')
              return {link: value, mentionKind: kind === 'account' || kind === 'document' ? kind : null}
            }
            return false
          },
        },
      ]
    },
    addAttributes() {
      return {
        mentionKind: {default: null, rendered: false},
        link: {
          default: '',
        },
      }
    },
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleKeyDown(view, event) {
              const sel = view.state.selection
              if (
                event.key === 'Enter' &&
                sel instanceof NodeSelection &&
                sel.node.type.name === 'inline-embed' &&
                parseVariableLink(sel.node.attrs.link)
              ) {
                const chip = (view.nodeDOM(sel.from) as HTMLElement | null)?.querySelector('[data-variable-chip]')
                chip?.dispatchEvent(new CustomEvent('hm-variable-edit'))
                return !!chip
              }
              if (view.state.selection.from === view.state.selection.to) {
                const resolved = view.state.doc.resolve(view.state.selection.from)
                if (
                  resolved.nodeBefore == null &&
                  resolved.nodeAfter?.type.name === 'inline-embed' &&
                  event.code === `Key${event.key.toUpperCase()}`
                ) {
                  view.dispatch(view.state.tr.insertText(event.key))
                  return true
                }
              }
              return false
            },
          },
        }),
      ]
    },
  })

  return InlineEmbedNode
}

function InlineEmbedNodeComponent(props: any) {
  const {hmUrlHref, origin, originHomeId} = useUniversalAppContext()
  const renderedHref =
    hypermediaUrlToHref(props.node.attrs.link, {
      hmUrlHref,
      origin,
      originHomeId,
    }) || props.node.attrs.link
  const isEditable = props.editor?.isEditable
  const variable = parseVariableLink(props.node.attrs.link)
  if (variable) {
    return (
      <NodeViewWrapper as="span" className="inline-embed-token" data-inline-embed={props.node.attrs.link}>
        {isEditable ? (
          <VariableEditor
            variable={variable}
            selected={props.selected}
            onChange={(next) => props.updateAttributes({link: buildVariableLink(next)})}
            onRemove={() => props.deleteNode()}
            onExit={(side) => {
              const pos = props.getPos()
              if (typeof pos === 'number')
                props.editor
                  .chain()
                  .focus()
                  .setTextSelection(side === 'after' ? pos + props.node.nodeSize : pos)
                  .run()
            }}
          />
        ) : (
          <VariableToken variable={variable} selected={props.selected} />
        )}
      </NodeViewWrapper>
    )
  }
  const wrapperProps = isEditable ? {} : {href: renderedHref}

  return (
    <NodeViewWrapper
      as={isEditable ? 'span' : 'a'}
      className={`inline-embed-token ${props.selected ? 'selected' : ''}`}
      data-inline-embed={props.node.attrs.link}
      data-mention-kind={props.node.attrs.mentionKind || undefined}
      {...wrapperProps}
    >
      <MentionToken
        value={props.node.attrs.link}
        mentionKind={props.node.attrs.mentionKind}
        selected={props.selected}
      />
    </NodeViewWrapper>
  )
}

/** Renders explicit mention identities while preserving legacy root-account references. */
export function MentionToken(props: {value: string; mentionKind?: 'account' | 'document'; selected?: boolean}) {
  const variable = parseVariableLink(props.value)
  if (variable) return <VariableToken variable={variable} selected={props.selected} />
  const unpackedRef = unpackHmId(props.value)
  const profileAccountUid = unpackedRef?.path?.[0] === ':profile' ? unpackedRef.path[1] || unpackedRef.uid : null

  if (unpackedRef && props.mentionKind === 'document') {
    return <DocumentMention unpackedRef={unpackedRef} {...props} />
  } else if (profileAccountUid) {
    return <ContactMention accountUid={profileAccountUid} highlightId={hmId(profileAccountUid)} {...props} />
  } else if (unpackedRef && unpackedRef.path && unpackedRef.path.length > 0) {
    return <DocumentMention unpackedRef={unpackedRef} {...props} />
  } else if (unpackedRef) {
    return <ContactMention accountUid={unpackedRef.uid} highlightId={unpackedRef} {...props} />
  } else {
    console.log('=== MENTION ERROR', props)
    return <MentionText>ERROR</MentionText>
  }
}

function DocumentMention({unpackedRef, selected}: {unpackedRef: UnpackedHypermediaId; selected?: boolean}) {
  const entity = useResource(unpackedRef, {subscribed: true})
  const actions = useDocumentActions()
  const highlight = useHighlighter()
  const draft = actions.getDraft?.(unpackedRef)
  const publishedTitle =
    entity.data && 'document' in entity.data && entity.data.document ? getDocumentTitle(entity.data.document) : null
  const resolved = draft?.metadata?.name ?? publishedTitle
  return (
    <MentionText selected={selected} {...highlight(unpackedRef)}>
      {resolved || unpackedRef.id}
    </MentionText>
  )
}

function ContactMention({
  accountUid,
  highlightId,
  selected,
}: {
  accountUid: string
  highlightId: UnpackedHypermediaId
  selected?: boolean
}) {
  const {contacts} = useUniversalAppContext()
  const highlight = useHighlighter()
  const entity = useAccount(accountUid, {subscribe: true})
  const meta = getContactMetadata(accountUid, entity.data?.metadata, contacts)

  return (
    <MentionText selected={selected} {...highlight(highlightId)}>
      <AccountIdentityName name={meta.name} mention />
    </MentionText>
  )
}

export function MentionText(props: any) {
  return (
    <SizableText
      weight="bold"
      className="mention-text link text-link hover:text-link-hover px-0.5 pb-0.5"
      style={{
        fontSize: 'inherit',
        fontFamily: 'inherit',
      }}
      {...props}
    >
      {props.children}
    </SizableText>
  )
}

/**
 * Evaluates a variable or formula against live document metadata (drafts first, then published), loading
 * cross-document references on demand.
 */
export function useVariableValue(variable: VariableLink): VariableDisplayResult {
  const [docIds, setDocIds] = useState<string[]>([variable.docId])
  const unpackedIds = useMemo(() => docIds.map((id) => unpackHmId(id)), [docIds.join(',')])
  const resources = useResources(unpackedIds, {subscribed: true})
  const actions = useDocumentActions()
  const metadataById = new Map<string, HMMetadata | null | undefined>()
  docIds.forEach((id, i) => {
    const resource = resources[i]
    const unpacked = unpackedIds[i]
    const draft = unpacked && !unpacked.version ? actions.getDraft?.(unpacked) : undefined
    const published =
      resource?.data && 'document' in resource.data && resource.data.document
        ? resource.data.document.metadata
        : undefined
    if (draft) metadataById.set(id, {...published, ...draft.metadata})
    else if (published) metadataById.set(id, published)
    else metadataById.set(id, resource?.isLoading ? undefined : null)
  })
  const result = displayVariable(variable, (id) => (metadataById.has(id) ? metadataById.get(id) : undefined))
  const missing = result.status === 'pending' ? result.missing.filter((id) => !docIds.includes(id)) : []
  useEffect(() => {
    if (missing.length) setDocIds((ids) => [...ids, ...missing.filter((id) => !ids.includes(id))])
  }, [missing.join(',')])
  return result
}

/** Short label describing what a variable computes, e.g. `price` or `=sum(price, tax)`. */
function variableSource(variable: VariableLink) {
  return variable.kind === 'attr' ? variable.key : `=${variable.expr}`
}

/** Read-only inline chip showing the computed value of an attribute or formula. */
export const VariableToken = forwardRef<
  HTMLSpanElement,
  {variable: VariableLink; selected?: boolean} & HTMLAttributes<HTMLSpanElement>
>(function VariableToken({variable, selected, ...rest}, ref) {
  const result = useVariableValue(variable)
  const label =
    result.status === 'ok'
      ? result.text
      : result.status === 'pending'
        ? '…'
        : variable.kind === 'formula' && !variable.expr.trim()
          ? 'formula'
          : '#ERR'
  return (
    <span
      ref={ref}
      {...rest}
      data-variable-kind={variable.kind}
      title={result.status === 'error' ? `${variableSource(variable)} — ${result.message}` : variableSource(variable)}
      className={cn(
        'inline-flex items-baseline gap-1 rounded-sm px-1',
        result.status === 'ok' && !result.numeric ? 'font-sans' : 'font-mono tabular-nums',
        result.status === 'error'
          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
          : 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
        selected && 'ring-2 ring-sky-500',
      )}
      style={{fontSize: '0.92em'}}
    >
      {variable.kind === 'formula' ? <span className="opacity-50">ƒ</span> : null}
      {label}
    </span>
  )
})

/** Turns committed formula text into a plain attribute link when it names a single attribute. */
function variableFromSource(source: string, homeDocId: string): VariableLink {
  const crossDocRef = /^\[\[(hm:\/\/[^\]]+)\]\]\.([A-Za-z_][\w.]*)$/.exec(source)
  if (crossDocRef) return {docId: crossDocRef[1]!, kind: 'attr', key: crossDocRef[2]!}
  if (/^[A-Za-z_][\w.]*$/.test(source)) return {docId: homeDocId, kind: 'attr', key: source}
  return {docId: homeDocId, kind: 'formula', expr: source}
}

/** Inserts a reference into the formula currently being edited, Excel-style, when another chip is clicked. */
let activeFormulaInsert: ((docId: string, key: string, title: string) => void) | null = null

/** Editable variable chip: clicking it (or Enter while selected) swaps it for an inline formula field. */
function VariableEditor({
  variable,
  selected,
  onChange,
  onRemove,
  onExit,
}: {
  variable: VariableLink
  selected?: boolean
  onChange: (next: VariableLink) => void
  onRemove: () => void
  onExit: (side: 'before' | 'after') => void
}) {
  const renderedDoc = [...useRenderResourceStack()].reverse().find((resource) => resource.kind === 'document')?.id
  const homeDocId = renderedDoc ? hmId(renderedDoc.uid, {path: renderedDoc.path}).id : variable.docId
  const [editing, setEditing] = useState(() => variable.kind === 'formula' && !variable.expr.trim())
  const chipRef = useRef<HTMLSpanElement>(null)
  const target = useResource(unpackHmId(variable.docId))
  const title =
    target.data && 'document' in target.data && target.data.document ? getDocumentTitle(target.data.document) : ''
  useEffect(() => {
    const el = chipRef.current
    if (!el) return
    const open = () => setEditing(true)
    // Native capture so ProseMirror doesn't steal focus from the formula being edited.
    const pointAndClick = (event: MouseEvent) => {
      if (!activeFormulaInsert || variable.kind !== 'attr') return
      event.preventDefault()
      event.stopPropagation()
      activeFormulaInsert(variable.docId, variable.key, title)
      el.addEventListener('click', (e) => e.stopImmediatePropagation(), {capture: true, once: true})
    }
    el.addEventListener('hm-variable-edit', open)
    el.addEventListener('mousedown', pointAndClick)
    return () => {
      el.removeEventListener('hm-variable-edit', open)
      el.removeEventListener('mousedown', pointAndClick)
    }
  }, [editing, variable, title])
  if (editing)
    return (
      <FormulaInput
        variable={variable}
        homeDocId={homeDocId}
        onCommit={(next, exit) => {
          if (!next) {
            if (exit) onExit('before')
            onRemove()
            return
          }
          setEditing(false)
          if (buildVariableLink(next) !== buildVariableLink(variable)) onChange(next)
          if (exit) onExit(exit)
        }}
        onCancel={() => {
          if (variable.kind === 'formula' && !variable.expr.trim()) {
            onExit('before')
            onRemove()
            return
          }
          setEditing(false)
          onExit('after')
        }}
      />
    )
  return (
    <VariableToken
      ref={chipRef}
      data-variable-chip=""
      variable={variable}
      selected={selected}
      onClick={() => setEditing(true)}
    />
  )
}

type FormulaSuggestion =
  | {kind: 'attr'; key: string; docId: string}
  | {kind: 'fn'; name: string}
  | {kind: 'doc'; id: string; title: string}
  | {kind: 'external'}

/**
 * Inline formula field styled like inline code. Shows a live result next to the text, autocompletes attribute
 * names, functions and other documents (`[[Title]].key`), and accepts point-and-click references.
 */
function FormulaInput({
  variable,
  homeDocId,
  onCommit,
  onCancel,
}: {
  variable: VariableLink
  homeDocId: string
  onCommit: (next: VariableLink | null, exit: 'before' | 'after' | null) => void
  onCancel: () => void
}) {
  const source =
    variable.kind === 'formula'
      ? variable.expr
      : variable.docId === homeDocId
        ? variable.key
        : `[[${variable.docId}]].${variable.key}`
  const refIds = useMemo(() => Array.from(source.matchAll(/\[\[(hm:\/\/[^\]]+)\]\]/g), (m) => m[1]!), [])
  const refResources = useResources(refIds.map((id) => unpackHmId(id)))
  const [pickedTitles, setPickedTitles] = useState<Map<string, string>>(() => new Map())
  const titles = new Map(pickedTitles)
  refIds.forEach((id, i) => {
    const data = refResources[i]?.data
    if (data && 'document' in data && data.document) titles.set(id, getDocumentTitle(data.document))
  })
  const idForTitle = (title: string) => {
    return Array.from(titles).find(([, t]) => t === title)?.[0] ?? null
  }
  const [value, setValue] = useState(() =>
    variable.kind === 'formula' && !variable.expr && pendingFormulaText !== null
      ? pendingFormulaText
      : source.replace(/\[\[(hm:\/\/[^\]]+)\]\]/g, (m, id) => (titles.has(id) ? `[[${titles.get(id)}]]` : m)),
  )
  useEffect(() => {
    pendingFormulaText = null
  }, [])
  const [caret, setCaret] = useState(value.length)
  const [highlight, setHighlight] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const done = useRef(false)
  const storage = value
    .replace(/\[\[([^\]]+)\]\]/g, (m, inner: string) => {
      if (inner.startsWith('hm://')) return m
      const id = idForTitle(inner)
      return id ? `[[${id}]]` : m
    })
    .trim()
    .replace(/^=/, '')
  const next = storage ? variableFromSource(storage, homeDocId) : null
  const preview = useVariableValue(next ?? {docId: homeDocId, kind: 'formula', expr: ''})

  const before = value.slice(0, caret)
  const docQuery = /\[\[([^\]]*)$/.exec(before)
  const docAttr = /\[\[([^\]]+)\]\]\.([\w.]*)$/.exec(before)
  const ident = /(?:^|[^\w.\]])([A-Za-z_]\w*)$/.exec(before)
  const docAttrId = docAttr ? (docAttr[1]!.startsWith('hm://') ? docAttr[1]! : idForTitle(docAttr[1]!)) : null
  const localAttrs = useDocumentAttributes(homeDocId, {numeric: true})
  const externalAttrs = useDocumentAttributes(docAttrId ?? '', {numeric: true})
  const home = unpackHmId(homeDocId)
  const {suggestions: docs} = useInlineMentions(docQuery?.[1] ?? '', {
    mode: 'document',
    enabled: !!docQuery,
    siteUid: home?.uid,
  })
  let items: FormulaSuggestion[] = []
  let replaceFrom = caret
  if (dismissed) items = []
  else if (docQuery) {
    replaceFrom = caret - docQuery[0].length
    items = docs
      .map((d) => ({kind: 'doc' as const, id: hmId(d.id.uid, {path: d.id.path}).id, title: d.title}))
      .filter((d) => d.id !== homeDocId)
      .slice(0, 6)
  } else if (docAttr && docAttrId) {
    const prefix = docAttr[2]!
    replaceFrom = caret - prefix.length
    items = externalAttrs
      .filter(([key]) => key.toLowerCase().startsWith(prefix.toLowerCase()) && key !== prefix)
      .map(([key]) => ({kind: 'attr', key, docId: docAttrId}))
  } else if (ident) {
    const q = ident[1]!.toLowerCase()
    replaceFrom = caret - q.length
    items = [
      ...localAttrs
        .filter(([key]) => key.toLowerCase().includes(q) && key !== ident[1])
        .map(([key]): FormulaSuggestion => ({kind: 'attr', key, docId: homeDocId})),
      ...Object.keys(FORMULA_FUNCTIONS)
        .filter((name) => name.startsWith(q))
        .map((name): FormulaSuggestion => ({kind: 'fn', name})),
    ]
  } else if (/(?:^|[\s(,+\-*/])$/.test(before)) {
    items = [
      ...localAttrs.map(([key]): FormulaSuggestion => ({kind: 'attr', key, docId: homeDocId})),
      {kind: 'external'},
    ]
  }
  const active = Math.min(highlight, items.length - 1)

  const setText = (text: string, nextCaret: number) => {
    setValue(text)
    setCaret(nextCaret)
    setHighlight(0)
    setDismissed(false)
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(nextCaret, nextCaret))
  }
  const pick = (item: FormulaSuggestion) => {
    const text =
      item.kind === 'attr'
        ? item.key
        : item.kind === 'fn'
          ? `${item.name}(`
          : item.kind === 'doc'
            ? `[[${item.title}]].`
            : '[['
    if (item.kind === 'doc') setPickedTitles((m) => new Map(m).set(item.id, item.title))
    setText(value.slice(0, replaceFrom) + text + value.slice(caret), replaceFrom + text.length)
  }
  const commit = (exit: 'before' | 'after' | null) => {
    if (done.current) return
    done.current = true
    onCommit(next, exit)
  }
  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])
  useEffect(() => {
    activeFormulaInsert = (docId, key, title) => {
      if (docId !== homeDocId) setPickedTitles((m) => new Map(m).set(docId, title))
      const term = docId === homeDocId ? key : `[[${title || docId}]].${key}`
      const head = value.slice(0, caret)
      const insert = /(?:^|[\s(,+\-*/])$/.test(head) ? term : ` + ${term}`
      setText(head + insert + value.slice(caret), caret + insert.length)
      inputRef.current?.focus()
    }
    return () => {
      activeFormulaInsert = null
    }
  })

  return (
    <span className="inline-flex items-baseline gap-1.5" contentEditable={false}>
      <Tippy
        visible={items.length > 0}
        interactive
        appendTo={() => document.body}
        placement="bottom-start"
        zIndex={100000}
        content={
          <div
            role="listbox"
            className="border-border bg-background flex w-64 flex-col rounded-md border p-1 shadow-lg"
            onMouseDown={(e) => e.preventDefault()}
          >
            {items.map((item, i) => (
              <button
                key={
                  item.kind === 'attr'
                    ? `${item.docId}${item.key}`
                    : item.kind === 'fn'
                      ? item.name
                      : item.kind === 'doc'
                        ? item.id
                        : 'external'
                }
                type="button"
                role="option"
                aria-selected={i === active}
                className={cn(
                  'flex items-baseline justify-between gap-3 rounded px-2 py-1 text-left text-sm',
                  i === active ? 'bg-accent' : 'hover:bg-accent/60',
                )}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(item)}
              >
                {item.kind === 'attr' ? (
                  <>
                    <span className="truncate font-mono">{item.key}</span>
                    <AttributeValue docId={item.docId} attrKey={item.key} />
                  </>
                ) : item.kind === 'fn' ? (
                  <>
                    <span className="font-mono">{item.name}(…)</span>
                    <span className="text-muted-foreground text-xs">function</span>
                  </>
                ) : item.kind === 'doc' ? (
                  <span className="truncate">{item.title}</span>
                ) : (
                  <span className="text-muted-foreground">Attribute from another document…</span>
                )}
              </button>
            ))}
          </div>
        }
      >
        <span
          className="bg-muted inline-flex items-baseline rounded-sm px-1 font-mono ring-2 ring-sky-500/50"
          style={{fontSize: '0.92em'}}
        >
          <span className="opacity-50">=</span>
          <input
            ref={inputRef}
            aria-label="Formula"
            className="bg-transparent outline-none"
            style={{width: `${Math.max(value.length, 10) + 1}ch`}}
            placeholder="price + tax"
            value={value}
            onChange={(e) => setText(e.target.value, e.target.selectionStart ?? e.target.value.length)}
            onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
            onBlur={() => commit(null)}
            onKeyDown={(e) => {
              e.stopPropagation()
              const input = e.currentTarget
              const collapsed = input.selectionStart === input.selectionEnd
              if (items.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault()
                setHighlight((active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length)
              } else if (items.length && (e.key === 'Enter' || e.key === 'Tab')) {
                e.preventDefault()
                pick(items[active]!)
              } else if (e.key === 'Escape') {
                e.preventDefault()
                if (items.length && value.trim()) setDismissed(true)
                else {
                  done.current = true
                  onCancel()
                }
              } else if (e.key === 'Enter') {
                e.preventDefault()
                commit('after')
              } else if (e.key === 'ArrowRight' && collapsed && input.selectionStart === value.length) {
                e.preventDefault()
                commit('after')
              } else if (e.key === 'ArrowLeft' && collapsed && input.selectionStart === 0) {
                e.preventDefault()
                commit('before')
              }
            }}
          />
        </span>
      </Tippy>
      {storage ? (
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            preview.status === 'error' ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground',
          )}
        >
          {preview.status === 'ok' ? `= ${preview.text}` : preview.status === 'pending' ? '…' : preview.message}
        </span>
      ) : null}
    </span>
  )
}

/** Live value of an attribute, shown next to it in autocomplete lists. */
export function AttributeValue({docId, attrKey}: {docId: string; attrKey: string}) {
  const result = useVariableValue({docId, kind: 'attr', key: attrKey})
  return (
    <span className="text-muted-foreground max-w-40 shrink-0 truncate font-mono text-xs tabular-nums">
      {result.status === 'ok' ? result.text : result.status === 'pending' ? '…' : '#ERR'}
    </span>
  )
}

/** Custom (non built-in) attributes of a document with a value; `numeric` keeps only numbers and formulas. */
export function useDocumentAttributes(docId: string, {numeric = false}: {numeric?: boolean} = {}): [string, unknown][] {
  const unpacked = docId ? unpackHmId(docId) : null
  const resource = useResource(unpacked, {subscribed: true})
  const actions = useDocumentActions()
  const draft = unpacked && !unpacked.version ? actions.getDraft?.(unpacked) : undefined
  const published =
    resource.data && 'document' in resource.data && resource.data.document ? resource.data.document.metadata : {}
  const metadata: Record<string, unknown> = {...published, ...draft?.metadata}
  return Object.entries(metadata).filter(([key, value]) => {
    if (BUILTIN_METADATA_KEYS.has(key) || key.endsWith('ttributesSchema') || value === null || value === undefined)
      return false
    if (typeof value === 'number') return true
    if (typeof value !== 'string') return !numeric
    const trimmed = value.trim()
    if (!trimmed) return false
    return !numeric || trimmed.startsWith('=') || !isNaN(Number(trimmed))
  })
}
