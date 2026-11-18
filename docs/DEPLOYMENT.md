# AVIATOR INTELLIGENCE X (AIX) — PRODUCTION DEPLOYMENT GUIDE
**Document Class:** Production Operations & Infrastructure Manual  
**Platform Version:** 3.0 (Truth-Locked Edition)  
**Standard:** Master Spec v3.0 (Section 10, 16)  

---

## 1. Architecture Overview
AIX is a web-first, installable PWA designed for deployment on modern edge/serverless infrastructure:
* **Frontend / Application Server:** Vercel (Next.js 15 App Router with Node.js runtime).
* **Database & Auth:** Supabase PostgreSQL (`rrhtenamwselyjufyntw`) with Row Level Security (RLS) on 100% of tables.
* **Storage & Backups:** Supabase managed backup snapshots + local cold snapshot in `supabase/backups/`.

---

## 2. Environment Variables Specification
Rule T8 dictates absolute separation of client-side and server-side secrets:

### 2.1 Public / Client Variables (Prefix: `NEXT_PUBLIC_`)
Safe for client bundle inclusion; zero privileged access:
* `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (`https://rrhtenamwselyjufyntw.supabase.co`).
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key.
* `NEXT_PUBLIC_APP_ENV`: `production` | `staging` | `development`.
* `NEXT_PUBLIC_APP_URL`: Canonical public deployment URL (e.g. `https://aviator-intelligence-x.vercel.app`).

### 2.2 Server-Only Secrets (Never prefixed with `NEXT_PUBLIC_`)
Strictly restricted to serverless API routes and edge functions:
* `SUPABASE_SERVICE_ROLE_KEY`: Service role key with administrative bypass (used strictly in backend cron/admin tasks).
* `AIX_OWNER_EMAIL`: Configured owner email address for role evaluation.
* `OWNER_BOOTSTRAP_TOKEN` / `AIX_BOOTSTRAP_SECRET`: One-time single-use bootstrap secret for initial owner provisioning.
* `AI_PROVIDER_KEYS`: Optional LLM provider keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `DEEPSEEK_API_KEY`, `LOCAL_OLLAMA_URL`). Core statistical engine operates with 0 AI dependencies if these are omitted.

---

## 3. Vercel Deployment Procedure
1. **Repository Connection:**
   Connect `https://github.com/MacJezzl1/aviator-intelligence-x.git` to Vercel.
2. **Build Configuration:**
   * Framework Preset: `Next.js`
   * Build Command: `pnpm build`
   * Install Command: `pnpm install`
   * Output Directory: `.next`
3. **Environment Setup:**
   Populate all Section 2 variables in the Vercel Project Settings > Environment Variables pane.
4. **Security Header Verification:**
   Next.js configuration (`next.config.ts`) automatically injects:
   * `X-Frame-Options: DENY`
   * `X-Content-Type-Options: nosniff`
   * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   * `Content-Security-Policy: default-src 'self' ...`
   * `Referrer-Policy: strict-origin-when-cross-origin`
   * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 4. Supabase Database Provisioning & Migrations
1. **Migration Execution:**
   Execute migrations strictly in chronological order located in `supabase/migrations/`:
   ```bash
   pnpm exec supabase db push
   ```
2. **Row Level Security (RLS) Verification:**
   Ensure RLS is enabled on 100% of tables (26/26). Deny-by-default is enforced for anonymous and pending roles.
3. **Owner Bootstrap:**
   Execute one-time bootstrap POST request to `/api/auth/bootstrap` with `bootstrapSecret` to claim ownership. Replay attempts will return HTTP 410.

---

## 5. Pre-Deployment Verification Checklist
Run local verification commands before cutting any release:
```bash
# 1. Full Unit & Gate Test Suite (Must be 100% passing)
pnpm test

# 2. TypeScript Strict Static Type-Check (Must be 0 errors)
pnpm exec tsc --noEmit

# 3. Next.js Production Build Verification
pnpm build
```
