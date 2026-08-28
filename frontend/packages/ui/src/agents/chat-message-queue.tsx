import * as stylex from '@stylexjs/stylex'
import {useCallback, useEffect, useRef, useState} from 'react'

/** Manages queued chat messages while a chat backend is busy responding. */
const styles_2 = stylex.create({
  se3f66ed4: {
    color: 'var(--muted-foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '10px',
    fontStyle: 'italic',
  },
})
const styles = stylex.create({
  s717ba5e5: {
    borderColor: 'var(--border)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
  },
})
export function useQueuedChatMessages<Message = string>({
  isBusy,
  onFlush,
}: {
  isBusy: boolean
  onFlush: (messages: Message[]) => void | Promise<void>
}) {
  const queuedMessagesRef = useRef<Message[]>([])
  const [queuedMessages, setQueuedMessages] = useState<Message[]>([])
  const queueMessage = useCallback((message: Message) => {
    queuedMessagesRef.current = [...queuedMessagesRef.current, message]
    setQueuedMessages([...queuedMessagesRef.current])
  }, [])
  const flushQueuedMessages = useCallback(() => {
    if (queuedMessagesRef.current.length === 0) return
    const messages = [...queuedMessagesRef.current]
    queuedMessagesRef.current = []
    setQueuedMessages([])
    void onFlush(messages)
  }, [onFlush])
  useEffect(() => {
    if (!isBusy && queuedMessagesRef.current.length > 0) flushQueuedMessages()
  }, [flushQueuedMessages, isBusy])
  return {
    queuedMessages,
    queueMessage,
    flushQueuedMessages,
  }
}

/** Renders queued chat messages consistently across assistant-like interfaces. */
export function QueuedChatMessages<Message = string>({
  messages,
  getText = (message) => String(message),
}: {
  messages: Message[]
  getText?: (message: Message) => string
}) {
  if (messages.length === 0) return null
  return (
    <div className={stylex.props(styles.s717ba5e5).className || ''}>
      {messages.map((message, index) => (
        <div key={index} className={stylex.props(styles_2.se3f66ed4).className || ''}>
          Queued: {getText(message)}
        </div>
      ))}
    </div>
  )
}
