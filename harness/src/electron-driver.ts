import {_electron as electron, type ElectronApplication, type Page} from 'playwright-core'
import {PageDriver} from './page-driver.js'

/** Explicit paths and optional process settings for one Electron application. */
export interface ElectronDriverOptions {
  main: string
  executable: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
}

/** Playwright Electron driver for an explicitly built desktop application. */
export class ElectronDriver extends PageDriver {
  private readonly options: ElectronDriverOptions
  private app?: ElectronApplication

  /** Create an Electron driver from explicit executable and main-process paths. */
  public constructor(options: ElectronDriverOptions) {
    super()
    this.options = options
  }

  /** Launch the configured Electron application. */
  public async launch(): Promise<void> {
    this.app = await electron.launch({
      args: [this.options.main, ...(this.options.args ?? [])],
      executablePath: this.options.executable,
      env: this.options.env,
      cwd: this.options.cwd,
    })
  }

  /**
   * Open the application's first renderer window.
   *
   * Electron loads its own entry point, so typical Electron scenarios should
   * not use the inherited renderer-navigation method.
   */
  public async open(): Promise<Page> {
    if (!this.app) {
      throw new Error('ElectronDriver.launch() must be called before open()')
    }
    this.page = await this.app.firstWindow()
    this.ownedPages.push(this.page)
    this.subscribe(this.page)
    return this.page
  }

  /** Close owned renderer windows and then terminate the Electron application. */
  public async close(): Promise<void> {
    for (const page of this.ownedPages) {
      await page.close().catch(() => undefined)
    }
    await this.app?.close().catch(() => undefined)
    this.app = undefined
    this.page = undefined
  }
}
