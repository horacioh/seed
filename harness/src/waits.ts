import type { Locator, Page } from "playwright-core";

/** Wait for the page's DOM to be ready without a fixed delay. */
export async function waitForReady(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
}

/** Wait for a locator to become visible using Playwright auto-waiting. */
export async function waitForSelector(locator: Locator, timeout = 5_000): Promise<void> {
  await locator.waitFor({ state: "visible", timeout });
}

/** Wait for a URL glob or regular expression using Playwright auto-waiting. */
export async function waitForURL(
  page: Page,
  url: string | RegExp,
  timeout = 5_000,
): Promise<void> {
  await page.waitForURL(url, { timeout });
}

/** Wait until the page reports network idle. */
export async function waitForNetworkIdle(page: Page, timeout = 10_000): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout });
}
