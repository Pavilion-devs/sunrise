import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeReport,
  readReport,
  runEngine,
  sanitizeOverrides,
  sanitizeProfile,
} from '@/lib/server/report-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = sanitizeProfile(body?.profile ?? null);
    const overrides = sanitizeOverrides(body?.thresholds ?? {});

    const outDir = 'data/output/runtime';
    const run = runEngine(profile, outDir, overrides);
    if (!run.ok) {
      return NextResponse.json(
        { error: 'engine_recompute_failed', details: run.stderr || run.stdout || '' },
        { status: 500 },
      );
    }

    const report = readReport(profile, outDir);
    if (!report) {
      return NextResponse.json({ error: 'runtime_report_missing' }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile,
        data: normalizeReport(report),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'recompute_route_exception', details: String(error) },
      { status: 500 },
    );
  }
}
