// Tutorial recorder: drives Chromium via Playwright + CDP and captures
// ONLY the page viewport (never OS chrome). Writes shots/<take>/*.png and
// shots/beats.json, which the renderer turns into a video.
import {chromium} from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Phone personas render inside a renderer-drawn iPhone (393×852 pt screen, Dynamic Island). The page viewport is the
// screen minus the 59 pt iOS status bar — what an installed web app gets — so nothing is cropped or reframed; the
// renderer draws the status bar, bezel and home indicator around the real capture. Taps replace the mouse cursor.
const IPHONE = {width: 393, height: 852, statusBar: 59, radius: 55}
const PHONE = {
  viewport: {width: IPHONE.width, height: IPHONE.height - IPHONE.statusBar},
  deviceScaleFactor: 3,
  frame: 'iphone',
  screen: IPHONE,
  isMobile: true,
  hasTouch: true,
}
export const PERSONAS = {
  desktop: {viewport: {width: 1920, height: 1080}, deviceScaleFactor: 2, frame: 'card'},
  phone: {...PHONE},
  'phone-9x16': {...PHONE, format: '9x16'},
}

const CLEAN_CSS = `
  *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  * { scrollbar-width: none !important; }
  html { scrollbar-gutter: auto !important; }
  *:focus-visible { outline: none !important; }
  ::selection { background: transparent !important; }
`

// Caption-text size guard: body copy over 24px CSS usually means a layout glitch.
// Elements that are *meant* to be big (page titles, KPI numerals, avatars) are exempt.
const BIG_TEXT_EXEMPT =
  'h1, h2, [data-kpi], .tabular-nums, [class*="text-3xl"], [class*="text-4xl"], [class*="text-5xl"], [class*="text-6xl"], [role="img"], svg, .text-2xl, [class*="text-2xl"]'

const DEFAULT_GUARD_SELECTORS = {
  loading: ['.animate-pulse', '[data-loading]', '[aria-busy="true"]', '.animate-spin', '[role="progressbar"]'],
  toast: ['[data-sonner-toast]', 'ol[data-radix-toast-viewport] li', 'li[role="status"][data-state]', '.toast'],
  banner: ['[data-banner]', '[data-cookie-banner]', '[data-testid*="banner"]', '[aria-label*="banner" i]'],
  empty: ['[data-empty-state]', '[data-empty]', '.empty-state'],
}

function guardScript({allowLoading, allowToast, allowBanner, allowEmpty, selectors}) {
  return `(() => {
    const problems = []
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0' && r.bottom > 0 && r.top < innerHeight }
    const selectors = ${JSON.stringify(selectors)}
    const matching = (key) => selectors[key].length ? document.querySelectorAll(selectors[key].join(',')) : []
    if (!${allowLoading}) for (const el of matching('loading')) if (vis(el)) problems.push('loading: ' + (el.getAttribute('class') || el.tagName))
    if (!${allowToast}) for (const el of matching('toast')) if (vis(el)) problems.push('toast: ' + (el.textContent || '').slice(0, 60))
    if (!${allowBanner}) for (const el of matching('banner')) if (vis(el)) problems.push('banner: ' + (el.textContent || '').slice(0, 60))
    if (!${allowEmpty}) for (const el of matching('empty')) if (vis(el)) problems.push('empty: ' + (el.textContent || '').slice(0, 60))
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let n
    while ((n = walker.nextNode())) {
      const t = n.textContent.trim(); if (t.length < 3) continue
      const el = n.parentElement; if (!el || !vis(el)) continue
      if (el.closest(${JSON.stringify(BIG_TEXT_EXEMPT)})) continue
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs > 24) problems.push('text>24px (' + fs + 'px): ' + t.slice(0, 40))
    }
    if (document.getSelection && String(document.getSelection()).length) problems.push('text selection')
    return problems
  })()`
}

