import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 4000);
const REPO_ROOT = process.env.REPO_ROOT
  ? path.resolve(process.env.REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const ENGINE_API_TOKEN = (process.env.ENGINE_API_TOKEN || '').trim();

const PROFILE_OUT = {
  balanced: 'data/output',
  strict_simon: 'data/output/strict',
  growth: 'data/output/growth',
};

function sanitizeProfile(raw) {
  if (raw === 'strict_simon' || raw === 'growth' || raw === 'balanced') {
    return raw;
  }
  return 'balanced';
}

function asRecord(input) {
  if (input && typeof input === 'object') return input;
  return {};
}

function sanitizeOverrides(input) {
  const safeInput = asRecord(input);
  const numberOr = (val, fallback) => {
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      return val;
    }
    return fallback;
  };

  const tier1Raw = safeInput.tier1_cex;
  const tier1 = Array.isArray(tier1Raw)
    ? Array.from(new Set(tier1Raw.filter((x) => typeof x === 'string' && x.trim().length > 0)))
    : [];

  return {
    min_mcap_usd: numberOr(safeInput.min_mcap_usd, 30000000),
    min_fdv_usd: numberOr(safeInput.min_fdv_usd, 30000000),
    min_est_liquidity_usd: numberOr(safeInput.min_est_liquidity_usd, 5000000),
    min_tier1_cex_count: Math.max(1, Math.floor(numberOr(safeInput.min_tier1_cex_count, 1))),
    tier1_cex: tier1,
  };
}

function resolveProfileOutDir(profile) {
  return PROFILE_OUT[profile] || PROFILE_OUT.balanced;
}

function readReport(profile, customOutDir) {
  const outDir = customOutDir || resolveProfileOutDir(profile);
  const filePath = path.join(REPO_ROOT, outDir, 'report.json');
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function runEngine(profile, outDir, overrides) {
  const enginePath = path.join(REPO_ROOT, 'engine', 'src', 'index.js');
  if (!fs.existsSync(enginePath)) {
    return {
      ok: false,
      status: -1,
      stdout: '',
      stderr: `engine_unavailable: ${enginePath} not found`,
    };
  }

  const args = [enginePath, '--profile', profile, '--out', outDir];
  if (overrides) {
    args.push('--threshold-overrides', JSON.stringify(overrides));
  }

  const result = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function normalizeReport(report) {
  const eligibleRanked = Array.isArray(report?.eligible_ranked) ? report.eligible_ranked : [];
  const rejected = Array.isArray(report?.rejected) ? report.rejected : [];

  return {
    generatedAt: typeof report?.generated_at === 'string' ? report.generated_at : new Date().toISOString(),
    calibration: report?.calibration || {
      profile: 'balanced',
      thresholds_used: {},
      counts: { total: 0, eligible: 0, borderline: 0, rejected: 0 },
    },
    meta: {
      eligible_count: Number(report?.meta?.eligible_count || 0),
      borderline_count: Number(report?.meta?.borderline_count || 0),
      rejected_count: Number(report?.meta?.rejected_count || 0),
      total_candidates: Number(report?.meta?.total_candidates || 0),
    },
    thresholds: {
      min_mcap_usd: Number(report?.thresholds?.min_mcap_usd || 0),
      min_fdv_usd: Number(report?.thresholds?.min_fdv_usd || 0),
      min_est_liquidity_usd: Number(report?.thresholds?.min_est_liquidity_usd || 0),
      min_tier1_cex_count: Number(report?.thresholds?.min_tier1_cex_count || 1),
      tier1_cex: Array.isArray(report?.thresholds?.tier1_cex) ? report.thresholds.tier1_cex : [],
    },
    topRanked: eligibleRanked.slice(0, 20).map((r) => ({
      rank: Number(r.rank || 0),
      assetId: r.asset_id || 'unknown',
      name: r.name || 'Unknown',
      symbol: r.symbol || '',
      chain: r.origin_chain || 'Unknown',
      status: r.gate_status || 'unknown',
      score: Number(r.adjusted_readiness_score || 0),
      confidence: Number(r.confidence_score || 0),
    })),
    rejected: rejected.map((r) => ({
      assetId: r.asset_id || 'unknown',
      name: r.name || 'Unknown',
      symbol: r.symbol || '',
      chain: r.origin_chain || 'Unknown',
      reasons: Array.isArray(r.rejection_reasons) ? r.rejection_reasons : [],
    })),
  };
}

function isAuthorized(req) {
  if (!ENGINE_API_TOKEN) return true;
  const bearer = typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.slice('Bearer '.length).trim()
    : '';
  const headerToken = typeof req.headers['x-engine-token'] === 'string'
    ? req.headers['x-engine-token'].trim()
    : '';
  return bearer === ENGINE_API_TOKEN || headerToken === ENGINE_API_TOKEN;
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'sunrise-engine-api',
    repoRoot: REPO_ROOT,
    authEnabled: ENGINE_API_TOKEN.length > 0,
    now: new Date().toISOString(),
  });
});

app.get('/report', (req, res) => {
  try {
    const profile = sanitizeProfile(String(req.query.profile || 'balanced'));
    const refresh = String(req.query.refresh || '0') === '1';

    let warning = '';
    if (refresh) {
      if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      const run = runEngine(profile, resolveProfileOutDir(profile));
      if (!run.ok) {
        warning = run.stderr || run.stdout || 'engine_refresh_failed';
      }
    }

    const report = readReport(profile);
    if (!report) {
      return res.status(404).json({ error: 'report_not_found' });
    }

    return res.json({
      profile,
      data: normalizeReport(report),
      warning: warning || undefined,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'report_exception',
      details: String(error),
    });
  }
});

app.post('/recompute', (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const profile = sanitizeProfile(req.body?.profile ?? null);
    const overrides = sanitizeOverrides(req.body?.thresholds ?? {});

    const outDir = 'data/output/runtime';
    const run = runEngine(profile, outDir, overrides);
    if (!run.ok) {
      return res.status(500).json({
        error: 'engine_recompute_failed',
        details: run.stderr || run.stdout || '',
      });
    }

    const report = readReport(profile, outDir);
    if (!report) {
      return res.status(404).json({ error: 'runtime_report_missing' });
    }

    return res.json({
      profile,
      data: normalizeReport(report),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'recompute_exception',
      details: String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`sunrise-engine-api listening on :${PORT}`);
  console.log(`repo root: ${REPO_ROOT}`);
});
