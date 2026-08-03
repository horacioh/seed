import type { BrowserDriver } from "./driver.js";
import type { FrameRecorder } from "./recorder.js";
import type { Locator, UiAssertion } from "./types.js";

/** Run a driver assertion, capture evidence, and emit a pass/fail marker. */
export async function assertWithEvidence(
  driver: BrowserDriver,
  recorder: FrameRecorder,
  id: string,
  description: string,
  kind: UiAssertion["kind"],
  locator: Locator | undefined,
  expected: unknown,
  testName: string,
): Promise<{ assertion: UiAssertion; screenshotRef: string }> {
  try {
    const { actual } = await driver.assert(kind, locator, expected);
    const frame = await recorder.capture(driver, description, "passed", "assertion", testName, description);
    return {
      assertion: { id, kind, locator, expected, actual, status: "pass", evidence: [frame.framePath], message: description },
      screenshotRef: frame.framePath,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const frame = await recorder.capture(driver, description, "failed", "assertion", testName, description);
    return {
      assertion: { id, kind, locator, expected, actual: undefined, status: "fail", evidence: [frame.framePath], message },
      screenshotRef: frame.framePath,
    };
  }
}
