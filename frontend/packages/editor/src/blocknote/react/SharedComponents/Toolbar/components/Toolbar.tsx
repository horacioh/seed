import {Group} from '@mantine/core'
import {forwardRef, HTMLAttributes, useEffect, useImperativeHandle, useState} from 'react'

export const Toolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null)
  useImperativeHandle(ref, () => rootElement!, [rootElement])
  useEffect(() => {
    const buttons = rootElement?.querySelectorAll<HTMLButtonElement>('button:not([disabled])')
    if (!buttons?.length) return
    buttons.forEach((button, index) => (button.tabIndex = index === 0 ? 0 : -1))
  }, [rootElement, props.children])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event)
    if (event.defaultPrevented || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
    const buttons = Array.from(rootElement?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (currentIndex < 0) return
    event.preventDefault()
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const next = buttons[(currentIndex + offset + buttons.length) % buttons.length]
    if (!next) return
    buttons.forEach((button) => (button.tabIndex = button === next ? 0 : -1))
    next.focus()
  }

  return (
    <Group
      {...props}
      role="toolbar"
      aria-label={props['aria-label'] || 'Formatting'}
      className={props.className}
      ref={setRootElement}
      onKeyDown={handleKeyDown}
    >
      {props.children}
    </Group>
  )
})
