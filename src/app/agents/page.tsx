"use client";

import React, { useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { AGENT_REGISTRY, type AgentDepartment } from "@/lib/agents/registry";
import {
  Users2,
  Cpu,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Flame,
  Scale,
  Activity,
  Layers
} from "lucide-react";

export default function AgentControlRoomPage() {
  const { agents, toggleAgent } = useTerminal();
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const departments: { key: string; label: string; count: number }[] = [
    { key: "ALL", label: "All Departments", count: agents.length },
    { key: "BETWAY_RESEARCH", label: "Betway Research", count: 10 },
    { key: "HOLLYWOODBETS_RESEARCH", label: "Hollywoodbets Research", count: 10 },
    { key: "CROSS_PLATFORM_RESEARCH", label: "Cross-Platform Research", count: 10 },
    { key: "MATHEMATICAL", label: "Mathematical Intelligence", count: 10 },
    { key: "PATTERN_RESEARCH", label: "Historical Pattern Research", count: 10 },
    { key: "FORECAST_RESEARCH", label: "Forecast Research", count: 10 },
    { key: "CRITIC", label: "Independent Critics", count: 10 },
    { key: "SIMULATION_RESEARCH", label: "Simulation Research", count: 10 },
    { key: "RISK", label: "Risk Intelligence", count: 10 },
    { key: "COUNCIL", label: "Chief Intelligence Council", count: 10 },
  ];

  const filteredAgents = agents.filter((a) => {
    if (selectedDept !== "ALL" && a.department !== selectedDept) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.specialization.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    }
    return true;
  });

  const enabledCount = agents.filter((a) => a.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
          <Users2 className="w-4 h-4 text-aix-cyan" />
          Section 5: 100-Agent Orchestration Registry
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              100-Agent Intelligence Control Room
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Directory of 100 specialized logical AI agents partitioned into 10 collaborative and adversarial departments. Configure execution priority, model mapping, and individual activation status.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-surface-100 border border-border text-slate-300">
              Active: <strong className="text-emerald-400">{enabledCount}</strong> / {agents.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by ID, name or specialization..."
            className="w-full pl-9 pr-4 py-2 bg-surface-100 border border-border rounded-lg text-white font-mono placeholder:text-slate-500 outline-none focus:border-aix-blue"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-mono outline-none"
          >
            {departments.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label} ({d.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className={`terminal-card rounded-xl p-4 border transition-all ${
              agent.isEnabled ? "border-border hover:border-slate-500" : "border-rose-950/40 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-aix-cyan border border-border">
                  {agent.id}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{agent.name}</h3>
                <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                  {agent.department.replace(/_/g, " ")}
                </div>
              </div>

              <button
                onClick={() => toggleAgent(agent.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-colors ${
                  agent.isEnabled
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                    : "bg-surface-100 text-slate-500 border border-border"
                }`}
              >
                {agent.isEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-normal mb-3">
              {agent.specialization}
            </p>

            <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div>
                <span>Calibration Score:</span>
                <strong className="text-white block font-bold mt-0.5">
                  {(agent.calibrationScore * 100).toFixed(0)}%
                </strong>
              </div>
              <div>
                <span>Priority Level:</span>
                <strong className="text-aix-cyan block font-bold mt-0.5">
                  Tier {agent.executionPriority}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
