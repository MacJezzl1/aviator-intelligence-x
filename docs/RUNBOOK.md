# AVIATOR INTELLIGENCE X (AIX) — OPERATIONAL RUNBOOK
**Document Class:** Live Operations, Incident Management & Site Reliability  
**Platform Version:** 3.0 (Truth-Locked Edition)  
**Standard:** Master Spec v3.0 (Section 5, 10, 16)  

---

## 1. System Health Monitoring & Telemetry
AIX incorporates real-time health telemetry across all services:
* **Health API Endpoint:** `/api/health` returns live subsystem states (`database`, `liveFeed`, `providers`, `degradationLevel`).
* **Telemetry Table:** `system_health` records status pings every 60 seconds with latency metrics and degradation flags.
* **Console Monitoring:** The signature Live Signal Console (Zone 1) displays live engine status, latency, sample size $n$, and active degradation state.

---

## 2. Degradation Ladder Management (L0–L6)
The failover degradation ladder automatically shifts system state under partial failure:
* **L0 (Normal Operations):** Full hybrid execution, real-time live sync, all providers active.
* **L1 (Minor Provider Degraded):** Reroutes LLM traffic away from rate-limited providers; statistical engine uninterrupted.
* **L2 (External AI Offline):** Auto-fallbacks to 100% deterministic local code models. Core statistics unaffected.
* **L3 (Feed Disconnected):** Casino feed unverified. UI displays prominent banner and suspends live claims (Rule T1).
* **L4 (Supabase Degraded / Offline):** Database unreachable. Remote mutations disabled; client buffers data locally.
* **L5 (Safe Emergency Lockdown):** Triggered on tamper attempt or security breach. Read-only audit mode, all writes blocked.
* **L6 (Fresh Install / Empty State):** Clean database with $n=0$. Displays honest guidance directing to Round Capture Kit.

---

## 3. Incident Management & Escalation Protocol
When an operational anomaly or telemetry alarm is triggered:

### 3.1 Severity Levels
* **SEV-1 (Critical):** RLS breach attempt, unauthorized database write, token tampering, or Truth Guard failure.
  * **Immediate Action:** Platform transitions to **L5 Safe Emergency Lockdown**.
  * **Escalation:** Alert system owner immediately via direct notification channel.
  * **Containment:** Freeze API endpoints, revoke compromised access tokens.
* **SEV-2 (High):** Supabase database connection loss or persistent latency > 3000ms.
  * **Immediate Action:** Platform transitions to **L4 Degraded**.
  * **Escalation:** On-call SRE engages Supabase infrastructure status.
* **SEV-3 (Moderate):** External AI provider failure or quota exhaustion.
  * **Immediate Action:** Platform transitions to **L2 Pure Deterministic Code**.
  * **Escalation:** Normal engineering review; zero user impact on core statistical calculations.

---

## 4. Disaster Recovery & Backup Restoration
* **Policy Reference:** Refer to `BACKUP_POLICY.md` for formal recovery objectives (RPO < 5 min, RTO < 15 min).
* **Automated Daily Snapshots:** Managed via Supabase PITR.
* **Cold Disaster Recovery:**
  1. Retrieve latest verified dump from `supabase/backups/baseline_schema_snapshot.sql`.
  2. Restore to isolated staging instance:
     ```bash
     psql -h <staging-host> -U postgres -d postgres -f supabase/backups/baseline_schema_snapshot.sql
     ```
  3. Validate RLS policies and run regression tests:
     ```bash
     pnpm test
     ```
  4. Once verified, promote staging to production routing.

---

## 5. Secret Rotation & Security Incident Procedure
1. Rotate `OWNER_BOOTSTRAP_TOKEN` after initial deployment bootstrap.
2. In the event of a suspected service-role key exposure, immediately regenerate the key in Supabase Project Settings > API, and update Vercel environment secrets.
3. Validate that client bundle remains clean of service-role keys using the automated adversarial test suite (`pnpm test`).
