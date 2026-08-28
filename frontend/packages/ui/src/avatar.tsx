import * as stylex from '@stylexjs/stylex'
import * as jdenticon from 'jdenticon'
import {memo, useEffect, useRef} from 'react'
import {SizableText} from './text'
import {cn} from './utils'
const styles_4 = stylex.create({
  s356a30: {
    boxShadow: '0 0 0 1px var(--ring-color, currentcolor)',
  },
})
const styles_3 = stylex.create({
  se7f994a4: {
    minHeight: '100%',
    minWidth: '100%',
    backgroundColor: 'var(--color1)',
    objectFit: 'cover',
  },
})
const styles_2 = stylex.create({
  sc7847ec6: {
    cursor: 'pointer',
  },
})
const styles = stylex.create({
  s606bb034: {
    position: 'relative',
    zIndex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sa4dc7226: {
    display: 'block',
    textAlign: 'center',
    color: '#000',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
})
jdenticon.configure({
  hues: [151],
  lightness: {
    color: [0.35, 0.5],
    grayscale: [0.55, 0.55],
  },
  saturation: {
    color: 0.54,
    grayscale: 0.5,
  },
  backColor: '#0000',
})

/**
 * This component generates an arbitrary but deterministic SVG icon based on the given value.
 * Useful as a placeholder for users without avatars.
 * It's much better than a generic avatar because users without names, or with the same name could be distinguished,
 * as the identicon is based on their ID.
 */
const Identicon = memo((props: {value: string; size: number}) => {
  const icon = useRef(null)
  useEffect(() => {
    if (!icon.current) return
    try {
      jdenticon.update(icon.current, props.value)
    } catch {
      // jdenticon.update() is browser-only (DOM mutation); ignore in SSR / test
      // environments where it throws "not supported on Node.js".
    }
  }, [props.value, props.size])
  return <svg data-jdenticon-value={props.value} height={props.size} width={props.size} ref={icon} {...props} />
})
export type UIAvatarProps = {
  size?: number
  label?: string
  onPress?: () => void
  className?: string
} & (
  | {
      url: string
      id: string
    } // At least url or id must be provided, but both are fine too.
  | {
      url?: string
      id: string
    }
  | {
      url: string
      id?: string
    }
)
export function UIAvatar({url, id, label, size = 20, onPress, className}: UIAvatarProps) {
  let text = label ? label[0] : id ? id[0] : '?'
  return (
    <div
      className={cn(
        stylex.props(styles.s606bb034).className || '',
        stylex.props(onPress && styles_2.sc7847ec6).className || '',
        !url ? stylex.props(styles_4.s356a30).className || '' : '',
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
      onClick={onPress}
    >
      {id && !url ? (
        <Identicon value={id} size={size} />
      ) : url ? (
        <img
          src={url}
          className={stylex.props(styles_3.se7f994a4).className || ''}
          alt={label || id || 'Account Avatar'}
        />
      ) : (
        <SizableText
          weight="semibold"
          className={stylex.props(styles.sa4dc7226).className || ''}
          style={{
            fontSize: size * 0.55,
            width: size / 2,
            height: size / 2,
            lineHeight: `${size / 2}px`,
          }}
        >
          {text?.toUpperCase() || '?'}
        </SizableText>
      )}
    </div>
  )
}
export function getRandomColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 6) - hash)
    hash = hash & hash // Convert to 32bit integer
  }
  const shortened = hash % 360
  return `hsl(${shortened},60%,80%)`
}
