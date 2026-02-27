import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { DashboardData, ProfileKey, ThresholdOverrides } from '@/lib/report-types';
import balancedSnapshot from '@/data/reports/balanced.report.json';
import strictSimonSnapshot from '@/data/reports/strict_simon.report.json';
import growthSnapshot from '@/data/reports/growth.report.json';

const PROFILE_OUT: Record<ProfileKey, string> = {
  balanced: 'data/output',
  strict_simon: 'data/output/strict',
  growth: 'data/output/growth',
};

const SNAPSHOT_REPORTS: Record<ProfileKey, unknown> = {
  balanced: balancedSnapshot,
  strict_simon: strictSimonSnapshot,
  growth: growthSnapshot,
};

const PROFILE_REPORT_PATH: Record<ProfileKey, string> = {
  balanced: 'report.json',
  strict_simon: 'strict/report.json',
  growth: 'growth/report.json',
};

function repoRoot() {
  return path.resolve(process.cwd(), '..');
}

function normalizeBaseUrl(input: string) {
  return input.trim().replace(/\/+$/, '');
}

export function getEngineApiBaseUrl() {
  const direct = process.env.ENGINE_API_BASE_URL;
  if (direct && direct.trim().length > 0) {
    return normalizeBaseUrl(direct);
  }
  return '';
}

function getEngineApiToken() {
  return (process.env.ENGINE_API_TOKEN || '').trim();
}

export function isEngineApiEnabled() {
  return getEngineApiBaseUrl().length > 0;
}

export function getRemoteReportsBaseUrl() {
  const direct = process.env.REPORTS_BASE_URL;
  if (direct && direct.trim().length > 0) {
    return normalizeBaseUrl(direct);
  }
  return '';
}

export function isRemoteReportsEnabled() {
  return getRemoteReportsBaseUrl().length > 0;
}

export function getRemoteReportUrl(profile: ProfileKey) {
  const base = getRemoteReportsBaseUrl();
  if (!base) return '';
  const profilePath = PROFILE_REPORT_PATH[profile] || PROFILE_REPORT_PATH.balanced;
  return `${base}/${profilePath}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchEngineApiJson(
  endpoint: string,
  init: RequestInit = {},
  timeoutMs = 20000,
): Promise<unknown | null> {
  const base = getEngineApiBaseUrl();
  if (!base) return null;

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const token = getEngineApiToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${base}${endpoint}`, {
      ...init,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

type EngineApiPayload = {
  profile: ProfileKey;
  data: DashboardData;
  warning?: string;
};

export async function fetchEngineApiReport(profile: ProfileKey, refresh: boolean): Promise<EngineApiPayload | null> {
  const query = new URLSearchParams({ profile });
  if (refresh) query.set('refresh', '1');
  const body = await fetchEngineApiJson(`/report?${query.toString()}`, undefined, 25000);
  if (!body || typeof body !== 'object') return null;
  return body as EngineApiPayload;
}

export async function fetchEngineApiRecompute(
  profile: ProfileKey,
  thresholds: ThresholdOverrides,
): Promise<EngineApiPayload | null> {
  const body = await fetchEngineApiJson(
    '/recompute',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, thresholds }),
    },
    45000,
  );
  if (!body || typeof body !== 'object') return null;
  return body as EngineApiPayload;
}

export function resolveProfileOutDir(profile: ProfileKey) {
  return PROFILE_OUT[profile] || PROFILE_OUT.balanced;
}

export function readReport(profile: ProfileKey, customOutDir?: string) {
  const root = repoRoot();
  const outDir = customOutDir || resolveProfileOutDir(profile);
  const filePath = path.join(root, outDir, 'report.json');

  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      // ignore invalid fs report and fallback below
    }
  }

  try {
    const snapshot = SNAPSHOT_REPORTS[profile];
    if (!snapshot) return null;
    return JSON.parse(JSON.stringify(snapshot));
  } catch {
    return null;
  }
}

