import * as stylex from '@stylexjs/stylex'
import {UIAvatar} from './avatar'
import {Button} from './button'
import {SizableText} from './text'
import {Tooltip} from './tooltip'
import {X} from 'lucide-react'
import {ChangeEvent} from 'react'
const styles_2 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  scdb8b145: {
    width: 'auto',
  },
  s815a054e: {
    alignItems: 'flex-end',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s760cfea1: {
    alignSelf: 'flex-start',
  },
  sd5b893dc: {
    pointerEvents: 'none',
  },
  s67010d77: {
    position: 'absolute',
  },
  sb42244d4: {
    height: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s199f26f5: {
    backgroundColor: 'color-mix(in oklab, #000 30%, transparent)',
  },
  s486c2d2f: {
    opacity: '100%',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles = stylex.create({
  s87ddcc81: {
    position: 'relative',
    overflow: 'hidden',
  },
  sb5bdb794: {
    textAlign: 'center',
    color: '#fff',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export function IconForm({
  url,
  label,
  id,
  size = 140,
  onIconUpload,
  onRemoveIcon,
  emptyLabel,
  marginTop,
  borderRadius = size,
  fileUpload,
  ...props
}: {
  label?: string
  url: string
  id?: string
  emptyLabel?: string
  size?: number
  marginTop?: number
  borderRadius?: number
  onIconUpload?: (avatar: string) => Awaited<void>
  onRemoveIcon?: () => void
  fileUpload?: (file: File) => Promise<string>
}) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    const fileList = event.target.files
    const file = fileList?.[0]
    if (!file) return
    if (!onIconUpload) return
    if (!fileUpload) return
    fileUpload(file)
      .then((data) => {
        onIconUpload(data)
      })
      .catch((error) => {
        console.error(`Failed to upload icon: ${error.message}`, error)
      })
      .finally(() => {
        event.target.value = ''
      })
  }
  const iconImage = <UIAvatar label={label} id={id} url={url} size={size} />
  if (!onIconUpload) return iconImage
  return (
    <div
      className={
        stylex.props(styles_2.s2ffff9, styles_2.scdb8b145, styles_2.s815a054e, styles_2.s5d936fb, styles_2.s760cfea1)
          .className || ''
      }
      data-group="icon"
    >
      <div
        className={stylex.props(styles.s87ddcc81).className || ''}
        style={{
          marginTop,
          width: size,
          height: size,
          borderRadius,
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
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        />
        {emptyLabel && !url ? (
          <div
            className={
              stylex.props(
                styles_2.sd5b893dc,
                styles_2.s67010d77,
                styles_2.s2ffff9,
                styles_2.sb42244d4,
                styles_2.scdbaf625,
                styles_2.sc6ed1702,
                styles_2.sce22ca32,
                styles_2.s5d936fb,
                styles_2.s199f26f5,
                styles_2.s486c2d2f,
              ).className || ''
            }
            style={{
              zIndex: 5,
            }}
          >
            <SizableText size="xs" className={stylex.props(styles.sb5bdb794).className || ''}>
              {emptyLabel}
            </SizableText>
          </div>
        ) : null}
        <div
          className={
            stylex.props(
              styles_2.sd5b893dc,
              styles_2.s67010d77,
              styles_2.s2ffff9,
              styles_2.sb42244d4,
              styles_2.scdbaf625,
              styles_2.sc6ed1702,
              styles_2.sce22ca32,
              styles_2.s5d936fb,
              styles_2.s199f26f5,
              styles_2.s765a26ee,
            ).className || ''
          }
          style={{
            zIndex: 5,
          }}
        >
          <SizableText size="xs" className={stylex.props(styles.sb5bdb794).className || ''}>
            {url ? 'UPDATE' : emptyLabel || 'ADD ICON'}
          </SizableText>
        </div>
        {iconImage}
      </div>
      {onRemoveIcon && url ? (
        <Tooltip content="Remove Icon">
          <Button
            className={stylex.props(styles_2.s765a26ee).className || ''}
            variant="destructive"
            size="sm"
            style={{
              zIndex: 5,
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemoveIcon()
            }}
          >
            <X className={stylex.props(styles.sca3de967).className || ''} />
          </Button>
        </Tooltip>
      ) : null}
    </div>
  )
}
