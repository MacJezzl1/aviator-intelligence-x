"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTerminal } from "@/context/TerminalContext";
import { Lock, ShieldAlert, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUserRole } = useTerminal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check server bootstrap endpoint
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.role) {
        setCurrentUserRole(data.role);
      } else {
        setCurrentUserRole("USER");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="terminal-card w-full max-w-md p-6 sm:p-8 rounded-xl border border-border shadow-terminal space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aix-blue to-aix-violet flex items-center justify-center font-mono font-bold text-black text-base shadow-glow-blue mx-auto">
            AIX
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Authenticate Terminal Session
          </h1>
          <p className="text-xs text-slate-400">
            Enter authorized quantitative credentials to access Aviator Intelligence X.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
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
            <label className="block text-slate-300 mb-1">Password:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-surface-100 border border-border rounded p-2.5 text-white focus:outline-none focus:border-aix-blue"
            />
          </div>

          {error && (
            <div className="text-aix-rose text-xs flex items-center gap-1.5 p-2 rounded bg-rose-950/40 border border-rose-500/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-aix-blue to-aix-violet text-black font-bold font-mono text-xs rounded-lg shadow-glow-blue hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating Session..." : "Secure Terminal Login"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-border/60 text-center text-[11px] text-slate-400 font-mono">
          <span>Need platform access? </span>
          <Link href="/register" className="text-aix-blue hover:underline font-semibold">
            Submit Access Request
          </Link>
        </div>
      </div>
    </div>
  );
}
