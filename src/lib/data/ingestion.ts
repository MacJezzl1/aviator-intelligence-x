export type DataSourceType =
  | "live_verified"
  | "delayed"
  | "historical_import"
  | "manual_entry"
  | "demonstration";

export type DataClass = "LIVE_VERIFIED" | "DELAYED" | "IMPORTED" | "MANUAL" | "DEMO";

export type AviatorOperator = "hollywoodbets" | "betway" | "spribe_universal";

export interface AviatorRoundRecord {
  id: string;
  roundIdentifier?: string;
  roundNumber: number;
  multiplier: number;
  crashTime: string;
  serverSeedHash?: string;
  clientSeed?: string;
  nonce?: number;
  isProvablyFair?: boolean;
  sourceType: DataSourceType;
  dataClass?: DataClass;
  operator?: AviatorOperator;
  sessionNote?: string;
}

export interface IngestionResult {
  totalProcessed: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  records: AviatorRoundRecord[];
  errors: string[];
}

/**
 * Validates and normalizes raw multiplier numbers.
 */
export function validateMultiplier(val: any): { isValid: boolean; normalized: number; error?: string } {
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) {
    return { isValid: false, normalized: 0, error: "Not a valid numeric multiplier" };
  }
  if (num < 1.0) {
    return { isValid: false, normalized: 0, error: "Multiplier cannot be less than 1.00x" };
  }
  if (num > 1000000) {
    return { isValid: false, normalized: 0, error: "Multiplier exceeds realistic upper bound (1,000,000x)" };
  }
  return { isValid: true, normalized: Number(num.toFixed(2)) };
}

/**
 * Parses raw CSV content containing historical Aviator records.
 * Supports headers: round_number/round, multiplier/crash_multiplier, timestamp/time, server_seed_hash, client_seed.
 */
export function parseAviatorCSV(csvContent: string, existingRoundNumbers: Set<number> = new Set()): IngestionResult {
  const lines = csvContent.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { totalProcessed: 0, validCount: 0, duplicateCount: 0, invalidCount: 0, records: [], errors: ["CSV file is empty."] };
  }

  const headerLine = lines[0].toLowerCase();
  const hasHeader = headerLine.includes("multiplier") || headerLine.includes("round") || headerLine.includes("crash");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  let multiplierCol = 0;
  let roundCol = -1;
  let timeCol = -1;

  if (hasHeader) {
    const headers = headerLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    multiplierCol = headers.findIndex((h) => h.includes("multiplier") || h.includes("crash") || h.includes("value"));
    if (multiplierCol === -1) multiplierCol = 0;
    roundCol = headers.findIndex((h) => h.includes("round") || h.includes("id") || h.includes("nonce"));
    timeCol = headers.findIndex((h) => h.includes("time") || h.includes("date") || h.includes("stamp"));
  }

  const seenInBatch = new Set<number>();
  const records: AviatorRoundRecord[] = [];
  const errors: string[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  let autoRoundCounter = Math.max(0, ...Array.from(existingRoundNumbers)) + 1;

  for (let idx = 0; idx < dataLines.length; idx++) {
    const line = dataLines[idx];
    const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));

    const rawMultiplier = cols[multiplierCol];
    const validation = validateMultiplier(rawMultiplier);

    if (!validation.isValid) {
      invalidCount++;
      if (errors.length < 10) errors.push(`Row ${idx + 1}: ${validation.error} ("${rawMultiplier}")`);
      continue;
    }

    let roundNum = roundCol !== -1 && cols[roundCol] ? parseInt(cols[roundCol], 10) : autoRoundCounter++;
    if (isNaN(roundNum)) roundNum = autoRoundCounter++;

    if (existingRoundNumbers.has(roundNum) || seenInBatch.has(roundNum)) {
      duplicateCount++;
      continue;
    }

    seenInBatch.add(roundNum);

    let crashTime = new Date().toISOString();
    if (timeCol !== -1 && cols[timeCol]) {
      const parsedTime = new Date(cols[timeCol]);
      if (!isNaN(parsedTime.getTime())) {
        crashTime = parsedTime.toISOString();
      }
    }

    records.push({
      id: `round-${roundNum}`,
      roundNumber: roundNum,
      multiplier: validation.normalized,
      crashTime,
      sourceType: "historical_import",
      isProvablyFair: true,
    });

    validCount++;
  }

  return {
    totalProcessed: dataLines.length,
    validCount,
    duplicateCount,
    invalidCount,
    records,
    errors,
  };
}

