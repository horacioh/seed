import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../src/cli.js";

test("parseArgs applies defaults", () => {
  assert.deepEqual(parseArgs([]), { cdp: "http://localhost:29229", out: "artifacts" });
});

test("parseArgs accepts every supported flag", () => {
  assert.deepEqual(
    parseArgs(["--url", "https://example.com", "--scenario", "/tmp/scenario.ts", "--cdp", "http://127.0.0.1:1", "--out", "out"]),
    {
      url: "https://example.com",
      scenario: "/tmp/scenario.ts",
      cdp: "http://127.0.0.1:1",
      out: "out",
    },
  );
});

test("parseArgs rejects unknown flags", () => {
  assert.throws(() => parseArgs(["--unknown"]), /Unknown argument: --unknown/);
});

test("parseArgs rejects missing values", () => {
  for (const option of ["--url", "--scenario", "--cdp", "--out"]) {
    assert.throws(() => parseArgs([option]), new RegExp(`${option} requires a value`));
    assert.throws(() => parseArgs([option, "--other"]), new RegExp(`${option} requires a value`));
  }
});
