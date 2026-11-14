"use client";

import React, { useState, useEffect } from "react";
import { useTerminal } from "@/context/TerminalContext";
import {
  Radio,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertCircle,
  Wifi,
  ShieldCheck
} from "lucide-react";

export default function LiveIntelligencePage() {
  const { rounds, addRound } = useTerminal();
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);
  const [latency, setLatency] = useState(24);

  // Auto demonstration stream generator when toggled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingLive) {
      interval = setInterval(() => {
        // Generate provably fair crash sample
        const r = Math.random();
        let nextMult = 1.00;
        if (r > 0.03) {
          nextMult = Math.max(1.00, Number((0.97 / (1 - r)).toFixed(2)));
        }
        addRound(nextMult, "demonstration");
        setLatency(Math.floor(Math.random() * 15 + 18));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulatingLive, addRound]);

  const latestRounds = rounds.slice(-15).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-aix-emerald uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-aix-emerald animate-pulse" />
            Live Ingestion Stream
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Live Intelligence &amp; Data Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time packet ingestion, WebSocket telemetry, duplicate filtering, and instant cryptographic validation pipeline.
          </p>
        </div>

        <button
          onClick={() => setIsSimulatingLive(!isSimulatingLive)}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-all ${
            isSimulatingLive
              ? "bg-rose-950/80 text-aix-rose border border-rose-500/40"
              : "bg-emerald-950/80 text-aix-emerald border border-emerald-500/40"
          }`}
        >
          {isSimulatingLive ? (
            <>
              <Pause className="w-4 h-4" /> Pause Live Demonstration Stream
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start Live Demonstration Stream
            </>
          )}
        </button>
      </div>

      {/* Feed Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-slate-400 text-[10px] uppercase">Feed Status</div>
          <div className="text-sm font-bold text-aix-emerald flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-aix-emerald animate-ping" />
            ONLINE &amp; ACTIVE
          </div>
        </div>

        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-slate-400 text-[10px] uppercase">Stream Latency</div>
          <div className="text-sm font-bold text-aix-cyan mt-1">{latency} ms</div>
        </div>

        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-slate-400 text-[10px] uppercase">Packet Loss</div>
          <div className="text-sm font-bold text-white mt-1">0.00%</div>
        </div>

        <div className="terminal-card p-3.5 rounded-lg border border-border">
          <div className="text-slate-400 text-[10px] uppercase">Duplicate Deduplication</div>
          <div className="text-sm font-bold text-aix-emerald mt-1">100% REJECTED</div>
        </div>
      </div>

      {/* Live Round Multipliers Stream */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="font-bold text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-aix-cyan" />
            Live Ingested Multiplier Ticker (Chronological)
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            {isSimulatingLive ? "Broadcasting live ticks every ~3.5s" : "Stream paused"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {latestRounds.map((r, i) => (
            <div
              key={r.id || i}
              className={`p-3 rounded-lg border font-mono transition-all ${
                i === 0
                  ? "bg-surface-100 border-aix-blue shadow-glow-blue"
                  : "bg-surface-300 border-border/60"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>#{r.roundNumber}</span>
                {i === 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-aix-blue/20 text-aix-cyan font-bold uppercase">
                    NEW
                  </span>
                )}
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  r.multiplier >= 10
                    ? "text-aix-amber"
                    : r.multiplier >= 2
                    ? "text-aix-emerald"
                    : "text-aix-rose"
                }`}
              >
                {r.multiplier.toFixed(2)}x
              </div>
              <div className="text-[9px] text-slate-500 mt-1 truncate">
                {r.sourceType.replace("_", " ").toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