/**
 * Parses raw JSON string containing historical Aviator records.
 * Supports arrays of objects with keys: multiplier/crash_multiplier, roundNumber/round_number, crashTime/timestamp.
 */
export function parseAviatorJSON(jsonContent: string, existingRoundNumbers: Set<number> = new Set()): IngestionResult {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (err: any) {
    return {
      totalProcessed: 0,
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      records: [],
      errors: [`JSON parse failure: ${err?.message || "Invalid JSON syntax"}`],
    };
  }

  const items = Array.isArray(parsed) ? parsed : parsed.rounds || parsed.data || [];
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalProcessed: 0,
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      records: [],
      errors: ["JSON must be an array of round objects or contain a 'rounds'/'data' array."],
    };
  }

  const seenInBatch = new Set<number>();
  const records: AviatorRoundRecord[] = [];
  const errors: string[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  let autoRoundCounter = Math.max(0, ...Array.from(existingRoundNumbers)) + 1;

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const rawMultiplier = item.multiplier ?? item.crash_multiplier ?? item.value ?? item.crash;
    const validation = validateMultiplier(rawMultiplier);

    if (!validation.isValid) {
      invalidCount++;
      if (errors.length < 10) errors.push(`Item ${idx + 1}: ${validation.error} (${JSON.stringify(rawMultiplier)})`);
      continue;
    }

    let roundNum = typeof item.roundNumber === "number" ? item.roundNumber : parseInt(String(item.round_number || item.id || item.round), 10);
    if (isNaN(roundNum)) roundNum = autoRoundCounter++;

    if (existingRoundNumbers.has(roundNum) || seenInBatch.has(roundNum)) {
      duplicateCount++;
      continue;
    }

    seenInBatch.add(roundNum);

    let crashTime = new Date().toISOString();
    if (item.crashTime || item.timestamp || item.time) {
      const parsedTime = new Date(item.crashTime || item.timestamp || item.time);
      if (!isNaN(parsedTime.getTime())) crashTime = parsedTime.toISOString();
    }

    records.push({
      id: `round-${roundNum}`,
      roundNumber: roundNum,
      multiplier: validation.normalized,
      crashTime,
      sourceType: "historical_import",
      isProvablyFair: true,
      serverSeedHash: item.serverSeedHash || item.server_seed_hash,
      clientSeed: item.clientSeed || item.client_seed,
    });

    validCount++;
  }

  return {
    totalProcessed: items.length,
    validCount,
    duplicateCount,
    invalidCount,
    records,
    errors,
  };
}

/**
 * ============================================================================
 * APPENDIX E — ROUND CAPTURE KIT LOGBOOK & REAL-RESULTS MANDATE (RULE T13)
 * ============================================================================
 */

export interface RoundEntry {
  roundIdentifier: string;
  roundStartUtc: string;
  multiplier: number;
  sessionNote?: string;
}

export interface DoubleEntryValidationResult {
  matches: boolean;
  diffCount: number;
  discrepancies: Array<{
    roundIdentifier: string;
    field: string;
    primaryValue: any;
    confirmationValue: any;
  }>;
}

/**
 * Validates double-entry manual records. Discrepancies block the import with a row-level diff (Appendix E.2).
 */
