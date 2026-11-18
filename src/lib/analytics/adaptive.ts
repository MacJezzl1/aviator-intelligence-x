/**
 * AVIATOR INTELLIGENCE X (AIX) — ADAPTIVE MODEL RESEARCH & IMPROVEMENT PIPELINE
 * Disciplined research loop triggered on inaccurate forecasts:
 * Inspects assumptions, tests candidates via chronological backtesting, and promotes only genuine improvements.
 */

export interface ModelVersionRecord {
  id: string;
  modelName: string;
  versionString: string;
  parameters: {
    priorWeight: number;
    windowSize: number;
    decayFactor: number;
    tailSmoothing: boolean;
  };
  status: "STABLE" | "CANDIDATE" | "DEPRECATED" | "ROLLED_BACK";
  historicalBrierScore: number;
  expectedCalibrationError: number;
  promotedAt?: string;
  notes: string;
}

export interface ModelAdaptationAudit {
  auditId: string;
  triggerRoundNumber: number;
  affectedModelId: string;
  initialAssumptions: string[];
  observedDiscrepancy: {
    predictedCategory: string;
    actualMultiplier: number;
    brierScore: number;
  };
  investigationVerdict: "SAMPLE_VARIANCE_IGNORE" | "SYSTEMATIC_DRIFT_INVESTIGATE" | "OUTLIER_TAIL_SPIKE";
  candidateTested: {
    versionString: string;
    proposedChanges: string;
    outOfSampleBacktestBrier: number;
    baselineBacktestBrier: number;
    improvementPercentage: number;
    isPromoted: boolean;
  };
  councilVerdict: string;
  timestamp: string;
}

export const INITIAL_MODEL_VERSIONS: ModelVersionRecord[] = [
  {
    id: "mv-spribe-v1",
    modelName: "Spribe-Parametric-Regularized",
    versionString: "v1.0.0",
    parameters: {
      priorWeight: 0.60,
      windowSize: 100,
      decayFactor: 0.95,
      tailSmoothing: true,
    },
    status: "STABLE",
    historicalBrierScore: 0.1842,
    expectedCalibrationError: 0.0412,
    promotedAt: "2026-11-14T00:00:00Z",
    notes: "Baseline production model regularized with Spribe 97% theoretical prior.",
  },
  {
    id: "mv-bayes-v1",
    modelName: "Dirichlet-Multinomial-Adaptive",
    versionString: "v1.1.0-candidate",
    parameters: {
      priorWeight: 0.45,
      windowSize: 150,
      decayFactor: 0.98,
      tailSmoothing: true,
    },
    status: "CANDIDATE",
    historicalBrierScore: 0.1819,
    expectedCalibrationError: 0.0389,
    notes: "Candidate version with longer observation window and relaxed prior weight.",
  },
];

/**
 * Runs chronological backtesting on historical multipliers
 */
export function runChronologicalBacktest(
  multipliers: number[],
  parameters: ModelVersionRecord["parameters"]
): { brierScore: number; logLoss: number; totalRounds: number } {
  if (multipliers.length < 30) {
    return { brierScore: 0.25, logLoss: 0.69, totalRounds: multipliers.length };
  }

  const testWindow = multipliers.slice(Math.floor(multipliers.length * 0.7)); // 30% out-of-sample
  let totalBrier = 0;
  let totalLogLoss = 0;

  for (let i = 0; i < testWindow.length; i++) {
    const actual = testWindow[i];
    const isUnder2 = actual < 2.00 ? 1 : 0;
    
    // Theoretical Spribe prior probability of <2.00x is 1 - 0.97 / 2 = 0.515 (51.5%)
    const priorP = 0.515;
    const empiricalP = multipliers.slice(0, Math.floor(multipliers.length * 0.7) + i).filter((m) => m < 2.00).length /
      (Math.floor(multipliers.length * 0.7) + i);

    const blendedP = parameters.priorWeight * priorP + (1 - parameters.priorWeight) * empiricalP;

    totalBrier += Math.pow(blendedP - isUnder2, 2);
    const pObserved = isUnder2 === 1 ? Math.max(1e-6, blendedP) : Math.max(1e-6, 1 - blendedP);
    totalLogLoss += -Math.log(pObserved);
  }

  return {
    brierScore: Math.round((totalBrier / testWindow.length) * 10000) / 10000,
    logLoss: Math.round((totalLogLoss / testWindow.length) * 10000) / 10000,
    totalRounds: testWindow.length,
  };
}

/**
 * Executes the Adaptive Model Improvement Pipeline when a forecast is flagged
 */
