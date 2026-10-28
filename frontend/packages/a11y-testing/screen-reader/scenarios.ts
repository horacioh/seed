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
  /** Moves the screen reader cursor to the previous item. */
  previous(): Promise<void>
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
  previousHeading(): Promise<void>
  nextLandmark(): Promise<void>
  previousLandmark(): Promise<void>
}

const navigationTrace = new WeakMap<ScreenReader, string[]>()
const tracedReaders = new WeakSet<ScreenReader>()

/** Starts recording phrase-log clears for the current test. */
export function startNavigationTrace(reader: ScreenReader) {
  navigationTrace.set(reader, [])
  if (tracedReaders.has(reader)) return

  const clearSpokenPhraseLog = reader.clearSpokenPhraseLog.bind(reader)
  reader.clearSpokenPhraseLog = async () => {
    const phrases = await reader.spokenPhraseLog()
    const trace = navigationTrace.get(reader)
    trace?.push(...phrases.map((phrase) => `phrase: ${phrase}`), 'clear: spoken phrase log')
    await clearSpokenPhraseLog()
  }
  tracedReaders.add(reader)
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
    .poll(async () => (await reader.spokenPhraseLog()).some((phrase) => phraseContains(phrase, fragments)))
    .toBe(true)
}

async function waitForSpeech(reader: ScreenReader) {
  await expect.poll(async () => (await reader.spokenPhraseLog()).length).toBeGreaterThan(0)
}

function phraseContains(phrase: string, fragments: string[]) {
  const normalize = (value: string) => value.toLocaleLowerCase().replace(/[\s,]/g, '')
  const normalizedPhrase = normalize(phrase)
  return fragments.every((fragment) => normalizedPhrase.includes(normalize(fragment)))
}

/** Moves the screen-reader cursor until one phrase contains all fragments. */
export async function navigateUntilPhrase(
  reader: ScreenReader,
  fragments: string[],
  navigateForward: () => Promise<void>,
  navigateBackward: () => Promise<void>,
  maxSteps = 10,
) {
  for (const navigate of [navigateForward, navigateBackward]) {
    for (let index = 0; index < maxSteps; index += 1) {
      await reader.clearSpokenPhraseLog()
      await navigate()
      await waitForSpeech(reader)
      if ((await reader.spokenPhraseLog()).some((phrase) => phraseContains(phrase, fragments))) {
        await expectSpokenTogether(reader, fragments)
        return
      }
    }
  }

  await expectSpokenTogether(reader, fragments)
}

async function pressAndMoveFromBrowserChrome(reader: ScreenReader, key: 'Tab' | 'Shift+Tab') {
  await reader.clearSpokenPhraseLog()
  await reader.press(key)
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
  for (const key of ['Tab', 'Shift+Tab'] as const) {
    for (let index = 0; index < 10; index += 1) {
      const phrases = await pressAndMoveFromBrowserChrome(reader, key)
      if (phrases.some((spoken) => phraseContains(spoken, [phrase]))) {
        await expectSpoken(reader, phrase)
        return
      }
    }
  }

  await expectSpoken(reader, phrase)
}

/** Saves the complete phrase log alongside each Playwright test result. */
export async function attachSpokenPhraseLog(reader: ScreenReader, testInfo: TestInfo) {
  const phrases = await reader.spokenPhraseLog()
  const body = phrases.join('\n')
  const filePath = testInfo.outputPath('spoken-phrase-log.txt')
  await mkdir(path.dirname(filePath), {recursive: true})
  await writeFile(filePath, body, 'utf8')
  await testInfo.attach('spoken-phrase-log.txt', {path: filePath, contentType: 'text/plain'})

  const trace = navigationTrace.get(reader) ?? []
  trace.push(...phrases.map((phrase) => `phrase: ${phrase}`), 'end of test')
  const tracePath = testInfo.outputPath('navigation-trace.txt')
  await writeFile(tracePath, trace.join('\n'), 'utf8')
  await testInfo.attach('navigation-trace.txt', {path: tracePath, contentType: 'text/plain'})
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
  await navigateUntilPhrase(
    reader,
    [title, 'heading', 'level 1'],
    () => reader.nextHeading(),
    () => reader.previousHeading(),
  )
}

