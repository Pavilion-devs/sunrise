import path from 'node:path';
import { readJson, writeJson, writeText } from './io.js';

// Native assets do not have a canonical contract address on their origin chain.
// They are excluded from "missing origin token address" audit failures.
const NATIVE_ASSET_IDS = new Set([
  'avalanche',
  'sei',
  'sui',
  'aptos',
  'injective',
  'near',
  'celestia',
  'dogecoin',
  'kaspa'
]);

function requiresOriginTokenAddress(candidate) {
  return !NATIVE_ASSET_IDS.has(candidate.asset_id);
}

function markdown(audit) {
  const lines = [];
  lines.push('# Data Coverage Audit');
  lines.push('');
  lines.push(`Generated: ${audit.generated_at}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Candidates: ${audit.summary.total_candidates}`);
  lines.push(`- Mapped to CoinGecko IDs: ${audit.summary.mapped_candidates}`);
  lines.push(`- Unmapped candidates: ${audit.summary.unmapped_candidates}`);
  lines.push(`- Market snapshot coverage: ${audit.summary.market_snapshot_coverage}/${audit.summary.mapped_candidates}`);
  lines.push(`- Listings snapshot coverage: ${audit.summary.listings_snapshot_coverage}/${audit.summary.mapped_candidates}`);
  lines.push(`- Missing origin token address: ${audit.summary.missing_origin_token_address}`);
  lines.push(`- Native assets excluded from address check: ${audit.summary.native_assets_excluded}`);
  lines.push('');

  lines.push('## Unmapped Candidates');
  lines.push('');
  if (audit.unmapped.length === 0) {
    lines.push('- None');
  } else {
    for (const id of audit.unmapped) {
      lines.push(`- ${id}`);
    }
  }
  lines.push('');

  lines.push('## Missing Market Snapshot IDs');
  lines.push('');
  if (audit.missing_market_snapshot.length === 0) {
    lines.push('- None');
  } else {
    for (const id of audit.missing_market_snapshot) {
      lines.push(`- ${id}`);
    }
  }
  lines.push('');

  lines.push('## Missing Listings Snapshot IDs');
  lines.push('');
  if (audit.missing_listings_snapshot.length === 0) {
    lines.push('- None');
  } else {
    for (const id of audit.missing_listings_snapshot) {
      lines.push(`- ${id}`);
    }
  }
  lines.push('');

  lines.push('## Native Assets Excluded From Address Check');
  lines.push('');
  if (audit.native_assets_excluded.length === 0) {
    lines.push('- None');
  } else {
    for (const id of audit.native_assets_excluded) {
      lines.push(`- ${id}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const root = process.cwd();
  const candidates = readJson(path.join(root, 'data/candidate-assets.seed.json'));
  const map = readJson(path.join(root, 'config/coingecko-map.json'));

  let marketsById = {};
  let listingsById = {};

  try {
    const markets = readJson(path.join(root, 'data/cache/coingecko/markets_snapshot_v1.json'));
    marketsById = markets.payload?.by_id || {};
  } catch {}

  try {
    const listings = readJson(path.join(root, 'data/cache/coingecko/tier1_listings_snapshot_v1.json'));
    listingsById = listings.payload?.by_id || {};
  } catch {}

  const candidateIds = candidates.map((c) => c.asset_id);
  const unmapped = candidateIds.filter((id) => !map[id]);
  const mapped = candidateIds.filter((id) => !!map[id]);

  const missingMarketSnapshot = mapped.filter((id) => !marketsById[map[id]]);
  const missingListingsSnapshot = mapped.filter((id) => !listingsById[map[id]]);
  const nativeAssetsExcluded = candidates
    .filter((c) => !requiresOriginTokenAddress(c))
    .map((c) => c.asset_id);
  const missingOriginTokenAddress = candidates
    .filter((c) => requiresOriginTokenAddress(c))
    .filter((c) => typeof c.origin_token_address !== 'string' || c.origin_token_address.trim().length === 0)
    .map((c) => c.asset_id);

  const audit = {
    generated_at: new Date().toISOString(),
    summary: {
      total_candidates: candidateIds.length,
      mapped_candidates: mapped.length,
      unmapped_candidates: unmapped.length,
      market_snapshot_coverage: mapped.length - missingMarketSnapshot.length,
      listings_snapshot_coverage: mapped.length - missingListingsSnapshot.length,
      missing_origin_token_address: missingOriginTokenAddress.length,
      native_assets_excluded: nativeAssetsExcluded.length
    },
    unmapped,
    missing_market_snapshot: missingMarketSnapshot,
    missing_listings_snapshot: missingListingsSnapshot,
    missing_origin_token_address_assets: missingOriginTokenAddress,
    native_assets_excluded: nativeAssetsExcluded
  };

  writeJson(path.join(root, 'data/output/coverage-audit.json'), audit);
  writeText(path.join(root, 'data/output/coverage-audit.md'), markdown(audit));

  console.log('Coverage audit written to data/output/coverage-audit.{json,md}');
}

main();
