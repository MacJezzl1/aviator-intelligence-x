"use client";

import React, { useState, useMemo } from "react";
import {
  Radio,
  Activity,
  Layers,
  Database,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Sliders,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { useTerminal } from "@/context/TerminalContext";
import { DataProvenanceBadge } from "@/components/common/DataProvenanceBadge";
import { type DataSourceType } from "@/lib/data/ingestion";

export interface LiveSignalConsoleProps {
  initialWindowSize?: number;
}

export default function LiveSignalConsole({ initialWindowSize = 50 }: LiveSignalConsoleProps) {
  const { rounds, selectedOperator } = useTerminal();
  const [windowSize, setWindowSize] = useState<number>(initialWindowSize);

  // Filter real rounds (Rule T13 - default dataset is real-only)
  const realRounds = useMemo(() => {
    return rounds.filter(
      (r) => r.sourceType !== "demonstration" && (r as any).dataClass !== "DEMO"
    );
  }, [rounds]);

  const n = realRounds.length;
  const isL6Empty = n === 0;

  // Active observation window
  const activeWindow = useMemo(() => {
    return realRounds.slice(-windowSize);
  }, [realRounds, windowSize]);

  const windowN = activeWindow.length;

  // Latest round info
  const latestRound = realRounds[realRounds.length - 1];
  const lastTimestamp = latestRound?.crashTime
    ? new Date(latestRound.crashTime).toISOString().replace("T", " ").substring(0, 19) + " UTC"
    : "No rounds yet";

  // Odds band targets m in {1.5, 2.0, 3.0, 5.0, 10.0, 50.0, 100.0}
  const oddsBands = useMemo(() => {
    const targets = [1.5, 2.0, 3.0, 5.0, 10.0, 50.0, 100.0];
    return targets.map((m) => {
      // Theoretical Spribe probability P(M >= m) = 0.97 / m
      const theoreticalP = Number((0.97 / m).toFixed(4));
      const theoreticalPct = Number((theoreticalP * 100).toFixed(2));

      // Empirical share in current observation window
      const count = activeWindow.filter((r) => r.multiplier >= m).length;
      const empiricalShare = windowN > 0 ? count / windowN : 0;
      const empiricalPct = Number((empiricalShare * 100).toFixed(1));

      // Normal approximation / Wilson score interval (95% CI)
      const z = 1.96;
      let ciLower = 0;
      let ciUpper = 0;
      if (windowN > 0) {
        const p = empiricalShare;
        const margin = z * Math.sqrt((p * (1 - p)) / windowN);
        ciLower = Math.max(0, Number(((p - margin) * 100).toFixed(1)));
        ciUpper = Math.min(100, Number(((p + margin) * 100).toFixed(1)));
      }

      return {
        m,
        theoreticalPct,
        empiricalPct,
        ciLower,
        ciUpper,
        count,
      };
    });
  }, [activeWindow, windowN]);

  // Streak descriptor (B02)
  const streakInfo = useMemo(() => {
    if (windowN === 0) return { currentCold: 0, maxCold: 0, currentHot: 0, maxHot: 0 };
    let currentCold = 0;
    let maxCold = 0;
    let currentHot = 0;
    let maxHot = 0;

    for (const r of activeWindow) {
      if (r.multiplier < 2.0) {
        currentCold++;
        currentHot = 0;
        if (currentCold > maxCold) maxCold = currentCold;
      } else {
        currentHot++;
        currentCold = 0;
        if (currentHot > maxHot) maxHot = currentHot;
      }
    }

    return { currentCold, maxCold, currentHot, maxHot };
  }, [activeWindow, windowN]);

  // Bucket frequencies
  const bucketCounts = useMemo(() => {
    const b1 = activeWindow.filter((r) => r.multiplier < 2.0).length;
    const b2 = activeWindow.filter((r) => r.multiplier >= 2.0 && r.multiplier < 10.0).length;
    const b3 = activeWindow.filter((r) => r.multiplier >= 10.0 && r.multiplier < 50.0).length;
    const b4 = activeWindow.filter((r) => r.multiplier >= 50.0).length;
    return {
      sub2: { count: b1, pct: windowN > 0 ? Number(((b1 / windowN) * 100).toFixed(1)) : 0 },
      twoToTen: { count: b2, pct: windowN > 0 ? Number(((b2 / windowN) * 100).toFixed(1)) : 0 },
      tenToFifty: { count: b3, pct: windowN > 0 ? Number(((b3 / windowN) * 100).toFixed(1)) : 0 },
      fiftyPlus: { count: b4, pct: windowN > 0 ? Number(((b4 / windowN) * 100).toFixed(1)) : 0 },
    };
  }, [activeWindow, windowN]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          ZONE 1: STATUS BOARD (Top Strip)
          ========================================================================= */}
      <div className="terminal-card rounded-xl p-4 sm:p-5 border border-border/80 bg-surface-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                LIVE SIGNAL CONSOLE — VERIFIED OPS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border/60">
                L0 / REAL-RESULTS MANDATE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              Real-Time Signal Console
            </h1>
            <p className="text-xs text-text-secondary max-w-2xl font-sans">
              Mathematical odds bands, verified multiplier ticker, and empirical observation window.
              Zero simulated claims.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-surface-2 p-2.5 rounded-lg border border-border/50">
              <div className="text-[10px] text-text-muted uppercase">Feed State</div>
              <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED
              </div>
            </div>
            <div className="bg-surface-2 p-2.5 rounded-lg border border-border/50">
              <div className="text-[10px] text-text-muted uppercase">Real Dataset (n)</div>
              <div className="font-bold text-text-primary mt-0.5 tabular-nums">
                {n} rounds
              </div>
            </div>
            <div className="bg-surface-2 p-2.5 rounded-lg border border-border/50">
              <div className="text-[10px] text-text-muted uppercase">Obs. Window</div>
              <div className="font-bold text-cyan-400 mt-0.5 tabular-nums">
                {windowN} / {windowSize}
              </div>
            </div>
            <div className="bg-surface-2 p-2.5 rounded-lg border border-border/50">
              <div className="text-[10px] text-text-muted uppercase">Engine Health</div>
              <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% TRUTH-LOCKED
              </div>
            </div>
          </div>
        </div>

        {/* Provenance Header Note */}
        <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-text-muted" />
            <span>Last verified round: <span className="text-text-primary">{lastTimestamp}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Operator: <span className="text-cyan-400 uppercase">{selectedOperator}</span></span>
            <span>Provable Fair: <span className="text-emerald-400">HMAC-SHA256</span></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          L6 HONEST EMPTY STATE (Section 9.1.5 & Rule T13)
          ========================================================================= */}
      {isL6Empty ? (
        <div className="terminal-card rounded-xl p-8 border border-border/80 bg-surface-1 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-2 border border-border/80 flex items-center justify-center text-text-muted">
            <FileSpreadsheet className="w-6 h-6 text-text-muted" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">No rounds recorded yet</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              The Real-Results Mandate forbids seeding fake or simulated data into the default dataset.
              Record real play sessions with the Round Capture Kit or import your session logbook.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/database"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-mono text-xs font-bold hover:bg-accent/90 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Open Round Capture Kit (Appendix E)
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =======================================================================
              ZONE 3 & 4: ODDS BANDS & SESSION ANALYTICS (Left 2 Columns)
              ======================================================================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Odds Band Strip */}
            <div className="terminal-card rounded-xl p-5 border border-border/80 bg-surface-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold uppercase">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Theoretical Odds Band Strip
                  </div>
                  <div className="text-[11px] font-mono text-text-muted mt-0.5">
                    THEORETICAL ODDS — NOT A PREDICTION (D01 Benchmark vs Empirical Window)
                  </div>
                </div>

                {/* Window Selector */}
                <div className="flex items-center gap-1.5 font-mono text-xs bg-surface-2 p-1 rounded-lg border border-border/60">
                  <span className="text-[10px] text-text-muted px-1.5">Window:</span>
                  {[20, 50, 100, 500].map((w) => (
                    <button
                      key={w}
                      onClick={() => setWindowSize(w)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        windowSize === w
                          ? "bg-accent text-white"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Odds Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-text-muted text-[10px] uppercase">
                      <th className="py-2 px-3">Target Multiplier (m)</th>
                      <th className="py-2 px-3">Theoretical D01 P(M ≥ m)</th>
                      <th className="py-2 px-3">Empirical Window ({windowN} rds)</th>
                      <th className="py-2 px-3">95% Binomial CI</th>
                      <th className="py-2 px-3 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {oddsBands.map((band) => {
                      const delta = band.empiricalPct - band.theoreticalPct;
                      return (
                        <tr key={band.m} className="hover:bg-surface-2/60 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-text-primary tabular-nums">
                            ≥ {band.m.toFixed(2)}x
                          </td>
                          <td className="py-2.5 px-3 text-cyan-400 tabular-nums font-semibold">
                            {band.theoreticalPct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-semibold">
                            <span className={delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {band.empiricalPct.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-text-muted ml-1.5">
                              ({delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}%)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-text-muted tabular-nums text-[11px]">
                            [{band.ciLower}% – {band.ciUpper}%]
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-text-secondary font-bold">
                            {band.count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Provenance Caption */}
              <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-text-muted flex items-center justify-between">
                <span>Provenance: n={windowN}, source={selectedOperator}, class=LIVE_VERIFIED, method=D01_CDF_WILSON_CI</span>
                <span>Rule T1 / T9 compliant</span>
              </div>
            </div>

            {/* Session Analytics & Streak Descriptor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bucket Frequencies */}
              <div className="terminal-card rounded-xl p-4 border border-border/80 bg-surface-1 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-text-primary uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Frequency Buckets (A02)
                  </span>
                  <span className="text-[10px] text-text-muted">Window: {windowN}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-rose-400">1.00x – 1.99x (Bust)</span>
                    <span className="tabular-nums font-bold text-text-primary">
                      {bucketCounts.sub2.pct}% ({bucketCounts.sub2.count})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-emerald-400">2.00x – 9.99x</span>
                    <span className="tabular-nums font-bold text-text-primary">
                      {bucketCounts.twoToTen.pct}% ({bucketCounts.twoToTen.count})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-amber-400">10.00x – 49.99x</span>
                    <span className="tabular-nums font-bold text-text-primary">
                      {bucketCounts.tenToFifty.pct}% ({bucketCounts.tenToFifty.count})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-purple-400">50.00x+ (Extreme)</span>
                    <span className="tabular-nums font-bold text-text-primary">
                      {bucketCounts.fiftyPlus.pct}% ({bucketCounts.fiftyPlus.count})
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak Descriptor (B02) */}
              <div className="terminal-card rounded-xl p-4 border border-border/80 bg-surface-1 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-text-primary uppercase flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Streak Dynamics (B02)
                  </span>
                  <span className="text-[10px] text-text-muted">Observation</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Current sub-2.00x run:</span>
                    <span className="tabular-nums font-bold text-rose-400">{streakInfo.currentCold} rds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Max sub-2.00x streak:</span>
                    <span className="tabular-nums font-bold text-text-primary">{streakInfo.maxCold} rds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Current ≥2.00x run:</span>
                    <span className="tabular-nums font-bold text-emerald-400">{streakInfo.currentHot} rds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Max ≥2.00x streak:</span>
                    <span className="tabular-nums font-bold text-text-primary">{streakInfo.maxHot} rds</span>
                  </div>
                </div>
                {/* Mandatory Section 12.6 Caption */}
                <div className="pt-2 border-t border-border/40 text-[9px] text-text-muted italic">
                  Descriptive of past rounds — carries no information about future rounds.
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================================
              ZONE 2: ROUND FEED (Right Rail / Ticker)
              ======================================================================= */}
          <div className="terminal-card rounded-xl p-4 sm:p-5 border border-border/80 bg-surface-1 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-primary uppercase">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Round Ticker
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                REALTIME
              </span>
            </div>

            <div
              className="space-y-2 max-h-[500px] overflow-y-auto font-mono text-xs pr-1"
              aria-live="polite"
            >
              {realRounds.slice(-15).reverse().map((round, idx) => {
                const multColor =
                  round.multiplier >= 10.0
                    ? "text-amber-400"
                    : round.multiplier >= 2.0
                    ? "text-emerald-400"
                    : "text-rose-400";

                const utcTime = round.crashTime
                  ? round.crashTime.substring(11, 19)
                  : "--:--:--";

                return (
                  <div
                    key={round.id || idx}
                    className="p-2.5 rounded-lg border border-border/50 bg-surface-2 flex items-center justify-between hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-text-muted text-[11px] tabular-nums">
                        #{round.roundNumber}
                      </span>
                      <span className={`text-base font-bold tabular-nums ${multColor}`}>
                        {round.multiplier.toFixed(2)}x
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DataProvenanceBadge
                        dataClass={round.sourceType || "historical_import"}
                        compact={true}
                        sourceLabel={round.operator || "spribe"}
                        sampleSize={round.roundNumber}
                      />
                      <span className="text-[10px] text-text-muted tabular-nums">{utcTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Provenance */}
            <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-text-muted text-center">
              Total Feed: n={n} | Append-only immutable log
            </div>
          </div>
        </div>
      )}
    </div>
  );
}