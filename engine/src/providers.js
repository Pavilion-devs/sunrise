import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson, ensureDir } from './io.js';

function safeReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    return readJson(filePath);
  } catch {
    return fallback;
  }
}

function cachePath(root, providerName, key) {
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(root, 'data', 'cache', providerName, `${safeKey}.json`);
}

function readCache(root, providerName, key, ttlMinutes) {
  const filePath = cachePath(root, providerName, key);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const cached = safeReadJson(filePath, null);
  if (!cached || !cached.fetched_at || !cached.payload) {
    return null;
  }

  const ageMs = Date.now() - new Date(cached.fetched_at).getTime();
  if (Number.isNaN(ageMs) || ageMs > ttlMinutes * 60 * 1000) {
    return null;
  }

  return cached.payload;
}

function writeCache(root, providerName, key, payload) {
  const filePath = cachePath(root, providerName, key);
  ensureDir(path.dirname(filePath));
  writeJson(filePath, {
    fetched_at: new Date().toISOString(),
    payload
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractTier1ListingsFromTickers(tickers, tier1Set) {
  if (!Array.isArray(tickers)) {
    return [];
  }

  const listings = new Set();
  for (const ticker of tickers) {
    const marketName = ticker?.market?.name;
    if (marketName && tier1Set.has(marketName)) {
      listings.add(marketName);
    }
  }

  return Array.from(listings);
}

async function fetchJsonWithRetry(url, timeoutMs = 10000, attempts = 3) {
  let lastError = null;

  for (let i = 0; i < attempts; i += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: 'application/json',
          'user-agent': 'sunrise-asset-qualification-os/0.1'
        }
      });

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after') || '2');
        await sleep(Math.max(1000, retryAfter * 1000));
        lastError = new Error('http_429');
        continue;
      }

      if (!response.ok) {
        throw new Error(`http_${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await sleep(1000 * (i + 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('fetch_failed');
}

async function fetchCoinGeckoMarketsSnapshot({ root, cgMap, providerConfig }) {
  const cacheKey = 'markets_snapshot_v1';
  const ttlMinutes = providerConfig.ttl_minutes || 60;
  const cached = readCache(root, 'coingecko', cacheKey, ttlMinutes);
  const ids = Array.from(new Set(Object.values(cgMap).filter(Boolean)));
  const byId = cached?.by_id || {};
  const missingIds = ids.filter((id) => !Object.prototype.hasOwnProperty.call(byId, id));

  if (cached && missingIds.length === 0) {
    return {
      fetched_at: cached.fetched_at,
      by_id: byId,
      from_cache: true,
      error: null
    };
  }

  if (ids.length === 0) {
    return {
      fetched_at: null,
      by_id: {},
      from_cache: false,
      error: 'no_coingecko_ids'
    };
  }

  const queue = missingIds.length > 0 ? missingIds : ids;
  const chunks = [];
  for (let i = 0; i < queue.length; i += 100) {
    chunks.push(queue.slice(i, i + 100));
  }

  try {
    for (const chunk of chunks) {
      const url =
        'https://api.coingecko.com/api/v3/coins/markets' +
        `?vs_currency=usd&ids=${encodeURIComponent(chunk.join(','))}` +
        '&order=market_cap_desc&per_page=250&page=1&sparkline=false';

      const rows = await fetchJsonWithRetry(url, 12000, 3);
      for (const row of rows || []) {
        if (row?.id) {
          byId[row.id] = row;
        }
      }
      await sleep(300);
    }

    const payload = {
      fetched_at: new Date().toISOString(),
      by_id: byId
    };

    writeCache(root, 'coingecko', cacheKey, payload);

    return {
      fetched_at: payload.fetched_at,
      by_id: payload.by_id,
      from_cache: false,
      error: null
    };
  } catch (error) {
    return {
      fetched_at: null,
      by_id: {},
      from_cache: false,
      error: String(error.message || error)
    };
  }
}

async function fetchCoinGeckoTier1ListingsSnapshot({ root, cgMap, providerConfig, tier1List }) {
  const cacheKey = 'tier1_listings_snapshot_v1';
  const ttlMinutes = Math.max(providerConfig.ttl_minutes || 60, 240);
  const maxRequestsPerRun = Math.max(providerConfig.max_ticker_requests_per_run || 8, 1);
  const cached = readCache(root, 'coingecko', cacheKey, ttlMinutes);
  const ids = Array.from(new Set(Object.values(cgMap).filter(Boolean)));
  const tier1Set = new Set(tier1List || []);
  const stale = cached || readCache(root, 'coingecko', cacheKey, 60 * 24 * 30);
  const byId = stale?.by_id || {};
  const errors = stale?.errors || {};
  const missingIds = ids.filter((id) => !Object.prototype.hasOwnProperty.call(byId, id));

  if (cached && missingIds.length === 0) {
    return {
      fetched_at: cached.fetched_at,
      by_id: byId,
      errors,
      from_cache: true,
      error: null
    };
  }

  const fetchQueue = missingIds.slice(0, maxRequestsPerRun);

  try {
    for (const id of fetchQueue) {
      const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/tickers?include_exchange_logo=false&page=1`;
      try {
        const body = await fetchJsonWithRetry(url, 12000, 1);
        byId[id] = extractTier1ListingsFromTickers(body?.tickers, tier1Set);
        delete errors[id];
      } catch (error) {
        errors[id] = String(error.message || error);
      }
      await sleep(450);
    }

    const payload = {
      fetched_at: new Date().toISOString(),
      by_id: byId,
      errors
    };
    writeCache(root, 'coingecko', cacheKey, payload);

    return {
      fetched_at: payload.fetched_at,
      by_id: payload.by_id,
      errors: payload.errors,
      from_cache: false,
      error: null,
      incomplete: missingIds.length > maxRequestsPerRun,
      pending_ids: Math.max(missingIds.length - maxRequestsPerRun, 0)
    };
  } catch (error) {
    return {
      fetched_at: null,
      by_id: {},
      errors: {},
      from_cache: false,
      error: String(error.message || error)
    };
  }
}

