import * as stylex from '@stylexjs/stylex'
import {Button} from '@shm/ui/button'
import {cn} from '@shm/ui/utils'
import {Send} from 'lucide-react'
import React, {useLayoutEffect, useRef} from 'react'

/** Shared multiline chat composer used by assistant and agent session chat inputs. */
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
        className="border-border placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 max-h-48 min-h-10 w-full resize-none overflow-hidden rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
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
