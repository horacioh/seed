import {chromium, devices} from 'playwright'
import fs from 'fs'

const BASE = 'https://hyper.media'
const MOBILE = process.argv.includes('--mobile')
const label = MOBILE ? 'mobile' : 'desktop'

const results = {label, runs: {}}

async function withPage(fn) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext(MOBILE ? {...devices['Pixel 7']} : {viewport: {width: 1440, height: 900}})
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  if (MOBILE) {
    await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4})
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 100, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8,
    })
  }
  try {
    await fn(page, cdp)
  } finally {
    await browser.close()
  }
}

function metricsScript() {
  return page => page.evaluate(() => new Promise(resolve => {
    const nav = performance.getEntriesByType('navigation')[0]
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, Math.round(p.startTime)]))
    let lcp = null
    new PerformanceObserver(list => {
      const e = list.getEntries()
      if (e.length) lcp = Math.round(e[e.length - 1].startTime)
    }).observe({type: 'largest-contentful-paint', buffered: true})
    let cls = 0
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value
    }).observe({type: 'layout-shift', buffered: true})
    const longTasks = []
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) longTasks.push(Math.round(e.duration))
    }).observe({type: 'longtask', buffered: true})
    setTimeout(() => {
      const res = performance.getEntriesByType('resource')
      const js = res.filter(r => r.initiatorType === 'script' || r.name.endsWith('.js'))
      resolve({
        ttfb: Math.round(nav.responseStart),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        load: Math.round(nav.loadEventEnd),
        fcp: paints['first-contentful-paint'] ?? null,
        lcp, cls: +cls.toFixed(4),
        longTasks: {count: longTasks.length, totalMs: longTasks.reduce((a, b) => a + b, 0), max: Math.max(0, ...longTasks)},
        jsRequests: js.length,
        jsTransferKB: Math.round(js.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
        totalTransferKB: Math.round(res.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
        resourceCount: res.length,
      })
    }, 6000)
  }))
}

// 1. Document load
await withPage(async page => {
  await page.goto(BASE + '/documentation-test', {waitUntil: 'load'})
  results.runs.documentLoad = await metricsScript()(page)
})

// 2. Doc-to-doc navigation (client-side)
await withPage(async page => {
  await page.goto(BASE + '/', {waitUntil: 'networkidle'})
  await page.evaluate(() => { window.__navLongTasks = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__navLongTasks.push(Math.round(e.duration)) }).observe({type: 'longtask'}) })
  const t0 = Date.now()
  await page.click('a[href="/concepts"]', {timeout: 10000}).catch(async () => {
    await page.goto(BASE + '/concepts')
  })
  await page.waitForFunction(() => location.pathname === '/concepts')
  const navCommit = Date.now() - t0
  await page.waitForLoadState('networkidle').catch(() => {})
  const settled = Date.now() - t0
  const longTasks = (await page.evaluate(() => window.__navLongTasks)) || []
  results.runs.docToDocNav = {navCommitMs: navCommit, settledMs: settled, longTasks: {count: longTasks.length, totalMs: longTasks.reduce((a, b) => a + b, 0), max: Math.max(0, ...longTasks)}}
})

// 3. Scrolling smoothness on a long doc
await withPage(async page => {
  await page.goto(BASE + '/documentation-test', {waitUntil: 'networkidle'})
  await page.evaluate(() => {
    window.__frames = []
    let last = performance.now()
    const tick = now => { window.__frames.push(now - last); last = now; requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  })
  for (let i = 0; i < 60; i++) {
    try {
      await page.mouse.wheel(0, 400)
    } catch {
      await page.evaluate(() => {
        const s = document.querySelector('[data-slot="scroll-area-viewport"]') || document.scrollingElement
        s.scrollBy ? s.scrollBy(0, 400) : (s.scrollTop += 400)
      })
    }
    await page.waitForTimeout(50)
  }
  const frames = await page.evaluate(() => window.__frames)
  const sorted = [...frames].sort((a, b) => a - b)
  const p = q => +sorted[Math.floor(sorted.length * q)].toFixed(1)
  results.runs.scroll = {frames: frames.length, p50: p(0.5), p95: p(0.95), p99: p(0.99), dropped: frames.filter(f => f > 33).length}
})

// 4. Typing latency in comment box (if reachable without auth)
await withPage(async page => {
  await page.goto(BASE + '/documentation-test/:comments', {waitUntil: 'networkidle'}).catch(() => {})
  const t0open = Date.now()
  await page.click('text=Start a Discussion', {timeout: 15000}).catch(() => {})
  const editor = await page.waitForSelector('[contenteditable="true"]', {timeout: 15000}).catch(() => null)
  if (!editor) { results.runs.typing = {note: 'no editable comment box found'}; return }
  const editorOpenMs = Date.now() - t0open
  await editor.click()
  results.runs.commentEditorOpenMs = editorOpenMs
  await page.evaluate(() => { window.__typeLongTasks = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__typeLongTasks.push(Math.round(e.duration)) }).observe({type: 'longtask'}) })
  const latencies = []
  for (const ch of 'The quick brown fox jumps over the lazy dog and keeps typing to measure per keystroke latency in this comment editor box'.split('')) {
    const t0 = Date.now()
    await page.keyboard.type(ch)
    latencies.push(Date.now() - t0)
  }
  const sorted = [...latencies].sort((a, b) => a - b)
  const p = q => sorted[Math.floor(sorted.length * q)]
  const longTasks = await page.evaluate(() => window.__typeLongTasks)
  results.runs.typing = {keystrokes: latencies.length, p50: p(0.5), p95: p(0.95), max: sorted[sorted.length - 1], longTasks: {count: longTasks.length, totalMs: longTasks.reduce((a, b) => a + b, 0), max: Math.max(0, ...longTasks)}}
})

fs.writeFileSync(`results-${label}.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
