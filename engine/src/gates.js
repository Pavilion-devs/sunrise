function hasTier1CexListing(candidate, tier1List) {
  if (!Array.isArray(candidate.tier1_cex_listings)) {
    return false;
  }

  const allowed = new Set(tier1List);
  return candidate.tier1_cex_listings.some((exchange) => allowed.has(exchange));
}

function tier1CoverageCount(candidate, tier1List) {
  if (!Array.isArray(candidate.tier1_cex_listings)) {
    return 0;
  }

  const allowed = new Set(tier1List);
  return candidate.tier1_cex_listings.filter((exchange) => allowed.has(exchange)).length;
}

export function evaluateGates(candidate, thresholds, supportedNetworks) {
  const rejectionReasons = [];
  const borderlineReasons = [];
  const networkSet = new Set(supportedNetworks);

  if (!networkSet.has(candidate.origin_chain)) {
    rejectionReasons.push('unsupported_origin_chain');
  }

  if (candidate.mcap_usd < thresholds.min_mcap_usd && candidate.fdv_usd < thresholds.min_fdv_usd) {
    rejectionReasons.push('below_min_mcap_fdv');
  } else {
    const nearMcap = candidate.mcap_usd < thresholds.min_mcap_usd * 1.15;
    const nearFdv = candidate.fdv_usd < thresholds.min_fdv_usd * 1.15;
    if (nearMcap || nearFdv) {
      borderlineReasons.push('near_mcap_fdv_threshold');
    }
  }

  if (!hasTier1CexListing(candidate, thresholds.tier1_cex)) {
    rejectionReasons.push('no_tier1_cex_listing');
  }

  const tier1Count = tier1CoverageCount(candidate, thresholds.tier1_cex);
  if (tier1Count < thresholds.min_tier1_cex_count) {
    rejectionReasons.push('below_min_tier1_cex_count');
  }

  if (candidate.est_liquidity_usd < thresholds.min_est_liquidity_usd) {
    rejectionReasons.push('insufficient_estimated_liquidity');
  } else if (candidate.est_liquidity_usd < thresholds.min_est_liquidity_usd * 1.25) {
    borderlineReasons.push('near_liquidity_threshold');
  }

  const uniqueRejections = Array.from(new Set(rejectionReasons));
  const uniqueBorderlines = Array.from(new Set(borderlineReasons));

  return {
    eligible: uniqueRejections.length === 0,
    gate_status: uniqueRejections.length === 0 ? (uniqueBorderlines.length > 0 ? 'borderline' : 'pass') : 'fail',
    rejection_reasons: uniqueRejections,
    borderline_reasons: uniqueBorderlines
  };
}
