import {HM_SECTION_PADDINGS, normalizeSectionAttributes, type HMSectionLayout} from '@seed-hypermedia/client/hm-types'
import {PageModeDockContext, setPageMode} from '@shm/shared/page-mode'
import {Popover, PopoverAnchor, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {cn} from '@shm/ui/utils'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Ellipsis,
  LogOut,
  Plus,
  Redo2,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'
import './page-mode.css'
import {
  BackgroundPicker,
  cloneWithFreshIds,
  cycleLayout,
  getSelectedSection,
  insertSectionTemplate,
  LAYOUT_NAMES,
  SECTION_TEMPLATES,
  setSelectedSection,
  useSelectedSection,
  type SectionBlockType,
  type SectionEditor,
  type SectionTemplate,
} from './section-block'
import {useMobile} from './use-mobile'

const HINT_KEY = 'seed.pageMode.hintDismissed'
const POPOVER_CLASS = 'hm-dock-popover data-[state=closed]:animate-none data-[state=open]:animate-none'

function tiptap(editor: SectionEditor) {
  return (editor as any)._tiptapEditor as {
    view: {dom: HTMLElement; domAtPos: (pos: number) => {node: Node}}
    state: {selection: {from: number}}
    isFocused: boolean
    commands: {undo: () => boolean; redo: () => boolean; blur: () => boolean}
    can: () => {undo: () => boolean; redo: () => boolean}
    on: (event: string, fn: () => void) => void
    off: (event: string, fn: () => void) => void
  }
}

function useEditorVersion(editor: SectionEditor) {
  const [version, bump] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    const tt = tiptap(editor)
    tt.on('transaction', bump)
    return () => tt.off('transaction', bump)
  }, [editor])
  return version
}

function topLevelNodes(dom: HTMLElement): HTMLElement[] {
  return Array.from(
    dom.querySelectorAll<HTMLElement>(':scope > [data-node-type="blockChildren"] > [data-node-type="blockNode"]'),
  )
}

function isSectionNode(el: Element | null | undefined): el is HTMLElement {
  return !!el?.querySelector(':scope > * > [data-content-type="section"]')
}

function topLevelNodeOf(dom: HTMLElement, target: Node | null): HTMLElement | null {
  let el = target instanceof Element ? target : target?.parentElement ?? null
  let found: HTMLElement | null = null
  while (el && el !== dom) {
    if (el.getAttribute('data-node-type') === 'blockNode') found = el as HTMLElement
    el = el.parentElement
  }
  return el === dom ? found : null
}

function isTyping(el: Element | null) {
  if (!el) return false
  return (el as HTMLElement).isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
}

function liveSection(editor: SectionEditor, id: string | null): SectionBlockType | null {
  if (!id) return null
  return ((editor.topLevelBlocks as SectionBlockType[]).find((b) => b.id === id && b.type === 'section') ??
    null) as SectionBlockType | null
}

function sectionActions(editor: SectionEditor) {
  const select = (id: string | null) => setSelectedSection(editor, id)
  const reveal = (id: string) =>
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({block: 'nearest', behavior: 'smooth'}))
  return {
    setProps(id: string, props: Record<string, string>) {
      editor.updateBlock(id, {props} as any)
    },
    cycle(id: string, delta: 1 | -1) {
      const block = liveSection(editor, id)
      if (!block) return
      const {layout} = normalizeSectionAttributes(block.props as Record<string, unknown>)
      editor.updateBlock(id, {props: {layout: cycleLayout(layout, delta)}} as any)
    },
    move(id: string, delta: 1 | -1) {
      const blocks = editor.topLevelBlocks as SectionBlockType[]
      const index = blocks.findIndex((b) => b.id === id)
      const neighbour = blocks[index + delta]
      if (index < 0 || !neighbour) return
      const block = blocks[index]!
      editor.removeBlocks([id])
      editor.insertBlocks([block as any], neighbour.id, delta > 0 ? 'after' : 'before')
      select(id)
      reveal(id)
    },
    duplicate(id: string) {
      const block = liveSection(editor, id)
      if (!block) return
      const copy = cloneWithFreshIds(block)
      editor.insertBlocks([copy], id, 'after')
      select(copy.id as string)
      reveal(copy.id as string)
    },
    remove(id: string) {
      editor.removeBlocks([id])
      select(null)
    },
    insert(template: SectionTemplate, index: number) {
      const id = insertSectionTemplate(editor, template, index)
      select(id)
      reveal(id)
    },
  }
}

