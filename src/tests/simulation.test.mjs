import test from "node:test";
import assert from "node:assert/strict";
import {
  createSeededRng,
  generateSpribeSimulatorMultiplier,
  executeSimulation,
  fitParetoDistribution
} from "../lib/analytics/simulation.ts";

test("createSeededRng - generates deterministic reproducible sequence", () => {
  const rng1 = createSeededRng("seed-alpha-2026");
  const rng2 = createSeededRng("seed-alpha-2026");

  const v1 = [rng1(), rng1(), rng1()];
  const v2 = [rng2(), rng2(), rng2()];

  assert.deepEqual(v1, v2, "Seeded RNG must produce identical values for the same seed");
});

test("executeSimulation - executes Monte Carlo run with 95% confidence intervals", () => {
  const result = executeSimulation({
    modelId: "spribe_exact_hmac",
    sampleSize: 100,
    seed: "test-seed-1",
    parameters: { rtp: 0.97, instantCrashRate: 0.0303 },
  });

  assert.equal(result.simulatedMultipliers.length, 100);
  assert.ok(result.stats.mean >= 1.00);
  assert.ok(result.confidenceIntervals95.mean[0] <= result.confidenceIntervals95.mean[1]);
  assert.ok(result.confidenceIntervals95.bustRate[0] <= result.confidenceIntervals95.bustRate[1]);
});

test("fitParetoDistribution - estimates Pareto alpha via MLE", () => {
  const observed = [1.2, 1.5, 2.0, 1.1, 3.5, 1.8, 2.2, 4.0, 1.4, 2.8, 1.3, 5.0, 1.7, 2.1, 1.9];
  const fit = fitParetoDistribution(observed);

  assert.ok(fit.estimatedParetoAlpha > 0);
  assert.ok(fit.comparisonWithObservation.observedMean > 0);
  assert.ok(fit.bestFitModel.length > 0);
});
