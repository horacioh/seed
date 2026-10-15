import {
  HM_SECTION_CONTENT_WIDTHS,
  HM_SECTION_LAYOUTS,
  HM_SECTION_PADDINGS,
  normalizeSectionAttributes,
  type HMSectionAttributes,
  type HMSectionBackgroundToken,
  type HMSectionContentWidth,
  type HMSectionLayout,
  type HMSectionPadding,
} from '@seed-hypermedia/client/hm-types'
import {DAEMON_FILE_UPLOAD_URL} from '@shm/shared/constants'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {useImageUrl} from '@shm/ui/get-file-url'
import {toast} from '@shm/ui/toast'
import {cn} from '@shm/ui/utils'
import {ArrowDown, ArrowUp, Check, Copy, ImagePlus, Paintbrush, Plus, Rows3, Trash2, X} from 'lucide-react'
import {useEffect, useRef, useState, type ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {Block, BlockNoteEditor, PartialBlock, defaultProps} from './blocknote/core'
import {createReactBlockSpec} from './blocknote/react'
import type {HMBlockSchema} from './schema'
import './section-block.css'
import {useMobile} from './use-mobile'

type SectionEditor = BlockNoteEditor<HMBlockSchema>
type SectionBlockType = Block<HMBlockSchema>

/** Visual arrangements of the section toolbar, selectable while the design is being reviewed. */
export type SectionToolbarVariant = 'bar' | 'strip' | 'rail'

const TOOLBAR_VARIANT_KEY = 'seed.pageMode.toolbar'

function getToolbarVariant(): SectionToolbarVariant {
  try {
    const value = typeof localStorage !== 'undefined' ? localStorage.getItem(TOOLBAR_VARIANT_KEY) : null
    return value === 'strip' || value === 'rail' ? value : 'bar'
  } catch {
    return 'bar'
  }
}

const LAYOUT_LABELS: Record<HMSectionLayout, {name: string; hint: string}> = {
  hero: {name: 'Hero', hint: 'Centered, large heading'},
  split: {name: 'Split', hint: 'Media beside text'},
  features: {name: 'Features', hint: 'Equal columns'},
  fullBleed: {name: 'Full bleed', hint: 'Text over a full-width image'},
}

const BACKGROUND_LABELS: Record<HMSectionBackgroundToken, string> = {
  default: 'Page',
  muted: 'Muted',
  accent: 'Accent',
  inverted: 'Inverted',
}

const PADDING_LABELS: Record<HMSectionPadding, string> = {S: 'Compact', M: 'Regular', L: 'Spacious'}
const WIDTH_LABELS: Record<HMSectionContentWidth, string> = {S: 'Narrow', M: 'Medium', L: 'Wide', full: 'Full'}

/**
 * Editor block for the HM `Section` type. The block itself only renders the
 * section frame (background + editing controls); its children are ordinary
 * blocks laid out by `section-block.css`. The same render runs in the live
 * editor, the read-only viewer and SSR, so editing looks like the published page.
 */
export const SectionBlock = createReactBlockSpec({
  type: 'section',
  propSchema: {
    ...defaultProps,
    layout: {default: ''},
    background: {default: ''},
    focalX: {default: ''},
    focalY: {default: ''},
    padding: {default: ''},
    contentWidth: {default: ''},
  },
  containsInlineContent: false,
  render: ({block, editor}: {block: SectionBlockType; editor: SectionEditor}) => (
    <SectionFrame block={block} editor={editor} />
  ),
})

/**
 * Shared Section frame. Exposes the normalized attributes as data attributes
 * the stylesheet keys off, so invalid stored values render as the defaults.
 */
export function SectionFrame({block, editor}: {block: SectionBlockType; editor: SectionEditor}) {
  const attrs = normalizeSectionAttributes(block.props as Record<string, unknown>)
  const getImageUrl = useImageUrl()
  const {editable, selected} = useSectionEditingState(editor, block.id)
  const imageUrl = attrs.backgroundImage ? getImageUrl(attrs.backgroundImage, 'XL') : null
  return (
    <div
      className="hm-section-frame"
      contentEditable={false}
      data-section-layout={attrs.layout}
      data-section-background={attrs.backgroundImage ? 'image' : attrs.background}
      data-section-padding={attrs.padding}
      data-section-width={attrs.contentWidth ?? 'doc'}
      data-section-selected={selected ? 'true' : undefined}
    >
      {imageUrl ? (
        <div
          className="hm-section-bg-image"
          style={{
            backgroundImage: `url("${imageUrl}")`,
            backgroundPosition: `${attrs.focalX * 100}% ${attrs.focalY * 100}%`,
          }}
        />
      ) : null}
      {editable ? <SectionControls block={block} editor={editor} attrs={attrs} selected={selected} /> : null}
    </div>
  )
}

function useSectionEditingState(editor: SectionEditor, blockId: string) {
  const tiptap = (editor as any)?._tiptapEditor
  const read = () => {
    if (!tiptap || !editor.isEditable) return {editable: false, selected: false}
    const {$from} = tiptap.state.selection
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth)
      if (node.type.name === 'blockNode' && node.attrs.id === blockId) return {editable: true, selected: true}
    }
    return {editable: true, selected: false}
  }
  const [state, setState] = useState(read)
  useEffect(() => {
    if (!tiptap) return
    const update = () => {
      const next = read()
      setState((prev) => (prev.editable === next.editable && prev.selected === next.selected ? prev : next))
    }
    update()
    tiptap.on('selectionUpdate', update)
    tiptap.on('update', update)
    tiptap.on('focus', update)
    return () => {
      tiptap.off('selectionUpdate', update)
      tiptap.off('update', update)
      tiptap.off('focus', update)
    }
  }, [tiptap, blockId])
  return state
}

