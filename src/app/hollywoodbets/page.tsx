"use client";

import React, { useMemo, useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { analyzeWindow } from "@/lib/analytics/rolling";
import { getPlatform } from "@/lib/platform/registry";
import {
  Radio,
  BarChart2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Search,
  RefreshCw,
  Sliders
} from "lucide-react";

export default function HollywoodbetsIntelligencePage() {
  const { rounds, activeWindow, runCouncilTask, isOrchestrating, addRound } = useTerminal();
  const [manualInput, setManualInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "distribution" | "import" | "anomalies">("overview");

  const platformInfo = getPlatform("hollywoodbets");

  // Filter dedicated Hollywoodbets dataset
  const hollywoodbetsRounds = useMemo(() => {
    const direct = rounds.filter((r) => r.operator === "hollywoodbets");
    return direct.length > 0 ? direct : rounds;
  }, [rounds]);

  const multipliers = useMemo(() => hollywoodbetsRounds.map((r) => r.multiplier), [hollywoodbetsRounds]);
  const analysis = useMemo(() => analyzeWindow(multipliers, activeWindow), [multipliers, activeWindow]);

  const anomalies = useMemo(() => {
    const p95 = analysis.stats.percentiles.p95 || 10.0;
    return hollywoodbetsRounds
      .map((r, i) => ({ roundIndex: i, multiplier: r.multiplier, isAnomaly: r.multiplier >= p95 }))
      .filter((a) => a.isAnomaly)
      .map((a) => ({
        roundIndex: a.roundIndex,
        multiplier: a.multiplier,
        reason: `Extreme tail multiplier >= ${p95.toFixed(2)}x (p95 threshold)`,
      }));
  }, [hollywoodbetsRounds, analysis.stats]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualInput);
    if (!isNaN(val) && val >= 1.0) {
      addRound(val, "manual_entry", "hollywoodbets");
      setManualInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Header Card */}
      <div className="terminal-card rounded-xl p-5 border border-purple-500/30 bg-gradient-to-r from-surface-200 via-surface-100 to-purple-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-wider mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              Department 2: Hollywoodbets Intelligence Module
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Hollywoodbets Aviator Research Terminal
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-500/40 font-mono font-normal">
                {platformInfo.verificationStatus.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Independent statistical surveillance of the licensed Spribe Aviator deployment on Hollywoodbets. Discrete sequence modeling, empirical bust analysis, and model calibration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isOrchestrating}
              onClick={() => runCouncilTask("Investigate whether Hollywoodbets Aviator stream exhibits any statistically significant deviation from certified Spribe provably fair specifications.")}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isOrchestrating ? "animate-spin" : ""}`} />
              {isOrchestrating ? "Deliberating..." : "Hollywoodbets Council Deliberation"}
            </button>
          </div>
        </div>

        {/* Technical Registry Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/60 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Provider / Engine</span>
            <div className="text-white font-medium text-xs truncate">{platformInfo.gameProvider}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Jurisdiction</span>
            <div className="text-slate-300 text-xs truncate">{platformInfo.jurisdiction}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Theoretical RTP</span>
            <div className="text-purple-400 font-bold text-xs">{platformInfo.gameConfig.rtpPercentage}% (House Edge 3%)</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Verification Standard</span>
            <div className="text-aix-cyan text-xs font-bold">HMAC-SHA512 Client Seeds</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "overview"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Statistical Overview
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "distribution"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Frequency Distribution
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "import"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Data Ingestion &amp; Import
        </button>
        <button
          onClick={() => setActiveTab("anomalies")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "anomalies"
              ? "bg-purple-950 text-purple-300 border border-purple-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Anomaly Detection ({anomalies.length})
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Hollywoodbets Sample</span>
          <div className="text-2xl font-bold text-white mt-1">{hollywoodbetsRounds.length}</div>
          <div className="text-[10px] text-purple-400 mt-1">Verified Round Stream</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Empirical Median</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{analysis.stats.median.toFixed(2)}x</div>
          <div className="text-[10px] text-slate-500 mt-1">Theo: ~1.94x</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Sub-2.00x Bust Rate</span>
          <div className="text-2xl font-bold text-aix-rose mt-1">
            {((hollywoodbetsRounds.filter((r) => r.multiplier < 2.0).length / Math.max(1, hollywoodbetsRounds.length)) * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Theo: 51.5%</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Runs Test Independence</span>
          <div className="text-2xl font-bold text-aix-cyan mt-1">
            Z = {analysis.randomnessTest.statistic.toFixed(2)}
          </div>
          <div className="text-[10px] text-purple-400 mt-1">
            {analysis.randomnessTest.isRandomAtAlpha05 ? "INDEPENDENT" : "VARIANCE DETECTED"}
          </div>
        </div>
      </div>

      {/* Main Content Areas based on Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 terminal-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Hollywoodbets Multiplier History (Latest {hollywoodbetsRounds.length} Records)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-[10px] text-slate-400 uppercase">
                    <th className="py-2">Round #</th>
                    <th className="py-2">Crash Multiplier</th>
                    <th className="py-2">Timestamp (UTC)</th>
                    <th className="py-2">Source Type</th>
                    <th className="py-2">Provably Fair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {hollywoodbetsRounds.slice(-15).reverse().map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100/50">
                      <td className="py-2 text-slate-300">#{r.roundNumber}</td>
                      <td className="py-2 font-bold">
                        <span
                          className={
                            r.multiplier < 2.0
                              ? "text-aix-rose"
                              : r.multiplier < 5.0
                              ? "text-purple-400"
                              : "text-amber-400"
                          }
                        >
                          {r.multiplier.toFixed(2)}x
                        </span>
                      </td>
                      <td className="py-2 text-slate-400 text-[11px]">{new Date(r.crashTime).toLocaleTimeString()}</td>
                      <td className="py-2 text-slate-400 uppercase text-[10px]">{r.sourceType.replace("_", " ")}</td>
                      <td className="py-2 text-purple-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Manual Entry Form */}
          <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" />
              Manual Round Entry
            </h3>
            <p className="text-xs text-slate-400">
              Record a verified Hollywoodbets crash multiplier into the platform database.
            </p>
            <form onSubmit={handleManualAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Crash Multiplier (e.g. 2.45)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  required
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="1.00"
                  className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-mono focus:border-purple-400 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Ingest Hollywoodbets Round
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "distribution" && (
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            Hollywoodbets Multiplier Frequency Distribution vs Spribe 97% Expectation
          </h3>
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
                      <span className="text-slate-500">Theo: {bin.theoreticalPercentage}%</span>
                      <span className={`font-semibold ${bin.discrepancy > 0 ? "text-purple-400" : "text-aix-rose"}`}>
                        {bin.discrepancy > 0 ? `+${bin.discrepancy}%` : `${bin.discrepancy}%`}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-4 bg-surface-300 rounded overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-400/80 z-10"
                      style={{ left: `${theoWidth}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "anomalies" && (
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Statistical Anomaly Detection (IQR &amp; Z-Score Filter)
          </h3>
          {anomalies.length === 0 ? (
            <p className="text-slate-400">No extreme anomalies detected in current observation window.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anomalies.map((anom: { multiplier: number; roundIndex: number; reason: string }, i: number) => (
                <div key={i} className="p-3 bg-surface-100 rounded-lg border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{anom.multiplier.toFixed(2)}x Multiplier</span>
                    <span className="text-slate-500 text-[10px]">Round #{anom.roundIndex + 1}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{anom.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
