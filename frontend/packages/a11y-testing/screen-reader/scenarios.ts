import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {expect, type Page, type TestInfo} from '@playwright/test'

export interface ScreenReader {
  name: string
  /** Returns the most recently spoken phrase. */
  lastSpokenPhrase(): Promise<string>
  /** Returns phrases captured since the screen reader started. */
  spokenPhraseLog(): Promise<string[]>
  /** Clears the spoken phrase log. */
  clearSpokenPhraseLog(): Promise<void>
  /** Presses a key in the focused application. */
  press(key: string): Promise<void>
  /** Types text into the focused item. */
  type(text: string): Promise<void>
  /** Performs the default action for the item under the screen reader cursor. */
  act(): Promise<void>
  /** Moves the screen reader cursor to the next item. */
  next(): Promise<void>
  /** Interacts with the item under the screen reader cursor. */
  interact(): Promise<void>
  /** Stops interacting with the current item. */
  stopInteracting(): Promise<void>
}

/** Adds the web navigation commands used by both browser screen readers. */
export interface WebScreenReader extends ScreenReader {
  /** Moves the screen reader to the beginning of the current web document. */
  navigateToWebContent(): Promise<void>
  nextHeading(): Promise<void>
  nextLandmark(): Promise<void>
}

/** Waits until a captured screen reader phrase contains a case-insensitive fragment. */
export async function expectSpoken(reader: ScreenReader, phrase: string) {
  await expect
    .poll(async () => (await reader.spokenPhraseLog()).join('\n').toLocaleLowerCase())
    .toContain(phrase.toLocaleLowerCase())
}

/** Waits until one captured phrase contains every case-insensitive fragment. */
export async function expectSpokenTogether(reader: ScreenReader, fragments: string[]) {
  await expect
    .poll(async () =>
      (await reader.spokenPhraseLog()).some((phrase) =>
        fragments.every((fragment) => phrase.toLocaleLowerCase().includes(fragment.toLocaleLowerCase())),
      ),
    )
    .toBe(true)
}

async function waitForSpeech(reader: ScreenReader) {
  await expect.poll(async () => (await reader.spokenPhraseLog()).length).toBeGreaterThan(0)
}

function phraseContains(phrase: string, fragments: string[]) {
  const normalizedPhrase = phrase.toLocaleLowerCase()
  return fragments.every((fragment) => normalizedPhrase.includes(fragment.toLocaleLowerCase()))
}

/** Moves the screen-reader cursor until one phrase contains all fragments. */
export async function navigateUntilPhrase(reader: ScreenReader, fragments: string[], navigate: () => Promise<void>) {
  for (let index = 0; index < 10; index += 1) {
    await reader.clearSpokenPhraseLog()
    await navigate()
    await waitForSpeech(reader)
    if ((await reader.spokenPhraseLog()).some((phrase) => phraseContains(phrase, fragments))) {
      await expectSpokenTogether(reader, fragments)
      return
    }
  }

  await expectSpokenTogether(reader, fragments)
}

async function pressTabAndMoveFromBrowserChrome(reader: ScreenReader) {
  await reader.clearSpokenPhraseLog()
  await reader.press('Tab')
  await waitForSpeech(reader)
  let phrases = await reader.spokenPhraseLog()

  if (
    reader.name.toLocaleLowerCase().includes('nvda') &&
    phrases.some((phrase) => {
      const normalized = phrase.toLocaleLowerCase()
      return normalized.includes('address and search bar') || normalized.includes('search tabs')
    })
  ) {
    await reader.clearSpokenPhraseLog()
    await reader.press('F6')
    await waitForSpeech(reader)
    phrases = await reader.spokenPhraseLog()
  }

  return phrases
}

async function tabUntilPhrase(reader: ScreenReader, phrase: string) {
  for (let index = 0; index < 10; index += 1) {
    const phrases = await pressTabAndMoveFromBrowserChrome(reader)
    if (phrases.some((spoken) => phraseContains(spoken, [phrase]))) {
      await expectSpoken(reader, phrase)
      return
    }
  }

  await expectSpoken(reader, phrase)
}

/** Saves the complete phrase log alongside each Playwright test result. */
export async function attachSpokenPhraseLog(reader: ScreenReader, testInfo: TestInfo) {
  const body = (await reader.spokenPhraseLog()).join('\n')
  const filePath = testInfo.outputPath('spoken-phrase-log.txt')
  await mkdir(path.dirname(filePath), {recursive: true})
  await writeFile(filePath, body, 'utf8')
  await testInfo.attach('spoken-phrase-log.txt', {path: filePath, contentType: 'text/plain'})
}

