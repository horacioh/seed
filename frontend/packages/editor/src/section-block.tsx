import {
  HM_SECTION_LAYOUTS,
  normalizeSectionAttributes,
  type HMSectionAttributes,
  type HMSectionBackgroundToken,
  type HMSectionLayout,
} from '@seed-hypermedia/client/hm-types'
import {DAEMON_FILE_UPLOAD_URL, MAX_FILE_SIZE_B, MAX_FILE_SIZE_MB} from '@shm/shared/constants'
import {useImageUrl} from '@shm/ui/get-file-url'
import {toast} from '@shm/ui/toast'
import {cn} from '@shm/ui/utils'
import {Check, ImagePlus, X} from 'lucide-react'
import {useRef, useState, useSyncExternalStore} from 'react'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import type {Block, PartialBlock} from './blocknote/core/extensions/Blocks/api/blockTypes'
import {UniqueID} from './blocknote/core/extensions/UniqueID/UniqueID'
import type {HMBlockSchema} from './schema'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter-tight/600.css'
import './section-block.css'

/** Editor instance the Section block and Page mode operate on. */
export type SectionEditor = BlockNoteEditor<HMBlockSchema>
/** An editor block, as read from `editor.topLevelBlocks`. */
export type SectionBlockType = Block<HMBlockSchema>

/** Display names of the layouts, in the order the layout cycler steps through them. */
export const LAYOUT_NAMES: Record<HMSectionLayout, string> = {
  hero: 'Hero',
  split: 'Image and text',
  features: 'Three columns',
  fullBleed: 'Full-bleed image',
}

/** Display names of the background tokens. */
export const BACKGROUND_NAMES: Record<HMSectionBackgroundToken, string> = {
  default: 'White',
  muted: 'Mist',
  accent: 'Sand',
  inverted: 'Ink',
}

/** The layout after (or before) `layout` in the cycler order. */
export function cycleLayout(layout: HMSectionLayout, delta: 1 | -1): HMSectionLayout {
  const i = HM_SECTION_LAYOUTS.indexOf(layout)
  return HM_SECTION_LAYOUTS[(i + delta + HM_SECTION_LAYOUTS.length) % HM_SECTION_LAYOUTS.length]!
}

type Store = {value: string | null; listeners: Set<() => void>}
const selectionStores = new WeakMap<object, Store>()

function getSelectionStore(editor: object): Store {
  let store = selectionStores.get(editor)
  if (!store) {
    store = {value: null, listeners: new Set()}
    selectionStores.set(editor, store)
  }
  return store
}

/** Select a Section in Page mode (or clear the selection with `null`). */
export function setSelectedSection(editor: object, id: string | null) {
  const store = getSelectionStore(editor)
  if (store.value === id) return
  store.value = id
  store.listeners.forEach((listener) => listener())
}

/** The id of the Section selected in Page mode, if any. */
export function getSelectedSection(editor: object): string | null {
  return getSelectionStore(editor).value
}

/** Subscribe to the Page mode Section selection of `editor`. */
export function useSelectedSection(editor: object): string | null {
  const store = getSelectionStore(editor)
  return useSyncExternalStore(
    (listener) => {
      store.listeners.add(listener)
      return () => store.listeners.delete(listener)
    },
    () => store.value,
    () => null,
  )
}

/** Whether an editor block is a page section: a `slot` with `layout` set. */
export function isSectionSlotBlock(block: {type?: string; props?: unknown} | null | undefined): boolean {
  const layout = (block?.props as {layout?: unknown} | undefined)?.layout
  return block?.type === 'slot' && typeof layout === 'string' && layout !== ''
}

/** CSS selector for the content element of a section slot. */
export const SECTION_CONTENT_SELECTOR = '[data-content-type="slot"][data-layout]'

/**
 * Shared Section frame. Exposes the normalized attributes as data attributes
 * the stylesheet keys off, so invalid stored values render as the defaults.
 */
export function SectionFrame({block, editor}: {block: SectionBlockType; editor: SectionEditor}) {
  const attrs = normalizeSectionAttributes(block.props as Record<string, unknown>)
  const getImageUrl = useImageUrl()
  const selected = useSelectedSection(editor) === block.id
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
    </div>
  )
}

/** Find the sibling list that contains block `id`. */
export function findSiblings(blocks: SectionBlockType[], id: string): SectionBlockType[] | null {
  for (const block of blocks) {
    if (block.id === id) return blocks
    const found = findSiblings(block.children as SectionBlockType[], id)
    if (found) return found
  }
  return null
}

/** Deep copy of a block with fresh ids, remapping table-cell column references. */
export function cloneWithFreshIds(block: SectionBlockType): PartialBlock<HMBlockSchema> {
  const ids = new Map<string, string>()
  const assign = (b: SectionBlockType) => {
    ids.set(b.id, UniqueID.options.generateID())
    ;(b.children as SectionBlockType[]).forEach(assign)
  }
  assign(block)
  const clone = (b: SectionBlockType): PartialBlock<HMBlockSchema> => {
    const props = {...(b.props as Record<string, unknown>)}
    if (typeof props.columnId === 'string' && ids.has(props.columnId)) props.columnId = ids.get(props.columnId)
    return {...b, id: ids.get(b.id), props, children: (b.children as SectionBlockType[]).map(clone)} as any
  }
  return clone(block)
}

