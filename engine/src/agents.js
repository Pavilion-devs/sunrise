import { loadDotEnv } from './env.js';

function summarizeRisk(entry) {
  const risks = [];
  if (entry.gate_status === 'borderline') {
    risks.push('Borderline gate status; monitor threshold sensitivity.');
  }
  if ((entry.data_provenance?.conflicts || []).length > 0) {
    risks.push('Conflicting provider values detected; verify market inputs.');
  }
  if ((entry.missing_data_flags || []).length > 0) {
    risks.push(`Missing data: ${entry.missing_data_flags.join(', ')}.`);
  }
  if ((entry.confidence_score || 0) < 65) {
    risks.push('Low confidence score; prioritize data refresh.');
  }
  return risks.length > 0 ? risks : ['No material risk flags from rule-based agent.'];
}

function summarizeOpportunity(entry) {
  const opportunities = [];
  if ((entry.score_breakdown?.solana_demand || 0) >= 75) {
    opportunities.push('Strong Solana demand proxy score.');
  }
  if ((entry.score_breakdown?.venue_liquidity || 0) >= 70) {
    opportunities.push('Healthy venue/liquidity profile for launch planning.');
  }
  if ((entry.score_breakdown?.market_strength || 0) >= 70) {
    opportunities.push('Market cap/FDV profile supports migration narrative.');
  }
  return opportunities.length > 0 ? opportunities : ['Opportunity signals are moderate; validate with Sunrise.'];
}

export function runDeterministicAgents(report) {
  const annotations = {};

  for (const entry of report.eligible_ranked || []) {
    annotations[entry.asset_id] = {
      risk_agent: summarizeRisk(entry),
      opportunity_agent: summarizeOpportunity(entry),
      recommendation_agent: [
        'Confirm canonical route with Sunrise and verify launch constraints.',
        'Recheck metrics within 24h of submission for freshness.'
      ]
    };
  }

  return {
    mode: 'deterministic_agents',
    generated_at: new Date().toISOString(),
    annotations
  };
}

async function runGeminiJson(prompt, apiKey, model) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey
    },
    body: JSON.stringify({
      generationConfig: {
        responseMimeType: 'application/json'
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`gemini_http_${response.status}`);
  }

  const body = await response.json();
  const content = body.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(content);
}

export async function runAdvisoryLLMAgent(report) {
  loadDotEnv();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.ENABLE_GEMINI_AGENT !== '1') {
    return {
      mode: 'llm_agent_disabled',
      generated_at: new Date().toISOString(),
      reason: 'Set GEMINI_API_KEY and ENABLE_GEMINI_AGENT=1 to enable.'
    };
  }

  const top = (report.eligible_ranked || []).slice(0, 10).map((row) => ({
    asset_id: row.asset_id,
    name: row.name,
    symbol: row.symbol,
    gate_status: row.gate_status,
    adjusted_readiness_score: row.adjusted_readiness_score,
    confidence_score: row.confidence_score,
    score_breakdown: row.score_breakdown,
    demand_evidence: row.demand_evidence,
    data_provenance: row.data_provenance
  }));

  const prompt = [
    'You are an analyst agent. Produce concise advisory notes for each asset.',
    'Do not invent numeric values. Use only provided fields.',
    'Return JSON with key advisory indexed by asset_id with risk_notes and action_notes arrays.',
    JSON.stringify(top)
  ].join('\n\n');

  try {
    const advisory = await runGeminiJson(prompt, apiKey, process.env.GEMINI_MODEL || 'gemini-3-pro-preview');
    return {
      mode: 'gemini_advisory',
      generated_at: new Date().toISOString(),
      advisory
    };
  } catch (error) {
    return {
      mode: 'gemini_advisory_failed',
      generated_at: new Date().toISOString(),
      error: String(error.message || error)
    };
  }
}
