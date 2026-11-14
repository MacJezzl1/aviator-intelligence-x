"use client";

import React, { useState, useMemo } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { analyzeWindow } from "@/lib/analytics/rolling";
import { verifyProvableFairRound, type ProvableFairResult } from "@/lib/analytics/provable-fair";
import {
  FlaskConical,
  ShieldCheck,
  Calculator,
  Binary,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function LaboratoryPage() {
  const { rounds, activeWindow } = useTerminal();
  const multipliers = useMemo(() => rounds.map((r) => r.multiplier), [rounds]);
  const analysis = useMemo(() => analyzeWindow(multipliers, activeWindow), [multipliers, activeWindow]);

  // Provably Fair Sandbox State
  const [serverSeed, setServerSeed] = useState("d04b6d4b2e88a0b129759d5b03513b29d48b11c470a2408c6d3df363595509c2");
  const [clientSeed, setClientSeed] = useState("000000000000000000045f958f8b3c99a80e127392c64b584093952a65");
  const [nonce, setNonce] = useState(1);
  const [actualMultiplierInput, setActualMultiplierInput] = useState(2.15);
  const [verificationResult, setVerificationResult] = useState<ProvableFairResult | null>(null);

  // Monte Carlo Simulation State
  const [mcPaths, setMcPaths] = useState(5000);
  const [mcTarget, setMcTarget] = useState(2.00);
  const [mcResults, setMcResults] = useState<{
    totalPaths: number;
    targetCashout: number;
    hits: number;
    empiricalHitRate: number;
    theoreticalHitRate: number;
    empiricalExpectedReturn: number;
    theoreticalExpectedReturn: number;
    standardError: number;
  } | null>(null);
  const [isSimulatingMC, setIsSimulatingMC] = useState(false);

  const runMonteCarlo = () => {
    setIsSimulatingMC(true);
    setTimeout(() => {
      let hits = 0;
      for (let i = 0; i < mcPaths; i++) {
        const r = Math.random();
        // 3% instant crash
        if (r > 0.03) {
          const mult = 0.97 / (1 - r);
          if (mult >= mcTarget) {
            hits++;
          }
        }
      }
      const empiricalHitRate = Number(((hits / mcPaths) * 100).toFixed(2));
      const theoreticalHitRate = Number(((0.97 / mcTarget) * 100).toFixed(2));
      const empiricalExpectedReturn = Number(((hits * mcTarget) / mcPaths).toFixed(4));
      const se = Number((Math.sqrt((empiricalHitRate / 100 * (1 - empiricalHitRate / 100)) / mcPaths) * 100).toFixed(3));

      setMcResults({
        totalPaths: mcPaths,
        targetCashout: mcTarget,
        hits,
        empiricalHitRate,
        theoreticalHitRate,
        empiricalExpectedReturn,
        theoreticalExpectedReturn: 0.9700,
        standardError: se,
      });
      setIsSimulatingMC(false);
    }, 50);
  };

  const handleVerifyFairness = () => {
    const res = verifyProvableFairRound({
      serverSeed,
      clientSeed,
      nonce,
      actualMultiplier: Number(actualMultiplierInput),
    });
    setVerificationResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <FlaskConical className="w-4 h-4 text-aix-cyan" />
          Zero-LLM Independent Analytics
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Statistical Laboratory Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Deterministic mathematical calculations: moments, percentiles, hypothesis testing, runs tests, and cryptographic SHA-256 HMAC fairness verification.
        </p>
      </div>

      {/* Descriptive Statistics Grid */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-aix-blue" />
            Central Tendency, Dispersion &amp; Distribution Moments
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-aix-cyan border border-border">
            Window: {activeWindow} Rounds
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-surface-100 p-3 rounded border border-border">
            <span className="text-slate-400 text-[10px] uppercase">Arithmetic Mean</span>
            <div className="text-lg font-bold text-white mt-1">{analysis.stats.mean.toFixed(2)}x</div>
          </div>
          <div className="bg-surface-100 p-3 rounded border border-border">
            <span className="text-slate-400 text-[10px] uppercase">Median (p50)</span>
            <div className="text-lg font-bold text-aix-cyan mt-1">{analysis.stats.median.toFixed(2)}x</div>
          </div>
          <div className="bg-surface-100 p-3 rounded border border-border">
            <span className="text-slate-400 text-[10px] uppercase">Standard Deviation</span>
            <div className="text-lg font-bold text-slate-200 mt-1">{analysis.stats.stdDev.toFixed(2)}</div>
          </div>
          <div className="bg-surface-100 p-3 rounded border border-border">
            <span className="text-slate-400 text-[10px] uppercase">Variance</span>
            <div className="text-lg font-bold text-slate-200 mt-1">{analysis.stats.variance.toFixed(2)}</div>
          </div>
          <div className="bg-surface-100 p-3 rounded border border-border">
            <span className="text-slate-400 text-[10px] uppercase">Skewness</span>
            <div className="text-lg font-bold text-aix-violet mt-1">{analysis.stats.skewness.toFixed(2)}</div>
          </div>
          <div className="bg-surface-100 p-3 rounded border border-border">
            <span className="text-slate-400 text-[10px] uppercase">Excess Kurtosis</span>
            <div className="text-lg font-bold text-aix-amber mt-1">{analysis.stats.kurtosis.toFixed(2)}</div>
          </div>
        </div>

        {/* Percentiles Breakdown */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
            Empirical Percentiles (Tail Risk Diagnostics):
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 font-mono text-xs">
            {Object.entries(analysis.stats.percentiles).map(([key, val]) => (
              <div key={key} className="bg-surface-300 p-2.5 rounded border border-border/50 text-center">
                <span className="text-slate-500 text-[10px] uppercase block">{key}</span>
                <span className="text-white font-bold text-sm block mt-0.5">{val.toFixed(2)}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hypothesis Testing & Randomness Validation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wald-Wolfowitz Runs Test */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Binary className="w-4 h-4 text-aix-emerald" />
              Wald-Wolfowitz Runs Test for Independence
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-aix-emerald border border-emerald-500/30">
              {analysis.randomnessTest.isRandomAtAlpha05 ? "PASS: INDEPENDENT" : "CHECK REQUIRED"}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-slate-400">Z-Score Statistic:</span>
              <span className="text-white font-bold">{analysis.randomnessTest.statistic.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-slate-400">Estimated Two-Tailed p-value:</span>
              <span className="text-aix-cyan font-bold">{analysis.randomnessTest.pValueEstimate.toFixed(4)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-slate-400">Null Hypothesis ($H_0$):</span>
              <span className="text-slate-300 text-right max-w-xs">{analysis.randomnessTest.nullHypothesis}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-surface-100 p-3 rounded border border-border/60 font-mono">
            <strong>Conclusion:</strong> {analysis.randomnessTest.interpretation}
          </p>
        </div>

        {/* Streak Analysis */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-aix-rose" />
              Observed Streak Analysis (Busts vs Multipliers)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-400">
              Memoryless Check
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px]">Current Active Streak:</span>
              <div className="text-sm font-bold text-white mt-1 capitalize">
                {analysis.streaks.currentStreakLength} consecutive {analysis.streaks.currentStreakType}
              </div>
            </div>
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px]">Max Cold Run (&lt;2.0x):</span>
              <div className="text-sm font-bold text-aix-rose mt-1">
                {analysis.streaks.maxColdStreak} rounds
              </div>
            </div>
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px]">Max Hot Run (&ge;2.0x):</span>
              <div className="text-sm font-bold text-aix-emerald mt-1">
                {analysis.streaks.maxHotStreak} rounds
              </div>
            </div>
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px]">Max Micro-Busts (&lt;1.20x):</span>
              <div className="text-sm font-bold text-aix-amber mt-1">
                {analysis.streaks.maxConsecutiveUnder1_20} rounds
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Note: Streaks naturally emerge in Bernoulli trials of coin tosses and crash rounds. They do not increase the likelihood of the next outcome.
          </div>
        </div>
      </div>

      {/* Provably Fair Cryptographic HMAC-SHA256 Sandbox */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-aix-cyan" />
              Cryptographic Provably Fair HMAC-SHA256 Validator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify any Aviator game outcome independently by inputting the server seed, client seed, and round nonce.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-aix-emerald border border-emerald-500/30 font-semibold">
            HMAC-SHA256
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Server Seed (Hex):</label>
            <input
              type="text"
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Client Seed:</label>
            <input
              type="text"
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Round Nonce / Round Number:</label>
            <input
              type="number"
              value={nonce}
              onChange={(e) => setNonce(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Actual Observed Multiplier:</label>
            <input
              type="number"
              step="0.01"
              value={actualMultiplierInput}
              onChange={(e) => setActualMultiplierInput(parseFloat(e.target.value) || 1.0)}
              className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono text-xs"
            />
          </div>
        </div>

        <button
          onClick={handleVerifyFairness}
          className="px-4 py-2 bg-gradient-to-r from-aix-cyan to-aix-blue text-black font-bold font-mono text-xs rounded-lg shadow-glow-blue hover:opacity-95 transition-all"
        >
          Compute &amp; Verify Hash
        </button>

        {verificationResult && (
          <div className="bg-surface-100 p-4 rounded-lg border border-border space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-white">Verification Status:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  verificationResult.isValid
                    ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/40"
                    : "bg-rose-950/60 text-aix-rose border border-rose-500/40"
                }`}
              >
                {verificationResult.isValid ? "PROVABLY FAIR VERIFIED" : "HASH MISMATCH"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Computed Multiplier:</span>{" "}
                <strong className="text-aix-cyan">{verificationResult.computedMultiplier.toFixed(2)}x</strong>
              </div>
              <div>
                <span className="text-slate-400">Actual Multiplier:</span>{" "}
                <strong className="text-white">{verificationResult.actualMultiplier.toFixed(2)}x</strong>
              </div>
              <div className="sm:col-span-2 truncate">
                <span className="text-slate-400">HMAC-SHA256 Hash:</span>{" "}
                <span className="text-slate-300">{verificationResult.computedHash}</span>
              </div>
              <div>
                <span className="text-slate-400">52-bit Hex Subset:</span>{" "}
                <span className="text-aix-amber">{verificationResult.hexSubset}</span>
              </div>
              <div>
                <span className="text-slate-400">House Edge Instant Crash:</span>{" "}
                <span className={verificationResult.isInstantCrash ? "text-aix-rose" : "text-slate-300"}>
                  {verificationResult.isInstantCrash ? "TRUE (1.00x)" : "FALSE"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Department C: 10,000-Path Monte Carlo Simulation Laboratory */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Binary className="w-5 h-5 text-aix-violet" />
              Department C: Monte Carlo Simulation Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate up to 10,000 provably fair random crash trajectories to observe theoretical convergence and house edge drag.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-aix-violet border border-border font-semibold">
            STOCHASTIC ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Simulated Trajectories (N Paths):</label>
            <select
              value={mcPaths}
              onChange={(e) => setMcPaths(parseInt(e.target.value, 10))}
              className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono"
            >
              <option value="1000">1,000 Paths</option>
              <option value="2500">2,500 Paths</option>
              <option value="5000">5,000 Paths</option>
              <option value="10000">10,000 Paths</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Cashout Threshold:</label>
            <select
              value={mcTarget}
              onChange={(e) => setMcTarget(parseFloat(e.target.value))}
              className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono"
            >
              <option value="1.20">1.20x (Low Risk)</option>
              <option value="1.50">1.50x (Moderate Low)</option>
              <option value="2.00">2.00x (Even Money Target)</option>
              <option value="3.00">3.00x (Intermediate Target)</option>
              <option value="5.00">5.00x (High Target)</option>
              <option value="10.00">10.00x (Tail Target)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              disabled={isSimulatingMC}
              onClick={runMonteCarlo}
              className="w-full py-2 bg-gradient-to-r from-aix-violet to-aix-blue text-black font-bold font-mono text-xs rounded-lg shadow-glow-violet hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSimulatingMC ? "Computing Trajectories..." : `Execute ${mcPaths.toLocaleString()} Path Sim`}
            </button>
          </div>
        </div>

        {mcResults && (
          <div className="bg-surface-100 p-4 rounded-lg border border-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-white">
                Simulation Results: {mcResults.totalPaths.toLocaleString()} Iterations @ {mcResults.targetCashout.toFixed(2)}x Threshold
              </span>
              <span className="text-[10px] text-aix-cyan">
                Standard Error: &plusmn;{mcResults.standardError}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-surface-200 p-2.5 rounded border border-border/50">
                <span className="text-slate-400 text-[10px] uppercase block">Observed Hits:</span>
                <span className="text-white font-bold text-sm block mt-0.5">
                  {mcResults.hits.toLocaleString()} ({mcResults.empiricalHitRate}%)
                </span>
              </div>

              <div className="bg-surface-200 p-2.5 rounded border border-border/50">
                <span className="text-slate-400 text-[10px] uppercase block">Theoretical Hit Rate:</span>
                <span className="text-aix-cyan font-bold text-sm block mt-0.5">
                  {mcResults.theoreticalHitRate}%
                </span>
              </div>

              <div className="bg-surface-200 p-2.5 rounded border border-border/50">
                <span className="text-slate-400 text-[10px] uppercase block">Empirical Return E[R]:</span>
                <span className="text-aix-amber font-bold text-sm block mt-0.5">
                  {(mcResults.empiricalExpectedReturn * 100).toFixed(2)}%
                </span>
              </div>

              <div className="bg-surface-200 p-2.5 rounded border border-border/50">
                <span className="text-slate-400 text-[10px] uppercase block">House Edge Drag:</span>
                <span className="text-aix-rose font-bold text-sm block mt-0.5">
                  {(100 - mcResults.empiricalExpectedReturn * 100).toFixed(2)}% Loss
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-normal bg-surface-300 p-2.5 rounded border border-border/40">
              <strong>Mathematical Insight:</strong> As N increases toward infinity, empirical return converges asymptotically to exactly <strong>0.9700 (97% RTP)</strong>. No timing system, pattern heuristic, or streak filter can shift this mathematical boundary above 1.00.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
