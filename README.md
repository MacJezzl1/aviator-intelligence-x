# AVIATOR INTELLIGENCE X (AIX)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMacJezzl1%2Faviator-intelligence-x&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,AIX_OWNER_EMAIL,AIX_BOOTSTRAP_SECRET)
[![Provably Fair](https://img.shields.io/badge/Provably%20Fair-HMAC--SHA256-00d2ff?style=for-the-badge)](https://en.wikipedia.org/wiki/HMAC)

> **AVIATOR INTELLIGENCE X (AIX)** is a quantitative research terminal and multi-agent AI intelligence platform designed to study, model, and analyze provably fair crash game distributions, sequential independence, and calibrated probability bounds.

---

## ⚡ Core Features

- **100 Specialized Logical Agents** organized into 10 collaborative and adversarial departments.
- **Hollywoodbets & Betway Aviator Ingestion**: Real-time stream analysis and statistical breakdown of Spribe B2B engine feeds.
- **Cashout Level & Stopping Rules Analyzer**: Quantitative analysis of micro-cashout thresholds (e.g., 1.04x recovery ratio) and automated bankroll stopping rules (Take-Profit, Stop-Loss, Duration limits).
- **Zero-LLM Mathematical Core**: High-precision calculations for central tendency, variance, skewness, kurtosis, and empirical percentiles (`p10`–`p99`).
- **Cryptographic Provable Fairness Engine**: Real-time HMAC-SHA256 verification of 52-bit hash integers and Pareto crash distributions.
- **Adversarial Debates & Independent Criticism**: Dedicated critics challenge unsupported patterns, Gambler's Fallacy assertions, and small sample sizes.
- **Chief Intelligence Council**: Publishes structured 10-point consensus reports and rejects unverified assertions (`INSUFFICIENT EVIDENCE — NO RELIABLE FORECAST`).
- **Experimental Forecasting & Proper Scoring**: Continuous evaluation using multi-class Brier scoring, Log loss, and Expected Calibration Error (ECE).
- **Interactive Aviator Flight Simulator**: Canvas-based real-time trajectory visualization with live multipliers and crash dynamics.
- **Risk Analysis & Bankroll Sustainability**: Drawdown modelling, risk-of-ruin calculations, and mathematical disproof of Martingale betting strategies.
- **Owner-Only Security Architecture**: Server-side initial Owner bootstrap (`AIX_OWNER_EMAIL`), user access approval queues, and complete Row Level Security (RLS) on all 25 PostgreSQL tables.
- **Progressive Web App (PWA)**: Offline shell caching, manifest support, and responsive layouts for mobile and desktop.

---

## 🏛️ 100-Agent Architecture (10 Departments × 10 Agents)

```
AVIATOR INTELLIGENCE X (100 SPECIALIZED LOGICAL AGENTS)
├── Dept 1: Betway Research (10 Agents)         -> Feed telemetry, empirical bounds, latency monitoring
├── Dept 2: Hollywoodbets Research (10 Agents)  -> High-volume stream stats, jurisdiction compliance
├── Dept 3: Cross-Platform Research (10 Agents) -> Two-sample Kolmogorov-Smirnov & Mann-Whitney tests
├── Dept 4: Mathematical Intelligence (10 Agents)-> Moments, Pareto MLE fitting, Wald-Wolfowitz runs
├── Dept 5: Pattern Research (10 Agents)        -> Streak analytics, Markov chains, apophenia auditing
├── Dept 6: Forecast Research (10 Agents)       -> Calibrated multi-bin horizons, uncertainty widening
├── Dept 7: Independent Critics (10 Agents)     -> Adversarial cross-examination, Gambler's fallacy striking
├── Dept 8: Simulation Research (10 Agents)     -> Mulberry32 PRNG Monte Carlo, bootstrap resampling
├── Dept 9: Risk Intelligence (10 Agents)       -> Drawdown modeling, ruin probability, stopping limits
└── Dept 10: Chief Council (10 Agents)          -> Multi-agent debate, binding vetoes, 10-point consensus
```

---

## 🧭 Multi-Platform Architecture & Navigation

The platform features 16 core navigation modules across 4 functional domains:

1. **OPERATOR PLATFORMS**:
   - `/` — Terminal Overview & Real-time Telemetry
   - `/betway` — Betway Aviator Intelligence Module (Independent Data & Analytics)
   - `/hollywoodbets` — Hollywoodbets Aviator Research Terminal
   - `/cross-platform` — Cross-Platform Comparative Research & Distribution Equivalence Tests
2. **100-AGENT AI ENGINE**:
   - `/agents` — 100-Agent Mission Control & Registry Directory
   - `/debate` — Adversarial Cross-Examination & Critic Debates
   - `/laboratory` — Simulation Laboratory (Mulberry32 PRNG & Pareto Engine)
   - `/council` — Chief Intelligence Council Deliberation Chamber
3. **QUANTITATIVE RESEARCH**:
   - `/forecasts` — Calibrated Multi-Horizon Probability Engine
   - `/reconciliation` — Forecast Reconciliation & ECE Reliability Calibration
   - `/performance` — Model Performance & Adaptive Backtesting
   - `/statistics` — Higher Central Moments & Percentile Distribution
4. **INTEGRATION & SECURITY**:
   - `/database` — Historical Records & Data Ingestion Inspector
   - `/risk` — Quantitative Risk & Stopping Threshold Calculator
   - `/integrations` — Platform Compatibility Registry & Health Telemetry
   - `/security` — Cryptographic Provably Fair HMAC-SHA512 Verification Suite
   - `/admin` — Owner Administration, Access Queues & Provider Configuration

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 24)
- `pnpm` (or `npm`)

### 2. Installation
```bash
git clone https://github.com/MacJezzl1/aviator-intelligence-x.git
cd aviator-intelligence-x
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://rrhtenamwselyjufyntw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
AIX_OWNER_EMAIL=owner@aix-terminal.io
```

### 4. Run Automated Test Suite
```bash
pnpm test
```
All 23 automated tests will execute:
- Two-sample Kolmogorov-Smirnov (KS) test
- Mann-Whitney U rank-sum test
- Platform distribution equivalence validation
- Wald-Wolfowitz runs test for sequential independence
- Mulberry32 seeded PRNG & Pareto MLE parameter fitting
- Multi-class Brier scoring, log loss, and Expected Calibration Error (ECE)
- HMAC-SHA256 & SHA-512 provable fairness verification
- 100-Agent registry (10 departments × 10 agents)
- Multi-agent debate orchestration & 10-point consensus
- Server-side Owner RBAC privilege escalation prevention

### 5. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

### Step 1: Import Repository
1. Push this repository to your GitHub account (`MacJezzl1/aviator-intelligence-x`).
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.

### Step 2: Environment Variables in Vercel
Add the following in **Project Settings &rarr; Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://rrhtenamwselyjufyntw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: *(Your Supabase publishable anon key)*
- `AIX_OWNER_EMAIL`: `owner@aix-terminal.io` *(or your preferred owner email)*
- `AIX_BOOTSTRAP_SECRET`: `aix_super_secret_bootstrap_token_2026`

### Step 3: Deploy
Click **"Deploy"**. Vercel will build the Next.js application automatically with static generation and edge optimization.

---

## 🛡️ Responsible Research Disclosure

**Aviator Intelligence X is an analytical, educational, and quantitative research terminal.**
- Aviator outcomes are generated via cryptographic provably fair random seeds.
- Past outcomes cannot establish future outcomes with certainty.
- The operator house edge (-3% RTP) is mathematically permanent.
- This platform does **not** provide betting signals, automated wagering, or financial advice.

---

## 📄 License
MIT License. Created by MacJezzl1.
