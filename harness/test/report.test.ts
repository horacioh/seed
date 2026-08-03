import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import test from "node:test";
import os from "node:os";
import path from "node:path";
import { markdownReport, writeReports } from "../src/report.js";
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
