#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { strict as assert } from "node:assert";

function runValidator(file) {
  return spawnSync(process.execPath, ["scripts/check-html-js.mjs", file], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
}

const valid = runValidator("tests/fixtures/checkout-valid-target.html");
assert.equal(valid.status, 0, valid.stdout + valid.stderr);
assert.match(valid.stdout, /script 1 OK/);

const invalid = runValidator("tests/fixtures/checkout-missing-target.html");
assert.notEqual(invalid.status, 0, "missing checkout DOM targets should fail validation");
assert.match(invalid.stderr, /missing DOM target id="product-content"/);
assert.match(invalid.stderr, /missing DOM target id="payment-content"/);
assert.match(invalid.stderr, /missing DOM target id="summary-content"/);
assert.match(invalid.stderr, /missing DOM target id="order-bump"/);

console.log("check-html-js DOM contract tests OK");
