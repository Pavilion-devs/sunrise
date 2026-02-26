import path from 'node:path';
import process from 'node:process';
import { computeConfidence } from './confidence.js';
import { getDemandSignal } from './demand.js';
import { evaluateGates } from './gates.js';
import { mergeProviderObservations } from './merge.js';
import { readJson, writeJson, writeText } from './io.js';
import { collectProviderObservations, initializeProviderContext } from './providers.js';
import { buildLaunchBrief, toMarkdownReport } from './report.js';
import { computeReadinessScore } from './score.js';
import { validateCandidate } from './validate.js';

function parseArgs(argv) {
  const outFlagIndex = argv.indexOf('--out');
  const profileFlagIndex = argv.indexOf('--profile');
  const thresholdOverridesIndex = argv.indexOf('--threshold-overrides');
  const strict = argv.includes('--strict');
  const outDir = outFlagIndex >= 0 ? argv[outFlagIndex + 1] : 'data/output';
  const profile = profileFlagIndex >= 0 ? argv[profileFlagIndex + 1] : 'balanced';
  const thresholdOverridesRaw =
    thresholdOverridesIndex >= 0 ? argv[thresholdOverridesIndex + 1] : '';
  return { strict, outDir, profile, thresholdOverridesRaw };
}

function parseThresholdOverrides(raw) {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function mergeProfileIntoThresholds(baseThresholds, profiles, selectedProfile) {
  const profile = profiles[selectedProfile] || profiles.balanced;
  if (!profile) {
    return baseThresholds;
  }

  return {
    ...baseThresholds,
    ...profile,
    weights: {
      ...baseThresholds.weights,
      ...profile.weights
    }
  };
}

function rankEligible(eligible) {
  return eligible
    .sort((a, b) => b.scoring.adjusted_readiness_score - a.scoring.adjusted_readiness_score)
    .map((entry, idx) => ({
      rank: idx + 1,
      asset_id: entry.candidate.asset_id,
      name: entry.candidate.name,
      symbol: entry.candidate.symbol,
      origin_chain: entry.candidate.origin_chain,
      gate_status: entry.gates.gate_status,
      readiness_score: entry.scoring.readiness_score,
      adjusted_readiness_score: entry.scoring.adjusted_readiness_score,
      confidence_score: entry.scoring.confidence_score,
      score_breakdown: entry.scoring.score_breakdown,
      missing_data_flags: entry.scoring.missing_data_flags,
      explainability: entry.scoring.explainability,
      data_provenance: {
        selected_sources: entry.dataMerge.selected_sources,
        conflicts: entry.dataMerge.conflicts,
        provider_errors: entry.dataMerge.provider_errors
      },
      demand_evidence: entry.candidate.demand_evidence
    }));
}

async function main() {
  const { strict, outDir, profile, thresholdOverridesRaw } = parseArgs(process.argv.slice(2));
  const root = process.cwd();

  const baseThresholds = readJson(path.join(root, 'config/thresholds.json'));
  const profiles = readJson(path.join(root, 'config/scoring-profiles.json'));
  const dataProviderConfig = readJson(path.join(root, 'config/data-providers.json'));
  const supportedNetworks = readJson(path.join(root, 'config/wormhole-supported-networks.json'));
  const cgMap = readJson(path.join(root, 'config/coingecko-map.json'));
  const demandSignals = readJson(path.join(root, 'data/demand-signals.seed.json'));
  const candidates = readJson(path.join(root, 'data/candidate-assets.seed.json'));

  const profileThresholds = mergeProfileIntoThresholds(baseThresholds, profiles, profile);
  const thresholdOverrides = parseThresholdOverrides(thresholdOverridesRaw);
  const thresholds = {
    ...profileThresholds,
    ...thresholdOverrides,
    weights: {
      ...profileThresholds.weights,
      ...(thresholdOverrides.weights || {})
    }
  };
  const providerContext = await initializeProviderContext({
    root,
    dataProviderConfig,
    cgMap,
    tier1List: thresholds.tier1_cex
  });

  const validationErrors = [];
  const evaluated = [];

  for (const candidate of candidates) {
    const validation = validateCandidate(candidate);
    if (!validation.valid) {
      validationErrors.push({ asset_id: candidate.asset_id || 'unknown', errors: validation.errors });
      if (strict) {
        continue;
      }
    }

    const demand = getDemandSignal(candidate, demandSignals);
    const candidateWithDemand = {
      ...candidate,
      demand_signal_score: demand.demand_signal_score,
      demand_evidence: demand.demand_evidence
    };

    const observations = await collectProviderObservations({
      root,
      candidate: candidateWithDemand,
      dataProviderConfig,
      cgMap,
      providerContext
    });

    const dataMerge = mergeProviderObservations(observations);
    const confidence = computeConfidence({
      observations,
      mergedValues: dataMerge.values,
      conflicts: dataMerge.conflicts
    });

    const hydrated = {
      ...candidateWithDemand,
      mcap_usd: dataMerge.values.mcap_usd ?? candidateWithDemand.mcap_usd,
      fdv_usd: dataMerge.values.fdv_usd ?? candidateWithDemand.fdv_usd,
      est_liquidity_usd: dataMerge.values.est_liquidity_usd ?? candidateWithDemand.est_liquidity_usd,
      tier1_cex_listings: dataMerge.values.tier1_cex_listings?.length
        ? dataMerge.values.tier1_cex_listings
        : candidateWithDemand.tier1_cex_listings
    };

    const gates = evaluateGates(hydrated, thresholds, supportedNetworks);
    const scoring = computeReadinessScore(hydrated, thresholds, confidence);

    evaluated.push({
      candidate: hydrated,
      gates,
      scoring,
      confidence,
      dataMerge,
      observations
    });
  }

  const eligible = evaluated.filter((row) => row.gates.eligible);
  const rejected = evaluated.filter((row) => !row.gates.eligible);
  const borderline = eligible.filter((row) => row.gates.gate_status === 'borderline');

  const eligibleRanked = rankEligible(eligible);
  const rejectedSummary = rejected.map((row) => ({
    asset_id: row.candidate.asset_id,
    name: row.candidate.name,
    symbol: row.candidate.symbol,
    origin_chain: row.candidate.origin_chain,
    rejection_reasons: row.gates.rejection_reasons,
    data_conflicts: row.dataMerge.conflicts
  }));

  const topBriefs = eligible
    .sort((a, b) => b.scoring.adjusted_readiness_score - a.scoring.adjusted_readiness_score)
    .slice(0, 5)
    .map((row) => buildLaunchBrief(row.candidate, row.scoring, row.gates));

  const calibration = {
    profile,
    thresholds_used: thresholds,
    counts: {
      total: candidates.length,
      eligible: eligible.length,
      borderline: borderline.length,
      rejected: rejected.length
    }
  };

  const summary = {
    generated_at: new Date().toISOString(),
    meta: {
      total_candidates: candidates.length,
      evaluated_candidates: evaluated.length,
      eligible_count: eligible.length,
      borderline_count: borderline.length,
      rejected_count: rejected.length,
      validation_error_count: validationErrors.length
    },
    thresholds,
    calibration,
    eligible_ranked: eligibleRanked,
    rejected: rejectedSummary,
    launch_briefs: topBriefs,
    validation_errors: validationErrors
  };

  writeJson(path.join(root, outDir, 'report.json'), summary);
  writeText(path.join(root, outDir, 'report.md'), toMarkdownReport(summary));

  console.log(
    `Scored ${evaluated.length} candidates (${eligible.length} eligible, ${borderline.length} borderline, ${rejected.length} rejected).`
  );
  if (validationErrors.length > 0) {
    console.log(`Validation issues: ${validationErrors.length} (see report.json).`);
  }
  console.log(`Profile: ${profile}`);
  console.log(`Output written to ${outDir}`);
}

main();
