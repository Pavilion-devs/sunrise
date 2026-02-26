import { NextRequest, NextResponse } from 'next/server';
import { normalizeReport, readReport, resolveProfileOutDir, runEngine, sanitizeProfile } from '@/lib/server/report-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const profile = sanitizeProfile(request.nextUrl.searchParams.get('profile'));
    const refresh = request.nextUrl.searchParams.get('refresh') === '1';
    let warning = '';

    if (refresh) {
      const run = runEngine(profile, resolveProfileOutDir(profile));
      if (!run.ok) {
        warning = run.stderr || run.stdout || 'engine_refresh_failed';
      }
    }

    let report = readReport(profile);
    if (!report) {
      const run = runEngine(profile, resolveProfileOutDir(profile));
      if (!run.ok) {
        warning = warning || run.stderr || run.stdout || 'engine_bootstrap_failed';
      }
      report = readReport(profile);
    }

    if (!report) {
      return NextResponse.json({ error: 'report_not_found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile,
        data: normalizeReport(report),
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
      { error: 'report_route_exception', details: String(error) },
      { status: 500 },
    );
  }
}
