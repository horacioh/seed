import {MediaWindowContext} from '@shm/ui/use-media'
import {useEffect, useState, type ReactNode} from 'react'
import {createPortal} from 'react-dom'

/** Renders children inside a device-sized iframe with synchronized styles and media context. */
export function DeviceFrame({width, height, children}: {width: number; height: number; children: ReactNode}) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!frame) return
    const frameDocument = frame.contentDocument
    if (!frameDocument) return
    frameDocument.open()
    frameDocument.write(
      '<!doctype html><html style="height:100%"><head></head><body style="height:100%;margin:0;overflow:hidden"><div id="playground-frame-root" style="height:100%;min-height:0"></div></body></html>',
    )
    frameDocument.close()
    const root = frameDocument.getElementById('playground-frame-root')
    if (!root) return
    setMountNode(root)

    const parentDocument = frame.ownerDocument
    const frameStyle = frameDocument.createElement('style')
    frameStyle.textContent = '#playground-frame-root>*{height:100%;min-height:0}'
    const syncStyles = () => {
      const styles = Array.from(parentDocument.head.querySelectorAll('style, link[rel="stylesheet"]'))
      frameDocument.head.replaceChildren(...styles.map((style) => style.cloneNode(true)), frameStyle)
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
