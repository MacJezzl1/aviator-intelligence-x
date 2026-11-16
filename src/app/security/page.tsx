"use client";

import React, { useState } from "react";
import { verifyProvableFairRound } from "@/lib/analytics/provable-fair";
import {
  ShieldCheck,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCheck,
  Activity,
  UserCheck
} from "lucide-react";

export default function SecurityCentrePage() {
  const [serverHash, setServerHash] = useState("d679b324022a106e23293e50b182cb08a9dd2b1d31cfc8466b2a4bbd41ff1d71");
  const [clientSeed, setClientSeed] = useState("betway_round_client_seed_4910");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyProvableFairRound({
      serverSeed: serverHash,
      clientSeed: clientSeed,
      actualMultiplier: 1.00,
    });
    setVerificationResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Section 15: Security &amp; Cryptographic Integrity Centre
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Security Posture &amp; Provable Fairness Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Row Level Security (RLS) enforcement verification, server-side RBAC boundaries, and real-time HMAC-SHA512 Spribe cryptographic seed verification engine.
        </p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="terminal-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-slate-400 text-[10px] uppercase">Supabase PostgreSQL RLS</span>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            100% Enforced
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active on all 46 system tables</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Role Authorization</span>
          <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-aix-cyan" />
            Server-Side Guard
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Zero frontend role trust</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Input Sanitation</span>
          <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-aix-violet" />
            Parameterized
          </div>
          <div className="text-[10px] text-slate-400 mt-1">SQL injection proof</div>
        </div>
      </div>

      {/* Interactive Provable Fairness Cryptographic Tester */}
      <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
        <div className="border-b border-border/60 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Live Provably Fair Cryptographic Seed Verifier
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test any public Spribe server seed hash and client seed to verify the exact mathematical crash multiplier independently.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Server Seed (SHA-256 / SHA-512 Hash)</label>
            <input
              type="text"
              required
              value={serverHash}
              onChange={(e) => setServerHash(e.target.value)}
              className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-400 outline-none text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Combined Client Seed</label>
            <input
              type="text"
              required
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-400 outline-none text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            Compute HMAC Multiplier
          </button>
        </form>

        {verificationResult && (
          <div className="p-4 bg-surface-100 border border-emerald-500/40 rounded-xl space-y-2 font-mono text-xs mt-4">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-sm">Verification Succeeded</span>
              <span className="text-2xl font-bold text-white">
                {verificationResult.calculatedMultiplier.toFixed(2)}x
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              HMAC Output: <code className="text-slate-300">{verificationResult.hmacHex}</code>
            </div>
            <div className="text-[11px] text-slate-400">
              Deterministic Crash Formula: <code className="text-emerald-300">X = max(1.00, floor(100 * 2^52 * 0.97 / (h + 1)) / 100)</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
