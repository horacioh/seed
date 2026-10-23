import {setBlockType, toggleMark} from 'prosemirror-commands'
import type {MarkType, Node as PMNode} from 'prosemirror-model'
import {type Command, NodeSelection, TextSelection} from 'prosemirror-state'
import type {EditorView} from 'prosemirror-view'
import {type CSSProperties, type MutableRefObject, type ReactNode, useEffect, useRef, useState} from 'react'
import {duplicateBlock, replaceBlockContent, setChildrenType} from '../commands'
import {insertAtomBlock} from '../media'
import {type SuggestKeyHandler, type SuggestMatch, suggestPluginKey} from '../suggest'
import {useEditorView} from './SeedProseMirrorEditor'
import {useSeedServices} from './services'

type MenuItem = {key: string; label: string; subtitle?: string; run: () => void}

/** Position of document pos `pos` relative to the editor container, for popovers. */
function anchorAt(view: EditorView, pos: number, above = false): CSSProperties {
  const box = view.dom.parentElement!.getBoundingClientRect()
  const c = view.coordsAtPos(pos)
  return above
    ? {left: c.left - box.left, top: c.top - box.top - 40}
    : {left: c.left - box.left, top: c.bottom - box.top + 4}
}

/** Remove the trigger text (`@foo`, `[[foo`, `/foo`) and run `command` on the result. */
function runAfterTrigger(view: EditorView, match: SuggestMatch, command: Command) {
  view.dispatch(view.state.tr.delete(match.from, match.to))
  command(view.state, view.dispatch, view)
  view.focus()
}

function slashItems(view: EditorView, match: SuggestMatch): MenuItem[] {
  const ask = (label: string) => window.prompt(label)?.trim()
  const block = (key: string, label: string, make: (s: EditorView['state']['schema']) => PMNode): MenuItem => ({
    key,
    label,
    run: () => runAfterTrigger(view, match, replaceBlockContent(make)),
  })
  const atom = (key: string, label: string, make: (s: EditorView['state']['schema']) => PMNode | null): MenuItem => ({
    key,
    label,
    run: () =>
      runAfterTrigger(view, match, (state, dispatch) => {
        const node = make(state.schema)
        if (node) dispatch?.(insertAtomBlock(state, node).scrollIntoView())
        return true
      }),
  })
  const children = (key: string, label: string, type: 'Unordered' | 'Ordered' | 'Blockquote'): MenuItem => ({
    key,
    label,
    run: () => runAfterTrigger(view, match, setChildrenType(type)),
  })
  const embed = (view: 'Content' | 'Card') => (s: EditorView['state']['schema']) => {
    const link = ask('hm:// link to embed')
    return link ? s.nodes.hmEmbed!.create({link, attributes: {view}}) : null
  }
  return [
    block('paragraph', 'Paragraph', (s) => s.nodes.paragraph!.create()),
    block('heading', 'Heading', (s) => s.nodes.heading!.create()),
    block('code', 'Code block', (s) => s.nodes.codeBlock!.create()),
    block('math', 'Math', (s) => s.nodes.hmMath!.create()),
    children('bullets', 'Bulleted children', 'Unordered'),
    children('numbers', 'Numbered children', 'Ordered'),
    children('quote', 'Quoted children', 'Blockquote'),
    atom('image', 'Image', (s) => s.nodes.hmImage!.create()),
    atom('video', 'Video', (s) => s.nodes.hmVideo!.create()),
    atom('embed', 'Embed (Content)', embed('Content')),
    atom('card', 'Embed (Card)', embed('Card')),
    atom('button', 'Button', (s) => {
      const link = ask('Button link')
      return link ? s.nodes.hmButton!.create({link, text: 'Button'}) : null
    }),
    atom('web', 'Web embed', (s) => {
      const link = ask('URL to embed')
      return link ? s.nodes.hmWebEmbed!.create({link}) : null
    }),
  ].filter((item) => item.label.toLowerCase().includes(match.query.toLowerCase()))
}

