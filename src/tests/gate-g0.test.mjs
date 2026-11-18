import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = path.resolve(".");

test("Gate G0: .env.example contains all required variables with placeholders only", () => {
  const envExamplePath = path.join(ROOT_DIR, ".env.example");
  assert.ok(fs.existsSync(envExamplePath), ".env.example must exist");

  const content = fs.readFileSync(envExamplePath, "utf-8");
  const requiredKeys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "AIX_OWNER_EMAIL",
    "OWNER_BOOTSTRAP_TOKEN",
    "AIX_BOOTSTRAP_SECRET",
    "OLLAMA_BASE_URL",
    "NODE_ENV",
  ];

  for (const key of requiredKeys) {
    assert.ok(content.includes(`${key}=`), `.env.example must document ${key}`);
  }

  // Ensure no real production secrets are committed in .env.example
  assert.ok(
    !content.includes("sbp_") && !content.includes("sk-ant-") && !content.includes("gsk_"),
    ".env.example must contain placeholders only, never live credentials"
  );
});

test("Gate G0: Client-side source code never accesses server-side secrets (Rule T8)", () => {
  const clientDirs = [
    path.join(ROOT_DIR, "src", "app"),
    path.join(ROOT_DIR, "src", "components"),
    path.join(ROOT_DIR, "src", "context"),
  ];

  const forbiddenServerVars = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "OWNER_BOOTSTRAP_TOKEN",
    "AIX_BOOTSTRAP_SECRET",
    "GEMINI_API_KEY",
    "GROQ_API_KEY",
    "OPENROUTER_API_KEY",
    "CEREBRAS_API_KEY",
    "MISTRAL_API_KEY",
    "NEXTAUTH_SECRET",
    "TELEGRAM_BOT_TOKEN",
  ];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && /\.(tsx|jsx|ts|js)$/.test(entry.name)) {
        // Skip API routes which execute strictly on the server
        if (fullPath.includes(path.join("src", "app", "api"))) continue;

        const code = fs.readFileSync(fullPath, "utf-8");
        for (const forbidden of forbiddenServerVars) {
          const directUsage = new RegExp(`process\\.env\\.${forbidden}\\b`).test(code);
          assert.strictEqual(
            directUsage,
            false,
            `Rule T8 Violation: Client file ${entry.name} references server secret process.env.${forbidden}`
          );
        }
      }
    }
  }

  for (const dir of clientDirs) {
    scanDirectory(dir);
  }
});

test("Gate G0: Backup & Disaster Recovery Policy is codified in BACKUP_POLICY.md", () => {
  const policyPath = path.join(ROOT_DIR, "BACKUP_POLICY.md");
  assert.ok(fs.existsSync(policyPath), "BACKUP_POLICY.md must exist");

  const content = fs.readFileSync(policyPath, "utf-8");
  assert.ok(content.includes("Supabase Backups"), "Must cover automated Supabase backups");
  assert.ok(content.includes("Table Retention Schedules"), "Must cover retention schedules");
  assert.ok(content.includes("Disaster Recovery Runbook"), "Must cover recovery runbook");
  assert.ok(content.includes("180 Days"), "Must retain data_ingestion_logs for 180 days per Section 10.3");
  assert.ok(content.includes("365 Days"), "Must retain ai_tasks for 365 days per Section 10.3");
});

test("Gate G0: Supabase Project Reference is verified and configured", () => {
  const envExamplePath = path.join(ROOT_DIR, ".env.example");
  const content = fs.readFileSync(envExamplePath, "utf-8");
  assert.ok(
    content.includes("rrhtenamwselyjufyntw.supabase.co"),
    "Project reference rrhtenamwselyjufyntw must be configured"
  );
});
