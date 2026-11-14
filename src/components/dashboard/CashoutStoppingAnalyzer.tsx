"use client";

import React, { useState, useMemo } from "react";
import { useTerminal } from "@/context/TerminalContext";
import {
  Target,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame
} from "lucide-react";

export function CashoutStoppingAnalyzer() {
  const { rounds, selectedOperator } = useTerminal();
  const [targetMultiplier, setTargetMultiplier] = useState<number>(1.04);
  const [stakeAmount, setStakeAmount] = useState<number>(100);

  // Compute exact mathematical metrics for targetMultiplier
  const metrics = useMemo(() => {
    const t = Math.max(1.01, targetMultiplier);

    // Theoretical probability of surviving to multiplier t with 97% RTP:
    // P(X >= t) = 0.97 / t
    const theoreticalSurvivalRate = Math.min(1.0, 0.97 / t);
    const bustRate = 1.0 - theoreticalSurvivalRate;

    // Potential profit per win: (t - 1) * stake
    const profitPerWin = (t - 1) * stakeAmount;
    // Loss per bust: stakeAmount
    const lossPerBust = stakeAmount;

    // Consecutive wins required to break even after 1 single bust:
    // N * profitPerWin = lossPerBust => N = lossPerBust / profitPerWin = 1 / (t - 1)
    const winsNeededToRecoverOneBust = Math.ceil(1 / (t - 1));

    // Expected value per round: E[X] = P(win)*profit - P(bust)*loss
    const ev = theoreticalSurvivalRate * profitPerWin - bustRate * lossPerBust;
    const evPercent = (ev / stakeAmount) * 100;

    // Average rounds between busts: 1 / bustRate
    const avgRoundsBetweenBusts = Math.round(1 / Math.max(0.0001, bustRate));

    // Empirical check against active dataset
    const relevantRounds = selectedOperator === "ALL"
      ? rounds
      : rounds.filter((r) => r.operator === selectedOperator);

    const empiricalBusts = relevantRounds.filter((r) => r.multiplier < t).length;
    const empiricalBustRate = relevantRounds.length > 0
      ? Number(((empiricalBusts / relevantRounds.length) * 100).toFixed(2))
      : Number((bustRate * 100).toFixed(2));

    return {
      target: t,
      survivalPct: Number((theoreticalSurvivalRate * 100).toFixed(2)),
      bustPct: Number((bustRate * 100).toFixed(2)),
      profitPerWin: Number(profitPerWin.toFixed(2)),
      lossPerBust,
      winsNeededToRecoverOneBust,
      ev: Number(ev.toFixed(2)),
      evPercent: Number(evPercent.toFixed(2)),
      avgRoundsBetweenBusts,
      sampleSize: relevantRounds.length,
      empiricalBusts,
      empiricalBustRate,
    };
  }, [targetMultiplier, stakeAmount, rounds, selectedOperator]);

  const presetLevels = [1.02, 1.04, 1.10, 1.20, 1.50, 2.00, 5.00];

  return (
    <div className="terminal-card rounded-2xl p-5 border border-border space-y-5 bg-gradient-to-b from-surface-100 to-surface-200 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-aix-rose uppercase tracking-wider mb-0.5">
            <Target className="w-4 h-4 text-aix-rose" />
            Quantitative Cashout Level &amp; Stopping Rules Engine
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Target Cashout Analysis: e.g. {metrics.target.toFixed(2)}x Threshold
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematical breakdown of micro-cashout strategies (1.04x) on Hollywoodbets and Betway. Evaluates recovery breakeven ratios and ruin hazards.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
          {presetLevels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setTargetMultiplier(lvl)}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                targetMultiplier === lvl
                  ? "bg-aix-rose text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                  : "bg-surface-200 text-slate-400 hover:text-white border border-border"
              }`}
            >
              {lvl.toFixed(2)}x
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div>
          <label className="block text-slate-300 mb-1">
            Test Cashout Multiplier Level:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="1.01"
              max="100.0"
              value={targetMultiplier}
              onChange={(e) => setTargetMultiplier(parseFloat(e.target.value) || 1.04)}
              className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-aix-rose"
            />
            <span className="text-slate-400 font-bold">x</span>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-1">
            Stake Unit (e.g. Rands / USD):
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">R / $</span>
            <input
              type="number"
              min="1"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 100)}
              className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-aix-rose"
            />
          </div>
        </div>
      </div>

      {/* 4 Quantitative Reality Check Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* Metric 1 */}
        <div className="bg-surface-100 p-3.5 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase block">Survival Probability:</span>
          <div className="text-xl font-bold text-aix-emerald mt-1">
            {metrics.survivalPct}%
          </div>
          <span className="text-[10px] text-slate-500">P(Crash &ge; {metrics.target.toFixed(2)}x)</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-100 p-3.5 rounded-xl border border-rose-500/40">
          <span className="text-aix-rose text-[10px] uppercase block font-bold">Bust Risk:</span>
          <div className="text-xl font-bold text-aix-rose mt-1">
            {metrics.bustPct}%
          </div>
          <span className="text-[10px] text-slate-400">~1 in {metrics.avgRoundsBetweenBusts} rounds crashes early</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-100 p-3.5 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase block">Consecutive Wins to Recover:</span>
          <div className="text-xl font-bold text-aix-amber mt-1">
            {metrics.winsNeededToRecoverOneBust} Wins
          </div>
          <span className="text-[10px] text-slate-500">To break even from 1 bust</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-100 p-3.5 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase block">Expected Value E[X]:</span>
          <div className="text-xl font-bold text-aix-rose mt-1">
            {metrics.evPercent.toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-500">Permanent -3% RTP edge</span>
        </div>
      </div>

      {/* Critical Mathematical Proof for Low Cashout (1.04x) */}
      <div className="bg-surface-300 p-4 rounded-xl border border-rose-500/30 text-xs font-mono space-y-3">
        <div className="flex items-center gap-2 text-aix-rose font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-aix-rose flex-shrink-0" />
          The Mathematical Trap of Low Cashouts ({metrics.target.toFixed(2)}x)
        </div>

        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          Many players assume cashing out low at <strong>{metrics.target.toFixed(2)}x</strong> is safe because you win <strong>{metrics.survivalPct}%</strong> of the time. However, notice the asymmetry:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
          <div className="bg-surface-100 p-3 rounded-lg border border-border">
            <span className="text-slate-400 block">When you Win:</span>
            <span className="text-aix-emerald font-bold text-sm block mt-0.5">
              +{metrics.profitPerWin} profit (only {((metrics.target - 1) * 100).toFixed(0)}% of stake)
            </span>
          </div>

          <div className="bg-surface-100 p-3 rounded-lg border border-rose-500/40">
            <span className="text-slate-400 block">When it Crashes Below {metrics.target.toFixed(2)}x (e.g. at 1.00x, 1.01x, 1.02x):</span>
            <span className="text-aix-rose font-bold text-sm block mt-0.5">
              -{metrics.lossPerBust} (You lose 100% of your stake)
            </span>
          </div>
        </div>

        <p className="text-amber-200/90 leading-relaxed text-xs">
          Because a crash before {metrics.target.toFixed(2)}x occurs every <strong>~{metrics.avgRoundsBetweenBusts} rounds</strong> on average, and you need <strong>{metrics.winsNeededToRecoverOneBust} consecutive wins</strong> just to break even from a single crash, a player betting repeatedly at {metrics.target.toFixed(2)}x is mathematically guaranteed to suffer net losses over time.
        </p>
      </div>

      {/* Formal Stopping Rules (When to Start and When to Stop) */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-aix-cyan" />
          Quantitative Stopping Protocol (Risk Safeguards)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Rule 1: When to Start */}
          <div className="bg-surface-100 p-3.5 rounded-xl border border-border space-y-1.5">
            <div className="text-aix-cyan font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-aix-cyan" />
              1. When to Start (Entry)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Statistical Fact:</strong> In Spribe Aviator, each round is generated with independent SHA-256 HMAC seeds. There is <strong>no magic moment to start</strong> where the house edge turns positive. Historical cold streaks do NOT increase the probability of an impending win.
            </p>
          </div>

          {/* Rule 2: Take-Profit Stopping Rule */}
          <div className="bg-surface-100 p-3.5 rounded-xl border border-border space-y-1.5">
            <div className="text-aix-emerald font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-aix-emerald" />
              2. Take-Profit Hard Stop
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Mandatory Rule:</strong> Stop immediately if your session bankroll increases by <strong>+10% to +15%</strong>. Because the mathematical expectation is negative (-3% RTP), extended continuous play always regresses profits back to the house.
            </p>
          </div>

          {/* Rule 3: Stop-Loss Hard Stop */}
          <div className="bg-surface-100 p-3.5 rounded-xl border border-rose-500/40 space-y-1.5">
            <div className="text-aix-rose font-bold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-aix-rose" />
              3. Stop-Loss Hard Stop
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Mandatory Rule:</strong> Cease the session immediately if you hit a drawdown of <strong>-15% of your bankroll</strong>. NEVER chase losses or increase stakes (Martingale) after a 1.00x micro-crash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
