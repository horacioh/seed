import {type Editor, Extension, type Range} from '@tiptap/core'
import {NodeSelection, PluginKey} from '@tiptap/pm/state'
import {useEditorState} from '@tiptap/react'
import {BubbleMenu} from '@tiptap/react/menus'
import Suggestion from '@tiptap/suggestion'
import {type ReactNode, useEffect, useRef, useState, useSyncExternalStore} from 'react'
import {blockDepth, replaceBlockContent, setChildrenType} from '../commands'
import type {MentionItem, SeedEditorServices} from './services'

type MenuState<I> = {open: boolean; items: I[]; index: number; rect: DOMRect | null; pick: ((item: I) => void) | null}

/** A tiny external store bridging a Tiptap `Suggestion` plugin and the React popup that renders it. */
class MenuStore<I> {
  state: MenuState<I> = {open: false, items: [], index: 0, rect: null, pick: null}
  private listeners = new Set<() => void>()
  set(next: Partial<MenuState<I>>) {
    this.state = {...this.state, ...next}
    this.listeners.forEach((l) => l())
  }
  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }
  get = () => this.state
}

type SuggestionMenu<I> = {extension: Extension; store: MenuStore<I>}

function suggestionMenu<I>(
  name: string,
  options: {
    char: string
    allowSpaces?: boolean
    debounce?: number
    items: (query: string, editor: Editor) => I[] | Promise<I[]>
    pick: (editor: Editor, range: Range, item: I) => void
  },
): SuggestionMenu<I> {
  const store = new MenuStore<I>()
  const extension = Extension.create({
    name,
    // Above `SeedStructure` so an open menu gets Enter/Tab/arrows before the block keymap.
    priority: 1100,
    addProseMirrorPlugins() {
      return [
        Suggestion<I, I>({
          editor: this.editor,
          pluginKey: new PluginKey(name),
          char: options.char,
          allowSpaces: options.allowSpaces ?? false,
          debounce: options.debounce,
          items: ({query, editor}) => options.items(query, editor),
          command: ({editor, range, props}) => options.pick(editor, range, props),
          render: () => {
            const show = (p: {items: I[]; command: (item: I) => void; clientRect?: (() => DOMRect | null) | null}) =>
              store.set({open: true, items: p.items, index: 0, rect: p.clientRect?.() ?? null, pick: p.command})
            return {
              onStart: show,
              onUpdate: show,
              onExit: () => store.set({open: false, items: []}),
              onKeyDown: ({event}) => {
                const {open, items, index, pick} = store.state
                if (!open) return false
                if (event.key === 'Escape') return store.set({open: false}), true
                if (!items.length) return false
                if (event.key === 'ArrowDown') return store.set({index: (index + 1) % items.length}), true
                if (event.key === 'ArrowUp') return store.set({index: (index + items.length - 1) % items.length}), true
                if (event.key === 'Enter' || event.key === 'Tab') return pick?.(items[index]!), true
                return false
              },
            }
          },
        }),
      ]
    },
  })
  return {extension, store}
}

function SuggestionPopup<I>({
  menu,
  testId,
  empty,
  label,
}: {
  menu: SuggestionMenu<I>
  testId: string
  empty: string
  label: (item: I) => ReactNode
}) {
  const {open, items, index, rect, pick} = useSyncExternalStore(menu.store.subscribe, menu.store.get)
  if (!open || !rect) return null
  return (
    <div
      className="seed-popup seed-suggestions"
      data-testid={testId}
      style={{position: 'fixed', left: rect.left, top: rect.bottom + 4}}
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.length ? (
        items.map((item, i) => (
          <button key={i} type="button" data-highlighted={i === index || undefined} onClick={() => pick?.(item)}>
            {label(item)}
          </button>
        ))
      ) : (
        <div className="seed-popup-empty">{empty}</div>
      )}
    </div>
  )
}

