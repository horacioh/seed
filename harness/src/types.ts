import type { Page } from "playwright-core";

/** A role, visible text, test ID, or CSS locator. */
export type Locator =
  | { role: string; name?: string; exact?: boolean }
  | { text: string; exact?: boolean }
  | { testId: string }
  | { css: string };

/** A normalized UI step captured in a web test report. */
export interface UiTestStep {
  id: string;
  action: "goto" | "click" | "type" | "select" | "hover" | "press" | "drag" | "wait" | "assert";
  locator?: Locator;
  value?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  screenshotRef?: string;
  consoleDelta?: string[];
  networkDelta?: string[];
  status: "pass" | "fail" | "error";
  description?: string;
}

/** A normalized UI assertion with evidence references. */
export interface UiAssertion {
  id: string;
  kind: "visible" | "text" | "url" | "title" | "count" | "attr" | "visual";
  locator?: Locator;
  expected: unknown;
  actual?: unknown;
  status: "pass" | "fail" | "error";
  evidence: string[];
  message?: string;
}

/** A semantic marker correlated with a recorder frame. */
export interface RecordingAnnotation {
  id: string;
  type: "setup" | "test_start" | "assertion";
  atMs: number;
  description?: string;
  test?: string;
  testResult?: "passed" | "failed" | "untested";
  assertion?: string;
}

/** Browser artifacts collected during a run. */
export interface BrowserEvidence {
  screenshots: string[];
  domSnapshot?: string;
  consoleLogs: string[];
  harRef?: string;
  videoRef?: string;
  annotations: RecordingAnnotation[];
  downloads?: string[];
}

/** A report finding linked to one or more pieces of evidence. */
export interface Finding {
  id: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  status: "open" | "confirmed" | "not_reproducible";
  reproSteps: string[];
  expected: string;
  actual: string;
  evidence: string[];
}

/** An individual retry attempt in the framework-neutral result model. */
export interface Attempt {
  index: number;
  status: "pass" | "fail" | "skip" | "timeout" | "flaky" | "error";
  durationMs?: number;
  stdout?: string;
  stderr?: string;
  failure?: { message: string; expected?: unknown; actual?: unknown; stack?: string };
}

/** A framework-neutral test case used for a browser scenario. */
export interface TestCase {
  id: string;
  name: string;
  fullName?: string;
  status: "pass" | "fail" | "skip" | "timeout" | "flaky" | "error";
  durationMs?: number;
  attempts: Attempt[];
  stdout?: string;
  stderr?: string;
  failure?: { message: string; expected?: unknown; actual?: unknown; stack?: string };
  attachments?: { name: string; mediaType: string; path?: string }[];
}

/** A framework-neutral suite containing test cases. */
export interface TestSuite {
  id: string;
  name: string;
  status: TestCase["status"];
  tests: TestCase[];
}

/** Process completion metadata for a test run. */
export interface ProcessExit {
  code?: number;
  signal?: string;
  startedAt: string;
  endedAt?: string;
  timedOut: boolean;
}

/** A framework-neutral test execution result. */
export interface TestRunResult {
  runId: string;
  framework?: string;
  status: TestCase["status"];
  suites: TestSuite[];
  durationMs?: number;
  retries: number;
  stdout: string;
  stderr: string;
  exit?: ProcessExit;
}

/** The complete web test report, extending the section 14.5 model. */
export interface WebTestReport {
  run: TestRunResult;
  scenarioTestCase: TestCase;
  steps: UiTestStep[];
  assertions: UiAssertion[];
  evidence: BrowserEvidence;
  findings: Finding[];
  reportRef?: string;
}

/** Supported actions in a scenario definition. */
export type StepSpec =
  | { action: "goto"; url: string; description?: string }
  | {
      action: "click" | "type" | "select" | "hover" | "press" | "drag";
      locator: Locator;
      value?: string;
      description?: string;
    }
  | {
      action: "assert";
      kind: UiAssertion["kind"];
      locator?: Locator;
      expected: unknown;
      description: string;
    };

/** A self-contained scenario consumed by the runner. */
export interface Scenario {
  name: string;
  description: string;
  setup?: string;
  steps: StepSpec[];
}

/** A scenario module export shape. */
export interface ScenarioModule {
  scenario: Scenario;
}

/** A small owned-page abstraction used by the runner. */
export interface BrowserPage {
  page: Page;
  owned: boolean;
}
