"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerminal } from "@/context/TerminalContext";
import {
  LayoutDashboard,
  Radio,
  Users2,
  FlaskConical,
  TrendingUp,
  Database,
  BarChart3,
  ShieldCheck,
  FileText,
  Lock,
  Settings,
  X,
  GitCompare,
  Scale,
  Target,
  Server,
  Layers
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
      group: "OPERATOR PLATFORMS",
      items: [
        { name: "Main Intelligence", href: "/", icon: LayoutDashboard },
        { name: "Betway Intelligence", href: "/betway", icon: Radio, badge: "BTW" },
        { name: "Hollywoodbets", href: "/hollywoodbets", icon: Radio, badge: "HWB" },
        { name: "Cross-Platform Lab", href: "/cross-platform", icon: GitCompare },
      ],
    },
    {
      group: "100-AGENT AI ENGINE",
      items: [
        { name: "100-Agent Control", href: "/agents", icon: Users2, badge: "100" },
        { name: "AI Debate Centre", href: "/debate", icon: Scale },
        { name: "Simulation Lab", href: "/laboratory", icon: FlaskConical },
      ],
    },
    {
      group: "QUANTITATIVE RESEARCH",
      items: [
        { name: "Forecast Research", href: "/forecasts", icon: TrendingUp },
        { name: "Actual vs Predicted", href: "/reconciliation", icon: Target, badge: "ECE" },
        { name: "Model Performance", href: "/performance", icon: BarChart3 },
        { name: "Statistical Research", href: "/statistics", icon: Layers },
      ],
    },
    {
      group: "INTEGRATION & SECURITY",
      items: [
        { name: "Historical Database", href: "/database", icon: Database },
        { name: "Risk Intelligence", href: "/risk", icon: ShieldCheck },
        { name: "Data Integrations", href: "/integrations", icon: Server },
        { name: "Security Centre", href: "/security", icon: Lock },
        ...(currentUserRole === "OWNER" || currentUserRole === "ADMIN"
          ? [{ name: "Owner Administration", href: "/admin", icon: Lock, badge: "ROOT" }]
          : []),
      ],
    },
  ];

  const windows = [20, 50, 100, 250, 500, 1000, "ALL"] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-surface-200 border-r border-border flex flex-col z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-border">
          <span className="font-bold text-white text-sm">Navigation</span>
          <button onClick={onCloseMobile} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Observation Window Selector */}
        <div className="p-4 border-b border-border">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Observation Window</span>
            <span className="text-aix-cyan">Strict Non-Predictive</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {windows.map((w) => (
              <button
                key={w}
                onClick={() => setActiveWindow(w)}
                className={`py-1 text-[11px] font-mono rounded transition-colors ${
                  activeWindow === w
                    ? "bg-aix-blue text-black font-bold shadow-glow-blue"
                    : "bg-surface-100 text-slate-400 hover:bg-surface-50 hover:text-white"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 font-mono text-xs">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-3 text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-aix-blue/15 to-aix-violet/15 text-white border-l-2 border-aix-blue"
                        : "text-slate-400 hover:text-slate-200 hover:bg-surface-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors ${
                          isActive ? "text-aix-blue" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[8px] font-mono px-1 py-0.2 rounded uppercase font-semibold ${
                          item.badge === "ROOT"
                            ? "bg-rose-950/60 text-aix-rose border border-rose-500/30"
                            : item.badge === "BTW"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : item.badge === "HWB"
                            ? "bg-purple-950/60 text-purple-400 border border-purple-500/30"
                            : "bg-surface-50 text-aix-cyan border border-aix-cyan/20"
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
        </nav>

        {/* Footer Status */}
        <div className="p-3 border-t border-border text-[11px] font-mono text-slate-500 bg-surface-300">
          <div className="flex items-center justify-between">
            <span>RNG Fair State:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VERIFIED
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span>Active Feed:</span>
            <span className="text-white">MULTI-OPERATOR</span>
          </div>
        </div>
      </aside>
    </>
  );
}
