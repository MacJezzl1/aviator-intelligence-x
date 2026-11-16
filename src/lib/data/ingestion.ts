export type DataSourceType =
  | "live_verified"
  | "delayed"
  | "historical_import"
  | "manual_entry"
  | "demonstration";

export type AviatorOperator = "hollywoodbets" | "betway" | "spribe_universal";

export interface AviatorRoundRecord {
  id: string;
  roundNumber: number;
  multiplier: number;
  crashTime: string;
  serverSeedHash?: string;
  clientSeed?: string;
  nonce?: number;
  isProvablyFair?: boolean;
  sourceType: DataSourceType;
  operator?: AviatorOperator;
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
