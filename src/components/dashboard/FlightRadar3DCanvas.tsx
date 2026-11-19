"use client";

import React, { useEffect, useRef, useState } from "react";

interface FlightPoint {
  multiplier: number;
  label?: string;
  isRecent?: boolean;
}

interface FlightRadar3DCanvasProps {
  recentMultipliers?: number[];
  projectedRange?: { min: number; max: number };
  targetCorridor?: string;
  isLive?: boolean;
}

export function FlightRadar3DCanvas({
  recentMultipliers = [1.25, 2.45, 1.12, 4.88, 1.76, 3.10, 1.40],
  projectedRange = { min: 1.85, max: 2.40 },
  targetCorridor = "1.85x - 2.40x",
  isLive = true,
}: FlightRadar3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Handle 3D perspective mouse tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 12), y: x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(centerX, centerY) - 20;

      ctx.clearRect(0, 0, width, height);

      // 1. Dark holographic radial background
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius);
      bgGrad.addColorStop(0, "rgba(10, 16, 28, 0.95)");
      bgGrad.addColorStop(0.7, "rgba(8, 12, 20, 0.98)");
      bgGrad.addColorStop(1, "rgba(5, 7, 12, 1)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Concentric Radar Rings
      ctx.lineWidth = 1;
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((pct, idx) => {
        const r = maxRadius * pct;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 3 ? "rgba(56, 189, 248, 0.35)" : "rgba(35, 43, 58, 0.6)";
        ctx.stroke();

        // Multiplier elevation marks on rings
        const ringLabel = `${(1 + pct * 4).toFixed(1)}x`;
        ctx.fillStyle = "rgba(154, 163, 178, 0.4)";
        ctx.font = "9px monospace";
        ctx.fillText(ringLabel, centerX + 6, centerY - r + 12);
      });

      // 3. Polar Grid Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.strokeStyle = "rgba(35, 43, 58, 0.4)";
      ctx.stroke();

      // Diagonal cross-hairs
      ctx.beginPath();
      const diag = maxRadius * 0.707;
      ctx.moveTo(centerX - diag, centerY - diag);
      ctx.lineTo(centerX + diag, centerY + diag);
      ctx.moveTo(centerX - diag, centerY + diag);
      ctx.lineTo(centerX + diag, centerY - diag);
      ctx.strokeStyle = "rgba(35, 43, 58, 0.25)";
      ctx.stroke();

      // 4. Rotating Sweep Beam
      if (isLive) {
        angle += 0.025;
        const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        sweepGrad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
        sweepGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, maxRadius, angle - 0.4, angle, false);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        // Leading sweep line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 5. Projected Target Corridor Highlight Arc
      ctx.save();
      const corridorMinR = maxRadius * Math.min(1, Math.max(0.1, (projectedRange.min - 1) / 4));
      const corridorMaxR = maxRadius * Math.min(1, Math.max(0.1, (projectedRange.max - 1) / 4));

      ctx.beginPath();
      ctx.arc(centerX, centerY, corridorMaxR, -0.6, 0.6);
      ctx.arc(centerX, centerY, corridorMinR, 0.6, -0.6, true);
      ctx.closePath();
      ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 6. Flight Trajectory History Points
      const points = recentMultipliers.slice(-12);
      points.forEach((mult, i) => {
        const pointAngle = (i / points.length) * Math.PI * 2 - Math.PI / 2;
        const normMult = Math.min(1, Math.max(0.08, (mult - 1) / 5));
        const dist = maxRadius * normMult;
        const px = centerX + Math.cos(pointAngle) * dist;
        const py = centerY + Math.sin(pointAngle) * dist;

        const isLatest = i === points.length - 1;
        const isBust = mult < 2.0;

        ctx.beginPath();
        ctx.arc(px, py, isLatest ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isLatest
          ? "rgba(244, 63, 94, 0.95)"
          : isBust
          ? "rgba(154, 163, 178, 0.6)"
          : "rgba(52, 211, 153, 0.8)";
        ctx.fill();

        if (isLatest) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Target reticle on latest flight
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(244, 63, 94, 0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px monospace";
          ctx.fillText(`${mult.toFixed(2)}x`, px + 14, py + 4);
        }
      });

      // 7. Center HUD Reticle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [recentMultipliers, projectedRange, isLive]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl overflow-hidden card-3d p-4 transition-transform duration-200"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
          3D FLIGHT RADAR &bull; LIVE HUD
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 text-right font-mono text-[11px]">
        <span className="text-slate-400">PROJECTED CORRIDOR:</span>{" "}
        <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          {targetCorridor}
        </span>
      </div>

      {/* Canvas */}
      <div className="flex items-center justify-center pt-5 pb-2">
        <canvas
          ref={canvasRef}
          width={460}
          height={380}
          className="max-w-full h-auto drop-shadow-[0_0_20px_rgba(56,189,248,0.15)]"
        />
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-center">
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Elevation Vector</div>
          <div className="text-xs font-bold text-white tracking-wide">0.97 / (1-r)</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Radar Azimuth</div>
          <div className="text-xs font-bold text-cyan-400">360&deg; Active Sweep</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Stochastic RTP</div>
          <div className="text-xs font-bold text-emerald-400">97.00% Certified</div>
        </div>
      </div>
    </div>
  );
}
