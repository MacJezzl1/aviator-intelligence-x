"use client";

import React, { useMemo } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { calculateRiskProfile } from "@/lib/analytics/risk";
import { CashoutStoppingAnalyzer } from "@/components/dashboard/CashoutStoppingAnalyzer";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Percent,
  TrendingDown,
  Info
} from "lucide-react";

export default function RiskAnalysisPage() {
  const { rounds } = useTerminal();
  const multipliers = useMemo(() => rounds.map((r) => r.multiplier), [rounds]);
  const risk = useMemo(() => calculateRiskProfile(multipliers), [multipliers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-rose uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-aix-rose" />
          Department H: Risk Intelligence
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Risk Analysis &amp; Bankroll Sustainability
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Non-gambling educational safety analytics. Mathematical risk-of-ruin simulations, drawdowns, volatility indices, and empirical proof of negative expectation under operator house edge.
        </p>
      </div>

      {/* Mandatory Safeguard Notices */}
      <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 text-xs text-rose-200/90 space-y-2">
        <div className="flex items-center gap-2 font-bold text-aix-rose text-sm">
          <AlertTriangle className="w-4 h-4 text-aix-rose flex-shrink-0" />
          Mandatory Quantitative Research Disclosures
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed font-mono">
          {risk.safeguardNotices.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Volatility Index</span>
          <div className="text-2xl font-bold text-aix-amber mt-1">{risk.volatilityIndex}/100</div>
          <div className="text-[10px] text-slate-500 mt-1">Extreme dispersion in tail</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Sub-2.00x Bust Rate</span>
          <div className="text-2xl font-bold text-aix-rose mt-1">{risk.bustRiskUnder2X}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Empirical observation</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Micro-Crash (&lt;1.20x)</span>
          <div className="text-2xl font-bold text-aix-rose mt-1">{risk.extremeCrashRiskUnder1_20X}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Instant loss probability</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Max Consecutive Busts</span>
          <div className="text-2xl font-bold text-white mt-1">{risk.maxHistoricalDrawdownRounds} Rounds</div>
          <div className="text-[10px] text-aix-rose mt-1">Observed drawdown run</div>
        </div>
      </div>

      {/* Cashout Level & Stopping Rules Quantitative Engine */}
      <CashoutStoppingAnalyzer />

      {/* Risk of Ruin & Bankroll Sustainability Simulation */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-aix-rose" />
            Mathematical Risk-of-Ruin Scenarios (-3% RTP)
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-aix-rose border border-rose-500/30 font-bold">
            {risk.sustainabilityRating}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* 1% Wager */}
          <div className="bg-surface-100 p-4 rounded-lg border border-border space-y-2">
            <div className="text-slate-300 font-bold">Fixed 1% Stake Sizing</div>
            <div className="text-slate-400 text-[11px]">
              Risk of 50% Drawdown: <strong className="text-aix-cyan">{risk.riskOfRuinEstimates.fixedWager1Pct.riskPct}%</strong>
            </div>
            <div className="text-slate-400 text-[11px]">
              Expected Survival: <strong className="text-white">~{risk.riskOfRuinEstimates.fixedWager1Pct.expectedSurvivalRounds} rounds</strong>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal pt-1">
              Low exposure provides maximum survival against short-term variance, though operator edge remains mathematically persistent.
            </p>
          </div>

          {/* 5% Wager */}
          <div className="bg-surface-100 p-4 rounded-lg border border-border space-y-2">
            <div className="text-slate-300 font-bold">Fixed 5% Stake Sizing</div>
            <div className="text-slate-400 text-[11px]">
              Risk of Ruin: <strong className="text-aix-amber">{risk.riskOfRuinEstimates.fixedWager5Pct.riskPct}%</strong>
            </div>
            <div className="text-slate-400 text-[11px]">
              Expected Survival: <strong className="text-white">~{risk.riskOfRuinEstimates.fixedWager5Pct.expectedSurvivalRounds} rounds</strong>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal pt-1">
              High vulnerability to standard consecutive loss runs. Drawdown occurs rapidly during typical cold streaks.
            </p>
          </div>

          {/* Martingale Escalation */}
          <div className="bg-surface-100 p-4 rounded-lg border border-rose-500/40 space-y-2">
            <div className="text-aix-rose font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-aix-rose" />
              Martingale Doubling
            </div>
            <div className="text-aix-rose text-[11px] font-bold">
              Risk of Ruin: 99.99%
            </div>
            <p className="text-[11px] text-slate-300 leading-normal pt-1">
              {risk.riskOfRuinEstimates.martingaleEscalation.warning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
