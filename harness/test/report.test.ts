import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import test from "node:test";
import os from "node:os";
import path from "node:path";
import { assertWithEvidence } from "../src/assert.js";
import type { BrowserDriver } from "../src/driver.js";
import type { FrameRecorder } from "../src/recorder.js";
import { escapeMarkdownText, markdownReport, mdInlineCode, writeReports } from "../src/report.js";
import type { WebTestReport } from "../src/types.js";

function report(overrides: Partial<WebTestReport> = {}): WebTestReport {
  return {
    run: {
      runId: "run-test",
      framework: "seed-web-harness",
      status: "pass",
      suites: [],
      retries: 0,
      stdout: "",
      stderr: "",
    },
    scenarioTestCase: {
      id: "scenario",
      name: "Minimal scenario",
      status: "pass",
      attempts: [{ index: 1, status: "pass" }],
    },
    steps: [{ id: "step-1", action: "goto", description: "Open page", startedAt: "2025-01-01T00:00:00.000Z", status: "pass" }],
    assertions: [
      {
        id: "assertion-1",
        kind: "title",
        expected: "Example",
        actual: "Example",
        status: "pass",
        evidence: ["frames/0001.png"],
        message: "Title matches",
      },
    ],
    evidence: {
      screenshots: ["frames/0001.png"],
      consoleLogs: [],
      annotations: [],
    },
    findings: [],
    ...overrides,
  };
}

test("markdownReport renders PASS, assertions, screenshots, and no findings", () => {
  const markdown = markdownReport(report());
  assert.match(markdown, /\*\*Result:\*\* PASS/);
  assert.match(markdown, /\*\*PASS\*\* Title matches/);
  assert.match(markdown, /!\[frames\/0001\.png\]\(frames\/0001\.png\)/);
  assert.match(markdown, /- None/);
});

test("markdownReport renders FAIL assertions and findings", () => {
  const markdown = markdownReport(
    report({
      run: { ...report().run, status: "fail" },
      scenarioTestCase: { ...report().scenarioTestCase, status: "fail" },
      assertions: [{ ...report().assertions[0], status: "fail", actual: "Wrong", message: "Title mismatch" }],
      findings: [
        {
          id: "finding-1",
          severity: "high",
          title: "Title mismatch",
          status: "confirmed",
          reproSteps: ["Open page"],
          expected: "Example",
          actual: "Wrong",
          evidence: ["frames/0001.png"],
        },
      ],
    }),
  );
  assert.match(markdown, /\*\*Result:\*\* FAIL/);
  assert.match(markdown, /\*\*FAIL\*\* Title mismatch/);
  assert.match(markdown, /HIGH\*\* Title mismatch: Wrong/);
  assert.doesNotMatch(markdown, /- None/);
});

test("errored steps use the run FAIL verdict in Markdown and HTML", async () => {
  const errored = report({
    run: { ...report().run, status: "fail" },
    scenarioTestCase: { ...report().scenarioTestCase, status: "fail" },
    steps: [{
      id: "step-error",
      action: "click",
      description: "Click missing button",
      startedAt: "2025-01-01T00:00:00.000Z",
      status: "error",
    }],
    assertions: [],
    evidence: { ...report().evidence, screenshots: [] },
    findings: [{
      id: "finding-1",
      severity: "high",
      title: "Click missing button",
      status: "confirmed",
      reproSteps: ["Click missing button"],
      expected: "Step completes",
      actual: "Locator did not resolve",
      evidence: [],
    }],
  });
  const markdown = markdownReport(errored);
  assert.match(markdown, /\*\*Result:\*\* FAIL/);
  assert.doesNotMatch(markdown, /\*\*Result:\*\* PASS/);

  const runDir = await mkdtemp(path.join(os.tmpdir(), "seed-harness-report-"));
  try {
    await writeReports(runDir, errored);
    const html = await readFile(path.join(runDir, "report.html"), "utf8");
    assert.match(html, />FAIL<\/strong>/);
    assert.doesNotMatch(html, />PASS<\/strong>/);
  } finally {
    await rm(runDir, { recursive: true, force: true });
  }
});

test("markdownReport escapes tags without mangling ordinary text", () => {
  const markdown = markdownReport(report({
    steps: [{
      id: "step-1",
      action: "type",
      description: `Don't submit "now" & wait`,
      value: "a`b",
      startedAt: "2025-01-01T00:00:00.000Z",
      status: "pass",
    }],
    assertions: [{
      ...report().assertions[0],
      actual: "Wrong",
      message: `Don't submit "now" & wait`,
    }],
    findings: [{
      id: "finding-1",
      severity: "high",
      title: `Don't submit "now" & wait`,
      status: "confirmed",
      reproSteps: [],
      expected: "safe",
      actual: "<img src=x onerror=alert(1)>",
      evidence: [],
    }],
  }));
  assert.match(markdown, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(markdown, /Don't submit "now" & wait/);
  assert.doesNotMatch(markdown, /&#39;|&amp;|&quot;/);
  assert.match(markdown, /`` a`b ``/);
});

test("Markdown helpers handle tags and backtick-safe code spans", () => {
  assert.equal(escapeMarkdownText("<tag> & 'quote'"), "&lt;tag&gt; & 'quote'");
  assert.equal(mdInlineCode("plain"), "`plain`");
  assert.equal(mdInlineCode("a`b"), "`` a`b ``");
  assert.equal(mdInlineCode("a``b"), "``` a``b ```");
});

test("assertWithEvidence preserves a passing verdict when capture fails", async () => {
  const driver = {
    assert: async () => ({ status: "pass", actual: "observed" as unknown }),
  } as BrowserDriver;
  const recorder = {
    capture: async () => {
      throw new Error("simulated capture failure");
    },
  } as unknown as FrameRecorder;
  let stderr = "";
  const originalWrite = process.stderr.write;
  process.stderr.write = ((chunk: string | Uint8Array) => {
    stderr += String(chunk);
    return true;
  }) as typeof process.stderr.write;
  try {
    const result = await assertWithEvidence(
      driver,
      recorder,
      "assertion-1",
      "Observed value",
      "text",
      { css: "#value" },
      "observed",
      "Capture failure scenario",
    );
    assert.equal(result.assertion.status, "pass");
    assert.equal(result.assertion.actual, "observed");
    assert.deepEqual(result.assertion.evidence, []);
    assert.equal(result.screenshotRef, "");
    assert.match(stderr, /Evidence capture failed for assertion "Observed value": simulated capture failure/);
  } finally {
    process.stderr.write = originalWrite;
  }
});

test("assertWithEvidence preserves the observed value for a failed verdict", async () => {
  const driver = {
    assert: async () => ({
      status: "fail",
      actual: "observed" as unknown,
      message: "Expected expected, received observed",
    }),
  } as BrowserDriver;
  const recorder = {
    capture: async () => ({ framePath: "frames/0001.png", marker: {} }),
  } as unknown as FrameRecorder;
  const result = await assertWithEvidence(
    driver,
    recorder,
    "assertion-1",
    "Observed value",
    "text",
    { css: "#value" },
    "expected",
    "Failed assertion scenario",
  );
  assert.equal(result.assertion.status, "fail");
  assert.equal(result.assertion.actual, "observed");
  assert.equal(result.assertion.message, "Expected expected, received observed");
  assert.deepEqual(result.assertion.evidence, ["frames/0001.png"]);
});
