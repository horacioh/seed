import {$createCodeNode} from '@lexical/code'
import {$isLinkNode, $toggleLink} from '@lexical/link'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
  type MenuTextMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getState,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $parseSerializedNode,
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  type TextFormatType,
} from 'lexical'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {$insertBlockContent, $nearestBlock, $selectNode, $setChildrenType, $setTextType} from '../commands'
import {
  $createSeedBlockNode,
  $createSeedTextBlockNode,
  $isSeedBlockNode,
  $isSeedTextBlockNode,
  hmTypeState,
  type SeedBlockNode,
} from '../nodes'
import {type MentionItem, useSeedServices} from './services'

class ItemOption extends MenuOption {
  constructor(
    readonly label: string,
    readonly subtitle: string | undefined,
    readonly run: () => void,
  ) {
    super(label)
  }
}

function TypeaheadList({
  options,
  selectedIndex,
  select,
  highlight,
  empty,
  testId,
}: {
  options: ItemOption[]
  selectedIndex: number | null
  select: (o: ItemOption) => void
  highlight: (i: number) => void
  empty: string
  testId: string
}) {
  return (
    <div className="seed-menu" data-testid={testId} role="listbox">
      {options.length ? (
        options.map((o, i) => (
          <div
            key={o.key}
            ref={o.setRefElement}
            role="option"
            aria-selected={selectedIndex === i}
            className="seed-menu-item"
            data-highlighted={selectedIndex === i || undefined}
            onMouseEnter={() => highlight(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => select(o)}
          >
            <span>{o.label}</span>
            {o.subtitle ? <small>{o.subtitle}</small> : null}
          </div>
        ))
      ) : (
        <div className="seed-menu-empty">{empty}</div>
      )}
    </div>
  )
}

const mentionTriggers: Record<'account' | 'document', (text: string) => MenuTextMatch | null> = {
  account: (text) => {
    const m = /(^|\s)(@([^\s@]*))$/u.exec(text)
    return m ? {leadOffset: m.index + m[1]!.length, matchingString: m[3]!, replaceableString: m[2]!} : null
  },
  document: (text) => {
    const m = /(\[\[([^\]]*))$/u.exec(text)
    return m ? {leadOffset: m.index, matchingString: m[2]!, replaceableString: m[1]!} : null
  },
}

/** `@` account and `[[` document suggestions, inserting an inline `Embed` mention. */
function MentionMenu({kind}: {kind: 'account' | 'document'}) {
  const [editor] = useLexicalComposerContext()
  const services = useSeedServices()
  const [query, setQuery] = useState<string | null>(null)
  const [items, setItems] = useState<MentionItem[]>([])
  useEffect(() => {
    if (query === null) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      services
        .searchMentions(query, kind, controller.signal)
        .then((results) => !controller.signal.aborted && setItems(results.slice(0, 8)))
        .catch((e) => !controller.signal.aborted && console.error('mention search failed', e))
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, kind, services])
  const options = useMemo(() => items.map((item) => new ItemOption(item.title, item.subtitle, () => {})), [items])
  return (
    <LexicalTypeaheadMenuPlugin<ItemOption>
      triggerFn={mentionTriggers[kind]}
      onQueryChange={setQuery}
      options={options}
      commandPriority={COMMAND_PRIORITY_HIGH}
      onSelectOption={(option, textNode, close) => {
        const item = items[options.indexOf(option)]
        if (!item) return
        editor.update(() => {
          const mention = $parseSerializedNode({type: 'seed-mention', version: 1, $: {link: item.link}} as any)
          if (textNode) textNode.replace(mention)
          else $getSelection()?.insertNodes([mention])
          const space = $createTextNode(' ')
          mention.insertAfter(space)
          space.select(1, 1)
        })
        close()
      }}
      menuRenderFn={(anchor, {options, selectedIndex, selectOptionAndCleanUp, setHighlightedIndex}) =>
        anchor.current && query !== null
          ? createPortal(
              <TypeaheadList
                options={options}
                selectedIndex={selectedIndex}
                select={selectOptionAndCleanUp}
                highlight={setHighlightedIndex}
                empty={kind === 'account' ? 'Search accounts…' : 'Search documents…'}
                testId={`mention-menu-${kind}`}
              />,
              anchor.current,
            )
          : null
      }
    />
  )
}

function atomJSON(hmType: string, link: string, attributes: Record<string, unknown> = {}, text = '') {
  return {type: 'seed-atom', version: 1, $: {hmType, link, text, attributes}} as any
}

function slashCommands(editor: LexicalEditor): Array<[string, () => void]> {
  const ask = (label: string) => window.prompt(label)?.trim()
  const insert = (make: () => LexicalNode, select = false) =>
    editor.update(() => {
      const node = make()
      const block = $insertBlockContent(node)
      if (!block) return
      if (select) $selectNode(node)
      else if ('select' in node) (node as any).select()
    })
  const onBlock = (fn: (b: SeedBlockNode) => void) =>
    editor.update(() => {
      const sel = $getSelection()
      const block = $isRangeSelection(sel) ? $nearestBlock(sel.anchor.getNode()) : null
      if (block) fn(block)
    })
  const atom = (label: string, hmType: string, attributes?: Record<string, unknown>, text?: string) => () => {
    const link = ask(label)
    if (link) insert(() => $parseSerializedNode(atomJSON(hmType, link, attributes, text)), true)
  }
  return [
    ['Paragraph', () => onBlock((b) => $setTextType(b, 'Paragraph'))],
    ['Heading', () => onBlock((b) => $setTextType(b, 'Heading'))],
    ['Code block', () => insert(() => $createCodeNode())],
    ['Math', () => insert(() => $parseSerializedNode({type: 'seed-math', version: 1, $: {text: ''}} as any), true)],
    ['Bulleted children', () => onBlock((b) => $setChildrenType(b, 'Unordered'))],
    ['Numbered children', () => onBlock((b) => $setChildrenType(b, 'Ordered'))],
    ['Quoted children', () => onBlock((b) => $setChildrenType(b, 'Blockquote'))],
    ['Embed (Content)', atom('hm:// link to embed', 'Embed', {view: 'Content'})],
    ['Embed (Card)', atom('hm:// link to embed', 'Embed', {view: 'Card'})],
    ['Image', atom('Image URL or ipfs:// link', 'Image')],
    ['Video', atom('Video URL or ipfs:// link', 'Video')],
    ['File', atom('File URL or ipfs:// link', 'File')],
    ['Web embed', atom('URL to embed', 'WebEmbed')],
    ['Button', atom('Button link', 'Button', {}, 'Button')],
  ]
}

/** `/` command menu: block types, children types, media and embeds. */
function SlashMenu() {
  const [editor] = useLexicalComposerContext()
  const [query, setQuery] = useState<string | null>(null)
  const trigger = useBasicTypeaheadTriggerMatch('/', {minLength: 0, allowWhitespace: false})
  const options = useMemo(
    () =>
      slashCommands(editor)
        .filter(([label]) => label.toLowerCase().includes((query ?? '').toLowerCase()))
        .map(([label, run]) => new ItemOption(label, undefined, run)),
    [editor, query],
  )
  return (
    <LexicalTypeaheadMenuPlugin<ItemOption>
      triggerFn={(text, ed) => trigger(text, ed)}
      onQueryChange={setQuery}
      options={options}
      commandPriority={COMMAND_PRIORITY_HIGH}
      onSelectOption={(option, textNode, close) => {
        editor.update(() => textNode?.remove())
        close()
        option.run()
      }}
      menuRenderFn={(anchor, {options, selectedIndex, selectOptionAndCleanUp, setHighlightedIndex}) =>
        anchor.current
          ? createPortal(
              <TypeaheadList
                options={options}
                selectedIndex={selectedIndex}
                select={selectOptionAndCleanUp}
                highlight={setHighlightedIndex}
                empty="No commands"
                testId="slash-menu"
              />,
              anchor.current,
            )
          : null
      }
    />
  )
}

const FORMATS: Array<[string, TextFormatType]> = [
  ['B', 'bold'],
  ['I', 'italic'],
  ['U', 'underline'],
  ['S', 'strikethrough'],
  ['</>', 'code'],
]

/** Floating formatting toolbar over a non-empty text selection. */
function FormattingToolbar() {
  const [editor] = useLexicalComposerContext()
  const [state, setState] = useState<{rect: DOMRect; active: Set<string>; heading: boolean; link: boolean} | null>(null)
  useEffect(
    () =>
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          const sel = $getSelection()
          const dom = window.getSelection()
          if (!$isRangeSelection(sel) || sel.isCollapsed() || !dom?.rangeCount || !editor.isEditable()) {
            setState(null)
            return
          }
          const rect = dom.getRangeAt(0).getBoundingClientRect()
          const active = new Set(FORMATS.map(([, f]) => f).filter((f) => sel.hasFormat(f)))
          const text = sel.anchor.getNode().getParents().find($isSeedTextBlockNode)
          const link = sel.getNodes().some((n) => $isLinkNode(n) || $isLinkNode(n.getParent()))
          setState({rect, active, heading: !!text && $getState(text, hmTypeState) === 'Heading', link})
        })
      }),
    [editor],
  )
  if (!state) return null
  const toggleHeading = () =>
    editor.update(() => {
      const sel = $getSelection()
      const block = $isRangeSelection(sel) ? $nearestBlock(sel.anchor.getNode()) : null
      if (block) $setTextType(block, state.heading ? 'Paragraph' : 'Heading')
    })
  const toggleLink = () => {
    if (state.link) return editor.update(() => $toggleLink(null))
    const saved = editor.getEditorState().read(() => $getSelection()?.clone() ?? null)
    const href = window.prompt('Link URL')?.trim()
    if (href)
      editor.update(() => {
        if (saved) $setSelection(saved)
        $toggleLink(href)
      })
  }
  return createPortal(
    <div
      className="seed-toolbar"
      data-testid="formatting-toolbar"
      style={{top: state.rect.top + window.scrollY - 40, left: state.rect.left + window.scrollX}}
      onMouseDown={(e) => e.preventDefault()}
    >
      {FORMATS.map(([label, format]) => (
        <button
          key={format}
          type="button"
          data-mark={format}
          data-active={state.active.has(format) || undefined}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
        >
          {label}
        </button>
      ))}
      <button type="button" data-mark="link" data-active={state.link || undefined} onClick={toggleLink}>
        Link
      </button>
      <button type="button" data-mark="heading" data-active={state.heading || undefined} onClick={toggleHeading}>
        H
      </button>
    </div>,
    document.body,
  )
}

