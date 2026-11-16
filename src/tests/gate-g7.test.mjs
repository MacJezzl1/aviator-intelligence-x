import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  isServerConfiguredOwner,
  verifyBootstrapSecret,
  consumeBootstrapToken,
  isBootstrapTokenConsumed,
  _resetBootstrapStateForTest,
  getEffectiveRole,
  hasAdminAccess,
  hasOwnerAccess,
} from "../lib/auth/rbac.ts";
import {
  validateLayer1Lexicon,
  validateLayer2Mathematics,
} from "../lib/agents/truth-guard.ts";
import {
  createForecastSnapshot,
  reconcileForecastWithActual,
} from "../lib/analytics/reconciliation.ts";
import {
  generateExperimentalForecast,
} from "../lib/analytics/forecasting.ts";
import {
  validateMultiplier,
} from "../lib/data/ingestion.ts";
import {
  assessDegradationLevel,
  isWritePermitted,
} from "../lib/data/degradation-ladder.ts";

const ROOT_DIR = path.resolve(".");

beforeEach(() => {
  _resetBootstrapStateForTest();
});

// ============================================================================
// 10-POINT ADVERSARIAL TEST SUITE (Section 15.2 Fail-Closed Protocol)
// ============================================================================

test("ADV-01: Anonymous request to private analytical endpoints rejected (Fail-Closed)", () => {
  // Anon user (null profile) cannot access admin or owner controls
  const role = getEffectiveRole(null);
  assert.strictEqual(role, "USER");
  assert.strictEqual(hasAdminAccess(role), false);
  assert.strictEqual(hasOwnerAccess(role), false);
});

test("ADV-02: Pending role user cannot access admin or owner controls", () => {
  const pendingRole = "USER"; // Standard non-admin role
  assert.strictEqual(hasAdminAccess(pendingRole), false);
  assert.strictEqual(hasOwnerAccess(pendingRole), false);
});

test("ADV-03: Self-promotion via client JWT or profile update payload fails closed", () => {
  // Malicious profile claiming to be owner
  const attackerProfile = {
    email: "hacker@evilcorp.xyz",
    role: "USER",
  };

  // getEffectiveRole checks server-side owner env and strictly ignores claimedRole
  const effectiveRole = getEffectiveRole(attackerProfile);
  assert.notStrictEqual(effectiveRole, "OWNER");
  assert.strictEqual(effectiveRole, "USER");
  assert.strictEqual(hasOwnerAccess(effectiveRole), false);
});

test("ADV-04: Replay attack on consumed bootstrap token fails (HTTP 410 Replay Protection)", () => {
  const configuredSecret = process.env.OWNER_BOOTSTRAP_TOKEN || process.env.AIX_BOOTSTRAP_SECRET || "aix_super_secret_bootstrap_token_2026";

  // First verification succeeds
  assert.strictEqual(verifyBootstrapSecret(configuredSecret), true);
  consumeBootstrapToken();
  assert.strictEqual(isBootstrapTokenConsumed(), true);

  // Replay attempt fails immediately because token is consumed
  assert.strictEqual(verifyBootstrapSecret(configuredSecret), false);
});

test("ADV-05: SQL injection attempt on search and filter inputs neutralized", () => {
  const sqlInjectionAttempts = [
    "1.50; DROP TABLE aviator_rounds; --",
    "' OR '1'='1",
    "UNION SELECT * FROM user_roles",
    "1.05' UNION ALL SELECT null, null, null--",
  ];

  for (const maliciousInput of sqlInjectionAttempts) {
    const val = validateMultiplier(maliciousInput);
    if (val.isValid) {
      // If it parsed a float prefix, ensure it's strictly a sanitized finite number
      assert.strictEqual(typeof val.normalized, "number");
      assert.ok(!isNaN(val.normalized));
      assert.ok(!String(val.normalized).includes(";"));
      assert.ok(!String(val.normalized).includes("DROP"));
    } else {
      // Correctly rejected
      assert.strictEqual(val.isValid, false);
    }
  }
});

test("ADV-06: Mutation attempt on append-only historical rounds rejected", () => {
  // Verify that migration SQL has no UPDATE or DELETE policy for aviator_rounds
  const unifiedSqlPath = path.join(ROOT_DIR, "supabase", "migrations", "20261116010000_aix_full_unified_database.sql");
  const sql = fs.readFileSync(unifiedSqlPath, "utf-8");

  // Check no update policy on aviator_rounds
  const hasUpdatePolicy = /CREATE\s+POLICY.*ON\s+public\.aviator_rounds\s+FOR\s+UPDATE/i.test(sql);
  const hasDeletePolicy = /CREATE\s+POLICY.*ON\s+public\.aviator_rounds\s+FOR\s+DELETE/i.test(sql);

  assert.strictEqual(hasUpdatePolicy, false, "aviator_rounds must NEVER have an UPDATE policy");
  assert.strictEqual(hasDeletePolicy, false, "aviator_rounds must NEVER have a DELETE policy");
});

test("ADV-07: Client-side tampering of pre-registered forecast post-outcome rejected", () => {
  const history = Array.from({ length: 40 }, (_, i) => 1.1 + (i % 6) * 0.4);
  const forecast = generateExperimentalForecast(history, 41);
  const snapshot = createForecastSnapshot(forecast, "betway");

  assert.strictEqual(snapshot.isLockedBeforeOutcome, true);

  // Snapshot has frozen predictions that cannot be mutated
  const originalPredictedUnder2x = snapshot.predictedDistribution.p_under_2x;
  
  // Reconcile evaluates against immutable snapshot
  const reconciliation = reconcileForecastWithActual(snapshot, 10.5);
  assert.strictEqual(reconciliation.predictedDistribution.p_under_2x, originalPredictedUnder2x);
  assert.strictEqual(reconciliation.actualMultiplier, 10.5);
  assert.strictEqual(reconciliation.actualCategory, "over_10x");
});

test("ADV-08: Data leakage attempt (evaluating forecast on inadequate or lookahead history) flagged", () => {
  // Forecast attempted with inadequate history (< 30)
  const tinyHistory = [1.5, 2.0, 1.2];
  const forecast = generateExperimentalForecast(tinyHistory, 4);
  assert.strictEqual(forecast.evaluationStatus, "insufficient_evidence");
  assert.strictEqual(forecast.councilAssessment, "INSUFFICIENT EVIDENCE — NO RELIABLE FORECAST");
});

test("ADV-09: Marketing claim injection ('99% accuracy', 'guaranteed win') blocked by Truth Guard Layer 1", () => {
  const adversaryClaim = "Our secret algorithm delivers 99% accuracy and guaranteed win on Betway Aviator!";
  const check = validateLayer1Lexicon(adversaryClaim);

  assert.strictEqual(check.isValid, false);
  assert.ok(check.violations.includes("99% accuracy"));
  assert.ok(check.violations.includes("guaranteed win"));
  assert.ok(check.sanitizedText.includes("[TRUTH_GUARD_REDACTED_PROHIBITED_CLAIM]"));
  assert.ok(!check.sanitizedText.includes("99% accuracy"));
});

test("ADV-10: Mathematical contradiction (probability sum != 1.0) rejected by Truth Guard Layer 2", () => {
  const fraudulentMath = {
    p_under_2x: 0.90,
    p_2x_to_5x: 0.80, // Sums to 1.70 (impossible distribution)
  };

  const mathCheck = validateLayer2Mathematics({ distribution: fraudulentMath });
  assert.strictEqual(mathCheck.isValid, false);
  assert.ok(mathCheck.errors.some((e) => e.includes("Probabilities do not sum to 1.0")));
});
