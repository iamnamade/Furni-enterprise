import test from "node:test";
import assert from "node:assert/strict";
import { createTotpSecret, verifyTotpCode } from "../lib/totp";

test("totp rejects invalid code", () => {
  const secret = createTotpSecret();
  assert.equal(verifyTotpCode({ secret, code: "000000" }), false);
});
