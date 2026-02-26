# Remote Reports Pipeline (Vercel + GitHub Actions)

## Goal
Run the engine on a schedule in GitHub Actions, commit fresh report artifacts, and have Vercel read those remote report files instead of trying to run the engine in serverless runtime.

## What is configured
- Scheduled workflow: `.github/workflows/refresh-reports.yml`
  - Runs every 30 minutes
  - Runs `npm run refresh:live`
  - Syncs JSON snapshots into `web/src/data/reports/*.json`
  - Commits and pushes updated reports to `main`

- Vercel API behavior
  - If `REPORTS_BASE_URL` is set, `/api/report` reads remote JSON first.
  - `/api/recompute` returns latest remote snapshot with warning in remote mode.
  - Local/single-host engine execution remains available when `REPORTS_BASE_URL` is not set.

## Vercel env var
Set this in Vercel `Production`:

`REPORTS_BASE_URL=https://raw.githubusercontent.com/Pavilion-devs/sunrise/main/data/output`

## Manual run
1. Open GitHub repo Actions tab.
2. Run `Refresh Reports` workflow manually (`workflow_dispatch`).
3. Confirm new commit updates:
   - `data/output/report.json`
   - `data/output/strict/report.json`
   - `data/output/growth/report.json`

## Validation
- `GET /api/report?profile=balanced&refresh=1` should return `200` in prod.
- Response may include a `warning` when running in remote scheduled mode.
