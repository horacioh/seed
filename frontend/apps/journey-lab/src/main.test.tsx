// @vitest-environment jsdom
import React from 'react'
import {act} from 'react-dom/test-utils'
import {createRoot} from 'react-dom/client'
import {expect, it} from 'vitest'
import {App} from './main.tsx'

it('supports roving tab focus, automatic activation, wraparound, Home and End', () => {
  Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true})
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  try {
    act(() => root.render(<App />))
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1])
    tabs[0]!.focus()
    for (const [key, index] of [
      ['ArrowRight', 1],
      ['ArrowRight', 2],
      ['ArrowRight', 0],
      ['ArrowLeft', 2],
      ['Home', 0],
      ['End', 2],
    ] as const) {
      act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true})))
      expect(document.activeElement).toBe(tabs[index])
      expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(tabs.map((_, i) => String(i === index)))
      expect(tabs.map((tab) => tab.tabIndex)).toEqual(tabs.map((_, i) => (i === index ? 0 : -1)))
      expect(container.querySelector('[role="tabpanel"]')?.id).toBe(tabs[index]!.getAttribute('aria-controls'))
    }
    act(() => tabs[0]!.click())
    expect(tabs[0]!.tabIndex).toBe(0)
  } finally {
    act(() => root.unmount())
    container.remove()
  }
})
