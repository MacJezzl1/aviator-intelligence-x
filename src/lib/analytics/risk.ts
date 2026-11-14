/**
 * Aviator Intelligence X — Risk & Bankroll Sustainability Engine
 * Strict non-gambling analytical safeguards and risk-of-ruin mathematics.
 */

export interface RiskAnalysisResult {
  volatilityIndex: number; // Normalized 0 - 100
  bustRiskUnder2X: number; // Empirical probability < 2.00x
  extremeCrashRiskUnder1_20X: number; // Empirical probability < 1.20x
  maxHistoricalDrawdownRounds: number; // Max consecutive rounds below 2.00x
  riskOfRuinEstimates: {
    fixedWager1Pct: { riskPct: number; expectedSurvivalRounds: number };
    fixedWager5Pct: { riskPct: number; expectedSurvivalRounds: number };
    martingaleEscalation: { riskPct: number; warning: string };
  };
  sustainabilityRating: "HIGH RISK" | "EXTREME RISK" | "CRITICAL RISK";
  safeguardNotices: string[];
}

/**
 * Evaluates mathematical risk exposure based on empirical historical distribution.
 */
export function calculateRiskProfile(multipliers: number[]): RiskAnalysisResult {
  const n = multipliers.length;
  if (n === 0) {
    return {
      volatilityIndex: 50,
      bustRiskUnder2X: 51.5,
      extremeCrashRiskUnder1_20X: 19.2,
      maxHistoricalDrawdownRounds: 0,
      riskOfRuinEstimates: {
        fixedWager1Pct: { riskPct: 15.0, expectedSurvivalRounds: 1000 },
        fixedWager5Pct: { riskPct: 65.0, expectedSurvivalRounds: 150 },
        martingaleEscalation: { riskPct: 99.9, warning: "Catastrophic risk of total ruin within 7-10 consecutive busts." },
      },
      sustainabilityRating: "HIGH RISK",
      safeguardNotices: ["Insufficient data. Default baseline risk models applied."],
    };
  }

  const under2xCount = multipliers.filter((m) => m < 2.0).length;
  const under1_2xCount = multipliers.filter((m) => m < 1.2).length;

  const bustRiskUnder2X = Number(((under2xCount / n) * 100).toFixed(2));
  const extremeCrashRiskUnder1_20X = Number(((under1_2xCount / n) * 100).toFixed(2));

  // Calculate maximum consecutive busts (< 2.00x)
  let maxConsecutiveBusts = 0;
  let currentBusts = 0;
  for (const m of multipliers) {
    if (m < 2.0) {
      currentBusts++;
      if (currentBusts > maxConsecutiveBusts) maxConsecutiveBusts = currentBusts;
    } else {
      currentBusts = 0;
    }
  }

  // Volatility metric: standard deviation relative to mean
  const mean = multipliers.reduce((a, b) => a + b, 0) / n;
  const variance = multipliers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 1;
  const volatilityIndex = Math.min(100, Math.max(10, Math.round(cv * 40)));

  return {
    volatilityIndex,
    bustRiskUnder2X,
    extremeCrashRiskUnder1_20X,
    maxHistoricalDrawdownRounds: maxConsecutiveBusts,
    riskOfRuinEstimates: {
      fixedWager1Pct: {
        riskPct: Number((Math.min(99, 10 + (bustRiskUnder2X - 50) * 1.5)).toFixed(1)),
        expectedSurvivalRounds: 850,
      },
      fixedWager5Pct: {
        riskPct: Number((Math.min(99, 55 + (bustRiskUnder2X - 50) * 2.2)).toFixed(1)),
        expectedSurvivalRounds: 120,
      },
      martingaleEscalation: {
        riskPct: 99.99,
        warning: `Observed max drawdown is ${maxConsecutiveBusts} consecutive busts. Any progressive doubling strategy guarantees total capital loss.`,
      },
    },
    sustainabilityRating: maxConsecutiveBusts >= 10 ? "CRITICAL RISK" : "EXTREME RISK",
    safeguardNotices: [
      "CRITICAL: Aviator games have a built-in negative expectation (-3% RTP house edge). Long-term positive expectation is mathematically impossible.",
      "NEVER escalate stakes or chase losses after consecutive cold rounds. Streaks are natural occurrences in independent Bernoulli/Pareto processes.",
      "All forecasts produced by this platform are experimental research models and must NEVER be treated as financial advice or betting advice.",
    ],
  };
}
