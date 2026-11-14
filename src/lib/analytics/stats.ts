/**
 * Aviator Intelligence X — Core Statistical Engine
 * 100% Independent of LLMs. Pure mathematical calculations.
 */

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  variance: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface DistributionBin {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  theoreticalPercentage: number;
  discrepancy: number;
}

export interface StreakAnalysis {
  currentStreakType: "cold" | "hot";
  currentStreakLength: number;
  maxColdStreak: number; // Consecutive < 2.00x
  maxHotStreak: number;  // Consecutive >= 2.00x
  consecutiveUnder1_20: number;
  maxConsecutiveUnder1_20: number;
}

export interface RandomnessHypothesisTest {
  testName: string;
  statistic: number;
  pValueEstimate: number;
  nullHypothesis: string;
  isRandomAtAlpha05: boolean;
  interpretation: string;
}

/**
 * Calculates complete descriptive statistics for an array of multipliers.
 */
export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  const n = values.length;
  if (n === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      variance: 0,
      stdDev: 0,
      skewness: 0,
      kurtosis: 0,
      min: 0,
      max: 0,
      percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 },
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Median
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Variance & higher moments
  let sumSqDiff = 0;
  let sumCubeDiff = 0;
  let sumQuadDiff = 0;

  for (let i = 0; i < n; i++) {
    const diff = sorted[i] - mean;
    sumSqDiff += diff * diff;
    sumCubeDiff += diff * diff * diff;
    sumQuadDiff += diff * diff * diff * diff;
  }

  const variance = n > 1 ? sumSqDiff / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Skewness & Kurtosis
  const skewness = (stdDev > 0 && n > 2)
    ? (n / ((n - 1) * (n - 2))) * (sumCubeDiff / Math.pow(stdDev, 3))
    : 0;

  const kurtosis = (stdDev > 0 && n > 3)
    ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * (sumQuadDiff / Math.pow(stdDev, 4)) - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3))
    : 0;

  const getPercentile = (p: number): number => {
    const index = (p / 100) * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (upper >= n) return sorted[n - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    count: n,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(2)),
    variance: Number(variance.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    skewness: Number(skewness.toFixed(4)),
    kurtosis: Number(kurtosis.toFixed(4)),
    min: sorted[0],
    max: sorted[n - 1],
    percentiles: {
      p10: Number(getPercentile(10).toFixed(2)),
      p25: Number(getPercentile(25).toFixed(2)),
      p50: Number(getPercentile(50).toFixed(2)),
      p75: Number(getPercentile(75).toFixed(2)),
      p90: Number(getPercentile(90).toFixed(2)),
      p95: Number(getPercentile(95).toFixed(2)),
      p99: Number(getPercentile(99).toFixed(2)),
    },
  };
}

/**
 * Calculates frequency distribution into standard Aviator risk bins.
 * Theoretical percentages assume 97% RTP (3% house edge): P(X >= x) = 0.97 / x.
 */
export function calculateDistributionBins(values: number[]): DistributionBin[] {
  const n = values.length;
  if (n === 0) return [];

  // Theoretical probability mass for [min, max)
  // P(a <= X < b) = P(X >= a) - P(X >= b) = (0.97/a) - (0.97/b)
  // For X < 1.00: 0
  // For 1.00 <= X < 1.20: 0.03 (instant house edge crash) + (0.97/1.0 - 0.97/1.2) = 0.03 + 0.1617 = 19.17%
  const binsConfig = [
    { label: "1.00x - 1.20x", min: 1.00, max: 1.20, theoPct: 19.17 },
    { label: "1.20x - 1.50x", min: 1.20, max: 1.50, theoPct: 16.17 },
    { label: "1.50x - 2.00x", min: 1.50, max: 2.00, theoPct: 16.16 },
    { label: "2.00x - 5.00x", min: 2.00, max: 5.00, theoPct: 29.10 },
    { label: "5.00x - 10.00x", min: 5.00, max: 10.00, theoPct: 9.70 },
    { label: "10.00x - 50.00x", min: 10.00, max: 50.00, theoPct: 7.76 },
    { label: "50.00x+", min: 50.00, max: Infinity, theoPct: 1.94 },
  ];

  return binsConfig.map((b) => {
    const count = values.filter((v) => v >= b.min && (b.max === Infinity ? true : v < b.max)).length;
    const percentage = Number(((count / n) * 100).toFixed(2));
    const discrepancy = Number((percentage - b.theoPct).toFixed(2));
    return {
      label: b.label,
      min: b.min,
      max: b.max,
      count,
      percentage,
      theoreticalPercentage: b.theoPct,
      discrepancy,
    };
  });
}

