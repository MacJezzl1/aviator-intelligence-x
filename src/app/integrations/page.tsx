"use client";

import React from "react";
import { getPlatformList } from "@/lib/platform/registry";
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  Globe,
  Database,
  ArrowUpRight
} from "lucide-react";

export default function DataIntegrationsPage() {
  const platforms = getPlatformList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <Server className="w-4 h-4 text-aix-cyan" />
          Section 14: Data Ingestion &amp; Platform Integrations
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Platform Compatibility Registry &amp; Authorized Feeds
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Multi-platform connection management. Track verified data adapters for Betway, Hollywoodbets, and Spribe reference streams. Automated connection health checks, latency monitoring, and rate-limiting.
        </p>
      </div>

      {/* Platform Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {platforms.map((plat) => (
          <div
            key={plat.id}
            className="terminal-card rounded-xl p-5 border border-border space-y-4 bg-surface-200"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <span className="text-[10px] text-aix-cyan uppercase tracking-wider font-bold">
                  [{plat.shortCode}] &bull; {plat.gameIdentifier}
                </span>
                <h3 className="font-bold text-white text-base mt-0.5">{plat.displayName}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">{plat.operatorName}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                plat.verificationStatus === "verified"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                  : "bg-surface-100 text-aix-cyan border border-border"
              }`}>
                {plat.verificationStatus.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">ENGINE PROVIDER</span>
                <span className="font-bold text-white">{plat.gameProvider}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">INTEGRATION METHOD</span>
                <span className="font-bold text-white uppercase">{plat.integrationMethod.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CONNECTION HEALTH</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {plat.connectionHealth.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">RATE LIMIT CAP</span>
                <span className="font-bold text-white">{plat.capabilities.rateLimitRpm} RPM</span>
              </div>
            </div>

            <div className="p-3 bg-surface-100 rounded-lg border border-border text-[11px] text-slate-400">
              {plat.notes}
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Jurisdiction: {plat.jurisdiction}</span>
              <span>Sync: {new Date(plat.lastSuccessfulSync).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
