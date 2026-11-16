/**
 * AVIATOR INTELLIGENCE X (AIX) — CROSS-PLATFORM COMPARATIVE ENGINE
 * Rigorous statistical tests comparing empirical multiplier distributions between operators.
 */

import { calculateDescriptiveStats, calculateDistributionBins } from "./stats.ts";

export interface CrossPlatformComparisonResult {
  basePlatformId: string;
  comparisonPlatformId: string;
  sampleSizeBase: number;
  sampleSizeComp: number;
  
  // Central tendency & moments comparisons
  medianBase: number;
  medianComp: number;
  medianDiff: number;
  meanBase: number;
  meanComp: number;
  meanDiff: number;
  
  // Two-sample Kolmogorov-Smirnov Test
  ksStatistic: number; // D = sup |F1(x) - F2(x)|
  ksPValue: number;
  isKSSignificantAt05: boolean; // if true, distributions differ significantly

  // Mann-Whitney U Test (Rank Sum)
  mannWhitneyU: number;
  mannWhitneyZ: number;
  mannWhitneyPValue: number;
  isMWSignificantAt05: boolean;

  // Chi-Square Divergence across theoretical bins
  chiSquareDivergence: number;
  
  // Percentile comparisons
  percentilesBase: Record<string, number>;
  percentilesComp: Record<string, number>;

  // Model Transferability & Overall Conclusion
  modelTransferabilityScore: number; // 0.0 to 1.0 (1.0 = identical distributions, safe to transfer)
  isStatisticallyIdentical: boolean;
  verdict: "EQUIVALENT_DISTRIBUTIONS" | "MARGINAL_DIVERGENCE" | "STATISTICALLY_DISTINCT" | "INSUFFICIENT_SAMPLE";
  scientificDisclaimer: string;
}

/**
 * Calculates Two-Sample Kolmogorov-Smirnov Statistic D and approximate p-value
 */
export function calculateTwoSampleKSTest(sampleA: number[], sampleB: number[]): { statistic: number; pValue: number } {
  const n1 = sampleA.length;
  const n2 = sampleB.length;
  if (n1 < 10 || n2 < 10) return { statistic: 0, pValue: 1.0 };

  const sortedA = [...sampleA].sort((a, b) => a - b);
  const sortedB = [...sampleB].sort((a, b) => a - b);

  let i = 0;
  let j = 0;
  let dMax = 0;

  while (i < n1 && j < n2) {
    const valA = sortedA[i];
    const valB = sortedB[j];
    let currentVal = Math.min(valA, valB);

    while (i < n1 && sortedA[i] <= currentVal) i++;
    while (j < n2 && sortedB[j] <= currentVal) j++;

    const cdfA = i / n1;
    const cdfB = j / n2;
    const diff = Math.abs(cdfA - cdfB);
    if (diff > dMax) dMax = diff;
  }

  // Asymptotic p-value approximation for Kolmogorov-Smirnov two-sample
  const en = Math.sqrt((n1 * n2) / (n1 + n2));
  const lambda = (en + 0.12 + 0.11 / en) * dMax;
  
  // Kolmogorov distribution CDF approximation
  let pValue = 0;
  for (let k = 1; k <= 100; k++) {
    const term = 2 * Math.pow(-1, k - 1) * Math.exp(-2 * k * k * lambda * lambda);
    pValue += term;
    if (Math.abs(term) < 1e-7) break;
  }
  pValue = Math.max(0, Math.min(1, pValue));

  return {
    statistic: Math.round(dMax * 10000) / 10000,
    pValue: Math.round(pValue * 10000) / 10000,
  };
}

/**
 * Calculates Mann-Whitney U Test (Two-sample rank-sum)
 */
export function calculateMannWhitneyUTest(sampleA: number[], sampleB: number[]): { u: number; z: number; pValue: number } {
  const n1 = sampleA.length;
  const n2 = sampleB.length;
  if (n1 < 10 || n2 < 10) return { u: 0, z: 0, pValue: 1.0 };

  interface RankedItem {
    val: number;
    group: "A" | "B";
    originalIdx: number;
  }

  const combined: RankedItem[] = [
    ...sampleA.map((val, idx) => ({ val, group: "A" as const, originalIdx: idx })),
    ...sampleB.map((val, idx) => ({ val, group: "B" as const, originalIdx: idx })),
  ].sort((a, b) => a.val - b.val);

  // Assign ranks with average ties
  const ranks = new Array<number>(combined.length);
  let idx = 0;
  while (idx < combined.length) {
    let next = idx;
    while (next < combined.length && combined[next].val === combined[idx].val) {
      next++;
    }
    const avgRank = (idx + 1 + next) / 2;
    for (let k = idx; k < next; k++) {
      ranks[k] = avgRank;
    }
    idx = next;
  }

  let r1 = 0;
  for (let k = 0; k < combined.length; k++) {
    if (combined[k].group === "A") r1 += ranks[k];
  }

  const u1 = r1 - (n1 * (n1 + 1)) / 2;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);

  const meanU = (n1 * n2) / 2;
  const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = stdU > 0 ? (u - meanU) / stdU : 0;

  // Two-tailed normal p-value approx
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  return {
    u: Math.round(u),
    z: Math.round(z * 100) / 100,
    pValue: Math.round(pValue * 10000) / 10000,
  };
}