/**
 * Side menu with `+` and a drag handle for every block, nested ones
 * included. Lexical's `DraggableBlockPlugin_EXPERIMENTAL` only moves
 * root-level nodes, so Seed's nested blocks need their own.
 */
function BlockHandle({container}: {container: HTMLElement | null}) {
  const [editor] = useLexicalComposerContext()
  const [hover, setHover] = useState<{el: HTMLElement; key: string} | null>(null)
  const [dropLine, setDropLine] = useState<{top: number; left: number; width: number} | null>(null)
  const dragKey = useRef<string | null>(null)
  const dropTarget = useRef<{key: string; after: boolean} | null>(null)

  const blockAt = useCallback(
    (target: EventTarget | null) => {
      const el = (target as HTMLElement | null)?.closest?.('.seed-block') as HTMLElement | null
      if (!el || !editor.getRootElement()?.contains(el)) return null
      const key = editor.read(() => {
        const node = $getNearestNodeFromDOMNode(el)
        return $isSeedBlockNode(node) ? node.getKey() : null
      })
      return key ? {el, key} : null
    },
    [editor],
  )

  useEffect(() => {
    const root = editor.getRootElement()
    if (!root) return
    const onMove = (e: MouseEvent) => {
      const found = blockAt(e.target)
      if (found) setHover(found)
    }
    const onDragOver = (e: DragEvent) => {
      if (!dragKey.current) return
      const found = blockAt(e.target)
      if (!found || !container) return
      e.preventDefault()
      const contentEl = (found.el.firstElementChild as HTMLElement) ?? found.el
      const rect = contentEl.getBoundingClientRect()
      const after = e.clientY > rect.top + rect.height / 2
      const host = container.getBoundingClientRect()
      dropTarget.current = {key: found.key, after}
      setDropLine({top: (after ? rect.bottom : rect.top) - host.top, left: rect.left - host.left, width: rect.width})
    }
    const onDrop = (e: DragEvent) => {
      const from = dragKey.current
      const to = dropTarget.current
      dragKey.current = null
      dropTarget.current = null
      setDropLine(null)
      if (!from || !to || from === to.key) return
      e.preventDefault()
      editor.update(() => {
        const moving = $nearestBlockByKey(from)
        const target = $nearestBlockByKey(to.key)
        if (!moving || !target || target.getParents().some((p) => p.is(moving))) return
        if (to.after) target.insertAfter(moving)
        else target.insertBefore(moving)
      })
    }
    root.addEventListener('mousemove', onMove)
    root.addEventListener('dragover', onDragOver)
    root.addEventListener('drop', onDrop)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('dragover', onDragOver)
      root.removeEventListener('drop', onDrop)
    }
  }, [editor, blockAt, container])

  if (!container) return null
  const host = container.getBoundingClientRect()
  const contentEl = hover?.el.firstElementChild as HTMLElement | undefined
  const rect = contentEl?.getBoundingClientRect()
  return (
    <>
      {hover && rect && hover.el.isConnected ? (
        <div className="seed-block-handle" style={{top: rect.top - host.top, left: rect.left - host.left - 44}}>
          <button
            type="button"
            title="Add block"
            onClick={() =>
              editor.update(() => {
                const block = $nearestBlockByKey(hover.key)
                if (!block) return
                const text = $createSeedTextBlockNode()
                block.insertAfter($createSeedBlockNode().append(text))
                text.select()
                text.append($createTextNode('/'))
                text.selectEnd()
              })
            }
          >
            +
          </button>
          <span
            className="seed-drag"
            title="Drag to move"
            draggable
            onDragStart={(e) => {
              dragKey.current = hover.key
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', '')
              if (contentEl) e.dataTransfer.setDragImage(contentEl, 0, 0)
            }}
            onDragEnd={() => setDropLine(null)}
          >
            ⋮⋮
          </span>
        </div>
      ) : null}
      {dropLine ? <div className="seed-drop-line" style={dropLine} /> : null}
    </>
  )
}

function $nearestBlockByKey(key: string): SeedBlockNode | null {
  const node = $getNodeByKey(key)
  return $isSeedBlockNode(node) ? node : null
}

/** All Seed editor overlays: mentions, slash menu, side menu and formatting toolbar. */
export function SeedEditorMenus({container}: {container: HTMLElement | null}) {
  return (
    <>
      <MentionMenu kind="account" />
      <MentionMenu kind="document" />
      <SlashMenu />
      <BlockHandle container={container} />
      <FormattingToolbar />
    </>
  )
}
