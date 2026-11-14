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
  X
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { currentUserRole, activeWindow, setActiveWindow } = useTerminal();

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Live Intelligence", href: "/live", icon: Radio, badge: "LIVE" },
    { name: "AI Council (100 Agents)", href: "/council", icon: Users2, badge: "100" },
    { name: "Statistical Laboratory", href: "/laboratory", icon: FlaskConical },
    { name: "Forecast Research", href: "/forecasts", icon: TrendingUp },
    { name: "Historical Database", href: "/database", icon: Database },
    { name: "Model Performance", href: "/performance", icon: BarChart3 },
    { name: "Risk Analysis", href: "/risk", icon: ShieldCheck },
    { name: "Research Reports", href: "/reports", icon: FileText },
    ...(currentUserRole === "OWNER" || currentUserRole === "ADMIN"
      ? [{ name: "Owner Security Panel", href: "/admin", icon: Lock, badge: "RESTRICTED" }]
      : []),
    { name: "Settings & System", href: "/settings", icon: Settings },
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
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-aix-blue/15 to-aix-violet/15 text-white border-l-2 border-aix-blue"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-aix-blue" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      item.badge === "RESTRICTED"
                        ? "bg-rose-950/60 text-aix-rose border border-rose-500/30"
                        : item.badge === "LIVE"
                        ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30 animate-pulse"
                        : "bg-surface-50 text-aix-cyan border border-aix-cyan/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div className="p-3 border-t border-border text-[11px] font-mono text-slate-500 bg-surface-300">
          <div className="flex items-center justify-between">
            <span>RNG Fair State:</span>
            <span className="text-aix-emerald font-semibold">VALIDATED</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Server Mode:</span>
            <span className="text-slate-300 uppercase">{process.env.NODE_ENV || "PROD"}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
