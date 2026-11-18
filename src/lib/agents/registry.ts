/**
 * AVIATOR INTELLIGENCE X (AIX) — 100-AGENT INTELLIGENCE REGISTRY
 * Exactly 10 specialized departments with 10 logical AI agents each (100 agents total).
 */

export type AgentDepartment =
  | "BETWAY_RESEARCH"
  | "HOLLYWOODBETS_RESEARCH"
  | "CROSS_PLATFORM_RESEARCH"
  | "MATHEMATICAL"
  | "PATTERN_RESEARCH"
  | "FORECAST_RESEARCH"
  | "CRITIC"
  | "SIMULATION_RESEARCH"
  | "RISK"
  | "COUNCIL";

export type ExecutionClass = "CODE" | "HYB" | "LLM";

export interface AgentDefinition {
  id: string;
  name: string;
  department: AgentDepartment;
  specialization: string;
  defaultModel: string;
  executionPriority: number;
  isEnabled: boolean;
  calibrationScore: number;
  executionClass: ExecutionClass;
}

export const AGENT_REGISTRY: AgentDefinition[] = [
  // ==========================================================================
  // DEPARTMENT 1: BETWAY RESEARCH (10 Agents — 9 CODE, 1 LLM)
  // ==========================================================================
  { id: "btw-01", name: "BTW-Distro-Mapper", department: "BETWAY_RESEARCH", specialization: "Betway historical multiplier frequency distribution & histogram mapping", defaultModel: "betway-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "btw-02", name: "BTW-Moments-Estimator", department: "BETWAY_RESEARCH", specialization: "Betway mean, median, standard deviation and tail moment estimators", defaultModel: "betway-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93, executionClass: "CODE" },
  { id: "btw-03", name: "BTW-Bust-Tracker", department: "BETWAY_RESEARCH", specialization: "Betway instant crash (1.00x) and sub-1.20x micro-crash empirical rate tracker", defaultModel: "betway-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94, executionClass: "CODE" },
  { id: "btw-04", name: "BTW-Feed-Integrity", department: "BETWAY_RESEARCH", specialization: "Betway authorized stream latency, round ordering, and timestamp sanity check", defaultModel: "betway-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "CODE" },
  { id: "btw-05", name: "BTW-Rolling-Window-50", department: "BETWAY_RESEARCH", specialization: "Short-horizon rolling window statistical diagnostics on Betway stream", defaultModel: "betway-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.88, executionClass: "CODE" },
  { id: "btw-06", name: "BTW-Rolling-Window-500", department: "BETWAY_RESEARCH", specialization: "Macro-horizon long-term parameter convergence analysis on Betway dataset", defaultModel: "betway-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "btw-07", name: "BTW-Anomaly-Detector", department: "BETWAY_RESEARCH", specialization: "Detection of statistical anomalies and outlier multiplier clusters on Betway", defaultModel: "betway-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.89, executionClass: "CODE" },
  { id: "btw-08", name: "BTW-Calibration-Monitor", department: "BETWAY_RESEARCH", specialization: "Platform-specific model calibration monitoring and Brier score tracking on Betway", defaultModel: "betway-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.90, executionClass: "CODE" },
  { id: "btw-09", name: "BTW-Sample-Adequacy", department: "BETWAY_RESEARCH", specialization: "Evaluating statistical power and minimum effective sample size for Betway tests", defaultModel: "betway-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "CODE" },
  { id: "btw-10", name: "BTW-Research-Reporter", department: "BETWAY_RESEARCH", specialization: "Synthesizing independent Betway research findings for the Chief Council", defaultModel: "betway-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 2: HOLLYWOODBETS RESEARCH (10 Agents — 9 CODE, 1 LLM)
  // ==========================================================================
  { id: "hwb-01", name: "HWB-Distro-Mapper", department: "HOLLYWOODBETS_RESEARCH", specialization: "Hollywoodbets multiplier empirical distribution and tail mass estimation", defaultModel: "hwb-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "hwb-02", name: "HWB-Moments-Estimator", department: "HOLLYWOODBETS_RESEARCH", specialization: "Hollywoodbets robust location estimators and interquartile dispersion", defaultModel: "hwb-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93, executionClass: "CODE" },
  { id: "hwb-03", name: "HWB-Bust-Tracker", department: "HOLLYWOODBETS_RESEARCH", specialization: "Hollywoodbets micro-crash (<1.20x) and sub-2.00x bust frequency analysis", defaultModel: "hwb-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95, executionClass: "CODE" },
  { id: "hwb-04", name: "HWB-Feed-Integrity", department: "HOLLYWOODBETS_RESEARCH", specialization: "Hollywoodbets data feed validation, gap detection, and deduplication", defaultModel: "hwb-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "CODE" },
  { id: "hwb-05", name: "HWB-Rolling-Window-50", department: "HOLLYWOODBETS_RESEARCH", specialization: "Rolling 50-round volatility and cold streak monitoring on Hollywoodbets", defaultModel: "hwb-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.87, executionClass: "CODE" },
  { id: "hwb-06", name: "HWB-Rolling-Window-500", department: "HOLLYWOODBETS_RESEARCH", specialization: "Longitudinal parameter stability and distribution convergence on Hollywoodbets", defaultModel: "hwb-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "hwb-07", name: "HWB-Anomaly-Detector", department: "HOLLYWOODBETS_RESEARCH", specialization: "Identification of unusual multiplier sequences and variance spikes on Hollywoodbets", defaultModel: "hwb-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.88, executionClass: "CODE" },
  { id: "hwb-08", name: "HWB-Calibration-Monitor", department: "HOLLYWOODBETS_RESEARCH", specialization: "Tracking forecast error metrics and Brier score evolution on Hollywoodbets", defaultModel: "hwb-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "hwb-09", name: "HWB-Sample-Adequacy", department: "HOLLYWOODBETS_RESEARCH", specialization: "Sample size verification and power analysis for Hollywoodbets hypotheses", defaultModel: "hwb-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "CODE" },
  { id: "hwb-10", name: "HWB-Research-Reporter", department: "HOLLYWOODBETS_RESEARCH", specialization: "Comprehensive Hollywoodbets platform research dossier preparation", defaultModel: "hwb-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.93, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 3: CROSS-PLATFORM RESEARCH (10 Agents — 8 CODE, 1 HYB, 1 LLM)
  // ==========================================================================
  { id: "cross-01", name: "KS-TwoSample-Auditor", department: "CROSS_PLATFORM_RESEARCH", specialization: "Kolmogorov-Smirnov two-sample test for divergence between Betway and Hollywoodbets", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "CODE" },
  { id: "cross-02", name: "MannWhitney-Rank-Examiner", department: "CROSS_PLATFORM_RESEARCH", specialization: "Mann-Whitney U rank-sum test for stochastic dominance between operator feeds", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95, executionClass: "CODE" },
  { id: "cross-03", name: "ChiSquare-Divergence-Assessor", department: "CROSS_PLATFORM_RESEARCH", specialization: "Multi-bin Pearson chi-square test across theoretical crash categories", defaultModel: "cross-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.94, executionClass: "CODE" },
  { id: "cross-04", name: "Percentile-Disparity-Profiler", department: "CROSS_PLATFORM_RESEARCH", specialization: "Comparative quantile analysis (p10, p50, p90, p99) between operators", defaultModel: "cross-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "cross-05", name: "Transferability-Scorer", department: "CROSS_PLATFORM_RESEARCH", specialization: "Computing mathematical model transferability index across different platforms", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93, executionClass: "CODE" },
  { id: "cross-06", name: "Data-Completeness-Auditor", department: "CROSS_PLATFORM_RESEARCH", specialization: "Comparative audit of missing rounds, latency, and sample completeness", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "CODE" },
  { id: "cross-07", name: "RNG-Implementation-Investigator", department: "CROSS_PLATFORM_RESEARCH", specialization: "Verifying whether both platforms utilize the shared Spribe certified cluster", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "CODE" },
  { id: "cross-08", name: "Observational-Disclaimer-Guard", department: "CROSS_PLATFORM_RESEARCH", specialization: "Enforcing clear labeling of observational findings vs causal claims", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "CODE" },
  { id: "cross-09", name: "Cross-Calibration-Comparator", department: "CROSS_PLATFORM_RESEARCH", specialization: "Comparing model calibration curves (ECE) between Betway and Hollywoodbets", defaultModel: "cross-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "HYB" },
  { id: "cross-10", name: "Cross-Platform-Chancellor", department: "CROSS_PLATFORM_RESEARCH", specialization: "Authoring cross-operator synthesis reports for Chief Council deliberation", defaultModel: "cross-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 4: MATHEMATICAL INTELLIGENCE (10 Agents — 9 CODE, 1 HYB)
  // ==========================================================================
  { id: "math-01", name: "Monte-Carlo-Engine", department: "MATHEMATICAL", specialization: "10,000-path forward stochastic trajectory simulation", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95, executionClass: "CODE" },
  { id: "math-02", name: "Bayes-Conjugate-Updater", department: "MATHEMATICAL", specialization: "Dirichlet-Multinomial Bayesian posterior updates on crash categories", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93, executionClass: "HYB" },
  { id: "math-03", name: "Runs-Independence-Tester", department: "MATHEMATICAL", specialization: "Wald-Wolfowitz runs test for trial-by-trial sequential independence", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "CODE" },
  { id: "math-04", name: "KS-Goodness-Of-Fit", department: "MATHEMATICAL", specialization: "One-sample Kolmogorov-Smirnov test against Spribe 97% crash distribution", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "CODE" },
  { id: "math-05", name: "Bootstrap-Resampler", department: "MATHEMATICAL", specialization: "Non-parametric bootstrap confidence interval estimation (95% CI)", defaultModel: "math-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "math-06", name: "Stationarity-ADF-Tester", department: "MATHEMATICAL", specialization: "Augmented Dickey-Fuller unit-root test for time-series stationarity", defaultModel: "math-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.89, executionClass: "CODE" },
  { id: "math-07", name: "ECE-Metric-Calculator", department: "MATHEMATICAL", specialization: "Expected Calibration Error (ECE) and Maximum Calibration Error calculation", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "CODE" },
  { id: "math-08", name: "MultiClass-Brier-Scorer", department: "MATHEMATICAL", specialization: "Multi-category Brier score decomposition into reliability and resolution", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "CODE" },
  { id: "math-09", name: "LogLoss-Evaluator", department: "MATHEMATICAL", specialization: "Strict proper scoring rule log-loss calculation for probability forecasts", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "CODE" },
  { id: "math-10", name: "Out-Of-Sample-Splitter", department: "MATHEMATICAL", specialization: "Strict chronological train/validation splitting without lookahead leakage", defaultModel: "math-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "CODE" },

  // ==========================================================================
  // DEPARTMENT 5: HISTORICAL PATTERN RESEARCH (10 Agents — 7 CODE, 1 HYB, 2 LLM)
  // ==========================================================================
  { id: "pat-01", name: "Sequence-Tracer", department: "PATTERN_RESEARCH", specialization: "Tracking sequential state transitions across discrete multiplier bands", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.85, executionClass: "CODE" },
  { id: "pat-02", name: "Streak-Duration-Profiler", department: "PATTERN_RESEARCH", specialization: "Geometric distribution analysis of consecutive sub-2.00x bust streaks", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "pat-03", name: "Apophenia-Disprover", department: "PATTERN_RESEARCH", specialization: "Mathematical disproof of perceived patterns resulting from human apophenia", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "LLM" },
  { id: "pat-04", name: "Markov-Matrix-Builder", department: "PATTERN_RESEARCH", specialization: "First and second order Markov transition probability matrices", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.88, executionClass: "CODE" },
  { id: "pat-05", name: "Exact-Repeat-Inspector", department: "PATTERN_RESEARCH", specialization: "Detection and probability calculation of exact multiplier repetitions", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "pat-06", name: "Rolling-Shift-Detector", department: "PATTERN_RESEARCH", specialization: "CUSUM and structural change-point detection across rolling windows", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.86, executionClass: "CODE" },
  { id: "pat-07", name: "Pseudo-Cluster-Classifier", department: "PATTERN_RESEARCH", specialization: "Poisson process dispersion test distinguishing true Poisson from clustering", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93, executionClass: "HYB" },
  { id: "pat-08", name: "Autocorr-Lag-Auditor", department: "PATTERN_RESEARCH", specialization: "Autocorrelation function (ACF) from lag 1 through lag 25", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.94, executionClass: "CODE" },
  { id: "pat-09", name: "Information-Entropy-Meter", department: "PATTERN_RESEARCH", specialization: "Shannon entropy of discretized round intervals vs maximum theoretical entropy", defaultModel: "pattern-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "pat-10", name: "Pattern-Evidence-Evaluator", department: "PATTERN_RESEARCH", specialization: "Separating descriptive historical summaries from predictive claims", defaultModel: "pattern-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 6: FORECAST RESEARCH (10 Agents — 8 CODE, 2 LLM)
  // ==========================================================================
  { id: "fore-01", name: "Calibrated-Distro-Builder", department: "FORECAST_RESEARCH", specialization: "Generating fully calibrated 4-bin experimental probability distributions", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.88, executionClass: "CODE" },
  { id: "fore-02", name: "Exponential-Smoothing-Baseline", department: "FORECAST_RESEARCH", specialization: "Exponential smoothing and moving-average reference baselines", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.82, executionClass: "CODE" },
  { id: "fore-03", name: "Bayes-Prior-Regularizer", department: "FORECAST_RESEARCH", specialization: "Regularizing forecasts with theoretical Spribe 97% prior distribution", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.89, executionClass: "CODE" },
  { id: "fore-04", name: "Uncertainty-Boundary-Mapper", department: "FORECAST_RESEARCH", specialization: "Separating aleatoric random uncertainty from epistemic sample uncertainty", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94, executionClass: "CODE" },
  { id: "fore-05", name: "Horizon-1-Forecaster", department: "FORECAST_RESEARCH", specialization: "Immediate next-round (t+1) conditional probability estimation", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.86, executionClass: "CODE" },
  { id: "fore-06", name: "Horizon-5-Cumulative-Scope", department: "FORECAST_RESEARCH", specialization: "Multi-round (t+5) cumulative survival and drawdown probability bounds", defaultModel: "forecast-core", executionPriority: 3, isEnabled: true, calibrationScore: 0.80, executionClass: "CODE" },
  { id: "fore-07", name: "Calibration-Weighted-Ensemble", department: "FORECAST_RESEARCH", specialization: "Weighting ensemble models by out-of-sample Brier calibration history", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "fore-08", name: "Explicit-Assumption-Documenter", department: "FORECAST_RESEARCH", specialization: "Writing unambiguous formal documentation of model assumptions", defaultModel: "forecast-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.95, executionClass: "LLM" },
  { id: "fore-09", name: "Pre-Outcome-Snapshot-Locker", department: "FORECAST_RESEARCH", specialization: "Cryptographically stamping immutable forecast snapshots before round outcome", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "CODE" },
  { id: "fore-10", name: "Null-Evidence-Enforcer", department: "FORECAST_RESEARCH", specialization: "Enforcing INSUFFICIENT EVIDENCE — NO RELIABLE FORECAST on weak data", defaultModel: "forecast-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 7: INDEPENDENT CRITICS (10 Agents — 1 CODE, 1 HYB, 8 LLM)
  // ==========================================================================
  { id: "crit-01", name: "Chief-Skeptic", department: "CRITIC", specialization: "Adversarial cross-examination of all statistical conclusions and assumptions", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "LLM" },
  { id: "crit-02", name: "Overfit-Inquisitor", department: "CRITIC", specialization: "Detecting model over-parameterization and noise fitting on short windows", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "LLM" },
  { id: "crit-03", name: "SampleSize-Challenger", department: "CRITIC", specialization: "Challenging assertions made with inadequate sample size or statistical power", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "LLM" },
  { id: "crit-04", name: "Causation-Fallacy-Striker", department: "CRITIC", specialization: "Striking down correlation mistaken for causation across operator datasets", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "LLM" },
  { id: "crit-05", name: "Gamblers-Fallacy-Prosecutor", department: "CRITIC", specialization: "Zero-tolerance enforcement against 'due for a win' and recovery myths", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
  { id: "crit-06", name: "Falsification-Criterion-Auditor", department: "CRITIC", specialization: "Requiring empirical falsification criteria for every accepted hypothesis", defaultModel: "critic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.95, executionClass: "LLM" },
  { id: "crit-07", name: "Data-Leakage-Sentry", department: "CRITIC", specialization: "Strict auditing for lookahead data leakage in model evaluation pipelines", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "CODE" },
  { id: "crit-08", name: "Certainty-Manufacture-Terminator", department: "CRITIC", specialization: "Terminating manufactured certainty or claims of 99% prediction rates", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
  { id: "crit-09", name: "Naive-Baseline-Defender", department: "CRITIC", specialization: "Rejecting models that fail to beat the naive theoretical Spribe baseline", defaultModel: "critic-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.94, executionClass: "HYB" },
  { id: "crit-10", name: "Formal-Veto-Warrantor", department: "CRITIC", specialization: "Issuing binding vetoes against unverified or mathematically suspect reports", defaultModel: "critic-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 8: SIMULATION RESEARCH (10 Agents — 8 CODE, 1 HYB, 1 LLM)
  // ==========================================================================
  { id: "sim-01", name: "Sim-Observation-Divergence-Scope", department: "SIMULATION_RESEARCH", specialization: "Quantifying distribution divergence between Monte Carlo simulation and live data", defaultModel: "sim-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94, executionClass: "CODE" },
  { id: "sim-02", name: "Pareto-MLE-Fitter", department: "SIMULATION_RESEARCH", specialization: "Maximum Likelihood Estimation of Pareto shape parameter alpha on empirical data", defaultModel: "sim-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.93, executionClass: "CODE" },
  { id: "sim-03", name: "RTP-Sensitivity-Analyst", department: "SIMULATION_RESEARCH", specialization: "Testing model sensitivity under RTP parameter shifts from 95% to 99%", defaultModel: "sim-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.91, executionClass: "CODE" },
  { id: "sim-04", name: "Bootstrap-Resample-Validator", department: "SIMULATION_RESEARCH", specialization: "Validating empirical bootstrap resampling convergence against live feeds", defaultModel: "sim-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "sim-05", name: "Simulation-Bias-Auditor", department: "SIMULATION_RESEARCH", specialization: "Identifying algorithmic biases in pseudo-random number generator algorithms", defaultModel: "sim-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "CODE" },
  { id: "sim-06", name: "Model-Drift-Inspector", department: "SIMULATION_RESEARCH", specialization: "Detecting statistical drift between historical calibrations and new rounds", defaultModel: "sim-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.89, executionClass: "CODE" },
  { id: "sim-07", name: "Seed-Reproducibility-Verifier", department: "SIMULATION_RESEARCH", specialization: "Ensuring 100% deterministic reproducibility of simulation run seeds", defaultModel: "sim-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "CODE" },
  { id: "sim-08", name: "Confidence-Band-Mapper", department: "SIMULATION_RESEARCH", specialization: "Estimating 95% and 99% confidence bands around simulated parameters", defaultModel: "sim-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.92, executionClass: "CODE" },
  { id: "sim-09", name: "Instant-Crash-Rate-Calibrator", department: "SIMULATION_RESEARCH", specialization: "Validating the empirical consistency of the 3.03% (1 in 33) instant crash rate", defaultModel: "sim-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "HYB" },
  { id: "sim-10", name: "Synthetic-Experiment-Architect", department: "SIMULATION_RESEARCH", specialization: "Designing controlled synthetic stress-test scenarios for model validation", defaultModel: "sim-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.93, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 9: RISK INTELLIGENCE (10 Agents — 10 LLM)
  // ==========================================================================
  { id: "risk-01", name: "Volatility-Index-Quant", department: "RISK", specialization: "Dynamic computation of session volatility index on a 0-100 quantitative scale", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.95, executionClass: "LLM" },
  { id: "risk-02", name: "Drawdown-Duration-Modeler", department: "RISK", specialization: "Modeling maximum drawdown run lengths and cold streak duration probabilities", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.94, executionClass: "LLM" },
  { id: "risk-03", name: "Bankroll-Sustainability-Sim", department: "RISK", specialization: "Simulating bankroll survival horizons under fixed-fractional stake sizing (1% to 5%)", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "LLM" },
  { id: "risk-04", name: "Risk-Of-Ruin-Deriver", department: "RISK", specialization: "Formal mathematical risk-of-ruin derivations under negative expectation (-3% RTP)", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "LLM" },
  { id: "risk-05", name: "Martingale-Ruin-Disprover", department: "RISK", specialization: "Mathematical proof of inevitable catastrophic ruin under exponential stake doubling", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
  { id: "risk-06", name: "Micro-Cashout-Trap-Analyst", department: "RISK", specialization: "Quantitative analysis of the 1.04x cashout trap (25-win breakeven hurdle)", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
  { id: "risk-07", name: "TakeProfit-StopLoss-Architect", department: "RISK", specialization: "Formulating strict session stopping rules (Take-Profit +15%, Stop-Loss -15%)", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "LLM" },
  { id: "risk-08", name: "Session-Duration-Sentry", department: "RISK", specialization: "Enforcing session time horizon caps (30-45 min) to prevent cognitive fatigue", defaultModel: "risk-core", executionPriority: 2, isEnabled: true, calibrationScore: 0.97, executionClass: "LLM" },
  { id: "risk-09", name: "Loss-Chasing-Interceptor", department: "RISK", specialization: "Flagging and warning against stake escalation following unexpected bust runs", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.96, executionClass: "LLM" },
  { id: "risk-10", name: "Responsible-Safety-Custodian", department: "RISK", specialization: "Enforcing mandatory non-gambling educational safety disclosures across all outputs", defaultModel: "risk-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },

  // ==========================================================================
  // DEPARTMENT 10: CHIEF INTELLIGENCE COUNCIL (10 Agents — 10 LLM)
  // ==========================================================================
  { id: "council-01", name: "Chief-Statistician-Councilor", department: "COUNCIL", specialization: "Executive review of statistical evidence, sample power, and distribution validity", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "LLM" },
  { id: "council-02", name: "Chief-Critic-Councilor", department: "COUNCIL", specialization: "Executive challenge and veto of unverified assertions or manufactured certainty", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
  { id: "council-03", name: "Chief-Mathematician-Councilor", department: "COUNCIL", specialization: "Verification of formal proofs, Monte Carlo outputs, and scoring decompositions", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "LLM" },
  { id: "council-04", name: "Chief-Risk-Councilor", department: "COUNCIL", specialization: "Executive enforcement of responsible analytics and uncertainty disclosure", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
  { id: "council-05", name: "Chief-Betway-Councilor", department: "COUNCIL", specialization: "Lead reviewer for Betway historical data, feed health, and platform models", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "LLM" },
  { id: "council-06", name: "Chief-Hollywoodbets-Councilor", department: "COUNCIL", specialization: "Lead reviewer for Hollywoodbets dataset integrity and comparative findings", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "LLM" },
  { id: "council-07", name: "Chief-CrossPlatform-Councilor", department: "COUNCIL", specialization: "Evaluating statistical equivalence and transferability between platforms", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.97, executionClass: "LLM" },
  { id: "council-08", name: "Chief-Simulation-Councilor", department: "COUNCIL", specialization: "Evaluating synthetic simulations against verified empirical game records", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.98, executionClass: "LLM" },
  { id: "council-09", name: "Chief-Calibration-Chancellor", department: "COUNCIL", specialization: "Auditing Brier scores and ECE metrics across all active forecasting models", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 0.99, executionClass: "LLM" },
  { id: "council-10", name: "Chief-Consensus-Chancellor", department: "COUNCIL", specialization: "Authoring the final authoritative 10-point consensus report and stating uncertainty", defaultModel: "council-core", executionPriority: 1, isEnabled: true, calibrationScore: 1.00, executionClass: "LLM" },
];

/**
 * Filter helpers for execution class partitioning (Rule T3, Section 6.3)
 */
export function getCodeOnlyAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.executionClass === "CODE");
}

export function getHybridAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.executionClass === "HYB");
}

export function getLlmAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.executionClass === "LLM");
}

export function getAgentsByDepartment(dept: AgentDepartment): AgentDefinition[] {
  return AGENT_REGISTRY.filter((a) => a.department === dept);
}
