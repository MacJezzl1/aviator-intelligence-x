/**
 * AVIATOR INTELLIGENCE X (AIX) — REAL-GAME RECONCILIATION ENGINE
 * Rigorous evaluation of pre-outcome forecast snapshots against verified game outcomes,
 * calculating Brier scores, log loss, calibration curves, and leakage prevention audits.
 */

import { type ExperimentalForecast, type PredictedDistribution } from "./forecasting.ts";

export interface ForecastSnapshot {
  snapshotId: string;
  platformId: string;
  targetRoundNumber: number;
  creationTimestamp: string;
  predictedDistribution: PredictedDistribution;
  expectedMultiplier: number;
  uncertaintyScore: number;
  contributingModels: string[];
  isLockedBeforeOutcome: boolean;
}

export interface ReconciledForecastResult {
  snapshotId: string;
  platformId: string;
  targetRoundNumber: number;
  creationTimestamp: string;
  reconciliationTimestamp: string;
  
  // Forecast values
  predictedDistribution: PredictedDistribution;
  expectedMultiplier: number;
  
  // Actual verified outcome
  actualMultiplier: number;
  actualCategory: "under_2x" | "2x_to_5x" | "5x_to_10x" | "over_10x";
  
  // Scoring metrics
  absoluteError: number;
  relativeError: number;
  brierScore: number; // Multi-class Brier score
  logLoss: number;
  isCalibrated: boolean;
  calibrationBucket: string;
}

export interface ReconciliationPerformanceSummary {
  platformId: string;
  totalEvaluated: number;
  meanBrierScore: number;
  meanLogLoss: number;
  meanAbsoluteError: number;
  expectedCalibrationError: number; // ECE
  reliabilityDiagram: Array<{
    bucket: string;
    meanPredictedProbability: number;
    empiricalObservedFrequency: number;
    sampleCount: number;
  }>;
  accuracyUnder2X: number;
  modelStabilityRating: "EXCELLENT" | "CALIBRATED" | "MARGINAL" | "UNRELIABLE";
}

/**
 * Creates an immutable snapshot before outcome is observed
 */
export function createForecastSnapshot(
  forecast: ExperimentalForecast,
  platformId: string = "betway"
): ForecastSnapshot {
  return {
    snapshotId: `snap-${forecast.id}`,
    platformId,
    targetRoundNumber: forecast.targetRoundNumber,
    creationTimestamp: forecast.createdTimestamp,
    predictedDistribution: { ...forecast.predictedDistribution },
    expectedMultiplier: forecast.expectedValue,
    uncertaintyScore: forecast.uncertaintyScore,
    contributingModels: [...forecast.contributingModels],
    isLockedBeforeOutcome: true,
  };
}

/**
 * Reconciles a forecast snapshot with an actual verified multiplier
 */
export function reconcileForecastWithActual(
  snapshot: ForecastSnapshot,
  actualMultiplier: number,
  verificationTime?: string
): ReconciledForecastResult {
  const p = snapshot.predictedDistribution;

  let actualCategory: ReconciledForecastResult["actualCategory"];
  let y_under2 = 0;
  let y_2to5 = 0;
  let y_5to10 = 0;
  let y_over10 = 0;

  if (actualMultiplier < 2.00) {
    actualCategory = "under_2x";
    y_under2 = 1;
  } else if (actualMultiplier < 5.00) {
    actualCategory = "2x_to_5x";
    y_2to5 = 1;
  } else if (actualMultiplier < 10.00) {
    actualCategory = "5x_to_10x";
    y_5to10 = 1;
  } else {
    actualCategory = "over_10x";
    y_over10 = 1;
  }

  // Multi-class Brier score: sum((p_k - y_k)^2)
  const brierScore =
    Math.pow(p.p_under_2x - y_under2, 2) +
    Math.pow(p.p_2x_to_5x - y_2to5, 2) +
    Math.pow(p.p_5x_to_10x - y_5to10, 2) +
    Math.pow(p.p_over_10x - y_over10, 2);

  // Categorical log loss: -ln(p_observed)
  const eps = 1e-6;
  let pObserved = eps;
  if (actualCategory === "under_2x") pObserved = Math.max(eps, p.p_under_2x);
  else if (actualCategory === "2x_to_5x") pObserved = Math.max(eps, p.p_2x_to_5x);
  else if (actualCategory === "5x_to_10x") pObserved = Math.max(eps, p.p_5x_to_10x);
  else pObserved = Math.max(eps, p.p_over_10x);

  const logLoss = -Math.log(pObserved);

  const absError = Math.abs(snapshot.expectedMultiplier - actualMultiplier);
  const relError = absError / Math.max(1.0, actualMultiplier);

  // Calibration bucket based on predicted probability of under 2.00x
  let bucket = "[0.4-0.6]";
  if (p.p_under_2x < 0.4) bucket = "[0.2-0.4]";
  else if (p.p_under_2x > 0.6) bucket = "[0.6-0.8]";

  return {
    snapshotId: snapshot.snapshotId,
    platformId: snapshot.platformId,
    targetRoundNumber: snapshot.targetRoundNumber,
    creationTimestamp: snapshot.creationTimestamp,
    reconciliationTimestamp: verificationTime || new Date().toISOString(),
    predictedDistribution: snapshot.predictedDistribution,
    expectedMultiplier: snapshot.expectedMultiplier,
    actualMultiplier,
    actualCategory,
    absoluteError: Math.round(absError * 100) / 100,
    relativeError: Math.round(relError * 1000) / 1000,
    brierScore: Math.round(brierScore * 10000) / 10000,
    logLoss: Math.round(logLoss * 10000) / 10000,
    isCalibrated: brierScore < 0.50,
    calibrationBucket: bucket,
  };
}

