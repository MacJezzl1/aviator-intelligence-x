"use client";

import React, { useMemo } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { analyzeWindow } from "@/lib/analytics/rolling";
import {
  BarChart3,
  Activity,
  Layers,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

export default function StatisticalResearchPage() {
  const { activeOperatorRounds, activeWindow, selectedOperator } = useTerminal();

  const multipliers = useMemo(() => activeOperatorRounds.map((r) => r.multiplier), [activeOperatorRounds]);
  const analysis = useMemo(() => analyzeWindow(multipliers, activeWindow), [multipliers, activeWindow]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4 text-aix-cyan" />
          Section 12: Statistical Research Division
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Comprehensive Statistical Moments &amp; Independence Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Non-LLM mathematical engine calculations. Moments of the observed multiplier distribution, trimmed central tendencies, extreme value percentiles, and Wald-Wolfowitz runs tests for sequential independence.
        </p>
      </div>

      {/* Central Tendency & Higher Moments Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Arithmetic Mean</span>
          <div className="text-2xl font-bold text-white mt-1">{analysis.stats.mean.toFixed(2)}x</div>
          <div className="text-[10px] text-slate-500 mt-1">Sample moment (raw)</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">5% Trimmed Mean</span>
          <div className="text-2xl font-bold text-aix-cyan mt-1">{(() => { const sorted = [...multipliers].sort((a,b) => a-b); const trim = Math.floor(sorted.length * 0.05); const trimmed = sorted.slice(trim, sorted.length - trim); return trimmed.length > 0 ? (trimmed.reduce((a,b) => a+b, 0) / trimmed.length).toFixed(2) : analysis.stats.mean.toFixed(2); })()}x</div>
          <div className="text-[10px] text-slate-500 mt-1">Outlier-resistant</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Empirical Median</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{analysis.stats.median.toFixed(2)}x</div>
          <div className="text-[10px] text-slate-500 mt-1">Theo: ~1.94x</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Standard Deviation</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{analysis.stats.stdDev.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Dispersion measure</div>
        </div>
      </div>

      {/* Detailed Quantiles Table */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4 font-mono text-xs">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-aix-blue" />
          Empirical Quantile Decomposition (N={analysis.effectiveSampleSize})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(analysis.stats.percentiles).map(([p, val]) => (
            <div key={p} className="p-3 bg-surface-100 rounded-lg border border-border text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold">{p}</span>
              <div className="text-lg font-bold text-white mt-1">{(val as number).toFixed(2)}x</div>
            </div>
          ))}
        </div>
      </div>

      {/* Runs Test for Sequential Independence */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-aix-cyan" />
            Wald-Wolfowitz Runs Test for Sequential Independence
          </h3>
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
            analysis.randomnessTest.isRandomAtAlpha05
              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-950 text-aix-rose border border-rose-500/30"
          }`}>
            {analysis.randomnessTest.isRandomAtAlpha05 ? "INDEPENDENCE CONFIRMED (p > 0.05)" : "VARIANCE DETECTED"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-100 p-3 rounded-lg border border-border">
            <span className="text-slate-500 text-[10px] uppercase">Z-Score Statistic</span>
            <div className="text-xl font-bold text-white mt-1">{analysis.randomnessTest.statistic.toFixed(2)}</div>
            <p className="text-[10px] text-slate-500 mt-1">Critical bounds: [-1.96, +1.96]</p>
          </div>
          <div className="bg-surface-100 p-3 rounded-lg border border-border">
            <span className="text-slate-500 text-[10px] uppercase">Two-Tailed p-Value</span>
            <div className="text-xl font-bold text-aix-cyan mt-1">{analysis.randomnessTest.pValueEstimate.toFixed(3)}</div>
            <p className="text-[10px] text-slate-500 mt-1">p &gt; 0.05 threshold</p>
          </div>
          <div className="bg-surface-100 p-3 rounded-lg border border-border">
            <span className="text-slate-500 text-[10px] uppercase">Hypothesis Conclusion</span>
            <div className="text-xs font-bold text-slate-200 mt-1">{analysis.randomnessTest.interpretation}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
