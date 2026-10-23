import type {Node as PMNode} from 'prosekit/pm/model'
import type {Command} from 'prosekit/pm/state'
import {useEditor} from 'prosekit/react'
import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRoot,
} from 'prosekit/react/autocomplete'
import {
  BlockHandleAdd,
  BlockHandleDraggable,
  BlockHandlePopup,
  BlockHandlePositioner,
  BlockHandleRoot,
} from 'prosekit/react/block-handle'
import {InlinePopoverPopup, InlinePopoverPositioner, InlinePopoverRoot} from 'prosekit/react/inline-popover'
import {useEffect, useState} from 'react'
import {setChildrenType} from '../commands'
import type {SeedSchemaExtension} from '../schema'
import {type MentionItem, useSeedServices} from './services'

/** Replace the content node of the block around the cursor (used by the slash menu). */
function replaceBlockContent(make: (schema: PMNode['type']['schema']) => PMNode): Command {
  return (state, dispatch) => {
    const {$from} = state.selection
    let d = $from.depth
    while (d > 0 && $from.node(d).type.name !== 'blockNode') d--
    if (d <= 0) return false
    const start = $from.before(d) + 1
    const content = $from.node(d).firstChild!
    const node = make(state.schema)
    const inline = node.isTextblock && content.isTextblock ? content.content : undefined
    dispatch?.(
      state.tr.replaceWith(start, start + content.nodeSize, inline ? node.type.create(node.attrs, inline) : node),
    )
    return true
  }
}

function MentionMenu({kind, regex}: {kind: 'account' | 'document'; regex: RegExp}) {
  const editor = useEditor()
  const services = useSeedServices()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MentionItem[]>([])
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const q = query.replace(/^(@|\[\[)/, '')
    const timer = setTimeout(() => {
      services
        .searchMentions(q, kind, controller.signal)
        .then((results) => !controller.signal.aborted && setItems(results.slice(0, 8)))
        .catch((e) => !controller.signal.aborted && console.error('mention search failed', e))
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, open, kind, services])
  const insert = (item: MentionItem) => {
    editor.exec((state, dispatch) => {
      const node = state.schema.nodes.hmMention!.create({link: item.link, mentionKind: kind})
      dispatch?.(state.tr.replaceSelectionWith(node, false).insertText(' '))
      return true
    })
  }
  return (
    <AutocompleteRoot
      regex={regex}
      filter={null}
      onQueryChange={(e) => setQuery(e.detail)}
      onOpenChange={(e) => setOpen(Boolean(e.detail))}
    >
      <AutocompletePositioner>
        <AutocompletePopup data-testid={`mention-menu-${kind}`}>
          <AutocompleteEmpty>{kind === 'account' ? 'Search accounts…' : 'Search documents…'}</AutocompleteEmpty>
          {items.map((item) => (
            <AutocompleteItem key={item.link} onSelect={() => insert(item)}>
              <span>{item.title}</span>
              {item.subtitle ? <small>{item.subtitle}</small> : null}
            </AutocompleteItem>
          ))}
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}

function SlashMenu() {
  const editor = useEditor()
  const run = (command: Command) => editor.exec(command)
  const askLink = (label: string) => window.prompt(label)?.trim()
  const items: Array<[string, () => void]> = [
    ['Paragraph', () => run(replaceBlockContent((s) => s.nodes.paragraph!.create()))],
    ['Heading', () => run(replaceBlockContent((s) => s.nodes.heading!.create()))],
    ['Code block', () => run(replaceBlockContent((s) => s.nodes.codeBlock!.create()))],
    ['Math', () => run(replaceBlockContent((s) => s.nodes.hmMath!.create()))],
    ['Bulleted children', () => run(setChildrenType('Unordered'))],
    ['Numbered children', () => run(setChildrenType('Ordered'))],
    ['Quoted children', () => run(setChildrenType('Blockquote'))],
    [
      'Embed (Content)',
      () => {
        const link = askLink('hm:// link to embed')
        if (link) run(replaceBlockContent((s) => s.nodes.hmEmbed!.create({link, attributes: {view: 'Content'}})))
      },
    ],
    [
      'Embed (Card)',
      () => {
        const link = askLink('hm:// link to embed')
        if (link) run(replaceBlockContent((s) => s.nodes.hmEmbed!.create({link, attributes: {view: 'Card'}})))
      },
    ],
    [
      'Image',
      () => {
        const link = askLink('Image URL or ipfs:// link')
        if (link) run(replaceBlockContent((s) => s.nodes.hmImage!.create({link})))
      },
    ],
    [
      'Button',
      () => {
        const link = askLink('Button link')
        if (link) run(replaceBlockContent((s) => s.nodes.hmButton!.create({link, text: 'Button'})))
      },
    ],
  ]
  return (
    <AutocompleteRoot regex={/(?<!\S)\/(\S.*)?$/u}>
      <AutocompletePositioner>
        <AutocompletePopup data-testid="slash-menu">
          <AutocompleteEmpty>No commands</AutocompleteEmpty>
          {items.map(([label, action]) => (
            <AutocompleteItem key={label} onSelect={action}>
              {label}
            </AutocompleteItem>
          ))}
        </AutocompletePopup>
      </AutocompletePositioner>
    </AutocompleteRoot>
  )
}

function BlockHandle() {
  return (
    <BlockHandleRoot>
      <BlockHandlePositioner>
        <BlockHandlePopup>
          <BlockHandleAdd title="Add block">+</BlockHandleAdd>
          <BlockHandleDraggable title="Drag to move">⋮⋮</BlockHandleDraggable>
        </BlockHandlePopup>
      </BlockHandlePositioner>
    </BlockHandleRoot>
  )
}

function FormattingToolbar() {
  const editor = useEditor<SeedSchemaExtension>({update: true})
  const marks: Array<[string, string, () => void]> = [
    ['B', 'bold', () => editor.commands.toggleBold()],
    ['I', 'italic', () => editor.commands.toggleItalic()],
    ['U', 'underline', () => editor.commands.toggleUnderline()],
    ['S', 'strike', () => editor.commands.toggleStrike()],
    ['</>', 'code', () => editor.commands.toggleCode()],
  ]
  const toggleLink = () => {
    if (editor.marks.link!.isActive()) {
      editor.commands.removeLink()
      return
    }
    const href = window.prompt('Link URL')?.trim()
    if (href) editor.commands.addLink({href})
  }
  return (
    <InlinePopoverRoot>
      <InlinePopoverPositioner>
        <InlinePopoverPopup data-testid="formatting-toolbar">
          {marks.map(([label, mark, action]) => (
            <button
              key={mark}
              type="button"
              data-mark={mark}
              data-active={(editor.marks as any)[mark]?.isActive() || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={action}
            >
              {label}
            </button>
          ))}
          <button type="button" data-mark="link" onMouseDown={(e) => e.preventDefault()} onClick={toggleLink}>
            Link
          </button>
        </InlinePopoverPopup>
      </InlinePopoverPositioner>
    </InlinePopoverRoot>
  )
}

/** All Seed editor overlays: mentions, slash menu, block handle and formatting toolbar. */
export function SeedEditorMenus() {
  return (
    <>
      <MentionMenu kind="account" regex={/@[^\s@]*$/u} />
      <MentionMenu kind="document" regex={/\[\[[^\]]*$/u} />
      <SlashMenu />
      <BlockHandle />
      <FormattingToolbar />
    </>
  )
}