/** Checks that landmark navigation reaches the site navigation and main. */
export async function runLandmarkScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_READER_URL ?? 'http://localhost:3000/')
  await page.locator('main').waitFor()
  await reader.navigateToWebContent()
  await navigateUntilPhrase(
    reader,
    ['site', 'navigation'],
    () => reader.nextLandmark(),
    () => reader.previousLandmark(),
  )
  await navigateUntilPhrase(
    reader,
    ['main'],
    () => reader.nextLandmark(),
    () => reader.previousLandmark(),
  )
}

/** Checks the editor name, movement, block options, and slash-menu announcements. */
export async function runEditorScenario(page: Page, reader: WebScreenReader) {
  await page.goto('http://localhost:5180/?fixture=empty&edit=1')
  const editor = page.locator('[contenteditable="true"]').first()
  const isVoiceOver = reader.name.toLocaleLowerCase().includes('voiceover')
  await expect(editor).toBeVisible()
  await reader.navigateToWebContent()
  await navigateUntilPhrase(
    reader,
    ['Document content'],
    () => reader.next(),
    () => reader.previous(),
    30,
  )
  await expectSpokenTogether(reader, ['Document content', 'edit'])
  await reader.clearSpokenPhraseLog()
  if (isVoiceOver) {
    await reader.interact()
  } else {
    await reader.act()
  }
  if (reader.name.toLocaleLowerCase().includes('nvda')) {
    await expect.poll(async () => /multi ?line/i.test((await reader.spokenPhraseLog()).join('\n'))).toBe(true)
  }

  // The editor announcements below are independent of how the keyboard input is dispatched.
  await page.keyboard.type('First block')
  await expect(page.getByText('First block', {exact: true})).toBeVisible()
  await page.keyboard.press('Enter')
  await page.keyboard.type('Second block')
  await expect(page.getByText('Second block', {exact: true})).toBeVisible()
  await reader.clearSpokenPhraseLog()
  await page.keyboard.press('ArrowUp')
  await reader.clearSpokenPhraseLog()
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+ArrowDown' : 'Control+Shift+ArrowDown')
  await expectSpoken(reader, 'move')

  await reader.clearSpokenPhraseLog()
  await page.keyboard.press('Alt+F10')
  await expectSpoken(reader, 'Block options')

  await page.goto('http://localhost:5180/?fixture=empty&edit=1')
  await expect(editor).toBeVisible()
  await reader.navigateToWebContent()
  await navigateUntilPhrase(
    reader,
    ['Document content'],
    () => reader.next(),
    () => reader.previous(),
    30,
  )
  if (isVoiceOver) {
    await reader.interact()
  } else {
    await reader.act()
  }
  await reader.clearSpokenPhraseLog()
  await page.keyboard.type('/')
  const option = page.getByRole('option').first()
  await expect(option).toBeVisible()
  const optionName = (await option.innerText()).trim().split(/\s+/)[0] ?? ''
  expect(optionName).not.toBe('')
  await expectSpoken(reader, optionName)
}

/** Checks that invalid-email feedback is linked to and announced from the email field. */
export async function runVaultScenario(page: Page, reader: WebScreenReader) {
  await page.goto(process.env.A11Y_VAULT_URL ?? 'http://localhost:3030/vault')
  const email = page.getByLabel('Enter your email to continue')
  await expect(email).toBeVisible()
  await reader.navigateToWebContent()
  await tabUntilPhrase(reader, 'Enter your email to continue')
  await reader.clearSpokenPhraseLog()
  await page.keyboard.type('invalid-email')
  await reader.clearSpokenPhraseLog()
  await reader.press('Tab')
  await waitForSpeech(reader)
  await reader.press('Shift+Tab')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(email).toHaveAttribute('aria-describedby', 'email-error')
  await expect(page.getByRole('alert')).toContainText("That doesn't look like a valid email")
  await expectSpoken(reader, 'invalid')
  await expectSpoken(reader, "That doesn't look like a valid email")
}
