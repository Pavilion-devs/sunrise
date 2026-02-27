import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type GeminiResponsePart = { text?: string };
type GeminiResponseCandidate = { content?: { parts?: GeminiResponsePart[] } };
type GeminiResponse = { candidates?: GeminiResponseCandidate[] };

const MAX_CONTEXT_CHARS = 16000;
const MAX_MESSAGE_CHARS = 2000;
const GEMINI_RETRIES = 2;

type GeminiFailure = {
  kind: 'timeout' | 'http' | 'network';
  status?: number;
  details?: string;
};

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

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || loadEnvFromRoot('GEMINI_API_KEY');
}

function safeJsonParse(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function extractReplyText(parsed: unknown) {
  const first = (parsed as GeminiResponse)?.candidates?.[0];
  const parts = Array.isArray(first?.content?.parts) ? first.content.parts : [];
  const text = parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
  return text || 'No response.';
}

async function requestGemini({
  url,
  apiKey,
  prompt,
}: {
  url: string;
  apiKey: string;
  prompt: string;
}): Promise<{ ok: true; reply: string } | { ok: false; failure: GeminiFailure }> {
  let lastFailure: GeminiFailure = { kind: 'network', details: 'unknown_error' };

  for (let attempt = 1; attempt <= GEMINI_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutMs = attempt === 1 ? 20000 : 35000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
        return { ok: true, reply: extractReplyText(parsed) };
      }

      const details = raw.slice(0, 700);
      lastFailure = { kind: 'http', status: response.status, details };
      if (attempt < GEMINI_RETRIES && [429, 500, 502, 503, 504].includes(response.status)) {
        await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
        continue;
      }
      return { ok: false, failure: lastFailure };
    } catch (error) {
      const isAbort = error instanceof Error && error.name === 'AbortError';
      lastFailure = {
        kind: isAbort ? 'timeout' : 'network',
        details: String(error),
      };
      if (attempt < GEMINI_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
        continue;
      }
      return { ok: false, failure: lastFailure };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, failure: lastFailure };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'missing_gemini_api_key' },
        { status: 500 },
      );
    }

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

    const transcript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = [
      'You are an assistant inside Sunrise Migration Qualification OS dashboard.',
      'Be concise and practical. Use provided data context only. Do not invent market values.',
      'If asked for actions, suggest threshold/profile adjustments and explain tradeoffs briefly.',
      `Context: ${context}`,
      `Conversation:\n${transcript}`,
      'Return plain text only.',
    ].join('\n\n');

    const model = process.env.GEMINI_MODEL || loadEnvFromRoot('GEMINI_MODEL') || 'gemini-3-pro-preview';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const gemini = await requestGemini({ url, apiKey, prompt });
    if (gemini.ok) {
      return NextResponse.json({ reply: gemini.reply });
    }

    if (gemini.failure.kind === 'timeout') {
      return NextResponse.json(
        { error: 'gemini_timeout', details: gemini.failure.details || 'timeout' },
        { status: 504 },
      );
    }
    if (gemini.failure.kind === 'http') {
      return NextResponse.json(
        {
          error: 'gemini_request_failed',
          status: gemini.failure.status,
          details: gemini.failure.details || 'upstream_http_error',
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: 'gemini_network_error', details: gemini.failure.details || 'network_error' },
      { status: 502 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'ai_chat_exception', details: String(error) },
      { status: 500 },
    );
  }
}
