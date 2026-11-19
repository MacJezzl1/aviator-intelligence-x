"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/context/TerminalContext";
import {
  Compass,
  Radio,
  Menu,
  ChevronDown,
  Bell,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck
} from "lucide-react";

export function Navbar({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const pathname = usePathname();
  const {
    rounds,
    agents,
    currentUserRole,
    notifications,
    dismissNotification,
    selectedOperator,
    setSelectedOperator,
  } = useTerminal();

  const [showNotifications, setShowNotifications] = useState(false);
  const activeAgentsCount = agents.filter((a) => a.isEnabled).length;
  const latestRound = rounds[rounds.length - 1];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-rose-500 p-0.5 shadow-sm">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-mono font-bold text-cyan-400 text-[11px]">
              X
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-sm">
              AVIATOR INTELLIGENCE <span className="text-cyan-400">X</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                PRO 3D
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Prominent Quick Navigation Center Tabs */}
      <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
        <Link
          href="/predictor"
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all font-bold ${
            pathname === "/predictor"
              ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/30 border border-rose-500/40"
              : "bg-slate-900/80 text-rose-300 hover:text-white border border-rose-500/20 hover:border-rose-500/40"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-rose-300 animate-spin" style={{ animationDuration: "8s" }} />
          Next Flight Radar
        </Link>
        <Link
          href="/console"
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
            pathname === "/console"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          Live Console
        </Link>
        <Link
          href="/agents"
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
            pathname === "/agents"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          100 Agents
        </Link>
      </div>

      {/* Operator Target Switcher & Notifications */}
      <div className="flex items-center gap-3">
        {/* Operator Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedOperator("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
              selectedOperator === "ALL"
                ? "bg-slate-800 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Feeds
          </button>
          <button
            onClick={() => setSelectedOperator("hollywoodbets")}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1.5 ${
              selectedOperator === "hollywoodbets"
                ? "bg-purple-950/80 text-purple-300 font-bold border border-purple-500/40"
                : "text-slate-400 hover:text-purple-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Hollywoodbets
          </button>
          <button
            onClick={() => setSelectedOperator("betway")}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1.5 ${
              selectedOperator === "betway"
                ? "bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Betway
          </button>
        </div>

        {/* Latest Round Quick Pill */}
        {latestRound && (
          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400">Last:</span>
            <span
              className={`font-bold ${
                latestRound.multiplier >= 2.0 ? "text-emerald-400" : "text-slate-300"
              }`}
            >
              {latestRound.multiplier.toFixed(2)}x
            </span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 card-3d p-4 z-50 space-y-2 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white uppercase text-[11px]">System Alerts</span>
                <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <div className="text-slate-400 text-center py-4 text-xs">All telemetry normal. Zero active anomalies.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start justify-between gap-2"
                    >
                      <span>{n.message}</span>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        &times;
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
