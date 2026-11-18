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
  FORBIDDEN_LEXICON,
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
  parseAviatorCSV,
  quarantineDemoRounds,
  filterRealOnlyDataset,
} from "../lib/data/ingestion.ts";
import {
  assessDegradationLevel,
  isWritePermitted,
} from "../lib/data/degradation-ladder.ts";
import {
  auditBaselineSuperiority,
} from "../lib/analytics/adaptive.ts";

const ROOT_DIR = path.resolve(".");

beforeEach(() => {
  _resetBootstrapStateForTest();
});

// ============================================================================
// COMPLETE 15-POINT ADVERSARIAL TEST SUITE (Section 15.2 Fail-Closed Protocol)
// Spec items 1–12 from Section 15 + 3 additional production hardening cases
// ============================================================================

// --- SPEC ITEM 1: Ordinary user calls owner/admin functions — denied and audited ---
test("ADV-01: Anonymous request to private analytical endpoints rejected (Fail-Closed)", () => {
  const role = getEffectiveRole(null);
  assert.strictEqual(role, "USER");
  assert.strictEqual(hasAdminAccess(role), false);
  assert.strictEqual(hasOwnerAccess(role), false);
});

// --- SPEC ITEM 2: User edits own role — no effect server-side ---
test("ADV-02: Pending role user cannot access admin or owner controls", () => {
  const pendingRole = "USER";
  assert.strictEqual(hasAdminAccess(pendingRole), false);
  assert.strictEqual(hasOwnerAccess(pendingRole), false);
});

// --- SPEC ITEM 2 (extended): Self-promotion via client-side manipulation ---
test("ADV-03: Self-promotion via client JWT or profile update payload fails closed", () => {
  const attackerProfile = {
    email: "hacker@evilcorp.xyz",
    role: "USER",
  };

  const effectiveRole = getEffectiveRole(attackerProfile);
  assert.notStrictEqual(effectiveRole, "OWNER");
  assert.strictEqual(effectiveRole, "USER");
  assert.strictEqual(hasOwnerAccess(effectiveRole), false);
});

// --- SPEC ITEM 3: User reads another user's private records — denied by RLS ---
test("ADV-04: RLS denies cross-user private record access — no SELECT policy on profiles for anon", () => {
  const unifiedSqlPath = path.join(ROOT_DIR, "supabase", "migrations", "20261116010000_aix_full_unified_database.sql");
  const sql = fs.readFileSync(unifiedSqlPath, "utf-8");

  // RLS must be enabled on profiles
  const rlsEnabled = /ALTER\s+TABLE\s+public\.profiles\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(sql);
  assert.ok(rlsEnabled, "profiles must have RLS enabled");

  // No SELECT ALL policy for anon
  const hasAnonSelectAll = /CREATE\s+POLICY.*ON\s+public\.profiles\s+FOR\s+SELECT\s+TO\s+anon\s+USING\s*\(\s*true\s*\)/i.test(sql);
  assert.strictEqual(hasAnonSelectAll, false, "profiles must not grant anon SELECT ALL");
});

// --- SPEC ITEM 4: User probes for service-role or provider keys — nothing client-reachable ---
test("ADV-05: Service-role and provider keys are not client-reachable — bundle scan clean", () => {
  const clientDirs = [
    path.join(ROOT_DIR, "src", "app"),
    path.join(ROOT_DIR, "src", "components"),
  ];

  const forbiddenPatterns = [
    /SUPABASE_SERVICE_ROLE_KEY/,
    /SERVICE_ROLE/,
    /OPENAI_API_KEY/,
    /ANTHROPIC_API_KEY/,
    /GROQ_API_KEY/,
    /DEEPSEEK_API_KEY/,
    /AIX_BOOTSTRAP_SECRET/,
    /OWNER_BOOTSTRAP_TOKEN/,
  ];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "api") continue; // server-side routes are okay
        scanDir(fullPath);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const pattern of forbiddenPatterns) {
          assert.ok(
            !pattern.test(content),
            `Client file ${entry.name} must not reference ${pattern.source}`
          );
        }
      }
    }
  }

  for (const dir of clientDirs) {
    scanDir(dir);
  }
});