function findSiblings(blocks: SectionBlockType[], id: string): SectionBlockType[] | null {
  for (const block of blocks) {
    if (block.id === id) return blocks
    const found = findSiblings(block.children as SectionBlockType[], id)
    if (found) return found
  }
  return null
}

function withoutIds(block: SectionBlockType): PartialBlock<HMBlockSchema> {
  const {id: _id, children, ...rest} = block as any
  return {...rest, children: (children as SectionBlockType[]).map(withoutIds)}
}

function SectionControls({
  block,
  editor,
  attrs,
  selected,
}: {
  block: SectionBlockType
  editor: SectionEditor
  attrs: HMSectionAttributes
  selected: boolean
}) {
  const isMobile = useMobile()
  const variant = getToolbarVariant()
  const setProps = (props: Record<string, string>) => editor.updateBlock(block.id, {props} as any)
  const siblings = findSiblings(editor.topLevelBlocks as SectionBlockType[], block.id) ?? []
  const index = siblings.findIndex((b) => b.id === block.id)
  const current = siblings[index]
  const move = (delta: -1 | 1) => {
    const other = siblings[index + delta]
    if (!current || !other) return
    const [first, second] = delta < 0 ? [other, current] : [current, other]
    editor.replaceBlocks([first.id, second.id], [second, first] as any)
  }
  const actions = {
    moveUp: index > 0 ? () => move(-1) : undefined,
    moveDown: index >= 0 && index < siblings.length - 1 ? () => move(1) : undefined,
    duplicate: () => current && editor.insertBlocks([withoutIds(current)], block.id, 'after'),
    remove: () => editor.removeBlocks([block.id]),
  }

  const toolbar = (
    <SectionToolbar
      variant={isMobile ? 'mobile' : variant}
      attrs={attrs}
      setProps={setProps}
      actions={actions}
      sheetSide={isMobile ? 'top' : 'bottom'}
    />
  )

  return (
    <>
      {isMobile ? (selected && typeof document !== 'undefined' ? createPortal(toolbar, document.body) : null) : toolbar}
      <div className="hm-section-add">
        <AddSectionButton editor={editor} afterBlockId={block.id} compact />
      </div>
    </>
  )
}

