// Drawing primitives for the Seed tutorial renderer (node-canvas). All sizes are in output px;
// `u` is the UI unit = outH / 1080 so overlays look the same at 1080p and 4K.
import {createCanvas, registerFont} from 'canvas'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const FONTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fonts')
let fontsReady = false
export function ensureFonts() {
  if (fontsReady) return
  registerFont(path.join(FONTS, 'Inter-Medium.ttf'), {family: 'Inter', weight: '500'})
  registerFont(path.join(FONTS, 'Inter-SemiBold.ttf'), {family: 'Inter', weight: '600'})
  registerFont(path.join(FONTS, 'Inter-Bold.ttf'), {family: 'Inter', weight: '700'})
  fontsReady = true
}

export const SEED_GREEN = '#54cd85'
export const INK = '#18181b'
export const BACKDROP = '#f5f5f3'
export const DEFAULT_THEME = {wordmark: 'Seed Hypermedia', accent: SEED_GREEN, logo: 'ops/dokploy/seed/seed-icon.svg'}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) // cubic
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const easeIn = (t) => t * t * t
export const prog = (t, start, dur) => clamp((t - start) / dur, 0, 1)

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Slightly curved cursor path: quadratic bezier whose control point is offset perpendicular to the chord.
export function cursorPath(from, to, t) {
  const dx = to.x - from.x,
    dy = to.y - from.y
  const d = Math.hypot(dx, dy) || 1
  const bend = Math.min(d * 0.12, 60)
  const cx = (from.x + to.x) / 2 - (dy / d) * bend
  const cy = (from.y + to.y) / 2 + (dx / d) * bend
  const e = easeInOut(t)
  const x = (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * cx + e * e * to.x
  const y = (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * cy + e * e * to.y
  return {x, y}
}
export const moveDuration = (from, to) => clamp(350 + Math.hypot(to.x - from.x, to.y - from.y) * 0.3, 350, 700)

// macOS-style arrow cursor. (x, y) is the hotspot (tip). h = height in px.
const ARROW = [
  [0, 0],
  [0, 0.86],
  [0.215, 0.665],
  [0.365, 1.0],
  [0.485, 0.945],
  [0.335, 0.61],
  [0.605, 0.61],
]
export function drawCursor(ctx, x, y, h, alpha = 1, press = 0) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  const s = h * (1 - 0.08 * press)
  ctx.beginPath()
  ARROW.forEach(([px, py], i) => (i ? ctx.lineTo(px * s, py * s) : ctx.moveTo(px * s, py * s)))
  ctx.closePath()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = h * 0.18
  ctx.shadowOffsetY = h * 0.06
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = Math.max(1.5, h * 0.075)
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#fff'
  ctx.stroke()
  ctx.restore()
}

// Click ripple: a small neutral ring that expands and fades from the click point over p (0..1).
export function drawRipple(ctx, cx, cy, p, {u = 1, rmax = 22} = {}) {
  if (p <= 0 || p >= 1) return
  const e = easeOut(p)
  ctx.save()
  ctx.globalAlpha = (1 - e) * 0.55
  ctx.strokeStyle = 'rgba(24,24,27,0.9)'
  ctx.lineWidth = (2 - 1.2 * e) * u
  ctx.beginPath()
  ctx.arc(cx, cy, (4 + e * rmax) * u, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = (1 - e) * 0.12
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()
}

export function wrapText(ctx, text, maxW) {
  const words = text.split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur)
      cur = w
    } else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

// Caption pill. pos: 'bottom' | 'top'. enter/exit alpha and rise handled via `alpha` and `rise` (px).
// `rect` confines the pill to an area (a phone screen) with `inset` {x, top, bottom}; `fontPx` overrides the size
// (phones use ~2× desktop); long lines shrink to `minPx`, and further only if they would still exceed `maxLines`.
export function drawCaption(
  ctx,
  text,
  {outW, outH, u, pos = 'bottom', alpha = 1, rise = 0, bottomInset = 0, rect, inset, fontPx, minPx, maxLines = 3},
) {
  if (alpha <= 0 || !text) return
  let px = Math.round(fontPx ?? 28 * u) // 1.18× the 24px kit base
  const floor = Math.round(minPx ?? px * 0.75)
  ctx.save()
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const area = rect || {x: 0, y: 0, w: outW, h: outH}
  const ins = {x: 0, top: 48 * u, bottom: 64 * u + bottomInset, ...inset}
  let lines, padX, padY
  for (;;) {
    ctx.font = `600 ${px}px Inter`
    padX = 26 * (px / (28 * u)) * u
    padY = 15 * (px / (28 * u)) * u
    lines = wrapText(ctx, text, (rect ? area.w - ins.x * 2 : outW * 0.62) - padX * 2)
    if (lines.length <= maxLines || px <= 12) break
    px -= px > floor ? 2 : 1
  }
  const lineH = px * 1.3
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + padX * 2
  const h = lines.length * lineH + padY * 2
  const cx = area.x + area.w / 2
  const x = cx - w / 2
  const y = pos === 'top' ? area.y + ins.top + rise : area.y + area.h - h - ins.bottom + rise
  ctx.globalAlpha = alpha
  ctx.shadowColor = 'rgba(0,0,0,0.30)'
  ctx.shadowBlur = 24 * u
  ctx.shadowOffsetY = 6 * u
  ctx.fillStyle = 'rgba(24,24,27,0.94)'
  roundRect(ctx, x, y, w, h, h / 2 > lineH ? 18 * u : h / 2)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#fafafa'
  lines.forEach((l, i) => ctx.fillText(l, cx, y + padY + lineH * (i + 0.5)))
  ctx.restore()
  return {x, y, w, h}
}

// iOS Simulator-style touch indicator: a soft translucent gray disc that lands, presses in slightly and fades.
// p: 0..1 over the tap's life. r: radius in output px.
export function drawTouch(ctx, cx, cy, p, r) {
  if (p <= 0 || p >= 1) return
  const land = clamp(p / 0.08, 0, 1) // appears
  const press = clamp((p - 0.08) / 0.22, 0, 1) // presses in
  const fade = p < 0.45 ? 0 : easeIn(clamp((p - 0.45) / 0.55, 0, 1))
  const scale = lerp(1.12, 0.94, easeOut(press)) + fade * 0.08
  const alpha = land * (1 - fade)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(cx, cy, r * scale, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(128,128,128,0.42)'
  ctx.fill()
  ctx.lineWidth = Math.max(1, r * 0.06)
  ctx.strokeStyle = 'rgba(60,60,67,0.32)'
  ctx.stroke()
  ctx.restore()
}

export function drawBadge(ctx, text, {outW, u, alpha = 1, right, top}) {
  if (alpha <= 0) return
  const fontPx = Math.round(20 * u)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = `600 ${fontPx}px Inter`
  ctx.textBaseline = 'middle'
  const padX = 16 * u,
    h = 40 * u
  const tw = ctx.measureText(text).width
  const dot = 10 * u
  const w = tw + padX * 2 + dot + 10 * u
  const x = (right ?? outW - 28 * u) - w,
    y = top ?? 28 * u
  ctx.fillStyle = 'rgba(24,24,27,0.9)'
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.fill()
  ctx.fillStyle = SEED_GREEN
  ctx.beginPath()
  ctx.arc(x + padX + dot / 2, y + h / 2, dot / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fafafa'
  ctx.textAlign = 'left'
  ctx.fillText(text, x + padX + dot + 10 * u, y + h / 2)
  ctx.restore()
}

export function drawLogo(ctx, x, y, size, logo) {
  const w = size * (logo.width / logo.height)
  ctx.save()
  ctx.drawImage(logo, x + (size - w) / 2, y, w, size)
  ctx.restore()
  return w
}

// Shrinks the font until `text` fits in `maxW` (never below minPx).
function fitFont(ctx, weight, px, minPx, text, maxW) {
  for (let size = px; size >= minPx; size -= 1) {
    ctx.font = `${weight} ${Math.round(size)}px Inter`
    if (ctx.measureText(text).width <= maxW) return
  }
}

/** Dark green ink used for text and the logo on brand-green cards. */
export const BRAND_INK = '#0b2e23'

const tintCache = new Map()
function tintedLogo(logo, color) {
  const key = `${logo.src}|${color}`
  if (!tintCache.has(key)) {
    const c = createCanvas(logo.width * 2, logo.height * 2)
    const g = c.getContext('2d')
    g.drawImage(logo, 0, 0, c.width, c.height)
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = color
    g.fillRect(0, 0, c.width, c.height)
    tintCache.set(key, c)
  }
  return tintCache.get(key)
}

// Shared brand card background: Seed green with a soft light falloff and a large, slowly drifting logo watermark.
function drawBrandBackground(ctx, {outW, outH, u, ms, logo}) {
  ctx.fillStyle = SEED_GREEN
  ctx.fillRect(0, 0, outW, outH)
  const g = ctx.createRadialGradient(outW * 0.3, outH * 0.25, 0, outW * 0.3, outH * 0.25, Math.hypot(outW, outH) * 0.8)
  g.addColorStop(0, 'rgba(255,255,255,0.16)')
  g.addColorStop(1, 'rgba(3,142,122,0.22)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, outW, outH)
  const mark = tintedLogo(logo, '#ffffff')
  const h = Math.max(outW, outH) * 0.78
  const w = h * (logo.width / logo.height)
  const drift = ms / 1000
  ctx.save()
  ctx.globalAlpha = 0.14
  ctx.translate(outW > outH ? outW * 0.82 : outW * 0.7, outH * 0.55)
  ctx.rotate(-0.12 + drift * 0.01)
  ctx.scale(1 + drift * 0.012, 1 + drift * 0.012)
  ctx.drawImage(mark, -w / 2, -h / 2, w, h)
  ctx.restore()
}

function drawBrandRow(ctx, x, y, size, {logo, brand, color = BRAND_INK, align = 'left'}) {
  ctx.font = `700 ${Math.round(size * 0.62)}px Inter`
  const wm = brand.wordmark
  const logoW = size * (logo.width / logo.height)
  const gap = size * 0.36
  const rowW = logoW + gap + ctx.measureText(wm).width
  const x0 = align === 'center' ? x - rowW / 2 : x
  ctx.drawImage(tintedLogo(logo, color), x0, y - size / 2, logoW, size)
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(wm, x0 + logoW + gap, y + size * 0.03)
  return rowW
}

/**
 * Brand outro card (16:9 and 9:16), the same for every tutorial: a Seed-green circle reveal over the last app frame,
 * then logo + wordmark, the takeaway and the tutorial link. `p` = reveal progress 0..1, `ms` = time since the outro began.
 */
export function drawOutro(ctx, outro, {outW, outH, u, p, ms = 0, logo, brand}) {
  if (p <= 0) return
  const portrait = outH > outW
  const k = (d, dur = 450) => easeOut(prog(ms, d, dur))
  ctx.save()
  ctx.beginPath()
  ctx.arc(outW / 2, outH / 2, (Math.hypot(outW, outH) / 2) * p, 0, Math.PI * 2)
  ctx.clip()
  drawBrandBackground(ctx, {outW, outH, u, ms, logo})
  const cx = outW / 2,
    cy = outH / 2
  const maxW = outW - (portrait ? 120 : 360) * u
  let e = k(300)
  ctx.globalAlpha = e
  const logoSize = (portrait ? 150 : 132) * u
  const logoW = logoSize * (logo.width / logo.height)
  ctx.drawImage(
    tintedLogo(logo, BRAND_INK),
    cx - logoW / 2,
    cy - (portrait ? 330 : 250) * u + (1 - e) * 16 * u,
    logoW,
    logoSize,
  )
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = BRAND_INK
  ctx.font = `700 ${Math.round((portrait ? 64 : 60) * u)}px Inter`
  ctx.fillText(outro.wordmark || brand.wordmark, cx, cy - (portrait ? 110 : 60) * u + (1 - e) * 16 * u)
  e = k(500)
  ctx.globalAlpha = e
  ctx.fillStyle = 'rgba(11,46,35,0.82)'
  const take = outro.takeaway || ''
  if (portrait) {
    ctx.font = `500 ${Math.round(36 * u)}px Inter`
    wrapText(ctx, take, maxW).forEach((l, i) => ctx.fillText(l, cx, cy + (i * 48 - 10) * u + (1 - e) * 12 * u))
  } else {
    fitFont(ctx, 500, 32 * u, 20 * u, take, maxW)
    ctx.fillText(take, cx, cy + 14 * u + (1 - e) * 12 * u)
  }
  const link = outro.link || ''
  if (link) {
    e = k(700)
    ctx.globalAlpha = e
    fitFont(ctx, 600, (portrait ? 30 : 28) * u, 16 * u, link, maxW - 64 * u)
    const pw = ctx.measureText(link).width + 64 * u,
      ph = 64 * u,
      py = cy + (portrait ? 170 : 110) * u + (1 - e) * 12 * u
    roundRect(ctx, cx - pw / 2, py, pw, ph, ph / 2)
    ctx.fillStyle = BRAND_INK
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(link, cx, py + ph / 2 + 1 * u)
  }
  if (outro.cta) {
    e = k(850)
    ctx.globalAlpha = e
    ctx.fillStyle = BRAND_INK
    fitFont(ctx, 600, 24 * u, 15 * u, outro.cta, maxW)
    ctx.fillText(outro.cta, cx, cy + (portrait ? 290 : 225) * u)
  }
  ctx.restore()
}

/**
 * Brand intro card (16:9 and 9:16), the same for every tutorial: Seed-green background, logo + wordmark, a "Tutorial"
 * kicker (`intro.kicker`), the title and subtitle, rising in one after another. `ms` = time since start.
 */
export function drawIntro(ctx, intro, {outW, outH, u, ms, logo, brand}) {
  const portrait = outH > outW
  const k = (d, dur = 550) => easeOut(prog(ms, d, dur))
  ctx.save()
  drawBrandBackground(ctx, {outW, outH, u, ms, logo})
  const pad = (portrait ? 80 : 140) * u
  const maxW = outW - pad * 2 - (portrait ? 0 : 280 * u)
  let e = k(80)
  ctx.globalAlpha = e
  drawBrandRow(ctx, pad, pad + (portrait ? 40 : 20) * u - (1 - e) * 10 * u, (portrait ? 72 : 60) * u, {logo, brand})
  let px = (portrait ? 96 : 92) * u,
    lines
  for (;;) {
    ctx.font = `700 ${Math.round(px)}px Inter`
    lines = wrapText(ctx, intro.title || '', maxW)
    if (lines.length <= (portrait ? 4 : 2) || px <= 44 * u) break
    px -= 4 * u
  }
  const lh = px * 1.08
  const subPx = (portrait ? 40 : 36) * u
  const kickerH = 52 * u
  const blockH = kickerH + 36 * u + lines.length * lh + (intro.subtitle ? subPx * 2.3 : 0)
  let y = outH / 2 - blockH / 2 + (portrait ? 40 : 30) * u
  e = k(250)
  ctx.globalAlpha = e
  const kicker = (intro.kicker || 'Tutorial').toUpperCase()
  ctx.font = `700 ${Math.round(22 * u)}px Inter`
  const kw = ctx.measureText(kicker).width + 44 * u
  roundRect(ctx, pad, y + (1 - e) * 14 * u, kw, kickerH, kickerH / 2)
  ctx.fillStyle = BRAND_INK
  ctx.fill()
  ctx.fillStyle = SEED_GREEN
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(kicker, pad + 22 * u, y + kickerH / 2 + 1 * u + (1 - e) * 14 * u)
  y += kickerH + 36 * u
  e = k(420)
  ctx.globalAlpha = e
  ctx.font = `700 ${Math.round(px)}px Inter`
  ctx.fillStyle = BRAND_INK
  ctx.textBaseline = 'top'
  lines.forEach((l, i) => ctx.fillText(l, pad, y + i * lh + (1 - e) * 20 * u))
  y += lines.length * lh
  if (intro.subtitle) {
    e = k(650)
    ctx.globalAlpha = e
    ctx.font = `500 ${Math.round(subPx)}px Inter`
    ctx.fillStyle = 'rgba(11,46,35,0.78)'
    wrapText(ctx, intro.subtitle, maxW).forEach((l, i) =>
      ctx.fillText(l, pad, y + subPx * 1.1 + i * subPx * 1.3 + (1 - e) * 12 * u),
    )
  }
  ctx.restore()
}

// Renderer-drawn iPhone (Dynamic Island generation), vector only, no asset. `scr` is the screen rect in output px,
// `ppt` output px per iOS point, `radius` the screen corner radius in pt. Draws shell + side buttons; the caller
// clips the capture to the screen and then calls drawStatusBar / drawDynamicIsland / drawHomeIndicator on top.
export const IPHONE_BEZEL_PT = 12
export function drawIphoneShell(ctx, scr, ppt, radius = 55) {
  const bez = IPHONE_BEZEL_PT * ppt
  const ox = scr.x - bez,
    oy = scr.y - bez,
    ow = scr.w + bez * 2,
    oh = scr.h + bez * 2,
    orad = (radius + IPHONE_BEZEL_PT) * ppt
  ctx.save()
  // side buttons (silhouettes just outside the shell)
  ctx.fillStyle = '#1c1c1f'
  const btn = (side, yPt, lenPt) =>
    roundRect(ctx, side === 'l' ? ox - 3 * ppt : ox + ow - 0.5 * ppt, oy + yPt * ppt, 3.5 * ppt, lenPt * ppt, 1.5 * ppt)
  btn('l', 170, 32)
  ctx.fill()
  btn('l', 228, 64)
  ctx.fill()
  btn('l', 306, 64)
  ctx.fill()
  btn('r', 246, 104)
  ctx.fill()
  // shell
  ctx.shadowColor = 'rgba(0,0,0,0.32)'
  ctx.shadowBlur = 36 * ppt
  ctx.shadowOffsetY = 14 * ppt
  ctx.fillStyle = '#0c0c0e'
  roundRect(ctx, ox, oy, ow, oh, orad)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  // titanium rim highlight
  ctx.lineWidth = 1.2 * ppt
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  roundRect(ctx, ox + 0.6 * ppt, oy + 0.6 * ppt, ow - 1.2 * ppt, oh - 1.2 * ppt, orad - 0.6 * ppt)
  ctx.stroke()
  ctx.restore()
}
export function iphoneScreenPath(ctx, scr, ppt, radius = 55) {
  roundRect(ctx, scr.x, scr.y, scr.w, scr.h, radius * ppt)
}

// iOS status bar (9:41, full signal, Wi-Fi, full battery) drawn in the `statusBar` pt band at the top of the screen,
// over `bg` (the page's own top color so it reads as the installed web app, not a browser). dark: label color.
export function drawStatusBar(ctx, scr, ppt, {statusBar = 59, bg = '#ffffff', dark = true}) {
  const c = dark ? '#000000' : '#ffffff'
  const cy = scr.y + 29.5 * ppt // vertically centred on the Dynamic Island
  ctx.save()
  ctx.fillStyle = bg
  ctx.fillRect(scr.x, scr.y, scr.w, statusBar * ppt)
  ctx.fillStyle = c
  ctx.font = `600 ${Math.round(17 * ppt)}px Inter`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('9:41', scr.x + 68 * ppt, cy + 0.5 * ppt)
  // battery: 25×12 body + cap, full
  const bx = scr.x + scr.w - 27 * ppt - 25 * ppt,
    by = cy - 6 * ppt
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 1 * ppt
  ctx.strokeStyle = c
  roundRect(ctx, bx, by, 25 * ppt, 12 * ppt, 3.8 * ppt)
  ctx.stroke()
  ctx.fillStyle = c
  roundRect(ctx, bx + 26.2 * ppt, by + 4 * ppt, 1.4 * ppt, 4 * ppt, 0.7 * ppt)
  ctx.fill()
  ctx.globalAlpha = 1
  roundRect(ctx, bx + 2 * ppt, by + 2 * ppt, 21 * ppt, 8 * ppt, 2.2 * ppt)
  ctx.fill()
  // wi-fi: three arcs + dot
  const wx = bx - 7 * ppt - 8.5 * ppt,
    wy = cy + 5 * ppt
  ctx.lineCap = 'round'
  for (const [r, lw] of [
    [8.6, 2.1],
    [5.4, 2.1],
  ]) {
    ctx.lineWidth = lw * ppt
    ctx.beginPath()
    ctx.arc(wx, wy, r * ppt, -Math.PI * 0.78, -Math.PI * 0.22)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(wx, wy - 1.2 * ppt, 1.6 * ppt, 0, Math.PI * 2)
  ctx.fill()
  // cellular: four bars
  const sx = wx - 8.5 * ppt - 7 * ppt - 17 * ppt
  ;[4, 6.5, 9, 11.5].forEach((hh, i) => {
    roundRect(ctx, sx + i * 4.6 * ppt, cy + 5.5 * ppt - hh * ppt, 3 * ppt, hh * ppt, 1 * ppt)
    ctx.fill()
  })
  ctx.restore()
}
export function drawDynamicIsland(ctx, scr, ppt) {
  const w = 126 * ppt,
    h = 37 * ppt,
    x = scr.x + (scr.w - w) / 2,
    y = scr.y + 11 * ppt
  ctx.save()
  ctx.fillStyle = '#000'
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.fill()
  ctx.fillStyle = '#0d0d12'
  ctx.beginPath()
  ctx.arc(x + w - h / 2, y + h / 2, 5.5 * ppt, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#16161e'
  ctx.beginPath()
  ctx.arc(x + w - h / 2, y + h / 2, 3 * ppt, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
export function drawHomeIndicator(ctx, scr, ppt, dark = true) {
  const w = 139 * ppt,
    h = 5 * ppt
  ctx.save()
  ctx.fillStyle = dark ? 'rgba(0,0,0,0.80)' : 'rgba(255,255,255,0.85)'
  roundRect(ctx, scr.x + (scr.w - w) / 2, scr.y + scr.h - 8 * ppt - h, w, h, h / 2)
  ctx.fill()
  ctx.restore()
}

// Phone outro: a bottom sheet inside the screen (logo + wordmark, takeaway, tutorial link), sized in pt.
export function drawPhoneOutro(ctx, outro, {web, ppt, p, logo, brand}) {
  if (p <= 0) return
  const e = easeOut(p)
  const F = (w, pt) => {
    ctx.font = `${w} ${Math.round(pt * ppt)}px Inter`
  }
  const padX = 20 * ppt,
    maxW = web.w - padX * 2
  F(500, 14)
  const ctaLines = wrapText(ctx, outro.cta || '', maxW)
  F(500, 15)
  const takeLines = wrapText(ctx, outro.takeaway || '', maxW)
  const hPt = 22 + 34 + 14 + takeLines.length * 20 + 8 + ctaLines.length * 19 + 34
  const h = hPt * ppt
  const y0 = web.y + web.h - h * e
  ctx.save()
  ctx.globalAlpha = e
  const g = ctx.createLinearGradient(0, y0 - 48 * ppt, 0, y0)
  g.addColorStop(0, 'rgba(24,24,27,0)')
  g.addColorStop(1, INK)
  ctx.fillStyle = g
  ctx.fillRect(web.x, y0 - 48 * ppt, web.w, 48 * ppt)
  ctx.fillStyle = INK
  ctx.fillRect(web.x, y0, web.w, h)
  let y = y0 + 22 * ppt
  const logoSize = 34 * ppt
  const logoWidth = drawLogo(ctx, web.x + padX, y, logoSize, logo)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#fafafa'
  F(700, 22)
  ctx.fillText(outro.wordmark || brand.wordmark, web.x + padX + logoWidth + 12 * ppt, y + logoSize / 2)
  ctx.textAlign = 'right'
  F(600, 15)
  ctx.fillText(outro.link || '', web.x + web.w - padX, y + logoSize / 2)
  y += logoSize + 14 * ppt
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#e4e4e7'
  F(500, 15)
  for (const l of takeLines) {
    ctx.fillText(l, web.x + padX, y + 15 * ppt)
    y += 20 * ppt
  }
  y += 8 * ppt
  ctx.fillStyle = brand.accent
  F(500, 14)
  for (const l of ctaLines) {
    ctx.fillText(l, web.x + padX, y + 14 * ppt)
    y += 19 * ppt
  }
  ctx.restore()
}

// Optional desktop window frame (one consistent style): title bar with traffic lights.
export function drawWindowFrame(ctx, r, u) {
  const bar = 44 * u
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.28)'
  ctx.shadowBlur = 50 * u
  ctx.shadowOffsetY = 18 * u
  ctx.fillStyle = '#f4f4f5'
  roundRect(ctx, r.x, r.y - bar, r.w, r.h + bar, 16 * u)
  ctx.fill()
  ctx.restore()
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(r.x + (22 + i * 22) * u, r.y - bar / 2, 7 * u, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawCardFrame(ctx, r, u) {
  ctx.save()
  ctx.shadowColor = 'rgba(24, 24, 27, 0.16)'
  ctx.shadowBlur = 30 * u
  ctx.shadowOffsetY = 12 * u
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, r.x, r.y, r.w, r.h, 16 * u)
  ctx.fill()
  ctx.restore()
}

export function drawCardBorder(ctx, r, u) {
  ctx.save()
  ctx.lineWidth = 1 * u
  ctx.strokeStyle = 'rgba(24, 24, 27, 0.12)'
  roundRect(ctx, r.x + 0.5 * u, r.y + 0.5 * u, r.w - u, r.h - u, 16 * u)
  ctx.stroke()
  ctx.restore()
}
