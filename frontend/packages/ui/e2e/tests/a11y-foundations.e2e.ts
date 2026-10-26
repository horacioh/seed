import {expect, test} from '@playwright/test'
import {expectNoA11yViolations} from '@shm/a11y-testing/playwright'

test.describe('accessibility foundations', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`shared controls have no axe violations in ${theme} theme`, async ({page}) => {
      await page.goto(`/a11y-foundations${theme === 'dark' ? '?theme=dark' : ''}`)
      await expect(page.getByRole('heading', {level: 1, name: 'Accessibility foundations'})).toBeVisible()
      if (theme === 'dark') {
        await expect(page.locator('html')).toHaveClass(/dark/)
      }

      await expectNoA11yViolations(page, {modes: ['light']})
    })
  }
})
