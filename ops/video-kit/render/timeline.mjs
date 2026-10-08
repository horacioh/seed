// Compiles beats.json (one take) + spec.js + captions.<lang>.json into a deterministic timeline.
// All rects/points are in CSS px of the captured viewport; the renderer maps them through the camera.
//
// Attention model (owner-approved defaults): the camera eases toward the area the viewer must look at
// (1.1–1.25×, never a cut) and the cursor glides there; a small neutral ripple marks each real click.
// No spotlight dim, no rings, no callout glow. Pacing: every settled result holds before the next
// cursor move, and each new beat rests before its caption fades in.
// Phone takes (frame 'iphone') are touch-driven: no cursor, no glide; each real tap shows a Simulator-style
// touch indicator (`taps`) at the tap point, with the same single click sound. They never zoom and have no outro.
import {loadImage, createCanvas} from 'canvas'
import path from 'node:path'
import {clamp, easeInOut, easeOut, prog, cursorPath, moveDuration} from './draw.mjs'

export const T = {
  OPEN_HOLD: 2000,
  FIRST_CAP: 500,
  REST: 650, // quiet time at the start of each beat before its caption / cursor move
  CAP_IN: 200,
  CAP_OUT: 150,
  SETTLE: 150,
  RIPPLE: 400,
  TAP: 480,
  XFADE: 200,
  HOVER_XFADE: 120,
  ZOOM_IN: 800,
  ZOOM_OUT: 700,
  RESULT_HOLD: 1200, // after the result has settled, before the beat ends (+ REST of the next beat ≈ 1.85 s)
  END_HOLD: 3800,
  OUTRO_IN: 700,
  CURSOR_FADE: 200,
}
export const capMin = (lang) => (lang === 'es' ? 3000 : 2600)
export const ZOOM = {small: 1.25, medium: 1.18, large: 1.1, max: 1.25}

const center = (r) => ({x: r.x + r.w / 2, y: r.y + r.h / 2})

function clampView(v, vw, vh) {
  return {x: clamp(v.x, 0, vw - v.w), y: clamp(v.y, 0, vh - v.h), w: v.w, h: v.h}
}
export function fullView(vw, vh) {
  return {x: 0, y: 0, w: vw, h: vh}
}
export function zoomView(target, vw, vh, z) {
  const w = vw / z,
    h = vh / z,
    c = center(target)
  return clampView({x: c.x - w / 2, y: c.y - h / 2, w, h}, vw, vh)
}
// How far to push in on a target: small controls get the most, whole cards the least.
export function zoomFor(target, vw, vh, override) {
  if (typeof override === 'number') return clamp(override, 1, ZOOM.max)
  const frac = (target.w * target.h) / (vw * vh)
  if (frac > 0.3 || target.w > vw * 0.8 || target.h > vh * 0.7) return ZOOM.large
  if (frac > 0.06) return ZOOM.medium
  return ZOOM.small
}
const sameView = (a, b) =>
  a &&
  b &&
  Math.abs(a.x - b.x) < 0.5 &&
  Math.abs(a.y - b.y) < 0.5 &&
  Math.abs(a.w - b.w) < 0.5 &&
  Math.abs(a.h - b.h) < 0.5

// Bounding box of pixels that changed between two screenshots (CSS px), or null if the whole page changed.
export async function diffRect(fileA, fileB, vw, exclude) {
  const [a, b] = await Promise.all([loadImage(fileA), loadImage(fileB)])
  const dpr = a.width / vw
  const step = 8
  const w = Math.floor(a.width / step),
    h = Math.floor(a.height / step)
  const ca = createCanvas(w, h),
    cb = createCanvas(w, h)
  ca.getContext('2d').drawImage(a, 0, 0, w, h)
  cb.getContext('2d').drawImage(b, 0, 0, w, h)
  const da = ca.getContext('2d').getImageData(0, 0, w, h).data,
    db = cb.getContext('2d').getImageData(0, 0, w, h).data
  let x0 = w,
    y0 = h,
    x1 = -1,
    y1 = -1,
    n = 0
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])
      if (d > 60) {
        const cx = (x * step) / dpr,
          cy = (y * step) / dpr
        if (
          exclude &&
          cx >= exclude.x - 4 &&
          cx <= exclude.x + exclude.w + 4 &&
          cy >= exclude.y - 4 &&
          cy <= exclude.y + exclude.h + 4
        )
          continue
        n++
        if (x < x0) x0 = x
        if (y < y0) y0 = y
        if (x > x1) x1 = x
        if (y > y1) y1 = y
      }
    }
  if (x1 < 0) return null
  const r = {
    x: (x0 * step) / dpr,
    y: (y0 * step) / dpr,
    w: ((x1 - x0 + 1) * step) / dpr,
    h: ((y1 - y0 + 1) * step) / dpr,
  }
  const frac = (r.w * r.h) / ((a.width / dpr) * (a.height / dpr))
  return frac > 0.35 ? null : r
}

