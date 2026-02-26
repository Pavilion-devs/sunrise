import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readJson, writeJson, writeText } from './io.js';

function runCommand(args) {
  const result = spawnSync('node', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`command_failed: node ${args.join(' ')}`);
  }
}

function summarizeReport(filePath) {
  const report = readJson(filePath);
  return {
    generated_at: report.generated_at,
    meta: report.meta,
    top5: (report.eligible_ranked || []).slice(0, 5).map((row) => ({
      rank: row.rank,
      asset_id: row.asset_id,
      name: row.name,
      score: row.adjusted_readiness_score,
      confidence: row.confidence_score,
      gate_status: row.gate_status
    }))
  };
}

function toMarkdown(summary) {
  const lines = [];
  lines.push('# Live Refresh Comparison');
  lines.push('');
  lines.push(`Generated: ${summary.generated_at}`);
  lines.push('');

  for (const [profile, data] of Object.entries(summary.profiles)) {
    lines.push(`## ${profile}`);
    lines.push('');
    lines.push(`- Eligible: ${data.meta.eligible_count}`);
    lines.push(`- Borderline: ${data.meta.borderline_count}`);
    lines.push(`- Rejected: ${data.meta.rejected_count}`);
    lines.push('');
    lines.push('Top 5:');
    for (const row of data.top5) {
      lines.push(`- ${row.rank}. ${row.name} | Score ${row.score} | Confidence ${row.confidence}% | ${row.gate_status}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const root = process.cwd();

  runCommand(['engine/src/prune-cache.js']);
  runCommand(['engine/src/index.js', '--profile', 'strict_simon', '--out', 'data/output/strict']);
  runCommand(['engine/src/index.js', '--profile', 'balanced', '--out', 'data/output']);
  runCommand(['engine/src/index.js', '--profile', 'growth', '--out', 'data/output/growth']);
  runCommand(['engine/src/coverage-audit.js']);

  const profiles = {
    strict_simon: summarizeReport(path.join(root, 'data/output/strict/report.json')),
    balanced: summarizeReport(path.join(root, 'data/output/report.json')),
    growth: summarizeReport(path.join(root, 'data/output/growth/report.json'))
  };

  const payload = {
    generated_at: new Date().toISOString(),
    profiles
  };

  writeJson(path.join(root, 'data/output/live-refresh-summary.json'), payload);
  writeText(path.join(root, 'data/output/live-refresh-summary.md'), toMarkdown(payload));

  console.log('Wrote live refresh summary to data/output/live-refresh-summary.{json,md}');
}

main();
