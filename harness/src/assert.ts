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
  const verdict = await driver.assert(kind, locator, expected);
  const frameResult: "passed" | "failed" = verdict.status === "pass" ? "passed" : "failed";
  let evidence: string[] = [];
  let screenshotRef = "";
  try {
    const frame = await recorder.capture(driver, description, frameResult, "assertion", testName, description);
    evidence = [frame.framePath];
    screenshotRef = frame.framePath;
  } catch (captureError) {
    process.stderr.write(
      `Evidence capture failed for assertion "${description}": ${
        captureError instanceof Error ? captureError.message : String(captureError)
      }\n`,
    );
  }
  return {
    assertion: {
      id,
      kind,
      locator,
      expected,
      actual: verdict.actual,
      status: verdict.status,
      evidence,
      message: verdict.message ?? description,
    },
    screenshotRef,
  };
}