// Beat order for a format: 16:9 follows spec.beats; 9:16 follows spec.social (names), taking
// per-beat options from spec.beats when the name exists there.
export function beatOrder(spec, take, format) {
  const specBeats = spec.beats?.length ? spec.beats : take.beats.map((b) => ({name: b.name}))
  if (format === '9x16' && spec.social?.length) {
    const byName = new Map(specBeats.map((s) => [s.name, s]))
    return spec.social.map((n) => byName.get(n) || {name: n})
  }
  return specBeats
}

export async function compile({take, spec, captions, lang, format = '16x9', folder}) {
  const vw = take.viewport.width,
    vh = take.viewport.height,
    dpr = take.deviceScaleFactor
  const touch = take.frame === 'iphone' || !!take.hasTouch
  const byName = new Map(take.beats.map((b) => [b.name, b]))
  const order = beatOrder(spec, take, format)
  const abs = (f) => path.join(folder, f)

  const images = [],
    camera = [],
    cursorSegs = [],
    cursorVis = [],
    ripples = [],
    caps = [],
    badges = [],
    typings = [],
    events = [],
    presses = []
  let t = 0,
    first = true,
    noZoom = !!spec.noZoom,
    lastView = fullView(vw, vh),
    cursorPos = null,
    cursorShown = false
  const CAPMIN = spec.capMin?.[lang] ?? capMin(lang)

  const setView = (at, view) => {
    camera.push({t: at, view})
    lastView = view
  }
  const showCursor = (at, on) => {
    if (cursorShown !== on) {
      cursorVis.push({t: at, on})
      cursorShown = on
    }
  }
  const caption = (name, start, end, pos) => {
    const text = captions.beats?.[name]
    if (text === undefined) throw new Error(`captions.${lang}.json missing beat "${name}"`)
    if (text) caps.push({start, end, text, pos})
    return !!text
  }
  // eased push toward `target` (or back to full view when null); never a cut
  const pushTo = (at, target, z, dur) => {
    const view = target && !touch ? zoomView(target, vw, vh, z) : fullView(vw, vh) // phone takes never zoom
    if (sameView(view, lastView)) return
    setView(at, lastView)
    setView(at + dur, view)
  }
  // A push stays on the settled result; the ease back out is deferred so that when the next beat pushes
  // toward something else on the same page the camera glides straight there instead of out-and-in again.
  let pendingOut = null
  const deferOut = (at) => {
    if (!sameView(lastView, fullView(vw, vh))) pendingOut = at
  }
  const flushOut = () => {
    if (pendingOut != null) {
      pushTo(pendingOut, null, 1, T.ZOOM_OUT)
      pendingOut = null
    }
  }
  const willPush = () => {
    pendingOut = null
  }

  const beatAt = {}
  for (const s of order) {
    if (s.skip) continue
    const b = byName.get(s.name)
    if (!b)
      throw new Error(
        `spec beat "${s.name}" not found in capture take "${take.lang}${take.format === '9x16' ? '-9x16' : ''}"`,
      )
    if (s.noZoom !== undefined) noZoom = s.noZoom
    // zoom: spec.noZoom keeps whole-page views at 1×; per beat `zoom: true | <factor>` forces a push, `zoom: false` disables it
    const zoomOn = s.zoom === false ? false : s.zoom != null ? true : !noZoom
    const hold = s.hold ?? 0
    const capDelay = first ? T.FIRST_CAP : T.REST
    const capPos = s.capPos ?? 'auto'
    const start = t
    beatAt[s.name] = start
    let end

    if (b.kind === 'shot' || b.kind === 'poll') {
      const frames = b.kind === 'poll' ? b.frames : [{image: b.image}]
      if (s.cursor !== true) showCursor(start, false)
      if (b.cursor && !cursorPos) cursorPos = b.cursor
      const target = s.target || b.target
      const actionAt = start + (first ? T.OPEN_HOLD : T.REST)
      let minDur = capDelay + CAPMIN + 200
      if (target && (zoomOn || s.zoom)) {
        willPush()
        pushTo(actionAt, target, zoomFor(target, vw, vh, s.zoom), T.ZOOM_IN)
        minDur = Math.max(minDur, actionAt - start + T.ZOOM_IN + 1600)
      } else flushOut()
      const dur = Math.max(minDur, first ? T.OPEN_HOLD + 600 : 0, frames.length * 450) + hold
      end = start + dur
      deferOut(end - T.ZOOM_OUT - 150)
      if (frames.length > 1) {
        const per = (dur - hold) / frames.length
        frames.forEach((f, i) => images.push({t: start + i * per, file: abs(f.image), xfade: i ? 80 : T.XFADE}))
        badges.push({start, end})
      } else images.push({t: start, file: abs(frames[0].image), xfade: first ? 0 : T.XFADE})
      if (s.speed) badges.push({start, end})
      caption(s.name, start + capDelay, end, capPos === 'auto' ? 'bottom' : capPos)
    } else if (b.kind === 'click' || b.kind === 'type') {
      const target = b.target
      images.push({t: start, file: abs(b.before), xfade: first ? 0 : T.XFADE})
      if (!cursorPos) cursorPos = b.from
      if (!touch) showCursor(start, true)
      const m0 = start + (first ? T.OPEN_HOLD : T.REST + 100)
      const to = b.to,
        from = cursorPos
      const mv = touch ? 0 : moveDuration(from, to) // a tap has no travel: the finger just lands
      if (!touch) cursorSegs.push({start: m0, end: m0 + mv, from, to})
      cursorPos = to
      const m1 = m0 + mv
      let settledAt = touch ? m0 + 250 : m1
      if (zoomOn) {
        willPush()
        const zd = Math.max(mv, T.ZOOM_IN)
        pushTo(m0, target, zoomFor(target, vw, vh, s.zoom), zd)
        settledAt = Math.max(settledAt, m0 + zd)
      } else flushOut()
      if (b.hover) images.push({t: m1, file: abs(b.hover), xfade: T.HOVER_XFADE})
      const tClick = settledAt + T.SETTLE // camera and cursor are both still before the click
      ripples.push({t0: tClick, c: center(target)})
      presses.push({t0: tClick})
      events.push({t: tClick, kind: 'click'})
      let afterAt = tClick + 120
      let tail = tClick
      if (b.kind === 'type') {
        const typeDur = clamp(b.text.length * 45, 400, 1800)
        typings.push({
          start: tClick + 100,
          end: tClick + 100 + typeDur,
          rect: target,
          before: abs(b.before),
          after: abs(b.after),
        })
        afterAt = tClick + 100
        tail = tClick + 100 + typeDur
        images.push({t: afterAt, file: abs(b.after), xfade: 0, typing: true})
      } else {
        images.push({t: afterAt, file: abs(b.after), xfade: T.XFADE})
      }
      let navigated = s.navigated
      if (navigated === undefined) {
        const d = b.mark
          ? b.mark
          : await diffRect(abs(b.hover || b.before), abs(b.after), vw, b.kind === 'click' ? target : null)
        navigated = b.kind === 'click' && !b.mark && d === null // whole page changed: new route/view
      }
      end = Math.max(tail + T.RESULT_HOLD + (navigated ? 600 : 0), start + capDelay + CAPMIN) + hold
      if (navigated) pushTo(afterAt + 100, null, 1, T.ZOOM_OUT) // ease back out as the new page fades in, then hold it
      else deferOut(Math.max(tail + 450, end - T.ZOOM_OUT - 100))
      const bottomTarget = target.y + target.h > vh * 0.78
      caption(s.name, start + capDelay, end, capPos === 'auto' ? (bottomTarget ? 'top' : 'bottom') : capPos)
      if (s.speed) badges.push({start, end})
    } else throw new Error(`unknown beat kind ${b.kind}`)
    t = end
    first = false
  }
  // closing hold + outro lower-third (camera back at 1× before the lower-third rises)
  flushOut()
  const outroAt = t + 200
  const duration = t + T.END_HOLD
  if (caps.length && !touch) caps[caps.length - 1].end = Math.min(caps[caps.length - 1].end, outroAt + 150)
  showCursor(outroAt, false)
  const ifirst = images[0]
  if (ifirst) ifirst.t = 0
  camera.sort((a, b) => a.t - b.t)

  // --- state sampler ---------------------------------------------------------
  const vis0 = cursorVis.length && cursorVis[0].t <= 0 ? cursorVis[0].on : false
  function stateAt(ms) {
    // images: current + previous for crossfade
    let cur = images[0],
      prev = null
    for (const im of images) {
      if (im.t <= ms) {
        prev = cur === im ? prev : cur
        cur = im
      } else break
    }
    const xf = cur.xfade ? prog(ms, cur.t, cur.xfade) : 1
    const layers =
      prev && xf < 1 && prev !== cur
        ? [
            {file: prev.file, alpha: 1},
            {file: cur.file, alpha: easeInOut(xf)},
          ]
        : [{file: cur.file, alpha: 1}]
    // camera
    let view = fullView(vw, vh)
    for (let i = 0; i < camera.length; i++) {
      const k = camera[i],
        n = camera[i + 1]
      if (ms < k.t) break
      if (!n || ms >= n.t) {
        view = k.view
        continue
      }
      const p = easeInOut(prog(ms, k.t, n.t - k.t))
      view = {
        x: k.view.x + (n.view.x - k.view.x) * p,
        y: k.view.y + (n.view.y - k.view.y) * p,
        w: k.view.w + (n.view.w - k.view.w) * p,
        h: k.view.h + (n.view.h - k.view.h) * p,
      }
      break
    }
    // cursor
    let cpos = cursorPos0(ms),
      cvis = vis0
    for (const v of cursorVis) {
      if (v.t <= ms) cvis = v.on
    }
    let calpha = cvis ? 1 : 0
    const lastVis = [...cursorVis].reverse().find((v) => v.t <= ms)
    if (lastVis) {
      const p = prog(ms, lastVis.t, T.CURSOR_FADE)
      calpha = lastVis.on ? p : 1 - p
    }
    let press = 0
    for (const p of presses) {
      const q = ms - p.t0
      if (q >= 0 && q < 160) press = q < 60 ? q / 60 : 1 - (q - 60) / 100
    }
    const ripplesNow = touch
      ? []
      : ripples.filter((r) => ms >= r.t0 && ms < r.t0 + T.RIPPLE).map((r) => ({c: r.c, p: prog(ms, r.t0, T.RIPPLE)}))
    const taps = touch
      ? ripples
          .filter((r) => ms >= r.t0 - 60 && ms < r.t0 + T.TAP)
          .map((r) => ({c: r.c, p: prog(ms, r.t0 - 60, T.TAP + 60)}))
      : []
    let caption = null
    for (const c of caps) {
      if (ms >= c.start && ms < c.end + T.CAP_OUT) {
        const pin = easeOut(prog(ms, c.start, T.CAP_IN)),
          pout = ms > c.end ? 1 - prog(ms, c.end, T.CAP_OUT) : 1
        caption = {text: c.text, pos: c.pos, alpha: Math.min(pin, pout), rise: (1 - pin) * 16}
      }
    }
    let badge = null
    for (const b of badges)
      if (ms >= b.start && ms < b.end) badge = {alpha: Math.min(prog(ms, b.start, 200), 1 - prog(ms, b.end - 200, 200))}
    let typing = null
    for (const ty of typings)
      if (ms >= ty.start && ms < ty.end)
        typing = {rect: ty.rect, p: prog(ms, ty.start, ty.end - ty.start), before: ty.before}
    const outro = !touch && ms >= outroAt ? easeOut(prog(ms, outroAt, T.OUTRO_IN)) : 0
    return {
      layers,
      view,
      cursor: {...cpos, alpha: touch ? 0 : calpha, press},
      ripples: ripplesNow,
      taps,
      caption,
      badge,
      typing,
      outro,
      outroMs: ms - outroAt,
    }
  }
  function cursorPos0(ms) {
    let pos = cursorSegs[0]?.from || {x: vw * 0.55, y: vh * 0.6}
    for (const s of cursorSegs) {
      if (ms >= s.end) pos = s.to
      else if (ms >= s.start) return cursorPath(s.from, s.to, prog(ms, s.start, s.end - s.start))
      else break
    }
    return pos
  }
  const files = [...new Set(images.map((i) => i.file).concat(typings.map((t) => t.before)))]
  return {
    duration,
    stateAt,
    events,
    files,
    vw,
    vh,
    dpr,
    frame: take.frame,
    touch,
    screen: take.screen,
    outroAt,
    beatAt,
    camera,
    caps,
  }
}
