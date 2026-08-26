import * as stylex from '@stylexjs/stylex'
import {fileUpload} from '@/utils/file-upload'
import {Button} from '@shm/ui/button'
import {SizableText} from '@shm/ui/text'
import {X} from 'lucide-react'
import {ChangeEvent} from 'react'
import appError from '../errors'
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
  s6ea40878: {
    backgroundColor: 'var(--muted)',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: '50',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
    opacity: '100%',
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
  ...props
}: {
  label?: string
  emptyLabel?: string
  suggestedSize?: string
  id?: string
  url?: string
  uploadOnChange?: boolean
  height?: number
  onImageUpload?: (avatar: string | File) => Awaited<void>
  onRemove?: () => void
}) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    const fileList = event.target.files
    const file = fileList?.[0]
    if (!file) return
    if (!onImageUpload) return
    if (uploadOnChange) {
      fileUpload(file)
        .then((data) => {
          onImageUpload(data)
        })
        .catch((error) => {
          appError(`Failed to upload icon: ${error.message}`, {
            error,
          })
        })
        .finally(() => {
          event.target.value = ''
        })
    } else {
      // Just call onImageUpload with the file directly to handle it at the parent level
      onImageUpload(file)
    }
  }
  const image = url ? (
    <div className={stylex.props(styles.s5af07b88).className || ''}>
      <img
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
    <div className="group group-icon relative flex w-auto items-end self-stretch overflow-hidden rounded-md">
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
        {emptyLabel && !url ? (
          <div className={stylex.props(styles.s6ea40878).className || ''}>
            <SizableText size="xs" className={stylex.props(styles.s236e44da).className || ''}>
              {emptyLabel}
            </SizableText>
          </div>
        ) : null}

        {image || (
          <div className={stylex.props(styles.sf8375e72).className || ''}>
            <SizableText size="xs" weight="bold" className={stylex.props(styles.s236e44da).className || ''}>
              {url ? 'Update Cover' : emptyLabel || 'Add Cover'}
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
          className="grouo-hover:pointer-events-all absolute top-0 right-0 z-50 opacity-0 group-hover:opacity-100"
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
