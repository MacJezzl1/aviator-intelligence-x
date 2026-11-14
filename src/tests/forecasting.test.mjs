import test from "node:test";
import assert from "node:assert/strict";
import { generateExperimentalForecast, evaluateForecast } from "../lib/analytics/forecasting.ts";

test("generateExperimentalForecast - flags INSUFFICIENT EVIDENCE if history < 30", () => {
  const shortHistory = [1.2, 2.5, 3.1, 1.1];
  const forecast = generateExperimentalForecast(shortHistory, 5);

  assert.equal(forecast.evaluationStatus, "insufficient_evidence");
  assert.equal(forecast.councilAssessment, "INSUFFICIENT EVIDENCE — NO RELIABLE FORECAST");
  assert.ok(forecast.uncertaintyScore >= 0.9);
});

test("generateExperimentalForecast - produces valid probability distribution for adequate sample", () => {
  // Generate 50 mock rounds
  const history = Array.from({ length: 50 }, (_, i) => (i % 2 === 0 ? 1.5 : 2.8));
  const forecast = generateExperimentalForecast(history, 51);

  assert.equal(forecast.evaluationStatus, "pending_outcome");
  const pSum =
    forecast.predictedDistribution.p_under_2x +
    forecast.predictedDistribution.p_2x_to_5x +
    forecast.predictedDistribution.p_5x_to_10x +
    forecast.predictedDistribution.p_over_10x;

  assert.ok(Math.abs(pSum - 1.0) < 0.01);
  assert.ok(forecast.uncertaintyScore > 0 && forecast.uncertaintyScore < 1);
});

test("evaluateForecast - computes multi-class Brier score and log loss", () => {
  const history = Array.from({ length: 40 }, () => 2.2);
  const forecast = generateExperimentalForecast(history, 41);

  const evaluated = evaluateForecast(forecast, 3.50);

  assert.equal(evaluated.evaluationStatus, "evaluated");
  assert.equal(evaluated.actualOutcome, 3.50);
  assert.ok(evaluated.brierScore !== null && evaluated.brierScore >= 0);
  assert.ok(evaluated.logLoss !== null && evaluated.logLoss >= 0);
});
