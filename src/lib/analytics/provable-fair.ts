import crypto from "crypto";

export interface ProvableFairResult {
  isValid: boolean;
  computedMultiplier: number;
  actualMultiplier: number;
  computedHash: string;
  isInstantCrash: boolean;
  hexSubset: string;
  fractionalValue: number;
  discrepancy: number;
}

/**
 * Computes and verifies an Aviator round's provable fairness.
 *
 * Algorithm:
 * 1. hash = HMAC_SHA256(server_seed, client_seed + (nonce ? ":" + nonce : ""))
 * 2. 52-bit integer h = parseInt(hash.slice(0, 13), 16)
 * 3. If h % 33 === 0 (approx 3% house edge): multiplier = 1.00
 * 4. Else: multiplier = Math.floor((100 * 2^52 - h) / (2^52 - h)) / 100
 */
export function verifyProvableFairRound(params: {
  serverSeed: string;
  clientSeed: string;
  nonce?: number | string;
  actualMultiplier: number;
}): ProvableFairResult {
  const { serverSeed, clientSeed, nonce, actualMultiplier } = params;

  const message = nonce !== undefined && nonce !== null ? `${clientSeed}:${nonce}` : clientSeed;
  const hmac = crypto.createHmac("sha256", serverSeed);
  hmac.update(message);
  const hash = hmac.digest("hex");

  // First 13 hex characters = 52 bits
  const hexSubset = hash.substring(0, 13);
  const h = parseInt(hexSubset, 16);
  const E = Math.pow(2, 52);

  let computedMultiplier = 1.00;
  const isInstantCrash = h % 33 === 0;

  if (isInstantCrash) {
    computedMultiplier = 1.00;
  } else {
    // Exact standard crash formula
    const raw = Math.floor((100 * E - h) / (E - h)) / 100;
    computedMultiplier = Math.max(1.00, Number(raw.toFixed(2)));
  }

  const discrepancy = Number(Math.abs(computedMultiplier - actualMultiplier).toFixed(2));
  const isValid = discrepancy <= 0.01;

  return {
    isValid,
    computedMultiplier,
    actualMultiplier,
    computedHash: hash,
    isInstantCrash,
    hexSubset,
    fractionalValue: h / E,
    discrepancy,
  };
}

/**
 * Verifies that a server seed produces the publicly committed SHA-256 hash.
 */
export function verifyServerSeedCommitment(serverSeed: string, committedHash: string): boolean {
  const hash = crypto.createHash("sha256").update(serverSeed).digest("hex");
  return hash.toLowerCase() === committedHash.toLowerCase();
}
