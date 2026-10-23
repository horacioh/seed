import {buildVariableLink} from '@shm/shared/formulas'
import {useInlineMentions} from '@shm/shared/models/inline-mentions'
import {hmId, unpackHmId} from '@shm/shared/utils/entity-id-url'
import {cn} from '@shm/ui/utils'
import Tippy from '@tippyjs/react'
import {ChevronLeft, FileText, Sigma} from 'lucide-react'
import {EditorState, Plugin, PluginKey, TextSelection} from 'prosemirror-state'
import {useEffect, useReducer, useState} from 'react'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import {AttributeValue, setPendingFormulaText, useNumberAttributes} from './mentions-plugin'

/** Position of the last dismissed `{{` so Escape keeps that menu closed while typing on. */
export const attributeMenuPluginKey = new PluginKey<number | null>('AttributeMenu')

/** Range covered by an open `{{query`: `from` is the first brace, the query spans `queryStart`..`to`. */
export type AttributeMenuRange = {from: number; queryStart: number; to: number}

/** Returns the `{{query` range before the cursor, or null when the attribute menu should be closed. */
export function getAttributeMenuRange(state: EditorState): AttributeMenuRange | null {
  const {selection} = state
  if (!selection.empty) return null
  const {$from} = selection
  if ($from.parent.type.spec.code || $from.marks().some((m) => m.type.name === 'code')) return null
  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
  const match = /(?:^|[\s(])\{\{([^{}\n\ufffc]*)$/.exec(before)
  if (!match) return null
  const from = $from.pos - match[1]!.length - 2
  if (attributeMenuPluginKey.getState(state) === from) return null
  return {from, queryStart: from + 2, to: $from.pos}
}

/** Keys the attribute menu handles while it is open. */
export type AttributeMenuKey = 'ArrowUp' | 'ArrowDown' | 'Enter' | 'Tab' | 'Backspace' | 'Escape'

/** Creates the `{{` plugin and the controller the React menu uses to receive navigation keys. */
export function createAttributeMenuPlugin() {
  const controller: {onKey: ((key: AttributeMenuKey) => boolean) | null} = {onKey: null}
  const plugin = new Plugin<number | null>({
    key: attributeMenuPluginKey,
    state: {
      init: () => null,
      apply(tr, dismissed) {
        const meta = tr.getMeta(attributeMenuPluginKey)
        if (meta !== undefined) return meta
        if (dismissed === null) return null
        const mapped = tr.mapping.mapResult(dismissed)
        return mapped.deleted ? null : mapped.pos
      },
    },
    props: {
      handleKeyDown(view, event) {
        const range = getAttributeMenuRange(view.state)
        if (!range) return false
        if (event.key === 'Escape') {
          view.dispatch(view.state.tr.setMeta(attributeMenuPluginKey, range.from))
          return true
        }
        if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Backspace'].includes(event.key))
          return controller.onKey?.(event.key as AttributeMenuKey) ?? false
        return false
      },
    },
  })
  return {plugin, controller}
}

type MenuItem =
  | {kind: 'attr'; docId: string; key: string}
  | {kind: 'formula'}
  | {kind: 'external'}
  | {kind: 'doc'; id: string; title: string}

/** Autocomplete opened by `{{`: this document's attributes, a new formula, or attributes from another document. */
export function AttributeMenu({
  editor,
  controller,
  docId,
}: {
  editor: BlockNoteEditor<any>
  controller: ReturnType<typeof createAttributeMenuPlugin>['controller']
  docId: string
}) {
  const tiptap = editor._tiptapEditor
  const [, rerender] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    tiptap.on('transaction', rerender)
    return () => {
      tiptap.off('transaction', rerender)
    }
  }, [tiptap])
  const range = tiptap.view ? getAttributeMenuRange(tiptap.state) : null
  const query = range ? tiptap.state.doc.textBetween(range.queryStart, range.to) : ''
  const [step, setStep] = useState<'local' | 'docs' | {id: string; title: string}>('local')
  const [highlight, setHighlight] = useState(0)
  useEffect(() => {
    if (!range) setStep('local')
    setHighlight(0)
  }, [!!range, query, step])
  const localAttrs = useNumberAttributes(docId)
  const pickedAttrs = useNumberAttributes(typeof step === 'object' ? step.id : '')
  const {suggestions: docs, isFetching} = useInlineMentions(query, {
    mode: 'document',
    enabled: !!range && step === 'docs',
    siteUid: unpackHmId(docId)?.uid,
  })
  const q = query.trim().toLowerCase()
  const items: MenuItem[] =
    step === 'local'
      ? [
          ...localAttrs
            .filter(([key]) => key.toLowerCase().includes(q))
            .map(([key]): MenuItem => ({kind: 'attr', docId, key})),
          {kind: 'formula'},
          {kind: 'external'},
        ]
      : step === 'docs'
        ? docs
            .map((d): MenuItem => ({kind: 'doc', id: hmId(d.id.uid, {path: d.id.path}).id, title: d.title}))
            .filter((d) => d.kind === 'doc' && d.id !== docId)
            .slice(0, 8)
        : pickedAttrs
            .filter(([key]) => key.toLowerCase().includes(q))
            .map(([key]): MenuItem => ({kind: 'attr', docId: step.id, key}))
  const active = Math.min(highlight, items.length - 1)

  const replaceRange = (link: string) => {
    if (!range) return
    const {view} = tiptap
    const node = view.state.schema.nodes['inline-embed']!.create({link})
    const tr = view.state.tr.replaceWith(range.from, range.to, [node, view.state.schema.text(' ')])
    view.dispatch(tr.setSelection(TextSelection.create(tr.doc, range.from + node.nodeSize + 1)).scrollIntoView())
  }
  const clearQuery = () => {
    if (range && range.to > range.queryStart) tiptap.view.dispatch(tiptap.state.tr.delete(range.queryStart, range.to))
    tiptap.view.focus()
  }
  const select = (item: MenuItem) => {
    if (item.kind === 'attr') replaceRange(buildVariableLink({docId: item.docId, kind: 'attr', key: item.key}))
    else if (item.kind === 'formula') {
      setPendingFormulaText(query.trim().replace(/^=/, ''))
      replaceRange(buildVariableLink({docId, kind: 'formula', expr: ''}))
    } else if (item.kind === 'external') {
      setStep('docs')
      clearQuery()
    } else {
      setStep({id: item.id, title: item.title})
      clearQuery()
    }
  }
  const back = () => {
    setStep(step === 'docs' ? 'local' : 'docs')
    clearQuery()
  }
  useEffect(() => {
    controller.onKey = (key) => {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        if (items.length) setHighlight((active + (key === 'ArrowDown' ? 1 : items.length - 1)) % items.length)
        return true
      }
      if (key === 'Enter' || key === 'Tab') {
        if (items[active]) select(items[active]!)
        return true
      }
      if (key === 'Backspace' && step !== 'local' && !query) {
        back()
        return true
      }
      return false
    }
    return () => {
      controller.onKey = null
    }
  })

  const rect = range ? tiptap.view.coordsAtPos(range.from) : null
  const header =
    step === 'local' ? null : (
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 text-xs font-medium"
        onClick={back}
      >
        <ChevronLeft size={14} />
        <span className="truncate">{step === 'docs' ? 'Choose a document' : step.title}</span>
      </button>
    )
  const empty =
    step === 'docs'
      ? isFetching
        ? 'Searching…'
        : 'No documents found'
      : typeof step === 'object'
        ? 'No number attributes in this document'
        : null
  return (
    <Tippy
      visible={!!range}
      interactive
      appendTo={() => document.body}
      placement="bottom-start"
      zIndex={100000}
      getReferenceClientRect={() =>
        rect ? new DOMRect(rect.left, rect.top, 0, rect.bottom - rect.top) : editor.domElement.getBoundingClientRect()
      }
      content={
        <div
          role="listbox"
          aria-label="Attributes"
          className="border-border bg-background flex max-h-72 w-72 flex-col overflow-y-auto rounded-md border p-1 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {header}
          {step === 'local' && !localAttrs.length ? (
            <p className="text-muted-foreground px-2 py-1 text-xs">Add number attributes in the Attributes tab</p>
          ) : null}
          {items.map((item, i) => (
            <button
              key={item.kind === 'attr' ? item.key : item.kind === 'doc' ? item.id : item.kind}
              type="button"
              role="option"
              aria-selected={i === active}
              className={cn(
                'flex items-center justify-between gap-3 rounded px-2 py-1.5 text-left text-sm',
                i === active ? 'bg-accent' : 'hover:bg-accent/60',
                item.kind === 'formula' && 'border-border mt-1 border-t',
              )}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => select(item)}
            >
              {item.kind === 'attr' ? (
                <>
                  <span className="truncate font-mono">{item.key}</span>
                  <AttributeValue docId={item.docId} attrKey={item.key} />
                </>
              ) : item.kind === 'formula' ? (
                <>
                  <span className="flex min-w-0 items-center gap-2">
                    <Sigma size={14} className="shrink-0" />
                    <span className="truncate">{q ? `Formula: ${query.trim().replace(/^=/, '')}` : 'New formula'}</span>
                  </span>
                  <kbd className="text-muted-foreground font-mono text-xs">==</kbd>
                </>
              ) : item.kind === 'external' ? (
                <span className="flex items-center gap-2">
                  <FileText size={14} />
                  External attributes…
                </span>
              ) : (
                <span className="truncate">{item.title}</span>
              )}
            </button>
          ))}
          {!items.length && empty ? <p className="text-muted-foreground px-2 py-1 text-xs">{empty}</p> : null}
        </div>
      }
    />
  )
}