export function validateDoubleEntry(
  primary: RoundEntry[],
  confirmation: RoundEntry[]
): DoubleEntryValidationResult {
  const discrepancies: DoubleEntryValidationResult["discrepancies"] = [];
  const confMap = new Map<string, RoundEntry>();
  for (const c of confirmation) {
    confMap.set(String(c.roundIdentifier).trim(), c);
  }

  for (const p of primary) {
    const id = String(p.roundIdentifier).trim();
    const c = confMap.get(id);
    if (!c) {
      discrepancies.push({
        roundIdentifier: id,
        field: "existence",
        primaryValue: "present",
        confirmationValue: "missing",
      });
      continue;
    }
    if (Number(p.multiplier.toFixed(2)) !== Number(c.multiplier.toFixed(2))) {
      discrepancies.push({
        roundIdentifier: id,
        field: "multiplier",
        primaryValue: p.multiplier,
        confirmationValue: c.multiplier,
      });
    }
    if (new Date(p.roundStartUtc).getTime() !== new Date(c.roundStartUtc).getTime()) {
      discrepancies.push({
        roundIdentifier: id,
        field: "roundStartUtc",
        primaryValue: p.roundStartUtc,
        confirmationValue: c.roundStartUtc,
      });
    }
  }

  for (const c of confirmation) {
    const id = String(c.roundIdentifier).trim();
    if (!primary.some((p) => String(p.roundIdentifier).trim() === id)) {
      discrepancies.push({
        roundIdentifier: id,
        field: "existence",
        primaryValue: "missing",
        confirmationValue: "present",
      });
    }
  }

  return {
    matches: discrepancies.length === 0,
    diffCount: discrepancies.length,
    discrepancies,
  };
}

export interface SequenceGapReport {
  hasGaps: boolean;
  gaps: Array<{ expectedFrom: number; expectedTo: number; missingCount: number }>;
}

/**
 * Detects sequence gaps in round identifiers (Appendix E.2.3, G03/G05).
 */
export function detectSequenceGaps(identifiers: (string | number)[]): SequenceGapReport {
  const numericIds: number[] = [];
  for (const id of identifiers) {
    const n = typeof id === "number" ? id : parseInt(String(id).replace(/\D/g, ""), 10);
    if (!isNaN(n)) numericIds.push(n);
  }

  if (numericIds.length < 2) {
    return { hasGaps: false, gaps: [] };
  }

  const sorted = Array.from(new Set(numericIds)).sort((a, b) => a - b);
  const gaps: Array<{ expectedFrom: number; expectedTo: number; missingCount: number }> = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i + 1] - sorted[i];
    if (diff > 1) {
      gaps.push({
        expectedFrom: sorted[i] + 1,
        expectedTo: sorted[i + 1] - 1,
        missingCount: diff - 1,
      });
    }
  }

  return {
    hasGaps: gaps.length > 0,
    gaps,
  };
}

export interface RoundCaptureLogbookResult extends IngestionResult {
  sequenceGaps: SequenceGapReport;
}

/**
 * Parses real-session Logbook CSV per Appendix E schema:
 * round_identifier, round_start_utc, multiplier, session_note.
 */
