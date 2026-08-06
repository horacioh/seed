import type {ConsoleMessage, Locator as PlaywrightLocator, Page} from 'playwright-core'
import {waitForReady, waitForSelector} from './waits.js'
import type {Locator, StepSpec, UiAssertion} from './types.js'

/** Replace exact known secret values in a text channel. */
export function redactExactSecrets(text: string, secretValues: string[]): string {
  return secretValues.reduce((redacted, secretValue) => redacted.replaceAll(secretValue, '[REDACTED]'), text)
}

/** Outcome of evaluating one normalized assertion: verdict, observed value, and optional failure message. */
export interface AssertionOutcome {
  status: 'pass' | 'fail'
  actual: unknown
  message?: string
}

/** Shared Playwright page operations for web and Electron targets. */
export abstract class PageDriver {
  protected page?: Page
  protected ownedPages: Page[] = []
  private readonly logs: string[] = []
  private readonly requests: string[] = []
  private secretSelectors: string[] = []
  private secretValues: string[] = []

  /** Launch the target application. */
  public abstract launch(): Promise<void>

  /** Open and register the target's active renderer page. */
  public abstract open(url?: string): Promise<Page>

  /** Close target-owned pages and the target application. */
  public abstract close(): Promise<void>

  /**
   * Configure selectors to blur and mask in captured evidence as best-effort
   * defense-in-depth, not as proof that credentials are never persisted.
   */
  public setSecretSelectors(selectors: string[]): void {
    this.secretSelectors = [...selectors]
  }

  /** Tag fields so selector-based screenshot and DOM redaction can mask them. */
  public async markSecretField(locator: Locator): Promise<void> {
    const target = this.resolveLocator(locator)
    const count = await target.count()
    for (let index = 0; index < count; index += 1) {
      await target
        .nth(index)
        .evaluate((element) => element.setAttribute('data-harness-secret', 'true'))
        .catch(() => undefined)
    }
  }

  /** Configure exact values to redact from captured text channels. */
  public setSecretValues(values: string[]): void {
    this.secretValues = values.filter((value) => value.length > 0)
  }

