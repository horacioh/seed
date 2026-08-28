import * as stylex from '@stylexjs/stylex'
import {X} from 'lucide-react'
import {ChangeEvent} from 'react'
import {Button} from './button'
import {SizableText} from './text'

/** Props for the ImageForm component. */
const styles_2 = stylex.create({
  sdef3facc: {
    position: 'relative',
  },
  s2ffff9: {
    display: 'flex',
  },
  scdb8b145: {
    width: 'auto',
  },
  s815a054e: {
    alignItems: 'flex-end',
  },
  s27b18d84: {
    alignSelf: 'stretch',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s67010d77: {
    position: 'absolute',
  },
  s478fb0bf: {
    right: 'calc(0.25rem * 0)',
  },
  s696c5b8: {
    top: 'calc(0.25rem * 0)',
  },
  s3824ce: {
    zIndex: '50',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles = stylex.create({
  s5af07b88: {
    backgroundColor: 'var(--muted)',
    flex: '1',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s7d53a800: {
    position: 'relative',
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  s236e44da: {
    color: 'var(--muted-foreground)',
    textAlign: 'center',
  },
  sf8375e72: {
    backgroundColor: 'var(--muted)',
    borderColor: 'var(--border)',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: '50',
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 0)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    opacity: '100%',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export interface ImageFormProps {
  label?: string
  emptyLabel?: string
  suggestedSize?: string
  id?: string
  url?: string
  uploadOnChange?: boolean
  height?: number
  width?: number
  /**
   * Optional async function that uploads a File and resolves to its URL.
   * When omitted and `uploadOnChange` is true, the upload step is skipped.
   */
  fileUpload?: (file: File) => Promise<string>
  onImageUpload?: (avatar: string | File) => Awaited<void>
  onRemove?: () => void
}

/**
 * Form control for selecting, previewing, and optionally uploading an image.
 * Renders an image preview when `url` is set, and an overlaid file input for
 * picking a replacement. Pass `fileUpload` to have the selected file uploaded
 * automatically when `uploadOnChange` is true; omit it to receive the raw File
 * via `onImageUpload` instead.
 */
export function ImageForm({
  url,
  label,
  id,
  onImageUpload,
  onRemove,
  emptyLabel,
  suggestedSize = '1920px x 1080px',
  uploadOnChange = true,
  height,
  width,
  fileUpload,
  ...props
}: ImageFormProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    const fileList = event.target.files
    const file = fileList?.[0]
    if (!file) return
    if (!onImageUpload) return
    if (uploadOnChange) {
      if (!fileUpload) return
      fileUpload(file)
        .then((data) => {
          onImageUpload(data)
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          console.error(`Failed to upload icon: ${message}`, error)
        })
        .finally(() => {
          event.target.value = ''
        })
    } else {
      onImageUpload(file)
    }
  }
  const image = url ? (
    <div className={stylex.props(styles.s5af07b88).className || ''}>
      <img
        alt="Image preview"
        src={url}
        key={url}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          objectFit: 'cover',
        }}
      />
    </div>
  ) : null
  if (!onImageUpload) return image
  return (
    <div
      className={
        stylex.props(
          styles_2.sdef3facc,
          styles_2.s2ffff9,
          styles_2.scdb8b145,
          styles_2.s815a054e,
          styles_2.s27b18d84,
          styles_2.s92852dd5,
          styles_2.sf79988b7,
        ).className || ''
      }
      style={
        width
          ? {
              width,
              flex: 'none',
            }
          : undefined
      }
    >
      <div
        className={stylex.props(styles.s7d53a800).className || ''}
        style={{
          minHeight: height || 60,
        }}
        {...props}
      >
        <input
          type="file"
          onChange={handleFileChange}
          style={{
            opacity: 0,
            display: 'flex',
            position: 'absolute',
            left: 0,
            backgroundColor: 'blue',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 20,
          }}
        />
        {image || (
          <div className={stylex.props(styles.sf8375e72).className || ''}>
            <SizableText size="xs" weight="bold" className={stylex.props(styles.s236e44da).className || ''}>
              {emptyLabel || 'Add Cover'}
            </SizableText>
            <SizableText size="xs" className={stylex.props(styles.s236e44da).className || ''}>
              {suggestedSize}
            </SizableText>
          </div>
        )}
      </div>
      {onRemove && url ? (
        <Button
          size="icon"
          className={
            stylex.props(
              styles_2.s67010d77,
              styles_2.s478fb0bf,
              styles_2.s696c5b8,
              styles_2.s3824ce,
              styles_2.s765a26ee,
            ).className || ''
          }
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
        >
          <X className={stylex.props(styles.sca3de967).className || ''} />
        </Button>
      ) : null}
    </div>
  )
}
