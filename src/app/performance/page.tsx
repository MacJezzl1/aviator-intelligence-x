"use client";

import React, { useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import {
  BarChart3,
  Award,
  TrendingUp,
  Cpu,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function PerformancePage() {
  const { agents } = useTerminal();
  const [searchQuery, setSearchQuery] = useState("");

  const sortedAgents = [...agents]
    .sort((a, b) => b.calibrationScore - a.calibrationScore)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4 text-aix-cyan" />
          Model Evaluation &amp; Calibration Leaderboard
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Model Performance &amp; Agent Rankings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Continuous tracking of calibration scores, Brier loss adherence, and reliability rankings across all 100 specialized agents.
        </p>
      </div>

      {/* Top 3 Performers Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {sortedAgents.slice(0, 3).map((agent, i) => (
          <div
            key={agent.id}
            className={`terminal-card rounded-xl p-4 border relative overflow-hidden ${
              i === 0
                ? "border-aix-amber/60 shadow-glow-blue"
                : i === 1
                ? "border-slate-300/40"
                : "border-amber-700/40"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="flex items-center gap-1 font-bold text-white">
                <Award
                  className={`w-4 h-4 ${
                    i === 0 ? "text-aix-amber" : i === 1 ? "text-slate-300" : "text-amber-700"
                  }`}
                />
                Rank #{i + 1}
              </span>
              <span className="text-[10px] text-aix-cyan px-1.5 py-0.5 rounded bg-surface-100">
                {agent.department}
              </span>
            </div>
            <h3 className="font-bold text-white text-base">{agent.name}</h3>
            <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{agent.specialization}</p>

            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="text-slate-400">Calibration:</span>
              <span className="text-aix-emerald font-bold text-sm">
                {(agent.calibrationScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Table */}
      <div className="terminal-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-white text-sm">All 100 Agents Calibration Table</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rankings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-100 border border-border rounded pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-aix-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-100 text-slate-400 text-[10px] uppercase border-b border-border sticky top-0 z-10">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Department</th>
                <th className="p-3">Specialization</th>
                <th className="p-3">Calibration Score</th>
                <th className="p-3">Priority</th>
                <th className="p-3">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-slate-200">
              {sortedAgents.map((a, i) => (
                <tr key={a.id} className="hover:bg-surface-100/50 transition-colors">
                  <td className="p-3 font-bold text-slate-400">#{i + 1}</td>
                  <td className="p-3">
                    <span className="font-bold text-white">{a.name}</span>
                    <span className="text-[10px] text-slate-500 block">{a.id}</span>
                  </td>
                  <td className="p-3 text-[11px] text-aix-violet font-semibold">{a.department}</td>
                  <td className="p-3 text-[11px] text-slate-300 max-w-xs truncate">{a.specialization}</td>
                  <td className="p-3 font-bold text-aix-emerald">
                    {(a.calibrationScore * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-slate-400">{a.executionPriority}</td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${
                        a.isEnabled
                          ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                          : "bg-surface-100 text-slate-500 border border-border"
                      }`}
                    >
                      {a.isEnabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
