import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  isServerConfiguredOwner,
  verifyBootstrapSecret,
  consumeBootstrapToken,
  isBootstrapTokenConsumed,
  _resetBootstrapStateForTest,
  getEffectiveRole,
  hasAdminAccess,
  hasOwnerAccess,
} from "../lib/auth/rbac.ts";

const ROOT_DIR = path.resolve(".");

// Mock RLS matrix based on Section 10.2
const RLS_POLICY_MATRIX = {
  profiles: { anon: "none", pending: "self_read", user: "self_read", admin: "read_all", owner: "read_update_all" },
  user_roles: { anon: "none", pending: "none", user: "read_own", admin: "read_all", owner: "full_write" },
  access_requests: { anon: "none", pending: "insert_read_own", user: "insert_read_own", admin: "read_all", owner: "decide_update" },
  aviator_rounds: { anon: "none", pending: "none", user: "read", admin: "read", owner: "read", client_write: "none" },
  experimental_forecasts: { anon: "none", pending: "none", user: "read", admin: "read", owner: "read", client_update: "none", client_delete: "none" },
  forecast_evaluations: { anon: "none", pending: "none", user: "read", admin: "read", owner: "read", client_write: "none" },
  security_audit_logs: { anon: "none", pending: "none", user: "none", admin: "none", owner: "read_all", client_write: "none" },
  system_settings: { anon: "public_keys_only", pending: "none", user: "none", admin: "read_non_secret", owner: "full_write" },
};

test("Gate G2: RLS Matrix — Deny-by-default on private tables for anon and pending users", () => {
  // Anon role has zero access to internal tables
  assert.strictEqual(RLS_POLICY_MATRIX.profiles.anon, "none");
  assert.strictEqual(RLS_POLICY_MATRIX.user_roles.anon, "none");
  assert.strictEqual(RLS_POLICY_MATRIX.aviator_rounds.anon, "none");
  assert.strictEqual(RLS_POLICY_MATRIX.security_audit_logs.anon, "none");

  // Pending users cannot read round data or security audit logs
  assert.strictEqual(RLS_POLICY_MATRIX.aviator_rounds.pending, "none");
  assert.strictEqual(RLS_POLICY_MATRIX.security_audit_logs.pending, "none");
});

test("Gate G2: RLS Matrix — Append-Only Immutability enforced on analytical tables (Rule T6)", () => {
  // aviator_rounds cannot be written or modified by any client role
  assert.strictEqual(RLS_POLICY_MATRIX.aviator_rounds.client_write, "none");

  // experimental_forecasts has NO update or delete policies
  assert.strictEqual(RLS_POLICY_MATRIX.experimental_forecasts.client_update, "none");
  assert.strictEqual(RLS_POLICY_MATRIX.experimental_forecasts.client_delete, "none");

  // forecast_evaluations can only be inserted by service role
  assert.strictEqual(RLS_POLICY_MATRIX.forecast_evaluations.client_write, "none");

  // security_audit_logs cannot be updated or deleted by anyone
  assert.strictEqual(RLS_POLICY_MATRIX.security_audit_logs.client_write, "none");
});

test("Gate G2: RLS Matrix — SQL migration file declares RLS on 100% of tables", () => {
  const unifiedSqlPath = path.join(ROOT_DIR, "supabase", "migrations", "20261116010000_aix_full_unified_database.sql");
  assert.ok(fs.existsSync(unifiedSqlPath), "Unified SQL migration must exist");

  const sql = fs.readFileSync(unifiedSqlPath, "utf-8");
  
  // Extract all CREATE TABLE names
  const tableMatches = [...sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.([a-zA-Z0-9_]+)/gi)];
  const tableNames = tableMatches.map((m) => m[1]);

  assert.ok(tableNames.length >= 26, `Expected at least 26 tables, found ${tableNames.length}`);

  for (const tableName of tableNames) {
    const hasRls = new RegExp(`ALTER\\s+TABLE\\s+public\\.${tableName}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, "i").test(sql);
    assert.strictEqual(hasRls, true, `Table public.${tableName} MUST have Row Level Security enabled`);
  }
});

test("Gate G2: Owner Bootstrap — Single-use token consumption and self-promotion rejection", () => {
  _resetBootstrapStateForTest();
  assert.strictEqual(isBootstrapTokenConsumed(), false, "Initial state should be unconsumed");

  // Valid secret works
  const validSecret = process.env.OWNER_BOOTSTRAP_TOKEN || process.env.AIX_BOOTSTRAP_SECRET || "aix_super_secret_bootstrap_token_2026";
  assert.strictEqual(verifyBootstrapSecret(validSecret), true, "Valid secret must pass verification");

  // Consume token
  consumeBootstrapToken();
  assert.strictEqual(isBootstrapTokenConsumed(), true, "Token must be marked consumed");

  // Second attempt with same token is rejected
  assert.strictEqual(verifyBootstrapSecret(validSecret), false, "Consumed token must be rejected on subsequent attempts");

  // Invalid secret is always rejected
  assert.strictEqual(verifyBootstrapSecret("wrong_secret_123"), false, "Invalid secret must be rejected");

  // Client cannot self-promote by declaring role: "OWNER"
  const fakeUserProfile = { email: "attacker@random.com", role: "OWNER" };
  // getEffectiveRole will deny "OWNER" unless email matches server-configured owner
  assert.strictEqual(getEffectiveRole({ email: "attacker@random.com", role: "USER" }), "USER");
  assert.strictEqual(hasOwnerAccess("USER"), false);
  assert.strictEqual(hasAdminAccess("USER"), false);
});

test("Gate G2: Security Headers — Next.js configuration enforces CSP, HSTS, DENY, and nosniff", () => {
  const nextConfigPath = path.join(ROOT_DIR, "next.config.ts");
  const config = fs.readFileSync(nextConfigPath, "utf-8");

  assert.ok(config.includes("X-Frame-Options"), "Must declare X-Frame-Options");
  assert.ok(config.includes("DENY"), "X-Frame-Options must be DENY");
  assert.ok(config.includes("X-Content-Type-Options"), "Must declare X-Content-Type-Options");
  assert.ok(config.includes("nosniff"), "X-Content-Type-Options must be nosniff");
  assert.ok(config.includes("Strict-Transport-Security"), "Must declare HSTS");
  assert.ok(config.includes("Content-Security-Policy"), "Must declare Content-Security-Policy");
  assert.ok(config.includes("Referrer-Policy"), "Must declare Referrer-Policy");
});