/** Checks that the reader reaches and activates the skip link. */
export async function runSkipLinkScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  await page.locator('main').waitFor()
  await reader.navigateToWebContent()
  await expectSpoken(reader, 'Skip to content')
  await reader.clearSpokenPhraseLog()
  await reader.act()
  await expect(page.locator('#main-content')).toBeFocused()
}

/** Checks that heading navigation announces the page title as an H1. */
export async function runHeadingScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  const heading = page.getByRole('heading', {level: 1}).first()
  await expect(heading).toBeVisible()
  const title = (await heading.innerText()).trim()
  await reader.navigateToWebContent()
  await navigateUntilPhrase(reader, [title, 'heading', 'level 1'], () => reader.nextHeading())
}

/** Checks that landmark navigation reaches the site navigation and main. */
export async function runLandmarkScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  await page.locator('main').waitFor()
  await reader.navigateToWebContent()
  await navigateUntilPhrase(reader, ['site', 'navigation'], () => reader.nextLandmark())
  await navigateUntilPhrase(reader, ['main'], () => reader.nextLandmark())
}

/** Checks the editor name, movement, block options, and slash-menu announcements. */
export async function runEditorScenario(page: Page, reader: WebScreenReader) {
  await page.goto('http://localhost:5180/?fixture=empty&edit=1')
  const editor = page.locator('[contenteditable="true"]').first()
  await expect(editor).toBeVisible()
  await reader.navigateToWebContent()
  await tabUntilPhrase(reader, 'Document content')
  await expectSpokenTogether(reader, ['Document content', 'edit'])
  if (reader.name.toLocaleLowerCase().includes('nvda')) {
    await expect.poll(async () => /multi ?line/i.test((await reader.spokenPhraseLog()).join('\n'))).toBe(true)
  }

  const isVoiceOver = reader.name.toLocaleLowerCase().includes('voiceover')
  if (isVoiceOver) {
    // VoiceOver must interact with the contenteditable before sending text.
    await reader.clearSpokenPhraseLog()
    await reader.interact()
  }

  await reader.clearSpokenPhraseLog()
  await reader.type('First block')
  await expect(page.getByText('First block', {exact: true})).toBeVisible()
  await reader.clearSpokenPhraseLog()
  await reader.press('Enter')
  await reader.clearSpokenPhraseLog()
  await reader.type('Second block')
  await expect(page.getByText('Second block', {exact: true})).toBeVisible()
  await reader.clearSpokenPhraseLog()
  await reader.press('ArrowUp')
  await reader.clearSpokenPhraseLog()
  await reader.press(process.platform === 'darwin' ? 'Meta+Shift+ArrowDown' : 'Control+Shift+ArrowDown')
  await expectSpoken(reader, 'move')

  await reader.clearSpokenPhraseLog()
  await reader.press('Alt+F10')
  await expectSpoken(reader, 'Block options')

  if (isVoiceOver) {
    await reader.clearSpokenPhraseLog()
    await reader.stopInteracting()
  }
  await page.goto('http://localhost:5180/?fixture=empty&edit=1')
  await expect(editor).toBeVisible()
  await reader.navigateToWebContent()
  await tabUntilPhrase(reader, 'Document content')
  if (isVoiceOver) {
    // Keep VoiceOver in the editor while opening the slash menu.
    await reader.clearSpokenPhraseLog()
    await reader.interact()
  }
  await reader.clearSpokenPhraseLog()
  await reader.type('/')
  const option = page.getByRole('option').first()
  await expect(option).toBeVisible()
  const optionName = (await option.innerText()).trim().split(/\s+/)[0] ?? ''
  expect(optionName).not.toBe('')
  await expectSpoken(reader, optionName)
  if (isVoiceOver) await reader.stopInteracting()
}

/** Checks that invalid-email feedback is linked to and announced from the email field. */
export async function runVaultScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_VAULT_URL ?? 'http://localhost:3030/vault')
  const email = page.getByLabel('Enter your email to continue')
  const isVoiceOver = reader.name.toLocaleLowerCase().includes('voiceover')
  await expect(email).toBeVisible()
  await reader.navigateToWebContent()
  await tabUntilPhrase(reader, 'Enter your email to continue')
  if (isVoiceOver) {
    await reader.clearSpokenPhraseLog()
    await reader.interact()
  }
  await reader.clearSpokenPhraseLog()
  await reader.type('invalid-email')
  await reader.clearSpokenPhraseLog()
  await reader.press('Tab')
  await reader.clearSpokenPhraseLog()
  await reader.press('Shift+Tab')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(email).toHaveAttribute('aria-describedby', 'email-error')
  await expect(page.getByRole('alert')).toContainText("That doesn't look like a valid email")
  await expectSpoken(reader, 'invalid')
  await expectSpoken(reader, "That doesn't look like a valid email")
  if (isVoiceOver) await reader.stopInteracting()
}
