import {access} from 'node:fs/promises'
import {chromium, type Browser, type Page} from 'playwright-core'
import {PageDriver} from './page-driver.js'

export {PageDriver, redactExactSecrets} from './page-driver.js'

/** A Playwright-over-CDP browser driver with a launch fallback. */
export class BrowserDriver extends PageDriver {
  private browser?: Browser
  private readonly cdpUrl: string

  /** Create a driver configured to attach to a CDP browser. */
  public constructor(cdpUrl: string) {
    super()
    this.cdpUrl = cdpUrl
  }

  /** Attach to CDP, falling back to a locally installed Chrome executable. */
  public async launch(): Promise<void> {
    try {
      this.browser = await chromium.connectOverCDP(this.cdpUrl)
    } catch (error) {
      const attachMessage = error instanceof Error ? error.message : String(error)
      process.stderr.write(`Browser attach failed for ${this.cdpUrl}: ${attachMessage}\n`)
      const candidates = [
        process.env.CHROME_PATH,
        '/home/ubuntu/.local/bin/google-chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/opt/.devin/chrome/chrome/linux-133.0.6943.126/chrome-linux64/chrome',
      ].filter((candidate): candidate is string => Boolean(candidate))
      try {
        const executablePath = await firstExecutable(candidates)
        this.browser = await chromium.launch({executablePath, headless: true})
      } catch (launchError) {
        process.stderr.write(
          `Browser launch fallback failed: ${
            launchError instanceof Error ? launchError.message : String(launchError)
          }\n`,
        )
        throw new Error('Browser attach and launch both failed', {cause: error})
      }
    }
  }

  /** Open a fresh owned page and optionally navigate to a URL. */
  public async open(url?: string): Promise<Page> {
    if (!this.browser) {
      throw new Error('BrowserDriver.launch() must be called before open()')
    }
    const context = this.browser.contexts()[0] ?? (await this.browser.newContext())
    this.page = await context.newPage()
    this.ownedPages.push(this.page)
    this.subscribe(this.page)
    if (url) {
      await this.goto(url)
    }
    return this.page
  }

  /** Close owned pages and disconnect from the attached or launched browser. */
  public async close(): Promise<void> {
    for (const page of this.ownedPages) {
      await page.close().catch(() => undefined)
    }
    await this.browser?.close().catch(() => undefined)
    this.browser = undefined
    this.page = undefined
  }
}

async function firstExecutable(candidates: string[]): Promise<string> {
  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next standard Chrome installation path.
    }
  }
  throw new Error(`No Chrome executable found; tried ${candidates.join(', ')}`)
}
