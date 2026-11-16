"use client";

import React, { useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import {
  ShieldAlert,
  Flame,
  Scale,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Cpu,
  HelpCircle,
  FileText
} from "lucide-react";

export default function AIDebateCentrePage() {
  const { runCouncilTask, isOrchestrating, latestCouncilReport } = useTerminal();
  const [selectedChallengeType, setSelectedChallengeType] = useState<string>("ALL");

  const debates = [
    {
      id: "deb-1",
      topic: "Alleged Impending Multiplier Rebound",
      criticId: "crit-05",
      criticName: "Gamblers-Fallacy-Prosecutor",
      targetId: "pat-02",
      targetName: "Streak-Duration-Profiler",
      challengeType: "gamblers_fallacy",
      critique:
        "The pattern agent asserted that 4 consecutive crashes under 1.50x increases the likelihood of an impending >=2.00x crash. This commits the classic Gambler's Fallacy. Each Aviator round is cryptographically memoryless.",
      defense:
        "The streak analysis was descriptive of historical run length, not a causal prediction of the next round.",
      verdict: "SUSTAINED: Memoryless property upheld. Claim of predictive rebound rejected.",
      status: "RESOLVED",
    },
    {
      id: "deb-2",
      topic: "Sample Size Adequacy on Rolling 20 Rounds",
      criticId: "crit-03",
      criticName: "SampleSize-Challenger",
      targetId: "stat-01",
      targetName: "BTW-Distro-Mapper",
      challengeType: "sample_size",
      critique:
        "Estimating continuous Pareto tail parameters using only N=20 observations produces immense epistemic standard error (SE > 0.45). The resulting confidence intervals are too wide to justify actionable boundaries.",
      defense:
        "Applied Bayesian prior regularizer with Spribe 97% theoretical prior to prevent overfitting on finite sample windows.",
      verdict: "ACCEPTED: Epistemic uncertainty widened from 0.35 to 0.72.",
      status: "RESOLVED",
    },
    {
      id: "deb-3",
      topic: "The 1.04x Micro-Cashout 'Safe Strategy' Claim",
      criticId: "crit-08",
      criticName: "Certainty-Manufacture-Terminator",
      targetId: "risk-06",
      targetName: "Micro-Cashout-Trap-Analyst",
      challengeType: "unsupported_claim",
      critique:
        "Disallowed any recommendation suggesting 1.04x cashout is 'risk-free'. Mathematical proof shows 25 consecutive wins are needed to recover from a single 1.00x - 1.03x crash.",
      defense:
        "Fully aligned. Formulated the 25-win breakeven hurdle metric to demonstrate negative expected value (-3% RTP).",
      verdict: "PASSED: Responsible risk warning permanently displayed.",
      status: "RESOLVED",
    },
    {
      id: "deb-4",
      topic: "Cross-Platform Statistical Divergence",
      criticId: "crit-04",
      criticName: "Causation-Fallacy-Striker",
      targetId: "cross-01",
      targetName: "KS-TwoSample-Auditor",
      challengeType: "correlation_causation",
      critique:
        "A temporary median difference of 0.12x between Hollywoodbets and Betway was observed over 50 rounds. Warning: Attributing this to different RNG algorithms without a significant KS test (p < 0.05) is unscientific.",
      defense:
        "Confirmed. Non-parametric two-sample Kolmogorov-Smirnov test returned p=0.48, confirming observational equivalence.",
      verdict: "SUSTAINED: Both platforms confirmed mathematically identical Spribe B2B clusters.",
      status: "RESOLVED",
    },
  ];

  const filteredDebates = selectedChallengeType === "ALL"
    ? debates
    : debates.filter((d) => d.challengeType === selectedChallengeType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-rose uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4 text-aix-rose" />
          Section 6: AI Debate &amp; Adversarial Cross-Examination
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Debate Centre &amp; Independent Critique
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Department 7 (Independent Critics) actively challenges statistical hypotheses, detects Gambler&apos;s Fallacies, exposes overfitting, and prevents manufactured certainty.
            </p>
          </div>
          <button
            disabled={isOrchestrating}
            onClick={() => runCouncilTask("Convene adversarial cross-examination across all active models.")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-aix-rose to-amber-600 hover:opacity-90 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-glow-rose transition-all disabled:opacity-50"
          >
            <Cpu className={`w-3.5 h-3.5 ${isOrchestrating ? "animate-spin" : ""}`} />
            {isOrchestrating ? "Cross-Examining..." : "Trigger Adversarial Debate"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto pb-1">
        {[
          { key: "ALL", label: "All Challenges" },
          { key: "gamblers_fallacy", label: "Gambler's Fallacy" },
          { key: "sample_size", label: "Sample Size Adequacy" },
          { key: "unsupported_claim", label: "Unsupported Certainty" },
          { key: "correlation_causation", label: "Correlation vs Causation" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedChallengeType(t.key)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedChallengeType === t.key
                ? "bg-rose-950 text-aix-rose border border-rose-500/30 font-bold"
                : "bg-surface-100 text-slate-400 hover:text-white border border-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Debates List */}
      <div className="space-y-4 font-mono text-xs">
        {filteredDebates.map((deb) => (
          <div
            key={deb.id}
            className="terminal-card rounded-xl p-5 border border-border space-y-4 bg-surface-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <span className="text-[10px] text-aix-rose uppercase font-bold tracking-wider">
                  Challenge #{deb.id} &bull; {deb.challengeType.replace(/_/g, " ").toUpperCase()}
                </span>
                <h3 className="font-bold text-white text-base mt-0.5">{deb.topic}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold self-start sm:self-auto">
                {deb.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Critic Side */}
              <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-aix-rose font-bold text-[11px]">
                  <Flame className="w-3.5 h-3.5" />
                  Critic: {deb.criticName} ({deb.criticId})
                </div>
                <p className="text-slate-300 leading-normal text-xs">{deb.critique}</p>
              </div>

              {/* Defender Side */}
              <div className="p-3.5 bg-surface-100 border border-border rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-aix-cyan font-bold text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Respondent: {deb.targetName} ({deb.targetId})
                </div>
                <p className="text-slate-300 leading-normal text-xs">{deb.defense}</p>
              </div>
            </div>

            {/* Final Verdict */}
            <div className="p-3 bg-surface-300 rounded-lg border border-border/80 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Consensus Verdict:</span>
                <p className="text-white text-xs mt-0.5 font-medium">{deb.verdict}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