function mentionMenu(kind: 'account' | 'document', services: {current: SeedEditorServices}) {
  let controller: AbortController | undefined
  return suggestionMenu<MentionItem>(`seed-mention-${kind}`, {
    char: kind === 'account' ? '@' : '[[',
    allowSpaces: kind === 'document',
    debounce: 150,
    items: async (query) => {
      controller?.abort()
      controller = new AbortController()
      const signal = controller.signal
      try {
        return (await services.current.searchMentions(query, kind, signal)).slice(0, 8)
      } catch (e) {
        if (!signal.aborted) console.error('mention search failed', e)
        return []
      }
    },
    pick: (editor, range, item) =>
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {type: 'hmMention', attrs: {link: item.link, mentionKind: kind}},
          {type: 'text', text: ' '},
        ])
        .run(),
  })
}

type SlashItem = {label: string; run: (editor: Editor) => void}

const askLink = (label: string) => window.prompt(label)?.trim()
const setContent = (editor: Editor, type: string, attrs?: Record<string, unknown>) =>
  replaceBlockContent((s) => s.nodes[type]!.create(attrs))(editor.state, editor.view.dispatch)

const SLASH_ITEMS: SlashItem[] = [
  {label: 'Paragraph', run: (e) => setContent(e, 'paragraph')},
  {label: 'Heading', run: (e) => setContent(e, 'heading')},
  {label: 'Code block', run: (e) => setContent(e, 'codeBlock')},
  {label: 'Math', run: (e) => setContent(e, 'hmMath')},
  {label: 'Image', run: (e) => setContent(e, 'hmImage')},
  {label: 'Video', run: (e) => setContent(e, 'hmVideo')},
  {label: 'Bulleted children', run: (e) => setChildrenType('Unordered')(e.state, e.view.dispatch)},
  {label: 'Numbered children', run: (e) => setChildrenType('Ordered')(e.state, e.view.dispatch)},
  {label: 'Quoted children', run: (e) => setChildrenType('Blockquote')(e.state, e.view.dispatch)},
  ...['Content', 'Card'].map((view) => ({
    label: `Embed (${view})`,
    run: (e: Editor) => {
      const link = askLink('hm:// link to embed')
      if (link) setContent(e, 'hmEmbed', {link, attributes: {view}})
    },
  })),
  {
    label: 'Button',
    run: (e) => {
      const link = askLink('Button link')
      if (link) setContent(e, 'hmButton', {link, text: 'Button'})
    },
  },
]

const slashMenu = () =>
  suggestionMenu<SlashItem>('seed-slash', {
    char: '/',
    items: (query) => SLASH_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
    pick: (editor, range, item) => {
      editor.chain().focus().deleteRange(range).run()
      item.run(editor)
    },
  })

/** Suggestion-driven menus (`@`, `[[`, `/`): plugins for the editor plus their React popups. */
export function createSeedMenus(services: {current: SeedEditorServices}) {
  const account = mentionMenu('account', services)
  const document = mentionMenu('document', services)
  const slash = slashMenu()
  const mentionLabel = (item: MentionItem) => (
    <>
      <span>{item.title}</span>
      {item.subtitle ? <small>{item.subtitle}</small> : null}
    </>
  )
  return {
    extensions: [account.extension, document.extension, slash.extension],
    Popups: () => (
      <>
        <SuggestionPopup menu={account} testId="mention-menu-account" empty="Search accounts…" label={mentionLabel} />
        <SuggestionPopup
          menu={document}
          testId="mention-menu-document"
          empty="Search documents…"
          label={mentionLabel}
        />
        <SuggestionPopup menu={slash} testId="slash-menu" empty="No commands" label={(i) => i.label} />
      </>
    ),
  }
}

/**
 * Hover handle for the innermost block under the pointer: `+` adds a block
 * below and opens the slash menu, `⋮⋮` drags the whole block (with its
 * children) using ProseMirror's own drag-and-drop.
 */
