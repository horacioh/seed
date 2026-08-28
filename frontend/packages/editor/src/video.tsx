import * as stylex from '@stylexjs/stylex'
import {useEditorGate} from '@shm/shared/models/use-editor-gate'
import {Switch} from '@shm/ui/components/switch'
import {isIpfsUrl, useFileProxyUrl} from '@shm/ui/get-file-url'
import {ResizeHandle} from '@shm/ui/resize-handle'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {CheckCircle2} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {RiVideoAddLine} from 'react-icons/ri'
import {BlockNoteEditor} from './blocknote/core/BlockNoteEditor'
import {Block} from './blocknote/core/extensions/Blocks/api/blockTypes'
import {defaultProps} from './blocknote/core/extensions/Blocks/api/defaultBlocks'
import {createReactBlockSpec} from './blocknote/react/ReactBlockSpec'
import {MediaContainer} from './media-container'
import {consumeUploaded, DisplayComponentProps, FALLBACK_EDITOR_WIDTH, MediaRender, MediaType} from './media-render'
import {HMBlockSchema} from './schema'
import {isValidUrl, youtubeParser} from './utils'
const styles_2 = stylex.create({
  s68989642: {
    ':is(.dark *)': {
      borderColor: 'color-mix(in oklab, #fff 10%, transparent)',
    },
  },
})
const styles = stylex.create({
  s2c88935f: {
    color: '#000',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  s9b8736ad: {
    display: 'inline-flex',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sf799889b: {
    borderRadius: 'var(--radius)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  se45bb2b0: {
    borderColor: 'color-mix(in oklab, #000 10%, transparent)',
  },
  s63f771a: {
    padding: 'calc(0.25rem * 0.5)',
  },
  s54eab79d: {
    opacity: '50%',
  },
  s3b7916ca: {
    cursor: 'default',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s34b56d: {
    paddingBlock: 'calc(0.25rem * 1)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  sf7fb00e8: {
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s5f3963ff: {
    backgroundColor: 'var(--brand)',
  },
  s2daecf89: {
    color: '#fff',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  sd5b893dc: {
    pointerEvents: 'none',
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
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s34b1ad: {
    paddingInline: 'calc(0.25rem * 2)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s34b1ac: {
    paddingInline: 'calc(0.25rem * 1)',
  },
  sd52b2d2: {
    textTransform: 'uppercase',
  },
  s64e14c29: {
    letterSpacing: '0.025em',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  sdef3facc: {
    position: 'relative',
  },
  sac870708: {
    aspectRatio: '16/9',
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
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  s808fc10e: {
    bottom: 'calc(0.25rem * 0)',
  },
  s478fb0bf: {
    right: 'calc(0.25rem * 0)',
  },
  sd5b2c253: {
    pointerEvents: 'auto',
  },
  sf799897a: {
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  s655b522d: {
    backgroundColor: 'oklch(98.2% 0.018 155.826)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sf1212e4c: {
    color: 'oklch(62.7% 0.194 149.214)',
  },
  sf12135ce: {
    color: 'oklch(44.8% 0.119 151.328)',
  },
})
export const getSourceType = (name: string) => {
  const nameArray = name.split('.')
  const ext = nameArray[nameArray.length - 1]?.toLowerCase()
  if (!ext) return undefined
  // MOV files typically use H.264/AAC codecs that browsers support
  if (ext === 'mov') return 'video/mp4'
  return `video/${ext}`
}
function getVideoIframeSrc(link: string) {
  const url = new URL(link)
  if (url.host.includes('youtube.com')) {
    url.searchParams.set('rel', '0')
    return url.toString()
  }
  return link
}
export const VideoBlock = createReactBlockSpec({
  type: 'video',
  propSchema: {
    ...defaultProps,
    url: {
      default: '',
    },
    fileBinary: {
      default: '',
    },
    displaySrc: {
      default: '',
    },
    mediaRef: {
      default: '', // object with {draftId, mediaId, name, mime, size}
    },
    src: {
      default: '',
    },
    name: {
      default: '',
    },
    width: {
      default: '',
    },
    defaultOpen: {
      values: ['false', 'true'],
      default: 'false',
    },
    autoplay: {
      values: ['false', 'true'],
      default: 'false',
    },
    loop: {
      values: ['false', 'true'],
      default: 'false',
    },
    muted: {
      values: ['false', 'true'],
      default: 'false',
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
  parseHTML: [
    {
      tag: 'video[src]',
      getAttrs: (element) => {
        if (element.closest('[data-content-type="video"]')) return false
        return {
          src: element.getAttribute('src'),
        }
      },
    },
    {
      tag: 'iframe',
      getAttrs: (element) => {
        if (element.closest('[data-content-type="video"]')) return false
        return {
          src: element.getAttribute('src'),
        }
      },
    },
  ],
})
const Render = (block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) => {
  const submitVideo = (url: string, assign: any, setFileName: any) => {
    if (isValidUrl(url)) {
      let embedUrl = 'https://www.youtube.com/embed/'
      if (url.includes('youtu.be') || url.includes('youtube')) {
        let ytId = youtubeParser(url)
        if (ytId) {
          embedUrl = embedUrl + ytId
        } else {
          setFileName({
            name: `Unsupported Youtube Url:${url}`,
            color: 'red',
          })
          return
        }
      } else if (url.includes('vimeo')) {
        const urlArray = url.split('/')
        embedUrl = `https://player.vimeo.com/video/${urlArray[urlArray.length - 1]}`
      } else {
        setFileName({
          name: 'Unsupported video source.',
          color: 'red',
        })
        return
      }
      assign({
        props: {
          url: embedUrl,
        },
      } as MediaType)
    } else
      setFileName({
        name: 'The provided URL is invalid.',
        color: 'red',
      })
    const cursorPosition = editor.getTextCursorPosition()
    editor.focus()
    if (cursorPosition.block.id === block.id) {
      if (cursorPosition.nextBlock) editor.setTextCursorPosition(cursorPosition.nextBlock, 'start')
      else {
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
        editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!, 'start')
      }
    }
  }
  return (
    <MediaRender
      block={block}
      hideForm={!!block.props.url || !!block.props.displaySrc}
      editor={editor}
      mediaType="video"
      submit={submitVideo}
      DisplayComponent={VideoDisplay}
      icon={<RiVideoAddLine className={stylex.props(styles.s2c88935f).className || ''} />}
      validateFile={validateFile}
    />
  )
}
function validateFile(file: File) {
  const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  if (file.type && !supportedTypes.includes(file.type)) {
    toast.error('This video file format is not supported. Upload as a file, or convert the video to .mp4')
    return false
  }
  return true
}
function SegmentedToggle({
  options,
  value,
  onChange,
  disabled,
}: {
  options: {
    label: string
    value: string
  }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        stylex.props(
          styles.s5fd609e3,
          styles.s9b8736ad,
          styles.sc6ed1702,
          styles.sf799889b,
          styles.sad8c742c,
          styles.se45bb2b0,
          styles.s63f771a,
        ).className || '',
        stylex.props(styles_2.s68989642).className || '',
        disabled ? stylex.props(styles.s54eab79d).className || '' : '',
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          className={cn(
            stylex.props(
              styles.s3b7916ca,
              styles.sa145969,
              styles.sf79988b7,
              styles.s34b1ae,
              styles.s34b56d,
              styles.sab7cc79b,
              styles.s129e46b3,
              styles.sf7fb00e8,
            ).className || '',
            value === option.value
              ? stylex.props(styles.s5f3963ff, styles.s2daecf89, styles.s8a6c2a27).className || ''
              : stylex.props(styles.sf2718385, styles.sae6a97a5).className || '',
            disabled ? stylex.props(styles.sd5b893dc).className || '' : '',
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
function VideoOptions({
  autoplay,
  setAutoplay,
  loop,
  setLoop,
  muted,
  setMuted,
}: {
  autoplay: boolean
  setAutoplay: (v: boolean) => void
  loop: boolean
  setLoop: (v: boolean) => void
  muted: boolean
  setMuted: (v: boolean) => void
}) {
  return (
    <div
      className={
        stylex.props(
          styles.s2ffff9,
          styles.scdbaf625,
          styles.s3b7916ca,
          styles.sa145969,
          styles.s67e351ac,
          styles.s5d936fb,
          styles.s34b1ad,
          styles.s34b56e,
          styles.sab7cc6fa,
        ).className || ''
      }
      onSelect={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className={
          stylex.props(
            styles.sf2718385,
            styles.s34b1ac,
            styles.sab7cc79b,
            styles.s129e46b3,
            styles.sd52b2d2,
            styles.s64e14c29,
          ).className || ''
        }
      >
        Video settings
      </div>
      <div
        className={
          stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb, styles.s5d936fb, styles.s34b1ac).className ||
          ''
        }
      >
        <span className={stylex.props(styles.s3b7916ca, styles.sa145969, styles.sab7cc6fa).className || ''}>
          Autoplay
        </span>
        <Switch checked={autoplay} onCheckedChange={setAutoplay} />
      </div>
      <div
        className={
          stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb, styles.s5d936fb, styles.s34b1ac).className ||
          ''
        }
      >
        <span className={stylex.props(styles.s3b7916ca, styles.sa145969, styles.sab7cc6fa).className || ''}>Loop</span>
        <SegmentedToggle
          options={[
            {
              label: 'Once',
              value: 'once',
            },
            {
              label: 'Loop',
              value: 'loop',
            },
          ]}
          value={loop ? 'loop' : 'once'}
          onChange={(v) => setLoop(v === 'loop')}
        />
      </div>
      {autoplay ? (
        <Tooltip content="Autoplay videos must be muted" side="top">
          <div
            className={
              stylex.props(
                styles.s2ffff9,
                styles.sc6ed1702,
                styles.sc1a629cb,
                styles.s5d936fb,
                styles.s34b1ac,
                styles.s54eab79d,
              ).className || ''
            }
          >
            <span className={stylex.props(styles.s3b7916ca, styles.sa145969, styles.sab7cc6fa).className || ''}>
              Sound
            </span>
            <SegmentedToggle
              options={[
                {
                  label: 'Off',
                  value: 'off',
                },
                {
                  label: 'On',
                  value: 'on',
                },
              ]}
              value="off"
              onChange={() => {}}
              disabled
            />
          </div>
        </Tooltip>
      ) : (
        <div
          className={
            stylex.props(styles.s2ffff9, styles.sc6ed1702, styles.sc1a629cb, styles.s5d936fb, styles.s34b1ac)
              .className || ''
          }
        >
          <span className={stylex.props(styles.s3b7916ca, styles.sa145969, styles.sab7cc6fa).className || ''}>
            Sound
          </span>
          <SegmentedToggle
            options={[
              {
                label: 'Off',
                value: 'off',
              },
              {
                label: 'On',
                value: 'on',
              },
            ]}
            value={muted ? 'off' : 'on'}
            onChange={(v) => setMuted(v === 'off')}
          />
        </div>
      )}
    </div>
  )
}
const VideoDisplay = ({editor, block, assign}: DisplayComponentProps) => {
  const getFileUrl = useFileProxyUrl()
  const {canEdit} = useEditorGate()
  const autoplay = block.props.autoplay === 'true'
  const loop = block.props.loop === 'true'
  const muted = block.props.muted === 'true'

  /** Re-embed handler for the selection menu's "Insert from URL" item. */
  const handleMenuUrl = useCallback(
    (url: string) => {
      if (!isValidUrl(url)) {
        toast.error('The provided URL is invalid.')
        return
      }
      let embedUrl = ''
      if (url.includes('youtu.be') || url.includes('youtube')) {
        const ytId = youtubeParser(url)
        if (!ytId) {
          toast.error(`Unsupported YouTube URL: ${url}`)
          return
        }
        embedUrl = `https://www.youtube.com/embed/${ytId}`
      } else if (url.includes('vimeo')) {
        const urlArray = url.split('/')
        embedUrl = `https://player.vimeo.com/video/${urlArray[urlArray.length - 1]}`
      } else {
        toast.error('Unsupported video source. Use a YouTube or Vimeo URL.')
        return
      }
      assign({
        props: {
          url: embedUrl,
          displaySrc: '',
          mediaRef: '',
        },
      } as unknown as MediaType)
    },
    [assign],
  )
  const [showSuccess, setShowSuccess] = useState(() => consumeUploaded(block.id))
  useEffect(() => {
    if (!showSuccess) return
    const timer = setTimeout(() => setShowSuccess(false), 4000)
    return () => clearTimeout(timer)
  }, [showSuccess])
  const setAutoplay = (v: boolean) => {
    if (v) {
      assign({
        props: {
          autoplay: 'true',
          muted: 'true',
        },
      })
    } else {
      assign({
        props: {
          autoplay: 'false',
        },
      })
    }
  }
  const setLoop = (v: boolean) =>
    assign({
      props: {
        loop: v ? 'true' : 'false',
      },
    })
  const setMuted = (v: boolean) =>
    assign({
      props: {
        muted: v ? 'true' : 'false',
      },
    })

  // Determine video source
  const videoSrc = (() => {
    // @ts-ignore
    const displaySrc = block.props.displaySrc
    // @ts-ignore
    const url = block.props.url
    if (displaySrc) {
      return displaySrc
    }
    if (url) {
      // Skip invalid blob URLs from old drafts
      if (url.startsWith('blob:')) {
        console.warn('Skipping invalid blob URL from old draft:', url)
        return ''
      }
      if (isIpfsUrl(url)) {
        return getFileUrl(url)
      }
      return url
    }
    return ''
  })()

  // Min video width in px.
  const minWidth = 256
  let width: number =
    // @ts-ignore
    parseFloat(block.props.width) || editor.domElement?.firstElementChild?.clientWidth || FALLBACK_EDITOR_WIDTH
  const [currentWidth, setCurrentWidth] = useState(width)
  const [showHandle, setShowHandle] = useState(false)
  const resizeParamsRef = useRef<{
    handleUsed: 'left' | 'right'
    initialWidth: number
    initialClientX: number
  } | null>(null)
  useEffect(() => {
    if (block.props.width) {
      width = parseFloat(block.props.width)
      setCurrentWidth(parseFloat(block.props.width))
    } else {
      width = editor.domElement.firstElementChild!.clientWidth
      setCurrentWidth(width)
    }
  }, [block.props.width])
  const windowMouseMoveHandler = (event: MouseEvent) => {
    if (!resizeParamsRef.current) {
      return
    }
    const {handleUsed, initialClientX, initialWidth} = resizeParamsRef.current
    let newWidth: number
    if (handleUsed === 'left') {
      newWidth = initialWidth + (initialClientX - event.clientX) * 2
    } else {
      newWidth = initialWidth + (event.clientX - initialClientX) * 2
    }

    // Ensures the video is not wider than the editor and not smaller than a
    // predetermined minimum width.
    if (newWidth < minWidth) {
      width = minWidth
      setCurrentWidth(minWidth)
    } else if (newWidth > editor.domElement.firstElementChild!.clientWidth) {
      width = editor.domElement.firstElementChild!.clientWidth
      setCurrentWidth(editor.domElement.firstElementChild!.clientWidth)
    } else {
      width = newWidth
      setCurrentWidth(newWidth)
    }
  }

  // Stops mouse movements from resizing the video and updates the block's
  // `width` prop to the new value.
  const windowMouseUpHandler = () => {
    setShowHandle(false)
    if (!resizeParamsRef.current) {
      return
    }
    resizeParamsRef.current = null
    assign({
      props: {
        width: width.toString(),
      },
    })
  }
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => windowMouseMoveHandler(e)
    const handleMouseUp = () => windowMouseUpHandler()
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Hides the resize handles when the cursor leaves the video
  const videoMouseLeaveHandler = () => {
    if (resizeParamsRef.current) {
      return
    }
    setShowHandle(false)
  }

  // Sets the resize params, allowing the user to begin resizing the video by
  // moving the cursor left or right.
  const leftResizeHandleMouseDownHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setShowHandle(true)
    resizeParamsRef.current = {
      handleUsed: 'left',
      // @ts-ignore
      initialWidth: width || parseFloat(block.props.width),
      initialClientX: event.clientX,
    }
    editor.setTextCursorPosition(block.id, 'start')
  }
  const rightResizeHandleMouseDownHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setShowHandle(true)
    resizeParamsRef.current = {
      handleUsed: 'right',
      // @ts-ignore
      initialWidth: width || parseFloat(block.props.width),
      initialClientX: event.clientX,
    }
    editor.setTextCursorPosition(block.id, 'start')
  }
  return (
    <MediaContainer
      editor={editor}
      block={block}
      mediaType="video"
      assign={assign}
      onHoverIn={() => {
        // Suppress resize handles in viewer render type (discussion panel)
        if (editor.renderType !== 'viewer' && (canEdit || editor.isEditable)) {
          setShowHandle(true)
        }
      }}
      onHoverOut={videoMouseLeaveHandler}
      width={currentWidth}
      validateFile={validateFile}
      onSubmitUrl={handleMenuUrl}
      urlMenuLabel={
        <>
          Embed <span className={stylex.props(styles.sf2718385).className || ''}>(YouTube or Vimeo)</span>
        </>
      }
      urlInputPlaceholder="Paste a YouTube or Vimeo URL"
      deleteLabel="Delete video"
      extraMenuContent={
        // Always show the settings while a video is loaded.
        block.props.displaySrc || isIpfsUrl(block.props.url || '') ? (
          <VideoOptions
            autoplay={autoplay}
            setAutoplay={setAutoplay}
            loop={loop}
            setLoop={setLoop}
            muted={muted}
            setMuted={setMuted}
          />
        ) : undefined
      }
    >
      <div className={stylex.props(styles.sdef3facc, styles.sac870708, styles.scdbaf625).className || ''}>
        {showHandle && (
          <>
            <ResizeHandle
              style={{
                left: 4,
              }}
              onMouseDown={leftResizeHandleMouseDownHandler}
            />
            <ResizeHandle
              style={{
                right: 4,
              }}
              onMouseDown={rightResizeHandleMouseDownHandler}
            />
          </>
        )}
        {block.props.displaySrc || isIpfsUrl(block.props.url || '') ? (
          <video
            key={videoSrc}
            contentEditable={false}
            playsInline
            controls
            preload="metadata"
            autoPlay={!editor.isEditable && autoplay}
            loop={!editor.isEditable && loop}
            muted={!editor.isEditable && muted}
            className={
              stylex.props(styles.s67010d77, styles.sbe0abfea, styles.s696c5b8, styles.sb42244d4, styles.scdbaf625)
                .className || ''
            }
          >
            <source
              src={videoSrc}
              // @ts-ignore
              type={getSourceType(block.props.name)}
            />
            <p className={stylex.props(styles.sa1762f51).className || ''}>Error with the video file.</p>
          </video>
        ) : block.props.url ? (
          <iframe
            contentEditable={false}
            className={cn(
              stylex.props(styles.s67010d77, styles.s808fc10e, styles.sbe0abfea, styles.s478fb0bf, styles.s696c5b8)
                .className || '',
              'video-iframe',
              !editor.isEditable || !canEdit ? stylex.props(styles.sd5b2c253).className || '' : '',
              editor.isEditable && canEdit ? stylex.props(styles.sd5b893dc).className || '' : '',
            )}
            src={getVideoIframeSrc(block.props.url)}
            allowFullScreen
            title="Embedded video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : null}
      </div>
      {editor.isEditable && showSuccess && block.props.name && (
        <div
          className={
            stylex.props(
              styles.s2ffff9,
              styles.scdbaf625,
              styles.sc6ed1702,
              styles.s5d936fb,
              styles.sf799897a,
              styles.s655b522d,
              styles.s34b1ae,
              styles.s34b56e,
            ).className || ''
          }
        >
          <CheckCircle2
            className={stylex.props(styles.sca3de968, styles.sf032ed6c, styles.sf1212e4c).className || ''}
          />
          <span className={stylex.props(styles.sa1762f51, styles.sab7cc6fa, styles.sf12135ce).className || ''}>
            {block.props.name} uploaded successfully
          </span>
        </div>
      )}
    </MediaContainer>
  )
}
