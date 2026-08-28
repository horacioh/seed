import * as stylex from '@stylexjs/stylex'
import {DAEMON_FILE_UPLOAD_URL, MAX_FILE_SIZE_B, MAX_FILE_SIZE_MB} from '@shm/shared/constants'
import {useEditorGate} from '@shm/shared/models/use-editor-gate'
import {Button} from '@shm/ui/button'
import {Text} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {cn} from '@shm/ui/utils'
import {Node as PMNode} from 'prosemirror-model'
import {NodeSelection} from 'prosemirror-state'
import type {ElementType} from 'react'
import {useRef, useState} from 'react'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import {Block} from './blocknote/core/extensions/Blocks/api/blockTypes'
import {getBlockInfoWithManualOffset} from './blocknote/core/extensions/Blocks/helpers/getBlockInfoFromPos'
import {isInGridContainer} from './blocknote/core/extensions/Blocks/nodes/BlockChildren'
import {MultipleNodeSelection} from './blocknote/core/extensions/SideMenu/MultipleNodeSelection'
import {InlineContent} from './blocknote/react/ReactBlockSpec'
import {markBlockUploaded, MediaType} from './media-render'
import {MediaSelectionMenu} from './media-selection-menu'
import {HMBlockSchema} from './schema'
const styles = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s2f77d9f6: {
    alignSelf: 'center',
  },
  s1cfa2: {
    zIndex: '5',
  },
  sd5b893dc: {
    pointerEvents: 'none',
  },
  s67010d77: {
    position: 'absolute',
  },
  s74a79380: {
    inset: 'calc(0.25rem * 0)',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s11f8a88a: {
    borderColor: 'var(--muted)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sa173a9a1: {
    fontFamily: 'var(--font-mono)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s54eab7e0: {
    opacity: '75%',
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s4ef64aa9: {
    borderColor: 'color-mix(in oklab, var(--foreground) 20%, transparent)',
  },
  s1ca68c72: {
    borderStyle: 'dashed',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s6c2e6c9d: {
    backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
  },
  s478fb0c1: {
    right: 'calc(0.25rem * 2)',
  },
  s696c5ba: {
    top: 'calc(0.25rem * 2)',
  },
  s382452: {
    zIndex: '10',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s83442393: {
    transitionProperty: 'opacity',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  se40e3bb5: {
    ':focus-within': {
      opacity: '100%',
    },
  },
})
interface ContainerProps {
  editor: BlockNoteEditor<HMBlockSchema>
  block: Block<HMBlockSchema>
  mediaType: string
  styleProps?: Object
  assign: any
  children: any
  onHoverIn?: () => void
  onHoverOut?: (e: any) => void
  width?: number | string
  className?: string
  onPress?: (e: Event) => void
  onMediaMouseDown?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  validateFile?: (file: File) => boolean
  onSubmitUrl?: (url: string) => void
  urlMenuLabel?: React.ReactNode
  urlInputPlaceholder?: string
  deleteLabel?: string
  extraMenuContent?: React.ReactNode
}
type BlockRange = {
  blockBeforePos: number
  blockAfterPos: number
  blockContentBeforePos: number
}
function findBlockRangeById(doc: PMNode, blockId: string): BlockRange | null {
  let range: BlockRange | null = null
  doc.descendants((node: PMNode, pos: number) => {
    if (node.type.name !== 'blockNode' || node.attrs?.id !== blockId) return true
    try {
      const blockInfo = getBlockInfoWithManualOffset(node, pos)
      range = {
        blockBeforePos: blockInfo.block.beforePos,
        blockAfterPos: blockInfo.block.afterPos,
        blockContentBeforePos: blockInfo.blockContent.beforePos,
      }
    } catch {
      range = {
        blockBeforePos: pos,
        blockAfterPos: pos + node.nodeSize,
        blockContentBeforePos: pos,
      }
    }
    return false
  })
  return range
}
function findBlockRangeContainingPos(doc: PMNode, targetPos: number): BlockRange | null {
  let range: BlockRange | null = null
  doc.descendants((node: PMNode, pos: number) => {
    if (node.type.name !== 'blockNode') return true
    const blockAfterPos = pos + node.nodeSize
    if (targetPos < pos || targetPos >= blockAfterPos) return true
    try {
      const blockInfo = getBlockInfoWithManualOffset(node, pos)
      range = {
        blockBeforePos: blockInfo.block.beforePos,
        blockAfterPos: blockInfo.block.afterPos,
        blockContentBeforePos: blockInfo.blockContent.beforePos,
      }
    } catch {
      range = {
        blockBeforePos: pos,
        blockAfterPos,
        blockContentBeforePos: pos,
      }
    }
    return false
  })
  return range
}
export const MediaContainer = ({
  editor,
  block,
  mediaType,
  styleProps,
  assign,
  children,
  onHoverIn,
  onHoverOut,
  width = '100%',
  className,
  onPress,
  onMediaMouseDown,
  validateFile,
  onSubmitUrl,
  urlMenuLabel,
  urlInputPlaceholder,
  deleteLabel,
  extraMenuContent,
}: ContainerProps) => {
  const [drag, setDrag] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEmbed = ['embed', 'web-embed'].includes(mediaType)
  // Card/Link embeds render a self-contained card with its own border+shadow,
  // so the MediaContainer chrome frame (border + muted bg) would double up.
  const embedView = isEmbed
    ? (
        block.props as {
          view?: string
        }
      ).view
    : undefined
  const isSelfFramedEmbed = embedView === 'Card' || embedView === 'Link'
  const {canEdit, isEditing, beginEditIfNeeded} = useEditorGate()
  const handleDragReplace = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_B) {
      toast.error(`The size of ${file.name} exceeds ${MAX_FILE_SIZE_MB} MB.`)
      return
    }
    const {name, size} = file
    if (editor.handleFileAttachment) {
      try {
        const result = await editor.handleFileAttachment(file)
        const props: Record<string, any> = {
          name,
          size: size.toString(),
          width: undefined,
        }
        if (result.url) {
          props.url = result.url
          props.displaySrc = ''
        } else if (result.mediaRef) {
          props.mediaRef = typeof result.mediaRef === 'string' ? result.mediaRef : JSON.stringify(result.mediaRef)
          props.url = ''
          if (block.type !== 'file') {
            props.displaySrc = result.displaySrc
          }
        } else {
          props.fileBinary = result.fileBinary
          props.url = ''
          if (block.type !== 'file') {
            props.displaySrc = result.displaySrc
          }
        }
        markBlockUploaded(block.id)
        assign({
          props,
        } as MediaType)
      } catch (error) {
        console.error(`Editor: ${mediaType} replace error: ${error}`)
        toast.error(`Failed to replace ${mediaType}`)
      }
    } else {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await fetch(DAEMON_FILE_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error(`File upload failed (${response.status}): ${await response.text()}`)
        }
        const data = await response.text()
        markBlockUploaded(block.id)
        assign({
          props: {
            url: data ? `ipfs://${data}` : '',
            name,
            size: size.toString(),
            displaySrc: '',
            width: undefined,
          },
        } as MediaType)
      } catch (error) {
        console.error(`Editor: ${mediaType} replace error (daemon): ${file.name}: ${error}`)
        toast.error(`Failed to replace ${mediaType}`)
      }
    }
  }
  const dragProps = {
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer.effectAllowed === 'move') return
      e.preventDefault()
      e.stopPropagation()
      setDrag(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = Array.from(e.dataTransfer.files)[0]
        // @ts-ignore
        if (validateFile && !validateFile(file)) {
          return
        }
        // @ts-ignore
        if (!file.type.includes(`${mediaType}/`) && mediaType !== 'file') {
          toast.error(`The dragged file is not ${mediaType === 'image' ? 'an' : 'a'} ${mediaType}.`)
          return
        }
        // @ts-ignore
        handleDragReplace(file)
        return
      }
    },
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault()
        e.stopPropagation()
        setDrag(true)
      }
    },
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault()
        e.stopPropagation()
        setDrag(true)
      }
    },
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDrag(false)
    },
  }

  // The editor accepts authoring when the user has edit permission
  // or when the editor instance itself is editable
  const canAuthor = editor.renderType !== 'viewer' && (canEdit || editor.isEditable)
  const selectBlock = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as Element | null
    if (
      target?.closest?.(
        'a[href], .link, button, input, textarea, select, [role="button"], [data-media-container-ignore-select]',
      )
    ) {
      return
    }
    const view = editor._tiptapEditor?.view
    if (!view) return

    // Resolve position once just to gate on grid-container membership. The
    // dispatch below re-resolves the range AFTER beginEditIfNeeded, because
    // entering edit mode can synchronously replace the whole doc (draft
    // content differs from published), invalidating any pre-edit positions.
    const preEditRange = findBlockRangeById(view.state.doc, block.id)
    const preEditContentPos = preEditRange?.blockContentBeforePos ?? null
    if (preEditContentPos == null) return
    if (isInGridContainer(view.state, preEditContentPos)) return
    e.preventDefault()
    e.stopPropagation()
    beginEditIfNeeded()
    const targetRange = findBlockRangeById(view.state.doc, block.id)
    const blockContentPos = targetRange?.blockContentBeforePos ?? null
    if (blockContentPos == null) return
    if (e.shiftKey) {
      const currentSelection = view.state.selection
      const anchorRange =
        currentSelection instanceof NodeSelection || currentSelection instanceof MultipleNodeSelection
          ? findBlockRangeContainingPos(view.state.doc, currentSelection.anchor)
          : null
      if (anchorRange && targetRange) {
        const from = Math.min(anchorRange.blockBeforePos, targetRange.blockBeforePos)
        const to = Math.max(anchorRange.blockAfterPos, targetRange.blockAfterPos)
        const $from = view.state.doc.resolve(from)
        const $to = view.state.doc.resolve(to)
        if ($from.depth === $to.depth && $from.node($from.depth).eq($to.node($to.depth))) {
          view.dispatch(
            view.state.tr.setSelection(MultipleNodeSelection.create(view.state.doc, from, to)).scrollIntoView(),
          )
          view.focus()
          return
        }
      }
    }

    // If PM's handleClickOn already node-selected this block's content node on
    // the same click, skip the redundant re-dispatch.
    const currentSelection = view.state.selection
    if (currentSelection instanceof NodeSelection && currentSelection.from === blockContentPos) {
      view.focus()
      return
    }
    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, blockContentPos)).scrollIntoView())
    view.focus()
  }
  const handleImageCaptionKeyDown = (event: React.KeyboardEvent<ElementType>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    event.stopPropagation()
    const cursorPosition = editor.getTextCursorPosition()
    if (cursorPosition.block.id !== block.id) return
    if (cursorPosition.nextBlock) {
      editor.setTextCursorPosition(cursorPosition.nextBlock, 'start')
    } else {
      editor.insertBlocks(
        [
          {
            type: 'paragraph',
            content: '',
          },
        ],
        block.id,
        'after',
      )
      const nextBlock = editor.getTextCursorPosition().nextBlock
      if (nextBlock) editor.setTextCursorPosition(nextBlock, 'start')
    }
    editor.focus()
  }
  const mediaProps = {
    ...styleProps,
    ...(isEmbed || !canAuthor ? {} : dragProps),
    onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onMediaMouseDown) onMediaMouseDown(e)
    },
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onHoverIn) onHoverIn()
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (onHoverOut) onHoverOut(e)
    },
  }
  return (
    <div
      className={
        stylex.props(
          styles.sdef3facc,
          styles.s2ffff9,
          styles.scdbaf625,
          styles.s67e351ac,
          styles.sc6ed1702,
          styles.s5d936fb,
          styles.s2f77d9f6,
        ).className || ''
      }
      // className={cn(
      //   'relative flex w-full flex-col gap-2 self-center',
      //   mediaType === 'file' ? 'items-stretch' : 'items-center',
      // )}
      draggable={canAuthor ? 'true' : 'false'}
      onMouseDownCapture={(e) => {
        // Disable dragging for gestures that begin in the caption.
        const inCaption = !!(e.target as Element | null)?.closest?.('[data-media-container-ignore-select]')
        e.currentTarget.setAttribute('draggable', canAuthor && !inCaption ? 'true' : 'false')
      }}
      onDragStart={(e: any) => {
        // Uncomment to allow drag only if block is selected
        // if (!selected) {
        //   e.preventDefault()
        //   return
        // }
        e.stopPropagation()
        beginEditIfNeeded()
        editor.sideMenu!.blockDragStart(e)
      }}
      onDragEnd={(e: any) => {
        e.stopPropagation()
        editor.sideMenu!.blockDragEnd()
      }}
      onClick={
        onPress
          ? (e) => {
              if (canAuthor && e.shiftKey) {
                selectBlock(e)
                return
              }
              e.preventDefault()
              e.stopPropagation()
              // @ts-expect-error
              onPress(e)
            }
          : canAuthor
            ? selectBlock
            : undefined
      }
    >
      {drag && !isEmbed && (
        <div
          className={
            stylex.props(
              styles.s1cfa2,
              styles.sd5b893dc,
              styles.s67010d77,
              styles.s74a79380,
              styles.s2ffff9,
              styles.sc6ed1702,
              styles.sce22ca32,
            ).className || ''
          }
        >
          <div
            className={
              stylex.props(
                styles.s436dc7b6,
                styles.s11f8a88a,
                styles.sdef3facc,
                styles.s2ffff9,
                styles.sf79988b7,
                styles.s7c401ed1,
                styles.s34b1af,
                styles.s34b56e,
              ).className || ''
            }
          >
            <Text className={stylex.props(styles.sa173a9a1, styles.sab7cc6fa).className || ''}>Drop to replace</Text>
          </div>
          <div
            className={
              stylex.props(styles.s5fd609e3, styles.s67010d77, styles.s74a79380, styles.s2ffff9, styles.s54eab7e0)
                .className || ''
            }
          />
        </div>
      )}
      <div
        className={cn(
          stylex.props(
            styles.sdef3facc,
            styles.s2ffff9,
            styles.scdbaf625,
            styles.sfcf3a2ae,
            styles.s67e351ac,
            styles.sf79988b7,
            styles.sf7fb00e8,
          ).className || '',
          'group',
          drag
            ? stylex.props(styles.s4ef64aa9, styles.s7c401ed1, styles.s1ca68c72).className || ''
            : mediaType === 'image' || mediaType === 'video' || isSelfFramedEmbed
              ? ''
              : stylex.props(styles.s1a01a0ed, styles.s7c401ed1).className || '',
          editor.commentEditor && !drag
            ? stylex.props(styles.s6c2e6c9d).className || ''
            : isSelfFramedEmbed
              ? ''
              : stylex.props(styles.s5fd609e3).className || '',
          className ?? block.type,
        )}
        style={{
          width,
        }}
        {...mediaProps}
        contentEditable={false}
      >
        {mediaType !== 'embed' && editor.renderType !== 'viewer' && canEdit && (mediaType !== 'file' || isEditing) && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === 'file' ? undefined : `${mediaType}/*`}
              style={{
                display: 'none',
              }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (validateFile && !validateFile(file)) return
                handleDragReplace(file)
                e.target.value = ''
              }}
            />
            {onSubmitUrl ? (
              <div
                className={
                  stylex.props(
                    styles.s67010d77,
                    styles.s478fb0c1,
                    styles.s696c5ba,
                    styles.s382452,
                    styles.s765a26ee,
                    styles.s83442393,
                    styles.se40e3bb5,
                  ).className || ''
                }
              >
                <MediaSelectionMenu
                  onReplaceFile={() => fileInputRef.current?.click()}
                  onSubmitUrl={onSubmitUrl}
                  onDelete={() => editor.removeBlocks([block.id])}
                  currentUrl={((block.props as Record<string, unknown>).url as string | undefined) ?? ''}
                  urlMenuLabel={urlMenuLabel ?? 'Insert from URL'}
                  urlInputPlaceholder={urlInputPlaceholder}
                  deleteLabel={deleteLabel}
                  testIdPrefix={mediaType}
                  extraContent={extraMenuContent}
                />
              </div>
            ) : (
              <Button
                variant="accent"
                size="xs"
                className={
                  stylex.props(
                    styles.s67010d77,
                    styles.s478fb0c1,
                    styles.s696c5ba,
                    styles.s382452,
                    styles.s765a26ee,
                    styles.s83442393,
                    styles.se40e3bb5,
                  ).className || ''
                }
                onClick={() => fileInputRef.current?.click()}
              >
                replace
              </Button>
            )}
          </>
        )}
        {children}
      </div>
      {mediaType === 'image' && (
        <InlineContent
          className="image-caption"
          contentEditable={editor.isEditable}
          data-media-container-ignore-select
          onKeyDown={handleImageCaptionKeyDown}
        />
      )}
    </div>
  )
}
