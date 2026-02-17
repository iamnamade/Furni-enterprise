import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePasswordStrength } from "../lib/password-strength";

test("password strength weak", () => {
  const result = evaluatePasswordStrength("abc");
  assert.equal(result.label, "weak");
});

test("password strength strong", () => {
  const result = evaluatePasswordStrength("Aa1!test");
  assert.equal(result.label, "strong");
});
