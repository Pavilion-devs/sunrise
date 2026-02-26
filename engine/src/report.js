export function buildLaunchBrief(candidate, scoring, gates) {
  const selectedFor = [
    `Strong market profile (MCAP: $${candidate.mcap_usd.toLocaleString()}, FDV: $${candidate.fdv_usd.toLocaleString()})`,
    `Tier-1 CEX footprint (${candidate.tier1_cex_listings.join(', ') || 'none'})`,
    `Estimated deployable liquidity: $${candidate.est_liquidity_usd.toLocaleString()}`,
    `Solana demand signal score: ${candidate.demand_signal_score}/100`
  ];

  const risks = [];
  if (scoring.missing_data_flags.length > 0) {
    risks.push(`Data quality gaps: ${scoring.missing_data_flags.join(', ')}`);
  }
  if (candidate.migration_feasibility_score < 65) {
    risks.push('Migration feasibility needs architecture review with Sunrise.');
  }
  if (candidate.est_liquidity_usd < 10000000) {
    risks.push('Liquidity cushion is thin for volatile launch windows.');
  }

  const nextActions = [
    'Validate canonical route and token representation with Sunrise.',
    'Confirm launch-day liquidity commitments and venue sequencing.',
    'Validate demand channels across Solana protocols and ecosystem partners.'
  ];

  return {
    asset_id: candidate.asset_id,
    asset_name: candidate.name,
    symbol: candidate.symbol,
    origin_chain: candidate.origin_chain,
    eligibility: gates,
    readiness_score: scoring.readiness_score,
    adjusted_readiness_score: scoring.adjusted_readiness_score,
    confidence_score: scoring.confidence_score,
    selected_for: selectedFor,
    risks: risks.length > 0 ? risks : ['No critical risks flagged in v1 rule set.'],
    assumptions: [
      'Market and liquidity metrics are time-sensitive and require refresh pre-submission.',
      'Tier-1 CEX list follows v1 default and may change with sponsor feedback.'
    ],
    next_actions: nextActions,
    source_notes: candidate.source_notes || ''
  };
}

export function toMarkdownReport(summary) {
  const lines = [];
  lines.push('# Sunrise Asset Qualification Report');
  lines.push('');
  lines.push(`Generated: ${summary.generated_at}`);
  lines.push(`Candidates evaluated: ${summary.meta.total_candidates}`);
  lines.push(`Eligible: ${summary.meta.eligible_count}`);
  lines.push(`Borderline: ${summary.meta.borderline_count}`);
  lines.push(`Rejected: ${summary.meta.rejected_count}`);
  lines.push('');

  lines.push('## Top Eligible Assets');
  lines.push('');
  if (summary.eligible_ranked.length === 0) {
    lines.push('- No eligible assets under current thresholds.');
  } else {
    for (const entry of summary.eligible_ranked.slice(0, 10)) {
      lines.push(
        `- ${entry.rank}. ${entry.name} (${entry.symbol}) | Score ${entry.adjusted_readiness_score} (raw ${entry.readiness_score}) | Confidence ${entry.confidence_score}% | Status ${entry.gate_status} | Chain ${entry.origin_chain}`
      );
    }
  }
  lines.push('');

  lines.push('## Rejection Audit Log');
  lines.push('');
  if (summary.rejected.length === 0) {
    lines.push('- No rejected assets.');
  } else {
    for (const entry of summary.rejected) {
      lines.push(`- ${entry.name} (${entry.symbol}): ${entry.rejection_reasons.join(', ')}`);
    }
  }
  lines.push('');

  lines.push('## Notes');
  lines.push('');
  lines.push('- This report uses deterministic gates/scoring and provenance-aware data merging.');
  lines.push('- AI enrichment is advisory and does not alter hard gates or score calculations.');

  return `${lines.join('\n')}\n`;
}
