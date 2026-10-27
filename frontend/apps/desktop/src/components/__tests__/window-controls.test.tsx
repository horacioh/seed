import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

const windowUtils = vi.hoisted(() => ({
  close: vi.fn(),
  isMaximized: false,
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  minimize: vi.fn(),
}))

vi.mock('@/app-context', () => ({useWindowUtils: () => windowUtils}))

import {WindowsLinuxWindowControls} from '../window-controls'

describe('Windows/Linux window controls', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    act(() => root.render(<WindowsLinuxWindowControls />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('exposes named controls to keyboard focus', () => {
    const controls = Array.from(container.querySelectorAll('button'))
    expect(controls.map((control) => control.getAttribute('aria-label'))).toEqual([
      'Minimize window',
      'Maximize window',
      'Close window',
    ])

    for (const control of controls) {
      expect(control.tabIndex).not.toBe(-1)
      control.focus()
      expect(document.activeElement).toBe(control)
    }
  })
})
