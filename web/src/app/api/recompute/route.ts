import { NextRequest, NextResponse } from 'next/server';
import {
  isRemoteReportsEnabled,
  normalizeReport,
  readRemoteReport,
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
    let warning = '';
    const remoteMode = isRemoteReportsEnabled();

    if (remoteMode) {
      const remoteReport = await readRemoteReport(profile);
      if (!remoteReport) {
        return NextResponse.json({ error: 'remote_report_unavailable' }, { status: 503 });
      }

      return NextResponse.json(
        {
          profile,
          data: normalizeReport(remoteReport as Parameters<typeof normalizeReport>[0]),
          warning: 'remote_reports_mode: recompute is disabled in serverless and uses latest scheduled snapshot',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      );
    }

    const outDir = 'data/output/runtime';
    const run = runEngine(profile, outDir, overrides);
    if (!run.ok) {
      warning = run.stderr || run.stdout || 'engine_recompute_failed';
    }
    const report = run.ok ? readReport(profile, outDir) : null;
    if (!report) {
      return NextResponse.json({ error: 'runtime_report_missing' }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile,
        data: normalizeReport(report as Parameters<typeof normalizeReport>[0]),
        warning: warning || undefined,
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
