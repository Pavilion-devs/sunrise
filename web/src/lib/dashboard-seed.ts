import report from '../../../data/output/report.json';

export const dashboardSeed = {
  generatedAt: report.generated_at,
  calibration: report.calibration,
  meta: report.meta,
  thresholds: report.thresholds,
  topRanked: (report.eligible_ranked || []).slice(0, 12).map((r) => ({
    rank: r.rank,
    assetId: r.asset_id,
    name: r.name,
    symbol: r.symbol,
    chain: r.origin_chain,
    status: r.gate_status,
    score: r.adjusted_readiness_score,
    confidence: r.confidence_score,
  })),
  rejected: (report.rejected || []).map((r) => ({
    assetId: r.asset_id,
    name: r.name,
    symbol: r.symbol,
    chain: r.origin_chain,
    reasons: r.rejection_reasons || [],
  })),
};
