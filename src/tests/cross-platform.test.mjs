import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTwoSampleKSTest,
  calculateMannWhitneyUTest,
  comparePlatformDistributions
} from "../lib/analytics/cross-platform.ts";

test("calculateTwoSampleKSTest - returns low D statistic for identical distributions", () => {
  const sampleA = [1.1, 1.3, 1.5, 1.8, 2.0, 2.5, 3.0, 4.0, 5.0, 8.0, 1.2, 1.4, 2.2, 3.5, 1.9];
  const sampleB = [1.2, 1.4, 1.5, 1.7, 2.1, 2.4, 3.1, 3.9, 5.2, 7.8, 1.1, 1.3, 2.0, 3.2, 1.8];

  const result = calculateTwoSampleKSTest(sampleA, sampleB);
  assert.ok(result.statistic >= 0 && result.statistic <= 1);
  assert.ok(result.pValue >= 0 && result.pValue <= 1);
  assert.ok(result.pValue > 0.10, "P-value should not reject null hypothesis for near-identical samples");
});

test("calculateMannWhitneyUTest - computes valid rank-sum U and Z statistics", () => {
  const sampleA = [1.1, 1.2, 1.4, 1.8, 2.0, 2.2, 2.8, 3.5, 5.0, 8.0];
  const sampleB = [1.2, 1.3, 1.5, 1.9, 2.1, 2.3, 2.9, 3.6, 5.2, 8.2];

  const result = calculateMannWhitneyUTest(sampleA, sampleB);
  assert.ok(result.u >= 0);
  assert.ok(result.pValue >= 0 && result.pValue <= 1);
});

test("comparePlatformDistributions - evaluates Betway vs Hollywoodbets equivalence", () => {
  const btw = [1.5, 2.8, 1.2, 4.0, 1.9, 3.2, 1.1, 7.5, 1.8, 2.1, 1.4, 2.9, 1.3, 5.5, 1.6, 2.3, 1.7, 3.8, 1.4, 2.2, 1.9, 2.5];
  const hwb = [1.6, 2.5, 1.3, 3.8, 2.0, 3.0, 1.2, 6.8, 1.7, 2.0, 1.5, 2.8, 1.4, 5.0, 1.7, 2.2, 1.8, 3.5, 1.3, 2.1, 1.8, 2.4];

  const comparison = comparePlatformDistributions("betway", "hollywoodbets", btw, hwb);
  assert.equal(comparison.basePlatformId, "betway");
  assert.equal(comparison.comparisonPlatformId, "hollywoodbets");
  assert.ok(comparison.modelTransferabilityScore >= 0 && comparison.modelTransferabilityScore <= 1);
  assert.ok(comparison.scientificDisclaimer.length > 0);
});
