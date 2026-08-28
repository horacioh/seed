import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {cn} from '@shm/ui/utils'
import {Send} from 'lucide-react'
import React, {useLayoutEffect, useRef} from 'react'

/** Shared multiline chat composer used by assistant and agent session chat inputs. */
const styles_2 = stylex.create({
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s5b4447b4: {
    ':focus-visible': {
      borderColor: 'var(--ring)',
    },
  },
  sa391181a: {
    ':focus-visible': {},
  },
  s158c30d2: {
    maxHeight: 'calc(0.25rem * 48)',
  },
  sabad943f: {
    minHeight: 'calc(0.25rem * 10)',
  },
  scdbaf625: {
    width: '100%',
  },
  sc9aa04b1: {
    resize: 'none',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s34b1ae: {
    paddingInline: 'calc(0.25rem * 3)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s21f8c65d: {
    ':focus-visible': {
      boxShadow: '0 0 0 3px var(--ring-color, currentcolor)',
    },
  },
  s8b5b6275: {
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  s8658d75b: {
    ':disabled': {
      opacity: '50%',
    },
  },
})
const styles = stylex.create({
  sa13a17a6: {
    backgroundColor: 'var(--panel)',
    display: 'flex',
    flex: 'none',
    alignItems: 'flex-end',
    gap: 'calc(0.25rem * 2)',
    paddingBottom: 'calc(0.25rem * 3)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export function ChatMessageComposer({
  textareaRef,
  value,
  onChange,
  onSend,
  disabled = false,
  sendDisabled = false,
  readOnly = false,
  placeholder = 'Type a message…',
  onFocus,
  onPointerDown,
  actions,
  className,
}: {
  textareaRef?: React.RefObject<HTMLTextAreaElement>
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  sendDisabled?: boolean
  readOnly?: boolean
  placeholder?: string
  onFocus?: () => void
  onPointerDown?: (event: React.PointerEvent<HTMLTextAreaElement>) => void
  actions?: React.ReactNode
  className?: string
}) {
  const localRef = useRef<HTMLTextAreaElement>(null)
  const ref = textareaRef || localRef
  useLayoutEffect(() => {
    if (ref.current) resizeChatComposerTextarea(ref.current)
  }, [ref, value])
  return (
    <div className={cn(stylex.props(styles.sa13a17a6).className || '', className)}>
      <textarea
        ref={ref}
        value={value}
        rows={1}
        readOnly={readOnly}
        disabled={disabled}
        onFocus={onFocus}
        onPointerDown={onPointerDown}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={
          stylex.props(
            styles_2.s1a01a0ed,
            styles_2.s5b4447b4,
            styles_2.sa391181a,
            styles_2.s158c30d2,
            styles_2.sabad943f,
            styles_2.scdbaf625,
            styles_2.sc9aa04b1,
            styles_2.s92852dd5,
            styles_2.sf79988b7,
            styles_2.sad8c742c,
            styles_2.s60f53bca,
            styles_2.s34b1ae,
            styles_2.s34b56e,
            styles_2.sab7cc6fa,
            styles_2.sa602a1e3,
            styles_2.s21f8c65d,
            styles_2.s8b5b6275,
            styles_2.s8658d75b,
          ).className || ''
        }
        onKeyDown={(event) => {
          if (event.key.toLowerCase() === 'a' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            event.stopPropagation()
            event.currentTarget.select()
            return
          }
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSend()
          }
        }}
      />
      {actions ?? (
        <Button onClick={onSend} disabled={disabled || sendDisabled}>
          <Send className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      )}
    </div>
  )
}
function resizeChatComposerTextarea(textarea: HTMLTextAreaElement) {
  const maxHeight = 192
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
}
