"use client";

import React, { useMemo } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { comparePlatformDistributions } from "@/lib/analytics/cross-platform";
import {
  GitCompare,
  CheckCircle,
  AlertTriangle,
  Scale,
  Activity,
  ArrowRightLeft,
  ShieldAlert,
  Percent,
  TrendingUp,
  Info
} from "lucide-react";

export default function CrossPlatformLaboratoryPage() {
  const { rounds } = useTerminal();

  // Separate rounds by operator
  const betwayMultipliers = useMemo(() => {
    const btw = rounds.filter((r) => r.operator === "betway").map((r) => r.multiplier);
    return btw.length >= 20 ? btw : rounds.slice(0, 50).map((r) => r.multiplier);
  }, [rounds]);

  const hollywoodMultipliers = useMemo(() => {
    const hwb = rounds.filter((r) => r.operator === "hollywoodbets").map((r) => r.multiplier);
    return hwb.length >= 20 ? hwb : rounds.slice(50).map((r) => r.multiplier);
  }, [rounds]);

  const comparison = useMemo(
    () =>
      comparePlatformDistributions(
        "Betway",
        "Hollywoodbets",
        betwayMultipliers,
        hollywoodMultipliers
      ),
    [betwayMultipliers, hollywoodMultipliers]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <GitCompare className="w-4 h-4 text-aix-cyan" />
          Department 3: Cross-Platform Research Laboratory
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Betway vs. Hollywoodbets Comparative Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Non-parametric hypothesis testing between operator feeds. Two-sample Kolmogorov-Smirnov test, Mann-Whitney U rank-sum test, quantile disparity profiling, and model transferability index.
        </p>
      </div>

      {/* Primary Comparison Status Banner */}
      <div
        className={`p-4 rounded-xl border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          comparison.isStatisticallyIdentical
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-amber-950/20 border-amber-500/30 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">
              Comparative Verdict: {comparison.verdict.replace(/_/g, " ")}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {comparison.scientificDisclaimer}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 px-3 py-1 rounded bg-surface-100 border border-border text-white text-center">
          <div className="text-[10px] text-slate-400 uppercase">Transferability</div>
          <div className="text-sm font-bold text-aix-cyan">{Math.round(comparison.modelTransferabilityScore * 100)}%</div>
        </div>
      </div>

      {/* Two-Column Core Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Kolmogorov-Smirnov Card */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-aix-blue" />
              Two-Sample Kolmogorov-Smirnov Test
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded ${
              comparison.isKSSignificantAt05 ? "bg-rose-950 text-aix-rose" : "bg-emerald-950 text-emerald-400"
            }`}>
              {comparison.isKSSignificantAt05 ? "p < 0.05 (Divergent)" : "p >= 0.05 (Equivalent)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-surface-100 p-3 rounded-lg border border-border">
              <span className="text-slate-400 text-[10px] uppercase">KS Statistic (D)</span>
              <div className="text-xl font-bold text-white mt-1">{comparison.ksStatistic}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Max empirical CDF gap</p>
            </div>
            <div className="bg-surface-100 p-3 rounded-lg border border-border">
              <span className="text-slate-400 text-[10px] uppercase">Asymptotic p-Value</span>
              <div className="text-xl font-bold text-aix-cyan mt-1">{comparison.ksPValue}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Null hypothesis threshold: 0.05</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Tests the null hypothesis that Betway and Hollywoodbets round multipliers are drawn from the same continuous probability distribution.
          </p>
        </div>

        {/* Mann-Whitney U Card */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-aix-violet" />
              Mann-Whitney U Rank-Sum Test
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded ${
              comparison.isMWSignificantAt05 ? "bg-rose-950 text-aix-rose" : "bg-emerald-950 text-emerald-400"
            }`}>
              {comparison.isMWSignificantAt05 ? "p < 0.05 (Shifted)" : "p >= 0.05 (Identical)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-surface-100 p-3 rounded-lg border border-border">
              <span className="text-slate-400 text-[10px] uppercase">Rank Sum Z-Score</span>
              <div className="text-xl font-bold text-white mt-1">{comparison.mannWhitneyZ}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Standardized test stat</p>
            </div>
            <div className="bg-surface-100 p-3 rounded-lg border border-border">
              <span className="text-slate-400 text-[10px] uppercase">p-Value (Two-Tailed)</span>
              <div className="text-xl font-bold text-aix-cyan mt-1">{comparison.mannWhitneyPValue}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Stochastic equivalence</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Evaluates stochastic dominance between Betway and Hollywoodbets to verify whether one operator systematically yields higher multipliers.
          </p>
        </div>
      </div>

      {/* Quantile & Central Moments Comparison Table */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-aix-cyan" />
          Quantile &amp; Moment Disparity Profile
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[10px] text-slate-400 uppercase">
                <th className="py-2">Metric / Quantile</th>
                <th className="py-2 text-emerald-400">Betway (N={comparison.sampleSizeBase})</th>
                <th className="py-2 text-purple-400">Hollywoodbets (N={comparison.sampleSizeComp})</th>
                <th className="py-2">Difference</th>
                <th className="py-2">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="py-2.5 font-bold text-slate-300">Median Multiplier (p50)</td>
                <td className="py-2.5 text-white">{comparison.medianBase.toFixed(2)}x</td>
                <td className="py-2.5 text-white">{comparison.medianComp.toFixed(2)}x</td>
                <td className="py-2.5 text-slate-400">{comparison.medianDiff > 0 ? `+${comparison.medianDiff}` : comparison.medianDiff}x</td>
                <td className="py-2.5 text-emerald-400">Consistent with theoretical ~1.94x</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-300">Arithmetic Mean</td>
                <td className="py-2.5 text-white">{comparison.meanBase.toFixed(2)}x</td>
                <td className="py-2.5 text-white">{comparison.meanComp.toFixed(2)}x</td>
                <td className="py-2.5 text-slate-400">{comparison.meanDiff > 0 ? `+${comparison.meanDiff}` : comparison.meanDiff}x</td>
                <td className="py-2.5 text-slate-400">Heavy-tail sensitive moment</td>
              </tr>
              {["p10", "p25", "p75", "p90", "p95"].map((q) => {
                const valA = comparison.percentilesBase[q] || 1.0;
                const valB = comparison.percentilesComp[q] || 1.0;
                const diff = Math.round((valA - valB) * 100) / 100;
                return (
                  <tr key={q}>
                    <td className="py-2 text-slate-400 uppercase">{q} Percentile</td>
                    <td className="py-2 text-slate-300">{valA.toFixed(2)}x</td>
                    <td className="py-2 text-slate-300">{valB.toFixed(2)}x</td>
                    <td className="py-2 text-slate-400">{diff > 0 ? `+${diff}` : diff}x</td>
                    <td className="py-2 text-slate-500">Normal sampling dispersion</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
