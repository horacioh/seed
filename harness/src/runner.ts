import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertWithEvidence } from "./assert.js";
import { BrowserDriver } from "./driver.js";
import { writeReports } from "./report.js";
import { FrameRecorder } from "./recorder.js";
import type { Scenario, StepSpec, TestCase, TestRunResult, TestSuite, UiTestStep, WebTestReport, Finding } from "./types.js";

/** Options controlling one web scenario run. */
export interface RunOptions {
  cdpUrl: string;
  outputRoot: string;
  url?: string;
}

/** Run a scenario, always finalize evidence, and return its report path and status. */
export async function runScenario(
  scenario: Scenario,
  options: RunOptions,
): Promise<{ reportPath: string; failed: boolean }> {
  const runId = `run-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`;
  const runDir = path.resolve(options.outputRoot, runId);
  await mkdir(runDir, { recursive: true });
  const driver = new BrowserDriver(options.cdpUrl);
  const recorder = new FrameRecorder(runDir);
  const steps: UiTestStep[] = [];
  const assertions = [];
  const findings: Finding[] = [];
  const startedAt = new Date().toISOString();
  let videoRef = "";
  let consoleSeen = 0;
  let networkSeen = 0;
  let domSnapshot: string | undefined;
  let fatalError = false;
  const secretValues = scenario.steps.flatMap((spec) =>
    spec.action === "type" && spec.secret && spec.value ? [spec.value] : [],
  );
  const secretSelectors = new Set(scenario.secretSelectors ?? ["input[type=password]"]);
  for (const spec of scenario.steps) {
    if (spec.action !== "type" || !spec.secret) continue;
    if ("testId" in spec.locator) {
      secretSelectors.add(`[data-testid="${spec.locator.testId}"]`);
    } else if ("css" in spec.locator) {
      secretSelectors.add(spec.locator.css);
    } else {
      // Role/text locators cannot become querySelectorAll selectors; exact-value redaction still applies.
    }
  }
  driver.setSecretValues(secretValues);
  driver.setSecretSelectors([...secretSelectors]);
  try {
    try {
      await recorder.start();
      await driver.launch();
      await driver.open();
      if (options.url) await driver.goto(options.url);
      await recorder.capture(driver, scenario.setup ?? "Harness setup", "untested", "setup", scenario.name);
      await recorder.capture(driver, scenario.name, "untested", "test_start", scenario.name);
      for (const [index, spec] of scenario.steps.entries()) {
        const stepId = `step-${index + 1}`;
        const stepStarted = Date.now();
        let status: UiTestStep["status"] = "pass";
        let screenshotRef = "";
        let assertionResult;
        try {
          if (spec.action === "goto") {
            await driver.goto(spec.url);
          } else if (spec.action === "assert") {
            assertionResult = await assertWithEvidence(driver, recorder, `assertion-${index + 1}`, spec.description, spec.kind, spec.locator, spec.expected, scenario.name);
            assertionResult.assertion.evidence = assertionResult.assertion.evidence.map((evidence) => relative(runDir, evidence));
            assertions.push(assertionResult.assertion);
            screenshotRef = relative(runDir, assertionResult.screenshotRef);
            if (assertionResult.assertion.status !== "pass") {
              status = "fail";
              findings.push({
                id: `finding-${index + 1}`,
                severity: "medium",
                title: spec.description,
                status: "confirmed",
                reproSteps: steps.map((step) => step.description ?? step.action),
                expected: String(spec.expected),
                actual: assertionResult.assertion.message ?? "Assertion failed",
                evidence: assertionResult.assertion.evidence,
              });
            }
          } else {
            await driver.act(spec);
          }
          if (!assertionResult) {
            const frame = await recorder.capture(driver, spec.description ?? spec.action, "passed", "assertion", scenario.name);
            screenshotRef = relative(runDir, frame.framePath);
          }
        } catch (error) {
          status = "error";
          const message = error instanceof Error ? error.message : String(error);
          try {
            const frame = await recorder.capture(driver, spec.description ?? spec.action, "failed", "assertion", scenario.name);
            screenshotRef = relative(runDir, frame.framePath);
          } catch {
            // Preserve the original step failure if the browser cannot capture evidence.
          }
          findings.push({
            id: `finding-${index + 1}`,
            severity: "high",
            title: spec.description ?? spec.action,
            status: "confirmed",
            reproSteps: steps.map((step) => step.description ?? step.action),
            expected: "Step completes",
            actual: message,
            evidence: screenshotRef ? [screenshotRef] : [],
          });
        }
        const consoleLogs = driver.consoleLogs();
        const networkRequests = driver.networkRequests();
        steps.push({
          id: stepId,
          action: spec.action,
          locator: "locator" in spec ? spec.locator : undefined,
          value: spec.action === "type" && spec.secret
            ? "[REDACTED]"
            : "value" in spec
              ? spec.value
              : "url" in spec
                ? spec.url
                : undefined,
          startedAt: new Date(stepStarted).toISOString(),
          endedAt: new Date().toISOString(),
          durationMs: Date.now() - stepStarted,
          screenshotRef,
          consoleDelta: consoleLogs.slice(consoleSeen),
          networkDelta: networkRequests.slice(networkSeen),
          status,
          description: spec.description ?? ("url" in spec ? `Navigate to ${spec.url}` : spec.action),
        });
        consoleSeen = consoleLogs.length;
        networkSeen = networkRequests.length;
      }
      try {
        await writeFile(path.join(runDir, "dom.html"), await driver.domSnapshot());
        domSnapshot = "dom.html";
      } catch {
        // DOM capture is supplementary evidence and must not hide the run result.
      }
    } catch (error) {
      fatalError = true;
      const message = error instanceof Error ? error.message : String(error);
      findings.push({
        id: "finding-fatal-harness",
        severity: "high",
        title: "Harness could not start the browser session",
        status: "confirmed",
        reproSteps: [],
        expected: "Browser session starts",
        actual: message,
        evidence: [],
      });
    }
  } finally {
    try {
      try {
        videoRef = relative(runDir, await recorder.stopAndEncode());
      } catch (error) {
        process.stderr.write(`Video encoding failed: ${error instanceof Error ? error.message : String(error)}\n`);
        videoRef = "";
      }
    } finally {
      await driver.close().catch(() => undefined);
    }
  }
  const endedAt = new Date().toISOString();
  const failed = fatalError || assertions.some((assertion) => assertion.status !== "pass") || steps.some((step) => step.status !== "pass");
  const testCase: TestCase = {
    id: "scenario",
    name: scenario.name,
    fullName: scenario.description,
    status: failed ? "fail" : "pass",
    durationMs: Date.parse(endedAt) - Date.parse(startedAt),
    attempts: [{ index: 1, status: failed ? "fail" : "pass" }],
  };
  const suite: TestSuite = { id: "web-suite", name: "Web application", status: testCase.status, tests: [testCase] };
  const run: TestRunResult = {
    runId,
    framework: "seed-web-harness",
    status: testCase.status,
    suites: [suite],
    durationMs: testCase.durationMs,
    retries: 0,
    stdout: "",
    stderr: "",
    exit: { code: failed ? 1 : 0, startedAt, endedAt, timedOut: false },
  };
  const report: WebTestReport = {
    run,
    scenarioTestCase: testCase,
    steps,
    assertions,
    evidence: {
      screenshots: steps.map((step) => step.screenshotRef).filter((value): value is string => Boolean(value)),
      domSnapshot,
      consoleLogs: driver.consoleLogs(),
      videoRef,
      annotations: recorder.annotations(),
    },
    findings,
    reportRef: "report.html",
  };
  return { reportPath: await writeReports(runDir, report), failed };
}

function relative(runDir: string, filePath: string): string {
  return path.relative(runDir, filePath).replaceAll(path.sep, "/");
}
