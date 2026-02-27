# Sunrise Migration Qualification OS

Wallet-gated qualification engine that helps Sunrise decide which assets to onboard to Solana first.

## Live Demo
- App: https://web-one-xi-77.vercel.app
- Demo video: https://youtu.be/z9kkLjcipGQ

## What It Does
- Ranks migration candidates by readiness score + confidence.
- Shows transparent rejection reasons (`unsupported chain`, `low liquidity`, etc.).
- Lets operators tune thresholds and tier-1 exchange filters in real time.
- Includes an AI assistant in-dashboard (`GPT-4o` primary, Gemini backup).

## Stack
- Frontend/API: Next.js 15 (App Router), React 19, Tailwind
- Wallet: Solana wallet adapter
- Engine: Node.js deterministic scoring pipeline
- Data: CoinGecko + Wormhole network support config + curated seed data
- Ops: GitHub Actions scheduled refresh + Vercel deployment

## How Production Refresh Works
1. GitHub Action (`.github/workflows/refresh-reports.yml`) runs every 30 minutes.
2. Engine refreshes reports and commits updated snapshots to `data/output/*`.
3. Web API reads report snapshots from `REPORTS_BASE_URL` (raw GitHub output path).
4. Dashboard fetches `/api/report` and `/api/recompute` for latest snapshot state.

This keeps Vercel runtime fast while still using live refreshed data.

## Local Development

### 1) Install dependencies
```bash
npm install
cd web && npm install
```

### 2) Run engine refresh (root)
```bash
npm run refresh:live
```

### 3) Run web app
```bash
cd web
npm run dev
```

## Useful Scripts (root)
- `npm run refresh:live` -> refresh all profiles + coverage summary
- `npm run report` -> generate balanced profile report
- `npm run run:profile:strict` -> strict_simon profile
- `npm run run:profile:growth` -> growth profile
- `npm run audit:coverage` -> data coverage audit

## Useful Scripts (web)
- `npm run dev` -> local frontend/API
- `npm run build` -> production build check
- `npm run smoke:e2e` -> endpoint smoke checks

## Environment (web/API)
- `OPENAI_API_KEY` (primary AI provider)
- `OPENAI_MODEL` (optional, default `gpt-4o`)
- `GEMINI_API_KEY` (backup AI provider)
- `GEMINI_MODEL` (optional, default `gemini-3-pro-preview`)
- `GEMINI_FALLBACK_MODEL` (optional, default `gemini-2.5-flash`)
- `REPORTS_BASE_URL` (required in production snapshot mode)
