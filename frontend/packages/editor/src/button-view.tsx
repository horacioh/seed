import * as stylex from '@stylexjs/stylex'
import {useOpenUrl} from '@shm/shared'
import {useEditorGate} from '@shm/shared/models/use-editor-gate'
import {Button} from '@shm/ui/button'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import {useEffect, useState} from 'react'
import type {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import type {Block} from './blocknote/core/extensions/Blocks/api/blockTypes'
import {BlockSelectionWrapper} from './block-selection-wrapper'
import {selectBlockNodeById} from './block-utils'
import type {HMBlockSchema} from './schema'
const styles_2 = stylex.create({
  s46fb46da: {
    alignSelf: 'flex-end',
  },
})
const styles = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdbaf625: {
    width: '100%',
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  scdb8b145: {
    width: 'auto',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s29df1839: {
    borderStyle: 'none',
  },
  sc5a0131: {
    borderColor: 'transparent',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  s2f77d9f6: {
    alignSelf: 'center',
  },
  s760cfea1: {
    alignSelf: 'flex-start',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  s2daecf89: {
    color: '#fff',
  },
})
type ButtonAlignment = 'flex-start' | 'center' | 'flex-end'

/**
 * Mutable shape passed to `editor.updateBlock` when the button block's props
 * (url, name, alignment) change.
 */
export type ButtonType = {
  id: string
  props: {
    url: string
    name: string
    alignment?: string
  }
  children: []
  content: []
  type: string
}

/**
 * React view for the button block. Exported separately from
 * `createReactBlockSpec` so it can be unit-tested without pulling in the
 * (circular) full block-schema graph.
 *
 * In read-only mode (or when the user has edit permission but isn't currently
 * editing) clicking the button navigates to `block.props.url` via `useOpenUrl`.
 * In edit mode the click is a no-op so the block can be selected/focused.
 */
export function ButtonBlockView({
  block,
  editor,
}: {
  block: Block<HMBlockSchema>
  editor: BlockNoteEditor<HMBlockSchema>
}) {
  const [alignment, setAlignment] = useState<ButtonAlignment>(
    (block.props.alignment as ButtonAlignment) || 'flex-start',
  )
  const openUrl = useOpenUrl()
  const {canEdit, isEditing} = useEditorGate()

  // Navigate when the document is being viewed (read-only). In edit mode the
  // click should select/focus the block instead, mirroring `embed-block.tsx`.
  const navigateOnClick = !canEdit || !isEditing
  useEffect(() => {
    setAlignment(block.props.alignment as ButtonAlignment)
  }, [block.props.alignment])
  const url = block.props.url
  // In read/view mode navigate to the URL. In edit mode the <button> face
  // swallows the mousedown before ProseMirror (tiptap NodeView.stopEvent), so
  // the block would never node-select on click; select it explicitly here.
  const handleClick = navigateOnClick
    ? url
      ? () => openUrl(url)
      : undefined
    : () => selectBlockNodeById(editor, block.id)
  return (
    <BlockSelectionWrapper editor={editor} block={block} selectOnMouseDown>
      <div
        className={
          stylex.props(styles.s2ffff9, styles.scdbaf625, styles.sfcf3a2ae, styles.sa145969, styles.s67e351ac)
            .className || ''
        }
        style={{
          justifyContent: alignment || 'flex-start',
        }}
      >
        <Button
          variant="brand"
          size="lg"
          className={cn(
            stylex.props(
              styles.scdb8b145,
              styles.sfcf3a2ae,
              styles.sa145969,
              styles.sce22ca32,
              styles.s29df1839,
              styles.sc5a0131,
              styles.s65e234f5,
            ).className || '',
            alignment == 'center'
              ? stylex.props(styles.s2f77d9f6).className || ''
              : alignment == 'flex-end'
                ? stylex.props(styles_2.s46fb46da).className || ''
                : stylex.props(styles.s760cfea1).className || '',
          )}
          onClick={handleClick}
        >
          <SizableText
            size="lg"
            className={
              stylex.props(styles.s6e724d66, styles.s65e234f5, styles.sa1762f51, styles.sa16ea943, styles.s2daecf89)
                .className || ''
            }
          >
            {block.props.name || 'Button Text'}
          </SizableText>
        </Button>
      </div>
    </BlockSelectionWrapper>
  )
}
