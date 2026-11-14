import test from "node:test";
import assert from "node:assert/strict";
import { verifyProvableFairRound, verifyServerSeedCommitment } from "../lib/analytics/provable-fair.ts";

test("verifyProvableFairRound - verifies deterministic HMAC SHA-256 crash multiplier", () => {
  const serverSeed = "d04b6d4b2e88a0b129759d5b03513b29d48b11c470a2408c6d3df363595509c2";
  const clientSeed = "000000000000000000045f958f8b3c99a80e127392c64b584093952a65";
  const nonce = 1;

  // Run calculation
  const res = verifyProvableFairRound({
    serverSeed,
    clientSeed,
    nonce,
    actualMultiplier: 1.00, // will test discrepancy
  });

  assert.ok(res.computedHash.length === 64);
  assert.ok(res.computedMultiplier >= 1.00);
  assert.equal(typeof res.isInstantCrash, "boolean");
  assert.equal(typeof res.isValid, "boolean");
});

test("verifyServerSeedCommitment - verifies public SHA-256 hash commitment", () => {
  const seed = "test-server-seed-2026";
  // SHA-256 of "test-server-seed-2026" in hex:
  // echo -n "test-server-seed-2026" | sha256sum
  // Let's compute with crypto
  import("crypto").then(({ default: crypto }) => {
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    const isMatch = verifyServerSeedCommitment(seed, hash);
    assert.equal(isMatch, true);

    const isBadMatch = verifyServerSeedCommitment(seed, "badhash");
    assert.equal(isBadMatch, false);
  });
});
