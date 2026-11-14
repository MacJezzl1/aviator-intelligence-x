import { calculateDescriptiveStats, calculateDistributionBins, analyzeStreaks, runWaldWolfowitzTest, type DescriptiveStats, type DistributionBin, type StreakAnalysis, type RandomnessHypothesisTest } from "./stats.ts";

export type ObservationWindow = 20 | 50 | 100 | 250 | 500 | 1000 | "ALL";

export interface WindowAnalysisReport {
  window: ObservationWindow;
  effectiveSampleSize: number;
  dataSource: string;
  calculatedAt: string;
  stats: DescriptiveStats;
  distributionBins: DistributionBin[];
  streaks: StreakAnalysis;
  randomnessTest: RandomnessHypothesisTest;
  rollingAverages: { roundIndex: number; rollingMean: number; rollingMedian: number }[];
  methodology: string;
  limitations: string[];
}

export function analyzeWindow(
  allMultipliers: number[],
  window: ObservationWindow,
  dataSource: string = "Verified Historical Database"
): WindowAnalysisReport {
  const n = allMultipliers.length;
  const sliceSize = window === "ALL" ? n : Math.min(n, window);
  const subset = allMultipliers.slice(Math.max(0, n - sliceSize));

  const stats = calculateDescriptiveStats(subset);
  const distributionBins = calculateDistributionBins(subset);
  const streaks = analyzeStreaks(subset);
  const randomnessTest = runWaldWolfowitzTest(subset);

  // Compute 10-step rolling average within this window
  const rollingAverages: { roundIndex: number; rollingMean: number; rollingMedian: number }[] = [];
  const step = Math.max(1, Math.floor(subset.length / 30));

  for (let i = 10; i <= subset.length; i += step) {
    const chunk = subset.slice(Math.max(0, i - 10), i);
    const sum = chunk.reduce((acc, v) => acc + v, 0);
    const sorted = [...chunk].sort((a, b) => a - b);
    const median = chunk.length % 2 === 0
      ? (sorted[chunk.length / 2 - 1] + sorted[chunk.length / 2]) / 2
      : sorted[Math.floor(chunk.length / 2)];

    rollingAverages.push({
      roundIndex: i,
      rollingMean: Number((sum / chunk.length).toFixed(2)),
      rollingMedian: Number(median.toFixed(2)),
    });
  }

  return {
    window,
    effectiveSampleSize: subset.length,
    dataSource,
    calculatedAt: new Date().toISOString(),
    stats,
    distributionBins,
    streaks,
    randomnessTest,
    rollingAverages,
    methodology: `Unbiased non-parametric calculation across the latest ${subset.length} sequential rounds.`,
    limitations: [
      "Provably fair random outcomes are mathematically memoryless; past sequences cannot guarantee future multipliers.",
      "Small sample sizes (<100 rounds) exhibit high sample variance and should not be used for long-term probability estimates.",
      "Extreme tail multipliers (>50x) occur with low frequency (~1.94%) and skew arithmetic mean values.",
    ],
  };
}
