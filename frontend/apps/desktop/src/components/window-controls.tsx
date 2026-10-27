import {useWindowUtils} from '@/app-context'
import {Button} from '@shm/ui/button'
import {X} from 'lucide-react'
import type {ComponentProps} from 'react'

export function CloseButton() {
  const {close} = useWindowUtils()
  return (
    <ButtonWrapper aria-label="Close window" onClick={close}>
      <X className="size-3" />
    </ButtonWrapper>
  )
}

export function MaximizeOrRestoreButton() {
  const {isMaximized, maximize, unmaximize} = useWindowUtils()

  if (isMaximized === undefined) return null

  let label: string
  let path: string
  let cb

  if (isMaximized) {
    label = 'Restore window'
    path = 'm 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z'
    cb = unmaximize
  } else {
    label = 'Maximize window'
    path = 'M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z'
    cb = maximize
  }

  {
  }
  return (
    <ButtonWrapper aria-label={label} title={label} onClick={cb}>
      <svg aria-hidden="true" version="1.1" viewBox="0 0 10 10" className="size-2">
        <path fill="currentColor" d={path} />
      </svg>
    </ButtonWrapper>
  )
}

export function MinimizeButton() {
  const {minimize} = useWindowUtils()

  return (
    <ButtonWrapper aria-label="Minimize window" onClick={minimize}>
      <svg aria-hidden="true" viewBox="0 0 10 10" width={10} height={10} className="size-3">
        <path fill="currentColor" d="M 0,5 10,5 10,6 0,6 Z" />
      </svg>
    </ButtonWrapper>
  )
}

function ButtonWrapper({className, ...props}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="iconSm"
      variant="ghost"
      {...props}
      className={`focus-visible:ring-ring focus-visible:ring-2 ${className || ''}`}
    />
  )
}

export function WindowsLinuxWindowControls() {
  return (
    <div className="no-window-drag flex gap-1 pr-3">
      <MinimizeButton />
      <MaximizeOrRestoreButton />
      <CloseButton />
    </div>
  )
}
