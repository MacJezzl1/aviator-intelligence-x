"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, X } from "lucide-react";

export function ResponsibleGamingBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-surface-100 border-b border-border/40 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-aix-emerald" />
          Aviator Intelligence X is an analytical quantitative research platform. No betting automation or guaranteed signals.
        </span>
        <button
          onClick={() => setDismissed(false)}
          className="text-aix-blue hover:underline text-[11px]"
        >
          View Full Risk Disclosure
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-surface-100 to-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-between relative z-30">
      <div className="flex items-center gap-2 max-w-5xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="leading-snug">
          <strong className="text-amber-300 uppercase tracking-wide mr-1.5 font-semibold">
            Responsible Research Notice:
          </strong>
          Aviator rounds are generated using cryptographic provably fair random seeds. Historical streaks and distributions carry zero mathematical guarantee for future outcomes. Long-term house edge is fixed (-3% RTP). Never chase losses or escalate stakes.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
        title="Minimize notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
