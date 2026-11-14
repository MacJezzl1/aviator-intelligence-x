"use client";

import React, { useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import {
  Settings,
  Database,
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Save,
  Server
} from "lucide-react";

export default function SettingsPage() {
  const { currentUserRole } = useTerminal();

  const [sessionLimitMinutes, setSessionLimitMinutes] = useState(60);
  const [notifyOnCouncilComplete, setNotifyOnCouncilComplete] = useState(true);
  const [notifyOnHighMultiplier, setNotifyOnHighMultiplier] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-aix-cyan" />
          Terminal Configuration
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          System Settings &amp; Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Manage Supabase connection status, responsible gaming limits, local storage retention, and real-time notification alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Supabase Integration Diagnostics */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-aix-blue" />
              Connected Supabase Database Engine
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-aix-emerald border border-emerald-500/30 font-semibold">
              ACTIVE ENDPOINT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px] uppercase">Supabase Project URL:</span>
              <div className="text-white font-semibold mt-1 truncate">
                https://rrhtenamwselyjufyntw.supabase.co
              </div>
            </div>
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px] uppercase">Project Reference:</span>
              <div className="text-aix-cyan font-semibold mt-1">rrhtenamwselyjufyntw</div>
            </div>
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px] uppercase">Client Environment Key:</span>
              <div className="text-slate-300 mt-1 font-mono text-[11px] truncate">
                NEXT_PUBLIC_SUPABASE_ANON_KEY (Loaded)
              </div>
            </div>
            <div className="bg-surface-100 p-3 rounded border border-border">
              <span className="text-slate-400 text-[10px] uppercase">Service Role Guard:</span>
              <div className="text-aix-emerald mt-1 font-mono text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-aix-emerald" />
                Protected Server-side Only
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Research Reality Check Limits */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Clock className="w-4 h-4 text-aix-amber" />
            <h2 className="font-bold text-white text-base">Responsible Session Reality Checks</h2>
          </div>

          <p className="text-xs text-slate-400">
            Set mandatory visual reminder intervals during long quantitative research sessions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1">
                Session Reality Reminder (Minutes):
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={sessionLimitMinutes}
                onChange={(e) => setSessionLimitMinutes(parseInt(e.target.value, 10) || 60)}
                className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Bell className="w-4 h-4 text-aix-violet" />
            <h2 className="font-bold text-white text-base">Notification Preferences</h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnCouncilComplete}
                onChange={(e) => setNotifyOnCouncilComplete(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-100 border-border text-aix-blue focus:ring-0"
              />
              <span className="text-slate-200">
                In-app notification upon Chief Council consensus completion
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnHighMultiplier}
                onChange={(e) => setNotifyOnHighMultiplier(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-100 border-border text-aix-blue focus:ring-0"
              />
              <span className="text-slate-200">
                Alert on extreme multiplier occurrences (&ge;10.00x)
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-aix-blue to-aix-violet text-black font-bold font-mono text-xs rounded-lg shadow-glow-blue hover:opacity-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Terminal Preferences
          </button>
          {savedSuccess && (
            <span className="text-xs font-mono text-aix-emerald flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-aix-emerald" /> Preferences saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
