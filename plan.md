# Cluster 4 — Migrations: Build Plan ⚠️ TACKLE LAST

**Bounties:** Sunrise (Migrations)
**Prize potential:** up to $3,000
**Status:** [x] Planning complete [x] MVP in progress [x] Phase 1.1 hardening [ ] Demo ready

---

## Concept

Build a **Sunrise Asset Qualification OS**: a tool that identifies, filters,
and ranks migration candidate assets for Solana based on Sunrise-provided
criteria.

The product output is not just a score. It generates:
- A ranked shortlist of assets likely to succeed on Solana
- A rejected list with explicit reasons (audit trail)
- A launch brief for each top candidate that Sunrise can review quickly

This aligns directly with Simon's guidance:
- FDV/MCAP threshold
- Existing reputable CEX listing / price discovery
- Chain on Wormhole-supported network list
- Deployable liquidity size
- Solana appetite/demand signals
- Common rejection reasons encoded as hard checks

---

## Architecture

### 1) Data Intake Layer
- Inputs candidate assets from configured sources (manual seed CSV + API feeds)
- Normalizes fields into one schema:
  - `asset_id`, `name`, `symbol`
  - `origin_chain`, `origin_token_address`
  - `mcap_usd`, `fdv_usd`
  - `cex_listings[]`
  - `est_liquidity_usd`
  - `demand_signals` (search/social/protocol mentions)
  - `data_confidence`

### 2) Eligibility Gate Engine (Hard Fail)
- Rule checks:
  - Wormhole-supported chain required
  - FDV/MCAP floor met
  - Reputable CEX presence required
  - Minimum liquidity threshold met
- Output:
  - `eligible: true|false`
  - `rejection_reasons[]`

### 3) Readiness Scoring Engine (Eligible Assets Only)
- Weighted categories (0-100):
  - Market strength
  - Venue quality/liquidity
  - Solana demand appetite
  - Migration feasibility
- Output:
  - `readiness_score`
  - `confidence_score`
  - `missing_data_flags[]`

### 4) Output + Review Layer
- Ranked table of eligible assets
- Rejection log for failed assets
- Auto-generated launch brief per top asset:
  - Why selected
  - Risks
  - Assumptions
  - Suggested next Sunrise actions
- Export formats:
  - JSON (machine)
  - Markdown/PDF (human)

---

## Tech Stack

- TypeScript
- Node.js
- `zod` for schema validation
- CLI runner (`tsx` or equivalent)
- Lightweight web dashboard:
  - React + Vite
  - Simple table/detail view for ranking and rejections
- Storage:
  - JSON files for MVP
  - Optional SQLite upgrade if needed

Design principle: keep the first version deterministic and rules-based.
No ML, no overfitting, no black-box predictions.

---

## Build Steps

### Phase 0: Scope Lock (same day)
- Freeze v1 gates + scoring weights
- Freeze required data fields
- Define "reputable CEX" list for v1

### Phase 1: Core Engine MVP
- Implement schema + normalization pipeline
- Implement gate engine
- Implement scoring engine
- Build ranked/rejected outputs in CLI
- Validate with sample dataset

### Phase 1.1: Core Accuracy Hardening (Priority)
- Implement live-data provider adapters (CoinGecko + fallback provider interface)
- Add multi-source validation and conflict detection
- Replace manual confidence with computed field-level confidence model
- Upgrade gate semantics to include hard-fail and borderline classes
- Add demand-signal evidence ingestion (volume/social/protocol signal inputs)
- Add explainability payload (formula inputs, weights, and gate traces)
- Add profile-based calibration (`strict_simon`, `balanced`, `growth`)
- Add AI agent enrichment pipeline for evidence summaries (non-authoritative)

### Phase 2: Sunrise-Facing UX
- Build minimal dashboard:
  - Criteria panel
  - Ranked assets
  - Rejection reasons
  - Asset detail and launch brief
- Add export buttons (JSON + Markdown)

### Phase 3: Demo Data + Case Study
- Ingest real candidate asset set
- Generate top shortlist
- Produce 1-3 polished launch briefs
- Record walkthrough flow for submission video

### Phase 4: Submission Pack
- README with architecture and decision rationale
- Short demo script
- Final checklist validation

---

## MVP Acceptance Criteria

- Tool can evaluate at least 25 candidate assets
- Every rejected asset has at least one explicit reason
- Eligible assets get a reproducible score and confidence
- Top 5 assets produce launch briefs automatically
- End-to-end run is reproducible from one command
- Ranked results include explainability and evidence links
- Confidence score is computed from source quality, recency, and agreement
- Profiles can be switched via config and produce reproducible output
- AI enrichment is additive only; hard gates and score calculations remain deterministic

---

## Task Breakdown (Execution Order)

1. Create project scaffold (`engine/` + `web/` + `data/` + `docs/`)
2. Define `AssetCandidate` schema and validation
3. Implement chain support checker (Wormhole network list)
4. Implement gate rules and rejection reason enums
5. Implement weighted scoring function
6. Build CLI report generator
7. Build dashboard list/detail views
8. Add launch brief generator
9. Seed real candidate dataset and run calibration
10. Final polish + demo recording assets

### Phase 1.1 Implementation Order (Current Focus)
1. Provider abstraction and caching layer
2. Multi-source merge + conflict flags
3. Computed confidence model
4. Hard-fail vs borderline gate outputs
5. Demand evidence model + ingestion
6. Explainability traces in reports
7. Profile-based scoring calibration
8. AI agent enrichment command and integration

---

## Submission Notes

- Positioning: "Sunrise migration coordination pre-qualifier"
- Primary value: saves Sunrise time by filtering weak candidates early
- Demo narrative:
  - "Given candidate universe -> here is the shortlist and why"
  - "Here is who fails and why they fail"
  - "Here is a launch-ready brief for top picks"

---

## Resources Needed From You

Please gather these in parallel so implementation stays fast:

1. Simon-approved threshold hints
- Confirm if FDV/MCAP floor should be fixed (for example, 30M-40M) or range-based
- Any hard "must-have" CEX names for v1

2. Initial candidate asset universe (15-40 assets)
- Asset name, symbol, chain, token contract link
- Why it may have Solana demand

3. Preference list for "reputable CEX" in v1
- Example: Binance, Coinbase, OKX, Bybit, Kraken, etc.

4. Sunrise messaging constraints
- Any wording they prefer/avoid for public demo materials

5. Optional but useful
- Any follow-up messages from Simon that refine criteria

---

## AI Agent Guardrails (Must Keep)

- AI enrichment can summarize evidence and fill qualitative notes.
- AI is **not allowed** to generate market numbers used in scoring.
- Deterministic engine values (gates + score) always come from structured data.
