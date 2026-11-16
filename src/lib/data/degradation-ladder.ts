/**
 * AVIATOR INTELLIGENCE X (AIX) — FAILOVER DEGRADATION LADDER (L0 TO L5)
 * Formal operational state machine handling progressive degradation and fail-closed security.
 */

import { type DataSourceType } from "./ingestion.ts";

export type DegradationLevel = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";

export interface DegradationState {
  level: DegradationLevel;
  name: string;
  description: string;
  allowsWrites: boolean;
  allowsLiveSync: boolean;
  activeDataSource: DataSourceType;
  aiExecutionMode: "full_hybrid" | "provider_reroute" | "pure_deterministic_code" | "offline";
  activeAlert?: string;
}

export const DEGRADATION_LEVEL_CONFIG: Record<DegradationLevel, DegradationState> = {
  L0: {
    level: "L0",
    name: "Normal Operations",
    description: "All services fully operational, authorized feeds verified, DB synchronized.",
    allowsWrites: true,
    allowsLiveSync: true,
    activeDataSource: "live_verified",
    aiExecutionMode: "full_hybrid",
  },
  L1: {
    level: "L1",
    name: "Minor Provider Degraded",
    description: "One AI provider rate limited. Automatic round-robin reroute active.",
    allowsWrites: true,
    allowsLiveSync: true,
    activeDataSource: "live_verified",
    aiExecutionMode: "provider_reroute",
    activeAlert: "Provider latency elevated; automated failover active.",
  },
  L2: {
    level: "L2",
    name: "External APIs Unreachable",
    description: "External AI APIs offline. Auto-fallback to 100% deterministic code models.",
    allowsWrites: true,
    allowsLiveSync: true,
    activeDataSource: "live_verified",
    aiExecutionMode: "pure_deterministic_code",
    activeAlert: "External AI offline. Executing pure deterministic statistical engine.",
  },
  L3: {
    level: "L3",
    name: "Live Feed Disconnected",
    description: "Casino data feed unverified or disconnected. Switched to delayed / demo mode.",
    allowsWrites: true,
    allowsLiveSync: false,
    activeDataSource: "demonstration",
    aiExecutionMode: "pure_deterministic_code",
    activeAlert: "No authorized live feed connection. Operating in simulation mode (Rule T4).",
  },
  L4: {
    level: "L4",
    name: "Supabase Degraded / Offline",
    description: "Remote database unreachable. Offline local buffering active.",
    allowsWrites: false, // remote writes suspended, buffered locally
    allowsLiveSync: false,
    activeDataSource: "demonstration",
    aiExecutionMode: "pure_deterministic_code",
    activeAlert: "Database unreachable. Changes buffered locally.",
  },
  L5: {
    level: "L5",
    name: "Safe Emergency Lockdown",
    description: "Integrity breach or critical security exception detected. Fail-closed mode.",
    allowsWrites: false,
    allowsLiveSync: false,
    activeDataSource: "demonstration",
    aiExecutionMode: "offline",
    activeAlert: "EMERGENCY LOCKDOWN: All mutations revoked. Read-only audit mode.",
  },
};

export interface SystemHealthInput {
  securityBreachDetected?: boolean;
  supabaseConnected?: boolean;
  liveFeedVerified?: boolean;
  externalApiReachable?: boolean;
  rateLimitedProvidersCount?: number;
}

/**
 * Assesses the exact degradation level based on system health indicators.
 * Evaluates in strict descending order of severity (L5 down to L0).
 */
export function assessDegradationLevel(health: SystemHealthInput): DegradationState {
  // Level 5: Security breach or unauthorized tampering -> Emergency Lockdown
  if (health.securityBreachDetected) {
    return DEGRADATION_LEVEL_CONFIG.L5;
  }

  // Level 4: Database offline
  if (health.supabaseConnected === false) {
    return DEGRADATION_LEVEL_CONFIG.L4;
  }

  // Level 3: Live casino feed disconnected / unverified
  if (health.liveFeedVerified === false) {
    return DEGRADATION_LEVEL_CONFIG.L3;
  }

  // Level 2: External AI APIs unreachable
  if (health.externalApiReachable === false) {
    return DEGRADATION_LEVEL_CONFIG.L2;
  }

  // Level 1: Minor rate limits
  if ((health.rateLimitedProvidersCount ?? 0) > 0) {
    return DEGRADATION_LEVEL_CONFIG.L1;
  }

  // Level 0: All systems healthy
  return DEGRADATION_LEVEL_CONFIG.L0;
}

/**
 * Validates whether write operations are permitted at given level.
 */
export function isWritePermitted(level: DegradationLevel): boolean {
  return DEGRADATION_LEVEL_CONFIG[level].allowsWrites;
}

/**
 * Validates whether live synchronization claims are permissible.
 */
export function isLiveSyncPermitted(level: DegradationLevel): boolean {
  return DEGRADATION_LEVEL_CONFIG[level].allowsLiveSync;
}