/** Colour swatches plus background image upload and focus point, for the Color popover. */
export function BackgroundPicker({
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
    if (file.size > MAX_FILE_SIZE_B) {
      toast.error(`The size of ${file.name} exceeds ${MAX_FILE_SIZE_MB} MB.`)
      return
    }
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
      <div className="hm-dock-label">Background</div>
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Background colour">
        {(Object.keys(BACKGROUND_NAMES) as HMSectionBackgroundToken[]).map((token) => {
          const active = !hasImage && attrs.background === token
          return (
            <button
              key={token}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={BACKGROUND_NAMES[token]}
              title={BACKGROUND_NAMES[token]}
              onClick={() => setProps({background: token === 'default' ? '' : token, focalX: '', focalY: ''})}
              className="hm-dock-swatch"
              data-active={active ? 'true' : undefined}
            >
              <span className="hm-section-swatch" data-section-background={token}>
                {active ? <Check className="size-3.5" aria-hidden /> : null}
              </span>
            </button>
          )
        })}
        <button
          type="button"
          role="radio"
          aria-checked={hasImage}
          aria-label={hasImage ? 'Replace background image' : 'Background image'}
          title={hasImage ? 'Replace image' : 'Image'}
          className="hm-dock-swatch"
          data-active={hasImage ? 'true' : undefined}
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          <span className="hm-section-swatch hm-section-swatch--image">
            {hasImage ? <Check className="size-3.5" aria-hidden /> : <ImagePlus className="size-3.5" aria-hidden />}
          </span>
        </button>
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
      {uploading ? <div className="text-muted-foreground text-xs">Uploading…</div> : null}
      {hasImage ? (
        <div className="flex items-center justify-between gap-3">
          <span className="hm-dock-label">Focus point</span>
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
                      active ? 'border-[#16171a] bg-[#16171a] text-white' : 'border-[#e6e6e3]',
                    )}
                  >
                    {active ? <Check className="size-3" aria-hidden /> : null}
                  </button>
                )
              }),
            )}
          </div>
          <button
            type="button"
            className="hm-dock-text-button"
            onClick={() => setProps({background: '', focalX: '', focalY: ''})}
          >
            <X className="size-3.5" aria-hidden />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  )
}

function text(t: string) {
  return t as any
}

/** A prefilled section offered by the template gallery. */
export type SectionTemplate = {
  key: string
  name: string
  build: () => PartialBlock<HMBlockSchema>
}

/** Prefilled sections offered by "Add section". */
export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    key: 'hero',
    name: 'Hero',
    build: () => ({
      type: 'slot',
      props: {layout: 'hero', background: 'accent'},
      children: [
        {type: 'heading', props: {level: '1'}, content: text('A clear headline for your page')},
        {type: 'paragraph', content: text('One or two sentences that say what this is and who it is for.')},
        {type: 'button', props: {name: 'Get started', url: '', alignment: 'center'}},
      ],
    }),
  },
  {
    key: 'split',
    name: 'Image and text',
    build: () => ({
      type: 'slot',
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
    name: 'Three columns',
    build: () => ({
      type: 'slot',
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
    build: () => ({
      type: 'slot',
      props: {layout: 'fullBleed', background: 'inverted', padding: 'L'},
      children: [
        {type: 'heading', props: {level: '2'}, content: text('A caption over the image')},
        {type: 'paragraph', content: text('Pick a background image from Color in the dock.')},
      ],
    }),
  },
  {
    key: 'cta',
    name: 'Call to action',
    build: () => ({
      type: 'slot',
      props: {layout: 'hero', background: 'inverted'},
      children: [
        {type: 'heading', props: {level: '2'}, content: text('Ready to try it?')},
        {type: 'paragraph', content: text('Tell readers what happens next.')},
        {type: 'button', props: {name: 'Contact us', url: '', alignment: 'center'}},
      ],
    }),
  },
]

function isEmptyParagraph(block: SectionBlockType | undefined) {
  return block?.type === 'paragraph' && (block.content as any[]).every((c) => !c.text) && block.children.length === 0
}

/**
 * Insert `template` as a top-level block at `index` (0 = before the first
 * block, `topLevelBlocks.length` = after the last). An empty placeholder
 * paragraph at that spot is replaced instead of being left behind. Returns the
 * new section's id.
 */
export function insertSectionTemplate(editor: SectionEditor, template: SectionTemplate, index: number): string {
  const id = UniqueID.options.generateID()
  const block = {...template.build(), id}
  const blocks = editor.topLevelBlocks as SectionBlockType[]
  const after = blocks[index - 1]
  const before = blocks[index]
  if (isEmptyParagraph(before)) editor.replaceBlocks([before!.id], [block])
  else if (isEmptyParagraph(after) && !before) editor.replaceBlocks([after!.id], [block])
  else if (before) editor.insertBlocks([block], before.id, 'before')
  else if (after) editor.insertBlocks([block], after.id, 'after')
  return id
}