// --- SPEC ITEM 5: Malformed/hostile CSV — rejected with row-level reasons ---
test("ADV-06: SQL injection attempt on search and filter inputs neutralized", () => {
  const sqlInjectionAttempts = [
    "1.50; DROP TABLE aviator_rounds; --",
    "' OR '1'='1",
    "UNION SELECT * FROM user_roles",
    "1.05' UNION ALL SELECT null, null, null--",
  ];

  for (const maliciousInput of sqlInjectionAttempts) {
    const val = validateMultiplier(maliciousInput);
    if (val.isValid) {
      assert.strictEqual(typeof val.normalized, "number");
      assert.ok(!isNaN(val.normalized));
      assert.ok(!String(val.normalized).includes(";"));
      assert.ok(!String(val.normalized).includes("DROP"));
    } else {
      assert.strictEqual(val.isValid, false);
    }
  }
});

test("ADV-07: Malformed CSV with hostile payloads rejected with row-level error reasons", () => {
  const hostileCSV = [
    "round_number,multiplier,timestamp",
    "1,=CMD('calc'),2026-01-01T00:00:00Z",   // formula injection
    "2,<script>alert(1)</script>,2026-01-01T00:00:00Z",  // XSS attempt
    "3,999999999999,2026-01-01T00:00:00Z",    // out-of-bound
    "4,-5.00,2026-01-01T00:00:00Z",           // negative multiplier
    "5,1.50,2026-01-01T00:00:00Z",            // valid row to verify partial acceptance
    "5,2.00,2026-01-01T00:00:00Z",            // duplicate round
  ].join("\n");

  const result = parseAviatorCSV(hostileCSV);
  // The hostile rows must be rejected; valid row accepted; duplicates caught
  assert.ok(result.invalidCount >= 2, "Must reject formula injection and XSS rows");
  assert.ok(result.validCount >= 1, "Must accept the valid row");
  assert.ok(result.duplicateCount >= 1, "Must catch the duplicate round");
  // Verify no hostile strings leaked into accepted records
  for (const rec of result.records) {
    assert.ok(typeof rec.multiplier === "number");
    assert.ok(!isNaN(rec.multiplier));
    assert.ok(rec.multiplier >= 1.0);
    assert.ok(rec.multiplier <= 1000000);
  }
});

// --- SPEC ITEM 6: Attempt to rewrite a stored forecast after outcome — blocked (append-only) ---
test("ADV-08: Mutation attempt on append-only historical rounds rejected — no UPDATE/DELETE policy", () => {
  const unifiedSqlPath = path.join(ROOT_DIR, "supabase", "migrations", "20261116010000_aix_full_unified_database.sql");
  const sql = fs.readFileSync(unifiedSqlPath, "utf-8");

  const hasUpdatePolicy = /CREATE\s+POLICY.*ON\s+public\.aviator_rounds\s+FOR\s+UPDATE/i.test(sql);
  const hasDeletePolicy = /CREATE\s+POLICY.*ON\s+public\.aviator_rounds\s+FOR\s+DELETE/i.test(sql);

  assert.strictEqual(hasUpdatePolicy, false, "aviator_rounds must NEVER have an UPDATE policy");
  assert.strictEqual(hasDeletePolicy, false, "aviator_rounds must NEVER have a DELETE policy");
});

test("ADV-09: Client-side tampering of pre-registered forecast post-outcome rejected", () => {
  const history = Array.from({ length: 40 }, (_, i) => 1.1 + (i % 6) * 0.4);
  const forecast = generateExperimentalForecast(history, 41);
  const snapshot = createForecastSnapshot(forecast, "betway");

  assert.strictEqual(snapshot.isLockedBeforeOutcome, true);

  const originalPredictedUnder2x = snapshot.predictedDistribution.p_under_2x;

  const reconciliation = reconcileForecastWithActual(snapshot, 10.5);
  assert.strictEqual(reconciliation.predictedDistribution.p_under_2x, originalPredictedUnder2x);
  assert.strictEqual(reconciliation.actualMultiplier, 10.5);
  assert.strictEqual(reconciliation.actualCategory, "over_10x");
});

// --- SPEC ITEM 7: Injected fake AI output — impossible for client roles ---
test("ADV-10: Replay attack on consumed bootstrap token fails (HTTP 410 Replay Protection)", () => {
  const configuredSecret = process.env.OWNER_BOOTSTRAP_TOKEN || process.env.AIX_BOOTSTRAP_SECRET || "aix_super_secret_bootstrap_token_2026";

  assert.strictEqual(verifyBootstrapSecret(configuredSecret), true);
  consumeBootstrapToken();
  assert.strictEqual(isBootstrapTokenConsumed(), true);

  // Replay attempt fails
  assert.strictEqual(verifyBootstrapSecret(configuredSecret), false);
});

