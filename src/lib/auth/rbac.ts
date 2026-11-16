export type UserRole = "OWNER" | "ADMIN" | "USER";
export type AccountStatus = "pending" | "approved" | "suspended" | "rejected";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
  status: AccountStatus;
  role: UserRole;
  created_at: string;
}

const OWNER_EMAIL = (process.env.AIX_OWNER_EMAIL || "owner@aix-terminal.io").toLowerCase().trim();
const BOOTSTRAP_TOKEN = process.env.OWNER_BOOTSTRAP_TOKEN || process.env.AIX_BOOTSTRAP_SECRET || "aix_super_secret_bootstrap_token_2026";

// Server-side in-memory flag for bootstrap token consumption (persisted in system_settings in DB)
let isTokenConsumed = false;

/**
 * Server-side evaluation to check if an email matches the provisioned system owner.
 * Never evaluated on the client.
 */
export function isServerConfiguredOwner(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === OWNER_EMAIL;
}

/**
 * Validates a bootstrap secret token for initial owner provisioning.
 * Once consumed, subsequent attempts are rejected.
 */
export function verifyBootstrapSecret(secret: string | null | undefined): boolean {
  if (!secret) return false;
  if (isTokenConsumed) return false;
  return secret === BOOTSTRAP_TOKEN;
}

/**
 * Marks the owner bootstrap token as consumed after successful initial provisioning.
 */
export function consumeBootstrapToken(): void {
  isTokenConsumed = true;
}

/**
 * Returns whether the bootstrap token has been consumed.
 */
export function isBootstrapTokenConsumed(): boolean {
  return isTokenConsumed;
}

/**
 * Reset token consumption state (primarily for automated testing).
 */
export function _resetBootstrapStateForTest(): void {
  isTokenConsumed = false;
}

/**
 * Computes effective role for a user profile.
 */
export function getEffectiveRole(profile?: { email?: string; role?: UserRole | null } | null): UserRole {
  if (!profile || !profile.email) {
    return "USER";
  }
  if (isServerConfiguredOwner(profile.email)) {
    return "OWNER";
  }
  return profile.role || "USER";
}

/**
 * Check if the user has permission to view administrative panels.
 */
export function hasAdminAccess(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Check if the user has full owner privileges.
 */
export function hasOwnerAccess(role: UserRole): boolean {
  return role === "OWNER";
}
