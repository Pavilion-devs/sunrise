#!/usr/bin/env node

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

async function getJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 200)}`);
  }
  return { res, body };
}

function validateReportPayload(body) {
  const data = asObject(body.data);
  const meta = asObject(data.meta);
  const thresholds = asObject(data.thresholds);
  const topRanked = Array.isArray(data.topRanked) ? data.topRanked : [];

  assert(typeof data.generatedAt === 'string' && data.generatedAt.length > 0, 'missing generatedAt');
  assert(Number.isFinite(new Date(data.generatedAt).getTime()), 'invalid generatedAt timestamp');
  assert(typeof meta.total_candidates === 'number', 'missing meta.total_candidates');
  assert(typeof thresholds.min_mcap_usd === 'number', 'missing thresholds.min_mcap_usd');
  assert(Array.isArray(thresholds.tier1_cex), 'missing thresholds.tier1_cex');
  assert(Array.isArray(data.rejected), 'missing rejected array');
  assert(topRanked.length > 0, 'topRanked is empty');
}

function printStep(label, detail) {
  console.log(`${label}: ${detail}`);
}

async function main() {
  printStep('Target', baseUrl);

  const reportLive = await getJson(`${baseUrl}/api/report?profile=balanced&refresh=1`);
  assert(reportLive.res.ok, `balanced refresh failed (${reportLive.res.status})`);
  validateReportPayload(reportLive.body);
  const cacheControl = reportLive.res.headers.get('cache-control') || '';
  assert(cacheControl.toLowerCase().includes('no-store'), 'report endpoint missing no-store cache header');
  printStep('Report (balanced refresh)', 'ok');

  const reportStrict = await getJson(`${baseUrl}/api/report?profile=strict_simon`);
  assert(reportStrict.res.ok, `strict report failed (${reportStrict.res.status})`);
  validateReportPayload(reportStrict.body);
  printStep('Report (strict)', 'ok');

  const recompute = await getJson(`${baseUrl}/api/recompute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: 'growth',
      thresholds: {
        min_mcap_usd: 25000000,
        min_fdv_usd: 25000000,
        min_est_liquidity_usd: 3000000,
        min_tier1_cex_count: 1,
        tier1_cex: ['Binance', 'Coinbase', 'Bybit'],
      },
    }),
  });
  assert(recompute.res.ok, `recompute failed (${recompute.res.status})`);
  validateReportPayload(recompute.body);
  printStep('Recompute', 'ok');

  const ai = await getJson(`${baseUrl}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Summarize current qualification status in 2 bullets.' }],
      context: {
        generatedAt: reportLive.body?.data?.generatedAt,
        meta: reportLive.body?.data?.meta,
      },
    }),
  });

  if (ai.res.ok) {
    assert(typeof ai.body.reply === 'string' && ai.body.reply.length > 0, 'ai reply missing');
    printStep('AI chat', 'ok');
  } else {
    const aiError = String(ai.body.error || '');
    assert(
      aiError === 'missing_gemini_api_key' || aiError === 'gemini_request_failed',
      `unexpected ai error: ${aiError} (${ai.res.status})`,
    );
    printStep('AI chat', `warning (${aiError})`);
  }

  const generatedAt = new Date(reportLive.body.data.generatedAt).getTime();
  const ageSeconds = Math.max(0, Math.floor((Date.now() - generatedAt) / 1000));
  assert(ageSeconds < 180, `balanced refresh too old (${ageSeconds}s)`);
  printStep('Freshness', `${ageSeconds}s`);

  printStep('Smoke Result', 'PASS');
}

main().catch((error) => {
  console.error(`Smoke Result: FAIL - ${error.message}`);
  process.exit(1);
});
