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

function hasFieldValue(observation, field) {
  if (!observation || observation.error) {
    return false;
  }
  const value = observation.fields?.[field];
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return typeof value === 'number' && value > 0;
}

function completenessScore(mergedValues, observations) {
  const required = ['mcap_usd', 'fdv_usd', 'est_liquidity_usd', 'tier1_cex_listings'];
  const validObservations = observations.filter((o) => !o.error);
  if (validObservations.length === 0) {
    return 20;
  }

  let weightedPresent = 0;

  for (const field of required) {
    const mergedValue = mergedValues[field];
    const mergedHasValue = Array.isArray(mergedValue)
      ? mergedValue.length > 0
      : typeof mergedValue === 'number' && mergedValue > 0;

    if (!mergedHasValue) {
      continue;
    }

    const supporting = validObservations.filter((obs) => hasFieldValue(obs, field));
    if (supporting.length === 0) {
      continue;
    }

    const hasExternal = supporting.some((obs) => obs.provider !== 'seed');
    const avgReliability =
      supporting.reduce((sum, obs) => sum + (obs.reliability || 0), 0) / supporting.length;
    const supportMultiplier = hasExternal ? 1 : 0.65;
    const fieldScore = clamp(avgReliability * 100, 0, 100) * supportMultiplier;
    weightedPresent += fieldScore;
  }

  const score = weightedPresent / required.length;
  if (!Number.isFinite(score)) {
    return 20;
  }
  return clamp(score, 20, 100);
}

function conflictSeverity(conflict) {
  if (!conflict || conflict.type !== 'numeric_divergence') {
    return 0.5;
  }

  const ratio =
    typeof conflict.divergence_ratio === 'number' && Number.isFinite(conflict.divergence_ratio)
      ? conflict.divergence_ratio
      : 0.2;

  // Map divergence ratio into 0..1 severity with log scaling.
  const adjusted = Math.max(0, ratio - 0.2);
  const normalized = Math.log1p(adjusted) / Math.log1p(10);
  return clamp(normalized, 0, 1);
}

function numericDisagreementRatios(observations) {
  const fields = ['mcap_usd', 'fdv_usd', 'est_liquidity_usd'];
  const valid = observations.filter((o) => !o.error);
  const ratios = [];

  for (const field of fields) {
    const values = valid
      .map((obs) => obs.fields?.[field])
      .filter((value) => typeof value === 'number' && value > 0);
    if (values.length < 2) {
      continue;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const ratio = min > 0 ? (max - min) / min : 0;
    if (Number.isFinite(ratio) && ratio >= 0) {
      ratios.push(ratio);
    }
  }

  return ratios;
}

function agreementScore(conflicts, observations) {
  const valid = observations.filter((o) => !o.error);
  const active = valid.length;
  if (active <= 1) {
    return 65;
  }

  const ratios = numericDisagreementRatios(observations);
  const conflictSeverities = (conflicts || []).map(conflictSeverity);
  const allSignals = [
    ...ratios.map((ratio) => {
      const normalized = Math.log1p(ratio) / Math.log1p(10);
      return clamp(normalized, 0, 1);
    }),
    ...conflictSeverities,
  ];

  if (allSignals.length === 0) {
    return 95;
  }

  const avgSignal = allSignals.reduce((sum, value) => sum + value, 0) / allSignals.length;
  const worstSignal = Math.max(...allSignals);
  const errorRate = clamp((observations.length - active) / Math.max(observations.length, 1), 0, 1);

  const penalty = 8 + avgSignal * 38 + worstSignal * 16 + errorRate * 18;
  return clamp(95 - penalty, 20, 95);
}

export function computeConfidence({ observations, mergedValues, conflicts }) {
  const components = {
    freshness: freshnessScore(observations),
    source_reliability: sourceReliabilityScore(observations),
    completeness: completenessScore(mergedValues, observations),
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
