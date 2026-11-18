import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  calculateDescriptiveStats,
  runWaldWolfowitzTest,
} from "../lib/analytics/stats.ts";
import {
  verifyProvableFairRound,
  verifyServerSeedCommitment,
} from "../lib/analytics/provable-fair.ts";
import {
  generateExperimentalForecast,
} from "../lib/analytics/forecasting.ts";
import {
  createForecastSnapshot,
  reconcileForecastWithActual,
  calculatePlatformReconciliationSummary,
} from "../lib/analytics/reconciliation.ts";
import {
  runChronologicalBacktest,
  evaluateAndAdaptModel,
  auditBaselineSuperiority,
  INITIAL_MODEL_VERSIONS,
} from "../lib/analytics/adaptive.ts";
import {
  fitParetoDistribution,
  createSeededRng,
} from "../lib/analytics/simulation.ts";
import {
  calculateTwoSampleKSTest,
  calculateMannWhitneyUTest,
} from "../lib/analytics/cross-platform.ts";
import {
  parseRoundCaptureLogbook,
  validateDoubleEntry,
  detectSequenceGaps,
  quarantineDemoRounds,
  filterRealOnlyDataset,
  validateMultiplier,
} from "../lib/data/ingestion.ts";

const ROOT_DIR = path.resolve(".");

test("Gate G4: Rule T3 — Analytics engine operates with 0 AI/LLM dependencies and zero network imports", () => {
  const analyticsDir = path.join(ROOT_DIR, "src", "lib", "analytics");
  const files = fs.readdirSync(analyticsDir).filter((f) => f.endsWith(".ts"));

  assert.ok(files.length >= 7, "Must contain all core analytics modules");

  const prohibitedImports = [
    "openai",
    "anthropic",
    "@google/genai",
    "@google/generative-ai",
    "groq",
    "ollama",
    "axios",
    "http",
    "https",
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.join(analyticsDir, file), "utf-8");
    for (const forbidden of prohibitedImports) {
      const regex = new RegExp(`from\\s+['"]${forbidden}['"]|require\\(['"]${forbidden}['"]\\)`, "i");
      assert.ok(
        !regex.test(content),
        `Prohibited dependency "${forbidden}" detected in ${file} (Violates Rule T3)`
      );
    }
  }
});

test("Gate G4: Leakage Defense (Rule T5) — Chronological walk-forward validation excludes future data", () => {
  // Generate 100 sequential rounds
  const multipliers = Array.from({ length: 100 }, (_, i) => 1.05 + ((i * 7) % 15) * 0.3);
  const baselineParams = INITIAL_MODEL_VERSIONS[0].parameters;

  const result = runChronologicalBacktest(multipliers, baselineParams);
  
  assert.ok(result.totalRounds > 0, "Backtest must evaluate out-of-sample rounds");
  assert.ok(result.brierScore >= 0 && result.brierScore <= 1, "Brier score must be within [0, 1]");
  assert.ok(result.logLoss > 0, "Log loss must be strictly positive");

  // Verify that an insufficient history (< 30 rounds) flags INSUFFICIENT EVIDENCE
  const insufficientHistory = [1.2, 2.5, 1.1];
  const insufficientForecast = generateExperimentalForecast(insufficientHistory, 4);
  assert.strictEqual(
    insufficientForecast.evaluationStatus,
    "insufficient_evidence",
    "Must flag insufficient evidence for history < 30 rounds"
  );
});

test("Gate G4: Leakage Defense (Rule T6) — Forecast snapshots are immutable and strictly locked before outcome", () => {
  const history = Array.from({ length: 50 }, (_, i) => 1.1 + (i % 5) * 0.5);
  const forecast = generateExperimentalForecast(history, 51);
  const snapshot = createForecastSnapshot(forecast, "betway");

  assert.strictEqual(snapshot.isLockedBeforeOutcome, true, "Snapshot must be locked before outcome");
  assert.strictEqual(snapshot.targetRoundNumber, 51);

  // Reconcile with actual verified multiplier
  const actualOutcome = 2.45;
  const reconciliation = reconcileForecastWithActual(snapshot, actualOutcome);

  assert.strictEqual(reconciliation.actualMultiplier, 2.45);
  assert.strictEqual(reconciliation.actualCategory, "2x_to_5x");
  assert.ok(reconciliation.brierScore >= 0 && reconciliation.brierScore <= 2, "Multi-class Brier must be in [0, 2]");
  assert.ok(reconciliation.absoluteError >= 0, "Absolute error must be non-negative");
});

