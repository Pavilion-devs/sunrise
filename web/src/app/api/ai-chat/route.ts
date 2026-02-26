import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_CONTEXT_CHARS = 16000;
const MAX_MESSAGE_CHARS = 2000;

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    try {
      response = await fetch(url, {
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
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    const raw = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { error: 'gemini_request_failed', details: raw.slice(0, 500) },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(raw);
    const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: 'ai_chat_exception', details: String(error) },
      { status: 500 },
    );
  }
}
