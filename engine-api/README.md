# Sunrise Engine API

Live engine service for per-request recompute.

## Endpoints
- `GET /health`
- `GET /report?profile=balanced|strict_simon|growth&refresh=1`
- `POST /recompute`
  - body:
    - `profile`
    - `thresholds` (`min_mcap_usd`, `min_fdv_usd`, `min_est_liquidity_usd`, `min_tier1_cex_count`, `tier1_cex`)

## Auth
If `ENGINE_API_TOKEN` is set:
- `GET /report` with `refresh=1` requires auth.
- `POST /recompute` requires auth.

Accepted headers:
- `Authorization: Bearer <token>`
- `x-engine-token: <token>`

## Local Run
```bash
cd engine-api
npm install
npm run dev
```

## Render Deployment
- Root Directory: `engine-api`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:
- `PORT` (Render sets this automatically)
- `REPO_ROOT=../` (usually fine in subdir deployment)
- `ENGINE_API_TOKEN=<secure_random_token>`

## Vercel Wiring
In Vercel (web app), set:
- `ENGINE_API_BASE_URL=https://<your-render-service-url>`
- `ENGINE_API_TOKEN=<same_token>`

When `ENGINE_API_BASE_URL` is configured, web API routes use engine-api for:
- live report refresh
- per-request recompute
