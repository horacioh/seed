import {expect, test} from '@playwright/test'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'

const paths = (process.env.A11Y_PATHS || '/')
  .split(',')
  .map((path) => path.trim())
  .filter(Boolean)

test.describe('published web reader accessibility', () => {
  for (const path of paths) {
    test(`has no violations at ${path}`, async ({page}) => {
      await page.goto(path)
      await expectNoA11yViolations(page, {modes: ['light', 'dark', 'reflow-320', 'zoom-200']})
    })
  }

  test('keeps the comments panel and focused comment editor accessible', async ({page}) => {
    await page.goto(paths[0] || '/')
    const commentsTab = page.locator('[data-tab="comments"]:visible').first()
    await expect(commentsTab).toBeVisible()
    await commentsTab.click()
    await expectNoA11yViolations(page, {modes: ['light', 'dark', 'reflow-320', 'zoom-200']})

    const commentEditor = page.getByRole('textbox', {name: 'Comment'}).first()
    await expect(commentEditor).toBeVisible()
    await commentEditor.focus()
    await expect(commentEditor).toBeFocused()
    await expectNoA11yViolations(page, {modes: ['light', 'dark', 'reflow-320', 'zoom-200']})
  })

  test('offers skip navigation before reader controls', async ({page}) => {
    await page.goto(paths[0] || '/')
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('href', '#main-content')
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()

    await page.goto(paths[0] || '/')
    const navLinks: string[] = []
    const focusTargets: string[] = []
    for (let index = 0; index < 25; index += 1) {
      await page.keyboard.press('Tab')
      const focusedTarget = await page.locator(':focus').evaluate((element) => {
        const label =
          element.getAttribute('aria-label') ||
          element.textContent?.trim().replace(/\s+/g, ' ') ||
          element.getAttribute('title') ||
          element.tagName.toLowerCase()
        const link = element.closest('nav[aria-label="Site"] a') as HTMLAnchorElement | null
        return {
          label,
          href: (element as HTMLAnchorElement).href || '',
          navHref: link?.href ?? null,
        }
      })
      if (index > 0 && focusedTarget.href.endsWith('#main-content')) break
      focusTargets.push(`${focusedTarget.label} (${focusedTarget.href})`)
      if (focusedTarget.navHref) navLinks.push(focusedTarget.navHref)
    }
    console.log('Keyboard focus sequence:', JSON.stringify(focusTargets, null, 2))
    expect(new Set(navLinks).size).toBe(navLinks.length)
  })
})