/**
 * Page mode editing surface: the bottom dock, the insertion gaps between
 * top-level blocks, click-to-select for Sections, keyboard shortcuts and the
 * shortcut hint. Rendered by the document editor while Page mode is active.
 */
export function PageModeSurface({editor}: {editor: SectionEditor}) {
  const isMobile = !!useMobile()
  const selectedId = useSelectedSection(editor)
  useEditorVersion(editor)
  const section = liveSection(editor, selectedId)
  const actions = sectionActions(editor)

  useEffect(() => {
    if (selectedId && !section) setSelectedSection(editor, null)
  }, [editor, selectedId, section])

  useEffect(() => {
    const tt = tiptap(editor)
    const dom = tt.view.dom
    dom.classList.add('hm-page-surface')
    const onPointerDown = (event: PointerEvent) => {
      const node = topLevelNodeOf(dom, event.target as Node)
      if (!isSectionNode(node)) {
        setSelectedSection(editor, null)
        return
      }
      setSelectedSection(editor, node.getAttribute('data-id'))
      const target = event.target as Element
      const textBlock = target.closest('[data-content-type]')
      if (!textBlock || textBlock.getAttribute('data-content-type') === 'section') {
        event.preventDefault()
        tt.commands.blur()
      }
    }
    let focused: Element | null = null
    const onSelection = () => {
      focused?.classList.remove('hm-text-focus')
      focused = null
      if (!tt.isFocused) return
      const at = tt.view.domAtPos(tt.state.selection.from).node
      const el = at instanceof Element ? at : at.parentElement
      focused = el?.closest('[data-content-type]:not([data-content-type="section"])') ?? null
      focused?.classList.add('hm-text-focus')
      const node = topLevelNodeOf(dom, at)
      if (isSectionNode(node)) setSelectedSection(editor, node.getAttribute('data-id'))
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const id = getSelectedSection(editor)
      if (event.key === 'Escape') {
        if (document.querySelector('[data-radix-popper-content-wrapper], .hm-dock-sheet')) return
        if (id) {
          // Keep the editor's own Escape (leave editing) from firing too.
          event.preventDefault()
          event.stopPropagation()
          setSelectedSection(editor, null)
          tt.commands.blur()
        }
        return
      }
      if (!id) return
      const active = document.activeElement
      const inEditor = !!active && dom.contains(active)
      if (event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey && !isTyping(active)) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          sectionActions(editor).cycle(id, event.key === 'ArrowRight' ? 1 : -1)
        }
        return
      }
      if (event.altKey && !event.shiftKey && (inEditor || !isTyping(active))) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault()
          event.stopPropagation()
          sectionActions(editor).move(id, event.key === 'ArrowDown' ? 1 : -1)
        }
      }
    }
    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown, true)
    tt.on('selectionUpdate', onSelection)
    tt.on('focus', onSelection)
    tt.on('blur', onSelection)
    return () => {
      dom.classList.remove('hm-page-surface')
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown, true)
      tt.off('selectionUpdate', onSelection)
      tt.off('focus', onSelection)
      tt.off('blur', onSelection)
      focused?.classList.remove('hm-text-focus')
      setSelectedSection(editor, null)
    }
  }, [editor])

  return (
    <>
      <PageModeGaps editor={editor} onInsert={actions.insert} isMobile={isMobile} />
      {createPortal(
        <>
          <PageModeDock editor={editor} section={section} isMobile={isMobile} />
          {isMobile ? null : <ShortcutHint />}
        </>,
        document.body,
      )}
    </>
  )
}

