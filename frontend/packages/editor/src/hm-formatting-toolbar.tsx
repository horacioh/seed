import * as stylex from '@stylexjs/stylex'
import {editorBlocksToHMBlockNodes} from '@seed-hypermedia/client/editorblock-to-hmblock'
import {EditorToggledStyle, HMBlockChildrenType, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {Button} from '@shm/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {
  Code,
  Emphasis,
  HeadingIcon,
  OrderedList,
  Strikethrough,
  Strong,
  Type,
  Underline,
  UnorderedList,
} from '@shm/ui/icons'
import {Tooltip} from '@shm/ui/tooltip'
import {usePopoverState} from '@shm/ui/use-popover-state'
import {cn} from '@shm/ui/utils'
import {CellSelection} from '@tiptap/pm/tables'
import {ChevronDown, FileText, Link, ListChecks, MessageSquare} from 'lucide-react'
import {TextSelection} from 'prosemirror-state'
import {useEffect, useRef, useState} from 'react'
import {BlockNoteEditor, BlockSpec, getBlockInfoFromSelection, PropSchema, updateGroupCommand} from './blocknote/core'
import {getNearestBlockOrCellPos} from './blocknote/core/extensions/Blocks/helpers/getBlockInfoFromPos'
import {getReferenceableRevision} from './blocknote/core/extensions/BlockRevision/BlockRevisionInvalidation'
import {getGroupInfoFromPos} from './blocknote/core/extensions/Blocks/helpers/getGroupInfoFromPos'
import {prosemirrorPosToBlockTextOffset} from './blocknote/core/extensions/RangeSelection/RangeSelectionPlugin'
import {
  BlockTypeDropdownItem,
  FormattingToolbarProps,
  useEditorContentChange,
  useEditorSelectionChange,
} from './blocknote/react'
import {useDraftActions} from './draft-actions-context'
import {useFragmentActions} from './fragment-actions-context'
import {HMLinkToolbarButton} from './hm-toolbar-link-button'
import {MobileLinkToolbarButton} from './mobile-link-toolbar-button'
import {MobileTextMarkerDialog} from './mobile-text-marker-dialog'
import {MobileTextTypeDialog} from './mobile-text-type-dialog'
import {StyleOptionsPanel} from './style-options-panel'
import {TOOLBAR_COLOR_NAMES, type ToolbarColorName} from './toolbar-color-palette'
import {deriveDraftNameFromBlocks, getSelectedFullBlocks, replaceBlocksWithDraftEmbed} from './turn-into-doc'
import {useMobile} from './use-mobile'

/**
 * Ensures a grid has at least columnCount number of children.
 */