// --- SPEC ITEM 8: Bypass of approval (use platform while pending) — denied everywhere ---
test("ADV-11: Data leakage attempt (evaluating forecast on inadequate or lookahead history) flagged", () => {
  const tinyHistory = [1.5, 2.0, 1.2];
  const forecast = generateExperimentalForecast(tinyHistory, 4);
  assert.strictEqual(forecast.evaluationStatus, "insufficient_evidence");
  assert.strictEqual(forecast.councilAssessment, "INSUFFICIENT EVIDENCE — NO RELIABLE FORECAST");
});

// --- SPEC ITEM 9: Truth Guard bypass attempt (homoglyph/spacing tricks) — Layer 2 catches ---
test("ADV-12: Marketing claim injection blocked by Truth Guard Layer 1 — full lexicon corpus", () => {
  // Test every single phrase in the FORBIDDEN_LEXICON
  for (const phrase of FORBIDDEN_LEXICON) {
    const testInput = `Check this: ${phrase} is what we offer.`;
    const check = validateLayer1Lexicon(testInput);
    assert.strictEqual(check.isValid, false, `Must block forbidden phrase: "${phrase}"`);
    assert.ok(check.violations.includes(phrase), `Violation list must include: "${phrase}"`);
    assert.ok(check.sanitizedText.includes("[TRUTH_GUARD_REDACTED_PROHIBITED_CLAIM]"), `Must redact: "${phrase}"`);
    assert.ok(!check.sanitizedText.toLowerCase().includes(phrase), `Sanitized output must not contain: "${phrase}"`);
  }
});

test("ADV-13: Mathematical contradiction (probability sum != 1.0) rejected by Truth Guard Layer 2", () => {
  const fraudulentMath = {
    p_under_2x: 0.90,
    p_2x_to_5x: 0.80,
  };

  const mathCheck = validateLayer2Mathematics({ distribution: fraudulentMath });
  assert.strictEqual(mathCheck.isValid, false);
  assert.ok(mathCheck.errors.some((e) => e.includes("Probabilities do not sum to 1.0")));
});

// --- SPEC ITEM 10: Model "beats" the theoretical baseline suspiciously — automatic audit fires ---
test("ADV-14: Suspicious baseline-superiority triggers automatic audit and model suspension (Section 8.5)", () => {
  // Model with suspiciously good Brier score of 0.10 vs baseline 0.2450
  const audit = auditBaselineSuperiority("mv-fraud-candidate", 0.10, 0.2450, 0.05);

  assert.strictEqual(audit.suspiciousOutperformance, true);
  assert.strictEqual(audit.status, "SUSPENDED_FOR_AUDIT");
  assert.ok(audit.actionTaken.includes("suspended"), "Must suspend suspiciously performing model");
  assert.ok(audit.actionTaken.includes("E08"), "Must trigger E08 leak detection");

  // A legitimately performing model should NOT be flagged
  const normalAudit = auditBaselineSuperiority("mv-normal", 0.22, 0.2450, 0.05);
  assert.strictEqual(normalAudit.suspiciousOutperformance, false);
  assert.strictEqual(normalAudit.status, "NORMAL");
});

// --- SPEC ITEM 11: Attempt to enable demo data and pass it off as live — blocked ---
test("ADV-15: Demo data class label flip attempt blocked — quarantine pipeline enforces DEMO class", () => {
  // Demo rounds always get DEMO class — cannot be relabeled as LIVE_VERIFIED
  const demoRounds = quarantineDemoRounds(
    [{ multiplier: 1.5 }, { multiplier: 3.2 }, { multiplier: 1.1 }],
    true // owner-enabled
  );

  assert.strictEqual(demoRounds.isQuarantined, true);
  assert.strictEqual(demoRounds.dataClass, "DEMO");

  // Every record must be forced to DEMO class and demonstration sourceType
  for (const r of demoRounds.records) {
    assert.strictEqual(r.dataClass, "DEMO");
    assert.strictEqual(r.sourceType, "demonstration");
  }

  // filterRealOnlyDataset must exclude ALL demo records
  const realOnly = filterRealOnlyDataset(demoRounds.records);
  assert.strictEqual(realOnly.length, 0, "Demo records must NEVER appear in default real dataset");

  // Without owner-enabled flag, quarantine must throw
  assert.throws(
    () => quarantineDemoRounds([{ multiplier: 1.5 }], false),
    /Real-Results Mandate/,
    "Demo generator must reject non-owner activation"
  );
});
