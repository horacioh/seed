import { chromium, type Browser, type ConsoleMessage, type Locator as PlaywrightLocator, type Page } from "playwright-core";
import { access } from "node:fs/promises";
import { waitForReady, waitForSelector } from "./waits.js";
import type { Locator, StepSpec, UiAssertion } from "./types.js";

/** A Playwright-over-CDP browser driver with a launch fallback. */
export class BrowserDriver {
  private browser?: Browser;
  private page?: Page;
  private ownedPages: Page[] = [];
  private readonly logs: string[] = [];
  private readonly requests: string[] = [];
  private readonly cdpUrl: string;
  private launchedBrowser = false;

  /** Create a driver configured to attach to a CDP browser. */
  public constructor(cdpUrl: string) {
    this.cdpUrl = cdpUrl;
  }

  /** Attach to CDP, falling back to a locally installed Chrome executable. */
  public async launch(): Promise<void> {
    try {
      this.browser = await chromium.connectOverCDP(this.cdpUrl);
    } catch (error) {
      const candidates = [
        process.env.CHROME_PATH,
        "/home/ubuntu/.local/bin/google-chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/opt/.devin/chrome/chrome/linux-133.0.6943.126/chrome-linux64/chrome",
      ].filter((candidate): candidate is string => Boolean(candidate));
      const executablePath = await firstExecutable(candidates);
      this.browser = await chromium.launch({ executablePath, headless: true });
      this.launchedBrowser = true;
      if (!error) {
        throw new Error("Browser attach failed without an error");
      }
    }
  }

  /** Open a page and optionally navigate to a URL. */
  public async open(url?: string): Promise<Page> {
    if (!this.browser) {
      throw new Error("BrowserDriver.launch() must be called before open()");
    }
    const context = this.browser.contexts()[0] ?? (await this.browser.newContext());
    const existingPages = context.pages();
    this.page = existingPages[0] ?? (await context.newPage());
    if (existingPages.length === 0) {
      this.ownedPages.push(this.page);
    }
    this.subscribe(this.page);
    if (url) {
      await this.goto(url);
    }
    return this.page;
  }

  /** Navigate the active page and wait for DOM readiness. */
  public async goto(url: string): Promise<void> {
    if (!this.page) {
      throw new Error("No active page");
    }
    await this.page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await waitForReady(this.page);
  }

  /** Resolve a locator in priority order: role, test ID, text, then CSS. */
  public resolveLocator(locator: Locator): PlaywrightLocator {
    if (!this.page) {
      throw new Error("No active page");
    }
    if ("role" in locator) {
      return this.page.getByRole(locator.role as never, {
        name: locator.name,
        exact: locator.exact,
      });
    }
    if ("testId" in locator) {
      return this.page.getByTestId(locator.testId);
    }
    if ("text" in locator) {
      return this.page.getByText(locator.text, { exact: locator.exact });
    }
    return this.page.locator(locator.css);
  }

  /** Execute a step with visible auto-waiting and three bounded retries. */
  public async act(step: Extract<StepSpec, { action: "click" | "type" | "select" | "hover" | "press" | "drag" }>): Promise<void> {
    const locator = this.resolveLocator(step.locator);
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await waitForSelector(locator);
        if (step.action === "click") await locator.click();
        if (step.action === "type") await locator.fill(step.value ?? "");
        if (step.action === "select") await locator.selectOption(step.value ?? "");
        if (step.action === "hover") await locator.hover();
        if (step.action === "press") await locator.press(step.value ?? "Enter");
        if (step.action === "drag") {
          if (!step.value) throw new Error("Drag steps require a target CSS selector in value");
          await locator.dragTo(this.page!.locator(step.value));
        }
        return;
      } catch (error) {
        lastError = error;
        if (attempt === 2) break;
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  /** Evaluate one normalized assertion against the active page. */
  public async assert(
    kind: UiAssertion["kind"],
    locator: Locator | undefined,
    expected: unknown,
  ): Promise<{ actual: unknown; message?: string }> {
    if (!this.page) throw new Error("No active page");
    if (kind === "url") {
      const actual = this.page.url();
      if (actual !== expected) throw new Error(`Expected URL ${String(expected)}, received ${actual}`);
      return { actual };
    }
    if (kind === "title") {
      const actual = await this.page.title();
      if (expected === true && actual.length === 0) throw new Error("Expected a non-empty page title");
      if (typeof expected === "string" && actual !== expected) {
        throw new Error(`Expected title ${expected}, received ${actual}`);
      }
      return { actual };
    }
    if (!locator) throw new Error(`${kind} assertions require a locator`);
    const target = this.resolveLocator(locator);
    if (kind === "visible") {
      await waitForSelector(target);
      const actual = await target.isVisible();
      if (actual !== expected) throw new Error(`Expected visibility ${String(expected)}, received ${String(actual)}`);
      return { actual };
    }
    if (kind === "count") {
      const actual = await target.count();
      if (actual !== expected) throw new Error(`Expected count ${String(expected)}, received ${String(actual)}`);
      return { actual };
    }
    await waitForSelector(target);
    if (kind === "text") {
      const actual = (await target.innerText()).trim();
      if (actual !== expected) throw new Error(`Expected text ${String(expected)}, received ${actual}`);
      return { actual };
    }
    if (kind === "attr") {
      const [attribute, value] = String(expected).split("=", 2);
      const actual = await target.getAttribute(attribute);
      if (actual !== value) throw new Error(`Expected ${attribute}=${value}, received ${actual}`);
      return { actual };
    }
    return { actual: undefined };
  }

  /** Capture a full-page screenshot into a buffer. */
  public async screenshot(): Promise<Buffer> {
    if (!this.page) throw new Error("No active page");
    return this.page.screenshot({ fullPage: true });
  }

  /** Capture the current DOM as serialized HTML. */
  public async domSnapshot(): Promise<string> {
    if (!this.page) throw new Error("No active page");
    return this.page.content();
  }

  /** Return console messages observed since the driver was created. */
  public consoleLogs(): string[] {
    return [...this.logs];
  }

  /** Return network request URLs observed since the driver was created. */
  public networkRequests(): string[] {
    return [...this.requests];
  }

  /** Close pages owned by this driver and any browser launched as fallback. */
  public async close(): Promise<void> {
    for (const page of this.ownedPages) {
      await page.close().catch(() => undefined);
    }
    if (this.launchedBrowser) {
      await this.browser?.close();
    }
    this.page = undefined;
  }

  /** Return the active page for recorder and report integrations. */
  public activePage(): Page {
    if (!this.page) throw new Error("No active page");
    return this.page;
  }

  private subscribe(page: Page): void {
    page.on("console", (message: ConsoleMessage) => {
      this.logs.push(`[${message.type()}] ${message.text()}`);
    });
    page.on("request", (request) => {
      this.requests.push(`${request.method()} ${request.url()}`);
    });
  }
}

async function firstExecutable(candidates: string[]): Promise<string> {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next standard Chrome installation path.
    }
  }
  throw new Error(`No Chrome executable found; tried ${candidates.join(", ")}`);
}
