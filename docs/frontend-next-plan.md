# Frontend Next.js Plan

## Stack
- Next.js App Router + TypeScript (`web/`)
- Sunrise-inspired design tokens from existing template
- Wallet state persisted in localStorage for now

## Implemented Scaffold
- `web/src/app/page.tsx` (landing)
- `web/src/app/dashboard/page.tsx` (wallet-gated dashboard)
- `web/src/components/Header.tsx`
- `web/src/components/DashboardShell.tsx`
- `web/src/lib/dashboard-seed.ts` (binds engine output)

## Next implementation steps
1. Replace mock wallet with Solana wallet adapter
2. Add Next API routes for live refresh + report reads
3. Connect parameters panel to API-driven re-scoring
4. Add export actions from dashboard
