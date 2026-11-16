"use client";

import React, { useMemo, useState } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { analyzeWindow } from "@/lib/analytics/rolling";
import { getPlatform } from "@/lib/platform/registry";
import { parseAviatorCSV, parseAviatorJSON, type IngestionResult, type AviatorRoundRecord } from "@/lib/data/ingestion";
import {
  Radio,
  BarChart2,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Search,
  RefreshCw,
  Sliders,
  FileText,
  FileCode,
  Check,
  XCircle
} from "lucide-react";

export default function BetwayIntelligencePage() {
  const { rounds, activeWindow, runCouncilTask, isOrchestrating, addRound, importRounds } = useTerminal();
  const [manualInput, setManualInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "distribution" | "import" | "anomalies">("overview");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [rawPasteText, setRawPasteText] = useState<string>("");
  const [previewResult, setPreviewResult] = useState<IngestionResult | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const platformInfo = getPlatform("betway");

  // Filter dedicated Betway dataset
  const betwayRounds = useMemo(() => {
    const direct = rounds.filter((r) => r.operator === "betway");
    return direct.length > 0 ? direct : rounds;
  }, [rounds]);

  const multipliers = useMemo(() => betwayRounds.map((r) => r.multiplier), [betwayRounds]);
  const analysis = useMemo(() => analyzeWindow(multipliers, activeWindow), [multipliers, activeWindow]);

  const anomalies = useMemo(() => {
    const p95 = analysis.stats.percentiles.p95 || 10.0;
    return betwayRounds
      .map((r, i) => ({ roundIndex: i, multiplier: r.multiplier, isAnomaly: r.multiplier >= p95 }))
      .filter((a) => a.isAnomaly)
      .map((a) => ({
        roundIndex: a.roundIndex,
        multiplier: a.multiplier,
        reason: `Extreme tail multiplier >= ${p95.toFixed(2)}x (p95 threshold)`,
      }));
  }, [betwayRounds, analysis.stats]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualInput);
    if (!isNaN(val) && val >= 1.0) {
      addRound(val, "manual_entry", "betway");
      setManualInput("");
    }
  };

  const handleParseContent = (content: string, format: "csv" | "json") => {
    const existingIds = new Set(rounds.map((r) => r.roundNumber));
    if (format === "csv") {
      const res = parseAviatorCSV(content, existingIds);
      setPreviewResult(res);
    } else {
      const res = parseAviatorJSON(content, existingIds);
      setPreviewResult(res);
    }
    setImportSuccessMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isJson = file.name.endsWith(".json");
    const format = isJson ? "json" : "csv";
    setImportFormat(format);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawPasteText(text);
      handleParseContent(text, format);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (!previewResult || previewResult.records.length === 0) return;
    const taggedRecords: AviatorRoundRecord[] = previewResult.records.map((r) => ({
      ...r,
      operator: "betway",
      sourceType: "historical_import",
    }));
    importRounds(taggedRecords);
    setImportSuccessMsg(`Successfully ingested ${taggedRecords.length} verified Betway rounds into the platform.`);
    setPreviewResult(null);
    setRawPasteText("");
  };

  return (
    <div className="space-y-6">
      {/* Platform Header Card */}
      <div className="terminal-card rounded-xl p-5 border border-emerald-500/30 bg-gradient-to-r from-surface-200 via-surface-100 to-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Department 1: Betway Intelligence Module
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Betway Aviator Research Terminal
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono font-normal">
                {platformInfo.verificationStatus.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Dedicated high-frequency statistical analysis of the certified Spribe Aviator engine deployed on Betway. Real-time feed monitoring, anomaly detection, and empirical calibration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isOrchestrating}
              onClick={() => runCouncilTask("Evaluate whether Betway Aviator empirical distributions deviate from theoretical Spribe 97% RTP parameters.")}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isOrchestrating ? "animate-spin" : ""}`} />
              {isOrchestrating ? "Deliberating..." : "Betway Council Deliberation"}
            </button>
          </div>
        </div>

        {/* Technical Registry Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/60 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Provider / Engine</span>
            <div className="text-white font-medium text-xs truncate">{platformInfo.gameProvider}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Jurisdiction</span>
            <div className="text-slate-300 text-xs truncate">{platformInfo.jurisdiction}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Theoretical RTP</span>
            <div className="text-emerald-400 font-bold text-xs">{platformInfo.gameConfig.rtpPercentage}% (House Edge 3%)</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Verification Standard</span>
            <div className="text-aix-cyan text-xs font-bold">HMAC-SHA512 Client Seeds</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "overview"
              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Statistical Overview
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "distribution"
              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Frequency Distribution
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "import"
              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Data Ingestion &amp; Import
        </button>
        <button
          onClick={() => setActiveTab("anomalies")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "anomalies"
              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Anomaly Detection ({anomalies.length})
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Betway Sample Size</span>
          <div className="text-2xl font-bold text-white mt-1">{betwayRounds.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Verified Round Stream</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Empirical Median</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{analysis.stats.median.toFixed(2)}x</div>
          <div className="text-[10px] text-slate-500 mt-1">Theo: ~1.94x</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Sub-2.00x Bust Rate</span>
          <div className="text-2xl font-bold text-aix-rose mt-1">
            {((betwayRounds.filter((r) => r.multiplier < 2.0).length / Math.max(1, betwayRounds.length)) * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Theo: 51.5%</div>
        </div>

        <div className="terminal-card p-4 rounded-xl border border-border">
          <span className="text-slate-400 text-[10px] uppercase">Runs Test Independence</span>
          <div className="text-2xl font-bold text-aix-cyan mt-1">
            Z = {analysis.randomnessTest.statistic.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            {analysis.randomnessTest.isRandomAtAlpha05 ? "INDEPENDENT" : "VARIANCE DETECTED"}
          </div>
        </div>
      </div>

      {/* Main Content Areas based on Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 terminal-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Betway Multiplier History (Latest {betwayRounds.length} Records)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-[10px] text-slate-400 uppercase">
                    <th className="py-2">Round #</th>
                    <th className="py-2">Crash Multiplier</th>
                    <th className="py-2">Timestamp (UTC)</th>
                    <th className="py-2">Source Type</th>
                    <th className="py-2">Provably Fair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {betwayRounds.slice(-15).reverse().map((r) => (
                    <tr key={r.id} className="hover:bg-surface-100/50">
                      <td className="py-2 text-slate-300">#{r.roundNumber}</td>
                      <td className="py-2 font-bold">
                        <span
                          className={
                            r.multiplier < 2.0
                              ? "text-aix-rose"
                              : r.multiplier < 5.0
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }
                        >
                          {r.multiplier.toFixed(2)}x
                        </span>
                      </td>
                      <td className="py-2 text-slate-400 text-[11px]">{new Date(r.crashTime).toLocaleTimeString()}</td>
                      <td className="py-2 text-slate-400 uppercase text-[10px]">{r.sourceType.replace("_", " ")}</td>
                      <td className="py-2 text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Manual Entry Form */}
          <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Manual Round Entry
            </h3>
            <p className="text-xs text-slate-400">
              Record a verified Betway crash multiplier into the platform database.
            </p>
            <form onSubmit={handleManualAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Crash Multiplier (e.g. 1.84)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  required
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="1.00"
                  className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-400 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Ingest Betway Round
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "distribution" && (
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            Betway Multiplier Frequency Distribution vs Spribe 97% Expectation
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {analysis.distributionBins.map((bin) => {
              const maxPct = 40;
              const barWidth = Math.min(100, (bin.percentage / maxPct) * 100);
              const theoWidth = Math.min(100, (bin.theoreticalPercentage / maxPct) * 100);

              return (
                <div key={bin.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold">{bin.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        Observed: <strong className="text-white">{bin.percentage}%</strong> ({bin.count})
                      </span>
                      <span className="text-slate-500">Theo: {bin.theoreticalPercentage}%</span>
                      <span className={`font-semibold ${bin.discrepancy > 0 ? "text-emerald-400" : "text-aix-rose"}`}>
                        {bin.discrepancy > 0 ? `+${bin.discrepancy}%` : `${bin.discrepancy}%`}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-4 bg-surface-300 rounded overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-400/80 z-10"
                      style={{ left: `${theoWidth}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "import" && (
        <div className="terminal-card rounded-xl p-5 border border-border space-y-5 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Betway Historical Data Ingestion (CSV / JSON)
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Import and validate authentic Betway Aviator crash history. Ingested records undergo cryptographic duplicate checking and range bounding.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setImportFormat("csv");
                  if (rawPasteText) handleParseContent(rawPasteText, "csv");
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                  importFormat === "csv"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                    : "border-border text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                CSV Format
              </button>
              <button
                onClick={() => {
                  setImportFormat("json");
                  if (rawPasteText) handleParseContent(rawPasteText, "json");
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                  importFormat === "json"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                    : "border-border text-slate-400 hover:text-white"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                JSON Format
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {importSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center gap-2 text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* File Upload & Paste Area */}
            <div className="space-y-3">
              <label className="text-slate-300 font-bold block text-xs">
                Select File or Paste Raw {importFormat.toUpperCase()}
              </label>
              <div className="border border-dashed border-border hover:border-emerald-500/50 rounded-lg p-4 text-center transition-colors">
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="betway-file-input"
                />
                <label
                  htmlFor="betway-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-200 border border-border text-xs mb-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  Choose {importFormat.toUpperCase()} File
                </label>
                <p className="text-[11px] text-slate-500">Supports drag &amp; drop or file selection</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px]">Direct Text Input</span>
                  <button
                    onClick={() => {
                      const sample =
                        importFormat === "csv"
                          ? "round_number,multiplier,timestamp\n1201,1.84,2026-11-16T12:00:00Z\n1202,3.45,2026-11-16T12:01:00Z\n1203,1.04,2026-11-16T12:02:00Z\n1204,14.80,2026-11-16T12:03:00Z"
                          : '[\n  {"roundNumber": 1201, "multiplier": 1.84},\n  {"roundNumber": 1202, "multiplier": 3.45},\n  {"roundNumber": 1203, "multiplier": 1.04}\n]';
                      setRawPasteText(sample);
                      handleParseContent(sample, importFormat);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] underline"
                  >
                    Load Sample Template
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={rawPasteText}
                  onChange={(e) => {
                    setRawPasteText(e.target.value);
                    handleParseContent(e.target.value, importFormat);
                  }}
                  placeholder={
                    importFormat === "csv"
                      ? "round_number,multiplier,timestamp\n101,1.94,2026-11-16T10:00:00Z\n102,2.45,2026-11-16T10:01:00Z"
                      : '[{"roundNumber": 101, "multiplier": 1.94}]'
                  }
                  className="w-full bg-surface-100 border border-border rounded-lg p-3 text-slate-200 font-mono text-xs focus:border-emerald-400 outline-none resize-none"
                />
              </div>
            </div>

            {/* Validation & Preview Card */}
            <div className="space-y-3">
              <label className="text-slate-300 font-bold block text-xs">
                Validation &amp; Ingestion Summary
              </label>

              {previewResult ? (
                <div className="space-y-3 bg-surface-100/60 p-4 rounded-lg border border-border">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-surface-200 rounded border border-border">
                      <div className="text-[10px] text-slate-400 uppercase">Processed</div>
                      <div className="text-lg font-bold text-white">{previewResult.totalProcessed}</div>
                    </div>
                    <div className="p-2 bg-emerald-950/40 rounded border border-emerald-500/40">
                      <div className="text-[10px] text-emerald-400 uppercase">Valid</div>
                      <div className="text-lg font-bold text-emerald-300">{previewResult.validCount}</div>
                    </div>
                    <div className="p-2 bg-surface-200 rounded border border-border">
                      <div className="text-[10px] text-slate-400 uppercase">Duplicates</div>
                      <div className="text-lg font-bold text-amber-400">{previewResult.duplicateCount}</div>
                    </div>
                  </div>

                  {previewResult.errors.length > 0 && (
                    <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded text-rose-300 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        Validation Notices ({previewResult.invalidCount}):
                      </div>
                      {previewResult.errors.slice(0, 3).map((err, i) => (
                        <div key={i} className="text-slate-400 truncate">• {err}</div>
                      ))}
                    </div>
                  )}

                  {previewResult.records.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Previewing first {Math.min(5, previewResult.records.length)} rounds:</span>
                        <span className="text-emerald-400 font-bold">{previewResult.records.length} ready</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {previewResult.records.slice(0, 5).map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] px-2 py-1 bg-surface-200 rounded">
                            <span className="text-slate-300">Round #{r.roundNumber}</span>
                            <span className="font-bold text-emerald-400">{r.multiplier.toFixed(2)}x</span>
                            <span className="text-slate-500 text-[10px]">{new Date(r.crashTime).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleCommitImport}
                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all mt-2"
                      >
                        <Check className="w-4 h-4" />
                        Commit {previewResult.records.length} Betway Rounds to Database
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center p-6 bg-surface-100/40 rounded-lg border border-dashed border-border text-center text-slate-500 space-y-2">
                  <Upload className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">No dataset staged. Upload a file or paste content to preview validation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "anomalies" && (
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Statistical Anomaly Detection (IQR &amp; Z-Score Filter)
          </h3>
          {anomalies.length === 0 ? (
            <p className="text-slate-400">No extreme anomalies detected in current observation window.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anomalies.map((anom, i) => (
                <div key={i} className="p-3 bg-surface-100 rounded-lg border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{anom.multiplier.toFixed(2)}x Multiplier</span>
                    <span className="text-slate-500 text-[10px]">Round #{anom.roundIndex + 1}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{anom.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
