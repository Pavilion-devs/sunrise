export type ProfileKey = 'strict_simon' | 'balanced' | 'growth';

export type DashboardData = {
  generatedAt: string;
  calibration: {
    profile: string;
    thresholds_used: Record<string, unknown>;
    counts: {
      total: number;
      eligible: number;
      borderline: number;
      rejected: number;
    };
  };
  meta: {
    eligible_count: number;
    borderline_count: number;
    rejected_count: number;
    total_candidates: number;
  };
  thresholds: {
    min_mcap_usd: number;
    min_fdv_usd: number;
    min_est_liquidity_usd: number;
    min_tier1_cex_count: number;
    tier1_cex: string[];
  };
  topRanked: Array<{
    rank: number;
    assetId: string;
    name: string;
    symbol: string;
    chain: string;
    status: string;
    score: number;
    confidence: number;
  }>;
  rejected: Array<{
    assetId: string;
    name: string;
    symbol: string;
    chain: string;
    reasons: string[];
  }>;
};

export type ThresholdOverrides = {
  min_mcap_usd: number;
  min_fdv_usd: number;
  min_est_liquidity_usd: number;
  min_tier1_cex_count: number;
  tier1_cex: string[];
};
