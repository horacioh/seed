import * as stylex from '@stylexjs/stylex'
import {useUniversalAppContext} from '@shm/shared'
import {useEditorGate} from '@shm/shared/models/use-editor-gate'
import {formatBytes} from '@shm/shared/utils/format-bytes'
import {Button} from '@shm/ui/button'
import {extractIpfsUrlCid, getDaemonFileUrl} from '@shm/ui/get-file-url'
import {File} from '@shm/ui/icons'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import {Block, BlockNoteEditor, defaultProps} from './blocknote/core'
import {createReactBlockSpec} from './blocknote/react'
import {MediaContainer} from './media-container'
import {DisplayComponentProps, MediaRender} from './media-render'
import {HMBlockSchema} from './schema'
const styles_2 = stylex.create({
  sf4e42823: {
    ':is([class~="group"]:hover *)': {
      opacity: '100%',
    },
  },
})
const styles = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  scdbaf625: {
    width: '100%',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s626516e5: {
    justifyContent: 'flex-start',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56f: {
    paddingBlock: 'calc(0.25rem * 3)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sf8e652db: {
    whiteSpace: 'nowrap',
  },
  s34a2a8: {
    paddingTop: 'calc(0.25rem * 1)',
  },
  s67010d77: {
    position: 'absolute',
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
export const FileBlock = createReactBlockSpec({
  type: 'file',
  propSchema: {
    ...defaultProps,
    url: {
      default: '',
    },
    fileBinary: {
      default: '',
    },
    mediaRef: {
      default: '', // object with {draftId, mediaId, name, mime, size}
    },
    name: {
      default: '',
    },
    src: {
      default: '',
    },
    defaultOpen: {
      values: ['false', 'true'],
      default: 'false',
    },
    size: {
      default: '0',
    },
  },
  // No inline content is ever rendered for this block: a leaf node (like
  // query) lets browsers represent its NodeSelection cleanly instead of
  // bouncing the DOM selection into phantom editable positions, and removes
  // the invisible-content merge/caret traps.
  containsInlineContent: false,
  selectable: true,
  // @ts-ignore
  render: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) =>
    Render(block, editor),
})
const Render = (block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) => {
  return (
    <MediaRender
      block={block}
      hideForm={!!block.props.url || !!block.props.fileBinary || !!block.props.mediaRef}
      editor={editor}
      mediaType="file"
      DisplayComponent={FileDisplay}
      icon={<File />}
    />
  )
}
const FileDisplay = ({editor, block, assign}: DisplayComponentProps) => {
  const {saveCidAsFile} = useUniversalAppContext()
  const {isEditing} = useEditorGate()
  const url: string = block.props.url || ''
  const fileCid = url ? extractIpfsUrlCid(url) : ''
  const fileName: string = block.props.name || 'File'
  const showDownload = !!fileCid && !isEditing
  return (
    <MediaContainer editor={editor} block={block} mediaType="file" assign={assign}>
      <div className={stylex.props(styles.sdef3facc, styles.scdbaf625).className || ''}>
        <Button
          className={
            stylex.props(styles.scdbaf625, styles.sa145969, styles.s626516e5, styles.s34b1af, styles.s34b56f)
              .className || ''
          }
          disabled
        >
          <File className={stylex.props(styles.sca3de968, styles.sf032ed6c).className || ''} />
          <SizableText
            size="md"
            className={
              stylex.props(styles.s3f58665f, styles.sb42feb5d, styles.s92852dd5, styles.s6e724d66, styles.sf8e652db)
                .className || ''
            }
          >
            {block.props.name}
          </SizableText>
          <SizableText
            className={stylex.props(styles.sf032ed6c, styles.s34a2a8).className || ''}
            color="muted"
            size="sm"
          >
            {/* @ts-ignore */}
            {formatBytes(parseInt(block.props.size))}
          </SizableText>
        </Button>
        {showDownload && (
          <Button
            variant="accent"
            size="xs"
            className={cn(
              stylex.props(
                styles.s67010d77,
                styles.s478fb0c1,
                styles.s696c5ba,
                styles.s382452,
                styles.s765a26ee,
                styles.s83442393,
                styles.se40e3bb5,
              ).className || '',
              stylex.props(styles_2.sf4e42823).className || '',
              'sel-btn',
            )}
            asChild
          >
            {saveCidAsFile ? (
              <a
                download
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  saveCidAsFile(fileCid, fileName)
                }}
              >
                download
              </a>
            ) : (
              <a
                href={getDaemonFileUrl(url, fileName)}
                onClick={(e) => {
                  e.stopPropagation()
                }}
                download={fileName}
              >
                download
              </a>
            )}
          </Button>
        )}
      </div>
    </MediaContainer>
  )
}
