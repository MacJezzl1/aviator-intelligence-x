import React from "react";
import { type DataSourceType } from "@/lib/data/ingestion";
import { ShieldCheck, Clock, Database, User, Play, AlertCircle } from "lucide-react";

export interface DataProvenanceProps {
  dataClass: DataSourceType | "demo";
  sampleSize?: number;
  methodology?: string;
  sourceLabel?: string;
  timestamp?: string;
  limitations?: string;
  compact?: boolean;
}

export function DataProvenanceBadge({
  dataClass,
  sampleSize,
  methodology,
  sourceLabel,
  timestamp,
  limitations,
  compact = false,
}: DataProvenanceProps) {
  const normalizedClass = (dataClass || "demonstration").toLowerCase();

  const badgeConfig = {
    live_verified: {
      label: "LIVE VERIFIED",
      bg: "bg-emerald-950/70 text-emerald-400 border-emerald-500/40",
      icon: ShieldCheck,
    },
    delayed: {
      label: "DELAYED FEED",
      bg: "bg-amber-950/70 text-amber-400 border-amber-500/40",
      icon: Clock,
    },
    historical_import: {
      label: "IMPORTED DATA",
      bg: "bg-blue-950/70 text-aix-cyan border-blue-500/40",
      icon: Database,
    },
    manual_entry: {
      label: "MANUAL ENTRY",
      bg: "bg-purple-950/70 text-purple-300 border-purple-500/40",
      icon: User,
    },
    demonstration: {
      label: "DEMO SIMULATION",
      bg: "bg-surface-100 text-slate-400 border-border",
      icon: Play,
    },
    demo: {
      label: "DEMO SIMULATION",
      bg: "bg-surface-100 text-slate-400 border-border",
      icon: Play,
    },
  }[normalizedClass] || {
    label: "DEMO",
    bg: "bg-surface-100 text-slate-400 border-border",
    icon: Play,
  };

  const Icon = badgeConfig.icon;

  if (compact) {
    return (
      <span
        title={limitations ? `Limitations: ${limitations}` : `Provenance: ${badgeConfig.label}`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border uppercase tracking-wider ${badgeConfig.bg}`}
      >
        <Icon className="w-2.5 h-2.5" />
        {badgeConfig.label}
        {sampleSize !== undefined && ` (N=${sampleSize})`}
      </span>
    );
  }

  return (
    <div className={`p-2.5 rounded-lg border font-mono text-xs ${badgeConfig.bg} space-y-1`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
          <Icon className="w-3.5 h-3.5" />
          {badgeConfig.label}
        </span>
        {sampleSize !== undefined && (
          <span className="text-[10px] opacity-80">N = {sampleSize.toLocaleString()}</span>
        )}
      </div>

      <div className="text-[10px] opacity-75 space-y-0.5">
        {sourceLabel && <div>Source: <span className="font-semibold">{sourceLabel}</span></div>}
        {methodology && <div>Method: {methodology}</div>}
        {timestamp && <div>Timestamp: {timestamp}</div>}
      </div>

      {limitations && (
        <div className="pt-1 mt-1 border-t border-current/20 text-[9px] opacity-70 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>{limitations}</span>
        </div>
      )}
    </div>
  );
}
