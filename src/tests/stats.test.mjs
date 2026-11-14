import test from "node:test";
import assert from "node:assert/strict";
import { calculateDescriptiveStats, calculateDistributionBins, analyzeStreaks, runWaldWolfowitzTest } from "../lib/analytics/stats.ts";

test("calculateDescriptiveStats - correctly computes central tendency and moments", () => {
  const sample = [1.50, 2.00, 2.50, 3.00, 4.00, 5.00, 10.00];
  const stats = calculateDescriptiveStats(sample);

  assert.equal(stats.count, 7);
  assert.equal(stats.min, 1.50);
  assert.equal(stats.max, 10.00);
  assert.equal(stats.median, 3.00);
  assert.ok(stats.mean > 3.9 && stats.mean < 4.1);
  assert.ok(stats.variance > 0);
  assert.ok(stats.stdDev > 0);
});

test("calculateDistributionBins - categorizes into correct ranges", () => {
  const sample = [1.10, 1.30, 1.80, 2.50, 7.00, 15.00, 60.00];
  const bins = calculateDistributionBins(sample);

  assert.equal(bins.length, 7);
  assert.equal(bins[0].label, "1.00x - 1.20x");
  assert.equal(bins[0].count, 1);
  assert.equal(bins[6].label, "50.00x+");
  assert.equal(bins[6].count, 1);
});

test("analyzeStreaks - identifies cold streaks (<2.00x) and hot streaks", () => {
  const sample = [1.20, 1.50, 1.80, 3.50, 4.00, 1.10];
  const streaks = analyzeStreaks(sample);

  assert.equal(streaks.maxColdStreak, 3);
  assert.equal(streaks.maxHotStreak, 2);
  assert.equal(streaks.currentStreakType, "cold");
  assert.equal(streaks.currentStreakLength, 1);
});

test("runWaldWolfowitzTest - produces valid test statistic and interpretation", () => {
  const sample = [
    1.1, 2.2, 1.3, 3.4, 1.2, 4.5, 1.8, 2.9, 1.4, 3.1,
    1.5, 2.8, 1.9, 4.1, 1.2, 3.3, 1.6, 2.5, 1.7, 3.8,
    1.3, 2.4, 1.1, 5.0, 1.4, 2.7, 1.8, 3.2, 1.5, 2.9
  ];
  const res = runWaldWolfowitzTest(sample);

  assert.equal(typeof res.statistic, "number");
  assert.equal(typeof res.pValueEstimate, "number");
  assert.ok(res.pValueEstimate >= 0 && res.pValueEstimate <= 1);
  assert.ok(typeof res.isRandomAtAlpha05 === "boolean");
});
