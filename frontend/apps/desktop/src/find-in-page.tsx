import * as stylex from '@stylexjs/stylex'
// Find-in-page UI using vanilla JS to avoid React duplication issues
import './stylex.css'
const styles_2 = stylex.create({
  s2eef76: {
    '--brand-1': 'hsl(123, 50%, 93%)',
    '--brand-2': 'hsl(122, 53%, 88%)',
    '--brand-3': 'hsl(133, 63%, 83%)',
    '--brand-4': 'hsl(133, 54%, 78%)',
    '--brand-5': 'hsl(144, 73%, 68%)',
    '--brand-6': 'hsl(144, 55%, 57%)',
    '--brand-7': 'hsl(148, 44%, 47%)',
    '--brand-8': 'oklch(0.5726 0.1056 177.0838)',
    '--brand-9': 'hsl(166, 55%, 31%)',
    '--brand-10': 'hsl(166, 30%, 29%)',
    '--brand-11': 'hsl(180, 36%, 22%)',
    '--brand-12': 'hsl(180, 29%, 17%)',
    '--brand': 'oklch(0.5726 0.1056 177.0838)',
    '--highlight': 'hsl(180, 48%, 18%)',
    '--link': 'lch(59.472 70 288.421)',
    '--link-hover': 'lch(65 70 288.421)',
    '--background': 'oklch(0.2046 0 0)',
    '--panel-background': 'black',
    '--panel': 'oklch(0.2046 0 0)',
    '--foreground': 'oklch(0.9219 0 0)',
    '--card': 'oklch(0.2686 0 0)',
    '--card-foreground': 'oklch(0.9219 0 0)',
    '--popover': 'oklch(0.2686 0 0)',
    '--popover-foreground': 'oklch(0.9219 0 0)',
    '--primary': 'oklch(0.5726 0.1056 177.0838)',
    '--primary-foreground': 'oklch(1 0 0)',
    '--secondary': 'oklch(0.9258 0.055 145.9246)',
    '--secondary-foreground': 'oklch(0 0 0)',
    '--muted': 'oklch(0.2686 0 0)',
    '--muted-foreground': 'oklch(0.7155 0 0)',
    '--accent': 'oklch(0.3564 0.0649 179.3744)',
    '--accent-foreground': 'oklch(1 0 0)',
    '--destructive': 'oklch(0.6368 0.2078 25.3313)',
    '--destructive-foreground': 'oklch(1 0 0)',
    '--border': 'oklch(0.2686 0 0)',
    '--input': 'oklch(0.2686 0 0)',
    '--ring': 'oklch(0.7155 0 0)',
    '--selection': 'color-mix(in oklab, oklch(0.5726 0.1056 177.0838) 32%, transparent)',
    '--selection-strong': 'color-mix(in oklab, oklch(0.5726 0.1056 177.0838) 40%, transparent)',
    '--chart-1': 'oklch(0.8369 0.1644 84.4286)',
    '--chart-2': 'oklch(0.6658 0.1574 58.3183)',
    '--chart-3': 'oklch(0.4732 0.1247 46.2007)',
    '--chart-4': 'oklch(0.5553 0.1455 48.9975)',
    '--chart-5': 'oklch(0.4732 0.1247 46.2007)',
    '--sidebar': 'oklch(0.1684 0 0)',
    '--sidebar-foreground': 'oklch(0.9219 0 0)',
    '--sidebar-primary': 'oklch(0.5261 0.088 173.2501)',
    '--sidebar-primary-foreground': 'oklch(1 0 0)',
    '--sidebar-accent': 'oklch(0.3876 0.0451 195.4511)',
    '--sidebar-accent-foreground': 'oklch(1 0 0)',
    '--sidebar-border': 'oklch(0.3876 0.0451 195.4511)',
    '--sidebar-ring': 'oklch(0.3876 0.0451 195.4511)',
    '--font-sans':
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    '--font-serif': 'Source Serif 4, serif',
    '--font-mono': "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    '--radius': '0.375rem',
    '--shadow-2xs': '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
    '--shadow-xs': '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
    '--shadow-sm': '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 1px 2px -2px hsl(0 0% 0% / 0.1)',
    '--shadow': '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 1px 2px -2px hsl(0 0% 0% / 0.1)',
    '--shadow-md': '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)',
    '--shadow-lg': '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 4px 6px -2px hsl(0 0% 0% / 0.1)',
    '--shadow-xl': '0px 4px 8px -1px hsl(0 0% 0% / 0.1), 0px 8px 10px -2px hsl(0 0% 0% / 0.1)',
    '--shadow-2xl': '0px 4px 8px -1px hsl(0 0% 0% / 0.25)',
    '--hljs-comment': '#a1a1aa',
    '--hljs-red': '#f87171',
    '--hljs-orange': '#fb923c',
    '--hljs-green': '#4ade80',
    '--hljs-yellow': '#eab308',
    '--hljs-blue': '#60a5fa',
  },
})
const styles = stylex.create({
  s5ff7227c: {
    backgroundColor: 'var(--panel)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sb42244d4: {
    height: '100%',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s8a6c2a27: {
    boxShadow: 'var(--shadow-sm)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s3f58665f: {
    minWidth: '0px',
  },
  sb42feb5d: {
    flex: '1',
  },
  sc05281e3: {
    color: 'var(--foreground)',
  },
  s7c401ecf: {
    borderStyle: 'solid',
    borderWidth: '0px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s3484a2: {
    paddingLeft: 'calc(0.25rem * 3)',
  },
  s65ec9d0: {
    paddingRight: 'calc(0.25rem * 16)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sd5b893dc: {
    pointerEvents: 'none',
  },
  s67010d77: {
    position: 'absolute',
  },
  s478fb0c1: {
    right: 'calc(0.25rem * 2)',
  },
  sbbfc415c: {
    top: '50%',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'var(--text-xs--line-height)',
  },
  sd1fc735d: {
    fontVariantNumeric: 'tabular-nums',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  s87d06ab4: {
    backgroundColor: 'var(--border)',
  },
  s33548f: {
    marginInline: '0.25rem',
  },
  s18c10: {
    height: 'calc(0.25rem * 5)',
  },
  s36cf1e: {
    width: '1px',
  },
  sca3de96d: {
    width: 'calc(0.25rem * 9)',
    height: 'calc(0.25rem * 9)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
})
type FindInPageResult = {
  activeMatchOrdinal: number
  matches: number
  finalUpdate: boolean
}
const ipc = (window as any).ipc as {
  send: (cmd: string, args?: any) => void
}
const appWindowEvents = (window as any).appWindowEvents as
  | {
      subscribe: (handler: (event: any) => void) => () => void
    }
  | undefined
const darkModeStream = (window as any).darkMode as
  | {
      subscribe: (handler: (value: boolean) => void) => () => void
    }
  | undefined
const findInPageResults = (window as any).findInPageResults as
  | {
      subscribe: (handler: (result: FindInPageResult) => void) => () => void
    }
  | undefined
function createFindInPageUI() {
  const root = document.getElementById('root')
  if (!root) return
  const wrapper = document.createElement('div')
  wrapper.className = 'light'
  wrapper.style.width = '100%'
  wrapper.style.height = '100%'
  darkModeStream?.subscribe((isDark: boolean) => {
    wrapper.className = isDark ? stylex.props(styles_2.s2eef76).className || '' : 'light'
  })

  // Single-card container that fills the WebContentsView bounds exactly.
  const card = document.createElement('div')
  card.className =
    stylex.props(
      styles.s5ff7227c,
      styles.s1a01a0ed,
      styles.s2ffff9,
      styles.sb42244d4,
      styles.scdbaf625,
      styles.sc6ed1702,
      styles.s92852dd5,
      styles.sf79988b7,
      styles.sad8c742c,
      styles.s8a6c2a27,
    ).className || ''

  // Input lives inside a relative wrap so the counter can sit absolutely over
  // the right side of the field — this keeps the overall layout stable when
  // the counter appears/disappears.
  const inputWrap = document.createElement('div')
  inputWrap.className =
    stylex.props(
      styles.sdef3facc,
      styles.s2ffff9,
      styles.sb42244d4,
      styles.s3f58665f,
      styles.sb42feb5d,
      styles.sc6ed1702,
    ).className || ''
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Find in page…'
  input.className =
    stylex.props(
      styles.sc05281e3,
      styles.sb42244d4,
      styles.scdbaf625,
      styles.s7c401ecf,
      styles.s60f53bca,
      styles.s3484a2,
      styles.s65ec9d0,
      styles.sab7cc6fa,
      styles.sa602a1e3,
    ).className || ''
  const counter = document.createElement('span')
  counter.className =
    stylex.props(
      styles.sf2718385,
      styles.sd5b893dc,
      styles.s67010d77,
      styles.s478fb0c1,
      styles.sbbfc415c,
      styles.sab7cc79b,
      styles.sd1fc735d,
      styles.sa145969,
    ).className || ''
  counter.textContent = ''
  inputWrap.appendChild(input)
  inputWrap.appendChild(counter)
  const divider = document.createElement('div')
  divider.className = stylex.props(styles.s87d06ab4, styles.s33548f, styles.s18c10, styles.s36cf1e).className || ''
  const makeIconButton = (svg: string, ariaLabel: string) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.setAttribute('aria-label', ariaLabel)
    btn.className =
      stylex.props(
        styles.sc05281e3,
        styles.s2ffff9,
        styles.sca3de96d,
        styles.sf032ed6c,
        styles.sc6ed1702,
        styles.sce22ca32,
      ).className || ''
    btn.innerHTML = svg
    return btn
  }
  const upButton = makeIconButton(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
    'Previous match',
  )
  const downButton = makeIconButton(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    'Next match',
  )
  const closeButton = makeIconButton(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    'Close find',
  )
  let query = ''
  let matches = 0
  let activeMatchOrdinal = 0
  let hasActiveSearch = false
  function updateCounter() {
    if (query.length === 0 || matches === 0) {
      counter.textContent = ''
      divider.style.visibility = 'hidden'
    } else {
      counter.textContent = `${activeMatchOrdinal}/${matches}`
      divider.style.visibility = ''
    }
  }
  updateCounter()
  function resetResult() {
    matches = 0
    activeMatchOrdinal = 0
    hasActiveSearch = false
    updateCounter()
  }
  function clearFind() {
    query = ''
    input.value = ''
    resetResult()
    ipc.send('find_in_page_cancel')
  }
  function navigate(forward: boolean) {
    if (query.length === 0) return
    if (!hasActiveSearch) {
      // First query after a cleared/empty state: start a new search.
      ipc.send('find_in_page_query', {
        query,
        findNext: false,
        forward,
      })
      hasActiveSearch = true
    } else {
      // Advance the cursor within the existing request so Chromium cycles.
      ipc.send('find_in_page_query', {
        query,
        findNext: true,
        forward,
      })
    }
  }
  input.addEventListener('input', (e) => {
    query = (e.target as HTMLInputElement).value
    if (query.length === 0) {
      resetResult()
      ipc.send('find_in_page_cancel')
      return
    }
    // `findNext: true` forces Chromium to stop the previous session and start
    // a new one with this query — that's what makes each keystroke visibly
    // repaint the page. `false` is "continue", which the engine coalesces
    // when calls arrive faster than a scan completes (symptom: page only
    // updates after Enter).
    hasActiveSearch = true
    ipc.send('find_in_page_query', {
      query,
      findNext: true,
      forward: true,
    })
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clearFind()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      navigate(!e.shiftKey)
    }
  })
  upButton.addEventListener('click', () => navigate(false))
  downButton.addEventListener('click', () => navigate(true))
  closeButton.addEventListener('click', clearFind)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clearFind()
    }
  })
  findInPageResults?.subscribe((result: FindInPageResult) => {
    if (!result) return
    matches = result.matches ?? 0
    activeMatchOrdinal = result.activeMatchOrdinal ?? 0
    updateCounter()
  })
  setTimeout(() => {
    input.focus()
    input.select()
  }, 10)
  appWindowEvents?.subscribe((event: any) => {
    if (event.type === 'find_in_page') {
      setTimeout(() => {
        input.focus()
        input.select()
      }, 10)
    }
  })
  card.appendChild(inputWrap)
  card.appendChild(divider)
  card.appendChild(upButton)
  card.appendChild(downButton)
  card.appendChild(closeButton)
  wrapper.appendChild(card)
  root.appendChild(wrapper)
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFindInPageUI)
} else {
  createFindInPageUI()
}
