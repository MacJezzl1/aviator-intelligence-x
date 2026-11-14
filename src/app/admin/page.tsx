"use client";

import React, { useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { SYSTEM_PROVIDERS, type AIProvider } from "@/lib/agents/providers";
import {
  Lock,
  ShieldAlert,
  Users,
  Key,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  UserCheck
} from "lucide-react";

export default function AdminPage() {
  const { currentUserRole, setCurrentUserRole } = useTerminal();

  // Mock pending access requests for demonstration
  const [accessRequests, setAccessRequests] = useState([
    {
      id: "req-1",
      email: "quant.analyst@hedgefund.com",
      organization: "Alpha Research Lab",
      intendedUse: "High-frequency multiplier dispersion analysis and KS goodness-of-fit testing.",
      status: "pending",
      requestedAt: "2026-11-14 09:15 UTC",
    },
    {
      id: "req-2",
      email: "researcher@math-institute.org",
      organization: "Institute of Stochastic Modeling",
      intendedUse: "Evaluating Brier score calibration for heavy-tailed Pareto distributions.",
      status: "pending",
      requestedAt: "2026-11-14 10:40 UTC",
    },
  ]);

  // Security audit log items
  const [securityLogs] = useState([
    {
      id: "sec-101",
      event: "OWNER_BOOTSTRAP_VERIFIED",
      severity: "LOW",
      actor: "owner@aix-terminal.io",
      ip: "127.0.0.1",
      timestamp: "2026-11-14 08:00:00 UTC",
      desc: "Server-side owner bootstrap verified via AIX_OWNER_EMAIL.",
    },
    {
      id: "sec-102",
      event: "RLS_POLICY_ENFORCED",
      severity: "LOW",
      actor: "PostgreSQL Engine",
      ip: "internal",
      timestamp: "2026-11-14 08:00:01 UTC",
      desc: "25 database tables secured with Row Level Security.",
    },
    {
      id: "sec-103",
      event: "SIMULATED_ROLE_EVALUATION",
      severity: "MEDIUM",
      actor: "admin-session",
      ip: "127.0.0.1",
      timestamp: "2026-11-14 11:22:15 UTC",
      desc: "Administrative role session authorization validated.",
    },
  ]);

  const [providers, setProviders] = useState<AIProvider[]>(SYSTEM_PROVIDERS);
  const [activeTab, setActiveTab] = useState<"security" | "users" | "providers" | "settings">("security");

  const handleApprove = (id: string) => {
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const handleReject = (id: string) => {
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  if (currentUserRole !== "OWNER" && currentUserRole !== "ADMIN") {
    return (
      <div className="terminal-card rounded-xl p-12 border border-rose-500/40 text-center space-y-4">
        <Lock className="w-12 h-12 text-aix-rose mx-auto" />
        <h2 className="text-xl font-bold text-white">ACCESS RESTRICTED — 403 FORBIDDEN</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          This area is strictly restricted to approved OWNER and ADMIN credentials. Switch role using the top bar simulator or authenticate with authorized owner credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-aix-amber uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4 text-aix-amber" />
            Owner-Controlled Security Subsystem
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Owner &amp; Admin Security Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Access approvals, role management, provider API tokens, security audit logs, and system-wide setting configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-950/60 text-aix-amber border border-amber-500/30 font-bold uppercase">
            Active Role: {currentUserRole}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("security")}
          className={`px-3 py-1.5 rounded-t transition-colors ${
            activeTab === "security"
              ? "bg-surface-100 text-aix-amber font-bold border-b-2 border-aix-amber"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Security &amp; Audit Logs
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-3 py-1.5 rounded-t transition-colors ${
            activeTab === "users"
              ? "bg-surface-100 text-aix-blue font-bold border-b-2 border-aix-blue"
              : "text-slate-400 hover:text-white"
          }`}
        >
          User Access Approvals ({accessRequests.filter((r) => r.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`px-3 py-1.5 rounded-t transition-colors ${
            activeTab === "providers"
              ? "bg-surface-100 text-aix-violet font-bold border-b-2 border-aix-violet"
              : "text-slate-400 hover:text-white"
          }`}
        >
          AI Providers &amp; Inference Health
        </button>
      </div>

      {/* TAB 1: SECURITY & AUDIT LOGS */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="terminal-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-aix-amber" />
                Immutable Security Audit Log
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Strict Server-side Audit</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface-100 text-slate-400 text-[10px] uppercase border-b border-border">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-slate-200">
                  {securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-100/50 transition-colors">
                      <td className="p-3 font-bold text-slate-400">{log.id}</td>
                      <td className="p-3 font-bold text-white">{log.event}</td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                            log.severity === "LOW"
                              ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                              : "bg-amber-950/60 text-aix-amber border border-amber-500/30"
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 text-aix-cyan">{log.actor}</td>
                      <td className="p-3 text-slate-400">{log.ip}</td>
                      <td className="p-3 text-[11px] text-slate-400">{log.timestamp}</td>
                      <td className="p-3 text-slate-300 max-w-xs">{log.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCESS APPROVALS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="terminal-card rounded-xl p-4 border border-border text-xs text-slate-300">
            <p>
              New registered users must be approved by the <strong>OWNER</strong> or <strong>ADMIN</strong> before accessing quantitative analytical tools.
            </p>
          </div>

          <div className="space-y-3">
            {accessRequests.map((req) => (
              <div key={req.id} className="terminal-card rounded-xl p-4 border border-border space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div>
                    <span className="font-bold text-white text-sm">{req.email}</span>
                    <span className="text-[11px] text-slate-400 block">{req.organization}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold self-start sm:self-auto ${
                      req.status === "approved"
                        ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                        : req.status === "rejected"
                        ? "bg-rose-950/60 text-aix-rose border border-rose-500/30"
                        : "bg-amber-950/60 text-aix-amber border border-amber-500/30"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Intended Research Scope:</span>
                  <p className="text-slate-300 mt-0.5">{req.intendedUse}</p>
                </div>

                {req.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-aix-emerald font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve Access
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-aix-rose font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI PROVIDERS */}
      {activeTab === "providers" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {providers.map((p) => (
              <div key={p.id} className="terminal-card rounded-xl p-4 border border-border space-y-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      p.currentHealth === "healthy"
                        ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                        : "bg-surface-100 text-slate-400 border border-border"
                    }`}
                  >
                    {p.currentHealth}
                  </span>
                </div>

                <div className="text-[11px] space-y-1 text-slate-400">
                  <div>
                    Provider Type: <strong className="text-slate-200">{p.type}</strong>
                  </div>
                  <div>
                    Free Tier: <strong className="text-aix-cyan">{p.isFreeTier ? "YES" : "NO"}</strong>
                  </div>
                  <div>
                    RPM Limit: <strong className="text-white">{p.rpmLimit} req/min</strong>
                  </div>
                  {p.baseUrl && (
                    <div className="truncate">
                      Endpoint: <span className="text-slate-300">{p.baseUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
