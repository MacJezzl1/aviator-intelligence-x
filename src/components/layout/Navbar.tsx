"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTerminal } from "@/context/TerminalContext";
import {
  Activity,
  Cpu,
  Database,
  ShieldAlert,
  Bell,
  CheckCircle2,
  AlertCircle,
  Menu,
  ChevronDown
} from "lucide-react";

export function Navbar({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const {
    rounds,
    agents,
    currentUserRole,
    setCurrentUserRole,
    notifications,
    dismissNotification,
    isOrchestrating,
    selectedOperator,
    setSelectedOperator
  } = useTerminal();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const activeAgentsCount = agents.filter((a) => a.isEnabled).length;
  const latestRound = rounds[rounds.length - 1];

  return (
    <header className="sticky top-0 z-40 bg-surface-200/90 backdrop-blur-md border-b border-border/80 px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-surface-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-aix-blue to-aix-violet flex items-center justify-center font-mono font-bold text-black text-sm shadow-glow-blue">
            AIX
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
              AVIATOR INTELLIGENCE <span className="text-aix-blue">X</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-50 text-aix-cyan border border-aix-cyan/30">
                v1.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Quantitative Multi-Agent Research Terminal
            </div>
          </div>
        </Link>
      </div>

      {/* Operator Target Switcher */}
      <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg border border-border text-xs font-mono">
        <button
          onClick={() => setSelectedOperator("ALL")}
          className={`px-2.5 py-1 rounded transition-all text-[11px] ${
            selectedOperator === "ALL"
              ? "bg-surface-50 text-white font-bold border border-border"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Feeds
        </button>
        <button
          onClick={() => setSelectedOperator("hollywoodbets")}
          className={`px-2.5 py-1 rounded transition-all text-[11px] flex items-center gap-1.5 ${
            selectedOperator === "hollywoodbets"
              ? "bg-purple-950/80 text-purple-300 font-bold border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-slate-400 hover:text-purple-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Hollywoodbets
        </button>
        <button
          onClick={() => setSelectedOperator("betway")}
          className={`px-2.5 py-1 rounded transition-all text-[11px] flex items-center gap-1.5 ${
            selectedOperator === "betway"
              ? "bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-slate-400 hover:text-emerald-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Betway
        </button>
      </div>

      {/* Live System Telemetry Badges */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        {/* Latest Round Multiplier */}
        <div className="flex items-center gap-2 bg-surface-100 px-2.5 py-1 rounded border border-border">
          <Activity className="w-3.5 h-3.5 text-aix-cyan animate-pulse" />
          <span className="text-slate-400">LATEST:</span>
          <span
            className={`font-bold ${
              (latestRound?.multiplier || 1) >= 10
                ? "text-aix-amber"
                : (latestRound?.multiplier || 1) >= 2
                ? "text-aix-emerald"
                : "text-aix-rose"
            }`}
          >
            {latestRound ? `${latestRound.multiplier.toFixed(2)}x` : "1.00x"}
          </span>
          <span className="text-[10px] text-slate-500">#{latestRound?.roundNumber || 0}</span>
        </div>

        {/* 100-Agent Orchestrator Status */}
        <div className="flex items-center gap-2 bg-surface-100 px-2.5 py-1 rounded border border-border">
          <Cpu className={`w-3.5 h-3.5 ${isOrchestrating ? "text-aix-blue animate-spin" : "text-aix-violet"}`} />
          <span className="text-slate-400">AGENTS:</span>
          <span className="text-white font-semibold">
            {activeAgentsCount}/100 ACTIVE
          </span>
        </div>

        {/* Dataset Counter */}
        <div className="flex items-center gap-2 bg-surface-100 px-2.5 py-1 rounded border border-border">
          <Database className="w-3.5 h-3.5 text-aix-blue" />
          <span className="text-slate-400">SAMPLE:</span>
          <span className="text-white font-semibold">{rounds.length} ROUNDS</span>
        </div>

        {/* Provably Fair Cryptographic Status */}
        <div className="flex items-center gap-1.5 bg-emerald-950/30 text-aix-emerald px-2 py-1 rounded border border-emerald-500/20 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-aix-emerald" />
          <span>PROVABLY FAIR</span>
        </div>
      </div>

      {/* Role Switcher & Notifications */}
      <div className="flex items-center gap-3">
        {/* Role Badge / Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded bg-surface-100 hover:bg-surface-50 border border-border text-slate-200"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-aix-amber" />
            <span>{currentUserRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-1 w-48 bg-surface-200 border border-border rounded-lg shadow-terminal p-2 z-50 text-xs">
              <div className="text-[10px] text-slate-400 font-mono px-2 py-1 uppercase tracking-wider">
                Simulate Role Perms
              </div>
              {(["OWNER", "ADMIN", "USER"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentUserRole(r);
                    setShowRoleSelector(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between font-mono ${
                    currentUserRole === r
                      ? "bg-aix-blue/15 text-aix-blue font-bold"
                      : "text-slate-300 hover:bg-surface-100"
                  }`}
                >
                  <span>{r}</span>
                  {currentUserRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-aix-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded bg-surface-100 hover:bg-surface-50 border border-border text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-aix-blue animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-200 border border-border rounded-lg shadow-terminal p-3 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <span className="font-semibold text-white">System Notifications</span>
                <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 py-3 text-center">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded bg-surface-100 border border-border/60 flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {n.type === "warn" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-aix-amber flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-aix-cyan flex-shrink-0" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-500 hover:text-slate-300 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
