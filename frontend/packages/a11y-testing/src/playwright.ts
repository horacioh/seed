import AxeBuilder from '@axe-core/playwright'
import type {Page} from '@playwright/test'
import {axeTags, formatViolations} from './shared'

/** Accessibility conditions evaluated by the Playwright helper. `zoom-200` halves the CSS-pixel viewport, equivalent to 200% browser zoom. */
export type A11yMode = 'light' | 'dark' | 'forced-colors' | 'reduced-motion' | 'reflow-320' | 'zoom-200'

type MediaPreferences = {
  colorScheme: 'light' | 'dark'
  forcedColors: 'active' | 'none'
  reducedMotion: 'no-preference' | 'reduce'
}

/** Audits a page in each requested mode (light and dark by default) and rejects once with all violations. */
export async function expectNoA11yViolations(
  page: Page,
  opts?: {
    include?: string[]
    exclude?: string[]
    disableRules?: string[]
    modes?: A11yMode[]
    legacyMode?: boolean
  },
): Promise<void> {
  const modes = opts?.modes ?? ['light', 'dark']
  const viewport =
    page.viewportSize() ?? (await page.evaluate(() => ({width: window.innerWidth, height: window.innerHeight})))
  const originalMedia: MediaPreferences = await page.evaluate(() => ({
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    forcedColors: window.matchMedia('(forced-colors: active)').matches ? 'active' : 'none',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference',
  }))
  const modeViolations: Array<{mode: A11yMode; violations: A11yViolationList}> = []

  try {
    for (const mode of modes) {
      await page.setViewportSize(viewport)
      await page.emulateMedia(originalMedia)

      if (mode === 'light' || mode === 'dark') {
        await page.emulateMedia({...originalMedia, colorScheme: mode})
      } else if (mode === 'forced-colors') {
        await page.emulateMedia({...originalMedia, forcedColors: 'active'})
      } else if (mode === 'reduced-motion') {
        await page.emulateMedia({...originalMedia, reducedMotion: 'reduce'})
      } else if (mode === 'reflow-320') {
        await page.setViewportSize({width: 320, height: viewport.height})
      } else if (mode === 'zoom-200') {
        await page.setViewportSize({width: Math.floor(viewport.width / 2), height: Math.floor(viewport.height / 2)})
      }

      await settleLayout(page)

      const builder = new AxeBuilder({page}).withTags(axeTags)
      for (const selector of opts?.include ?? []) {
        builder.include(selector)
      }
      for (const selector of opts?.exclude ?? []) {
        builder.exclude(selector)
      }
      if (opts?.disableRules?.length) {
        builder.disableRules(opts.disableRules)
      }
      if (opts?.legacyMode) {
        builder.setLegacyMode()
      }

      const {violations} = await builder.analyze()
      const modeFindings: A11yViolationList = [...violations]

      if (mode === 'reflow-320' || mode === 'zoom-200') {
        const overflow = await page.evaluate(() => {
          const scrollingElement = document.scrollingElement
          if (!scrollingElement) return null
          const clientWidth = scrollingElement.clientWidth
          const overflowElements = Array.from(document.querySelectorAll<HTMLElement>('*'))
            .map((element) => {
              const rect = element.getBoundingClientRect()
              return {
                tag: element.tagName.toLowerCase(),
                id: element.id,
                className: typeof element.className === 'string' ? element.className : '',
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
              }
            })
            .filter(
              (element) =>
                element.width > 0 &&
                (element.left < -1 || element.right > clientWidth + 1 || element.scrollWidth > element.clientWidth + 1),
            )
            .sort((a, b) => b.right - a.right)
            .slice(0, 12)
          return {scrollWidth: scrollingElement.scrollWidth, clientWidth, overflowElements}
        })
        if (overflow && overflow.scrollWidth > overflow.clientWidth + 1) {
          modeFindings.push({
            id: 'reflow',
            impact: 'serious',
            help: 'Content reflows without horizontal scrolling (WCAG 1.4.10)',
            helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html',
            nodes: [
              {
                target: ['html'],
                failureSummary: `Document scroll width ${overflow.scrollWidth}px exceeds client width ${
                  overflow.clientWidth
                }px. Overflowing elements: ${JSON.stringify(overflow.overflowElements)}`,
              },
            ],
          })
        }
      }

      modeViolations.push({mode, violations: modeFindings})
    }
  } finally {
    await page.setViewportSize(viewport)
    await page.emulateMedia(originalMedia)
    await settleLayout(page)
  }

  const failures = modeViolations.filter(({violations}) => violations.length > 0)
  if (failures.length > 0) {
    const report = failures.map(({mode, violations}) => `Mode: ${mode}\n${formatViolations(violations)}`).join('\n\n')
    throw new Error(`Accessibility violations found:\n\n${report}`)
  }
}

type A11yViolationList = Parameters<typeof formatViolations>[0][number][]

async function settleLayout(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const transitions = document.getAnimations().filter((animation) => animation.constructor.name === 'CSSTransition')
    await Promise.all(transitions.map((transition) => transition.finished.catch(() => undefined)))
  })
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      }),
  )
}
