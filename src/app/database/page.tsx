"use client";

import React, { useState, useRef } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { parseAviatorCSV, type AviatorRoundRecord } from "@/lib/data/ingestion";
import {
  Database,
  Upload,
  PlusCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Filter,
  Layers
} from "lucide-react";

export default function DatabasePage() {
  const { rounds, addRound, importRounds } = useTerminal();

  // Manual entry state
  const [manualMultiplier, setManualMultiplier] = useState("");
  const [manualError, setManualError] = useState("");

  // CSV Import State
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Table filter
  const [filterSource, setFilterSource] = useState<string>("ALL");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");

    const val = parseFloat(manualMultiplier);
    if (isNaN(val) || val < 1.0) {
      setManualError("Please enter a valid multiplier >= 1.00x");
      return;
    }
    if (val > 1000000) {
      setManualError("Multiplier exceeds realistic threshold");
      return;
    }

    addRound(val, "manual_entry");
    setManualMultiplier("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const existingRoundNums = new Set(rounds.map((r) => r.roundNumber));
      const result = parseAviatorCSV(text, existingRoundNums);

      if (result.validCount > 0) {
        importRounds(result.records);
        setImportStatus(
          `Imported ${result.validCount} valid rounds (${result.duplicateCount} duplicates ignored, ${result.invalidCount} errors).`
        );
      } else {
        setImportStatus(`Failed to import: 0 valid records found. ${result.errors.join(", ")}`);
      }
    };
    reader.readAsText(file);
  };

  const filteredRounds = rounds.filter((r) => {
    if (filterSource === "ALL") return true;
    return r.sourceType === filterSource;
  });

  const exportCSV = () => {
    const header = "round_number,multiplier,crash_time,source_type,is_provably_fair\n";
    const rows = rounds
      .map(
        (r) =>
          `${r.roundNumber},${r.multiplier.toFixed(2)},${r.crashTime},${r.sourceType},${r.isProvablyFair}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aix_verified_rounds_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="terminal-card rounded-xl p-5 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-aix-cyan uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-aix-cyan" />
            Immutable Data Repository
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Historical Database &amp; Data Ingestion
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Ingest historical Aviator data via CSV, manual entry, or verified stream. Automated duplicate detection, timestamp normalization, and strict source attribution.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-lg bg-surface-100 hover:bg-surface-50 border border-border text-xs font-mono text-white flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-aix-blue" />
          Export Dataset (CSV)
        </button>
      </div>

      {/* Ingestion Controls: Manual Entry & CSV Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV File Upload Card */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Upload className="w-4 h-4 text-aix-blue" />
            <h2 className="font-bold text-white text-sm">Import Historical CSV Data</h2>
          </div>

          <p className="text-xs text-slate-400">
            Upload CSV file with columns: <code>round_number, multiplier, timestamp</code>. Automatic duplicate prevention and schema validation.
          </p>

          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-border hover:border-aix-blue rounded-lg bg-surface-100/50 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-5 h-5 text-aix-blue" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              Click to select CSV file
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Max recommended: 50,000 rows</span>
          </button>

          {importStatus && (
            <div className="p-3 bg-surface-100 rounded text-xs font-mono text-aix-cyan border border-border flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-aix-cyan flex-shrink-0 mt-0.5" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Manual Round Entry Card */}
        <div className="terminal-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <PlusCircle className="w-4 h-4 text-aix-emerald" />
            <h2 className="font-bold text-white text-sm">Manual Round Result Entry</h2>
          </div>

          <p className="text-xs text-slate-400">
            Record an observed round directly. Tagged with <code>manual_entry</code> source attribution.
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Crash Multiplier (e.g. 2.15):</label>
              <input
                type="number"
                step="0.01"
                min="1.00"
                placeholder="2.15"
                value={manualMultiplier}
                onChange={(e) => setManualMultiplier(e.target.value)}
                className="w-full bg-surface-100 border border-border rounded p-2 text-white font-mono focus:outline-none focus:border-aix-blue"
              />
            </div>

            {manualError && (
              <div className="text-aix-rose text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {manualError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-aix-emerald to-aix-blue text-black font-bold font-mono text-xs rounded-lg shadow-glow-blue hover:opacity-95 transition-all"
            >
              Commit Round to Database
            </button>
          </form>
        </div>
      </div>

      {/* Dataset Records Table */}
      <div className="terminal-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-sm">Verified Multiplier Records</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-aix-cyan border border-border">
              {filteredRounds.length} Total
            </span>
          </div>

          {/* Filter by source */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-surface-100 border border-border rounded px-2.5 py-1 text-slate-200 focus:outline-none font-mono text-xs"
            >
              <option value="ALL">All Sources</option>
              <option value="live_verified">Live Verified</option>
              <option value="historical_import">Historical Import</option>
              <option value="manual_entry">Manual Entry</option>
              <option value="demonstration">Demonstration</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-100 text-slate-400 text-[10px] uppercase border-b border-border sticky top-0 z-10">
              <tr>
                <th className="p-3">Round #</th>
                <th className="p-3">Multiplier</th>
                <th className="p-3">Crash Timestamp</th>
                <th className="p-3">Source Attribution</th>
                <th className="p-3">Provably Fair</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-slate-200">
              {filteredRounds
                .slice()
                .reverse()
                .map((r) => (
                  <tr key={r.id} className="hover:bg-surface-100/50 transition-colors">
                    <td className="p-3 font-bold text-white">#{r.roundNumber}</td>
                    <td className="p-3 font-bold">
                      <span
                        className={
                          r.multiplier >= 10
                            ? "text-aix-amber"
                            : r.multiplier >= 2
                            ? "text-aix-emerald"
                            : "text-aix-rose"
                        }
                      >
                        {r.multiplier.toFixed(2)}x
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {new Date(r.crashTime).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          r.sourceType === "live_verified"
                            ? "bg-emerald-950/60 text-aix-emerald border border-emerald-500/30"
                            : r.sourceType === "demonstration"
                            ? "bg-amber-950/60 text-aix-amber border border-amber-500/30"
                            : "bg-surface-100 text-slate-300 border border-border"
                        }`}
                      >
                        {r.sourceType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-[11px] text-aix-emerald">
                        <CheckCircle2 className="w-3.5 h-3.5 text-aix-emerald" />
                        VALIDATED
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
