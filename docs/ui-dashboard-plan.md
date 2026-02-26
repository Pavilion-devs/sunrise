# Phase 2 UI Plan (Landing + Wallet-Gated Dashboard)

## Goal
Build a Sunrise-inspired (not cloned) web app flow:
- Public landing page with top navbar and wallet connect button
- Wallet-gated dashboard with sidebar and interactive controls

## Brand Direction
- Keep Sunrise-style visual mood: warm gradient sky, glass surfaces, soft blur
- Avoid 1:1 copy of Sunrise layout/components
- Use custom dashboard information architecture for qualification workflow

## App Flow
1. User lands on landing page
2. User clicks Connect Wallet (mock wallet for demo)
3. On successful connect, user is routed to dashboard view
4. User can disconnect from navbar and return to landing

## Landing Page
- Navbar
  - Left: logo
  - Center: nav links
  - Right: Connect Wallet button
- Hero
  - Migration-focused headline
  - CTA button: Enter Dashboard (connects if not connected)
- Partner strip and footer remain as supporting proof

## Dashboard Layout
- Left sidebar
  - Overview
  - Ranked Assets
  - Rejection Log
  - Parameters
- Top bar
  - Wallet chip
  - Profile selector
- Main panels
  - KPI row (eligible, borderline, rejected, coverage)
  - Table/cards based on selected sidebar section

## Required Interactive Controls (Simon feedback)
- Editable thresholds and filters in Parameters section:
  - Min MCAP
  - Min FDV
  - Min deployable liquidity
  - Min Tier-1 CEX count
  - Tier-1 exchange toggles
  - Profile preset selector
- Reset to profile defaults

## Data Binding (Phase 2)
- Use seeded report snapshot from engine output for UI rendering
- Keep structure compatible with live refresh outputs

## Phase 2 Acceptance
- Wallet connect/disconnect flow works
- Dashboard is accessible only when wallet connected
- Sidebar navigation updates main content reliably
- Parameters panel is interactive and visually clear
- UI is Sunrise-aligned but not cloned
