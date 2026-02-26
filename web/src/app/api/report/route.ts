import { NextRequest, NextResponse } from 'next/server';
import {
  isRemoteReportsEnabled,
  normalizeReport,
  readRemoteReport,
  readReport,
  resolveProfileOutDir,
  runEngine,
  sanitizeProfile,
} from '@/lib/server/report-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const profile = sanitizeProfile(request.nextUrl.searchParams.get('profile'));
    const refresh = request.nextUrl.searchParams.get('refresh') === '1';
    let warning = '';
    const remoteMode = isRemoteReportsEnabled();
    let report = await readRemoteReport(profile);

    if (refresh && !remoteMode) {
      const run = runEngine(profile, resolveProfileOutDir(profile));
      if (!run.ok) {
        warning = run.stderr || run.stdout || 'engine_refresh_failed';
      }
      report = readReport(profile);
    } else if (refresh && remoteMode) {
      warning = 'remote_reports_mode: refresh is driven by scheduled pipeline';
    }

    if (!report) {
      if (!remoteMode) {
        const run = runEngine(profile, resolveProfileOutDir(profile));
        if (!run.ok) {
          warning = warning || run.stderr || run.stdout || 'engine_bootstrap_failed';
        }
      }
      report = readReport(profile);
    }

    if (!report) {
      return NextResponse.json({ error: 'report_not_found' }, { status: 404 });
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
      { error: 'report_route_exception', details: String(error) },
      { status: 500 },
    );
  }
}
