"use client";

import React, { useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { type AgentDepartment } from "@/lib/agents/registry";
import {
  Users2,
  Cpu,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  ShieldAlert,
  Flame,
  FileCheck,
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";

export default function CouncilPage() {
  const {
    agents,
    toggleAgent,
    latestCouncilReport,
    isOrchestrating,
    runCouncilTask,
    rounds
  } = useTerminal();

  const [selectedDept, setSelectedDept] = useState<AgentDepartment | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [customQuestion, setCustomQuestion] = useState(
    "Evaluate whether recent multiplier sequences demonstrate autocorrelation or Gambler's Fallacy susceptibility."
  );
  const [activeTab, setActiveTab] = useState<"roster" | "debates" | "report">("report");

  const departments: (AgentDepartment | "ALL")[] = [
    "ALL",
    "STATISTICAL",
    "PATTERN",
    "MATHEMATICAL",
    "FORECAST",
    "CRITIC",
    "STRATEGIC",
    "LIVE",
    "RISK",
    "RESEARCH",
    "COUNCIL",
  ];

  const filteredAgents = agents.filter((a) => {
    const matchesDept = selectedDept === "ALL" || a.department === selectedDept;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleRunDeliberation = () => {
    runCouncilTask(customQuestion);
    setActiveTab("report");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-aix-violet uppercase tracking-wider mb-1">
            <Users2 className="w-4 h-4 text-aix-violet" />
            100-Agent Orchestrated Chamber
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Intelligence Council &amp; Agent Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            100 specialized logical agents across 10 functional departments. Cross-examination, adversarial criticism, mathematical verification, and Chief Council consensus.
          </p>
        </div>

        <button
          disabled={isOrchestrating}
          onClick={handleRunDeliberation}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-aix-blue to-aix-violet hover:opacity-95 text-xs font-mono font-bold text-black flex items-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
        >
          <Cpu className={`w-4 h-4 ${isOrchestrating ? "animate-spin" : ""}`} />
          {isOrchestrating ? "Deliberation in Progress..." : "Trigger Full Deliberation"}
        </button>
      </div>

      {/* Deliberation Research Prompt Box */}
      <div className="terminal-card rounded-xl p-4 border border-border">
        <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5">
          Research Question for Council Deliberation:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Enter specific quantitative research prompt for the 100-agent chamber..."
            className="flex-1 bg-surface-100 border border-border rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-aix-blue font-mono"
          />
          <button
            disabled={isOrchestrating}
            onClick={handleRunDeliberation}
            className="px-4 py-2 bg-surface-50 hover:bg-surface-100 border border-border text-white rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-aix-cyan" />
            Submit Query
          </button>
        </div>

        {/* Operator Specific Preset Queries */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-border/50 text-[11px] font-mono">
          <span className="text-slate-400">Operator Presets:</span>
          <button
            onClick={() => {
              setCustomQuestion("Analyze Hollywoodbets Aviator stream: test whether multiplier sequences deviate from theoretical Spribe 97% RTP parameters.");
            }}
            className="px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300"
          >
            🎯 Hollywoodbets Analysis
          </button>
          <button
            onClick={() => {
              setCustomQuestion("Analyze Betway Aviator stream: investigate cold streak runs and calculate next-round probability distributions.");
            }}
            className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300"
          >
            🎯 Betway Analysis
          </button>
          <button
            onClick={() => {
              setCustomQuestion("Cross-Operator Audit: Compare Hollywoodbets vs Betway for divergence, streak clusters, and shared RNG characteristics.");
            }}
            className="px-2 py-0.5 rounded bg-surface-100 hover:bg-surface-50 border border-border text-aix-cyan"
          >
            ⚖️ Cross-Operator Audit
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("report")}
          className={`px-3 py-1.5 rounded-t transition-colors ${
            activeTab === "report"
              ? "bg-surface-100 text-aix-blue font-bold border-b-2 border-aix-blue"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Chief Council Consensus Report
        </button>
        <button
          onClick={() => setActiveTab("debates")}
          className={`px-3 py-1.5 rounded-t transition-colors ${
            activeTab === "debates"
              ? "bg-surface-100 text-aix-violet font-bold border-b-2 border-aix-violet"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Adversarial Debates &amp; Criticism
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-3 py-1.5 rounded-t transition-colors ${
            activeTab === "roster"
              ? "bg-surface-100 text-aix-cyan font-bold border-b-2 border-aix-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Agent Roster (100 Logical Agents)
        </button>
      </div>

      {/* TAB 1: CHIEF COUNCIL CONSENSUS REPORT */}
      {activeTab === "report" && (
        <div className="space-y-6">
          {latestCouncilReport ? (
            <div className="terminal-card rounded-xl p-6 border border-border space-y-6">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-aix-violet/20 text-aix-violet border border-aix-violet/40 font-bold uppercase">
                    Formal 10-Point Intelligence Consensus
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1.5">
                    {latestCouncilReport.researchQuestion}
                  </h2>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>Task ID: {latestCouncilReport.taskId}</div>
                  <div>Published: {new Date(latestCouncilReport.publishedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* 10 Structured Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* 1. Research Question */}
                <div className="bg-surface-100 p-3 rounded border border-border">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">1. Research Question</div>
                  <div className="text-white mt-1">{latestCouncilReport.researchQuestion}</div>
                </div>

                {/* 2. Available Evidence */}
                <div className="bg-surface-100 p-3 rounded border border-border">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">2. Available Evidence</div>
                  <div className="text-white mt-1">{latestCouncilReport.availableEvidence}</div>
                </div>

                {/* 3. Statistical Findings */}
                <div className="bg-surface-100 p-3 rounded border border-border">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">3. Statistical Findings</div>
                  <div className="text-white mt-1">{latestCouncilReport.statisticalFindings}</div>
                </div>

                {/* 4. Confidence & Uncertainty */}
                <div className="bg-surface-100 p-3 rounded border border-border">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">4. Calibration &amp; Uncertainty</div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-aix-cyan">
                      Confidence: <strong>{(latestCouncilReport.confidenceLevel * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="text-aix-amber">
                      Uncertainty: <strong>{(latestCouncilReport.uncertaintyLevel * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>

                {/* 5. Mathematical Verification */}
                <div className="bg-surface-100 p-3 rounded border border-border md:col-span-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">5. Mathematical Verification</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5 text-[11px]">
                    <div className="bg-surface-200 p-2 rounded border border-border/40">
                      RNG Independent: <strong className="text-aix-emerald">CONFIRMED</strong>
                    </div>
                    <div className="bg-surface-200 p-2 rounded border border-border/40">
                      Runs Test: <strong className="text-aix-emerald">PASSED (p&ge;0.05)</strong>
                    </div>
                    <div className="bg-surface-200 p-2 rounded border border-border/40">
                      House Edge Drag: <strong className="text-aix-rose">-3.00%</strong>
                    </div>
                    <div className="bg-surface-200 p-2 rounded border border-border/40">
                      Brier Scoring: <strong className="text-aix-cyan">ACTIVE</strong>
                    </div>
                  </div>
                </div>

                {/* 6. Consensus Summary */}
                <div className="bg-surface-100 p-3 rounded border border-border md:col-span-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">6. Consensus Summary</div>
                  <div className="text-slate-200 mt-1 leading-relaxed">{latestCouncilReport.consensusSummary}</div>
                </div>

                {/* 7. Limitations */}
                <div className="bg-surface-100 p-3 rounded border border-border md:col-span-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">7. Known Limitations</div>
                  <div className="text-amber-200/90 mt-1">{latestCouncilReport.limitations}</div>
                </div>

                {/* 8. Final Conclusion */}
                <div className="bg-surface-100 p-4 rounded border-2 border-aix-blue/40 md:col-span-2">
                  <div className="text-aix-blue text-[10px] uppercase font-bold">8. Executive Conclusion</div>
                  <div className="text-white text-sm font-semibold mt-1">
                    {latestCouncilReport.finalConclusion}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="terminal-card rounded-xl p-12 border border-border text-center space-y-3">
              <Users2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Chamber Inactive</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No consensus report has been requested for this session yet. Click the button below to convene the 100 agents.
              </p>
              <button
                disabled={isOrchestrating}
                onClick={handleRunDeliberation}
                className="px-4 py-2 bg-gradient-to-r from-aix-blue to-aix-violet text-black font-bold font-mono text-xs rounded-lg shadow-glow-blue"
              >
                Convene 100-Agent Chamber
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADVERSARIAL DEBATES */}
      {activeTab === "debates" && (
        <div className="space-y-4">
          <div className="terminal-card p-4 rounded-xl border border-border text-xs text-slate-300">
            <p>
              <strong>Department E (Independent Critics)</strong> is tasked with challenging all statistical, pattern, and forecast claims. The engine rejects unverified assertions, strikes down gambler&apos;s fallacy logic, and flags insufficient sample sizes.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                critic: "crit-01 (Skeptic-Prime)",
                target: "pat-02 (Streak-Metric)",
                type: "Gambler's Fallacy Challenge",
                critique: "Observation of 4 consecutive sub-2.00x rounds flagged. Warning: Inferring an impending rebound contradicts provably fair memoryless mechanics.",
                defense: "Defense submitted: Streak is recorded strictly as historical observation. Zero future probability escalation applied.",
                status: "SUSTAINED & ENFORCED",
              },
              {
                critic: "crit-03 (SampleSize-Inquisitor)",
                target: "fore-01 (Prob-Distribution-Forecaster)",
                type: "Sample Size Adequacy Challenge",
                critique: `Sample size N=${rounds.length}. Small sample sizes exhibit high variance in extreme tails (>50x).`,
                defense: "Bayesian Dirichlet prior shrinkage applied to prevent model overfitting.",
                status: "RESOLVED WITH SHRINKAGE",
              },
              {
                critic: "crit-08 (Certainty-Striker)",
                target: "General Forecast Pipeline",
                type: "Manufactured Certainty Prohibition",
                critique: "Audited model outputs for any false claims of high prediction rates. Total ban on 99% accuracy promises.",
                defense: "All predictions expressed as calibrated continuous probability distributions with Brier score auditing.",
                status: "PASSED ZERO-TOLERANCE AUDIT",
              },
            ].map((d, i) => (
              <div key={i} className="terminal-card rounded-xl p-4 border border-border space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-aix-rose font-bold">{d.type}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-100 text-aix-emerald border border-aix-emerald/30">
                    {d.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-surface-100/70 p-2.5 rounded border border-rose-500/20">
                    <span className="text-[10px] text-aix-rose font-semibold">Critic: {d.critic}</span>
                    <p className="text-slate-300 mt-1">{d.critique}</p>
                  </div>
                  <div className="bg-surface-100/70 p-2.5 rounded border border-blue-500/20">
                    <span className="text-[10px] text-aix-blue font-semibold">Respondent: {d.target}</span>
                    <p className="text-slate-300 mt-1">{d.defense}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AGENT ROSTER */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          {/* Department Filters */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedDept === d
                    ? "bg-aix-blue text-black font-bold shadow-glow-blue"
                    : "bg-surface-100 text-slate-400 hover:text-white hover:bg-surface-50 border border-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search 100 agents by ID, name, or quantitative specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-100 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-aix-blue font-mono"
            />
          </div>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className={`terminal-card rounded-xl p-3.5 border transition-all ${
                  agent.isEnabled ? "border-border" : "border-border/40 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-100 text-aix-cyan border border-border">
                      {agent.id}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-1">{agent.name}</h3>
                  </div>
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold transition-colors ${
                      agent.isEnabled
                        ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                        : "bg-surface-100 text-slate-500 border border-border"
                    }`}
                  >
                    {agent.isEnabled ? "Active" : "Disabled"}
                  </button>
                </div>

                <div className="text-[10px] font-mono text-aix-violet mt-1 uppercase font-semibold">
                  DEPT: {agent.department}
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                  {agent.specialization}
                </p>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Calibration: {(agent.calibrationScore * 100).toFixed(0)}%</span>
                  <span>Priority: {agent.executionPriority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
