function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scaleLog(value, minValue, maxValue) {
  if (value <= 0 || minValue <= 0 || maxValue <= minValue) {
    return 0;
  }

  const minLog = Math.log10(minValue);
  const maxLog = Math.log10(maxValue);
  const valueLog = Math.log10(clamp(value, minValue, maxValue));
  return clamp(((valueLog - minLog) / (maxLog - minLog)) * 100, 0, 100);
}

function scoreMarketStrength(candidate, thresholds) {
  const mcapScore = scaleLog(candidate.mcap_usd, thresholds.min_mcap_usd, 100000000000);
  const fdvScore = scaleLog(candidate.fdv_usd, thresholds.min_fdv_usd, 150000000000);
  return (mcapScore + fdvScore) / 2;
}

function scoreVenueLiquidity(candidate, thresholds, tier1List) {
  const liquidityScore = scaleLog(candidate.est_liquidity_usd, thresholds.min_est_liquidity_usd, 1000000000);
  const tier1Coverage = clamp((candidate.tier1_cex_listings.length / Math.max(tier1List.length, 1)) * 100, 0, 100);
  return liquidityScore * 0.6 + tier1Coverage * 0.4;
}

export function computeReadinessScore(candidate, thresholds, confidence) {
  const marketStrength = scoreMarketStrength(candidate, thresholds);
  const venueLiquidity = scoreVenueLiquidity(candidate, thresholds, thresholds.tier1_cex);
  const solanaDemand = clamp(candidate.demand_signal_score, 0, 100);
  const migrationFeasibility = clamp(candidate.migration_feasibility_score, 0, 100);

  const weighted =
    marketStrength * thresholds.weights.market_strength +
    venueLiquidity * thresholds.weights.venue_liquidity +
    solanaDemand * thresholds.weights.solana_demand +
    migrationFeasibility * thresholds.weights.migration_feasibility;

  const readinessScore = Number(weighted.toFixed(2));
  const confidenceScore = Number(clamp(confidence?.confidence_score ?? 50, 0, 100).toFixed(2));
  const confidenceFactor = Number((0.8 + (confidenceScore / 100) * 0.2).toFixed(4));
  const adjustedScore = Number((readinessScore * confidenceFactor).toFixed(2));

  const missingDataFlags = [];
  if (!candidate.origin_token_address) {
    missingDataFlags.push('missing_origin_token_address');
  }
  if (confidenceScore < 60) {
    missingDataFlags.push('low_data_confidence');
  }

  return {
    readiness_score: readinessScore,
    adjusted_readiness_score: adjustedScore,
    confidence_score: confidenceScore,
    confidence_factor: confidenceFactor,
    score_breakdown: {
      market_strength: Number(marketStrength.toFixed(2)),
      venue_liquidity: Number(venueLiquidity.toFixed(2)),
      solana_demand: Number(solanaDemand.toFixed(2)),
      migration_feasibility: Number(migrationFeasibility.toFixed(2))
    },
    explainability: {
      weights: thresholds.weights,
      inputs: {
        mcap_usd: candidate.mcap_usd,
        fdv_usd: candidate.fdv_usd,
        est_liquidity_usd: candidate.est_liquidity_usd,
        tier1_cex_listings_count: candidate.tier1_cex_listings.length,
        demand_signal_score: solanaDemand,
        migration_feasibility_score: migrationFeasibility
      }
    },
    missing_data_flags: missingDataFlags
  };
}
