import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle} from '@shm/ui/components/dialog'
import {Textarea} from '@shm/ui/components/textarea'
import {createContext, ReactNode, useCallback, useContext, useId, useRef, useState} from 'react'

type ImageAltTextDialogRequest = {
  currentAlt: string
  onSave: (alt: string) => void
  opener: HTMLElement
  fallbackFocus?: () => void
}

type ImageAltTextDialogContextValue = {
  open: (request: ImageAltTextDialogRequest) => void
}

const ImageAltTextDialogContext = createContext<ImageAltTextDialogContextValue | null>(null)

/** Provides the shared image alt-text dialog to image controls and block menus. */
export function ImageAltTextDialogProvider({children}: {children: ReactNode}) {
  const [request, setRequest] = useState<ImageAltTextDialogRequest | null>(null)
  const [alt, setAlt] = useState('')
  const requestRef = useRef<ImageAltTextDialogRequest | null>(null)
  const textareaId = useId()

  const open = useCallback((nextRequest: ImageAltTextDialogRequest) => {
    requestRef.current = nextRequest
    setAlt(nextRequest.currentAlt)
    setRequest(nextRequest)
  }, [])

  const close = () => setRequest(null)
  const save = () => {
    requestRef.current?.onSave(alt)
    close()
  }

  return (
    <ImageAltTextDialogContext.Provider value={{open}}>
      {children}
      <Dialog open={!!request} onOpenChange={(open) => !open && close()}>
        <DialogContent
          aria-describedby={`${textareaId}-description`}
          aria-labelledby={`${textareaId}-title`}
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            document.getElementById(textareaId)?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const previousRequest = requestRef.current
            if (previousRequest?.opener.isConnected) previousRequest.opener.focus()
            else previousRequest?.fallbackFocus?.()
            requestRef.current = null
          }}
        >
          <DialogTitle id={`${textareaId}-title`}>Alt text</DialogTitle>
          <DialogDescription id={`${textareaId}-description`}>
            Describe the image for people who can't see it. Leave empty only if it's purely decorative.
          </DialogDescription>
          <label htmlFor={textareaId} className="text-sm font-medium">
            Alt text
          </label>
          <Textarea id={textareaId} value={alt} onChange={(event) => setAlt(event.currentTarget.value)} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ImageAltTextDialogContext.Provider>
  )
}

/** Returns the callback used to open the editor's shared image alt-text dialog. */
export function useImageAltTextDialog() {
  const context = useContext(ImageAltTextDialogContext)
  return context?.open ?? (() => undefined)
}