  /** Navigate the active page and wait for DOM readiness. */
  public async goto(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('No active page')
    }
    await this.page.goto(url, {waitUntil: 'domcontentloaded', timeout: 30_000})
    await waitForReady(this.page)
  }

  /** Resolve a locator in priority order: role, test ID, text, then CSS. */
  public resolveLocator(locator: Locator): PlaywrightLocator {
    if (!this.page) {
      throw new Error('No active page')
    }
    if ('role' in locator) {
      return this.page.getByRole(locator.role as never, {
        name: locator.name,
        exact: locator.exact,
      })
    }
    if ('testId' in locator) {
      return this.page.getByTestId(locator.testId)
    }
    if ('text' in locator) {
      return this.page.getByText(locator.text, {exact: locator.exact})
    }
    return this.page.locator(locator.css)
  }

  /** Execute a step with visible auto-waiting and three bounded retries. */
  public async act(
    step: Extract<StepSpec, {action: 'click' | 'type' | 'select' | 'hover' | 'press' | 'drag'}>,
  ): Promise<void> {
    const locator = this.resolveLocator(step.locator)
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await waitForSelector(locator)
        if (step.action === 'click') await locator.click()
        if (step.action === 'type') await locator.fill(step.value ?? '')
        if (step.action === 'select') await locator.selectOption(step.value ?? '')
        if (step.action === 'hover') await locator.hover()
        if (step.action === 'press') await locator.press(step.value ?? 'Enter')
        if (step.action === 'drag') {
          if (!step.value) throw new Error('Drag steps require a target CSS selector in value')
          await locator.dragTo(this.page!.locator(step.value))
        }
        return
      } catch (error) {
        lastError = error
        if (attempt === 2) break
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError))
  }

  /** Evaluate one normalized assertion against the active page. */
  public async assert(
    kind: UiAssertion['kind'],
    locator: Locator | undefined,
    expected: unknown,
  ): Promise<AssertionOutcome> {
    if (!this.page) throw new Error('No active page')
    if (kind === 'url') {
      const actual = this.page.url()
      if (actual !== expected) {
        return {status: 'fail', actual, message: `Expected URL ${String(expected)}, received ${actual}`}
      }
      return {status: 'pass', actual}
    }
    if (kind === 'title') {
      const actual = await this.page.title()
      if (expected === true && actual.length === 0) {
        return {status: 'fail', actual, message: 'Expected a non-empty page title'}
      }
      if (typeof expected === 'string' && actual !== expected) {
        return {status: 'fail', actual, message: `Expected title ${expected}, received ${actual}`}
      }
      return {status: 'pass', actual}
    }
    if (!locator) throw new Error(`${kind} assertions require a locator`)
    const target = this.resolveLocator(locator)
    if (kind === 'visible') {
      await target.waitFor({state: expected === false ? 'hidden' : 'visible', timeout: 5_000}).catch(() => undefined)
      const actual = await target.isVisible()
      if (actual !== expected) {
        return {status: 'fail', actual, message: `Expected visibility ${String(expected)}, received ${String(actual)}`}
      }
      return {status: 'pass', actual}
    }
    if (kind === 'count') {
      const selector = this.cssSelectorFor(locator)
      if (selector) {
        await this.page
          .waitForFunction(
            ({sel, n}) => document.querySelectorAll(sel).length === n,
            {sel: selector, n: expected},
            {timeout: 5_000},
          )
          .catch(() => undefined)
      } else {
        // Role/text count assertions fall back to a single read.
      }
      const actual = await target.count()
      if (actual !== expected) {
        return {status: 'fail', actual, message: `Expected count ${String(expected)}, received ${String(actual)}`}
      }
      return {status: 'pass', actual}
    }
    await waitForSelector(target).catch(() => undefined)
    if (kind === 'text') {
      await target
        .filter({hasText: String(expected)})
        .first()
        .waitFor({state: 'visible', timeout: 5_000})
        .catch(() => undefined)
      let actual: string | null
      try {
        actual = (await target.innerText()).trim()
      } catch {
        return {
          status: 'fail',
          actual: null,
          message: `Element not found while reading text; expected ${String(expected)}`,
        }
      }
      if (actual !== expected) {
        return {status: 'fail', actual, message: `Expected text ${String(expected)}, received ${actual}`}
      }
      return {status: 'pass', actual}
    }
    if (kind === 'attr') {
      const raw = String(expected)
      const separator = raw.indexOf('=')
      const attribute = separator === -1 ? raw : raw.slice(0, separator)
      const value = separator === -1 ? undefined : raw.slice(separator + 1)
      const selector = this.cssSelectorFor(locator)
      if (selector) {
        await this.page
          .waitForFunction(
            ({sel, attribute: name, value: expectedValue, presence}) => {
              const element = document.querySelector(sel)
              if (element === null) return false
              return presence ? element.getAttribute(name) !== null : element.getAttribute(name) === expectedValue
            },
            {sel: selector, attribute, value, presence: value === undefined},
            {timeout: 5_000},
          )
          .catch(() => undefined)
      } else {
        // Role/text attr assertions fall back to a single read.
      }
      let actual: string | null
      try {
        actual = await target.getAttribute(attribute)
      } catch {
        return {
          status: 'fail',
          actual: null,
          message: `Element not found while reading attribute ${attribute}`,
        }
      }
      const matches = value === undefined ? actual !== null : actual === value
      if (!matches) {
        return {
          status: 'fail',
          actual,
          message:
            value === undefined
              ? `Expected attribute ${attribute} to be present, received ${actual}`
              : `Expected ${attribute}=${value}, received ${actual}`,
        }
      }
      return {status: 'pass', actual}
    }
    throw new Error(`Unsupported assertion kind: ${kind}`)
  }

  /** Capture a full-page screenshot into a buffer. */
  public async screenshot(): Promise<Buffer> {
    if (!this.page) throw new Error('No active page')
    return this.withSecretRedaction(() => this.page!.screenshot({fullPage: true}))
  }

  /**
   * Capture the current DOM with best-effort secret redaction as defense in
   * depth. This is not proof that secrets cannot appear in artifacts; scenarios
   * entering real credentials should still avoid persisting artifacts.
   */
  public async domSnapshot(): Promise<string> {
    if (!this.page) throw new Error('No active page')
    const snapshot = await this.page.evaluate((secretSelectors) => {
      const root = document.documentElement.cloneNode(true) as HTMLElement
      for (const selector of secretSelectors) {
        try {
          for (const element of root.querySelectorAll(selector)) {
            element.setAttribute('value', '[REDACTED]')
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
              element.value = '[REDACTED]'
            }
            element.textContent = '[REDACTED]'
          }
        } catch {
          // Ignore malformed optional redaction selectors.
        }
      }
      return `<!doctype html>\n${root.outerHTML}`
    }, this.secretSelectors)
    return this.redactSecrets(snapshot)
  }

  /** Return console messages observed since the driver was created. */
  public consoleLogs(): string[] {
    return this.logs.map((log) => this.redactSecrets(log))
  }

  /** Return network request URLs observed since the driver was created. */
  public networkRequests(): string[] {
    return this.requests.map((request) => this.redactSecrets(request))
  }

  /** Return the active page for recorder and report integrations. */
  public activePage(): Page {
    if (!this.page) throw new Error('No active page')
    return this.page
  }

  /** Subscribe to renderer events for evidence collection. */
  protected subscribe(page: Page): void {
    page.on('console', (message: ConsoleMessage) => {
      this.logs.push(`[${message.type()}] ${message.text()}`)
    })
    page.on('request', (request) => {
      this.requests.push(`${request.method()} ${request.url()}`)
    })
  }

  private redactSecrets(text: string): string {
    return redactExactSecrets(text, this.secretValues)
  }

  private cssSelectorFor(locator: Locator): string | undefined {
    if ('css' in locator) return locator.css
    if ('testId' in locator) return `[data-testid="${locator.testId}"]`
    return undefined
  }

  private async withSecretRedaction<T>(capture: () => Promise<T>): Promise<T> {
    if (!this.page || this.secretSelectors.length === 0) return capture()
    await this.page.evaluate((selectors) => {
      for (const selector of selectors) {
        try {
          for (const element of document.querySelectorAll(selector)) {
            element.setAttribute('data-harness-secret-style', element.getAttribute('style') ?? '')
            ;(element as HTMLElement).style.setProperty('filter', 'blur(14px)', 'important')
          }
        } catch {
          // Ignore malformed optional redaction selectors.
        }
      }
    }, this.secretSelectors)
    try {
      return await capture()
    } finally {
      await this.page.evaluate((selectors) => {
        for (const selector of selectors) {
          try {
            for (const element of document.querySelectorAll(selector)) {
              const originalStyle = element.getAttribute('data-harness-secret-style')
              if (originalStyle === null) continue
              if (originalStyle === '') element.removeAttribute('style')
              else element.setAttribute('style', originalStyle)
              element.removeAttribute('data-harness-secret-style')
            }
          } catch {
            // Ignore malformed optional redaction selectors.
          }
        }
      }, this.secretSelectors)
    }
  }
}
