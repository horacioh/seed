import {parse, wcagContrast} from 'culori'
import {JSDOM} from 'jsdom'
import {beforeEach, describe, expect, it} from 'vitest'
import {expectNoAxeViolations} from '@shm/a11y-testing/dom'
import {EMAIL_PALETTE} from './email-palette'
import {createPreviews} from './render-all-previews'

const previews = await createPreviews()

const primaryActionUrls: Record<string, string> = {
  verification: 'https://hyper.media/hm/api/notify/verify-email?token=verify123',
  login: 'https://hyper.media/login?token=login123',
  welcome: 'https://seedteamtalks.hyper.media',
  discussion: 'https://seedteamtalks.hyper.media/d/abc123',
  comment: 'https://seedteamtalks.hyper.media/d/abc123',
  mention: 'https://seedteamtalks.hyper.media/d/abc123',
  reply: 'https://seedteamtalks.hyper.media/d/abc123',
  'doc-update': 'https://seedteamtalks.hyper.media/d/abc123',
  notifications: 'https://seedteamtalks.hyper.media/d/abc123',
  'desktop-notifications': 'https://seedteamtalks.hyper.media/d/abc123',
}

const contrastPairs = [
  ['text', 'surface'],
  ['text', 'bodyBackground'],
  ['text', 'subtleSurface'],
  ['text', 'commentSurface'],
  ['text', 'footerBackground'],
  ['subtleText', 'subtleSurface'],
  ['subtleText', 'codeBackground'],
  ['subtleText', 'surface'],
  ['subtleText', 'commentSurface'],
  ['subtleText', 'bodyBackground'],
  ['muted', 'surface'],
  ['muted', 'footerBackground'],
  ['muted', 'commentSurface'],
  ['brand', 'surface'],
  ['brand', 'bodyBackground'],
  ['brand', 'subtleSurface'],
  ['brand', 'commentSurface'],
  ['brand', 'footerBackground'],
  ['surface', 'brand'],
  ['surface', 'accentBlue'],
  ['surface', 'accentRed'],
] as const

describe('rendered email accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it.each(previews)('$name has accessible structure and plain text', async ({name, result}) => {
    const parsed = new JSDOM(result.html).window.document
    document.documentElement.lang = parsed.documentElement.lang
    document.documentElement.dir = parsed.documentElement.dir
    document.head.innerHTML = parsed.head.innerHTML
    document.body.innerHTML = parsed.body.innerHTML

    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('light only')
    expect(document.querySelector('meta[name="supported-color-schemes"]')?.getAttribute('content')).toBe('light only')
    expect(result.text.trim()).not.toBe('')
    expect(result.text).toContain(primaryActionUrls[name])

    for (const image of Array.from(document.querySelectorAll('img'))) {
      expect(image.hasAttribute('alt')).toBe(true)
      expect(image.getAttribute('alt')).not.toMatch(/\.(?:png|jpe?g|gif|webp|svg)(?:$|[?#])/i)
    }

    for (const table of Array.from(document.querySelectorAll('table'))) {
      expect(table.getAttribute('role')).toMatch(/^(?:presentation|none)$/)
    }

    for (const link of Array.from(document.querySelectorAll('a'))) {
      const accessibleName = link.getAttribute('aria-label') || link.textContent?.trim() || ''
      expect(accessibleName).not.toBe('')
      expect(accessibleName).not.toMatch(/\b(?:click here|here)\b/i)
    }

    await expectNoAxeViolations(document)
  })

  it.each(contrastPairs)('email palette %s on %s meets 4.5:1', (foreground, background) => {
    const foregroundColor = parse(EMAIL_PALETTE[foreground])
    const backgroundColor = parse(EMAIL_PALETTE[background])

    expect(foregroundColor).toBeTruthy()
    expect(backgroundColor).toBeTruthy()
    expect(wcagContrast(foregroundColor!, backgroundColor!)).toBeGreaterThanOrEqual(4.5)
  })
})
