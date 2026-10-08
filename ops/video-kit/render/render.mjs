#!/usr/bin/env node
// Usage: node ops/video-kit/render/render.mjs <folder> --lang en --format 16x9|9x16 [--preview] [--fps 60] [--out file.mp4]
//        [--poster file.png] [--frame card|none|window] [--no-audio] [--still <ms> <file.png>] [--contact <file.png>]
import fs from 'node:fs'
import path from 'node:path'
import {spawn} from 'node:child_process'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {createCanvas, loadImage} from 'canvas'
import {
  ensureFonts,
  drawCursor,
  drawRipple,
  drawTouch,
  drawCaption,
  drawBadge,
  drawOutro,
  drawPhoneOutro,
  drawIphoneShell,
  iphoneScreenPath,
  drawStatusBar,
  drawDynamicIsland,
  drawHomeIndicator,
  drawWindowFrame,
  drawCardFrame,
  drawCardBorder,
  drawIntro,
  easeInOut,
  prog,
  BACKDROP,
  DEFAULT_THEME,
} from './draw.mjs'
import {compile} from './timeline.mjs'
import {renderAudio} from '../audio/mix.mjs'

const args = process.argv.slice(2)
const folder = path.resolve(args.find((a) => !a.startsWith('--')) || '.')
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`)
  return i >= 0 ? args[i + 1] : d
}
const has = (n) => args.includes(`--${n}`)
const lang = flag('lang', 'en')
const format = flag('format', '16x9')
const preview = has('preview')
const fps = Number(flag('fps', 60))
const [outW, outH] = format === '9x16' ? (preview ? [1080, 1920] : [2160, 3840]) : preview ? [1920, 1080] : [3840, 2160]
const slug = path.basename(folder)
const outDir = path.join(folder, 'out')
fs.mkdirSync(outDir, {recursive: true})
const outFile = flag('out', path.join(outDir, `${slug}-${lang}-${format}${preview ? '-preview' : ''}.mp4`))
const posterFile = flag('poster', path.join(folder, `poster-${lang}${format === '9x16' ? '-9x16' : ''}.png`))

ensureFonts()
const beatsAll = JSON.parse(fs.readFileSync(path.join(folder, 'shots/beats.json'), 'utf8'))
// 9:16 renders come from a phone-viewport take ("<lang>-9x16"), never from a reframed desktop capture
const takeKey = format === '9x16' ? `${lang}-9x16` : lang
const take = beatsAll.takes[takeKey]
if (!take)
  throw new Error(
    `no take "${takeKey}" in shots/beats.json (have: ${Object.keys(
      beatsAll.takes,
    )}). Capture it: node ops/video-kit/capture/run.mjs ${folder} --lang ${lang}${
      format === '9x16' ? ' --format 9x16' : ''
    }`,
  )
const spec = (await import(pathToFileURL(path.join(folder, 'spec.js')).href)).default
const frameStyle = flag('frame', spec.frame || 'card')
const brand = {...DEFAULT_THEME, ...spec.theme}
const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const logo = await loadImage(path.resolve(repoDir, brand.logo))
const captions = JSON.parse(fs.readFileSync(path.join(folder, `captions.${lang}.json`), 'utf8'))
// shots/*.png are git-ignored: a fresh checkout has beats.json but no screenshots, so say so up front
const pngs = [...new Set(JSON.stringify(take).match(/"[^"]+\.png"/g) || [])].map((q) =>
  path.join(folder, JSON.parse(q)),
)
const missing = pngs.filter((f) => !fs.existsSync(f))
if (missing.length)
  throw new Error(
    `${
      missing.length
    } screenshot(s) referenced by shots/beats.json are missing (shots/*.png are git-ignored). Capture first: node ops/video-kit/capture/run.mjs ${folder} --lang ${lang}${
      format === '9x16' ? ' --format 9x16' : ''
    }\n  e.g. ${missing[0]}`,
  )
const tl = await compile({take, spec, captions, lang, format, folder})
const imgs = new Map(await Promise.all(tl.files.map(async (f) => [f, await loadImage(f)])))

const canvas = createCanvas(outW, outH)
const ctx = canvas.getContext('2d')
const u = format === '9x16' ? outW / 1080 : outH / 1080
const S = imgs.get(tl.files[0]).width / tl.vw // image px per css px (should equal the capture DPR)
// Phone takes render inside a renderer-drawn iPhone: screen = `take.screen` pt (393×852, 59 pt status bar), the
// capture fills the web area below the status bar, shown whole (no zoom); captions sit below the device.
const isPhone = tl.frame === 'iphone' || tl.frame === 'phone'
const phone = isPhone
  ? (() => {
      const scrPt = {width: 393, height: 852, statusBar: 59, radius: 55, ...(tl.screen || {})}
      const ppt = (outH * 0.72) / scrPt.height // px per iOS pt → device ≈ 74% of the frame height, caption band below
      const sw = scrPt.width * ppt,
        sh = scrPt.height * ppt
      const scr = {x: (outW - sw) / 2, y: outH * 0.05, w: sw, h: sh}
      const sb = scrPt.statusBar * ppt
      const below = scr.y + sh + 12 * ppt // bezel bottom
      return {
        ppt,
        scrPt,
        scr,
        web: {x: scr.x, y: scr.y + sb, w: sw, h: sh - sb},
        capBand: {x: 0, y: below, w: outW, h: outH - below},
      }
    })()
  : null
const topColor = new Map() // file → page background at the top edge, used behind the iOS status bar
function topColorOf(file) {
  if (!topColor.has(file)) {
    const img = imgs.get(file),
      c = createCanvas(1, 1),
      cx = c.getContext('2d')
    cx.drawImage(img, 2, 2, Math.max(1, img.width - 4), 1, 0, 0, 1, 1)
    const [r, g, b] = cx.getImageData(0, 0, 1, 1).data
    topColor.set(file, {css: `rgb(${r},${g},${b})`, dark: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5})
  }
  return topColor.get(file)
}

// Where the camera view lands on the output canvas (contain fit), with margins for device/window frames.
function destRect(view) {
  if (phone) return {...phone.web, k: phone.web.w / (view.w * S)}
  let availW = outW,
    availH = outH,
    ox = 0,
    oy = 0
  if (frameStyle === 'window') {
    availW = outW * 0.9
    availH = outH * 0.86
    ox = (outW - availW) / 2
    oy = (outH - availH) / 2 + 20 * u
  }
  if (frameStyle === 'card') {
    availW = outW * 0.89
    availH = outH * 0.89
    ox = (outW - availW) / 2
    oy = (outH - availH) / 2
  }
  const k = Math.min(availW / (view.w * S), availH / (view.h * S))
  const dw = view.w * S * k,
    dh = view.h * S * k
  // full-bleed when the capture aspect matches the output (within 0.5%): cover the canvas exactly, no hairline bars
  if (frameStyle === 'none' && Math.abs(dw / dh - outW / outH) < 0.005)
    return {x: 0, y: 0, w: outW, h: outH, k: outW / (view.w * S), full: true}
  return {x: ox + (availW - dw) / 2, y: oy + (availH - dh) / 2, w: dw, h: dh, k}
}
const mapRect = (r, view, d) => ({
  x: d.x + (r.x - view.x) * S * d.k,
  y: d.y + (r.y - view.y) * S * d.k,
  w: r.w * S * d.k,
  h: r.h * S * d.k,
})
const mapPt = (p, view, d) => ({x: d.x + (p.x - view.x) * S * d.k, y: d.y + (p.y - view.y) * S * d.k})

// Text intro (both formats): `captions.intro` { title, subtitle } (title defaults to spec.title; `intro: false` turns
// it off) holds INTRO ms, the last INTRO_FADE of which crossfades into the first app frame. The app timeline starts after it.
const INTRO_FADE = 500
const intro = captions.intro === false ? null : {title: spec.title, ...(captions.intro || {})}
const INTRO = intro ? 2800 : 0
const duration = tl.duration + INTRO
const introCanvas = intro ? createCanvas(outW, outH) : null
function drawFrame(ms) {
  if (ms >= INTRO) return drawScene(ms - INTRO)
  const fade = easeInOut(prog(ms, INTRO - INTRO_FADE, INTRO_FADE))
  if (fade > 0) drawScene(0)
  ctx.save()
  ctx.globalAlpha = 1 - fade
  if (fade > 0) {
    // composite the card over the scene
    const ic = introCanvas.getContext('2d')
    ic.clearRect(0, 0, outW, outH)
    drawIntro(ic, intro, {outW, outH, u, ms, logo, brand})
    ctx.drawImage(introCanvas, 0, 0)
  } else drawIntro(ctx, intro, {outW, outH, u, ms, logo, brand})
  ctx.restore()
}
function drawScene(ms) {
  const st = tl.stateAt(ms)
  const cameraView = st.view
  const isCard = !phone && frameStyle === 'card'
  const view = isCard ? {x: 0, y: 0, w: tl.vw, h: tl.vh} : cameraView
  const d = destRect(view)
  const fullBleed = !!d.full
  ctx.globalAlpha = 1
  ctx.fillStyle = BACKDROP
  ctx.fillRect(0, 0, outW, outH)
  if (phone) drawIphoneShell(ctx, phone.scr, phone.ppt, phone.scrPt.radius)
  else if (frameStyle === 'window') drawWindowFrame(ctx, d, u)
  if (isCard) {
    const focus = mapPt({x: cameraView.x + cameraView.w / 2, y: cameraView.y + cameraView.h / 2}, view, d)
    const zoom = tl.vw / cameraView.w
    ctx.save()
    ctx.translate(outW / 2, outH / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(-focus.x, -focus.y)
    drawCardFrame(ctx, d, u)
  }
  ctx.save()
  if (phone) {
    ctx.beginPath()
    iphoneScreenPath(ctx, phone.scr, phone.ppt, phone.scrPt.radius)
    ctx.clip()
  } else if (!fullBleed) {
    ctx.beginPath()
    ctx.roundRect
      ? ctx.roundRect(d.x, d.y, d.w, d.h, frameStyle === 'card' ? 16 * u : frameStyle === 'window' ? 0 : 12 * u)
      : ctx.rect(d.x, d.y, d.w, d.h)
    ctx.clip()
  }
  for (const L of st.layers) {
    ctx.globalAlpha = L.alpha
    ctx.drawImage(imgs.get(L.file), view.x * S, view.y * S, view.w * S, view.h * S, d.x, d.y, d.w, d.h)
  }
  ctx.globalAlpha = 1
  if (st.typing) {
    // reveal typed text left→right: cover the not-yet-typed part with the "before" image
    const r = st.typing.rect,
      revealed = r.w * st.typing.p
    const sx = (r.x + revealed) * S,
      sw = (r.w - revealed) * S
    if (sw > 0) {
      const m = mapRect({x: r.x + revealed, y: r.y, w: r.w - revealed, h: r.h}, view, d)
      ctx.drawImage(imgs.get(st.typing.before), sx, r.y * S, sw, r.h * S, m.x, m.y, m.w, m.h)
    }
  }
  if (!phone) ctx.restore() // desktop overlays (cursor, caption) are not clipped to the window frame
  if (isCard) drawCardBorder(ctx, d, u)
  for (const r of st.ripples) {
    const c = mapPt(r.c, view, d)
    drawRipple(ctx, c.x, c.y, r.p, {u})
  }
  for (const tp of st.taps || []) {
    const c = mapPt(tp.c, view, d)
    drawTouch(ctx, c.x, c.y, tp.p, 22 * (phone?.ppt || u))
  }
  if (st.cursor.alpha > 0) {
    const c = mapPt(st.cursor, view, d)
    drawCursor(ctx, c.x, c.y, 30 * u, st.cursor.alpha, st.cursor.press)
  }
  if (isCard) {
    ctx.restore()
  }
  const top = phone ? topColorOf(st.layers[st.layers.length - 1].file) : null
  if (phone) {
    // iOS chrome over the capture: status bar on the page's own top colour, Dynamic Island
    drawStatusBar(ctx, phone.scr, phone.ppt, {statusBar: phone.scrPt.statusBar, bg: top.css, dark: top.dark})
    drawDynamicIsland(ctx, phone.scr, phone.ppt)
  }
  if (st.caption && !phone) {
    const belowContent = d.y + d.h < outH - 160 * u
    drawCaption(ctx, st.caption.text, {
      outW,
      outH,
      u,
      pos: st.caption.pos,
      alpha: st.caption.alpha,
      rise: st.caption.rise,
      bottomInset: belowContent ? Math.max(0, outH - (d.y + d.h) - 150 * u) : 0,
    })
  }
  const badgeText = captions.badge || (lang === 'es' ? 'Acelerado' : 'Sped up')
  if (st.badge)
    drawBadge(
      ctx,
      badgeText,
      phone
        ? {
            outW,
            u,
            alpha: st.badge.alpha,
            right: phone.web.x + phone.web.w - 12 * phone.ppt,
            top: phone.web.y + 10 * phone.ppt,
          }
        : {outW, u, alpha: st.badge.alpha},
    )
  if (st.outro > 0) {
    if (phone) drawPhoneOutro(ctx, captions.outro || {}, {web: phone.web, ppt: phone.ppt, p: st.outro, logo, brand})
    else drawOutro(ctx, captions.outro || {}, {outW, outH, u, p: st.outro, logo, brand})
  }
  if (phone) {
    drawHomeIndicator(ctx, phone.scr, phone.ppt, st.outro < 0.5)
    ctx.restore()
  }
  if (st.caption && phone) {
    // ~2× desktop size, in the band below the device, never over the screen
    const band = phone.capBand
    drawCaption(ctx, st.caption.text, {
      outW,
      outH,
      u,
      pos: 'top',
      alpha: st.caption.alpha,
      rise: st.caption.rise,
      rect: band,
      inset: {x: 60 * u, top: Math.max(24 * u, (band.h - 2 * 56 * u * 1.3 - 30 * u) / 2), bottom: 0},
      fontPx: 56 * u,
      minPx: 44 * u,
      maxLines: 2,
    })
  }
}

if (has('still')) {
  const i = args.indexOf('--still')
  drawFrame(Number(args[i + 1]))
  fs.writeFileSync(args[i + 2], canvas.toBuffer('image/png'))
  console.log('still written', args[i + 2])
  process.exit(0)
}
if (has('contact')) {
  // contact sheet: a frame every N ms (default 2000) for review
  const every = Number(flag('every', 2000))
  const n = Math.ceil(duration / every),
    cols = 4,
    rows = Math.ceil(n / cols),
    tw = 480,
    th = Math.round((tw * outH) / outW)
  const sheet = createCanvas(cols * tw, rows * (th + 28))
  const sctx = sheet.getContext('2d')
  sctx.fillStyle = '#111'
  sctx.fillRect(0, 0, sheet.width, sheet.height)
  for (let i = 0; i < n; i++) {
    drawFrame(i * every)
    const x = (i % cols) * tw,
      y = Math.floor(i / cols) * (th + 28)
    sctx.drawImage(canvas, x, y + 28, tw, th)
    sctx.fillStyle = '#fff'
    sctx.font = '14px Inter'
    sctx.fillText(`${((i * every) / 1000).toFixed(1)}s`, x + 6, y + 19)
  }
  fs.writeFileSync(flag('contact'), sheet.toBuffer('image/png'))
  console.log('contact sheet written', flag('contact'), `${(duration / 1000).toFixed(1)}s`)
  process.exit(0)
}

// poster: frame at spec.posterAt (a beat name, sampled 1.5 s in so the caption is up; or ms) or ~40% in
const posterMs =
  typeof spec.posterAt === 'string'
    ? tl.beatAt[spec.posterAt] != null
      ? Math.min(tl.beatAt[spec.posterAt] + 1500, tl.duration - 1)
      : Math.round(tl.duration * 0.4)
    : spec.posterAt ?? Math.round(tl.duration * 0.4)
drawScene(posterMs)
fs.writeFileSync(
  posterFile,
  (format === '9x16' || outW <= 1920 ? canvas : downscale(canvas, 1920)).toBuffer('image/png'),
)

const audioFile = outFile.replace(/\.mp4$/, '.wav')
if (!has('no-audio'))
  renderAudio({durationMs: duration, events: tl.events.map((e) => ({...e, t: e.t + INTRO})), out: audioFile})

const totalFrames = Math.ceil((duration / 1000) * fps)
const ff = spawn(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-nostats',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'bgra',
    '-s',
    `${outW}x${outH}`,
    '-r',
    String(fps),
    '-i',
    'pipe:0',
    ...(has('no-audio') ? [] : ['-i', audioFile]),
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-preset',
    preview ? 'fast' : 'slow',
    '-crf',
    preview ? '20' : '17',
    '-pix_fmt',
    'yuv420p',
    '-colorspace',
    'bt709',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    ...(has('no-audio') ? [] : ['-c:a', 'aac', '-ar', '48000', '-b:a', '160k']),
    '-shortest',
    '-movflags',
    '+faststart',
    outFile,
  ],
  {stdio: ['pipe', 'inherit', 'inherit']},
)
const t0 = Date.now()
for (let f = 0; f < totalFrames; f++) {
  drawFrame((f * 1000) / fps)
  const buf = canvas.toBuffer('raw')
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  if (f % (fps * 5) === 0)
    process.stderr.write(`\r[render] ${((f / totalFrames) * 100).toFixed(0)}% (${f}/${totalFrames})  `)
}
ff.stdin.end()
await new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exit ${c}`)))))
if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile)
console.log(
  `\n[render] ${outFile} — ${(duration / 1000).toFixed(1)}s, ${outW}x${outH}@${fps} in ${(
    (Date.now() - t0) /
    1000
  ).toFixed(0)}s; poster ${posterFile}`,
)

function downscale(src, w) {
  const h = Math.round((src.height * w) / src.width)
  const c = createCanvas(w, h)
  c.getContext('2d').drawImage(src, 0, 0, w, h)
  return c
}
