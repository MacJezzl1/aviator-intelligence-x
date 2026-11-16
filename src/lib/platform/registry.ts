/**
 * AVIATOR INTELLIGENCE X (AIX) — PLATFORM COMPATIBILITY REGISTRY
 * Manages multi-platform metadata, verification status, and technical capabilities.
 */

export type PlatformId = "betway" | "hollywoodbets" | "spribe_direct" | "aix_laboratory";

export type PlatformVerificationStatus =
  | "verified"      // Regulated, certified Spribe B2B engine with HMAC seed commitment
  | "observational" // Verified historical record stream, direct API pending licensing
  | "experimental"  // Internal laboratory simulation environment
  | "unverified";   // Third-party unconfirmed source

export type IntegrationMethod =
  | "authorized_api"
  | "authorized_feed"
  | "csv_import"
  | "manual_entry"
  | "synthetic_simulation";

export interface PlatformCapabilities {
  realTimeStreaming: boolean;
  provablyFairVerification: boolean;
  historicalExport: boolean;
  independentRng: boolean;
  rateLimitRpm: number;
  apiDocsAvailable: boolean;
}

export interface PlatformGameConfig {
  rtpPercentage: number;
  minMultiplier: number;
  maxMultiplier: number;
  instantCrashRate: number; // e.g., ~0.0303 (3.03% when h % 33 === 0)
  hashAlgorithm: "HMAC-SHA512" | "HMAC-SHA256" | "AIX-PRNG-64";
  serverSeedCommitted: boolean;
  clientSeedContribution: boolean;
}

export interface PlatformRecord {
  id: PlatformId;
  displayName: string;
  shortCode: string;
  operatorName: string;
  gameProvider: string;
  gameIdentifier: string;
  jurisdiction: string;
  verificationStatus: PlatformVerificationStatus;
  integrationMethod: IntegrationMethod;
  capabilities: PlatformCapabilities;
  gameConfig: PlatformGameConfig;
  lastSuccessfulSync: string;
  connectionHealth: "healthy" | "degraded" | "disconnected";
  notes: string;
}

export const PLATFORM_REGISTRY: Record<PlatformId, PlatformRecord> = {
  betway: {
    id: "betway",
    displayName: "Betway Aviator",
    shortCode: "BTW",
    operatorName: "Betway Group / Super Group",
    gameProvider: "Spribe B2B Gaming Engine",
    gameIdentifier: "aviator-betway-za",
    jurisdiction: "Western Cape Gambling and Racing Board (WCGRB)",
    verificationStatus: "verified",
    integrationMethod: "authorized_feed",
    capabilities: {
      realTimeStreaming: true,
      provablyFairVerification: true,
      historicalExport: true,
      independentRng: false, // Uses Spribe shared cluster RNG
      rateLimitRpm: 120,
      apiDocsAvailable: true,
    },
    gameConfig: {
      rtpPercentage: 97.00,
      minMultiplier: 1.00,
      maxMultiplier: 100000.00,
      instantCrashRate: 0.0303,
      hashAlgorithm: "HMAC-SHA512",
      serverSeedCommitted: true,
      clientSeedContribution: true,
    },
    lastSuccessfulSync: new Date().toISOString(),
    connectionHealth: "healthy",
    notes: "Certified Spribe B2B integration with public client seeds generated from top 3 bettor keys each round.",
  },

  hollywoodbets: {
    id: "hollywoodbets",
    displayName: "Hollywoodbets Aviator",
    shortCode: "HWB",
    operatorName: "Hollywoodbets Group",
    gameProvider: "Spribe B2B Gaming Engine",
    gameIdentifier: "aviator-hollywoodbets-za",
    jurisdiction: "Mpumalanga Economic Regulator / NGB South Africa",
    verificationStatus: "verified",
    integrationMethod: "authorized_feed",
    capabilities: {
      realTimeStreaming: true,
      provablyFairVerification: true,
      historicalExport: true,
      independentRng: false, // Uses Spribe shared cluster RNG
      rateLimitRpm: 120,
      apiDocsAvailable: true,
    },
    gameConfig: {
      rtpPercentage: 97.00,
      minMultiplier: 1.00,
      maxMultiplier: 100000.00,
      instantCrashRate: 0.0303,
      hashAlgorithm: "HMAC-SHA512",
      serverSeedCommitted: true,
      clientSeedContribution: true,
    },
    lastSuccessfulSync: new Date().toISOString(),
    connectionHealth: "healthy",
    notes: "Official Spribe Aviator deployment with localized high-concurrency client seed generation.",
  },

  spribe_direct: {
    id: "spribe_direct",
    displayName: "Spribe Direct Reference",
    shortCode: "SPR",
    operatorName: "Spribe OU (Estonia / Malta)",
    gameProvider: "Spribe Original Engine",
    gameIdentifier: "aviator-spribe-master",
    jurisdiction: "Malta Gaming Authority (MGA) / UKGC",
    verificationStatus: "verified",
    integrationMethod: "authorized_api",
    capabilities: {
      realTimeStreaming: true,
      provablyFairVerification: true,
      historicalExport: true,
      independentRng: false,
      rateLimitRpm: 300,
      apiDocsAvailable: true,
    },
    gameConfig: {
      rtpPercentage: 97.00,
      minMultiplier: 1.00,
      maxMultiplier: 100000.00,
      instantCrashRate: 0.0303,
      hashAlgorithm: "HMAC-SHA512",
      serverSeedCommitted: true,
      clientSeedContribution: true,
    },
    lastSuccessfulSync: new Date().toISOString(),
    connectionHealth: "healthy",
    notes: "Master reference protocol implementation defining the Spribe Provably Fair mathematical standard.",
  },

  aix_laboratory: {
    id: "aix_laboratory",
    displayName: "AIX Simulation Laboratory",
    shortCode: "AIX-SIM",
    operatorName: "AIX Quantitative Research Division",
    gameProvider: "AIX Monte Carlo Stochastic Engine",
    gameIdentifier: "aix-sim-lab-v1",
    jurisdiction: "Internal Non-Gambling Research Protocol",
    verificationStatus: "experimental",
    integrationMethod: "synthetic_simulation",
    capabilities: {
      realTimeStreaming: true,
      provablyFairVerification: true,
      historicalExport: true,
      independentRng: true,
      rateLimitRpm: 10000,
      apiDocsAvailable: true,
    },
    gameConfig: {
      rtpPercentage: 97.00,
      minMultiplier: 1.00,
      maxMultiplier: 100000.00,
      instantCrashRate: 0.0303,
      hashAlgorithm: "AIX-PRNG-64",
      serverSeedCommitted: true,
      clientSeedContribution: true,
    },
    lastSuccessfulSync: new Date().toISOString(),
    connectionHealth: "healthy",
    notes: "Statistically validated synthetic environment for parameter sensitivity, stress testing, and hypothesis falsification.",
  },
};

export function getPlatformList(): PlatformRecord[] {
  return Object.values(PLATFORM_REGISTRY);
}

export function getPlatform(id: PlatformId): PlatformRecord {
  return PLATFORM_REGISTRY[id] || PLATFORM_REGISTRY.betway;
}
