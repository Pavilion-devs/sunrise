function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function freshnessScore(observations) {
  const valid = observations.filter((o) => o.fetched_at && !o.error);
  if (valid.length === 0) {
    return 20;
  }

  const agesHours = valid
    .map((o) => (Date.now() - new Date(o.fetched_at).getTime()) / 3600000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0);

  if (agesHours.length === 0) {
    return 30;
  }

  const avg = agesHours.reduce((a, b) => a + b, 0) / agesHours.length;
  if (avg <= 2) return 100;
  if (avg <= 24) return 85;
  if (avg <= 72) return 70;
  if (avg <= 168) return 55;
  return 35;
}

function sourceReliabilityScore(observations) {
  const valid = observations.filter((o) => !o.error);
  if (valid.length === 0) {
    return 20;
  }

  const avg = valid.reduce((sum, obs) => sum + (obs.reliability || 0), 0) / valid.length;
  return clamp(avg * 100, 0, 100);
}

function completenessScore(mergedValues) {
  const required = ['mcap_usd', 'fdv_usd', 'est_liquidity_usd', 'tier1_cex_listings'];
  let present = 0;

  for (const field of required) {
    const value = mergedValues[field];
    if (Array.isArray(value) ? value.length > 0 : typeof value === 'number' && value > 0) {
      present += 1;
    }
  }

  return (present / required.length) * 100;
}

function agreementScore(conflicts, observations) {
  const active = observations.filter((o) => !o.error).length;
  if (active <= 1) {
    return 70;
  }

  if (!conflicts || conflicts.length === 0) {
    return 95;
  }

  const penalty = Math.min(conflicts.length * 20, 60);
  return clamp(95 - penalty, 20, 95);
}

export function computeConfidence({ observations, mergedValues, conflicts }) {
  const components = {
    freshness: freshnessScore(observations),
    source_reliability: sourceReliabilityScore(observations),
    completeness: completenessScore(mergedValues),
    agreement: agreementScore(conflicts, observations)
  };

  const weighted =
    components.freshness * 0.25 +
    components.source_reliability * 0.35 +
    components.completeness * 0.2 +
    components.agreement * 0.2;

  return {
    confidence_score: Number(clamp(weighted, 0, 100).toFixed(2)),
    components
  };
}