function PageModeGaps({
  editor,
  onInsert,
  isMobile,
}: {
  editor: SectionEditor
  onInsert: (template: SectionTemplate, index: number) => void
  isMobile: boolean
}) {
  const version = useEditorVersion(editor)
  const [gaps, setGaps] = useState<number[]>([])
  const anchorRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  const measure = useCallback(() => {
    const dom = tiptap(editor).view.dom
    const anchor = anchorRef.current
    if (!anchor) return
    const nodes = topLevelNodes(dom)
    if (!nodes.length) return setGaps([])
    const origin = anchor.getBoundingClientRect().top
    const gap = parseFloat(getComputedStyle(dom).getPropertyValue('--hm-gap')) || 14
    const tops = nodes.map((n) => n.getBoundingClientRect().top - origin - gap)
    tops.push(nodes[nodes.length - 1]!.getBoundingClientRect().bottom - origin)
    setGaps((prev) => (prev.length === tops.length && prev.every((v, i) => Math.abs(v - tops[i]!) < 0.5) ? prev : tops))
  }, [editor])

  useLayoutEffect(() => {
    measure()
  }, [measure, version, isMobile])
  useEffect(() => {
    const dom = tiptap(editor).view.dom
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(dom)
    topLevelNodes(dom).forEach((n) => observer.observe(n))
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [editor, measure, version])

  return (
    <div ref={anchorRef} className="hm-page-gaps" aria-label="Section insertion points">
      {gaps.map((top, index) => {
        const button = (
          <button
            type="button"
            className="hm-page-gap"
            style={{top}}
            data-open={open === index ? 'true' : undefined}
            aria-label={`Add section ${index === 0 ? 'at the top' : index === gaps.length - 1 ? 'at the end' : 'here'}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen(index)}
          >
            <span className="hm-page-gap-label">
              <Plus className="size-3.5" aria-hidden />
              Add section
            </span>
          </button>
        )
        const choose = (template: SectionTemplate) => {
          setOpen(null)
          onInsert(template, index)
        }
        if (isMobile) {
          return (
            <div key={index}>
              {button}
              {open === index ? (
                <BottomSheet title="Add section" onClose={() => setOpen(null)}>
                  <TemplateGallery onChoose={choose} />
                </BottomSheet>
              ) : null}
            </div>
          )
        }
        return (
          <Popover key={index} open={open === index} onOpenChange={(next) => setOpen(next ? index : null)}>
            <PopoverAnchor asChild>{button}</PopoverAnchor>
            <PopoverContent
              side="bottom"
              align="center"
              sideOffset={10}
              collisionPadding={16}
              className={cn(POPOVER_CLASS, 'w-[720px] max-w-[calc(100vw-32px)]')}
            >
              <div className="hm-dock-label mb-3">Add a section</div>
              <TemplateGallery onChoose={choose} />
            </PopoverContent>
          </Popover>
        )
      })}
    </div>
  )
}

/** Grid of scaled-down renders of the section templates. */
export function TemplateGallery({onChoose}: {onChoose: (template: SectionTemplate) => void}) {
  return (
    <div className="hm-template-grid" role="list">
      {SECTION_TEMPLATES.map((template) => (
        <button
          key={template.key}
          type="button"
          role="listitem"
          className="hm-template-card"
          onClick={() => onChoose(template)}
        >
          <span className="hm-template-preview" aria-hidden>
            <span className="hm-template-canvas">
              <PreviewBlock block={template.build() as any} />
            </span>
          </span>
          <span className="hm-template-name">{template.name}</span>
        </button>
      ))}
    </div>
  )
}

type PreviewNode = {type: string; props?: Record<string, string>; content?: string; children?: PreviewNode[]}

/** Static render of a template with the editor's block DOM, so the real Section styles apply. */
function PreviewBlock({block}: {block: PreviewNode}) {
  const children = block.children?.length ? (
    <div data-node-type="blockChildren">
      {block.children.map((child, i) => (
        <PreviewBlock key={i} block={child} />
      ))}
    </div>
  ) : null
  let content: ReactNode = null
  const props = block.props ?? {}
  if (block.type === 'section') {
    const attrs = normalizeSectionAttributes(props)
    content = (
      <div>
        <div data-content-type="section">
          <div
            className="hm-section-frame"
            data-section-layout={attrs.layout}
            data-section-background={attrs.layout === 'fullBleed' ? 'image' : attrs.background}
            data-section-padding={attrs.padding}
            data-section-width={attrs.contentWidth ?? 'doc'}
          >
            {attrs.layout === 'fullBleed' ? <div className="hm-section-bg-image hm-template-photo" /> : null}
          </div>
        </div>
      </div>
    )
  } else if (block.type === 'heading') {
    const Tag = props.level === '1' ? 'h1' : props.level === '3' ? 'h3' : 'h2'
    content = (
      <Tag data-content-type="heading" data-level={props.level ?? '2'}>
        {block.content}
      </Tag>
    )
  } else if (block.type === 'paragraph') {
    content = <p data-content-type="paragraph">{block.content}</p>
  } else if (block.type === 'button') {
    content = (
      <div>
        <div data-content-type="button">
          <div className="flex w-full flex-col" style={{alignItems: props.alignment === 'center' ? 'center' : 'start'}}>
            <button data-slot="button" type="button" tabIndex={-1} className="inline-flex items-center">
              <span>{props.name}</span>
            </button>
          </div>
        </div>
      </div>
    )
  } else if (block.type === 'image') {
    content = (
      <div>
        <div data-content-type="image">
          <div className="image hm-template-photo" />
        </div>
      </div>
    )
  }
  return (
    <div data-node-type="blockNode">
      {content}
      {children}
    </div>
  )
}

function BottomSheet({title, onClose, children}: {title: string; onClose: () => void; children: ReactNode}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])
  return createPortal(
    <>
      <div className="hm-dock-backdrop" onClick={onClose} />
      <div className="hm-dock-sheet" role="dialog" aria-label={title}>
        <div className="hm-dock-sheet-head">
          <span className="hm-dock-label">{title}</span>
          <button type="button" className="hm-dock-btn hm-dock-btn--icon" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </>,
    document.body,
  )
}

const DockButton = forwardRef<
  HTMLButtonElement,
  {label: string; icon?: ReactNode; children?: ReactNode} & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DockButton({label, icon, children, className, ...rest}, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn('hm-dock-btn', !children && 'hm-dock-btn--icon', className)}
      onMouseDown={(e) => e.preventDefault()}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
})

function SpacingControl({value, onChange}: {value: string; onChange: (padding: string) => void}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="hm-dock-label">Spacing</div>
      <div className="hm-dock-segmented" role="radiogroup" aria-label="Spacing">
        {HM_SECTION_PADDINGS.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={value === p}
            data-active={value === p ? 'true' : undefined}
            onClick={() => onChange(p === 'M' ? '' : p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

type Panel = 'color' | 'spacing' | 'more' | 'add' | null

function PageModeDock({
  editor,
  section,
  isMobile,
}: {
  editor: SectionEditor
  section: SectionBlockType | null
  isMobile: boolean
}) {
  const {publish} = useContext(PageModeDockContext)
  const [panel, setPanel] = useState<Panel>(null)
  const actions = sectionActions(editor)
  const tt = tiptap(editor)
  const id = section?.id ?? null
  const attrs = section ? normalizeSectionAttributes(section.props as Record<string, unknown>) : null
  useEffect(() => setPanel(null), [id])

  const setProps = (props: Record<string, string>) => id && actions.setProps(id, props)
  const close = () => setPanel(null)
  const addAtEnd = (template: SectionTemplate) => {
    close()
    actions.insert(template, editor.topLevelBlocks.length)
  }

  const panelBody = (which: Panel) => {
    if (which === 'add') return <TemplateGallery onChoose={addAtEnd} />
    if (!attrs) return null
    if (which === 'color') return <BackgroundPicker attrs={attrs} setProps={setProps} />
    if (which === 'spacing') return <SpacingControl value={attrs.padding} onChange={(padding) => setProps({padding})} />
    if (which === 'more' && id)
      return (
        <div className="flex flex-col gap-4">
          <SpacingControl value={attrs.padding} onChange={(padding) => setProps({padding})} />
          <div className="hm-dock-menu">
            <DockButton
              label="Duplicate"
              icon={<Copy className="size-4" />}
              onClick={() => (close(), actions.duplicate(id))}
            >
              Duplicate
            </DockButton>
            <DockButton label="Move up" icon={<ArrowUp className="size-4" />} onClick={() => actions.move(id, -1)}>
              Move up
            </DockButton>
            <DockButton label="Move down" icon={<ArrowDown className="size-4" />} onClick={() => actions.move(id, 1)}>
              Move down
            </DockButton>
            <DockButton label="Delete" icon={<Trash2 className="size-4" />} onClick={() => actions.remove(id)}>
              Delete
            </DockButton>
          </div>
        </div>
      )
    return null
  }

  const trigger = (which: Exclude<Panel, null>, button: ReactNode, title: string) => {
    if (isMobile) {
      return (
        <>
          <span onClick={() => setPanel(which)}>{button}</span>
          {panel === which ? (
            <BottomSheet title={title} onClose={close}>
              {panelBody(which)}
            </BottomSheet>
          ) : null}
        </>
      )
    }
    return (
      <Popover open={panel === which} onOpenChange={(open) => setPanel(open ? which : null)}>
        <PopoverTrigger asChild>{button}</PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={14}
          collisionPadding={16}
          className={cn(POPOVER_CLASS, which === 'add' ? 'w-[720px] max-w-[calc(100vw-32px)]' : 'w-auto min-w-[240px]')}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {which === 'add' ? <div className="hm-dock-label mb-3">Add a section</div> : null}
          {panelBody(which)}
        </PopoverContent>
      </Popover>
    )
  }

  const history = (
    <>
      <DockButton
        label="Undo"
        icon={<Undo2 className="size-4" />}
        disabled={!tt.can().undo()}
        onClick={() => tt.commands.undo()}
      />
      <DockButton
        label="Redo"
        icon={<Redo2 className="size-4" />}
        disabled={!tt.can().redo()}
        onClick={() => tt.commands.redo()}
      />
    </>
  )
  const exit = (
    <DockButton
      label="Exit page mode"
      onClick={() => setPageMode(false)}
      icon={isMobile ? <LogOut className="size-4" /> : null}
    >
      {isMobile ? null : 'Exit'}
    </DockButton>
  )
  const divider = <span className="hm-dock-divider" aria-hidden />

  let body: ReactNode
  if (section && attrs && id) {
    const cycler = (
      <div className="hm-dock-cycler" role="group" aria-label="Layout">
        <DockButton
          label="Previous layout"
          icon={<ChevronLeft className="size-4" />}
          onClick={() => actions.cycle(id, -1)}
        />
        <span className="hm-dock-cycler-name" aria-live="polite">
          {LAYOUT_NAMES[attrs.layout as HMSectionLayout]}
        </span>
        <DockButton
          label="Next layout"
          icon={<ChevronRight className="size-4" />}
          onClick={() => actions.cycle(id, 1)}
        />
      </div>
    )
    const color = trigger(
      'color',
      <DockButton label="Color" data-open={panel === 'color' ? 'true' : undefined}>
        <span
          className="hm-section-swatch hm-dock-swatch-dot"
          data-section-background={attrs.backgroundImage ? 'image' : attrs.background}
        />
        Color
      </DockButton>,
      'Color',
    )
    body = isMobile ? (
      <>
        {cycler}
        {color}
        {trigger('more', <DockButton label="More" icon={<Ellipsis className="size-4" />} />, 'Section')}
        {publish}
      </>
    ) : (
      <>
        {cycler}
        {divider}
        {color}
        {trigger(
          'spacing',
          <DockButton label="Spacing" data-open={panel === 'spacing' ? 'true' : undefined}>
            Spacing
          </DockButton>,
          'Spacing',
        )}
        <DockButton label="Duplicate" onClick={() => actions.duplicate(id)}>
          Duplicate
        </DockButton>
        <DockButton label="Delete" onClick={() => actions.remove(id)}>
          Delete
        </DockButton>
        {divider}
        {history}
        {exit}
        {publish}
      </>
    )
  } else {
    body = (
      <>
        {trigger(
          'add',
          <DockButton label="Add section" icon={<Plus className="size-4" />} className="hm-dock-btn--accent">
            Add section
          </DockButton>,
          'Add section',
        )}
        {divider}
        {history}
        {isMobile ? <span className="flex-1" /> : null}
        {exit}
        {publish}
      </>
    )
  }

  return (
    <div className={cn('hm-page-dock', isMobile && 'hm-page-dock--mobile')} role="toolbar" aria-label="Page mode">
      {body}
    </div>
  )
}

function readHintDismissed() {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}

function ShortcutHint() {
  const [dismissed, setDismissed] = useState(readHintDismissed)
  if (dismissed) return null
  return (
    <div className="hm-page-hint" role="note">
      <span>
        <kbd>Enter</kbd> in a gap adds a section · <kbd>⇧←→</kbd> changes layout
      </span>
      <button
        type="button"
        aria-label="Dismiss hint"
        onClick={() => {
          try {
            localStorage.setItem(HINT_KEY, '1')
          } catch {}
          setDismissed(true)
        }}
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