/**
 * Analyzes streaks of consecutive busts or wins.
 */
export function analyzeStreaks(multipliers: number[]): StreakAnalysis {
  if (multipliers.length === 0) {
    return {
      currentStreakType: "cold",
      currentStreakLength: 0,
      maxColdStreak: 0,
      maxHotStreak: 0,
      consecutiveUnder1_20: 0,
      maxConsecutiveUnder1_20: 0,
    };
  }

  let maxCold = 0;
  let maxHot = 0;
  let maxUnder120 = 0;

  let currentCold = 0;
  let currentHot = 0;
  let currentUnder120 = 0;

  for (let i = 0; i < multipliers.length; i++) {
    const m = multipliers[i];
    if (m < 2.00) {
      currentCold++;
      currentHot = 0;
      if (currentCold > maxCold) maxCold = currentCold;
    } else {
      currentHot++;
      currentCold = 0;
      if (currentHot > maxHot) maxHot = currentHot;
    }

    if (m < 1.20) {
      currentUnder120++;
      if (currentUnder120 > maxUnder120) maxUnder120 = currentUnder120;
    } else {
      currentUnder120 = 0;
    }
  }

  // Determine current streak from the tail
  const last = multipliers[multipliers.length - 1];
  let curType: "cold" | "hot" = last < 2.00 ? "cold" : "hot";
  let curLen = 0;
  for (let i = multipliers.length - 1; i >= 0; i--) {
    const isCold = multipliers[i] < 2.00;
    if ((curType === "cold" && isCold) || (curType === "hot" && !isCold)) {
      curLen++;
    } else {
      break;
    }
  }

  return {
    currentStreakType: curType,
    currentStreakLength: curLen,
    maxColdStreak: maxCold,
    maxHotStreak: maxHot,
    consecutiveUnder1_20: currentUnder120,
    maxConsecutiveUnder1_20: maxUnder120,
  };
}

/**
 * Runs Wald-Wolfowitz runs test for sequence randomness above/below median.
 */
export function runWaldWolfowitzTest(multipliers: number[]): RandomnessHypothesisTest {
  const n = multipliers.length;
  if (n < 20) {
    return {
      testName: "Wald-Wolfowitz Runs Test",
      statistic: 0,
      pValueEstimate: 1.0,
      nullHypothesis: "Outcomes occur independently and identically distributed.",
      isRandomAtAlpha05: true,
      interpretation: "Sample size too small (< 20) for statistical significance.",
    };
  }

  const sorted = [...multipliers].sort((a, b) => a - b);
  const median = sorted[Math.floor(n / 2)];

  // Convert to binary: 1 if >= median, 0 if < median
  const binary: number[] = multipliers.map((v) => (v >= median ? 1 : 0));
  let n1 = 0; // count of 1s
  let n0 = 0; // count of 0s
  let runs = 1;

  for (let i = 0; i < n; i++) {
    if (binary[i] === 1) n1++;
    else n0++;
    if (i > 0 && binary[i] !== binary[i - 1]) {
      runs++;
    }
  }

  const expectedRuns = (2 * n1 * n0) / n + 1;
  const variance = (2 * n1 * n0 * (2 * n1 * n0 - n)) / (n * n * (n - 1));
  const stdDev = Math.sqrt(variance);

  const zScore = stdDev > 0 ? (runs - expectedRuns) / stdDev : 0;
  // Two-tailed p-value approximation from Z-score
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const isRandom = pValue >= 0.05;

  return {
    testName: "Wald-Wolfowitz Runs Test",
    statistic: Number(zScore.toFixed(4)),
    pValueEstimate: Number(pValue.toFixed(4)),
    nullHypothesis: "Sequential outcomes are independent (no clustering or alternating patterns).",
    isRandomAtAlpha05: isRandom,
    interpretation: isRandom
      ? `Sequence matches random independence (p=${pValue.toFixed(4)} >= 0.05). Historical streaks do not imply future outcomes.`
      : `Deviation from random sequence detected (p=${pValue.toFixed(4)} < 0.05). Likely temporary variance or clustering in sample.`,
  };
}

/**
 * Standard Normal Cumulative Distribution Function (error function approximation).
 */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}