type ToolbarActions = {
  moveUp?: () => void
  moveDown?: () => void
  duplicate: () => void
  remove: () => void
}

function SectionToolbar({
  variant,
  attrs,
  setProps,
  actions,
  sheetSide,
}: {
  variant: SectionToolbarVariant | 'mobile'
  attrs: HMSectionAttributes
  setProps: (props: Record<string, string>) => void
  actions: ToolbarActions
  sheetSide: 'top' | 'bottom'
}) {
  const vertical = variant === 'rail'
  const layoutControl =
    variant === 'strip' ? (
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Section layout">
        {HM_SECTION_LAYOUTS.map((layout) => (
          <button
            key={layout}
            type="button"
            role="radio"
            aria-checked={attrs.layout === layout}
            title={LAYOUT_LABELS[layout].name}
            onClick={() => setProps({layout})}
            className={cn(
              'hm-section-tool flex h-8 items-center gap-1.5 rounded-md px-1.5 text-xs',
              attrs.layout === layout && 'bg-accent text-accent-foreground ring-foreground/70 ring-1',
            )}
          >
            <LayoutThumb layout={layout} className="h-5 w-7" active={attrs.layout === layout} />
            <span className={cn(attrs.layout === layout ? 'font-semibold' : 'hidden lg:inline')}>
              {LAYOUT_LABELS[layout].name}
            </span>
          </button>
        ))}
      </div>
    ) : (
      <ToolPopover
        label="Layout"
        side={vertical ? 'left' : sheetSide}
        trigger={
          <>
            <LayoutThumb layout={attrs.layout} className="h-4 w-6" active />
            {variant !== 'rail' ? <span>{LAYOUT_LABELS[attrs.layout].name}</span> : null}
          </>
        }
      >
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Section layout">
          {HM_SECTION_LAYOUTS.map((layout) => (
            <button
              key={layout}
              type="button"
              role="radio"
              aria-checked={attrs.layout === layout}
              onClick={() => setProps({layout})}
              className={cn(
                'hover:bg-muted flex flex-col items-start gap-1.5 rounded-md border p-2 text-left',
                attrs.layout === layout ? 'border-foreground' : 'border-border',
              )}
            >
              <LayoutThumb layout={layout} className="h-12 w-full" active={attrs.layout === layout} />
              <span className="flex w-full items-center justify-between text-sm font-medium">
                {LAYOUT_LABELS[layout].name}
                {attrs.layout === layout ? <Check className="size-3.5" aria-label="Selected" /> : null}
              </span>
              <span className="text-muted-foreground text-xs">{LAYOUT_LABELS[layout].hint}</span>
            </button>
          ))}
        </div>
      </ToolPopover>
    )

  return (
    <div
      className={cn('hm-section-toolbar', `hm-section-toolbar--${variant}`)}
      role="toolbar"
      aria-label="Section"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      onMouseDown={(e) => e.preventDefault()}
    >
      {layoutControl}
      <ToolbarDivider vertical={vertical} />
      <ToolPopover
        label="Background"
        side={vertical ? 'left' : sheetSide}
        trigger={
          <>
            <Paintbrush className="size-4" />
            {variant !== 'rail' ? <span className="hidden sm:inline">Background</span> : null}
          </>
        }
      >
        <BackgroundPicker attrs={attrs} setProps={setProps} />
      </ToolPopover>
      <ToolPopover
        label="Spacing"
        side={vertical ? 'left' : sheetSide}
        trigger={
          <>
            <Rows3 className="size-4" />
            {variant !== 'rail' ? <span className="hidden sm:inline">Spacing</span> : null}
          </>
        }
      >
        <SpacingPicker attrs={attrs} setProps={setProps} />
      </ToolPopover>
      <ToolbarDivider vertical={vertical} />
      <IconTool label="Move up" onClick={actions.moveUp}>
        <ArrowUp className="size-4" />
      </IconTool>
      <IconTool label="Move down" onClick={actions.moveDown}>
        <ArrowDown className="size-4" />
      </IconTool>
      <IconTool label="Duplicate" onClick={actions.duplicate}>
        <Copy className="size-4" />
      </IconTool>
      <IconTool label="Delete section" onClick={actions.remove}>
        <Trash2 className="size-4" />
      </IconTool>
    </div>
  )
}

