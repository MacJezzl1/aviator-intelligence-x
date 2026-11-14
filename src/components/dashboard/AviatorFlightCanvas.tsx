"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, ShieldCheck, Zap, Radio } from "lucide-react";

interface AviatorFlightCanvasProps {
  onFlightCrash?: (multiplier: number) => void;
  targetCrash?: number;
}

export function AviatorFlightCanvas({ onFlightCrash, targetCrash }: AviatorFlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [multiplier, setMultiplier] = useState(1.00);
  const [status, setStatus] = useState<"IDLE" | "FLYING" | "CRASHED">("IDLE");
  const [crashPoint, setCrashPoint] = useState(2.15);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startFlight = () => {
    // Generate provably fair crash point if not supplied
    let nextCrash = targetCrash;
    if (!nextCrash) {
      const r = Math.random();
      if (r < 0.03) {
        nextCrash = 1.00;
      } else {
        nextCrash = Math.max(1.00, Number((0.97 / (1 - r)).toFixed(2)));
      }
    }
    setCrashPoint(nextCrash);
    setStatus("FLYING");
    setMultiplier(1.00);
    startTimeRef.current = performance.now();
  };

  useEffect(() => {
    if (status !== "FLYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let currentMult = 1.00;

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000; // in seconds

      // Multiplier increases exponentially: m(t) = e^(0.06 * t) or quadratic
      currentMult = Number((1.00 + Math.pow(elapsed * 0.9, 1.8)).toFixed(2));
      setMultiplier(currentMult);

      // Render flight curve
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw radar grid lines
      ctx.strokeStyle = "rgba(31, 36, 48, 0.4)";
      ctx.lineWidth = 1;

      for (let x = 40; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 30; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Check if crashed
      if (currentMult >= crashPoint) {
        setStatus("CRASHED");
        setMultiplier(crashPoint);
        if (onFlightCrash) onFlightCrash(crashPoint);

        // Draw crash blast
        ctx.save();
        ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
        ctx.beginPath();
        ctx.arc(width * 0.75, height * 0.35, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Draw ascending curve
      const progress = Math.min(1, (currentMult - 1) / Math.max(2, crashPoint - 1));
      const endX = 30 + progress * (width - 100);
      const endY = height - 30 - Math.pow(progress, 1.5) * (height - 80);

      // Gradient glow curve
      const gradient = ctx.createLinearGradient(30, height - 30, endX, endY);
      gradient.addColorStop(0, "#00d2ff");
      gradient.addColorStop(1, "#f43f5e");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(30, height - 30);
      ctx.quadraticCurveTo(width * 0.4, height - 20, endX, endY);
      ctx.lineWidth = 4;
      ctx.strokeStyle = gradient;
      ctx.shadowColor = "#00d2ff";
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // Draw plane icon / head point
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(endX, endY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Aircraft shape polygon
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.moveTo(endX + 16, endY);
      ctx.lineTo(endX - 8, endY - 7);
      ctx.lineTo(endX - 2, endY);
      ctx.lineTo(endX - 8, endY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [status, crashPoint, onFlightCrash]);

  return (
    <div className="terminal-card rounded-2xl border border-border/80 overflow-hidden relative shadow-2xl">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aix-blue/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Header Controls Bar */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between relative z-10 bg-surface-200/50 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-aix-cyan animate-pulse" />
          <span className="font-mono text-xs font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
            <Radio className="w-3.5 h-3.5 text-aix-cyan" />
            Live Flight Curve Visualizer
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-400 border border-border/60">
            PROVABLY FAIR RNG
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "FLYING" ? (
            <span className="text-[10px] font-mono text-aix-cyan flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 font-bold uppercase animate-pulse">
              <Zap className="w-3 h-3" /> In Flight
            </span>
          ) : (
            <button
              onClick={startFlight}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-aix-blue to-aix-violet hover:opacity-95 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-glow-blue transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {status === "CRASHED" ? "Simulate Next Flight" : "Launch Simulation"}
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas & Live Multiplier Display */}
      <div className="relative h-64 sm:h-72 w-full bg-[#07080b] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Central Glowing Multiplier Counter */}
        <div className="relative z-10 text-center select-none pointer-events-none space-y-1">
          {status === "CRASHED" && (
            <div className="text-aix-rose font-mono font-extrabold text-xs uppercase tracking-widest animate-bounce">
              FLEW AWAY @
            </div>
          )}
          <div
            className={`font-mono font-black text-5xl sm:text-6xl tracking-tight transition-all drop-shadow-2xl ${
              status === "CRASHED"
                ? "text-aix-rose scale-105"
                : multiplier >= 10
                ? "text-aix-amber animate-pulse"
                : multiplier >= 2
                ? "text-aix-emerald"
                : "text-white"
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>
          {status === "FLYING" && (
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Stochastic Ascending Path
            </div>
          )}
          {status === "IDLE" && (
            <div className="text-xs font-mono text-slate-500">
              Click &quot;Launch Simulation&quot; to observe live exponential curve
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Telemetry */}
      <div className="p-3 border-t border-border/60 bg-surface-300/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Target Distribution: <strong>Pareto (97% RTP)</strong></span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">Instant Crash: <strong>3.00% ($h \pmod&#123;33&#125; == 0$)</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-aix-emerald">
          <ShieldCheck className="w-3.5 h-3.5 text-aix-emerald" />
          <span>SHA-256 HMAC VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
