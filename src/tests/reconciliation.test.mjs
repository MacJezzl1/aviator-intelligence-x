import test from "node:test";
import assert from "node:assert/strict";
import {
  createForecastSnapshot,
  reconcileForecastWithActual,
  calculatePlatformReconciliationSummary
} from "../lib/analytics/reconciliation.ts";

test("reconcileForecastWithActual - computes multi-class Brier score and log loss", () => {
  const dummyForecast = {
    id: "fore-101",
    targetRoundNumber: 101,
    creationTimestamp: "2026-11-16T12:00:00Z",
    forecastHorizon: 1,
    predictedDistribution: {
      p_under_2x: 0.52,
      p_2x_to_5x: 0.35,
      p_5x_to_10x: 0.10,
      p_over_10x: 0.03,
    },
    expectedValue: 2.85,
    uncertaintyScore: 0.40,
    contributingModels: ["Spribe-Parametric-v1"],
    councilAssessment: "Calibrated prior baseline",
    evaluationStatus: "pending_outcome",
  };

  const snapshot = createForecastSnapshot(dummyForecast, "betway");
  assert.equal(snapshot.isLockedBeforeOutcome, true);

  const reconciled = reconcileForecastWithActual(snapshot, 1.45);
  assert.equal(reconciled.actualCategory, "under_2x");
  assert.ok(reconciled.brierScore >= 0 && reconciled.brierScore <= 2.0);
  assert.ok(reconciled.logLoss >= 0);
  assert.ok(reconciled.absoluteError > 0);
});

test("calculatePlatformReconciliationSummary - aggregates Expected Calibration Error (ECE)", () => {
  const dummyForecast = {
    id: "fore-102",
    targetRoundNumber: 102,
    creationTimestamp: "2026-11-16T12:00:00Z",
    forecastHorizon: 1,
    predictedDistribution: {
      p_under_2x: 0.52,
      p_2x_to_5x: 0.35,
      p_5x_to_10x: 0.10,
      p_over_10x: 0.03,
    },
    expectedValue: 2.85,
    uncertaintyScore: 0.40,
    contributingModels: ["Spribe-Parametric-v1"],
    councilAssessment: "Calibrated prior baseline",
    evaluationStatus: "pending_outcome",
  };

  const snap1 = createForecastSnapshot(dummyForecast, "hollywoodbets");
  const r1 = reconcileForecastWithActual(snap1, 1.20);
  const r2 = reconcileForecastWithActual(snap1, 3.50);

  const summary = calculatePlatformReconciliationSummary("hollywoodbets", [r1, r2]);
  assert.equal(summary.totalEvaluated, 2);
  assert.ok(summary.meanBrierScore > 0);
  assert.ok(summary.expectedCalibrationError >= 0);
  assert.ok(summary.reliabilityDiagram.length > 0);
});