function ToolbarDivider({vertical}: {vertical: boolean}) {
  return <span aria-hidden className={cn('bg-border shrink-0', vertical ? 'mx-1 h-px w-6' : 'my-1 h-5 w-px')} />
}

function IconTool({label, onClick, children}: {label: string; onClick?: () => void; children: ReactNode}) {
  return (
    <button
      type="button"
      className="hm-section-tool flex size-8 items-center justify-center rounded-md disabled:opacity-35"
      aria-label={label}
      title={label}
      disabled={!onClick}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ToolPopover({
  label,
  trigger,
  side,
  children,
}: {
  label: string
  trigger: ReactNode
  side: 'top' | 'bottom' | 'left'
  children: ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className="hm-section-tool flex h-8 items-center gap-1.5 rounded-md px-2 text-sm"
        >
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align="start"
        className="hm-section-popover w-[min(92vw,20rem)] p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-muted-foreground mb-2 text-xs font-medium">{label}</div>
        {children}
      </PopoverContent>
    </Popover>
  )
}

function BackgroundPicker({
  attrs,
  setProps,
}: {
  attrs: HMSectionAttributes
  setProps: (props: Record<string, string>) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const hasImage = !!attrs.backgroundImage
  const upload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(DAEMON_FILE_UPLOAD_URL, {method: 'POST', body: formData})
      const cid = response.ok ? await response.text() : ''
      if (!cid) throw new Error(`Upload failed (${response.status})`)
      setProps({background: `ipfs://${cid}`, focalX: '', focalY: ''})
    } catch (error) {
      toast.error('Could not upload the background image: ' + String(error))
    } finally {
      setUploading(false)
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Background colour">
        {(Object.keys(BACKGROUND_LABELS) as HMSectionBackgroundToken[]).map((token) => {
          const active = !hasImage && attrs.background === token
          return (
            <button
              key={token}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setProps({background: token === 'default' ? '' : token, focalX: '', focalY: ''})}
              className="flex flex-col items-center gap-1 text-xs"
            >
              <span
                className={cn(
                  'hm-section-swatch flex size-9 items-center justify-center rounded-md border',
                  active ? 'border-foreground ring-foreground ring-1' : 'border-border',
                )}
                data-section-background={token}
              >
                {active ? <Check className="size-4" aria-hidden /> : null}
              </span>
              <span className={cn(active && 'font-semibold')}>{BACKGROUND_LABELS[token]}</span>
            </button>
          )
        })}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="hover:bg-muted border-border flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border text-sm"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          <ImagePlus className="size-4" />
          {uploading ? 'Uploading…' : hasImage ? 'Replace image' : 'Image'}
        </button>
        {hasImage ? (
          <button
            type="button"
            className="hover:bg-muted border-border flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm"
            onClick={() => setProps({background: '', focalX: '', focalY: ''})}
          >
            <X className="size-4" />
            Remove
          </button>
        ) : null}
      </div>
      {hasImage ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">Focus point</span>
          <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Image focus point">
            {[0, 0.5, 1].flatMap((y) =>
              [0, 0.5, 1].map((x) => {
                const active = attrs.focalX === x && attrs.focalY === y
                return (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`Focus ${y === 0 ? 'top' : y === 1 ? 'bottom' : 'middle'} ${
                      x === 0 ? 'left' : x === 1 ? 'right' : 'center'
                    }`}
                    onClick={() => setProps({focalX: String(x), focalY: String(y)})}
                    className={cn(
                      'flex size-5 items-center justify-center rounded-sm border',
                      active ? 'border-foreground bg-foreground text-background' : 'border-border',
                    )}
                  >
                    {active ? <Check className="size-3" aria-hidden /> : null}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PresetRow<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  labels: Record<T, string>
  value: T | null
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm">{label}</span>
      <div className="bg-muted flex rounded-md p-0.5" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
            className={cn(
              'flex h-7 flex-1 items-center justify-center gap-1 rounded-sm text-xs',
              value === option ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground',
            )}
          >
            {value === option ? <Check className="size-3" aria-hidden /> : null}
            {labels[option]}
          </button>
        ))}
      </div>
    </div>
  )
}

function SpacingPicker({
  attrs,
  setProps,
}: {
  attrs: HMSectionAttributes
  setProps: (props: Record<string, string>) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <PresetRow
        label="Padding"
        options={HM_SECTION_PADDINGS}
        labels={PADDING_LABELS}
        value={attrs.padding}
        onChange={(padding) => setProps({padding})}
      />
      <PresetRow
        label="Content width"
        options={HM_SECTION_CONTENT_WIDTHS}
        labels={WIDTH_LABELS}
        value={attrs.contentWidth}
        onChange={(contentWidth) => setProps({contentWidth})}
      />
    </div>
  )
}

/** Small schematic of a section layout, used in the layout picker and template gallery. */
export function LayoutThumb({
  layout,
  className,
  active,
}: {
  layout: HMSectionLayout
  className?: string
  active?: boolean
}) {
  const ink = active ? 0.85 : 0.55
  const soft = active ? 0.35 : 0.2
  return (
    <svg viewBox="0 0 48 32" className={cn('shrink-0', className)} aria-hidden preserveAspectRatio="none">
      <rect x="0.5" y="0.5" width="47" height="31" rx="3" fill="none" stroke="currentColor" strokeOpacity={soft} />
      {layout === 'hero' ? (
        <>
          <rect x="12" y="9" width="24" height="4" rx="1" fill="currentColor" fillOpacity={ink} />
          <rect x="15" y="16" width="18" height="2" rx="1" fill="currentColor" fillOpacity={soft} />
          <rect x="19" y="22" width="10" height="4" rx="1.5" fill="currentColor" fillOpacity={ink} />
        </>
      ) : layout === 'split' ? (
        <>
          <rect x="5" y="6" width="17" height="20" rx="1.5" fill="currentColor" fillOpacity={soft} />
          <rect x="26" y="9" width="16" height="3" rx="1" fill="currentColor" fillOpacity={ink} />
          <rect x="26" y="15" width="14" height="2" rx="1" fill="currentColor" fillOpacity={soft} />
          <rect x="26" y="19" width="12" height="2" rx="1" fill="currentColor" fillOpacity={soft} />
        </>
      ) : layout === 'features' ? (
        <>
          {[5, 19, 33].map((x) => (
            <g key={x}>
              <rect x={x} y="9" width="10" height="3" rx="1" fill="currentColor" fillOpacity={ink} />
              <rect x={x} y="15" width="10" height="2" rx="1" fill="currentColor" fillOpacity={soft} />
              <rect x={x} y="19" width="8" height="2" rx="1" fill="currentColor" fillOpacity={soft} />
            </g>
          ))}
        </>
      ) : (
        <>
          <rect x="1" y="1" width="46" height="30" rx="2.5" fill="currentColor" fillOpacity={soft} />
          <rect x="7" y="17" width="20" height="4" rx="1" fill="currentColor" fillOpacity={ink} />
          <rect x="7" y="23" width="14" height="2" rx="1" fill="currentColor" fillOpacity={ink} />
        </>
      )}
    </svg>
  )
}

function text(t: string) {
  return t as any
}

/** Prefilled sections offered by "Add section". */
export const SECTION_TEMPLATES: {
  key: string
  name: string
  description: string
  layout: HMSectionLayout
  build: () => PartialBlock<HMBlockSchema>
}[] = [
  {
    key: 'hero',
    name: 'Hero',
    description: 'Headline, a line of text and a button',
    layout: 'hero',
    build: () => ({
      type: 'section',
      props: {layout: 'hero', padding: 'L'},
      children: [
        {type: 'heading', props: {level: '2'}, content: text('A clear headline for your page')},
        {type: 'paragraph', content: text('One or two sentences that say what this is and who it is for.')},
        {type: 'button', props: {name: 'Get started', url: '', alignment: 'center'}},
      ],
    }),
  },
  {
    key: 'split',
    name: 'Image and text',
    description: 'A picture beside a short pitch',
    layout: 'split',
    build: () => ({
      type: 'section',
      props: {layout: 'split'},
      children: [
        {type: 'image', props: {url: ''}},
        {type: 'heading', props: {level: '2'}, content: text('Show, then tell')},
        {type: 'paragraph', content: text('Describe what the image shows and why it matters to your reader.')},
        {type: 'button', props: {name: 'Learn more', url: ''}},
      ],
    }),
  },
  {
    key: 'features',
    name: 'Three features',
    description: 'Three columns, each with a title and text',
    layout: 'features',
    build: () => ({
      type: 'section',
      props: {layout: 'features', background: 'muted'},
      children: ['Fast', 'Private', 'Yours'].map((title) => ({
        type: 'heading',
        props: {level: '3'},
        content: text(title),
        children: [{type: 'paragraph', content: text('A short sentence explaining this benefit.')}],
      })),
    }),
  },
  {
    key: 'fullBleed',
    name: 'Full-bleed image',
    description: 'Large background image with a caption',
    layout: 'fullBleed',
    build: () => ({
      type: 'section',
      props: {layout: 'fullBleed', background: 'inverted', padding: 'L'},
      children: [
        {type: 'heading', props: {level: '2'}, content: text('A caption over the image')},
        {type: 'paragraph', content: text('Pick a background image from the section toolbar.')},
      ],
    }),
  },
  {
    key: 'cta',
    name: 'Call to action',
    description: 'A closing line and a button on an accent band',
    layout: 'hero',
    build: () => ({
      type: 'section',
      props: {layout: 'hero', background: 'accent'},
      children: [
        {type: 'heading', props: {level: '2'}, content: text('Ready to try it?')},
        {type: 'button', props: {name: 'Contact us', url: '', alignment: 'center'}},
      ],
    }),
  },
]

/**
 * "+ Add section" control. Opens the template gallery and inserts the chosen
 * section after `afterBlockId`, or at the end of the document when omitted.
 */
export function AddSectionButton({
  editor,
  afterBlockId,
  compact,
}: {
  editor: SectionEditor
  afterBlockId?: string
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()
  const insert = (template: (typeof SECTION_TEMPLATES)[number]) => {
    const blocks = editor.topLevelBlocks
    const ref = afterBlockId ?? blocks[blocks.length - 1]?.id
    if (!ref) return
    const last = blocks[blocks.length - 1]
    // Replace a trailing empty paragraph instead of leaving it stranded above the new section.
    const replaceTrailing =
      !afterBlockId &&
      last?.type === 'paragraph' &&
      (last.content as any[]).every((c) => !c.text) &&
      !last.children.length &&
      blocks.length > 1
    if (replaceTrailing) editor.replaceBlocks([last.id], [template.build()])
    else editor.insertBlocks([template.build()], ref, 'after')
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'hm-section-add-button flex items-center gap-1.5 text-sm',
            compact ? 'h-7 rounded-full px-3' : 'h-10 w-full justify-center rounded-md border border-dashed',
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Plus className="size-4" />
          Add section
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? 'top' : 'bottom'}
        align="center"
        className="hm-section-popover w-[min(94vw,34rem)] p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="text-muted-foreground mb-2 text-xs font-medium">Add a section</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SECTION_TEMPLATES.map((template) => (
            <button
              key={template.key}
              type="button"
              className="hover:bg-muted border-border hover:border-foreground/40 flex flex-col items-start gap-1.5 rounded-md border p-2 text-left"
              onClick={() => insert(template)}
            >
              <LayoutThumb layout={template.layout} className="h-14 w-full" active />
              <span className="text-sm font-medium">{template.name}</span>
              <span className="text-muted-foreground text-xs leading-snug">{template.description}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