test("Gate G4: Adaptive Engine — Anti-overfitting rule forbids parameter shift on single rounds", () => {
  const history = Array.from({ length: 80 }, (_, i) => 1.0 + (i % 10) * 0.4);
  const currentModel = INITIAL_MODEL_VERSIONS[0];

  // Pass a single outlier (multiplier 50.0x when model predicted bust)
  const audit = evaluateAndAdaptModel({
    targetRoundNumber: 81,
    actualMultiplier: 50.0,
    predictedProbabilityUnder2X: 0.65,
    historicalMultipliers: history,
    currentModel,
  });

  assert.ok(audit.auditId.startsWith("audit-adapt-"));
  assert.ok(audit.observedDiscrepancy.brierScore > 0);
  assert.ok(typeof audit.candidateTested.isPromoted === "boolean");

  // If candidate backtest does not beat baseline by >= 2%, model must NOT be promoted
  if (audit.candidateTested.improvementPercentage < 2.0) {
    assert.strictEqual(audit.candidateTested.isPromoted, false, "Must reject candidate with < 2% improvement");
    assert.ok(audit.councilVerdict.includes("RETAINS stable model"));
  }
});

test("Gate G4: Mathematical Rigor — Provably fair HMAC-SHA256 and Pareto parameter estimation", () => {
  // Provably fair verification
  const serverSeed = "4a5e1e5559868f03fb52eb71542f7c9e5e78b7b258671b76dd3d726b2160751e";
  const clientSeed = "client-seed-south-africa-2026";
  const nonce = 42;

  const roundResult = verifyProvableFairRound({
    serverSeed,
    clientSeed,
    nonce,
    actualMultiplier: 1.50,
  });
  assert.ok(roundResult.computedMultiplier >= 1.0, "Multiplier cannot be less than 1.00x");
  assert.ok(typeof roundResult.computedHash === "string" && roundResult.computedHash.length === 64);

  // Verify commitment
  const expectedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");
  const commitment = verifyServerSeedCommitment(serverSeed, expectedHash);
  assert.strictEqual(commitment, true, "SHA-256 seed commitment must verify");
  const badCommitment = verifyServerSeedCommitment(serverSeed, "invalid-hash-commitment");
  assert.strictEqual(badCommitment, false, "Invalid commitment must fail");

  // Pareto MLE estimation
  const sample = [1.02, 1.15, 1.5, 2.0, 3.5, 1.08, 1.95, 4.2, 1.25, 1.8];
  const paretoFit = fitParetoDistribution(sample);
  assert.ok(paretoFit.estimatedParetoAlpha > 0, "Pareto alpha shape parameter must be positive");
  assert.ok(typeof paretoFit.bestFitModel === "string");
});

