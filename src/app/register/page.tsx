"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="terminal-card w-full max-w-lg p-6 sm:p-8 rounded-xl border border-border shadow-terminal space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aix-cyan to-aix-blue flex items-center justify-center font-mono font-bold text-black text-base shadow-glow-blue mx-auto">
            AIX
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Apply for Research Access
          </h1>
          <p className="text-xs text-slate-400">
            Submit your research profile for Owner review and authorization.
          </p>
        </div>

        {submitted ? (
          <div className="bg-surface-100 p-6 rounded-xl border border-border text-center space-y-3 font-mono text-xs">
            <CheckCircle2 className="w-10 h-10 text-aix-emerald mx-auto" />
            <h2 className="text-sm font-bold text-white">Application Queued for Approval</h2>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Your application for <strong>{email}</strong> has been logged in the <code>access_requests</code> audit queue. You will be notified once reviewed by the Owner.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-4 py-2 bg-surface-50 hover:bg-surface-100 border border-border text-white rounded font-mono text-xs inline-block"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@domain.com"
                className="w-full bg-surface-100 border border-border rounded p-2.5 text-white focus:outline-none focus:border-aix-blue"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Organization / Institution:</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Quantitative Research Group / Independent"
                className="w-full bg-surface-100 border border-border rounded p-2.5 text-white focus:outline-none focus:border-aix-blue"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Intended Research Scope:</label>
              <textarea
                required
                rows={3}
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="Explain the quantitative modeling or statistical validation scope..."
                className="w-full bg-surface-100 border border-border rounded p-2.5 text-white focus:outline-none focus:border-aix-blue"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-aix-cyan to-aix-blue text-black font-bold font-mono text-xs rounded-lg shadow-glow-blue hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              Submit Access Request
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border/60 text-center text-[11px] text-slate-400 font-mono">
          <span>Already authorized? </span>
          <Link href="/login" className="text-aix-blue hover:underline font-semibold">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