/** The `@` / `[[` mention menus and the `/` slash menu, driven by the suggest plugin. */
function SuggestMenu({suggestKeys}: {suggestKeys: MutableRefObject<SuggestKeyHandler | null>}) {
  const {view, state} = useEditorView()
  const services = useSeedServices()
  const match = state ? suggestPluginKey.getState(state) : null
  const [mentions, setMentions] = useState<MenuItem[]>([])
  const [active, setActive] = useState(0)
  const kind = match?.kind
  const query = match?.query
  useEffect(() => setActive(0), [kind, query])
  useEffect(() => {
    if (!view || (kind !== 'account' && kind !== 'document')) return setMentions([])
    const controller = new AbortController()
    const timer = setTimeout(() => {
      services
        .searchMentions(query ?? '', kind, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) return
          setMentions(
            results.slice(0, 8).map((item) => ({
              key: item.link,
              label: item.title,
              subtitle: item.subtitle,
              run: () => {
                const m = suggestPluginKey.getState(view.state)
                if (!m) return
                runAfterTrigger(view, m, (s, dispatch) => {
                  const node = s.schema.nodes.hmMention!.create({link: item.link, mentionKind: kind})
                  dispatch?.(s.tr.replaceSelectionWith(node, false).insertText(' '))
                  return true
                })
              },
            })),
          )
        })
        .catch((e) => !controller.signal.aborted && console.error('mention search failed', e))
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [view, kind, query, services])
  const items = !view || !match ? [] : match.kind === 'slash' ? slashItems(view, match) : mentions
  const latest = useRef({items, active})
  latest.current = {items, active}
  useEffect(() => {
    suggestKeys.current = (event) => {
      const {items, active} = latest.current
      if (!items.length) return false
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const step = event.key === 'ArrowDown' ? 1 : -1
        setActive((active + step + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        items[active]?.run()
        return true
      }
      return false
    }
    return () => {
      suggestKeys.current = null
    }
  }, [suggestKeys])
  if (!view || !match) return null
  const testId = match.kind === 'slash' ? 'slash-menu' : `mention-menu-${match.kind}`
  const empty =
    match.kind === 'slash' ? 'No commands' : match.kind === 'account' ? 'Search accounts…' : 'Search documents…'
  return (
    <div className="seed-popover seed-suggest" style={anchorAt(view, match.from)} data-testid={testId} role="listbox">
      {items.length ? (
        items.map((item, i) => (
          <div
            key={item.key}
            className="seed-suggest-item"
            role="option"
            aria-selected={i === active}
            data-highlighted={i === active || undefined}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => {
              e.preventDefault()
              item.run()
            }}
          >
            <span>{item.label}</span>
            {item.subtitle ? <small>{item.subtitle}</small> : null}
          </div>
        ))
      ) : (
        <div className="seed-suggest-empty">{empty}</div>
      )}
    </div>
  )
}

function markActive(state: EditorView['state'], type: MarkType) {
  const {from, to, empty, $from} = state.selection
  return empty ? Boolean(type.isInSet(state.storedMarks || $from.marks())) : state.doc.rangeHasMark(from, to, type)
}

/** Bold/italic/underline/strike/code/link toolbar over a non-empty text selection. */
function FormattingToolbar() {
  const {view, state} = useEditorView()
  if (!view || !state || !view.hasFocus()) return null
  const sel = state.selection
  if (!(sel instanceof TextSelection) || sel.empty || sel.$from.parent.type.spec.code) return null
  const {marks} = state.schema
  const buttons: Array<[string, string, MarkType]> = [
    ['B', 'bold', marks.bold!],
    ['I', 'italic', marks.italic!],
    ['U', 'underline', marks.underline!],
    ['S', 'strike', marks.strike!],
    ['</>', 'code', marks.code!],
  ]
  const toggleLink = () => {
    if (markActive(state, marks.link!)) {
      view.dispatch(state.tr.removeMark(sel.from, sel.to, marks.link!))
      return
    }
    const href = window.prompt('Link URL')?.trim()
    if (href) view.dispatch(view.state.tr.addMark(sel.from, sel.to, marks.link!.create({href})))
  }
  return (
    <div className="seed-popover seed-toolbar" style={anchorAt(view, sel.from, true)} data-testid="formatting-toolbar">
      {buttons.map(([label, name, type]) => (
        <button
          key={name}
          type="button"
          data-mark={name}
          data-active={markActive(state, type) || undefined}
          onMouseDown={(e) => {
            e.preventDefault()
            toggleMark(type)(view.state, view.dispatch)
          }}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        data-mark="link"
        data-active={markActive(state, marks.link!) || undefined}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleLink()
        }}
      >
        Link
      </button>
      <button
        type="button"
        data-block="heading"
        onMouseDown={(e) => {
          e.preventDefault()
          const type =
            sel.$from.parent.type.name === 'heading' ? state.schema.nodes.paragraph! : state.schema.nodes.heading!
          setBlockType(type)(view.state, view.dispatch)
        }}
      >
        H
      </button>
    </div>
  )
}

/** Hover handle left of each block: `+` adds a block below and opens the slash menu, `⋮⋮` drags it. */
function BlockHandle() {
  const {view} = useEditorView()
  const [target, setTarget] = useState<{el: HTMLElement; pos: number} | null>(null)
  useEffect(() => {
    if (!view) return
    const onMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.('.seed-block') as HTMLElement | null
      if (!el || !view.dom.contains(el)) return
      const pos = view.posAtDOM(el, 0) - 1
      if (view.state.doc.nodeAt(pos)?.type.name === 'blockNode') setTarget({el, pos})
    }
    view.dom.addEventListener('mousemove', onMove)
    return () => view.dom.removeEventListener('mousemove', onMove)
  }, [view])
  if (!view || !target || !target.el.isConnected) return null
  const box = view.dom.parentElement!.getBoundingClientRect()
  const rect = target.el.getBoundingClientRect()
  const addBelow = () => {
    const node = view.state.doc.nodeAt(target.pos)
    if (!node) return
    const after = target.pos + node.nodeSize
    const tr = view.state.tr.insert(after, view.state.schema.nodes.blockNode!.createAndFill()!)
    view.dispatch(tr.setSelection(TextSelection.create(tr.doc, after + 2)).insertText('/'))
    view.focus()
  }
  return (
    <div className="seed-block-handle" style={{top: rect.top - box.top, left: 0}} data-testid="block-handle">
      <button type="button" title="Add block" onMouseDown={(e) => e.preventDefault()} onClick={addBelow}>
        +
      </button>
      <span
        title="Drag to move"
        draggable
        className="seed-drag"
        onDragStart={(e) => {
          const sel = NodeSelection.create(view.state.doc, target.pos)
          view.dispatch(view.state.tr.setSelection(sel))
          const slice = sel.content()
          const {dom, text} = view.serializeForClipboard(slice)
          e.dataTransfer.clearData()
          e.dataTransfer.setData('text/html', dom.innerHTML)
          e.dataTransfer.setData('text/plain', text)
          e.dataTransfer.effectAllowed = 'copyMove'
          e.dataTransfer.setDragImage(target.el, 0, 0)
          view.dragging = {slice, move: true}
        }}
      >
        ⋮⋮
      </span>
      <button
        type="button"
        title="Duplicate block"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const tr = view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(target.pos + 2)))
          view.dispatch(tr)
          duplicateBlock(view.state, view.dispatch)
        }}
      >
        ⧉
      </button>
    </div>
  )
}

/** All Seed editor overlays: suggestion menus, formatting toolbar and block handle. */
export function SeedEditorMenus({suggestKeys}: {suggestKeys: MutableRefObject<SuggestKeyHandler | null>}): ReactNode {
  return (
    <>
      <SuggestMenu suggestKeys={suggestKeys} />
      <FormattingToolbar />
      <BlockHandle />
    </>
  )
}