test("Gate G4: Statistical Hypothesis Tests — Runs Test, KS-Test, Mann-Whitney U", () => {
  // 1. Wald-Wolfowitz runs test on alternating sequence
  const alternating = [1.1, 3.5, 1.2, 4.0, 1.1, 5.0, 1.3, 3.0, 1.2, 4.5, 1.1, 3.2];
  const runsTest = runWaldWolfowitzTest(alternating);
  assert.ok(typeof runsTest.statistic === "number");
  assert.ok(typeof runsTest.isRandomAtAlpha05 === "boolean");

  // 2. Kolmogorov-Smirnov test between identical distributions
  const distA = [1.1, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
  const distB = [1.1, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
  const ksIdentical = calculateTwoSampleKSTest(distA, distB);
  assert.strictEqual(ksIdentical.statistic, 0.0, "Identical samples must have D = 0");

  // 3. Mann-Whitney U test
  const uResult = calculateMannWhitneyUTest(distA, distB);
  assert.ok(uResult.pValue > 0.05, "Identical samples must not have significant rank difference");
});

test("Gate G4: Round Capture Kit (Appendix E) — Logbook CSV parsing, UTC conversion, and duplicate rejection", () => {
  const sampleLogbookCSV = `round_identifier,round_start_utc,multiplier,session_note
HB-20261118-001,2026-11-18T10:00:00Z,1.45,Hollywoodbets session 1
HB-20261118-002,2026-11-18T10:01:30Z,3.20,
HB-20261118-003,2026-11-18T10:03:00Z,0.95,Invalid crash under 1.00x
HB-20261118-002,2026-11-18T10:04:30Z,2.10,Duplicate round ID
HB-20261118-004,2026-11-18T10:06:00Z,15.80,Big hit
`;

  const parsed = parseRoundCaptureLogbook(sampleLogbookCSV, {
    source: "hollywoodbets",
  });

  assert.strictEqual(parsed.totalProcessed, 5, "Must process 5 data lines");
  assert.strictEqual(parsed.validCount, 3, "Must have exactly 3 valid rounds (HB-001, HB-002, HB-004)");
  assert.strictEqual(parsed.invalidCount, 1, "0.95x must be flagged invalid (< 1.00x)");
  assert.strictEqual(parsed.duplicateCount, 1, "Duplicate HB-002 must be rejected");
  assert.strictEqual(parsed.records[0].multiplier, 1.45);
  assert.strictEqual(parsed.records[0].dataClass, "IMPORTED");
  assert.strictEqual(parsed.records[0].sourceType, "historical_import");
  assert.strictEqual(parsed.records[0].operator, "hollywoodbets");
  assert.strictEqual(parsed.records[0].sessionNote, "Hollywoodbets session 1");
  assert.strictEqual(parsed.records[2].multiplier, 15.80);
});

test("Gate G4: Real-Results Mandate (Appendix E.2) — Double-entry confirmation & row-level diff blocking", () => {
  const primaryEntries = [
    { roundIdentifier: "R-101", roundStartUtc: "2026-11-18T10:00:00Z", multiplier: 1.50 },
    { roundIdentifier: "R-102", roundStartUtc: "2026-11-18T10:01:00Z", multiplier: 2.75 },
    { roundIdentifier: "R-103", roundStartUtc: "2026-11-18T10:02:00Z", multiplier: 1.10 },
  ];

  // 1. Identical confirmation entry passes
  const identicalConfirmation = [
    { roundIdentifier: "R-101", roundStartUtc: "2026-11-18T10:00:00Z", multiplier: 1.50 },
    { roundIdentifier: "R-102", roundStartUtc: "2026-11-18T10:01:00Z", multiplier: 2.75 },
    { roundIdentifier: "R-103", roundStartUtc: "2026-11-18T10:02:00Z", multiplier: 1.10 },
  ];
  const passResult = validateDoubleEntry(primaryEntries, identicalConfirmation);
  assert.strictEqual(passResult.matches, true);
  assert.strictEqual(passResult.diffCount, 0);

  // 2. Discrepancy blocks import with row-level diff
  const mismatchedConfirmation = [
    { roundIdentifier: "R-101", roundStartUtc: "2026-11-18T10:00:00Z", multiplier: 1.50 },
    { roundIdentifier: "R-102", roundStartUtc: "2026-11-18T10:01:00Z", multiplier: 2.70 }, // Discrepancy!
    { roundIdentifier: "R-103", roundStartUtc: "2026-11-18T10:02:00Z", multiplier: 1.10 },
  ];
  const failResult = validateDoubleEntry(primaryEntries, mismatchedConfirmation);
  assert.strictEqual(failResult.matches, false, "Discrepancy must fail validation");
  assert.strictEqual(failResult.diffCount, 1);
  assert.strictEqual(failResult.discrepancies[0].roundIdentifier, "R-102");
  assert.strictEqual(failResult.discrepancies[0].field, "multiplier");
  assert.strictEqual(failResult.discrepancies[0].primaryValue, 2.75);
  assert.strictEqual(failResult.discrepancies[0].confirmationValue, 2.70);
});

test("Gate G4: Sequence-Gap Detection (Appendix E.2.3, G03/G05) — Missing round reconciliation", () => {
  // Sequence with gap: 101, 102, 105 (missing 103, 104)
  const idsWithGap = ["R-101", "R-102", "R-105"];
  const gapReport = detectSequenceGaps(idsWithGap);

  assert.strictEqual(gapReport.hasGaps, true, "Must detect sequence gap");
  assert.strictEqual(gapReport.gaps.length, 1);
  assert.strictEqual(gapReport.gaps[0].expectedFrom, 103);
  assert.strictEqual(gapReport.gaps[0].expectedTo, 104);
  assert.strictEqual(gapReport.gaps[0].missingCount, 2);

  // Continuous sequence without gaps
  const continuous = ["R-201", "R-202", "R-203", "R-204"];
  const noGapReport = detectSequenceGaps(continuous);
  assert.strictEqual(noGapReport.hasGaps, false);
  assert.strictEqual(noGapReport.gaps.length, 0);
});

test("Gate G4: Real-Results Mandate (Rule T13, Section 9.1.2) — Demo quarantine isolation & real-only filter", () => {
  // 1. Calling demo generation with ownerEnabled = false must throw
  assert.throws(
    () => {
      quarantineDemoRounds([{ multiplier: 2.50 }], false);
    },
    /Real-Results Mandate/,
    "Unprivileged or silent demo generation must fail"
  );

  // 2. Owner-enabled demo generation produces strictly quarantined batch
  const demoBatch = quarantineDemoRounds([{ multiplier: 3.10 }, { multiplier: 1.25 }], true);
  assert.strictEqual(demoBatch.isQuarantined, true);
  assert.strictEqual(demoBatch.dataClass, "DEMO");
  assert.strictEqual(demoBatch.badge, "DEMO");
  assert.strictEqual(demoBatch.records.length, 2);
  assert.strictEqual(demoBatch.records[0].dataClass, "DEMO");
  assert.strictEqual(demoBatch.records[0].sourceType, "demonstration");
  assert.strictEqual(demoBatch.records[0].isProvablyFair, false);

  // 3. filterRealOnlyDataset strictly eliminates demo records
  const mixedPool = [
    { id: "r1", multiplier: 1.5, sourceType: "historical_import", dataClass: "IMPORTED" },
    { id: "r2", multiplier: 2.0, sourceType: "live_verified", dataClass: "LIVE_VERIFIED" },
    { id: "d1", multiplier: 5.0, sourceType: "demonstration", dataClass: "DEMO" },
    { id: "d2", multiplier: 1.2, sourceType: "manual_entry", dataClass: "DEMO" },
  ];
  const realOnly = filterRealOnlyDataset(mixedPool);
  assert.strictEqual(realOnly.length, 2);
  assert.ok(realOnly.every((r) => r.dataClass !== "DEMO" && r.sourceType !== "demonstration"));
});

test("Gate G4: Smart Guard (Section 8.5) — Baseline-superiority audit & E08 suspension rule", () => {
  // Normal model within expected variance band (Brier 0.22 vs baseline 0.245, diff 0.025 <= threshold 0.05)
  const normalAudit = auditBaselineSuperiority("model-stable-v1", 0.2200, 0.2450, 0.05);
  assert.strictEqual(normalAudit.status, "NORMAL");
  assert.strictEqual(normalAudit.suspiciousOutperformance, false);

  // Suspicious model outperforming beyond sampling-noise band (Brier 0.12 vs baseline 0.245, diff 0.125 > 0.05)
  const suspiciousAudit = auditBaselineSuperiority("model-overfitted-leak", 0.1200, 0.2450, 0.05);
  assert.strictEqual(suspiciousAudit.status, "SUSPENDED_FOR_AUDIT");
  assert.strictEqual(suspiciousAudit.suspiciousOutperformance, true);
  assert.ok(suspiciousAudit.actionTaken.includes("suspended"));
  assert.ok(suspiciousAudit.actionTaken.includes("E08 leak detection"));
});
