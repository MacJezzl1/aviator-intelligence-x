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
const BOOTSTRAP_SECRET = process.env.AIX_BOOTSTRAP_SECRET || "aix_super_secret_bootstrap_token_2026";

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
 */
export function verifyBootstrapSecret(secret: string | null | undefined): boolean {
  if (!secret) return false;
  return secret === BOOTSTRAP_SECRET;
}

/**
 * Computes effective role for a user profile.
 */
export function getEffectiveRole(profile: { email: string; role?: UserRole | null }): UserRole {
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
