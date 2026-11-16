import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assessDegradationLevel,
  isWritePermitted,
  isLiveSyncPermitted,
  DEGRADATION_LEVEL_CONFIG,
} from "../lib/data/degradation-ladder.ts";
import {
  validateMultiplier,
  parseAviatorCSV,
  parseAviatorJSON,
} from "../lib/data/ingestion.ts";

test("Gate G6: Degradation Ladder — Severity priority order (L5 down to L0)", () => {
  // L5 takes priority over everything else
  const l5State = assessDegradationLevel({
    securityBreachDetected: true,
    supabaseConnected: false,
    liveFeedVerified: false,
    externalApiReachable: false,
  });
  assert.strictEqual(l5State.level, "L5");
  assert.strictEqual(l5State.allowsWrites, false);
  assert.strictEqual(l5State.allowsLiveSync, false);
  assert.strictEqual(l5State.aiExecutionMode, "offline");

  // L4: Supabase offline
  const l4State = assessDegradationLevel({
    supabaseConnected: false,
    liveFeedVerified: true,
  });
  assert.strictEqual(l4State.level, "L4");
  assert.strictEqual(l4State.allowsWrites, false);

  // L3: Live feed disconnected
  const l3State = assessDegradationLevel({
    liveFeedVerified: false,
    supabaseConnected: true,
  });
  assert.strictEqual(l3State.level, "L3");
  assert.strictEqual(l3State.allowsLiveSync, false);
  assert.strictEqual(l3State.activeDataSource, "demonstration");

  // L2: External AI unreachable
  const l2State = assessDegradationLevel({
    externalApiReachable: false,
    liveFeedVerified: true,
    supabaseConnected: true,
  });
  assert.strictEqual(l2State.level, "L2");
  assert.strictEqual(l2State.aiExecutionMode, "pure_deterministic_code");

  // L1: Rate limits on minor provider
  const l1State = assessDegradationLevel({
    rateLimitedProvidersCount: 1,
    externalApiReachable: true,
    liveFeedVerified: true,
    supabaseConnected: true,
  });
  assert.strictEqual(l1State.level, "L1");
  assert.strictEqual(l1State.aiExecutionMode, "provider_reroute");

  // L0: Clean baseline
  const l0State = assessDegradationLevel({
    externalApiReachable: true,
    liveFeedVerified: true,
    supabaseConnected: true,
    rateLimitedProvidersCount: 0,
    securityBreachDetected: false,
  });
  assert.strictEqual(l0State.level, "L0");
  assert.strictEqual(l0State.allowsWrites, true);
  assert.strictEqual(l0State.allowsLiveSync, true);
});

test("Gate G6: Emergency Lockdown (L5) — Strictly enforces read-only fail-closed security", () => {
  assert.strictEqual(isWritePermitted("L5"), false);
  assert.strictEqual(isLiveSyncPermitted("L5"), false);
  assert.strictEqual(DEGRADATION_LEVEL_CONFIG.L5.allowsWrites, false);
  assert.ok(DEGRADATION_LEVEL_CONFIG.L5.activeAlert?.includes("EMERGENCY LOCKDOWN"));
});

test("Gate G6: Data Ingestion Validation — Multiplier numeric boundaries and error handling", () => {
  // Valid multipliers
  assert.strictEqual(validateMultiplier(1.00).isValid, true);
  assert.strictEqual(validateMultiplier("2.50x").normalized, 2.50);
  assert.strictEqual(validateMultiplier("100.99").normalized, 100.99);

  // Invalid: sub-1.00x crash
  const sub1 = validateMultiplier(0.99);
  assert.strictEqual(sub1.isValid, false);
  assert.ok(sub1.error?.includes("less than 1.00x"));

  // Invalid: NaN / alphabetic
  const badAlpha = validateMultiplier("INVALID_MULTIPLIER");
  assert.strictEqual(badAlpha.isValid, false);

  // Invalid: extreme absurd value
  const extreme = validateMultiplier(2000000);
  assert.strictEqual(extreme.isValid, false);
  assert.ok(extreme.error?.includes("upper bound"));
});

test("Gate G6: Batch Ingestion — CSV & JSON Parsing with deduplication and error isolation", () => {
  // CSV parse test
  const sampleCSV = `round_number,multiplier,timestamp
101,1.45,2026-11-16T12:00:00Z
102,3.20,2026-11-16T12:01:00Z
103,INVALID_CRASH,2026-11-16T12:02:00Z
101,1.45,2026-11-16T12:00:00Z`;

  const csvResult = parseAviatorCSV(sampleCSV);
  assert.strictEqual(csvResult.validCount, 2);
  assert.strictEqual(csvResult.invalidCount, 1);
  assert.strictEqual(csvResult.duplicateCount, 1);
  assert.strictEqual(csvResult.records.length, 2);
  assert.strictEqual(csvResult.records[0].roundNumber, 101);
  assert.strictEqual(csvResult.records[0].multiplier, 1.45);

  // JSON parse test
  const sampleJSON = JSON.stringify([
    { roundNumber: 201, multiplier: 1.15, timestamp: "2026-11-16T12:05:00Z" },
    { roundNumber: 202, multiplier: 5.50, timestamp: "2026-11-16T12:06:00Z" },
    { roundNumber: 201, multiplier: 1.15 }, // duplicate
    { roundNumber: 203, multiplier: -0.5 }, // invalid sub-1.00
  ]);

  const jsonResult = parseAviatorJSON(sampleJSON);
  assert.strictEqual(jsonResult.validCount, 2);
  assert.strictEqual(jsonResult.duplicateCount, 1);
  assert.strictEqual(jsonResult.invalidCount, 1);
  assert.strictEqual(jsonResult.records.length, 2);
});
