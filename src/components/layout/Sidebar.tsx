"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/context/TerminalContext";
import {
  Compass,
  Radio,
  Users2,
  FlaskConical,
  TrendingUp,
  Database,
  BarChart3,
  ShieldCheck,
  Lock,
  X,
  Target,
  Layers,
  Activity,
  GitCompare,
  Scale
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { currentUserRole, activeWindow, setActiveWindow } = useTerminal();

  const navigationGroups = [
    {
      group: "PRIMARY RADAR & FLIGHT",
      items: [
        { name: "Next Flight Radar", href: "/predictor", icon: Compass, badge: "LIVE HUD" },
        { name: "Live Signal Console", href: "/console", icon: Radio, badge: "4-ZONE" },
        { name: "Overview Terminal", href: "/", icon: Activity },
      ],
    },
    {
      group: "INTELLIGENCE & AI",
      items: [
        { name: "100-Agent Council", href: "/agents", icon: Users2, badge: "100" },
        { name: "AI Debate Lab", href: "/debate", icon: Scale },
        { name: "Simulation Lab", href: "/laboratory", icon: FlaskConical },
        { name: "Chief Council Report", href: "/council", icon: Target },
      ],
    },
    {
      group: "QUANTITATIVE RESEARCH",
      items: [
        { name: "Forecast & Calibration", href: "/forecasts", icon: TrendingUp },
        { name: "Actual vs Predicted", href: "/reconciliation", icon: Target, badge: "ECE" },
        { name: "Model Performance", href: "/performance", icon: BarChart3 },
        { name: "Statistical Distributions", href: "/statistics", icon: Layers },
      ],
    },
    {
      group: "PLATFORMS & DATA",
      items: [
        { name: "Betway Analytics", href: "/betway", icon: Radio, badge: "BTW" },
        { name: "Hollywoodbets", href: "/hollywoodbets", icon: Radio, badge: "HWB" },
        { name: "Cross-Platform Lab", href: "/cross-platform", icon: GitCompare },
        { name: "Historical Database", href: "/database", icon: Database },
        { name: "Risk Management", href: "/risk", icon: ShieldCheck },
        { name: "Security Centre", href: "/security", icon: Lock },
        ...(currentUserRole === "OWNER" || currentUserRole === "ADMIN"
          ? [{ name: "Owner Administration", href: "/admin", icon: Lock, badge: "ROOT" }]
          : []),
      ],
    },
  ];

  const windows = [20, 50, 100, 250, 500, "ALL"] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-800">
          <span className="font-bold text-white text-sm">Navigation</span>
          <button onClick={onCloseMobile} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-rose-500 p-0.5 shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-bold text-cyan-400 text-xs">
                AIX
              </div>
            </div>
            <div>
              <div className="font-bold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
                Aviator Intelligence <span className="text-cyan-400">X</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Truth-Locked Terminal
              </div>
            </div>
          </Link>
        </div>

        {/* Rolling Window Selector */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            Analysis Window ($N$ Rounds)
          </div>
          <div className="grid grid-cols-6 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 font-mono text-[10px]">
            {windows.map((w) => (
              <button
                key={w}
                onClick={() => setActiveWindow(w)}
                className={`py-1 text-center rounded transition-all font-semibold ${
                  activeWindow === w
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navigationGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-mono transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-950/70 to-slate-900 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          item.badge === "LIVE HUD"
                            ? "bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse"
                            : isActive
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer State */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine L0 Normal
            </span>
            <span className="text-slate-400 uppercase">
              {currentUserRole || "USER"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