function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Conducts full comprehensive Cross-Platform Comparison
 */
export function comparePlatformDistributions(
  basePlatformId: string,
  compPlatformId: string,
  multipliersBase: number[],
  multipliersComp: number[]
): CrossPlatformComparisonResult {
  const nBase = multipliersBase.length;
  const nComp = multipliersComp.length;

  if (nBase < 20 || nComp < 20) {
    return {
      basePlatformId,
      comparisonPlatformId: compPlatformId,
      sampleSizeBase: nBase,
      sampleSizeComp: nComp,
      medianBase: 0,
      medianComp: 0,
      medianDiff: 0,
      meanBase: 0,
      meanComp: 0,
      meanDiff: 0,
      ksStatistic: 0,
      ksPValue: 1.0,
      isKSSignificantAt05: false,
      mannWhitneyU: 0,
      mannWhitneyZ: 0,
      mannWhitneyPValue: 1.0,
      isMWSignificantAt05: false,
      chiSquareDivergence: 0,
      percentilesBase: {},
      percentilesComp: {},
      modelTransferabilityScore: 0.5,
      isStatisticallyIdentical: false,
      verdict: "INSUFFICIENT_SAMPLE",
      scientificDisclaimer: "Minimum sample size of N >= 20 required per platform to conduct rigorous non-parametric tests.",
    };
  }

  const statsBase = calculateDescriptiveStats(multipliersBase);
  const statsComp = calculateDescriptiveStats(multipliersComp);

  const ksTest = calculateTwoSampleKSTest(multipliersBase, multipliersComp);
  const mwTest = calculateMannWhitneyUTest(multipliersBase, multipliersComp);

  // Chi-Square bin divergence
  const binsBase = calculateDistributionBins(multipliersBase);
  const binsComp = calculateDistributionBins(multipliersComp);
  let chiSquareDiv = 0;
  for (let b = 0; b < binsBase.length; b++) {
    const o1 = binsBase[b].count;
    const o2 = binsComp[b].count;
    const e = (o1 + o2) / 2;
    if (e > 0) {
      chiSquareDiv += Math.pow(o1 - e, 2) / e + Math.pow(o2 - e, 2) / e;
    }
  }

  const isKSSig = ksTest.pValue < 0.05;
  const isMWSig = mwTest.pValue < 0.05;

  // Model transferability metric (1.0 = perfectly transferable)
  // Higher D statistic or lower p-value penalizes transferability
  const transferability = Math.max(0.1, Math.min(1.0, (1 - ksTest.statistic) * (1 - Math.min(1, chiSquareDiv / 50))));

  const isIdentical = !isKSSig && !isMWSig;

  const verdict = isIdentical
    ? "EQUIVALENT_DISTRIBUTIONS"
    : transferability >= 0.75
    ? "MARGINAL_DIVERGENCE"
    : "STATISTICALLY_DISTINCT";

  return {
    basePlatformId,
    comparisonPlatformId: compPlatformId,
    sampleSizeBase: nBase,
    sampleSizeComp: nComp,
    medianBase: statsBase.median,
    medianComp: statsComp.median,
    medianDiff: Math.round((statsBase.median - statsComp.median) * 100) / 100,
    meanBase: statsBase.mean,
    meanComp: statsComp.mean,
    meanDiff: Math.round((statsBase.mean - statsComp.mean) * 100) / 100,
    ksStatistic: ksTest.statistic,
    ksPValue: ksTest.pValue,
    isKSSignificantAt05: isKSSig,
    mannWhitneyU: mwTest.u,
    mannWhitneyZ: mwTest.z,
    mannWhitneyPValue: mwTest.pValue,
    isMWSignificantAt05: isMWSig,
    chiSquareDivergence: Math.round(chiSquareDiv * 100) / 100,
    percentilesBase: statsBase.percentiles,
    percentilesComp: statsComp.percentiles,
    modelTransferabilityScore: Math.round(transferability * 100) / 100,
    isStatisticallyIdentical: isIdentical,
    verdict,
    scientificDisclaimer: isIdentical
      ? "Observational testing finds no statistically significant difference between Betway and Hollywoodbets multiplier distributions (p > 0.05). Both platforms are consistent with identical Spribe B2B engine configurations."
      : "Observed statistical divergence may reflect sampling variance or localized client-seed clustering. Differences are observational rather than proven causal structural differences.",
  };
}
