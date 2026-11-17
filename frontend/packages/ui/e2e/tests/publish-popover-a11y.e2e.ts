import {expect, test} from '@playwright/test'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'

for (const theme of ['light', 'dark'] as const) {
  test(`publish popover has no accessibility violations in ${theme} theme`, async ({page}) => {
    await page.goto(`/publish-popover?theme=${theme}`)
    if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/dark/)

    const issue = page.getByRole('button', {
      name: 'Go to Image 2: replace filename "cat.png" with descriptive alt text',
    })
    await issue.focus()
    await expect(issue).toBeFocused()
    await expect(page.getByRole('button', {name: /Go to Image 1/})).toBeVisible()
    await expect(page.getByRole('button', {name: /Go to Heading 3/})).toBeVisible()
    await expect(page.getByRole('button', {name: /Go to Link/})).toBeVisible()

    const contrast = await page.getByRole('button', {name: 'Cancel'}).evaluate((button) => {
      const getColor = (value: string) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        context.fillStyle = value
        context.fillRect(0, 0, 1, 1)
        return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)]
      }
      const parseColor = (color: number[]) =>
        color.map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
      const luminance = (color: number[]) => {
        const [red, green, blue] = parseColor(color)
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue
      }
      const foreground = getColor(getComputedStyle(button).color)
      let ancestor: HTMLElement | null = button as HTMLElement
      let backgroundColor = 'rgb(255, 255, 255)'
      while (ancestor) {
        const candidate = getComputedStyle(ancestor).backgroundColor
        if (candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') {
          backgroundColor = candidate
          break
        }
        ancestor = ancestor.parentElement
      }
      const background = getColor(backgroundColor)
      const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
      return {
        foreground: getComputedStyle(button).color,
        background: backgroundColor,
        ratio: (lighter + 0.05) / (darker + 0.05),
      }
    })
    console.log(
      `Cancel contrast (${theme}): ${contrast.ratio.toFixed(2)}:1, ${contrast.foreground} on ${contrast.background}`,
    )
    expect(contrast.ratio).toBeGreaterThanOrEqual(4.5)
    await expectNoA11yViolations(page, {modes: ['light']})

    if (process.env.A11Y_ARTIFACT_DIR) {
      await page.screenshot({
        path: `${process.env.A11Y_ARTIFACT_DIR}/publish-popover-issues-${theme}.png`,
        fullPage: true,
      })
    }
  })
}
