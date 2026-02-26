export const dashboardSeed = {
  generatedAt: new Date(0).toISOString(),
  calibration: {
    profile: 'balanced',
    thresholds_used: {},
    counts: {
      total: 0,
      eligible: 0,
      borderline: 0,
      rejected: 0,
    },
  },
  meta: {
    total_candidates: 0,
    eligible_count: 0,
    borderline_count: 0,
    rejected_count: 0,
  },
  thresholds: {
    min_mcap_usd: 30000000,
    min_fdv_usd: 30000000,
    min_est_liquidity_usd: 5000000,
    min_tier1_cex_count: 1,
    tier1_cex: ['Binance', 'Coinbase', 'OKX', 'Bybit', 'Kraken'],
  },
  topRanked: [],
  rejected: [],
};
