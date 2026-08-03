import assert from "node:assert/strict";
import test from "node:test";
import { markdownReport } from "../src/report.js";
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
