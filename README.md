# AVIATOR INTELLIGENCE X (AIX)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Provably Fair](https://img.shields.io/badge/Provably%20Fair-HMAC--SHA256-00d2ff?style=for-the-badge)](https://en.wikipedia.org/wiki/HMAC)

> **AVIATOR INTELLIGENCE X (AIX)** is a quantitative research terminal and multi-agent AI intelligence platform designed to study, model, and analyze provably fair crash game distributions, sequential independence, and calibrated probability bounds.

---

## ⚡ Core Features

- **100 Specialized Logical Agents** organized into 10 collaborative and adversarial departments.
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

## 🏛️ 100-Agent Architecture

```
AVIATOR INTELLIGENCE X (100 LOGICAL AGENTS)
├── Dept A: Statistical Intelligence (15 Agents) -> Moments, Distributions, Percentiles
├── Dept B: Pattern Intelligence (15 Agents)     -> Streaks, Markov Chains, Apophenia Guard
├── Dept C: Mathematical Intelligence (10 Agents) -> Monte Carlo, Runs Tests, KS Goodness-of-Fit
├── Dept D: Forecast Intelligence (10 Agents)    -> Probability Horizons, Uncertainty Bounds
├── Dept E: Independent Critics (10 Agents)      -> Adversarial Cross-Examination, Disproof
├── Dept F: Strategic Intelligence (10 Agents)   -> Alternative Hypotheses, Edge Drag Tests
├── Dept G: Live Data Operations (10 Agents)     -> HMAC Validation, Deduplication, Latency
├── Dept H: Risk Intelligence (10 Agents)        -> Volatility, Drawdowns, Safety Disclosures
├── Dept I: Research Intelligence (5 Agents)     -> Literature Benchmarks, Calibration Ranking
└── Dept J: Chief Intelligence Council (5 Agents) -> Deliberation & 10-Point Consensus Reports
```

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
All 15 unit and security tests will execute:
- Central moments and percentiles
- Wald-Wolfowitz runs test
- HMAC-SHA256 provable fairness check
- Brier scoring and log loss
- 100-Agent registry and council consensus
- Server-side Owner RBAC validation

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
