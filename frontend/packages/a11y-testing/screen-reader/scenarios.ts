import {expect, type Page} from '@playwright/test'

export interface ScreenReader {
  /** Returns phrases captured since the screen reader started. */
  spokenPhraseLog(): Promise<string[]>
}

/** Adds the web navigation commands used by both browser screen readers. */
export interface WebScreenReader extends ScreenReader {
  nextHeading(): Promise<void>
  nextLandmark(): Promise<void>
}

/** Waits until the screen reader log contains a case-insensitive phrase. */
export async function expectSpoken(reader: ScreenReader, phrase: string) {
  await expect
    .poll(async () => (await reader.spokenPhraseLog()).join('\n').toLocaleLowerCase())
    .toContain(phrase.toLocaleLowerCase())
}

/** Checks that the first Tab reaches and activates the reader skip link. */
export async function runSkipLinkScenario(page: Page, reader: ScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  await page.keyboard.press('Tab')
  await expectSpoken(reader, 'Skip to content')
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
}

/** Checks that heading navigation announces the page title as an H1. */
export async function runHeadingScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  const heading = page.locator('main h1').first()
  await expect(heading).toBeVisible()
  const title = (await heading.innerText()).trim()
  for (let index = 0; index < 10; index += 1) {
    await reader.nextHeading()
    const phrases = (await reader.spokenPhraseLog()).join('\n').toLocaleLowerCase()
    if (phrases.includes(title.toLocaleLowerCase()) && phrases.includes('heading level 1')) return
  }

  await expectSpoken(reader, title)
  await expectSpoken(reader, 'heading level 1')
}

/** Checks that landmark navigation reaches the site navigation and main. */
export async function runLandmarkScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  for (let index = 0; index < 10; index += 1) {
    await reader.nextLandmark()
  }

  await expectSpoken(reader, 'site navigation')
  await expectSpoken(reader, 'main')
}

/** Checks the editor name, movement, block options, and slash-menu announcements. */
export async function runEditorScenario(page: Page, reader: ScreenReader) {
  await page.goto('http://localhost:5180/?fixture=empty&edit=1')
  const editor = page.locator('[contenteditable="true"]').first()
  await expect(editor).toBeVisible()
  await editor.click()
  await expectSpoken(reader, 'Document content')
  await expectSpoken(reader, 'editable')
  await expectSpoken(reader, 'multiline')

  await page.keyboard.type('First block')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Second block')
  await page.getByText('First block', {exact: true}).click()
  await page.keyboard.press('ControlOrMeta+Shift+ArrowDown')
  await expectSpoken(reader, 'move')

  await page.getByText('First block', {exact: true}).click()
  await page.keyboard.press('Alt+F10')
  await expectSpoken(reader, 'Block options')

  await page.reload()
  await editor.click()
  await page.keyboard.type('/')
  const option = page.getByRole('option').first()
  await expect(option).toBeVisible()
  const optionName = (await option.innerText()).trim().split(/\s+/)[0] ?? ''
  expect(optionName).not.toBe('')
  await expectSpoken(reader, optionName)
}

/** Checks the vault email label and its invalid-email submit announcement. */
export async function runVaultScenario(page: Page, reader: ScreenReader) {
  await page.goto(process.env.A11Y_VAULT_URL ?? 'http://localhost:3030/vault')
  const email = page.getByLabel('Enter your email to continue')
  await email.focus()
  await expectSpoken(reader, 'Enter your email to continue')
  await email.fill('invalid-email')
  await page.locator('form').getByRole('button').click()
  await expect(page.getByRole('alert')).toContainText('valid email')
  await expectSpoken(reader, 'valid email')
}
