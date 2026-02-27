import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ProviderFailure = {
  provider: 'openai' | 'gemini';
  kind: 'timeout' | 'http' | 'network';
  status?: number;
  details?: string;
};

type GeminiResponsePart = { text?: string };
type GeminiResponseCandidate = { content?: { parts?: GeminiResponsePart[] } };
type GeminiResponse = { candidates?: GeminiResponseCandidate[] };

const MAX_CONTEXT_CHARS = 16000;
const MAX_MESSAGE_CHARS = 2000;
const OPENAI_RETRIES = 2;
const GEMINI_RETRIES = 2;

function loadEnvFromRoot(key: string): string {
  const envPath = path.resolve(process.cwd(), '..', '.env');
  if (!fs.existsSync(envPath)) return '';

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (k === key) return v.replace(/^['"]|['"]$/g, '');
  }
  return '';
}

function getEnv(name: string, fallback = '') {
  return process.env[name] || loadEnvFromRoot(name) || fallback;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function extractGeminiReply(parsed: unknown) {
  const first = (parsed as GeminiResponse)?.candidates?.[0];
  const parts = Array.isArray(first?.content?.parts) ? first.content.parts : [];
  const text = parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
  return text || 'No response.';
}

function extractOpenAiReply(parsed: unknown) {
  const firstChoice = (parsed as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0];
  const content = firstChoice?.message?.content;
  if (typeof content === 'string' && content.trim().length > 0) {
    return content.trim();
  }
  if (Array.isArray(content)) {
    const text = content
      .map((item) => {
        const maybeText = (item as { text?: string })?.text;
        return typeof maybeText === 'string' ? maybeText : '';
      })
      .join('\n')
      .trim();
    if (text.length > 0) return text;
  }
  return 'No response.';
}

async function requestOpenAi({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ ok: true; reply: string; model: string } | { ok: false; failure: ProviderFailure }> {
  let lastFailure: ProviderFailure = { provider: 'openai', kind: 'network', details: 'unknown_error' };

  for (let attempt = 1; attempt <= OPENAI_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutMs = attempt === 1 ? 12000 : 20000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 420,
          messages: [
            {
              role: 'system',
              content:
                'You are an assistant inside Sunrise Migration Qualification OS dashboard. Be concise, practical, and use provided context only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      const raw = await response.text();
      if (response.ok) {
        const parsed = safeJsonParse(raw);
        return { ok: true, reply: extractOpenAiReply(parsed), model };
      }

      lastFailure = {
        provider: 'openai',
        kind: 'http',
        status: response.status,
        details: raw.slice(0, 700),
      };
      if (attempt < OPENAI_RETRIES && [429, 500, 502, 503, 504].includes(response.status)) {
        await wait(600 * attempt);
        continue;
      }
      return { ok: false, failure: lastFailure };
    } catch (error) {
      const isAbort = error instanceof Error && error.name === 'AbortError';
      lastFailure = {
        provider: 'openai',
        kind: isAbort ? 'timeout' : 'network',
        details: String(error),
      };
      if (attempt < OPENAI_RETRIES) {
        await wait(600 * attempt);
        continue;
      }
      return { ok: false, failure: lastFailure };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, failure: lastFailure };
}

async function requestGemini({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ ok: true; reply: string; model: string } | { ok: false; failure: ProviderFailure }> {
  let lastFailure: ProviderFailure = { provider: 'gemini', kind: 'network', details: 'unknown_error' };

  for (let attempt = 1; attempt <= GEMINI_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutMs = attempt === 1 ? 20000 : 32000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 420,
          },
        }),
      });

      const raw = await response.text();
      if (response.ok) {
        const parsed = safeJsonParse(raw);
        return { ok: true, reply: extractGeminiReply(parsed), model };
      }

      lastFailure = {
        provider: 'gemini',
        kind: 'http',
        status: response.status,
        details: raw.slice(0, 700),
      };
      if (attempt < GEMINI_RETRIES && [429, 500, 502, 503, 504].includes(response.status)) {
        await wait(700 * attempt);
        continue;
      }
      return { ok: false, failure: lastFailure };
    } catch (error) {
      const isAbort = error instanceof Error && error.name === 'AbortError';
      lastFailure = {
        provider: 'gemini',
        kind: isAbort ? 'timeout' : 'network',
        details: String(error),
      };
      if (attempt < GEMINI_RETRIES) {
        await wait(700 * attempt);
        continue;
      }
      return { ok: false, failure: lastFailure };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, failure: lastFailure };
}

function buildDeterministicReply({
  messages,
  context,
  reason,
}: {
  messages: ChatMessage[];
  context: Record<string, unknown>;
  reason: string;
}) {
  const meta = (context?.meta || {}) as {
    eligible_count?: number;
    borderline_count?: number;
    rejected_count?: number;
    total_candidates?: number;
  };
  const profile = typeof context?.profile === 'string' ? context.profile : 'balanced';
  const top = Array.isArray(context?.topRanked)
    ? context.topRanked
        .slice(0, 3)
        .map((row) => String((row as { name?: string })?.name || '').trim())
        .filter(Boolean)
    : [];

  const lastPrompt = messages.filter((m) => m.role === 'user').at(-1)?.content?.trim() || 'your request';
  const eligible = Number.isFinite(meta.eligible_count) ? meta.eligible_count : null;
  const borderline = Number.isFinite(meta.borderline_count) ? meta.borderline_count : null;
  const rejected = Number.isFinite(meta.rejected_count) ? meta.rejected_count : null;
  const total = Number.isFinite(meta.total_candidates) ? meta.total_candidates : null;

  const lines = [];
  lines.push(`Model temporarily unavailable (${reason}). Here is a deterministic dashboard summary for "${lastPrompt}":`);
  if (eligible !== null && rejected !== null && total !== null) {
    lines.push(
      `- Profile ${profile}: ${eligible} eligible, ${borderline ?? 0} borderline, ${rejected} rejected out of ${total} candidates.`,
    );
  }
  if (top.length > 0) {
    lines.push(`- Current top assets: ${top.join(', ')}.`);
  }
  lines.push('- If you want to widen candidates: reduce min liquidity or min tier-1 CEX count in Parameters.');

  return lines.join('\n');
}

function failureReason(failure: ProviderFailure) {
  if (failure.kind === 'http') {
    return `${failure.provider}_http_${failure.status ?? 'error'}`;
  }
  if (failure.kind === 'timeout') {
    return `${failure.provider}_timeout`;
  }
  return `${failure.provider}_network_error`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
          .slice(-10)
          .map((m: unknown) => {
            const role = (m as ChatMessage)?.role === 'assistant' ? 'assistant' : 'user';
            const content = String((m as ChatMessage)?.content || '').slice(0, MAX_MESSAGE_CHARS);
            return { role, content };
          })
          .filter((m: ChatMessage) => m.content.trim().length > 0)
      : [];

    const rawContext = body?.context || {};
    const context = JSON.stringify(rawContext).slice(0, MAX_CONTEXT_CHARS);
    const transcript = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = [
      'Use only this context to answer. Do not invent market values.',
      'If asked for actions, suggest threshold/profile adjustments with brief tradeoffs.',
      `Context: ${context}`,
      `Conversation:\n${transcript}`,
      'Return plain text only.',
    ].join('\n\n');

    const openAiApiKey = getEnv('OPENAI_API_KEY');
    const openAiModel = getEnv('OPENAI_MODEL', 'gpt-4o');
    if (openAiApiKey) {
      const openai = await requestOpenAi({ apiKey: openAiApiKey, model: openAiModel, prompt });
      if (openai.ok) {
        return NextResponse.json({ reply: openai.reply, provider: 'openai', model: openai.model });
      }
      if (openai.failure.kind === 'http' && openai.failure.status && [401, 403].includes(openai.failure.status)) {
        return NextResponse.json(
          {
            error: 'openai_request_failed',
            status: openai.failure.status,
            details: openai.failure.details || 'openai_auth_error',
          },
          { status: 502 },
        );
      }
    }

    const geminiApiKey = getEnv('GEMINI_API_KEY');
    const geminiModel = getEnv('GEMINI_MODEL', 'gemini-3-pro-preview');
    const geminiFallbackModel = getEnv('GEMINI_FALLBACK_MODEL', 'gemini-2.5-flash');
    const geminiModels = Array.from(new Set([geminiModel, geminiFallbackModel].filter(Boolean)));

    let geminiFailure: ProviderFailure | null = null;
    if (geminiApiKey) {
      for (const model of geminiModels) {
        const gemini = await requestGemini({ apiKey: geminiApiKey, model, prompt });
        if (gemini.ok) {
          return NextResponse.json({ reply: gemini.reply, provider: 'gemini', model: gemini.model });
        }
        geminiFailure = gemini.failure;
      }
    }

    const reason = geminiFailure ? failureReason(geminiFailure) : 'no_ai_provider_key';
    return NextResponse.json({
      reply: buildDeterministicReply({ messages, context: rawContext, reason }),
      degraded: true,
      reason,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'ai_chat_exception', details: String(error) },
      { status: 500 },
    );
  }
}