const styles_2 = stylex.create({
  s68989642: {
    ':is(.dark *)': {
      borderColor: 'color-mix(in oklab, #fff 10%, transparent)',
    },
  },
  se117420b: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
  sa0da43a7: {
    ':is(.dark *)': {
      ':focus': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s3824ce: {
    zIndex: '50',
  },
  s6a2edbb: {
    width: 'fit-content',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s1aa14: {
    padding: 'calc(0.25rem * 1)',
  },
  s8a6c2964: {
    boxShadow: 'var(--shadow-md)',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sdef3facc: {
    position: 'relative',
  },
  s291c6d79: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
      },
    },
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s18c14: {
    height: 'calc(0.25rem * 9)',
  },
  s1c463: {
    width: 'calc(0.25rem * 9)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sf4676641: {
    gap: 'calc(0.25rem * 1.5)',
  },
  se45bb2b0: {
    borderColor: 'color-mix(in oklab, #000 10%, transparent)',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s14e67425: {
    fontWeight: '400',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s54eab7bc: {
    opacity: '60%',
  },
  sf614494: {
    zIndex: '10000',
  },
  s5483ce08: {
    width: '22rem',
  },
  s7868b4e7: {
    maxWidth: '92vw',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  se8df6f15: {
    ':focus': {
      backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
    },
  },
  s5f36a877: {
    backgroundColor: '#000',
  },
  s2daecf89: {
    color: '#fff',
  },
  s291c6e52: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 80%, transparent)',
      },
    },
  },
  s25eca887: {
    ':hover': {
      '@media (hover: hover)': {
        color: '#fff',
      },
    },
  },
})
function fillGridChildren(tiptap: any, columnCount: number) {
  setTimeout(() => {
    tiptap.commands.command(({state, dispatch}: {state: any; dispatch: any}) => {
      if (!dispatch) return true
      const {group, $pos, depth} = getGroupInfoFromPos(state.selection.from, state)
      if (group.attrs.listType !== 'Grid') return true
      const currentCount = group.childCount
      if (currentCount >= columnCount) return true
      const schema = state.schema
      const tr = state.tr
      // Insert position: just before the closing of the blockChildren node
      const groupStart = $pos.before(depth) + 1 // inside blockChildren
      const insertPos = groupStart + group.content.size
      for (let i = 0; i < columnCount - currentCount; i++) {
        const para = schema.nodes['paragraph'].create()
        const blockNode = schema.nodes['blockNode'].create({}, para)
        tr.insert(insertPos + i * blockNode.nodeSize, blockNode)
      }
      dispatch(tr)
      return true
    })
  })
}

/**
 * Computes blockId, rangeStart, rangeEnd from the current editor selection.
 * Returns null if the selection spans multiple blocks or is empty.
 */
function getSelectionFragment(editor: BlockNoteEditor<any>): {
  blockId: string
  rangeStart: number
  rangeEnd: number
} | null {
  const view = editor._tiptapEditor.view
  const {state} = view
  const {selection} = state
  if (selection.empty) return null

  // Disable copy link and comment on block buttons for multi-cell selections,
  // because they don't have a single addressable container, so anchoring a
  // comment or fragment link to one of the cells would pick only one cell.
  if (selection instanceof CellSelection) return null
  const {$from, $to} = selection
  const from = $from.pos
  const to = $to.pos
  let blockNode: import('prosemirror-model').Node
  let blockBeforePos: number
  try {
    const posInfo = getNearestBlockOrCellPos(state.doc, from)
    blockNode = posInfo.node
    blockBeforePos = posInfo.posBeforeNode
  } catch {
    return null
  }

  // Only single-block selections and inside tables, only single-cell
  // selections.
  try {
    const endInfo = getNearestBlockOrCellPos(state.doc, to)
    if (endInfo.posBeforeNode !== blockBeforePos) return null
  } catch {
    return null
  }
  const blockId: string = blockNode.attrs?.id ?? ''
  if (!blockId) return null

  // Find blockContent start position and revision. A missing revision means
  // the block has not been published yet, or has been semantically edited
  // since publish, so it cannot be referenced.
  let blockContentBeforePos = blockBeforePos
  const firstChild = blockNode.firstChild
  if (blockNode.type?.name === 'tableCell' || blockNode.type?.name === 'tableHeader') {
    if (firstChild) blockContentBeforePos = blockBeforePos + 1
  } else {
    blockNode.forEach((child, offset) => {
      if (child.type.spec.group === 'block') {
        blockContentBeforePos = blockBeforePos + offset + 1
      }
    })
  }
  if (!getReferenceableRevision(blockNode)) return null
  const rangeStart = prosemirrorPosToBlockTextOffset(state.doc, from, blockContentBeforePos)
  const rangeEnd = prosemirrorPosToBlockTextOffset(state.doc, to, blockContentBeforePos)
  return {
    blockId,
    rangeStart,
    rangeEnd,
  }
}

/** Clears the visible browser/ProseMirror text selection after fragment actions. */
function clearEditorTextSelection(editor: BlockNoteEditor<any>) {
  const view = editor._tiptapEditor?.view
  if (view && !view.isDestroyed) {
    const {state} = view
    const pos = Math.min(Math.max(state.selection.to, 0), state.doc.content.size)
    try {
      view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)))
    } catch {
      // Ignore invalid positions; clearing the native selection below is still useful.
    }
  }
  if (typeof window !== 'undefined') {
    window.getSelection()?.removeAllRanges()
  }
}
const toggleStyles = [
  {
    name: 'Bold (Mod+B)',
    icon: <Strong className={stylex.props(styles.sca3de968).className || ''} />,
    style: 'bold' as EditorToggledStyle,
  },
  {
    name: 'Italic (Mod+I)',
    icon: <Emphasis className={stylex.props(styles.sca3de968).className || ''} />,
    style: 'italic' as EditorToggledStyle,
  },
  {
    name: 'Underline (Mod+U)',
    icon: <Underline className={stylex.props(styles.sca3de968).className || ''} />,
    style: 'underline' as EditorToggledStyle,
  },
  {
    name: 'Strikethrough (Mod+Shift+X)',
    icon: <Strikethrough className={stylex.props(styles.sca3de968).className || ''} />,
    style: 'strike' as EditorToggledStyle,
  },
  {
    name: 'Code (Mod+E)',
    icon: <Code className={stylex.props(styles.sca3de968).className || ''} />,
    style: 'code' as EditorToggledStyle,
  },
]
export const blockDropdownItems: BlockTypeDropdownItem[] = [
  {
    name: 'Paragraph',
    type: 'paragraph',
    icon: Type,
  },
  {
    name: 'Heading',
    type: 'heading',
    icon: <HeadingIcon className={stylex.props(styles.sca3de968).className || ''} />,
  },
  {
    name: 'Bullet List',
    type: 'bulletListItem',
    icon: <UnorderedList className={stylex.props(styles.sca3de968).className || ''} />,
  },
  {
    name: 'Numbered List',
    type: 'numberedListItem',
    icon: <OrderedList className={stylex.props(styles.sca3de968).className || ''} />,
  },
]
function normalizeColorName(value: unknown): ToolbarColorName {
  if (typeof value !== 'string') return 'default'
  return (TOOLBAR_COLOR_NAMES as readonly string[]).includes(value) ? (value as ToolbarColorName) : 'default'
}
export function HMFormattingToolbar<Schema extends Record<string, BlockSpec<string, PropSchema>>>(
  props: FormattingToolbarProps<Schema> & {
    blockTypeDropdownItems?: BlockTypeDropdownItem[]
    // Current document id for the "Turn into doc" button
    docId?: UnpackedHypermediaId
  },
) {
  const fragmentActions = useFragmentActions()
  const draftActions = useDraftActions()
  const onCreateInlineDraft = draftActions?.onCreateInlineDraft
  const canTurnIntoDoc = !!(props.docId && onCreateInlineDraft)
  const [currentGroupType, setCurrentGroupType] = useState<string>('Group')
  const [currentColumnCount, setCurrentColumnCount] = useState<string>('3')
  const [currentBlockType, setCurrentBlockType] = useState<string>('paragraph')
  const [currentTextColor, setCurrentTextColor] = useState<ToolbarColorName>('default')
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<ToolbarColorName>('default')
  const [currentTextSize, setCurrentTextSize] = useState<string>('')
  const [currentTextFamily, setCurrentTextFamily] = useState<string>('')
  const [isTextMarkerDialogOpen, setIsTextMarkerDialogOpen] = useState(false)
  const [isTextTypeDialogOpen, setIsTextTypeDialogOpen] = useState(false)
  const [hasReferenceableFragment, setHasReferenceableFragment] = useState(() => !!getSelectionFragment(props.editor))
  const stylePopover = usePopoverState()
  // Keep a ref to the latest popover state so the toolbar visibility
  // subscription doesn't need to resubscribe on every render.
  const stylePopoverRef = useRef(stylePopover)
  stylePopoverRef.current = stylePopover

  // Close the style options popover whenever the parent Tippy toolbar wants to hide.
  useEffect(() => {
    const plugin = props.editor.formattingToolbar
    if (!plugin) return
    return plugin.onUpdate((state) => {
      if (!state.show && stylePopoverRef.current.open) {
        stylePopoverRef.current.onOpenChange(false)
      }
    })
  }, [props.editor])
  const isMobile = useMobile()
  useEditorSelectionChange(props.editor, () => {
    const tiptap = props.editor._tiptapEditor
    const {state} = tiptap
    setHasReferenceableFragment(!!getSelectionFragment(props.editor))
    try {
      const groupInfo = getGroupInfoFromPos(state.selection.from, state)
      setCurrentGroupType(groupInfo.group.attrs.listType || 'Group')
      setCurrentColumnCount(String(groupInfo.group.attrs.columnCount || 3))
    } catch {
      setCurrentGroupType('Group')
      setCurrentColumnCount('3')
    }
    try {
      const blockInfo = getBlockInfoFromSelection(state)
      setCurrentBlockType(blockInfo.blockContentType || 'paragraph')
    } catch {
      setCurrentBlockType('paragraph')
    }
    const activeStyles = props.editor.getActiveStyles()
    setCurrentTextColor(normalizeColorName(activeStyles.textColor))
    setCurrentBackgroundColor(normalizeColorName(activeStyles.backgroundColor))
    setCurrentTextSize(typeof activeStyles.textSize === 'string' ? activeStyles.textSize : '')
    setCurrentTextFamily(typeof activeStyles.textFamily === 'string' ? activeStyles.textFamily : '')
  })
  useEditorContentChange(props.editor, () => {
    const activeStyles = props.editor.getActiveStyles()
    setCurrentTextColor(normalizeColorName(activeStyles.textColor))
    setCurrentBackgroundColor(normalizeColorName(activeStyles.backgroundColor))
    setCurrentTextSize(typeof activeStyles.textSize === 'string' ? activeStyles.textSize : '')
    setCurrentTextFamily(typeof activeStyles.textFamily === 'string' ? activeStyles.textFamily : '')
  })
  const handleGroupTypeChange = (listType: string) => {
    if (listType === currentGroupType) return
    const tiptap = props.editor._tiptapEditor
    const {state} = tiptap
    const {$pos, group} = getGroupInfoFromPos(state.selection.from, state)
    tiptap.commands.command(updateGroupCommand($pos.pos, listType as HMBlockChildrenType, false, false, true))
    if (listType === 'Grid') {
      const colCount = group.attrs.columnCount || 3
      if (!group.attrs.columnCount) {
        const info = getGroupInfoFromPos(tiptap.state.selection.from, tiptap.state)
        const tr = tiptap.state.tr
        tr.setNodeAttribute(info.$pos.before(info.depth), 'columnCount', colCount)
        tiptap.view.dispatch(tr)
      }
      setCurrentColumnCount(String(colCount))
      fillGridChildren(tiptap, colCount)
    }
    setCurrentGroupType(listType)
  }
  const handleColumnCountChange = (colCount: string) => {
    if (colCount === currentColumnCount) return
    const tiptap = props.editor._tiptapEditor
    const {$pos, depth} = getGroupInfoFromPos(tiptap.state.selection.from, tiptap.state)
    const newCount = parseInt(colCount, 10)
    const tr = tiptap.state.tr
    tr.setNodeAttribute($pos.before(depth), 'columnCount', newCount)
    tiptap.view.dispatch(tr)
    setCurrentColumnCount(colCount)
    fillGridChildren(tiptap, newCount)
  }
  const handleBlockTypeChange = (blockType: string) => {
    if (blockType === currentBlockType) return
    const tiptap = props.editor._tiptapEditor
    const {state} = tiptap
    const blockInfo = getBlockInfoFromSelection(state)
    props.editor.updateBlock(
      blockInfo.block.node.attrs.id,
      {
        type: blockType,
        props: {},
      },
      blockType === 'code-block',
    )
    setCurrentBlockType(blockType)
  }
  const handleTextMarkerChange = (listType: string) => {
    handleGroupTypeChange(listType)
    setIsTextMarkerDialogOpen(false)
  }
  const handleTextTypeChange = (blockType: string) => {
    handleBlockTypeChange(blockType)
    setIsTextTypeDialogOpen(false)
  }

  /** Apply a text-size annotation to the current
   * selection. Empty string clears the mark. */
  const handleTextSizeChange = (value: string) => {
    if (value) {
      props.editor.addStyles({
        textSize: value,
      })
    } else {
      props.editor.removeStyles({
        textSize: true,
      } as any)
    }
    setCurrentTextSize(value)
  }

  /** Apply a font-family annotation to the current
   * selection. Empty string clears the mark. */
  const handleTextFamilyChange = (value: string) => {
    if (value) {
      props.editor.addStyles({
        textFamily: value,
      })
    } else {
      props.editor.removeStyles({
        textFamily: true,
      } as any)
    }
    setCurrentTextFamily(value)
  }

  /**
   * Snapshot the selected blocks, create a new child draft
   * seeded with that content, then replace the source blocks
   * with a single draft-embed in place. Bails out on failure
   * without touching the parent so the user never loses content.
   */
  const handleTurnIntoDoc = async () => {
    if (!props.docId || !onCreateInlineDraft) return
    const blocks = getSelectedFullBlocks(props.editor)
    if (!blocks || blocks.length === 0) return
    let initialContent
    try {
      initialContent = editorBlocksToHMBlockNodes(blocks as any)
    } catch (err) {
      console.error('[turn-into-doc] failed to serialize selected blocks:', err)
      return
    }
    const name = deriveDraftNameFromBlocks(blocks)
    try {
      const {draftId} = await onCreateInlineDraft(props.docId, {
        initialContent,
        name,
      })
      replaceBlocksWithDraftEmbed(props.editor, blocks, draftId)
    } catch (err) {
      console.error('[turn-into-doc] failed to create inline draft:', err)
    }
  }
  return (
    <>
      <div
        data-testid="formatting-toolbar"
        className={
          stylex.props(
            styles.s1a01a0ed,
            styles.s436dc7b6,
            styles.s3824ce,
            styles.s6a2edbb,
            styles.sf79988b7,
            styles.sad8c742c,
            styles.s1aa14,
            styles.s8a6c2964,
          ).className || ''
        }
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div
          className={stylex.props(styles.sc05281e3, styles.s2ffff9, styles.s67e351ac, styles.s5d936fa).className || ''}
        >
          {/* Row 1 - inline marks and fragment actions */}
          <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fa).className || ''}>
            {toggleStyles.map((item) => (
              <ToggleStyleButton key={item.style} editor={props.editor} toggleStyle={item.style} {...item} />
            ))}

            {/* Link button - different for mobile/desktop */}
            {isMobile ? (
              <MobileLinkToolbarButton editor={props.editor} />
            ) : (
              <div className={stylex.props(styles.sdef3facc).className || ''}>
                <HMLinkToolbarButton editor={props.editor} testId="link-button" />
              </div>
            )}

            {/* Fragment actions are only valid for selections inside one
                previously-published block (identified by revision). Per design:
                no separator from marks; these buttons read as secondary icons. */}
            {fragmentActions && hasReferenceableFragment && (
              <>
                <Tooltip content="Comment">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={stylex.props(styles.sf79988b7, styles.s291c6d79).className || ''}
                    onClick={() => {
                      const frag = getSelectionFragment(props.editor)
                      if (frag) {
                        fragmentActions.onComment(frag.blockId, frag.rangeStart, frag.rangeEnd)
                        clearEditorTextSelection(props.editor)
                      }
                    }}
                  >
                    <MessageSquare className={stylex.props(styles.sca3de968).className || ''} />
                  </Button>
                </Tooltip>
                <Tooltip content="Copy Link">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={stylex.props(styles.sf79988b7, styles.s291c6d79).className || ''}
                    onClick={() => {
                      const frag = getSelectionFragment(props.editor)
                      if (frag) {
                        fragmentActions.onCopyFragmentLink(frag.blockId, frag.rangeStart, frag.rangeEnd)
                        clearEditorTextSelection(props.editor)
                      }
                    }}
                  >
                    <Link className={stylex.props(styles.sca3de968).className || ''} />
                  </Button>
                </Tooltip>
              </>
            )}
          </div>

          {/* Row 2 - Style options and Turn into doc */}
          <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.s5d936fb).className || ''}>
            {isMobile ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={
                    stylex.props(styles.s18c14, styles.s1c463, styles.sf032ed6c, styles.s291c6d79).className || ''
                  }
                  onClick={() => setIsTextMarkerDialogOpen(true)}
                >
                  <UnorderedList className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={
                    stylex.props(styles.s18c14, styles.s1c463, styles.sf032ed6c, styles.s291c6d79).className || ''
                  }
                  onClick={() => setIsTextTypeDialogOpen(true)}
                >
                  <Type className={stylex.props(styles.sca3de968).className || ''} />
                </Button>
              </>
            ) : (
              <Popover {...stylePopover}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    data-testid="style-options-trigger"
                    className={
                      stylex.props(
                        styles.s18c14,
                        styles.sf4676641,
                        styles.sf79988b7,
                        styles.sad8c742c,
                        styles.se45bb2b0,
                        styles.s34b1ae,
                        styles.sab7cc6fa,
                        styles.s14e67425,
                        styles.s291c6d79,
                      ).className || ''
                    }
                  >
                    <ListChecks className={stylex.props(styles.sca3de968).className || ''} />
                    <span>Style options</span>
                    <ChevronDown className={stylex.props(styles.s3269316e, styles.s54eab7bc).className || ''} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  collisionPadding={8}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  // Keep focus on the editor when a pointer lands on
                  // non-focusable areas of the panel (padding, gaps, section
                  // headings). Focusable controls (buttons, inputs) keep
                  // their native behavior so text selection and keyboard
                  // focus still work if the panel ever gains an input.
                  onPointerDown={(e) => {
                    const target = e.target as HTMLElement | null
                    if (
                      !target?.closest(
                        'button, input, textarea, select, a, [contenteditable=""], [contenteditable="true"]',
                      )
                    ) {
                      e.preventDefault()
                    }
                  }}
                  className={
                    stylex.props(styles.s436dc7b6, styles.sf614494, styles.s5483ce08, styles.s7868b4e7, styles.s1aa16)
                      .className || ''
                  }
                >
                  <StyleOptionsPanel
                    editor={props.editor}
                    currentBlockType={currentBlockType}
                    currentGroupType={currentGroupType}
                    currentColumnCount={currentColumnCount}
                    currentTextColor={currentTextColor}
                    currentBackgroundColor={currentBackgroundColor}
                    currentTextSize={currentTextSize}
                    currentTextFamily={currentTextFamily}
                    onBlockTypeChange={handleBlockTypeChange}
                    onGroupTypeChange={handleGroupTypeChange}
                    onColumnCountChange={handleColumnCountChange}
                    onTextSizeChange={handleTextSizeChange}
                    onTextFamilyChange={handleTextFamilyChange}
                  />
                </PopoverContent>
              </Popover>
            )}

            {!isMobile && canTurnIntoDoc && (
              <Tooltip content="Move selected blocks into a new child document">
                <Button
                  type="button"
                  variant="ghost"
                  data-testid="turn-into-doc-button"
                  className={
                    stylex.props(
                      styles.s18c14,
                      styles.sf4676641,
                      styles.sf79988b7,
                      styles.sad8c742c,
                      styles.se45bb2b0,
                      styles.s34b1ae,
                      styles.sab7cc6fa,
                      styles.s14e67425,
                      styles.s291c6d79,
                    ).className || ''
                  }
                  onClick={handleTurnIntoDoc}
                >
                  <FileText className={stylex.props(styles.sca3de968).className || ''} />
                  <span>Turn into doc</span>
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dialogs */}
      {isMobile && (
        <>
          <MobileTextMarkerDialog
            isOpen={isTextMarkerDialogOpen}
            onClose={() => setIsTextMarkerDialogOpen(false)}
            currentValue={currentGroupType}
            onChange={handleTextMarkerChange}
          />
          <MobileTextTypeDialog
            isOpen={isTextTypeDialogOpen}
            onClose={() => setIsTextTypeDialogOpen(false)}
            currentValue={currentBlockType}
            onChange={handleTextTypeChange}
          />
        </>
      )}
    </>
  )
}
function ToggleStyleButton<Schema extends Record<string, BlockSpec<string, PropSchema>>>({
  editor,
  toggleStyle,
  name,
  icon,
}: {
  editor: BlockNoteEditor<Schema>
  toggleStyle: EditorToggledStyle
  name: string
  icon: any
}) {
  const [active, setActive] = useState<boolean>(toggleStyle in editor.getActiveStyles())
  function toggleCurrentStyle() {
    setActive(toggleStyle in editor.getActiveStyles())
  }
  useEditorContentChange(editor, toggleCurrentStyle)
  useEditorSelectionChange(editor, toggleCurrentStyle)
  function handlePress(style: EditorToggledStyle) {
    editor.focus()
    editor.toggleStyles({
      [toggleStyle]: true,
    })
  }
  return (
    <Tooltip content={name}>
      <Button
        data-testid={`${toggleStyle}-button`}
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          stylex.props(styles.sf79988b7, styles.sad8c742c, styles.se45bb2b0).className || '',
          stylex.props(styles_2.s68989642).className || '',
          stylex.props(styles.s291c6d79).className || '',
          stylex.props(styles_2.se117420b).className || '',
          stylex.props(styles.se8df6f15).className || '',
          stylex.props(styles_2.sa0da43a7).className || '',
          'format-toolbar-item',
          active
            ? stylex.props(styles.s5f36a877, styles.s2daecf89, styles.s291c6e52, styles.s25eca887).className || ''
            : '',
        )}
        onClick={() => {
          console.log('toggleStyle', toggleStyle)
          handlePress(toggleStyle)
        }}
      >
        {icon}
      </Button>
    </Tooltip>
  )
}
