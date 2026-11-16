# AVIATOR INTELLIGENCE X (AIX) — BACKUP & RETENTION POLICY
**Document Class:** Operational & Disaster Recovery Policy  
**Compliance Standard:** Master Specification v2.0 (Sections 10.3 & 16.2)  
**Effective Date:** 2026-11-16  

---

## 1. Automated Supabase Backups
* **Frequency:** Daily automated point-in-time snapshots managed by Supabase infrastructure on project `rrhtenamwselyjufyntw`.
* **Weekly Verification Drill:** Once per week, an automated or owner-initiated restore-check drill is executed into a staging instance to verify snapshot integrity and RLS policy fidelity.
* **Monthly Logical Export:** Monthly owner-run `pg_dump` of all 26 core tables and migration state stored in an encrypted cold-storage volume.

---

## 2. Table Retention Schedules (Owner Configurable)
Per Master Prompt v2.0 Section 10.3, high-frequency diagnostic and telemetry tables adhere to strict retention windows:

| Table Name | Default Retention | Purpose | Deletion Mechanism |
|---|---|---|---|
| `data_ingestion_logs` | 180 Days | Source ingest audit trail | Scheduled Edge Function rolling cleanup |
| `ai_tasks` | 365 Days | Queue execution records | Scheduled Edge Function rolling cleanup |
| `user_activity_logs` | 365 Days | User action audit log | Scheduled Edge Function rolling cleanup |
| `system_health` | 90 Days | Component uptime telemetry | Scheduled Edge Function rolling cleanup |
| `aviator_rounds` | **Indefinite (Append-only)** | Cryptographic game history | Permanent analytical archive |
| `experimental_forecasts` | **Indefinite (Immutable)** | Pre-registered forecasts | Permanent calibration evaluation |
| `forecast_evaluations` | **Indefinite (Append-only)** | Brier & log-loss scoring | Permanent calibration evaluation |
| `security_audit_logs` | **Indefinite (Append-only)** | Tamper & auth audit trail | Permanent security record |

---

## 3. Disaster Recovery Runbook
1. **Service Disruption Detection:**
   * Health probes monitor DB connectivity every 60 seconds (`system_health` table).
   * If database latency > 3000ms or connection fails, the platform transitions to Level 5 degradation mode (static emergency banner with honest status disclosure per Section 5.3).
2. **Point-in-Time Recovery (PITR):**
   * Target: Restore state to timestamp $T_{-5\text{min}}$ prior to failure.
   * Procedure: Trigger Supabase PITR restoration via management console $\to$ re-verify RLS policies $\to$ run automated test suite (`pnpm test`).
3. **Emergency Cold Restore (`pg_dump`):**
   ```bash
   # Restore schema and records into target PostgreSQL instance
   psql -h <host> -U postgres -d postgres -f aix_cold_backup_latest.sql
   # Execute migration verification
   pnpm test
   ```
4. **Data Integrity Audit:**
   * Run Wald-Wolfowitz runs test and SHA-256 content hash checks on `aviator_rounds` to guarantee zero data corruption or unverified synthetic injection.