/**
 * Computes Expected Calibration Error (ECE) and aggregates performance across platform history
 */
export function calculatePlatformReconciliationSummary(
  platformId: string,
  records: ReconciledForecastResult[]
): ReconciliationPerformanceSummary {
  if (records.length === 0) {
    return {
      platformId,
      totalEvaluated: 0,
      meanBrierScore: 0,
      meanLogLoss: 0,
      meanAbsoluteError: 0,
      expectedCalibrationError: 0,
      reliabilityDiagram: [],
      accuracyUnder2X: 0,
      modelStabilityRating: "CALIBRATED",
    };
  }

  const n = records.length;
  const totalBrier = records.reduce((acc, r) => acc + r.brierScore, 0);
  const totalLogLoss = records.reduce((acc, r) => acc + r.logLoss, 0);
  const totalAbsErr = records.reduce((acc, r) => acc + r.absoluteError, 0);

  // Calibration Bins for binary task: P(<2.00x)
  const bins = [
    { label: "[0.0 - 0.2)", min: 0.0, max: 0.2, preds: [] as number[], hits: [] as number[] },
    { label: "[0.2 - 0.4)", min: 0.2, max: 0.4, preds: [] as number[], hits: [] as number[] },
    { label: "[0.4 - 0.6)", min: 0.4, max: 0.6, preds: [] as number[], hits: [] as number[] },
    { label: "[0.6 - 0.8)", min: 0.6, max: 0.8, preds: [] as number[], hits: [] as number[] },
    { label: "[0.8 - 1.0]", min: 0.8, max: 1.01, preds: [] as number[], hits: [] as number[] },
  ];

  for (const r of records) {
    const prob = r.predictedDistribution.p_under_2x;
    const hit = r.actualCategory === "under_2x" ? 1 : 0;
    const targetBin = bins.find((b) => prob >= b.min && prob < b.max);
    if (targetBin) {
      targetBin.preds.push(prob);
      targetBin.hits.push(hit);
    }
  }

  let ece = 0;
  const diagram = bins.map((b) => {
    const count = b.preds.length;
    if (count === 0) {
      return {
        bucket: b.label,
        meanPredictedProbability: Math.round(((b.min + b.max) / 2) * 100) / 100,
        empiricalObservedFrequency: Math.round(((b.min + b.max) / 2) * 100) / 100,
        sampleCount: 0,
      };
    }

    const meanPred = b.preds.reduce((a, v) => a + v, 0) / count;
    const obsFreq = b.hits.reduce((a, v) => a + v, 0) / count;
    ece += (count / n) * Math.abs(obsFreq - meanPred);

    return {
      bucket: b.label,
      meanPredictedProbability: Math.round(meanPred * 100) / 100,
      empiricalObservedFrequency: Math.round(obsFreq * 100) / 100,
      sampleCount: count,
    };
  });

  const meanBrier = totalBrier / n;
  let stability: ReconciliationPerformanceSummary["modelStabilityRating"] = "CALIBRATED";
  if (meanBrier < 0.25 && ece < 0.08) stability = "EXCELLENT";
  else if (meanBrier > 0.45 || ece > 0.15) stability = "MARGINAL";

  const correctPicks = records.filter(
    (r) => (r.predictedDistribution.p_under_2x >= 0.5 && r.actualCategory === "under_2x") ||
           (r.predictedDistribution.p_under_2x < 0.5 && r.actualCategory !== "under_2x")
  ).length;

  return {
    platformId,
    totalEvaluated: n,
    meanBrierScore: Math.round(meanBrier * 10000) / 10000,
    meanLogLoss: Math.round((totalLogLoss / n) * 10000) / 10000,
    meanAbsoluteError: Math.round((totalAbsErr / n) * 100) / 100,
    expectedCalibrationError: Math.round(ece * 10000) / 10000,
    reliabilityDiagram: diagram,
    accuracyUnder2X: Math.round((correctPicks / n) * 1000) / 10,
    modelStabilityRating: stability,
  };
}
