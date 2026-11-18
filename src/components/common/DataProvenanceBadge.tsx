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
      bg: "bg-[rgba(52,211,153,0.12)] text-[#34D399] border-[#34D399]/30",
      icon: ShieldCheck,
      style: {},
    },
    delayed: {
      label: "DELAYED FEED",
      bg: "bg-[rgba(245,166,35,0.12)] text-[#F5A623] border-[#F5A623]/30",
      icon: Clock,
      style: {},
    },
    historical_import: {
      label: "IMPORTED DATA",
      bg: "bg-[rgba(56,189,248,0.12)] text-[#38BDF8] border-[#38BDF8]/30",
      icon: Database,
      style: {},
    },
    manual_entry: {
      label: "MANUAL ENTRY",
      bg: "bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border-[#A78BFA]/30",
      icon: User,
      style: {},
    },
    demonstration: {
      label: "DEMO SIMULATION",
      bg: "text-[#9AA3B2] border-[#2E3849]",
      icon: Play,
      style: {
        background: "repeating-linear-gradient(45deg, #10131A, #10131A 6px, #1B2230 6px, #1B2230 12px)",
      },
    },
    demo: {
      label: "DEMO SIMULATION",
      bg: "text-[#9AA3B2] border-[#2E3849]",
      icon: Play,
      style: {
        background: "repeating-linear-gradient(45deg, #10131A, #10131A 6px, #1B2230 6px, #1B2230 12px)",
      },
    },
  }[normalizedClass] || {
    label: "DEMO",
    bg: "text-[#9AA3B2] border-[#2E3849]",
    icon: Play,
    style: {
      background: "repeating-linear-gradient(45deg, #10131A, #10131A 6px, #1B2230 6px, #1B2230 12px)",
    },
  };

  const Icon = badgeConfig.icon;

  if (compact) {
    return (
      <span
        title={limitations ? `Limitations: ${limitations}` : `Provenance: ${badgeConfig.label}`}
        style={badgeConfig.style}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border uppercase tracking-wider ${badgeConfig.bg}`}
      >
        <Icon className="w-2.5 h-2.5" />
        {badgeConfig.label}
        {sampleSize !== undefined && ` (N=${sampleSize})`}
      </span>
    );
  }

  return (
    <div
      style={badgeConfig.style}
      className={`p-2.5 rounded-lg border font-mono text-xs ${badgeConfig.bg} space-y-1`}
    >
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
