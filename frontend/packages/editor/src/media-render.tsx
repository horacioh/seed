import * as stylex from '@stylexjs/stylex'
import {DAEMON_FILE_UPLOAD_URL, MAX_FILE_SIZE_B, MAX_FILE_SIZE_MB} from '@shm/shared/constants'
import {useEditorGate} from '@shm/shared/models/use-editor-gate'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Label} from '@shm/ui/components/label'
import {useFileUrl} from '@shm/ui/get-file-url'
import {Upload} from '@shm/ui/icons'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {AlertCircle} from 'lucide-react'
import {ChangeEvent, FunctionComponent, useEffect, useState} from 'react'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import {Block} from './blocknote/core/extensions/Blocks/api/blockTypes'
import {HMBlockSchema} from './schema'
import {BlockSelectionWrapper} from './block-selection-wrapper'
const styles = stylex.create({
  scdbaf625: {
    width: '100%',
  },
  s626516e5: {
    justifyContent: 'flex-start',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  sdef3facc: {
    position: 'relative',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s4ef64aa9: {
    borderColor: 'color-mix(in oklab, var(--foreground) 20%, transparent)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s1ca68c72: {
    borderStyle: 'dashed',
  },
  s6c2e6c9d: {
    backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
  },
  sa40e9ac6: {
    aspectRatio: '16 / 9',
  },
  s4553f062: {
    minHeight: '240px',
  },
  s1cfa2: {
    zIndex: '5',
  },
  s67010d77: {
    position: 'absolute',
  },
  sbe0abfea: {
    left: 'calc(0.25rem * 0)',
  },
  s696c5b8: {
    top: 'calc(0.25rem * 0)',
  },
  sb42244d4: {
    height: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  sda1282c9: {
    backgroundColor: 'color-mix(in oklab, #fff 50%, transparent)',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s74a79380: {
    inset: 'calc(0.25rem * 0)',
  },
  s382452: {
    zIndex: '10',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s7d7f436b: {
    width: 'calc(0.25rem * 10)',
    height: 'calc(0.25rem * 10)',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  saeb12431: {
    backgroundColor: 'oklch(63.7% 0.237 25.331)',
  },
  sca3de969: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
  },
  s2daecf89: {
    color: '#fff',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  sab7cc61b: {
    fontSize: '1.125rem',
    lineHeight: 'var(--text-lg--line-height)',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  s67b8c9a3: {
    color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
  },
  s33458b: {
    marginTop: 'calc(0.25rem * 1)',
  },
  sb9bd3a30: {
    fontStyle: 'italic',
  },
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  s3b7916ca: {
    cursor: 'default',
  },
  sb42feb5d: {
    flex: '1',
  },
  s168882a6: {
    borderColor: 'color-mix(in oklab, var(--muted-foreground) 30%, transparent)',
  },
  s5b4447b4: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
    },
  },
  sfcf3a2ae: {
    maxWidth: '100%',
  },
  s3484a2: {
    paddingLeft: 'calc(0.25rem * 3)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s78c4ca8e: {
    color: 'var(--primary-foreground)',
  },
  s34a2a9: {
    paddingTop: 'calc(0.25rem * 2)',
  },
  s8ce93e47: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
  },
  s90af7e46: {
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
      },
    },
  },
  s37120a61: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
  },
  s2ff5a6: {
    height: 'calc(0.25rem * 12)',
  },
  sc7847ec6: {
    cursor: 'pointer',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf8e652db: {
    whiteSpace: 'nowrap',
  },
  s129e46b3: {
    fontWeight: '500',
  },
})
export type MediaType = {
  id: string
  props: {
    url?: string
    fileBinary?: Uint8Array
    displaySrc?: string
    name: string
    size?: string
    view?: 'Content' | 'Card'
    width?: string
  }
  children: []
  content: []
  type: string
}
export interface DisplayComponentProps {
  editor: BlockNoteEditor<HMBlockSchema>
  block: Block<HMBlockSchema>
  assign?: any
}

/**
 * Editor content width assumed during server rendering, where no mounted
 * editor exists to measure. Percentage-based media widths are unaffected;
 * only absolute-px widths use it, and the value approximates the web
 * reading column so the hydration correction is minimal.
 */
export const FALLBACK_EDITOR_WIDTH = 640
const uploadedBlockIds = new Set<string>()
export function markBlockUploaded(blockId: string) {
  uploadedBlockIds.add(blockId)
}
export function consumeUploaded(blockId: string): boolean {
  if (uploadedBlockIds.has(blockId)) {
    uploadedBlockIds.delete(blockId)
    return true
  }
  return false
}
interface RenderProps {
  block: Block<HMBlockSchema>
  editor: BlockNoteEditor<HMBlockSchema>
  mediaType: string
  submit?: (url: string, assign: any, setFileName: any, setLoading: any) => Promise<void> | void | undefined
  icon:
    | JSX.Element
    | FunctionComponent<{
        color?: string
        size?: number
      }>
  DisplayComponent: React.ComponentType<DisplayComponentProps>
  CustomInput?: React.ComponentType<{
    editor: BlockNoteEditor<HMBlockSchema>
    assign: any
    setUrl: any
    fileName: any
    setFileName: any
    submit?: (url: string, assign: any, setFileName: any, setLoading: any) => Promise<void> | void | undefined
    setLoading?: any
  }>
  hideForm?: boolean
  validateFile?: (file: File) => boolean
}
export const MediaRender: React.FC<RenderProps> = ({
  block,
  editor,
  mediaType,
  submit,
  DisplayComponent,
  CustomInput,
  icon,
  hideForm,
  validateFile,
}) => {
  const [uploading, setUploading] = useState(false)
  const hasSrc = !!block.props?.src
  const {canEdit, beginEditIfNeeded} = useEditorGate()
  useEffect(() => {
    if (!uploading && hasSrc && editor.importWebFile && block.props.src) {
      // @ts-ignore
      if (block.props.src.startsWith('ipfs')) {
        editor.updateBlock(block, {
          props: {
            url: block.props.src,
            src: '',
          },
        })
        return
      }
      setUploading(true)
      editor
        .importWebFile(block.props.src)
        .then((imageData) => {
          setUploading(false)
          // Desktop result
          if ('cid' in imageData) {
            editor.updateBlock(block, {
              props: {
                url: `ipfs://${imageData.cid}`,
                size: imageData.size.toString(),
                src: '',
              },
            })
          }
          // Web result
          else if ('displaySrc' in imageData && 'fileBinary' in imageData) {
            editor.updateBlock(block, {
              props: {
                displaySrc: imageData.displaySrc,
                // @ts-expect-error - schema defines fileBinary as string but it's actually Uint8Array
                fileBinary: imageData.fileBinary,
                size: imageData.size?.toString() || '',
                src: '',
              },
            })
          }
        })
        .catch((e: any) => {
          console.error('Failed to import web file:', e)
          setUploading(false)
        })
    }
  }, [hasSrc, block, uploading, editor, editor.importWebFile])
  const assignMedia = (props: MediaType) => {
    beginEditIfNeeded()
    // we used to spread the current block.props into the new props, but now we just overwrite the whole thing because it was causing bugs
    // @ts-expect-error
    editor.updateBlock(block.id, props)
  }
  if (hasSrc || uploading) {
    // this means we have a URL in the props.url that is not starting with `ipfs://`, which means we are uploading the image to IPFS
    return (
      <Button
        contentEditable={false}
        size="lg"
        className={stylex.props(styles.scdbaf625, styles.s626516e5).className || ''}
      >
        uploading...
      </Button>
    )
  }
  return (
    <BlockSelectionWrapper editor={editor} block={block}>
      <div className={stylex.props(styles.s2ffff9, styles.scdbaf625, styles.s67e351ac).className || ''}>
        {hideForm ? (
          <MediaComponent block={block} editor={editor} assign={assignMedia} DisplayComponent={DisplayComponent} />
        ) : editor.renderType !== 'viewer' && (canEdit || editor.isEditable) ? (
          // The editor accepts authoring when the user has edit permission
          // or when the editor instance itself is editable
          <MediaForm
            block={block}
            assign={assignMedia}
            editor={editor}
            mediaType={mediaType}
            CustomInput={CustomInput}
            submit={submit}
            icon={icon}
            validateFile={validateFile}
          />
        ) : (
          <></>
        )}
      </div>
    </BlockSelectionWrapper>
  )
}
function MediaComponent({
  block,
  editor,
  assign,
  DisplayComponent,
}: {
  block: Block<HMBlockSchema>
  editor: BlockNoteEditor<HMBlockSchema>
  assign: any
  DisplayComponent: React.ComponentType<DisplayComponentProps>
}) {
  return <DisplayComponent editor={editor} block={block} assign={assign} />
}
function MediaForm({
  block,
  assign,
  editor,
  mediaType,
  submit,
  icon,
  CustomInput,
  validateFile,
}: {
  block: Block<HMBlockSchema>
  assign: any
  editor: BlockNoteEditor<HMBlockSchema>
  mediaType: string
  submit?: (url: string, assign: any, setFileName: any, setLoading: any) => Promise<void> | void | undefined
  icon:
    | JSX.Element
    | FunctionComponent<{
        color?: string
        size?: number
      }>
    | null
  CustomInput?: React.ComponentType<{
    editor: BlockNoteEditor<HMBlockSchema>
    assign: any
    setUrl: any
    fileName: any
    setFileName: any
    submit?: (url: string, assign: any, setFileName: any, setLoading: any) => Promise<void> | void | undefined
    setLoading?: any
  }>
  validateFile?: (file: File) => boolean
}) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadState, setUploadState] = useState<
    | {
        status: 'idle'
      }
    | {
        status: 'uploading'
        fileName: string
      }
    | {
        status: 'error'
        title: string
        message: string
        hint?: string
      }
  >({
    status: 'idle',
  })
  const isEmbed = ['embed', 'web-embed'].includes(mediaType)
  const [fileName, setFileName] = useState<{
    name: string
    color: string | undefined
  }>({
    name: 'Upload File',
    color: undefined,
  })
  const [drag, setDrag] = useState(false)
  const dragProps = {
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (drag) setDrag(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (mediaType === 'file') {
          const files = Array.from(e.dataTransfer.files)
          handleUpload(Array.from(files))
          return
        }
        let isMedia = true
        const files = Array.from(e.dataTransfer.files)
        files.forEach((file) => {
          if (!file.type.includes(`${mediaType}/`)) {
            setFileName({
              name: `File ${file.name.length < 36 ? file.name : file.name.slice(0, 32) + '…'} is not ${
                mediaType === 'image' ? 'an' : 'a'
              } ${mediaType}.`,
              color: 'red',
            })
            isMedia = false
            return
          }
        })
        if (isMedia) handleUpload(Array.from(files))
        return
      }
    },
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      e.preventDefault()
      e.stopPropagation()
      if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
        setDrag(true)
      }
    },
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      e.preventDefault()
      e.stopPropagation()
      if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
        setDrag(false)
      }
    },
  }
  const getFileUrl = useFileUrl()
  const handleUpload = async (files: File[]) => {
    const file = files[0]
    if (!file) {
      throw new Error('No file selected')
    }
    if (validateFile && !validateFile(file)) {
      throw new Error('File is not valid')
    }
    if (file.size > MAX_FILE_SIZE_B) {
      const fileSizeGB = file.size / (1024 * 1024 * 1024)
      const fileSizeMB = file.size / (1024 * 1024)
      const fileSizeStr = fileSizeGB >= 1 ? `${fileSizeGB.toFixed(1)} GB` : `${fileSizeMB.toFixed(0)} MB`
      setUploadState({
        status: 'error',
        title: 'File too large',
        message: `Your ${mediaType} is ${fileSizeStr}.\nMaximum accepted size is ${MAX_FILE_SIZE_MB} MB.`,
        hint: `Try compressing or trimming the ${mediaType} first.`,
      })
      return
    }
    setUploadState({
      status: 'uploading',
      fileName: file.name,
    })
    const {name, size} = file
    try {
      if (editor.handleFileAttachment) {
        const result = await editor.handleFileAttachment(file)
        const props: Record<string, any> = {
          name,
          size: size.toString(),
        }
        if (result.url) {
          props.url = result.url
        } else if (result.mediaRef) {
          props.mediaRef = typeof result.mediaRef === 'string' ? result.mediaRef : JSON.stringify(result.mediaRef)
          if (block.type !== 'file') {
            props.displaySrc = result.displaySrc
          }
        } else {
          props.fileBinary = result.fileBinary
          if (block.type !== 'file') {
            props.displaySrc = result.displaySrc
          }
        }
        markBlockUploaded(block.id)
        assign({
          props,
        } as MediaType)
      } else {
        // upload to IPFS immediately if handleFileAttachment is not available
        const formData = new FormData()
        // @ts-ignore
        formData.append('file', files[0])
        const response = await fetch(DAEMON_FILE_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Server error: ${response.status} - ${errorText}`)
        }
        const responseCID = await response.text()
        if (!responseCID) {
          throw new Error('Failed to upload file to IPFS: No CID returned')
        }
        const ipfsUrl = `ipfs://${responseCID}`
        markBlockUploaded(block.id)
        assign({
          props: {
            url: ipfsUrl,
            displaySrc: getFileUrl(ipfsUrl),
            name,
            size: size.toString(),
          },
        } as MediaType)
      }
    } catch (error) {
      console.error(`Editor: ${mediaType} upload error: ${error}`)
      setUploadState({
        status: 'error',
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred.',
      })
    }
  }
  const isActiveUpload = uploadState.status === 'uploading' || uploadState.status === 'error'
  return (
    <div
      className={cn(
        stylex.props(
          styles.s5fd609e3,
          styles.sdef3facc,
          styles.s2ffff9,
          styles.s67e351ac,
          styles.sf79988b7,
          styles.s7c401ed1,
          styles.sa602a1e3,
          styles.sf7fb00e8,
        ).className || '',
        drag ? stylex.props(styles.s4ef64aa9).className || '' : stylex.props(styles.s1a01a0ed).className || '',
        drag ? stylex.props(styles.s1ca68c72).className || '' : '',
        editor.commentEditor && !drag ? stylex.props(styles.s1a01a0ed, styles.s6c2e6c9d).className || '' : '',
        isActiveUpload && mediaType !== 'file' ? stylex.props(styles.sa40e9ac6).className || '' : '',
        isActiveUpload && mediaType === 'file' ? stylex.props(styles.s4553f062).className || '' : '',
      )}
      {...(isEmbed ? {} : dragProps)}
      contentEditable={false}
    >
      {drag && !isEmbed && (
        <div
          className={
            stylex.props(
              styles.s1cfa2,
              styles.s67010d77,
              styles.sbe0abfea,
              styles.s696c5b8,
              styles.s2ffff9,
              styles.sb42244d4,
              styles.scdbaf625,
              styles.sc6ed1702,
              styles.sce22ca32,
              styles.sf799897a,
              styles.sda1282c9,
              styles.sa1762f51,
            ).className || ''
          }
        >
          <SizableText weight="bold">DROP MEDIA HERE</SizableText>
        </div>
      )}
      {uploadState.status === 'uploading' && (
        <div
          className={
            stylex.props(
              styles.s436dc7b6,
              styles.s67010d77,
              styles.s74a79380,
              styles.s382452,
              styles.s2ffff9,
              styles.s67e351ac,
              styles.sc6ed1702,
              styles.sce22ca32,
              styles.s5d936fc,
              styles.s92852dd5,
              styles.sf799897a,
              styles.s1aa17,
              styles.s65e234f5,
              styles.sa1762f51,
            ).className || ''
          }
        >
          <Spinner size="large" />
          <span className={stylex.props(styles.sf2718385, styles.s6e724d66, styles.sab7cc6fa).className || ''}>
            {uploadState.fileName}
          </span>
        </div>
      )}
      {uploadState.status === 'error' && (
        <div
          className={
            stylex.props(
              styles.s436dc7b6,
              styles.s67010d77,
              styles.s74a79380,
              styles.s382452,
              styles.s2ffff9,
              styles.s67e351ac,
              styles.sc6ed1702,
              styles.sce22ca32,
              styles.s5d936fb,
              styles.s92852dd5,
              styles.sf799897a,
              styles.s1aa17,
              styles.s65e234f5,
              styles.sa1762f51,
            ).className || ''
          }
        >
          <div
            className={
              stylex.props(
                styles.s2ffff9,
                styles.s7d7f436b,
                styles.sc6ed1702,
                styles.sce22ca32,
                styles.s775755af,
                styles.saeb12431,
              ).className || ''
            }
          >
            <AlertCircle className={stylex.props(styles.sca3de969, styles.s2daecf89).className || ''} />
          </div>
          <span className={stylex.props(styles.sc05281e3, styles.sab7cc61b, styles.s62c182b1).className || ''}>
            {uploadState.title}
          </span>
          {uploadState.message.split('\n').map((line, i) => (
            <span key={i} className={stylex.props(styles.sf2718385, styles.sab7cc6fa).className || ''}>
              {line}
            </span>
          ))}
          {uploadState.hint && (
            <span
              className={
                stylex.props(styles.s67b8c9a3, styles.s33458b, styles.sab7cc6fa, styles.sb9bd3a30).className || ''
              }
            >
              {uploadState.hint}
            </span>
          )}
          <button
            type="button"
            className={
              stylex.props(styles.sf2718385, styles.sae6a97a5, styles.s33458c, styles.s3b7916ca, styles.sab7cc6fa)
                .className || ''
            }
            onClick={() =>
              setUploadState({
                status: 'idle',
              })
            }
          >
            Try again
          </button>
        </div>
      )}
      <div className={stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sf799897a, styles.s1aa17).className || ''}>
        {mediaType !== 'file' ? (
          <div className={stylex.props(styles.s2ffff9, styles.sb42feb5d, styles.s67e351ac).className || ''}>
            <div
              className={
                stylex.props(styles.s2ffff9, styles.scdbaf625, styles.sb42feb5d, styles.s5d936fc).className || ''
              }
            >
              {CustomInput ? (
                <CustomInput
                  editor={editor}
                  assign={assign}
                  setUrl={setUrl}
                  fileName={fileName}
                  setFileName={setFileName}
                  submit={submit}
                  setLoading={setLoading}
                />
              ) : (
                <Input
                  className={
                    stylex.props(styles.s168882a6, styles.s5b4447b4, styles.sc05281e3, styles.sfcf3a2ae, styles.s3484a2)
                      .className || ''
                  }
                  placeholder={`Input ${mediaType === 'web-embed' ? 'X.com or Instagram' : mediaType} URL here…`}
                  onChangeText={(text) => {
                    setUrl(text)
                    if (fileName.color)
                      setFileName({
                        name: 'Upload File',
                        color: undefined,
                      })
                  }}
                  onPaste={(e) => {
                    // Prevent ProseMirror's editor-level paste handlers (link, markdown,
                    // local-media) from intercepting paste events inside this nested
                    // <input>. Without this, those handlers call preventDefault and the
                    // native input never receives the pasted text.
                    e.stopPropagation()
                  }}
                  autoFocus
                />
              )}
              {['image', 'video'].includes(mediaType) ? (
                <>
                  <Tooltip content="Select file if the input is empty" side="top">
                    <Button
                      variant="default"
                      size="sm"
                      className={stylex.props(styles.sf032ed6c, styles.s62c182b1).className || ''}
                      disabled={fileName.color === 'red'}
                      onClick={() => {
                        if (url) {
                          // Submit the form if the input is not empty
                          submit!(url, assign, setFileName, setLoading)
                        } else {
                          // Trigger the file picker dialog if input is empty
                          document.getElementById('file-upload' + block.id)?.click()
                        }
                      }}
                    >
                      {loading ? (
                        <Spinner size="small" className={stylex.props(styles.s78c4ca8e).className || ''} />
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  </Tooltip>
                  <input
                    id={'file-upload' + block.id}
                    type="file"
                    multiple
                    accept={mediaType !== 'file' ? `${mediaType}/*` : undefined}
                    style={{
                      display: 'none',
                    }}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      if (event.target.files) {
                        handleUpload(Array.from(event.target.files))
                      }
                    }}
                  />
                </>
              ) : (
                <Button
                  contentEditable={false}
                  variant="default"
                  size="sm"
                  className={stylex.props(styles.sf032ed6c, styles.s62c182b1).className || ''}
                  style={{
                    backgroundColor: fileName.color === 'red' ? 'text-muted-foreground/60' : 'text-muted-foreground',
                  }}
                  disabled={fileName.color === 'red'}
                  onClick={() => {
                    if (url) {
                      submit!(url, assign, setFileName, setLoading)
                    }
                  }}
                >
                  {loading ? (
                    <Spinner size="small" className={stylex.props(styles.s78c4ca8e).className || ''} />
                  ) : (
                    'Upload'
                  )}
                </Button>
              )}
            </div>
            {fileName.color && fileName.color === 'red' && (
              <SizableText
                size="sm"
                color="destructive"
                className={stylex.props(styles.s34a2a9, styles.sa1762f51).className || ''}
              >
                {fileName.name}
              </SizableText>
            )}
          </div>
        ) : (
          <div
            className={
              stylex.props(
                styles.s168882a6,
                styles.s8ce93e47,
                styles.s90af7e46,
                styles.s37120a61,
                styles.s2ffff9,
                styles.s2ff5a6,
                styles.scdbaf625,
                styles.sc7847ec6,
                styles.sc6ed1702,
                styles.sce22ca32,
                styles.sf79988b7,
                styles.s7c401ed1,
                styles.sf7fb00e8,
              ).className || ''
            }
          >
            <Label
              contentEditable={false}
              htmlFor={'file-upload' + block.id}
              className={
                stylex.props(
                  styles.s2ffff9,
                  styles.sb42244d4,
                  styles.scdbaf625,
                  styles.sc7847ec6,
                  styles.sa145969,
                  styles.sc6ed1702,
                  styles.sce22ca32,
                  styles.s5d936fb,
                ).className || ''
              }
            >
              {!drag && (
                <>
                  <Upload className={stylex.props(styles.sca3de968).className || ''} />
                  <SizableText
                    className={
                      stylex.props(styles.s92852dd5, styles.s6e724d66, styles.sf8e652db, styles.s129e46b3).className ||
                      ''
                    }
                  >
                    Upload File
                  </SizableText>
                </>
              )}
            </Label>
            <input
              id={'file-upload' + block.id}
              type="file"
              multiple
              style={{
                // background: 'white',
                // padding: '0 2px',
                display: 'none',
              }}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) {
                  handleUpload(Array.from(event.target.files))
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