export function BlockHandle({editor}: {editor: Editor}) {
  const [target, setTarget] = useState<{el: HTMLElement; top: number} | null>(null)
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = container.current?.parentElement
    if (!root) return
    const onMove = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.seed-block-handle')) return
      const el = (e.target as HTMLElement).closest<HTMLElement>('.seed-block')
      if (!el || !editor.view.dom.contains(el)) return
      setTarget({el, top: el.getBoundingClientRect().top - root.getBoundingClientRect().top})
    }
    const onLeave = () => setTarget(null)
    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
    }
  }, [editor])
  const blockPos = () => (target ? editor.view.posAtDOM(target.el, 0) - 1 : -1)
  const add = () => {
    const pos = blockPos()
    const node = pos >= 0 ? editor.state.doc.nodeAt(pos) : null
    if (!node) return
    const {schema} = editor.state
    const end = pos + node.nodeSize
    editor
      .chain()
      .insertContentAt(end, schema.nodes.blockNode!.create(null, schema.nodes.paragraph!.create()).toJSON())
      .setTextSelection(end + 2)
      .insertContent('/')
      .focus()
      .run()
  }
  const onDragStart = (e: React.DragEvent) => {
    const pos = blockPos()
    if (pos < 0 || !target) return
    const {view} = editor
    const selection = NodeSelection.create(view.state.doc, pos)
    view.dispatch(view.state.tr.setSelection(selection))
    const slice = selection.content()
    const {dom, text} = view.serializeForClipboard(slice)
    e.dataTransfer.clearData()
    e.dataTransfer.setData('text/html', dom.innerHTML)
    e.dataTransfer.setData('text/plain', text)
    e.dataTransfer.effectAllowed = 'copyMove'
    e.dataTransfer.setDragImage(target.el, 0, 0)
    view.dragging = {slice, move: true}
  }
  return (
    <div ref={container} className="seed-block-handle" style={{top: target?.top ?? 0}} hidden={!target}>
      <button type="button" title="Add block" onClick={add}>
        +
      </button>
      <span className="seed-drag" title="Drag to move" draggable onDragStart={onDragStart}>
        ⋮⋮
      </span>
    </div>
  )
}

/** Inline formatting toolbar on text selections, built on Tiptap's BubbleMenu. */
export function FormattingToolbar({editor}: {editor: Editor}) {
  const active = useEditorState({
    editor,
    selector: ({editor: e}) =>
      Object.fromEntries(['bold', 'italic', 'underline', 'strike', 'code', 'link'].map((m) => [m, e.isActive(m)])),
  })
  const marks: Array<[string, string, () => void]> = [
    ['B', 'bold', () => editor.chain().focus().toggleBold().run()],
    ['I', 'italic', () => editor.chain().focus().toggleItalic().run()],
    ['U', 'underline', () => editor.chain().focus().toggleUnderline().run()],
    ['S', 'strike', () => editor.chain().focus().toggleStrike().run()],
    ['</>', 'code', () => editor.chain().focus().toggleCode().run()],
  ]
  const toggleLink = () => {
    if (editor.isActive('link')) return void editor.chain().focus().extendMarkRange('link').unsetLink().run()
    const href = window.prompt('Link URL')?.trim()
    if (href) editor.chain().focus().extendMarkRange('link').setLink({href}).run()
  }
  return (
    <BubbleMenu
      editor={editor}
      className="seed-popup seed-toolbar"
      data-testid="formatting-toolbar"
      shouldShow={({state, from, to}) =>
        from !== to && !(state.selection instanceof NodeSelection) && blockDepth(state.selection.$from) > 0
      }
    >
      {marks.map(([label, mark, action]) => (
        <button
          key={mark}
          type="button"
          data-mark={mark}
          data-active={active[mark] || undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={action}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        data-mark="link"
        data-active={active.link || undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleLink}
      >
        Link
      </button>
    </BubbleMenu>
  )
}
