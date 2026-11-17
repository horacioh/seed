import {afterEach, describe, expect, it} from 'vitest'
import {focusNextShellRegion} from '../utils/focus-regions'

function makeVisible(element: HTMLElement) {
  Object.defineProperty(element, 'getClientRects', {
    configurable: true,
    value: () => [new DOMRect(0, 0, 10, 10)],
  })
}

describe('focusNextShellRegion', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('cycles forward and backward through visible shell regions', () => {
    document.body.innerHTML = `
      <header data-a11y-region="titlebar"><button id="titlebar-control">Controls</button></header>
      <nav data-a11y-region="sidebar"><a id="sidebar-link" href="#">Sidebar</a></nav>
      <main data-a11y-region="main"><button id="main-control">Main</button></main>
      <aside data-a11y-region="panel"><button id="panel-control">Panel</button></aside>
    `
    document.querySelectorAll<HTMLElement>('[data-a11y-region], button, a').forEach(makeVisible)
    document.getElementById('titlebar-control')?.focus()

    expect(focusNextShellRegion()?.id).toBe('sidebar-link')
    expect(focusNextShellRegion()?.id).toBe('main-control')
    expect(focusNextShellRegion()?.id).toBe('panel-control')
    expect(focusNextShellRegion()?.id).toBe('titlebar-control')
    expect(focusNextShellRegion(true)?.id).toBe('panel-control')
  })

  it('skips hidden regions and focuses a region when it has no controls', () => {
    document.body.innerHTML = `
      <header data-a11y-region="titlebar" hidden><button id="hidden-control">Hidden</button></header>
      <main data-a11y-region="main" tabindex="-1"></main>
    `
    const main = document.querySelector<HTMLElement>('main')!
    makeVisible(main)
    expect(focusNextShellRegion()).toBe(main)
    expect(document.activeElement).toBe(main)
  })

  it('returns null when the shell has no regions', () => {
    expect(focusNextShellRegion()).toBeNull()
  })
})
