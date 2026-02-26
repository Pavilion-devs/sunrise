# Data Sourcing Notes (v1)

## Current status
- Terminal network access is restricted in this environment.
- The current candidate dataset is a seeded baseline to validate scoring logic and UX flow.
- Every candidate includes `data_confidence` and `source_notes` so we can replace approximations with live values.

## Sources used
- Wormhole supported networks reference:
  - https://wormhole.com/docs/products/reference/supported-networks/

## Live data planned for refresh
- Market cap / FDV
- CEX listing coverage
- Liquidity estimates
- Demand-signal proxies

## Refresh strategy
1. Replace `data/candidate-assets.seed.json` metrics with live API values.
2. Keep a snapshot timestamp on each asset row.
3. Rerun `npm run report` to regenerate ranked/rejected outputs.