function runSeedProvider(candidate, providerConfig) {
  return {
    provider: 'seed',
    reliability: providerConfig.reliability,
    fetched_at: new Date().toISOString(),
    fields: {
      mcap_usd: candidate.mcap_usd,
      fdv_usd: candidate.fdv_usd,
      est_liquidity_usd: candidate.est_liquidity_usd,
      tier1_cex_listings: candidate.tier1_cex_listings
    },
    evidence: {
      source_note: candidate.source_notes || 'seed'
    }
  };
}

function runManualOverrideProvider(root, candidate, providerConfig) {
  const overrides = safeReadJson(path.join(root, 'data', 'live-overrides.json'), {});
  const row = overrides[candidate.asset_id];
  if (!row) {
    return null;
  }

  return {
    provider: 'manual_override',
    reliability: providerConfig.reliability,
    fetched_at: row.updated_at || new Date().toISOString(),
    fields: {
      mcap_usd: typeof row.mcap_usd === 'number' ? row.mcap_usd : null,
      fdv_usd: typeof row.fdv_usd === 'number' ? row.fdv_usd : null,
      est_liquidity_usd: typeof row.est_liquidity_usd === 'number' ? row.est_liquidity_usd : null,
      tier1_cex_listings: Array.isArray(row.tier1_cex_listings) ? row.tier1_cex_listings : null
    },
    evidence: {
      source_url: row.source_url || null
    }
  };
}

function runCoinGeckoProvider({ candidate, cgMap, providerConfig, providerContext }) {
  const cgId = cgMap[candidate.asset_id];
  if (!cgId) {
    return null;
  }

  if (providerContext?.coingecko?.error) {
    return {
      provider: 'coingecko',
      reliability: providerConfig.reliability,
      fetched_at: providerContext?.coingecko?.fetched_at || null,
      fields: {},
      error: providerContext.coingecko.error,
      evidence: {
        coingecko_id: cgId
      }
    };
  }

  const row = providerContext?.coingecko?.by_id?.[cgId];
  if (!row) {
    return {
      provider: 'coingecko',
      reliability: providerConfig.reliability,
      fetched_at: providerContext?.coingecko?.fetched_at || null,
      fields: {},
      error: 'coingecko_id_not_found_in_snapshot',
      evidence: {
        coingecko_id: cgId
      }
    };
  }

  const listingsError = providerContext?.coingecko_listings?.errors?.[cgId] || null;
  const listingsValues = providerContext?.coingecko_listings?.by_id?.[cgId];
  const listingsField = Array.isArray(listingsValues) ? listingsValues : null;

  return {
    provider: 'coingecko',
    reliability: providerConfig.reliability,
    fetched_at: providerContext?.coingecko?.fetched_at || null,
    fields: {
      mcap_usd: typeof row.market_cap === 'number' ? row.market_cap : null,
      fdv_usd: typeof row.fully_diluted_valuation === 'number' ? row.fully_diluted_valuation : null,
      est_liquidity_usd: typeof row.total_volume === 'number' ? row.total_volume * 0.15 : null,
      tier1_cex_listings: listingsField
    },
    error: listingsError,
    evidence: {
      source_url: `https://www.coingecko.com/en/coins/${cgId}`,
      coingecko_id: cgId,
      listings_snapshot_fetched_at: providerContext?.coingecko_listings?.fetched_at || null
    }
  };
}

export async function initializeProviderContext({ root, dataProviderConfig, cgMap, tier1List }) {
  const context = {};

  if (dataProviderConfig.providers.coingecko?.enabled) {
    const snapshot = await fetchCoinGeckoMarketsSnapshot({
      root,
      cgMap,
      providerConfig: dataProviderConfig.providers.coingecko
    });

    context.coingecko = snapshot;
    context.coingecko_listings = await fetchCoinGeckoTier1ListingsSnapshot({
      root,
      cgMap,
      providerConfig: dataProviderConfig.providers.coingecko,
      tier1List
    });
  }

  return context;
}

export async function collectProviderObservations({
  root,
  candidate,
  dataProviderConfig,
  cgMap,
  providerContext
}) {
  const providers = [];

  if (dataProviderConfig.providers.seed?.enabled) {
    providers.push(runSeedProvider(candidate, dataProviderConfig.providers.seed));
  }

  if (dataProviderConfig.providers.manual_override?.enabled) {
    const override = runManualOverrideProvider(root, candidate, dataProviderConfig.providers.manual_override);
    if (override) {
      providers.push(override);
    }
  }

  if (dataProviderConfig.providers.coingecko?.enabled) {
    const cg = runCoinGeckoProvider({
      candidate,
      cgMap,
      providerConfig: dataProviderConfig.providers.coingecko,
      providerContext
    });
    if (cg) {
      providers.push(cg);
    }
  }

  return providers;
}