export async function readRemoteReport(profile: ProfileKey): Promise<unknown | null> {
  const url = getRemoteReportUrl(profile);
  if (!url) return null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${url}?ts=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        if (attempt < 3) {
          await sleep(250 * attempt);
          continue;
        }
        return null;
      }

      const parsed = await response.json();
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      return parsed;
    } catch {
      if (attempt < 3) {
        await sleep(250 * attempt);
        continue;
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

type RawRankedRow = {
  rank: number;
  asset_id: string;
  name: string;
  symbol: string;
  origin_chain: string;
  gate_status: string;
  adjusted_readiness_score: number;
  confidence_score: number;
};

type RawRejectedRow = {
  asset_id: string;
  name: string;
  symbol: string;
  origin_chain: string;
  rejection_reasons: string[];
};

type RawReport = {
  generated_at: string;
  calibration: DashboardData['calibration'];
  meta: DashboardData['meta'];
  thresholds: DashboardData['thresholds'];
  eligible_ranked?: RawRankedRow[];
  rejected?: RawRejectedRow[];
};

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
}

export function normalizeReport(report: RawReport): DashboardData {
  const eligibleRanked = Array.isArray(report?.eligible_ranked) ? report.eligible_ranked : [];
  const rejected = Array.isArray(report?.rejected) ? report.rejected : [];

  const meta = report?.meta || ({} as DashboardData['meta']);
  const thresholds = report?.thresholds || ({} as DashboardData['thresholds']);
  const calibration = report?.calibration || {
    profile: 'balanced',
    thresholds_used: {},
    counts: { total: 0, eligible: 0, borderline: 0, rejected: 0 },
  };

  return {
    generatedAt: asString(report?.generated_at, new Date().toISOString()),
    calibration,
    meta: {
      eligible_count: asNumber(meta.eligible_count),
      borderline_count: asNumber(meta.borderline_count),
      rejected_count: asNumber(meta.rejected_count),
      total_candidates: asNumber(meta.total_candidates),
    },
    thresholds: {
      min_mcap_usd: asNumber(thresholds.min_mcap_usd),
      min_fdv_usd: asNumber(thresholds.min_fdv_usd),
      min_est_liquidity_usd: asNumber(thresholds.min_est_liquidity_usd),
      min_tier1_cex_count: Math.max(1, Math.floor(asNumber(thresholds.min_tier1_cex_count, 1))),
      tier1_cex: asStringArray(thresholds.tier1_cex),
    },
    topRanked: eligibleRanked.slice(0, 20).map((r) => ({
      rank: Math.max(1, Math.floor(asNumber(r.rank, 1))),
      assetId: asString(r.asset_id, 'unknown'),
      name: asString(r.name, 'Unknown'),
      symbol: asString(r.symbol, ''),
      chain: asString(r.origin_chain, 'Unknown'),
      status: asString(r.gate_status, 'unknown'),
      score: asNumber(r.adjusted_readiness_score),
      confidence: asNumber(r.confidence_score),
    })),
    rejected: rejected.map((r) => ({
      assetId: asString(r.asset_id, 'unknown'),
      name: asString(r.name, 'Unknown'),
      symbol: asString(r.symbol, ''),
      chain: asString(r.origin_chain, 'Unknown'),
      reasons: asStringArray(r.rejection_reasons),
    })),
  };
}

export function runEngine(profile: ProfileKey, outDir: string, overrides?: ThresholdOverrides) {
  const root = repoRoot();
  const enginePath = path.join(root, 'engine', 'src', 'index.js');

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
    cwd: root,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export function sanitizeProfile(raw: string | null): ProfileKey {
  if (raw === 'strict_simon' || raw === 'growth' || raw === 'balanced') {
    return raw;
  }
  return 'balanced';
}

function asRecord(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object') {
    return input as Record<string, unknown>;
  }
  return {};
}

export function sanitizeOverrides(input: unknown): ThresholdOverrides {
  const safeInput = asRecord(input);
  const numberOr = (val: unknown, fallback: number) => {
    if (typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      return val;
    }
    return fallback;
  };

  const tier1Raw = safeInput.tier1_cex;
  const tier1 = Array.isArray(tier1Raw)
    ? Array.from(new Set(tier1Raw.filter((x: unknown) => typeof x === 'string' && x.trim().length > 0)))
    : [];

  return {
    min_mcap_usd: numberOr(safeInput.min_mcap_usd, 30000000),
    min_fdv_usd: numberOr(safeInput.min_fdv_usd, 30000000),
    min_est_liquidity_usd: numberOr(safeInput.min_est_liquidity_usd, 5000000),
    min_tier1_cex_count: Math.max(1, Math.floor(numberOr(safeInput.min_tier1_cex_count, 1))),
    tier1_cex: tier1,
  };
}
