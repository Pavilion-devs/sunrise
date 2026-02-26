const NUMERIC_FIELDS = ['mcap_usd', 'fdv_usd', 'est_liquidity_usd'];
const ARRAY_FIELDS = ['tier1_cex_listings'];

function chooseBestObservation(observations, field) {
  const available = observations
    .filter((obs) => obs.fields && obs.fields[field] !== null && obs.fields[field] !== undefined)
    .sort((a, b) => b.reliability - a.reliability);

  return available.length > 0 ? available[0] : null;
}

function detectNumericConflict(observations, field, tolerance = 0.2) {
  const values = observations
    .map((obs) => ({ provider: obs.provider, value: obs.fields?.[field] }))
    .filter((row) => typeof row.value === 'number' && row.value > 0);

  if (values.length < 2) {
    return null;
  }

  const min = Math.min(...values.map((v) => v.value));
  const max = Math.max(...values.map((v) => v.value));
  const ratio = (max - min) / min;
  if (ratio > tolerance) {
    return {
      field,
      type: 'numeric_divergence',
      divergence_ratio: Number(ratio.toFixed(3)),
      samples: values
    };
  }

  return null;
}

export function mergeProviderObservations(observations) {
  const merged = {
    values: {},
    selected_sources: {},
    conflicts: [],
    provider_errors: observations.filter((o) => o.error).map((o) => ({ provider: o.provider, error: o.error })),
    source_trace: observations.map((obs) => ({
      provider: obs.provider,
      reliability: obs.reliability,
      fetched_at: obs.fetched_at,
      error: obs.error || null,
      evidence: obs.evidence || null,
      fields_present: Object.keys(obs.fields || {})
    }))
  };

  for (const field of NUMERIC_FIELDS) {
    const best = chooseBestObservation(observations, field);
    merged.values[field] = best ? best.fields[field] : null;
    merged.selected_sources[field] = best ? best.provider : null;

    const conflict = detectNumericConflict(observations, field);
    if (conflict) {
      merged.conflicts.push(conflict);
    }
  }

  for (const field of ARRAY_FIELDS) {
    const best = chooseBestObservation(observations, field);
    merged.values[field] = best ? best.fields[field] : [];
    merged.selected_sources[field] = best ? best.provider : null;
  }

  return merged;
}
