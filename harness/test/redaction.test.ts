import assert from "node:assert/strict";
import test from "node:test";
import { redactExactSecrets } from "../src/driver.js";

test("redactExactSecrets replaces every exact secret occurrence", () => {
  assert.equal(
    redactExactSecrets("POST /submit?token=demo-secret body=demo-secret", ["demo-secret"]),
    "POST /submit?token=[REDACTED] body=[REDACTED]",
  );
  assert.equal(redactExactSecrets("no secrets here", []), "no secrets here");
});