export function parseRoundCaptureLogbook(
  csvContent: string,
  options: {
    source?: string;
    existingIdentifiers?: Set<string>;
  } = {}
): RoundCaptureLogbookResult {
  const lines = csvContent.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      totalProcessed: 0,
      validCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      records: [],
      errors: ["Logbook CSV is empty."],
      sequenceGaps: { hasGaps: false, gaps: [] },
    };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const roundIdCol = headers.findIndex((h) => h.includes("round_identifier") || h.includes("round") || h.includes("id"));
  const timeCol = headers.findIndex((h) => h.includes("round_start_utc") || h.includes("utc") || h.includes("time") || h.includes("date"));
  const multCol = headers.findIndex((h) => h.includes("multiplier") || h.includes("crash"));
  const noteCol = headers.findIndex((h) => h.includes("session_note") || h.includes("note") || h.includes("comment"));

  const dataLines = lines.slice(1);
  const existingSet = options.existingIdentifiers || new Set<string>();
  const seenInBatch = new Set<string>();
  const records: AviatorRoundRecord[] = [];
  const errors: string[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  const collectedIds: string[] = [];

  for (let idx = 0; idx < dataLines.length; idx++) {
    const line = dataLines[idx];
    const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));

    const rawId = roundIdCol !== -1 && cols[roundIdCol] ? cols[roundIdCol] : `round-${idx + 1}`;
    const rawTime = timeCol !== -1 && cols[timeCol] ? cols[timeCol] : new Date().toISOString();
    const rawMult = multCol !== -1 && cols[multCol] ? cols[multCol] : cols[0];
    const note = noteCol !== -1 && cols[noteCol] ? cols[noteCol] : undefined;

    const validation = validateMultiplier(rawMult);
    if (!validation.isValid) {
      invalidCount++;
      if (errors.length < 10) errors.push(`Row ${idx + 1}: ${validation.error} ("${rawMult}")`);
      continue;
    }

    if (existingSet.has(rawId) || seenInBatch.has(rawId)) {
      duplicateCount++;
      continue;
    }

    seenInBatch.add(rawId);
    collectedIds.push(rawId);

    const parsedDate = new Date(rawTime);
    const crashTime = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date().toISOString();

    const numericRoundNum = parseInt(rawId.replace(/\D/g, ""), 10) || idx + 1;

    records.push({
      id: rawId,
      roundIdentifier: rawId,
      roundNumber: numericRoundNum,
      multiplier: validation.normalized,
      crashTime,
      sourceType: "historical_import",
      dataClass: "IMPORTED",
      isProvablyFair: true,
      sessionNote: note,
      operator: (options.source as AviatorOperator) || "spribe_universal",
    });

    validCount++;
  }

  const sequenceGaps = detectSequenceGaps(collectedIds);

  return {
    totalProcessed: dataLines.length,
    validCount,
    duplicateCount,
    invalidCount,
    records,
    errors,
    sequenceGaps,
  };
}

export interface QuarantinedDemoBatch {
  isQuarantined: true;
  dataClass: "DEMO";
  badge: "DEMO";
  records: AviatorRoundRecord[];
  isolatedScope: string;
  createdAt: string;
}

/**
 * Quarantines demo generator output. Strictly isolated, owner-enabled only (Rule T13, Section 9.1.2).
 */
export function quarantineDemoRounds(
  rounds: Partial<AviatorRoundRecord>[],
  ownerEnabled: boolean = false
): QuarantinedDemoBatch {
  if (!ownerEnabled) {
    throw new Error(
      "Real-Results Mandate (Rule T13, Section 9.1.2) Violation: Demo generator is quarantined and can ONLY be enabled by the owner via explicit toggle."
    );
  }

  const sanitizedRecords: AviatorRoundRecord[] = rounds.map((r, i) => {
    const multVal = validateMultiplier(r.multiplier ?? 1.50);
    return {
      id: r.id || `demo-${i + 1}-${Date.now()}`,
      roundIdentifier: r.roundIdentifier || `DEMO-${i + 1}`,
      roundNumber: r.roundNumber || i + 1,
      multiplier: multVal.isValid ? multVal.normalized : 1.50,
      crashTime: r.crashTime || new Date().toISOString(),
      sourceType: "demonstration",
      dataClass: "DEMO",
      isProvablyFair: false,
      sessionNote: "QUARANTINED_DEMO_DATA_ONLY",
    };
  });

  return {
    isQuarantined: true,
    dataClass: "DEMO",
    badge: "DEMO",
    records: sanitizedRecords,
    isolatedScope: "demo_quarantine_storage_scope",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Real-only dataset filter: ensures demo records NEVER leak into the default dataset (Section 9.1.1).
 */
export function filterRealOnlyDataset<T extends { sourceType?: DataSourceType; dataClass?: DataClass; data_class?: string }>(
  records: T[]
): T[] {
  return records.filter((r) => {
    if (r.sourceType === "demonstration") return false;
    if (r.dataClass === "DEMO") return false;
    if (r.data_class === "DEMO" || r.data_class === "demo") return false;
    return true;
  });
}
