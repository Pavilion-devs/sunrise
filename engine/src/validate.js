const REQUIRED_STRING_FIELDS = ['asset_id', 'name', 'symbol', 'origin_chain'];
const REQUIRED_NUMBER_FIELDS = [
  'mcap_usd',
  'fdv_usd',
  'est_liquidity_usd',
  'demand_signal_score',
  'migration_feasibility_score',
  'data_confidence'
];

export function validateCandidate(candidate) {
  const errors = [];

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof candidate[field] !== 'string' || candidate[field].trim().length === 0) {
      errors.push(`missing_or_invalid_${field}`);
    }
  }

  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof candidate[field] !== 'number' || Number.isNaN(candidate[field])) {
      errors.push(`missing_or_invalid_${field}`);
    }
  }

  if (!Array.isArray(candidate.tier1_cex_listings)) {
    errors.push('missing_or_invalid_tier1_cex_listings');
  }

  if (typeof candidate.demand_signal_score === 'number') {
    if (candidate.demand_signal_score < 0 || candidate.demand_signal_score > 100) {
      errors.push('invalid_demand_signal_score_range');
    }
  }

  if (typeof candidate.migration_feasibility_score === 'number') {
    if (candidate.migration_feasibility_score < 0 || candidate.migration_feasibility_score > 100) {
      errors.push('invalid_migration_feasibility_score_range');
    }
  }

  if (typeof candidate.data_confidence === 'number') {
    if (candidate.data_confidence < 0 || candidate.data_confidence > 1) {
      errors.push('invalid_data_confidence_range');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
