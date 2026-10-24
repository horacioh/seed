// @vitest-environment jsdom
import {createRoot} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {MediaWindowContext, useMedia} from '../use-media'
;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true

describe('useMedia', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('uses the provided window for media queries and listeners', () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    const matchMedia = vi.fn(() => ({
      matches: true,
      media: '',
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    const mediaWindow = {matchMedia} as unknown as Window
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    function Probe() {
      const media = useMedia()
      return <span>{String(media.xs)}</span>
    }

    act(() => {
      root.render(
        <MediaWindowContext.Provider value={mediaWindow}>
          <Probe />
        </MediaWindowContext.Provider>,
      )
    })

    expect(matchMedia).toHaveBeenCalled()
    expect(addEventListener).toHaveBeenCalled()
    expect(container.textContent).toBe('true')

    act(() => root.unmount())
    expect(removeEventListener).toHaveBeenCalled()
    container.remove()
  })
})