export async function createRecorder(opts) {
  const {
    take, // e.g. 'en' or 'es' — shots go to shots/<take>/
    outDir, // tutorial folder (contains shots/)
    persona = 'desktop',
    baseUrl = 'http://localhost:5173',
    lang = 'en',
    browserOptions = {},
    contextOptions = {},
    frameGuard = {},
    hideSelectors = [],
    headless = true,
  } = opts
  const p = PERSONAS[persona]
  if (!p) throw new Error(`unknown persona ${persona}`)
  const shotsDir = path.join(outDir, 'shots', take)
  fs.mkdirSync(shotsDir, {recursive: true})

  const browser = await chromium.launch({
    headless,
    ...browserOptions,
    args: [
      ...new Set([
        '--hide-scrollbars',
        '--force-color-profile=srgb',
        '--font-render-hinting=none',
        ...(browserOptions.args || []),
      ]),
    ],
  })
  const tutorialContext = typeof contextOptions === 'function' ? await contextOptions(browser) : contextOptions
  const context = await browser.newContext({
    viewport: p.viewport,
    deviceScaleFactor: p.deviceScaleFactor,
    isMobile: !!p.isMobile,
    hasTouch: !!p.hasTouch,
    colorScheme: 'light',
    locale: lang === 'es' ? 'es-ES' : 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'no-preference',
    ...tutorialContext,
  })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setFocusEmulationEnabled', {enabled: true})

  const beats = []
  const writtenImages = new Set()
  let cursor = {x: Math.round(p.viewport.width * 0.55), y: Math.round(p.viewport.height * 0.6)}
  let shotIndex = 0
  const t0 = Date.now()
  const now = () => Date.now() - t0

  async function injectClean() {
    await page
      .addStyleTag({content: CLEAN_CSS + hideSelectors.map((s) => `${s}{display:none !important}`).join('\n')})
      .catch(() => {})
  }

  async function settle(ms = 250) {
    await page.waitForLoadState('domcontentloaded').catch(() => {})
    await page.waitForLoadState('networkidle', {timeout: 8000}).catch(() => {})
    await page.waitForTimeout(ms)
  }

  async function clean({keepFocus = false, keepHover = false} = {}) {
    await injectClean()
    if (!keepFocus)
      await page.evaluate(() => {
        const a = document.activeElement
        if (a && a !== document.body) a.blur()
      })
    await page.evaluate(() => {
      const s = window.getSelection && window.getSelection()
      if (s) s.removeAllRanges()
    })
    if (!keepHover && !p.hasTouch) await page.mouse.move(cursor.x, cursor.y)
    await page.waitForTimeout(80)
  }

  async function guard({allowLoading = false, allowToast = false, allowBanner = false, allowEmpty = false} = {}) {
    const selectors = Object.fromEntries(
      Object.keys(DEFAULT_GUARD_SELECTORS).map((key) => {
        const configured = frameGuard[key] ?? DEFAULT_GUARD_SELECTORS[key]
        return [key, Array.isArray(configured) ? configured : [configured]]
      }),
    )
    const problems = await page.evaluate(guardScript({allowLoading, allowToast, allowBanner, allowEmpty, selectors}))
    if (problems.length) throw new Error(`frame guard failed:\n  ${problems.join('\n  ')}`)
  }

  async function capture(name) {
    const file = `${String(++shotIndex).padStart(2, '0')}-${name}.png`
    await page.screenshot({
      path: path.join(shotsDir, file),
      type: 'png',
      scale: 'device',
      caret: 'hide',
      fullPage: false,
    })
    writtenImages.add(file)
    return path.posix.join('shots', take, file)
  }

  async function bboxOf(locator) {
    await locator.waitFor({state: 'visible', timeout: 10000})
    await locator.scrollIntoViewIfNeeded()
    await page.waitForTimeout(120)
    const b = await locator.boundingBox()
    if (!b) throw new Error('target has no bounding box')
    return {x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height)}
  }

  async function nav(url, {waitFor} = {}) {
    await page.goto(new URL(url, baseUrl).href, {waitUntil: 'domcontentloaded'})
    if (waitFor) await waitFor(page)
    await settle(400)
    await clean()
  }

  async function shot(
    name,
    {allowLoading, allowToast, allowBanner, allowEmpty, target, mark, keepHover, keepFocus} = {},
  ) {
    await settle(150)
    const targetBox = target ? await bboxOf(target) : undefined
    const markBox = mark ? await bboxOf(mark) : undefined
    await clean({keepHover, keepFocus})
    await guard({allowLoading, allowToast, allowBanner, allowEmpty})
    const beat = {
      kind: 'shot',
      name,
      t: now(),
      image: await capture(name),
      cursor: {...cursor},
      target: targetBox,
      mark: markBox,
    }
    beats.push(beat)
    return beat
  }

  // click(locator, { expect: async (page) => void | boolean, name, allowToast, settleMs })
  async function click(
    locator,
    {
      expect,
      mark,
      name = 'click',
      allowLoading = false,
      allowToast = false,
      allowBanner = false,
      allowEmpty = false,
      settleMs = 300,
      hover = true,
      keepFocus = false,
    } = {},
  ) {
    if (typeof expect !== 'function') throw new Error(`click(${name}): an expect postcondition is required`)
    await settle(100)
    const target = await bboxOf(locator)
    await clean({keepHover: true})
    await guard({allowLoading, allowToast, allowBanner, allowEmpty})
    const before = await capture(`${name}-before`)
    const from = {...cursor}
    const to = {x: Math.round(target.x + target.w / 2), y: Math.round(target.y + target.h / 2)}
    const tStart = now()
    let hovered
    if (p.hasTouch) {
      // phones: a tap, no hover state, no cursor travel
      await page.touchscreen.tap(to.x, to.y)
    } else {
      await page.mouse.move(to.x, to.y, {steps: 12})
      if (hover) await page.waitForTimeout(120)
      hovered = await capture(`${name}-hover`)
      await page.mouse.down()
      await page.waitForTimeout(40)
      await page.mouse.up()
    }
    cursor = to
    const tClick = now()
    const ok = await expect(page)
    if (ok === false) throw new Error(`click(${name}): postcondition returned false`)
    await settle(settleMs)
    await clean({keepHover: true, keepFocus})
    await guard({allowLoading, allowToast, allowBanner, allowEmpty})
    const markBox = mark ? await bboxOf(mark) : undefined
    const after = await capture(`${name}-after`)
    const beat = {
      kind: 'click',
      name,
      t: tStart,
      tClick,
      tAfter: now(),
      target,
      from,
      to,
      before,
      hover: hovered,
      after,
      image: after,
      mark: markBox,
    }
    beats.push(beat)
    return beat
  }

  async function type(
    locator,
    text,
    {name = 'type', expect, delay = 35, allowLoading = false, allowToast = false, clear = true} = {},
  ) {
    await settle(100)
    const target = await bboxOf(locator)
    await clean({keepHover: true})
    await guard({allowLoading, allowToast})
    const before = await capture(`${name}-before`)
    const from = {...cursor}
    const to = {x: Math.round(target.x + target.w / 2), y: Math.round(target.y + target.h / 2)}
    const tStart = now()
    await page.mouse.move(to.x, to.y, {steps: 12})
    await page.waitForTimeout(100)
    await locator.click()
    cursor = to
    if (clear) await locator.fill('')
    const tClick = now()
    await page.keyboard.type(text, {delay})
    if (expect) {
      const ok = await expect(page)
      if (ok === false) throw new Error(`type(${name}): postcondition returned false`)
    }
    await page.waitForTimeout(150)
    await clean({keepHover: true, keepFocus: true})
    await guard({allowLoading, allowToast})
    const after = await capture(`${name}-after`)
    const beat = {
      kind: 'type',
      name,
      t: tStart,
      tClick,
      tAfter: now(),
      target,
      from,
      to,
      text,
      before,
      after,
      image: after,
    }
    beats.push(beat)
    return beat
  }

  // poll(name, { every, until, max, allowToast }): capture a frame every `every` ms until `until(page)` is truthy
  // or `max` ms elapsed. Produces a 'poll' beat with several frames (renderer shows them with a "Sped up" badge).
  async function poll(
    name,
    {
      every = 1000,
      until,
      max = 15000,
      allowLoading = false,
      allowToast = false,
      allowBanner = false,
      allowEmpty = false,
    } = {},
  ) {
    const frames = []
    const tStart = now()
    while (now() - tStart < max) {
      await clean({keepHover: true})
      await guard({allowLoading, allowToast, allowBanner, allowEmpty})
      frames.push({t: now(), image: await capture(`${name}-${frames.length}`)})
      if (until && (await until(page))) break
      await page.waitForTimeout(every)
    }
    const beat = {
      kind: 'poll',
      name,
      t: tStart,
      tAfter: now(),
      frames,
      image: frames[frames.length - 1].image,
      cursor: {...cursor},
    }
    beats.push(beat)
    return beat
  }

  async function scrollTo(y) {
    await page.evaluate((yy) => window.scrollTo({top: yy, behavior: 'instant'}), y)
    await page.waitForTimeout(200)
  }

  // Scroll so the element sits in the middle of the viewport (full cards for whole-view shots).
  async function center(locator) {
    await locator.first().evaluate((el) => el.scrollIntoView({block: 'center', behavior: 'instant'}))
    await page.waitForTimeout(250)
  }

  // Close any open toasts the way a user would (the X button) once they have been narrated.
  async function dismissToasts() {
    const closes = page.locator('[toast-close]')
    const n = await closes.count()
    for (let i = n - 1; i >= 0; i--)
      await closes
        .nth(i)
        .click({force: true})
        .catch(() => {})
    if (n)
      await page
        .locator('[role="status"], li[data-state="open"]')
        .first()
        .waitFor({state: 'hidden', timeout: 5000})
        .catch(() => {})
    await page.waitForTimeout(200)
  }

  async function parkCursor(x, y) {
    cursor = {x, y}
    await page.mouse.move(x, y)
  }

  async function done() {
    const file = path.join(outDir, 'shots', 'beats.json')
    const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {takes: {}}
    existing.takes = existing.takes || {}
    existing.takes[take] = {
      capturedAt: new Date().toISOString(),
      platform: {os: process.platform, release: os.release(), node: process.version, browser: browser.version()},
      persona,
      viewport: p.viewport,
      deviceScaleFactor: p.deviceScaleFactor,
      frame: p.frame,
      screen: p.screen,
      format: p.format || '16x9',
      lang,
      baseUrl,
      beats,
    }
    fs.writeFileSync(file, JSON.stringify(existing, null, 2))
    for (const image of fs.readdirSync(shotsDir)) {
      if (image.endsWith('.png') && !writtenImages.has(image)) fs.unlinkSync(path.join(shotsDir, image))
    }
    await browser.close()
    return file
  }

  return {
    page,
    context,
    browser,
    nav,
    shot,
    click,
    type,
    poll,
    clean,
    guard,
    scrollTo,
    center,
    dismissToasts,
    parkCursor,
    done,
    get cursor() {
      return cursor
    },
    persona: p,
  }
}
