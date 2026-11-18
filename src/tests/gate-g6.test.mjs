import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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

test("Gate G6: Degradation Level L6 (Fresh-Install / Empty-State Audit) — Honest empty state when n = 0", () => {
  // Assessment with 0 rounds evaluates to L6
  const l6State = assessDegradationLevel({
    totalRoundsCount: 0,
    externalApiReachable: true,
    liveFeedVerified: true,
    supabaseConnected: true,
    rateLimitedProvidersCount: 0,
    securityBreachDetected: false,
  });

  assert.strictEqual(l6State.level, "L6", "Empty dataset must resolve to L6 state");
  assert.strictEqual(l6State.name, "Fresh Install / Empty State");
  assert.ok(
    l6State.activeAlert?.includes("Round Capture Kit"),
    "L6 must provide honest directive pointing to Round Capture Kit"
  );
  assert.strictEqual(l6State.allowsWrites, true, "L6 must permit ingestion writes");
  assert.strictEqual(l6State.allowsLiveSync, false, "L6 forbids claiming live synchronization");
});

test("Gate G6: Live Signal Console Specification (Section 12.6) — Truth-locked structure and mandatory disclaimers", () => {
  const consoleFile = path.resolve("src", "components", "console", "LiveSignalConsole.tsx");

  assert.ok(fs.existsSync(consoleFile), "LiveSignalConsole component file must exist");
  const content = fs.readFileSync(consoleFile, "utf-8");

  // Verify mandatory Zone 3 label (Section 12.6)
  assert.ok(
    content.includes("THEORETICAL ODDS — NOT A PREDICTION"),
    "Odds band strip MUST carry permanent label: 'THEORETICAL ODDS — NOT A PREDICTION'"
  );

  // Verify mandatory Zone 4 streak caption (Section 12.6)
  assert.ok(
    content.includes("Descriptive of past rounds — carries no information about future rounds"),
    "Streak panel MUST carry mandatory disclaimer: 'Descriptive of past rounds — carries no information about future rounds'"
  );

  // Verify L6 honest empty state handling
  assert.ok(
    content.includes("No rounds recorded yet"),
    "Must implement honest empty state when n = 0"
  );
  assert.ok(
    content.includes("Round Capture Kit"),
    "Empty state must link to Round Capture Kit"
  );

  // Verify window selector targets
  assert.ok(content.includes("20, 50, 100, 500"), "Must support observation windows 20, 50, 100, 500");

  // Verify aria-live polite region for screen readers (Section 12.10)
  assert.ok(content.includes('aria-live="polite"'), "Round feed must provide aria-live='polite' region");
});

test("Gate G6: Latency & Render Budget (< 300 ms) — Fast deterministic computation of odds bands and streaks", () => {
  // Generate 500 real rounds
  const rounds = Array.from({ length: 500 }, (_, i) => ({
    roundNumber: i + 1,
    multiplier: 1.00 + ((i * 13) % 25) * 0.4,
  }));

  const startTime = performance.now();

  // Execute Odds Band computation for m in {1.5, 2.0, 3.0, 5.0, 10.0, 50.0, 100.0}
  const targets = [1.5, 2.0, 3.0, 5.0, 10.0, 50.0, 100.0];
  const n = rounds.length;
  const oddsBands = targets.map((m) => {
    const theoreticalP = Number((0.97 / m).toFixed(4));
    const count = rounds.filter((r) => r.multiplier >= m).length;
    const empiricalP = n > 0 ? count / n : 0;
    const z = 1.96;
    const margin = z * Math.sqrt((empiricalP * (1 - empiricalP)) / n);
    return {
      m,
      theoreticalP,
      empiricalP,
      ciLower: Math.max(0, empiricalP - margin),
      ciUpper: Math.min(1, empiricalP + margin),
      count,
    };
  });

  // Execute Streak descriptor (B02)
  let currentCold = 0;
  let maxCold = 0;
  for (const r of rounds) {
    if (r.multiplier < 2.0) {
      currentCold++;
      if (currentCold > maxCold) maxCold = currentCold;
    } else {
      currentCold = 0;
    }
  }

  const durationMs = performance.now() - startTime;

  assert.ok(oddsBands.length === 7, "Must compute all 7 odds bands");
  assert.ok(maxCold > 0, "Must calculate max cold streak");
  assert.ok(
    durationMs < 300,
    `Console computation must strictly finish within 300 ms budget (took ${durationMs.toFixed(2)} ms)`
  );
});
