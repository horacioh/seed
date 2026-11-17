import {MainContent} from '@/components/main-wrapper'
import {expectNoAxeViolations} from '@shm/a11y-testing/dom'
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

describe('desktop shell landmarks', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    document.title = 'Seed'
    document.documentElement.lang = 'en'
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('exposes one main, labelled navigation and an open labelled panel without axe violations', async () => {
    act(() => {
      root.render(
        <>
          <a href="#main-content">Skip to content</a>
          <header data-a11y-region="titlebar">
            <nav aria-label="Navigation">
              <button type="button" aria-label="Minimize window">
                Minimize
              </button>
            </nav>
          </header>
          <nav aria-label="Sidebar" data-a11y-region="sidebar">
            <a href="#home">Home</a>
          </nav>
          <MainContent>
            <h1>Home</h1>
          </MainContent>
          <aside aria-label="Discussions" data-a11y-region="panel">
            <button type="button">Close discussions</button>
          </aside>
        </>,
      )
    })

    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelector('nav[aria-label="Navigation"]')).not.toBeNull()
    expect(container.querySelector('nav[aria-label="Sidebar"]')).not.toBeNull()
    expect(container.querySelector('aside[aria-label="Discussions"]')).not.toBeNull()
    await expectNoAxeViolations(document)
  })
})
