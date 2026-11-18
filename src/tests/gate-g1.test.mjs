import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = path.resolve(".");

test("Gate G1: Comprehensive Audit Report v3.0 exists and covers required sections", () => {
  const auditPath = path.join(ROOT_DIR, "AUDIT_REPORT_V3.md");
  assert.ok(fs.existsSync(auditPath), "AUDIT_REPORT_V3.md must exist");

  const content = fs.readFileSync(auditPath, "utf-8");
  assert.ok(content.includes("REPOSITORY INVENTORY"), "Must audit repository inventory");
  assert.ok(content.includes("SUPABASE DATABASE OBJECTS AUDIT"), "Must audit Supabase objects read-only");
  assert.ok(content.includes("Real-Results Mandate"), "Must audit Real-Results Mandate (Rule T13)");
  assert.ok(content.includes("Web-First"), "Must audit Web-First architecture (Rule T14)");
  assert.ok(content.includes("Designer-Grade Design System"), "Must audit Design System roadmap (Rule T15)");
});

test("Gate G1: Database baseline snapshot is stored in supabase/backups/", () => {
  const backupPath = path.join(ROOT_DIR, "supabase", "backups", "baseline_schema_snapshot.sql");
  assert.ok(fs.existsSync(backupPath), "Baseline schema backup must exist before Phase 2 migrations");

  const content = fs.readFileSync(backupPath, "utf-8");
  assert.ok(content.length > 10000, "Baseline backup must contain comprehensive schema");
  assert.ok(content.includes("CREATE TABLE IF NOT EXISTS public.profiles"), "Backup must include core profiles table");
  assert.ok(content.includes("CREATE TABLE IF NOT EXISTS public.platform_registry"), "Backup must include multi-platform registry");
});

test("Gate G1: Stop Rule Verification — Zero destructive migrations executed before G1 sign-off", () => {
  const migrationsDir = path.join(ROOT_DIR, "supabase", "migrations");
  const files = fs.readdirSync(migrationsDir);

  for (const file of files) {
    if (!file.endsWith(".sql")) continue;
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    // Ensure no unapproved table drops exist in migration history
    assert.strictEqual(
      content.includes("DROP TABLE public.profiles CASCADE") || content.includes("DROP TABLE public.aviator_rounds CASCADE"),
      false,
      `Migration ${file} must not contain unapproved destructive table drops`
    );
  }
});
