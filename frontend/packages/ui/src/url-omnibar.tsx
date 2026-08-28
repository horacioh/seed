import * as stylex from '@stylexjs/stylex'
import {Copy} from 'lucide-react'
import {type ReactNode, useEffect, useRef, useState} from 'react'
import {Button} from './button'
import {toast} from './toast'
import {Tooltip} from './tooltip'
import {cn} from './utils'

/**
 * A read-only, omnibar-styled URL pill: a rounded bordered container showing a
 * URL, with a copy button on the right — matching the main app omnibar's idle
 * look. It is not editable. Clicking it reveals + selects the `copyUrl`
 * (e.g. a shareable gateway link) while resting on `restingUrl` otherwise.
 *
 * Shared so any surface that needs an omnibar-like read-only URL (e.g. the IPFS
 * file viewer) gets the same appearance and copy affordance.
 */
const styles_5 = stylex.create({
  s74bfe3fb: {
    ':is(.dark *)': {
      backgroundColor: '#000',
    },
  },
})
const styles_4 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s9faef944: {
    cursor: 'text',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
  s7c401ed1: {
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  s605ce4a1: {
    backgroundColor: '#fff',
  },
  s3484a2: {
    paddingLeft: 'calc(0.25rem * 3)',
  },
})
const styles_3 = stylex.create({
  s8f38cd18: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
    maxWidth: 'var(--container-2xl)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
})
const styles_2 = stylex.create({
  sc044c117: {
    color: 'var(--muted-foreground)',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    paddingBlock: 'calc(0.25rem * 1.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    outlineStyle: 'none',
  },
})
const styles = stylex.create({
  se452a8c6: {
    marginRight: 'calc(0.25rem * 1)',
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
})
export function OmnibarUrl({
  restingUrl,
  copyUrl,
  copyLabel = 'Copy link',
  rightActions,
  className,
}: {
  /** The URL shown at rest (e.g. `ipfs://<cid>`). */
  restingUrl: string
  /** The URL revealed/selected on click and copied by the button (e.g. a gateway https link). Defaults to `restingUrl`. */
  copyUrl?: string
  copyLabel?: string
  /** Extra controls rendered inside the pill, right of the copy button. */
  rightActions?: ReactNode
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [revealed, setRevealed] = useState(false)
  const reveal = copyUrl ?? restingUrl
  const value = revealed ? reveal : restingUrl

  // Select the revealed text once React has committed the new value.
  useEffect(() => {
    if (revealed) inputRef.current?.select()
  }, [revealed])
  const copy = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(reveal)
    toast.success('Copied link')
  }
  return (
    <div
      className={cn(
        stylex.props(
          styles_4.s1a01a0ed,
          styles_4.s2ffff9,
          styles_4.s3f58665f,
          styles_4.sb42feb5d,
          styles_4.s9faef944,
          styles_4.sc6ed1702,
          styles_4.s5d936fb,
          styles_4.s92852dd5,
          styles_4.s775755af,
          styles_4.s7c401ed1,
          styles_4.s605ce4a1,
          styles_4.s3484a2,
        ).className || '',
        stylex.props(styles_5.s74bfe3fb).className || '',
        'no-window-drag',
        stylex.props(styles_3.s8f38cd18).className || '',
        className,
      )}
      onClick={() => {
        setRevealed(true)
        inputRef.current?.focus()
      }}
    >
      <input
        ref={inputRef}
        readOnly
        value={value}
        spellCheck={false}
        onFocus={() => setRevealed(true)}
        onBlur={() => setRevealed(false)}
        className={stylex.props(styles_2.sc044c117).className || ''}
      />
      <div className={stylex.props(styles.se452a8c6).className || ''} onClick={(e) => e.stopPropagation()}>
        <Tooltip content={copyLabel}>
          <Button variant="ghost" size="iconSm" aria-label={copyLabel} onClick={copy}>
            <Copy className={stylex.props(styles.s3269316e).className || ''} />
          </Button>
        </Tooltip>
        {rightActions}
      </div>
    </div>
  )
}
