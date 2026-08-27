import {copyFile, mkdir, mkdtemp, readdir, rm, writeFile} from 'node:fs/promises'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {tmpdir} from 'node:os'
import path from 'node:path'
import type {PageDriver} from './page-driver.js'
import type {RecordingAnnotation} from './types.js'

const execFileAsync = promisify(execFile)

/** A screenshot-frame recorder that stitches a self-describing MP4 with ffmpeg. */
export class FrameRecorder {
  private readonly runDir: string
  private readonly framesDir: string
  private readonly captionsDir: string
  private readonly encodedDir: string
  private readonly startedAt = Date.now()
  private readonly markers: RecordingAnnotation[] = []
  private frameNumber = 0
  private stopped = false

  /** Create a recorder rooted at one run artifact directory. */
  public constructor(runDir: string) {
    this.runDir = runDir
    this.framesDir = path.join(runDir, 'frames')
    this.captionsDir = path.join(runDir, 'captions')
    this.encodedDir = path.join(runDir, 'encoded-frames')
  }

  /** Prepare artifact directories before the first capture. */
  public async start(): Promise<void> {
    await Promise.all([
      mkdir(this.framesDir, {recursive: true}),
      mkdir(this.captionsDir, {recursive: true}),
      mkdir(this.encodedDir, {recursive: true}),
    ])
  }

  /** Capture one screenshot and associate it with a semantic marker. */
  public async capture(
    driver: PageDriver,
    label: string,
    result: 'passed' | 'failed' | 'untested',
    type: RecordingAnnotation['type'] = 'assertion',
    test?: string,
    assertion?: string,
  ): Promise<{framePath: string; marker: RecordingAnnotation}> {
    if (this.stopped) throw new Error('Cannot capture after recorder stop')
    const screenshot = await driver.screenshot()
    const frameNumber = ++this.frameNumber
    const frameName = `${String(frameNumber).padStart(4, '0')}.png`
    const framePath = path.join(this.framesDir, frameName)
    const captionPath = path.join(this.captionsDir, `${frameName}.txt`)
    const marker: RecordingAnnotation = {
      id: `marker-${frameNumber}`,
      type,
      atMs: Date.now() - this.startedAt,
      description: label,
      test,
      testResult: result,
      assertion,
    }
    await writeFile(framePath, screenshot)
    await writeFile(captionPath, `${label} — ${result.toUpperCase()}\n`)
    this.markers.push(marker)
    return {framePath, marker}
  }

  /** Return all semantic annotations captured so far. */
  public annotations(): RecordingAnnotation[] {
    return [...this.markers]
  }

  /** Encode captioned frames into a watchable MP4 and return its path. */
  public async stopAndEncode(): Promise<string> {
    if (this.stopped) return path.join(this.runDir, 'video.mp4')
    this.stopped = true
    const frameNames = (await readdir(this.framesDir)).filter((name) => name.endsWith('.png')).sort()
    if (frameNames.length === 0) throw new Error('Cannot encode a recording with no frames')
    const dimensions = await Promise.all(
      frameNames.map((frameName) => probeDimensions(path.join(this.framesDir, frameName))),
    )
    const targetWidth = roundUpEven(Math.max(...dimensions.map(({width}) => width)))
    const targetHeight = roundUpEven(Math.max(...dimensions.map(({height}) => height)))
    const font = process.env.HARNESS_FONT ?? '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    let fallbackDir: string | undefined
    try {
      for (const frameName of frameNames) {
        const raw = path.join(this.framesDir, frameName)
        const caption = path.join(this.captionsDir, `${frameName}.txt`)
        const encoded = path.join(this.encodedDir, frameName)
        const args = [
          '-y',
          '-i',
          raw,
          '-vf',
          frameFilter(targetWidth, targetHeight, font, caption),
          '-frames:v',
          '1',
          encoded,
        ]
        try {
          await execFileAsync('ffmpeg', args, {maxBuffer: 2 * 1024 * 1024})
        } catch (error) {
          if (!hasFilterPathDelimiter(font) && !hasFilterPathDelimiter(caption)) throw error
          fallbackDir ??= await mkdtemp(path.join(tmpdir(), 'seed-harness-filter-'))
          const fallbackFont = path.join(fallbackDir, 'font.ttf')
          const fallbackCaption = path.join(fallbackDir, `${frameName}.txt`)
          await copyFile(font, fallbackFont)
          await copyFile(caption, fallbackCaption)
          await execFileAsync(
            'ffmpeg',
            [
              '-y',
              '-i',
              raw,
              '-vf',
              frameFilter(targetWidth, targetHeight, fallbackFont, fallbackCaption),
              '-frames:v',
              '1',
              encoded,
            ],
            {maxBuffer: 2 * 1024 * 1024},
          )
        }
      }
      const output = path.join(this.runDir, 'video.mp4')
      await execFileAsync(
        'ffmpeg',
        [
          '-y',
          '-framerate',
          '1',
          '-pattern_type',
          'glob',
          '-i',
          path.join(this.encodedDir, '*.png'),
          '-vf',
          'scale=trunc(iw/2)*2:trunc(ih/2)*2',
          '-c:v',
          'libx264',
          '-pix_fmt',
          'yuv420p',
          output,
        ],
        {maxBuffer: 2 * 1024 * 1024},
      )
      return output
    } finally {
      if (fallbackDir) await rm(fallbackDir, {recursive: true, force: true})
    }
  }
}

function frameFilter(width: number, height: number, font: string, caption: string): string {
  return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,drawtext=fontfile='${escapeFilterPath(
    font,
  )}':textfile='${escapeFilterPath(
    caption,
  )}':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.72:boxborderw=12:x=24:y=24`
}

function hasFilterPathDelimiter(filePath: string): boolean {
  return /[:,'\\[\]]/.test(filePath)
}

/** Escape backslashes and quotes in paths embedded in an ffmpeg filter. */
export function escapeFilterPath(filePath: string): string {
  return filePath.replaceAll('\\', '\\\\').replaceAll("'", "\\'")
}

async function probeDimensions(filePath: string): Promise<{width: number; height: number}> {
  const {stdout} = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=p=0',
    filePath,
  ])
  const [width, height] = stdout.trim().split(',').map(Number)
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Could not determine dimensions for ${filePath}`)
  }
  return {width, height}
}

function roundUpEven(value: number): number {
  return Math.ceil(value / 2) * 2
}
