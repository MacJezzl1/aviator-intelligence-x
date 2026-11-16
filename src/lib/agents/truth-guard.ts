/**
 * AVIATOR INTELLIGENCE X (AIX) — TRUTH GUARD MIDDLEWARE
 * Two-layer verification pipeline enforcing strict truth-locked outputs across all 100 AI agents:
 * Layer 1: Lexicon blocklist & prohibited marketing claim scanner (Truth Rules T1, T2)
 * Layer 2: Mathematical validity assertion (Truth Rules T3, T4, T5)
 */

export interface Layer1ValidationResult {
  isValid: boolean;
  violations: string[];
  sanitizedText: string;
}

export interface Layer2ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TruthGuardResult {
  isApproved: boolean;
  layer1: Layer1ValidationResult;
  layer2: Layer2ValidationResult;
  finalFindings: string;
}

export const FORBIDDEN_LEXICON = [
  "99% accuracy",
  "99% accurate",
  "guaranteed win",
  "guaranteed profit",
  "guaranteed payout",
  "sure win",
  "sure profit",
  "unbeatable signal",
  "unbeatable predictor",
  "never lose",
  "cannot lose",
  "hack spribe",
  "spribe predictor hack",
  "aviator predictor hack",
  "signal bot",
  "cheat code",
  "100% win",
  "risk free betting",
];

/**
 * Layer 1: Scans text for forbidden marketing and fake-accuracy claims.
 */
export function validateLayer1Lexicon(text: string): Layer1ValidationResult {
  const violations: string[] = [];
  let sanitizedText = text;

  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_LEXICON) {
    if (lower.includes(phrase)) {
      violations.push(phrase);
      const regex = new RegExp(phrase, "gi");
      sanitizedText = sanitizedText.replace(regex, "[TRUTH_GUARD_REDACTED_PROHIBITED_CLAIM]");
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    sanitizedText,
  };
}

/**
 * Layer 2: Validates mathematical integrity of probabilistic distributions and uncertainty bounds.
 */
export function validateLayer2Mathematics(params: {
  distribution?: {
    p_under_2x?: number;
    p_2x_to_5x?: number;
    p_5x_to_10x?: number;
    p_over_10x?: number;
    [key: string]: number | undefined;
  };
  uncertaintyScore?: number;
  sampleSize?: number;
}): Layer2ValidationResult {
  const errors: string[] = [];

  // 1. If distribution is provided, check probability bounds and sum
  if (params.distribution) {
    const keys = Object.keys(params.distribution);
    let sum = 0;
    for (const key of keys) {
      const val = params.distribution[key];
      if (val === undefined || typeof val !== "number" || isNaN(val)) {
        errors.push(`Invalid probability value for ${key}: ${val}`);
      } else if (val < 0 || val > 1) {
        errors.push(`Probability out of bounds [0, 1] for ${key}: ${val}`);
      } else {
        sum += val;
      }
    }

    if (keys.length > 0 && Math.abs(sum - 1.0) > 0.005) {
      errors.push(`Probabilities do not sum to 1.0 (Sum: ${sum.toFixed(4)})`);
    }
  }

  // 2. Uncertainty score must be positive for stochastic Aviator processes
  if (params.uncertaintyScore !== undefined) {
    if (params.uncertaintyScore <= 0) {
      errors.push("Uncertainty score cannot be zero or negative for stochastic crash trials.");
    }
    if (params.uncertaintyScore > 1.0) {
      errors.push(`Uncertainty score cannot exceed 1.0: ${params.uncertaintyScore}`);
    }
  }

  // 3. Sample size adequacy
  if (params.sampleSize !== undefined && params.sampleSize < 30) {
    errors.push("Sample size < 30 rounds: Must require INSUFFICIENT EVIDENCE status.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates full agent output through both Layer 1 and Layer 2 Truth Guard.
 */
export function evaluateTruthGuard(payload: {
  findings: string;
  distribution?: {
    p_under_2x?: number;
    p_2x_to_5x?: number;
    p_5x_to_10x?: number;
    p_over_10x?: number;
    [key: string]: number | undefined;
  };
  uncertaintyScore?: number;
  sampleSize?: number;
}): TruthGuardResult {
  const layer1 = validateLayer1Lexicon(payload.findings);
  const layer2 = validateLayer2Mathematics({
    distribution: payload.distribution,
    uncertaintyScore: payload.uncertaintyScore,
    sampleSize: payload.sampleSize,
  });

  const isApproved = layer1.isValid && layer2.isValid;
  const finalFindings = isApproved ? payload.findings : layer1.sanitizedText;

  return {
    isApproved,
    layer1,
    layer2,
    finalFindings,
  };
}
