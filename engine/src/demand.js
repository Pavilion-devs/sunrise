function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getDemandSignal(candidate, demandSignalMap) {
  const evidence = demandSignalMap[candidate.asset_id] || null;
  if (!evidence) {
    return {
      demand_signal_score: clamp(candidate.demand_signal_score, 0, 100),
      demand_evidence: {
        mode: 'fallback_seed_score',
        evidence_links: []
      }
    };
  }

  const volume = clamp(evidence.volume_score ?? candidate.demand_signal_score, 0, 100);
  const social = clamp(evidence.social_velocity_score ?? candidate.demand_signal_score, 0, 100);
  const protocolInterest = clamp(evidence.solana_protocol_interest_score ?? candidate.demand_signal_score, 0, 100);

  const score = volume * 0.4 + social * 0.3 + protocolInterest * 0.3;

  return {
    demand_signal_score: Number(score.toFixed(2)),
    demand_evidence: {
      mode: 'proxy_weighted',
      volume_score: volume,
      social_velocity_score: social,
      solana_protocol_interest_score: protocolInterest,
      evidence_links: Array.isArray(evidence.evidence_links) ? evidence.evidence_links : []
    }
  };
}
