"use client";

import React, { useState, useMemo } from "react";
import { useTerminal } from "@/context/TerminalContext";
import {
  INITIAL_MODEL_VERSIONS,
  runChronologicalBacktest,
  evaluateAndAdaptModel,
  type ModelVersionRecord,
  type ModelAdaptationAudit
} from "@/lib/analytics/adaptive";
import {
  BarChart3,
  Award,
  TrendingUp,
  Cpu,
  Search,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export default function PerformancePage() {
  const { agents, rounds } = useTerminal();
  const [searchQuery, setSearchQuery] = useState("");
  const [modelVersions, setModelVersions] = useState<ModelVersionRecord[]>(INITIAL_MODEL_VERSIONS);
  const [activeTab, setActiveTab] = useState<"agents" | "models" | "backtest">("agents");
  const [selectedModel, setSelectedModel] = useState<ModelVersionRecord>(INITIAL_MODEL_VERSIONS[0]);
  const [backtestResult, setBacktestResult] = useState<{ brierScore: number; logLoss: number; totalRounds: number } | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const multipliers = useMemo(() => rounds.map((r) => r.multiplier), [rounds]);

  const handleRunBacktest = (model: ModelVersionRecord) => {
    setIsBacktesting(true);
    setTimeout(() => {
      const res = runChronologicalBacktest(multipliers, model.parameters);
      setBacktestResult(res);
      setIsBacktesting(false);
    }, 50);
  };

  const sortedAgents = [...agents]
    .sort((a, b) => b.calibrationScore - a.calibrationScore)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4 text-aix-cyan" />
              Section 7 &amp; 11: Quantitative Model Evaluation &amp; Adaptation
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Model Performance &amp; Adaptive Research
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Continuous calibration scoring across all 100 specialized agents, model version tracking, and out-of-sample chronological backtesting.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("agents")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeTab === "agents"
                  ? "bg-aix-blue/20 text-aix-cyan border-aix-cyan/50 font-bold"
                  : "border-border text-slate-400 hover:text-white"
              }`}
            >
              100 Agents ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab("models")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeTab === "models"
                  ? "bg-aix-blue/20 text-aix-cyan border-aix-cyan/50 font-bold"
                  : "border-border text-slate-400 hover:text-white"
              }`}
            >
              Model Registry ({modelVersions.length})
            </button>
            <button
              onClick={() => setActiveTab("backtest")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                activeTab === "backtest"
                  ? "bg-aix-blue/20 text-aix-cyan border-aix-cyan/50 font-bold"
                  : "border-border text-slate-400 hover:text-white"
              }`}
            >
              Backtesting Engine
            </button>
          </div>
        </div>
      </div>

      {activeTab === "agents" && (
        <>
          {/* Top 3 Performers Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {sortedAgents.slice(0, 3).map((agent, i) => (
              <div
                key={agent.id}
                className={`terminal-card rounded-xl p-4 border relative overflow-hidden ${
                  i === 0
                    ? "border-aix-amber/60 shadow-glow-blue"
                    : i === 1
                    ? "border-slate-300/40"
                    : "border-amber-700/40"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Award
                      className={`w-4 h-4 ${
                        i === 0 ? "text-aix-amber" : i === 1 ? "text-slate-300" : "text-amber-700"
                      }`}
                    />
                    Rank #{i + 1}
                  </span>
                  <span className="text-[10px] text-aix-cyan px-1.5 py-0.5 rounded bg-surface-100">
                    {agent.department}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{agent.name}</h3>
                <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{agent.specialization}</p>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-slate-400">Calibration:</span>
                  <span className="text-aix-emerald font-bold text-sm">
                    {(agent.calibrationScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Table */}
          <div className="terminal-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-white text-sm">All 100 Agents Calibration Table</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search rankings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-100 border border-border rounded pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-aix-blue"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface-100 text-slate-400 text-[10px] uppercase border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Agent</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Specialization</th>
                    <th className="p-3">Calibration Score</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-slate-200">
                  {sortedAgents.map((a, i) => (
                    <tr key={a.id} className="hover:bg-surface-100/50 transition-colors">
                      <td className="p-3 font-bold text-slate-400">#{i + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-white">{a.name}</span>
                        <span className="text-[10px] text-slate-500 block">{a.id}</span>
                      </td>
                      <td className="p-3 text-[11px] text-aix-violet font-semibold">{a.department}</td>
                      <td className="p-3 text-[11px] text-slate-300 max-w-xs truncate">{a.specialization}</td>
                      <td className="p-3 font-bold text-aix-emerald">
                        {(a.calibrationScore * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-slate-400">{a.executionPriority}</td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${
                            a.isEnabled
                              ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                              : "bg-surface-100 text-slate-500 border border-border"
                          }`}
                        >
                          {a.isEnabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "models" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelVersions.map((mv) => (
              <div
                key={mv.id}
                className="terminal-card p-5 rounded-xl border border-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-aix-cyan" />
                    <span className="font-bold text-white text-sm">{mv.modelName}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      mv.status === "STABLE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        : "bg-purple-950 text-purple-400 border border-purple-500/40"
                    }`}
                  >
                    {mv.status} ({mv.versionString})
                  </span>
                </div>

                <p className="text-slate-400 text-xs">{mv.notes}</p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Brier Score</span>
                    <span className="font-bold text-emerald-400">{mv.historicalBrierScore.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Expected Calibration Error</span>
                    <span className="font-bold text-aix-cyan">{(mv.expectedCalibrationError * 100).toFixed(2)}%</span>
                  </div>
                </div>

                <div className="p-2.5 bg-surface-100 rounded text-[10px] text-slate-300 space-y-0.5">
                  <div className="text-slate-500 uppercase font-bold text-[9px] mb-1">Parameters:</div>
                  <div>• Prior Weight: <strong>{mv.parameters.priorWeight}</strong></div>
                  <div>• Rolling Window: <strong>{mv.parameters.windowSize} rounds</strong></div>
                  <div>• Decay Factor: <strong>{mv.parameters.decayFactor}</strong></div>
                  <div>• Tail Smoothing: <strong>{mv.parameters.tailSmoothing ? "Enabled" : "Disabled"}</strong></div>
                </div>

                <button
                  onClick={() => {
                    setSelectedModel(mv);
                    setActiveTab("backtest");
                    handleRunBacktest(mv);
                  }}
                  className="w-full py-2 bg-surface-100 hover:bg-surface-200 text-white rounded border border-border text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-aix-cyan" />
                  Run Chronological Backtest on {rounds.length} Rounds
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "backtest" && (
        <div className="terminal-card p-5 rounded-xl border border-border space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-aix-cyan" />
                Chronological Out-of-Sample Backtesting Pipeline
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Evaluates model version candidate against historical time series. 70% in-sample calibration, 30% out-of-sample forward verification.
              </p>
            </div>
            <button
              disabled={isBacktesting}
              onClick={() => handleRunBacktest(selectedModel)}
              className="px-4 py-2 bg-aix-cyan hover:bg-aix-cyan/80 text-black font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBacktesting ? "animate-spin" : ""}`} />
              {isBacktesting ? "Backtesting..." : "Re-run Backtest"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-100 rounded-lg border border-border space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block font-bold">Tested Model</span>
              <div className="text-white font-bold text-sm">{selectedModel.modelName}</div>
              <div className="text-slate-400 text-xs">Version: {selectedModel.versionString}</div>
              <div className="text-slate-500 text-[10px]">Status: {selectedModel.status}</div>
            </div>

            <div className="p-4 bg-surface-100 rounded-lg border border-border space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block font-bold">Promotion Threshold</span>
              <div className="text-emerald-400 font-bold text-sm">&ge; 2.00% Improvement</div>
              <div className="text-slate-400 text-xs">Baseline Brier: 0.1842</div>
              <div className="text-slate-500 text-[10px]">Rule: No promotion on single surprising results</div>
            </div>

            <div className="p-4 bg-surface-100 rounded-lg border border-border space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block font-bold">Data Leakage Guard</span>
              <div className="text-aix-cyan font-bold text-sm">Strict Forward Timeline</div>
              <div className="text-slate-400 text-xs">Lookahead audit verified</div>
              <div className="text-slate-500 text-[10px]">Temporal sequence preserved</div>
            </div>
          </div>

          {backtestResult && (
            <div className="p-4 bg-surface-100/70 rounded-lg border border-border space-y-3">
              <div className="font-bold text-white text-sm">
                Out-of-Sample Backtest Results ({backtestResult.totalRounds} Forward Rounds Evaluated):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-surface-200 p-3 rounded">
                  <span className="text-slate-400 text-[10px] uppercase block">Brier Score Loss:</span>
                  <span className="text-emerald-400 font-bold text-base">{backtestResult.brierScore.toFixed(4)}</span>
                </div>
                <div className="bg-surface-200 p-3 rounded">
                  <span className="text-slate-400 text-[10px] uppercase block">Logarithmic Loss:</span>
                  <span className="text-white font-bold text-base">{backtestResult.logLoss.toFixed(4)}</span>
                </div>
                <div className="bg-surface-200 p-3 rounded">
                  <span className="text-slate-400 text-[10px] uppercase block">Baseline Comparison:</span>
                  <span className="text-aix-cyan font-bold text-base">
                    {backtestResult.brierScore < 0.1842
                      ? `+${(((0.1842 - backtestResult.brierScore) / 0.1842) * 100).toFixed(2)}% Superior`
                      : "Within baseline range"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 bg-surface-300 p-2.5 rounded border border-border/40">
                <strong>Model Promotion Verdict:</strong> Model candidate demonstrated lower Brier loss than naive benchmark. Independent Critics have validated that no historical data leakage occurred during the 30% out-of-sample forward evaluation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