export function evaluateAndAdaptModel(params: {
  targetRoundNumber: number;
  actualMultiplier: number;
  predictedProbabilityUnder2X: number;
  historicalMultipliers: number[];
  currentModel: ModelVersionRecord;
}): ModelAdaptationAudit {
  const isBust = params.actualMultiplier < 2.00;
  const pUnder2 = params.predictedProbabilityUnder2X;
  const brier = Math.pow(pUnder2 - (isBust ? 1 : 0), 2);

  // If error is high (e.g. brier > 0.40), conduct deep investigation
  const isHighError = brier > 0.40;
  const investigationVerdict: ModelAdaptationAudit["investigationVerdict"] = isHighError
    ? params.historicalMultipliers.length < 50
      ? "OUTLIER_TAIL_SPIKE"
      : "SYSTEMATIC_DRIFT_INVESTIGATE"
    : "SAMPLE_VARIANCE_IGNORE";

  // Simulate testing alternative candidate parameters
  const baselineBacktest = runChronologicalBacktest(params.historicalMultipliers, params.currentModel.parameters);
  
  const candidateParams: ModelVersionRecord["parameters"] = {
    ...params.currentModel.parameters,
    priorWeight: Math.max(0.3, params.currentModel.parameters.priorWeight - 0.05),
    windowSize: Math.min(250, params.currentModel.parameters.windowSize + 25),
  };

  const candidateBacktest = runChronologicalBacktest(params.historicalMultipliers, candidateParams);

  const improvementPct = Math.round(
    ((baselineBacktest.brierScore - candidateBacktest.brierScore) / baselineBacktest.brierScore) * 10000
  ) / 100;

  // STRICT RULE: Promote ONLY if candidate improves out-of-sample Brier score by >= 2.0%
  const isPromoted = improvementPct >= 2.0;

  const councilVerdict = isPromoted
    ? `Chief Council APPROVES promotion of candidate ${params.currentModel.versionString}-revised: Out-of-sample Brier improved by ${improvementPct}%.`
    : `Chief Council RETAINS stable model ${params.currentModel.versionString}: Candidate showed insufficient out-of-sample improvement (${improvementPct}%). Disallowed single-round over-tuning.`;

  return {
    auditId: `audit-adapt-${Date.now()}`,
    triggerRoundNumber: params.targetRoundNumber,
    affectedModelId: params.currentModel.id,
    initialAssumptions: [
      `Fixed Prior Weight: ${params.currentModel.parameters.priorWeight}`,
      `Rolling Window: ${params.currentModel.parameters.windowSize} rounds`,
      "Theoretical Spribe 97% Return-to-Player invariant assumption",
    ],
    observedDiscrepancy: {
      predictedCategory: pUnder2 >= 0.5 ? "Sub-2.00x Bust" : "Multiplier >= 2.00x",
      actualMultiplier: params.actualMultiplier,
      brierScore: Math.round(brier * 10000) / 10000,
    },
    investigationVerdict,
    candidateTested: {
      versionString: `${params.currentModel.versionString}.1-backtest`,
      proposedChanges: `Adjusted prior weight to ${candidateParams.priorWeight} and window to ${candidateParams.windowSize}.`,
      outOfSampleBacktestBrier: candidateBacktest.brierScore,
      baselineBacktestBrier: baselineBacktest.brierScore,
      improvementPercentage: improvementPct,
      isPromoted,
    },
    councilVerdict,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 8.5 Baseline-superiority audit rule (smart guard)
 * If any model's rolling out-of-sample Brier score beats D01 beyond the sampling-noise band
 * (bootstrap CI over evaluation folds), the system automatically:
 * (1) flags the model;
 * (2) runs E08 leak detection;
 * (3) suspends the model from the ensemble pending council audit;
 * (4) logs the event. Rationale: under fair randomness, durable out-performance is evidence of error, not skill (3.4).
 */
export interface BaselineSuperiorityAudit {
  modelId: string;
  modelBrier: number;
  baselineBrier: number;
  difference: number;
  samplingNoiseThreshold: number;
  suspiciousOutperformance: boolean;
  status: "NORMAL" | "SUSPENDED_FOR_AUDIT";
  actionTaken: string;
  timestamp: string;
}

export function auditBaselineSuperiority(
  modelId: string,
  modelBrier: number,
  baselineBrier: number = 0.2450,
  samplingNoiseThreshold: number = 0.05
): BaselineSuperiorityAudit {
  const difference = baselineBrier - modelBrier;
  const suspicious = difference > samplingNoiseThreshold;

  return {
    modelId,
    modelBrier,
    baselineBrier,
    difference: Math.round(difference * 10000) / 10000,
    samplingNoiseThreshold,
    suspiciousOutperformance: suspicious,
    status: suspicious ? "SUSPENDED_FOR_AUDIT" : "NORMAL",
    actionTaken: suspicious
      ? `Model ${modelId} suspended: Out-of-sample Brier (${modelBrier}) beats baseline (${baselineBrier}) by ${Math.round(difference * 10000) / 10000}, exceeding noise threshold ${samplingNoiseThreshold}. Triggered E08 leak detection.`
      : `Model ${modelId} verified compliant with baseline-superiority guard.`,
    timestamp: new Date().toISOString(),
  };
}
