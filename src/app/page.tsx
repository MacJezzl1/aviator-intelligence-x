"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useTerminal } from "@/context/TerminalContext";
import { analyzeWindow } from "@/lib/analytics/rolling.ts";
import { AviatorFlightCanvas } from "@/components/dashboard/AviatorFlightCanvas";
import {
  Activity,
  Cpu,
  Database,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  BarChart2,
  CheckCircle,
  HelpCircle,
  Layers,
  Users2
} from "lucide-react";

export default function OverviewPage() {
  const {
    rounds,
    activeOperatorRounds,
    selectedOperator,
    setSelectedOperator,
    activeWindow,
    agents,
    forecasts,
    latestCouncilReport,
    isOrchestrating,
    runCouncilTask,
    addRound
  } = useTerminal();

  const multipliers = useMemo(() => activeOperatorRounds.map((r) => r.multiplier), [activeOperatorRounds]);
  const analysis = useMemo(() => analyzeWindow(multipliers, activeWindow), [multipliers, activeWindow]);
  const latestRound = activeOperatorRounds[activeOperatorRounds.length - 1];
  const pendingForecast = forecasts.find((f) => f.evaluationStatus === "pending_outcome") || forecasts[0];

  const handleSimulateNextRound = () => {
    // Generate realistic provably fair multiplier
    // 3% chance of instant 1.00x crash
    const r = Math.random();
    let nextMult = 1.00;
    if (r > 0.03) {
      // Pareto inverse CDF: x = 0.97 / (1 - r)
      const raw = 0.97 / (1 - r);
      nextMult = Math.max(1.00, Number(raw.toFixed(2)));
    }
    addRound(nextMult, "demonstration");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="terminal-card rounded-xl p-5 border border-border/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-aix-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-aix-cyan animate-ping" />
              Live Terminal Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Aviator Intelligence <span className="text-aix-blue">X</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Quantitative multi-agent intelligence platform. Ingesting, testing, and evaluating provably fair Aviator multiplier streams across 100 specialized AI and statistical agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateNextRound}
              className="px-3.5 py-2 rounded-lg bg-surface-100 hover:bg-surface-50 border border-border text-xs font-mono font-semibold text-white flex items-center gap-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 text-aix-cyan" />
              Ingest Simulated Round
            </button>
            <button
              disabled={isOrchestrating}
              onClick={() => runCouncilTask()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-aix-blue to-aix-violet hover:opacity-95 text-xs font-mono font-bold text-black flex items-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isOrchestrating ? "animate-spin" : ""}`} />
              {isOrchestrating ? "Council Deliberating..." : "Convene 100-Agent Council"}
            </button>
          </div>
        </div>
      </div>

      {/* Operator Stream Selector & Calibrated Predictions Header */}
      <div className="terminal-card rounded-xl p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-surface-100 via-surface-200 to-surface-100">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            selectedOperator === "hollywoodbets" ? "bg-purple-500 animate-pulse" : selectedOperator === "betway" ? "bg-emerald-500 animate-pulse" : "bg-aix-blue"
          }`} />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Target Operator Analysis Feed:
            </div>
            <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
              <span>
                {selectedOperator === "hollywoodbets"
                  ? "HOLLYWOODBETS AVIATOR (Spribe B2B Engine)"
                  : selectedOperator === "betway"
                  ? "BETWAY AVIATOR (Spribe B2B Engine)"
                  : "CROSS-OPERATOR AGGREGATE (Hollywoodbets + Betway)"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-50 text-aix-cyan border border-aix-cyan/30 font-normal">
                {activeOperatorRounds.length} Rounds Analyzed
              </span>
            </div>
          </div>
        </div>

        {/* Quick Operator Switcher Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setSelectedOperator("hollywoodbets")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedOperator === "hollywoodbets"
                ? "bg-purple-950 text-purple-300 font-bold border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                : "bg-surface-100 text-slate-400 hover:text-white border border-border"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Hollywoodbets
          </button>
          <button
            onClick={() => setSelectedOperator("betway")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              selectedOperator === "betway"
                ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                : "bg-surface-100 text-slate-400 hover:text-white border border-border"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Betway
          </button>
          <button
            onClick={() => setSelectedOperator("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedOperator === "ALL"
                ? "bg-aix-blue text-black font-bold shadow-glow-blue"
                : "bg-surface-100 text-slate-400 hover:text-white border border-border"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Interactive Figma-grade Flight Curve Canvas */}
      <AviatorFlightCanvas
        onFlightCrash={(crashVal) => addRound(crashVal, "demonstration")}
      />

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Latest Multiplier</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-2xl font-mono font-bold ${(latestRound?.multiplier || 1) >= 10
                  ? "text-aix-amber"
                  : (latestRound?.multiplier || 1) >= 2
                    ? "text-aix-emerald"
                    : "text-aix-rose"
                }`}
            >
              {latestRound ? `${latestRound.multiplier.toFixed(2)}x` : "1.00x"}
            </span>
            <span className="text-[10px] font-mono text-slate-500">#{latestRound?.roundNumber}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            {latestRound?.sourceType.replace("_", " ").toUpperCase()}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Window Sample</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {analysis.effectiveSampleSize}
          </div>
          <div className="text-[10px] font-mono text-aix-cyan mt-1">
            WINDOW: {activeWindow} ROUNDS
          </div>
        </div>

        {/* Metric 3 */}
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Empirical Median</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {analysis.stats.median.toFixed(2)}x
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Mean: {analysis.stats.mean.toFixed(2)}x
          </div>
        </div>

        {/* Metric 4 */}
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Bust Rate (&lt;2.0x)</div>
          <div className="text-2xl font-mono font-bold text-aix-rose mt-1">
            {analysis.distributionBins.length > 0
              ? `${(
                analysis.distributionBins.slice(0, 3).reduce((a, b) => a + b.percentage, 0)
              ).toFixed(1)}%`
              : "51.5%"}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Theo: 51.5%
          </div>
        </div>

        {/* Metric 5 */}
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Agents</div>
          <div className="text-2xl font-mono font-bold text-aix-violet mt-1">
            {agents.filter((a) => a.isEnabled).length}/100
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            10 DEPARTMENTS
          </div>
        </div>

        {/* Metric 6 */}
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Runs Test Z</div>
          <div className="text-2xl font-mono font-bold text-aix-cyan mt-1">
            {analysis.randomnessTest.statistic.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-aix-emerald mt-1">
            {analysis.randomnessTest.isRandomAtAlpha05 ? "INDEPENDENT" : "VARIANCE"}
          </div>
        </div>
      </div>

      {/* Main Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Charts & Empirical Frequency (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribution Histogram Card */}
          <div className="terminal-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-aix-blue" />
                  Multiplier Distribution vs Theoretical Expectation (97% RTP)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between empirical sample frequencies and theoretical crash probability masses.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-300 border border-border">
                N={analysis.effectiveSampleSize}
              </span>
            </div>

            {/* Custom SVG Distribution Bars */}
            <div className="space-y-3 font-mono text-xs">
              {analysis.distributionBins.map((bin) => {
                const maxPct = 40;
                const barWidth = Math.min(100, (bin.percentage / maxPct) * 100);
                const theoWidth = Math.min(100, (bin.theoreticalPercentage / maxPct) * 100);

                return (
                  <div key={bin.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-semibold">{bin.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">
                          Observed: <strong className="text-white">{bin.percentage}%</strong> ({bin.count})
                        </span>
                        <span className="text-slate-500">
                          Theo: {bin.theoreticalPercentage}%
                        </span>
                        <span
                          className={`font-semibold ${bin.discrepancy > 0 ? "text-aix-cyan" : "text-aix-rose"
                            }`}
                        >
                          {bin.discrepancy > 0 ? `+${bin.discrepancy}%` : `${bin.discrepancy}%`}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-4 bg-surface-300 rounded overflow-hidden">
                      {/* Theoretical Marker */}
                      <div
                        className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-400/80 z-10"
                        style={{ left: `${theoWidth}%` }}
                        title={`Theoretical target: ${bin.theoreticalPercentage}%`}
                      />
                      {/* Observed Fill */}
                      <div
                        className="h-full bg-gradient-to-r from-aix-blue to-aix-violet rounded transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-400 border-dashed inline-block" />
                Dashed line indicates theoretical 97% RTP expectation
              </span>
              <Link href="/laboratory" className="text-aix-blue hover:underline flex items-center gap-1">
                Deep Laboratory Analysis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Rolling Averages Trend Card */}
          <div className="terminal-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-aix-cyan" />
                  Sequential Multiplier Stream & Rolling Trend
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sequential outcomes across latest rounds with 2.00x baseline reference.
                </p>
              </div>
            </div>

            {/* Quick Scatter / Line representation */}
            <div className="h-44 w-full bg-surface-300/60 rounded-lg p-3 relative flex items-end gap-1 overflow-x-auto border border-border/40">
              {/* 2.0x reference line */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-aix-rose/50 z-10 pointer-events-none flex items-center justify-end px-2"
                style={{ bottom: "25%" }}
              >
                <span className="text-[9px] font-mono text-aix-rose bg-surface-200/80 px-1 rounded">
                  2.00x Baseline
                </span>
              </div>

              {rounds.slice(-40).map((r, i) => {
                const heightPct = Math.min(95, Math.max(10, (r.multiplier / 10) * 100));
                const isWin = r.multiplier >= 2.0;
                return (
                  <div
                    key={r.id || i}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-surface-200 border border-border px-1.5 py-0.5 rounded text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                      #{r.roundNumber}: {r.multiplier.toFixed(2)}x
                    </div>
                    {/* Multiplier Bar */}
                    <div
                      className={`w-full rounded-t transition-all ${r.multiplier >= 10
                          ? "bg-aix-amber shadow-glow-blue"
                          : isWin
                            ? "bg-aix-emerald"
                            : "bg-aix-rose/70"
                        }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-aix-rose" /> &lt;2.0x (Bust)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-aix-emerald" /> 2.0x - 9.9x
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-aix-amber" /> &ge;10.0x
                </span>
              </span>
              <span>Showing last 40 rounds</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Council Chamber & Forecast Research (1 col) */}
        <div className="space-y-6">
          {/* Latest AI Council Verdict */}
          <div className="terminal-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-aix-violet animate-pulse" />
                <h3 className="font-bold text-white text-sm">Chief Intelligence Council</h3>
              </div>
              <Link href="/council" className="text-xs font-mono text-aix-blue hover:underline">
                View Chamber &rarr;
              </Link>
            </div>

            {latestCouncilReport ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Research Consensus:</span>
                  <p className="text-slate-200 mt-1 font-mono leading-relaxed bg-surface-100 p-2.5 rounded border border-border/60">
                    {latestCouncilReport.consensusSummary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-surface-100 p-2 rounded border border-border/40">
                    <span className="text-slate-400">Confidence:</span>
                    <div className="font-bold text-aix-cyan mt-0.5">
                      {(latestCouncilReport.confidenceLevel * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-surface-100 p-2 rounded border border-border/40">
                    <span className="text-slate-400">Uncertainty:</span>
                    <div className="font-bold text-aix-amber mt-0.5">
                      {(latestCouncilReport.uncertaintyLevel * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Executive Conclusion:</span>
                  <p className="text-slate-300 mt-1 leading-snug">
                    {latestCouncilReport.finalConclusion}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs space-y-3">
                <Users2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No council consensus generated for this session yet.</p>
                <button
                  disabled={isOrchestrating}
                  onClick={() => runCouncilTask()}
                  className="px-3 py-1.5 rounded bg-surface-100 hover:bg-surface-50 border border-border text-xs text-white font-mono"
                >
                  Convene Deliberation
                </button>
              </div>
            )}
          </div>

          {/* Current Calibrated Forecast Card */}
          <div className="terminal-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-aix-cyan" />
                <h3 className="font-bold text-white text-sm">Next Round Forecast Horizon</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-100 text-slate-400">
                Round #{rounds.length + 1}
              </span>
            </div>

            {pendingForecast ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-surface-100 p-2 rounded border border-border/40">
                    <span className="text-slate-400 text-[10px]">P(&lt;2.00x Bust):</span>
                    <div className="font-bold text-aix-rose text-sm mt-0.5">
                      {(pendingForecast.predictedDistribution.p_under_2x * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-surface-100 p-2 rounded border border-border/40">
                    <span className="text-slate-400 text-[10px]">P(2.00x - 5.00x):</span>
                    <div className="font-bold text-aix-emerald text-sm mt-0.5">
                      {(pendingForecast.predictedDistribution.p_2x_to_5x * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-surface-100 p-2 rounded border border-border/40">
                    <span className="text-slate-400 text-[10px]">P(5.00x - 10.00x):</span>
                    <div className="font-bold text-aix-cyan text-sm mt-0.5">
                      {(pendingForecast.predictedDistribution.p_5x_to_10x * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-surface-100 p-2 rounded border border-border/40">
                    <span className="text-slate-400 text-[10px]">P(&ge;10.00x):</span>
                    <div className="font-bold text-aix-amber text-sm mt-0.5">
                      {(pendingForecast.predictedDistribution.p_over_10x * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="bg-surface-300 p-2 rounded text-[11px] font-mono border border-border/50 text-slate-300">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Uncertainty Metric:</span>
                    <span className="text-white font-bold">
                      {(pendingForecast.uncertaintyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-aix-cyan to-aix-amber rounded-full"
                      style={{ width: `${pendingForecast.uncertaintyScore * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  &ldquo;{pendingForecast.councilAssessment}&rdquo;
                </p>

                <div className="pt-2 border-t border-border/60">
                  <Link
                    href="/forecasts"
                    className="w-full text-center block py-1.5 bg-surface-100 hover:bg-surface-50 border border-border rounded font-mono text-xs text-white"
                  >
                    View Brier Scores & Calibration Curves
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No pending forecast.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
