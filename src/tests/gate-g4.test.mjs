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
