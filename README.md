# Sunrise Asset Qualification OS

Deterministic qualification and ranking engine for Sunrise migration candidates.

## What is implemented
- Multi-source data provider pipeline (`seed`, `manual_override`, `coingecko`)
- Source merge with conflict detection
- Computed confidence model (freshness, reliability, completeness, agreement)
- Hard-fail + borderline gate semantics
- Demand signal evidence model and weighted demand score
- Explainable scoring output (weights, inputs, formula traces)
- Profile calibration (`strict_simon`, `balanced`, `growth`)
- AI agent enrichment (advisory-only, never mutates score or gates)

## Run

```bash
npm run report
```

Outputs:
- `data/output/report.json`
- `data/output/report.md`

## Run with profiles

```bash
npm run run:profile:strict
npm run run:profile:balanced
npm run run:profile:growth
```

## Live refresh (all profiles + comparison)

```bash
npm run refresh:live
```

Outputs:
- `data/output/live-refresh-summary.json`
- `data/output/live-refresh-summary.md`

## Cache maintenance

```bash
npm run prune:cache
```

## AI agent enrichment

```bash
npm run enrich
```

Output:
- `data/output/agent-enrichment.json`

Optional Gemini advisory mode:
- set `GEMINI_API_KEY`
- set `ENABLE_GEMINI_AGENT=1`
- optionally set `GEMINI_MODEL`

Guardrail: LLM output is advisory-only and does not modify deterministic ranking.

## Inputs
- Candidates: `data/candidate-assets.seed.json`
- Demand evidence: `data/demand-signals.seed.json`
- Base thresholds: `config/thresholds.json`
- Profile overrides: `config/scoring-profiles.json`
- Provider config: `config/data-providers.json`
- Wormhole networks: `config/wormhole-supported-networks.json`
- CoinGecko ID map: `config/coingecko-map.json`
- Live overrides (optional): `data/live-overrides.json` (use template: `data/live-overrides.example.json`)

## Notes
- If API access is unavailable, provider failures are captured in report provenance.
- Use live overrides to inject latest verified values before final submission.
