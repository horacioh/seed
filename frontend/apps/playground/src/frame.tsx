import {MediaWindowContext} from '@shm/ui/use-media'
import {useEffect, useState, type ReactNode} from 'react'
import {createPortal} from 'react-dom'

export function DeviceFrame({width, height, children}: {width: number; height: number; children: ReactNode}) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!frame) return
    const frameDocument = frame.contentDocument
    if (!frameDocument) return
    frameDocument.open()
    frameDocument.write(
      '<!doctype html><html><head></head><body style="margin:0"><div id="playground-frame-root"></div></body></html>',
    )
    frameDocument.close()
    const root = frameDocument.getElementById('playground-frame-root')
    if (!root) return
    setMountNode(root)

    const parentDocument = frame.ownerDocument
    const syncStyles = () => {
      const styles = Array.from(parentDocument.head.querySelectorAll('style, link[rel="stylesheet"]'))
      frameDocument.head.replaceChildren(...styles.map((style) => style.cloneNode(true)))
    }
    const syncTheme = () => {
      frameDocument.documentElement.classList.toggle('dark', parentDocument.documentElement.classList.contains('dark'))
    }
    syncStyles()
    syncTheme()
    const styleObserver = new MutationObserver(syncStyles)
    const themeObserver = new MutationObserver(syncTheme)
    styleObserver.observe(parentDocument.head, {childList: true, subtree: true, characterData: true})
    themeObserver.observe(parentDocument.documentElement, {attributes: true, attributeFilter: ['class']})
    return () => {
      styleObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [frame])

  return (
    <iframe ref={setFrame} title="Device preview" className="bg-background block border-0" style={{width, height}}>
      {mountNode &&
        createPortal(
          <MediaWindowContext.Provider value={frame?.contentWindow ?? undefined}>
            {children}
          </MediaWindowContext.Provider>,
          mountNode,
        )}
    </iframe>
  )
}
