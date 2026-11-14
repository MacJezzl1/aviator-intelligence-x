export type AgentDepartment =
  | "STATISTICAL"
  | "PATTERN"
  | "MATHEMATICAL"
  | "FORECAST"
  | "CRITIC"
  | "STRATEGIC"
  | "LIVE"
  | "RISK"
  | "RESEARCH"
  | "COUNCIL";

export interface AgentDefinition {
  id: string;
  name: string;
  department: AgentDepartment;
  specialization: string;
  defaultModel: string;
  executionPriority: number;
  isEnabled: boolean;
  calibrationScore: number;
}

// Complete registry of 100 specialized AI agents across all 10 departments
export const AGENT_REGISTRY: AgentDefinition[] = [
  // ==========================================
  // DEPARTMENT A: STATISTICAL INTELLIGENCE (15)
  // ==========================================
  { id: "stat-01", name: "Distro-Prime", department: "STATISTICAL", specialization: "Multiplier frequency distribution & histogram mapping", defaultModel: "statistical-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.89 },
  { id: "stat-02", name: "Param-X", department: "STATISTICAL", specialization: "Mean, median, and trimmed central tendency estimators", defaultModel: "statistical-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.92 },
  { id: "stat-03", name: "Var-Scan", department: "STATISTICAL", specialization: "Variance, standard deviation, and dispersion metrics", defaultModel: "statistical-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.87 },
  { id: "stat-04", name: "Percentile-99", department: "STATISTICAL", specialization: "Tail risk and extreme value percentiles (p90, p95, p99)", defaultModel: "statistical-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.84 },
  { id: "stat-05", name: "Skew-Watch", department: "STATISTICAL", specialization: "Skewness, kurtosis, and distributional asymmetry", defaultModel: "statistical-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.81 },
  { id: "stat-06", name: "Cond-Bayes", department: "STATISTICAL", specialization: "Conditional probability distribution given prior bust", defaultModel: "statistical-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.78 },
  { id: "stat-07", name: "SampleSize-Guard", department: "STATISTICAL", specialization: "Sample size adequacy & statistical power estimation", defaultModel: "statistical-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95 },
  { id: "stat-08", name: "Median-Tracker", department: "STATISTICAL", specialization: "Rolling median and robust location parameters", defaultModel: "statistical-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.90 },
  { id: "stat-09", name: "Bust-Frequency", department: "STATISTICAL", specialization: "Micro-crash (<1.20x) empirical rate analysis", defaultModel: "statistical-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.91 },
  { id: "stat-10", name: "High-Multiplier-Scope", department: "STATISTICAL", specialization: "Occurrence rates for multipliers exceeding 10.00x", defaultModel: "statistical-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.75 },
  { id: "stat-11", name: "Trimmed-Mean-Calc", department: "STATISTICAL", specialization: "Outlier-resistant 5% and 10% trimmed averages", defaultModel: "statistical-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.88 },
  { id: "stat-12", name: "Density-KDE", department: "STATISTICAL", specialization: "Kernel Density Estimation for multiplier probability curves", defaultModel: "statistical-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.83 },
  { id: "stat-13", name: "Window-Comparator", department: "STATISTICAL", specialization: "Comparative statistical shifts between rolling windows", defaultModel: "statistical-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.80 },
  { id: "stat-14", name: "Tail-Decay", department: "STATISTICAL", specialization: "Pareto tail decay exponent estimation", defaultModel: "statistical-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.79 },
  { id: "stat-15", name: "Aggregate-Stats", department: "STATISTICAL", specialization: "Holistic multi-window statistical synthesis", defaultModel: "statistical-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.86 },

  // ==========================================
  // DEPARTMENT B: PATTERN INTELLIGENCE (15)
  // ==========================================
  { id: "pat-01", name: "Sequence-Tracer", department: "PATTERN", specialization: "Sequential multiplier transitions and chain tracking", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.76 },
  { id: "pat-02", name: "Streak-Metric", department: "PATTERN", specialization: "Cold (<2x) and hot (>=2x) streak duration metrics", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.89 },
  { id: "pat-03", name: "False-Pattern-Hunter", department: "PATTERN", specialization: "Detection of apophenia and gambler's fallacy claims", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96 },
  { id: "pat-04", name: "Markov-Chain-Mapper", department: "PATTERN", specialization: "First-order Markov state transition matrix analysis", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.82 },
  { id: "pat-05", name: "Repetition-Detector", department: "PATTERN", specialization: "Exact or near-identical round multiplier repeats", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.88 },
  { id: "pat-06", name: "Rolling-Shift-Inspector", department: "PATTERN", specialization: "Structural breaks and distribution shift detection", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.80 },
  { id: "pat-07", name: "Anomaly-Flag", department: "PATTERN", specialization: "Z-score and IQR-based statistical anomaly isolation", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.87 },
  { id: "pat-08", name: "Randomness-Audit", department: "PATTERN", specialization: "Identification of pseudo-clustering vs true randomness", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94 },
  { id: "pat-09", name: "Window-20-Pattern", department: "PATTERN", specialization: "Micro-horizon pattern diagnostics (last 20 rounds)", defaultModel: "pattern-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.71 },
  { id: "pat-10", name: "Window-100-Pattern", department: "PATTERN", specialization: "Macro-horizon pattern diagnostics (last 100 rounds)", defaultModel: "pattern-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.79 },
  { id: "pat-11", name: "Alternation-Checker", department: "PATTERN", specialization: "High-low alternation test and parity inspection", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.85 },
  { id: "pat-12", name: "Cluster-Density", department: "PATTERN", specialization: "Local temporal clustering of extreme crash events", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.83 },
  { id: "pat-13", name: "Entropy-Analyzer", department: "PATTERN", specialization: "Shannon entropy of discretized round intervals", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.90 },
  { id: "pat-14", name: "Lag-Autocorr", department: "PATTERN", specialization: "Autocorrelation function (ACF) up to lag 10", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91 },
  { id: "pat-15", name: "Pattern-Debunker", department: "PATTERN", specialization: "Mathematical disproof of alleged predictive patterns", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97 },

  // ==========================================
  // DEPARTMENT C: MATHEMATICAL INTELLIGENCE (10)
  // ==========================================
  { id: "math-01", name: "Monte-Carlo-Sim", department: "MATHEMATICAL", specialization: "10,000-path Monte Carlo forward simulation", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93 },
  { id: "math-02", name: "Bayes-Conjugate", department: "MATHEMATICAL", specialization: "Dirichlet-Multinomial Bayesian posterior updates", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.91 },
  { id: "math-03", name: "Runs-Tester", department: "MATHEMATICAL", specialization: "Wald-Wolfowitz runs test for independent trials", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95 },
  { id: "math-04", name: "KS-Goodness", department: "MATHEMATICAL", specialization: "Kolmogorov-Smirnov goodness-of-fit to crash law", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94 },
  { id: "math-05", name: "Bootstrap-Resample", department: "MATHEMATICAL", specialization: "Non-parametric bootstrap confidence intervals (95% CI)", defaultModel: "math-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.89 },
  { id: "math-06", name: "Chi-Square-Fit", department: "MATHEMATICAL", specialization: "Pearson chi-square test across theoretical bins", defaultModel: "math-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92 },
  { id: "math-07", name: "Time-Series-Stationarity", department: "MATHEMATICAL", specialization: "Stationarity checks (Augmented Dickey-Fuller)", defaultModel: "math-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.85 },
  { id: "math-08", name: "Calibration-Error-ECE", department: "MATHEMATICAL", specialization: "Expected Calibration Error (ECE) metric computation", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96 },
  { id: "math-09", name: "Brier-Scorer", department: "MATHEMATICAL", specialization: "Multi-class Brier scoring & decomposition", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98 },
  { id: "math-10", name: "Out-Of-Sample-Split", department: "MATHEMATICAL", specialization: "Chronological train/test split verification", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97 },

  // ==========================================
  // DEPARTMENT D: FORECAST INTELLIGENCE (10)
  // ==========================================
  { id: "fore-01", name: "Prob-Distribution-Forecaster", department: "FORECAST", specialization: "Experimental probability distribution generator", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.72 },
  { id: "fore-02", name: "Exp-Smoothing-Baseline", department: "FORECAST", specialization: "Exponential smoothing benchmark forecaster", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.69 },
  { id: "fore-03", name: "Bayes-Prior-Forecaster", department: "FORECAST", specialization: "Bayesian prior regularized forecast horizon", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.75 },
  { id: "fore-04", name: "Uncertainty-Quantifier", department: "FORECAST", specialization: "Epistemic and aleatoric uncertainty boundary mapper", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.91 },
  { id: "fore-05", name: "Horizon-1-Estimator", department: "FORECAST", specialization: "Next-round (t+1) conditional probability estimator", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.70 },
  { id: "fore-06", name: "Horizon-5-Estimator", department: "FORECAST", specialization: "Multi-round (t+5) cumulative survival estimator", defaultModel: "forecast-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.65 },
  { id: "fore-07", name: "Calibration-Weighting", department: "FORECAST", specialization: "Calibration-based ensemble model weighting", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.83 },
  { id: "fore-08", name: "Assumption-Explainer", department: "FORECAST", specialization: "Formal explanation of underlying forecast assumptions", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92 },
  { id: "fore-09", name: "Immutable-Stamper", department: "FORECAST", specialization: "Cryptographic pre-outcome forecast storage stamping", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
  { id: "fore-10", name: "Null-Evidence-Guard", department: "FORECAST", specialization: "Triggering INSUFFICIENT EVIDENCE when models fail criteria", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98 },

  // ==========================================
  // DEPARTMENT E: INDEPENDENT CRITICS (10)
  // ==========================================
  { id: "crit-01", name: "Skeptic-Prime", department: "CRITIC", specialization: "Cross-departmental rigorous mathematical critique", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97 },
  { id: "crit-02", name: "Overfit-Challenger", department: "CRITIC", specialization: "Detection of overfitted parameterization on noise", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95 },
  { id: "crit-03", name: "SampleSize-Inquisitor", department: "CRITIC", specialization: "Challenging assertions made on sub-optimal sample sizes", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96 },
  { id: "crit-04", name: "Causation-Disprover", department: "CRITIC", specialization: "Challenging correlation confused with causation", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94 },
  { id: "crit-05", name: "Gamblers-Fallacy-Cop", department: "CRITIC", specialization: "Zero-tolerance enforcement against gambler's fallacy logic", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
  { id: "crit-06", name: "Falsification-Engineer", department: "CRITIC", specialization: "Formulating concrete Popperian falsification criteria", defaultModel: "critic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.93 },
  { id: "crit-07", name: "Leakage-Auditor", department: "CRITIC", specialization: "Auditing feature pipelines for future lookahead leakage", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98 },
  { id: "crit-08", name: "Certainty-Striker", department: "CRITIC", specialization: "Striking down manufactured certainty or claims of 99% accuracy", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },
  { id: "crit-09", name: "Baseline-Defender", department: "CRITIC", specialization: "Demanding proof that models outperform naive uniform baseline", defaultModel: "critic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92 },
  { id: "crit-10", name: "Veto-Advocate", department: "CRITIC", specialization: "Formal veto recommendations on uncalibrated assertions", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95 },

  // ==========================================
  // DEPARTMENT F: STRATEGIC INTELLIGENCE (10)
  // ==========================================
  { id: "strat-01", name: "Hypothesis-Generator", department: "STRATEGIC", specialization: "Formulation of alternative statistical hypotheses", defaultModel: "strategic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.82 },
  { id: "strat-02", name: "Anomaly-Investigator", department: "STRATEGIC", specialization: "Deep inspection of unusual high-multiplier clusters", defaultModel: "strategic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.84 },
  { id: "strat-03", name: "A/B-Experimenter", department: "STRATEGIC", specialization: "Designing out-of-sample split tests on windows", defaultModel: "strategic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.87 },
  { id: "strat-04", name: "Model-Comparator", department: "STRATEGIC", specialization: "Competitive scoring between baseline and Bayesian models", defaultModel: "strategic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.88 },
  { id: "strat-05", name: "Tail-Experimenter", department: "STRATEGIC", specialization: "Simulating extreme black swan multiplier impacts", defaultModel: "strategic-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.80 },
  { id: "strat-06", name: "House-Edge-Quant", department: "STRATEGIC", specialization: "Measuring mathematical drag of operator house edge over time", defaultModel: "strategic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96 },
  { id: "strat-07", name: "Variance-Tester", department: "STRATEGIC", specialization: "Variance-ratio tests for random walk dynamics", defaultModel: "strategic-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.83 },
  { id: "strat-08", name: "Window-Optimizer", department: "STRATEGIC", specialization: "Evaluation of optimal rolling observation horizons", defaultModel: "strategic-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.81 },
  { id: "strat-09", name: "Regime-Detector", department: "STRATEGIC", specialization: "Testing whether data generation regime has altered", defaultModel: "strategic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.86 },
  { id: "strat-10", name: "Research-Proposer", department: "STRATEGIC", specialization: "Proposing specific quantitative laboratory tests", defaultModel: "strategic-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.85 },

  // ==========================================
  // DEPARTMENT G: LIVE INTELLIGENCE (10)
  // ==========================================
  { id: "live-01", name: "Ingest-Validator", department: "LIVE", specialization: "Validating incoming live round format and multiplier bounds", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98 },
  { id: "live-02", name: "Timestamp-Normalizer", department: "LIVE", specialization: "UTC normalization and latency drift checking", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
  { id: "live-03", name: "Deduplication-Sentry", department: "LIVE", specialization: "Instant identification of duplicated round records", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },
  { id: "live-04", name: "Missing-Round-Detective", department: "LIVE", specialization: "Detection of gaps in sequential round IDs", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97 },
  { id: "live-05", name: "Feed-Health-Monitor", department: "LIVE", specialization: "Tracking connection reliability and packet loss", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96 },
  { id: "live-06", name: "Provable-Hash-Verifier", department: "LIVE", specialization: "Cryptographic SHA-256 HMAC verification in real-time", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },
  { id: "live-07", name: "Dashboard-Broadcaster", department: "LIVE", specialization: "Broadcasting validated rounds to UI terminal", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
  { id: "live-08", name: "Buffer-Manager", department: "LIVE", specialization: "Maintaining rolling memory buffer of latest 1,000 rounds", defaultModel: "live-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.98 },
  { id: "live-09", name: "Anomaly-Alert-Emitter", department: "LIVE", specialization: "Triggering live alerts for statistical outliers", defaultModel: "live-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91 },
  { id: "live-10", name: "Source-Attribution-Logger", department: "LIVE", specialization: "Tagging source authenticity (verified/demo/manual)", defaultModel: "live-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },

  // ==========================================
  // DEPARTMENT H: RISK INTELLIGENCE (10)
  // ==========================================
  { id: "risk-01", name: "Exposure-Analyst", department: "RISK", specialization: "Cumulative exposure and downside risk evaluation", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95 },
  { id: "risk-02", name: "Volatility-Meter", department: "RISK", specialization: "Dynamic volatility index calculation (0-100 scale)", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93 },
  { id: "risk-03", name: "Drawdown-Assessor", department: "RISK", specialization: "Maximum historical drawdown duration modeling", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94 },
  { id: "risk-04", name: "Bankroll-Sustainability", department: "RISK", specialization: "Simulation of fixed-fractional stake survival", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96 },
  { id: "risk-05", name: "Risk-Of-Ruin-Calculator", department: "RISK", specialization: "Mathematical risk-of-ruin equations under negative RTP", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
  { id: "risk-06", name: "Martingale-Warning-System", department: "RISK", specialization: "Demonstration of exponential escalation ruin", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },
  { id: "risk-07", name: "Safeguard-Notice-Writer", department: "RISK", specialization: "Mandatory non-gambling educational safety disclosures", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },
  { id: "risk-08", name: "Session-Limit-Monitor", department: "RISK", specialization: "User session duration and reality check triggers", defaultModel: "risk-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.95 },
  { id: "risk-09", name: "Loss-Chasing-Detector", department: "RISK", specialization: "Detection of user patterns indicating loss chasing", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94 },
  { id: "risk-10", name: "Ethical-Play-Custodian", department: "RISK", specialization: "Enforcing absolute ban on betting automation and signals", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },

  // ==========================================
  // DEPARTMENT I: RESEARCH INTELLIGENCE (5)
  // ==========================================
  { id: "res-01", name: "Literature-Synthesizer", department: "RESEARCH", specialization: "Peer-reviewed crash game and probability literature review", defaultModel: "research-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91 },
  { id: "res-02", name: "Methodology-Benchmarker", department: "RESEARCH", specialization: "Benchmarking new statistical algorithms against standard", defaultModel: "research-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.88 },
  { id: "res-03", name: "Provider-Efficacy-Auditor", department: "RESEARCH", specialization: "Auditing inference latency, cost, and availability", defaultModel: "research-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.93 },
  { id: "res-04", name: "Calibration-Curve-Mapper", department: "RESEARCH", specialization: "Plotting reliability diagrams and calibration curves", defaultModel: "research-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95 },
  { id: "res-05", name: "Model-Deprecator", department: "RESEARCH", specialization: "Recommending decommissioning of poorly calibrated agents", defaultModel: "research-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94 },

  // ==========================================
  // DEPARTMENT J: CHIEF INTELLIGENCE COUNCIL (5)
  // ==========================================
  { id: "council-01", name: "Chief-Statistician-Councilor", department: "COUNCIL", specialization: "Executive review of statistical evidence and sample adequacy", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98 },
  { id: "council-02", name: "Chief-Critic-Councilor", department: "COUNCIL", specialization: "Executive challenge and veto of unverified claims", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
  { id: "council-03", name: "Chief-Mathematician-Councilor", department: "COUNCIL", specialization: "Verification of formal proofs, simulations, and scoring", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98 },
  { id: "council-04", name: "Chief-Risk-Councilor", department: "COUNCIL", specialization: "Enforcement of responsible safety and uncertainty bounds", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00 },
  { id: "council-05", name: "Chief-Consensus-Chancellor", department: "COUNCIL", specialization: "Authoring the final authoritative 10-point consensus report", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99 },
];
