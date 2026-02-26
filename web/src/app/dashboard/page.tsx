'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import type { DashboardData, ProfileKey, ThresholdOverrides } from '@/lib/report-types';
import { useWalletClient } from '@/lib/wallet-provider';

function toCsv(data: DashboardData) {
  const header = ['rank', 'asset_id', 'name', 'symbol', 'chain', 'status', 'score', 'confidence'];
  const rows = data.topRanked.map((row) => [
    row.rank,
    row.assetId,
    row.name,
    row.symbol,
    row.chain,
    row.status,
    row.score,
    row.confidence,
  ]);
  return [header, ...rows].map((cols) => cols.join(',')).join('\n');
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatFreshness(generatedAt: string, nowMs: number) {
  const ts = new Date(generatedAt).getTime();
  if (!Number.isFinite(ts)) return 'unknown';
  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { connected, address, disconnect, walletAvailable, connecting, error: walletError } = useWalletClient();

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileKey>('balanced');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!connecting && !connected) {
      router.replace('/');
    }
  }, [mounted, connecting, connected, router]);

  const fetchReport = useCallback(async (targetProfile: ProfileKey, refresh = false) => {
    setIsUpdating(true);
    setError('');
    try {
      const query = new URLSearchParams({ profile: targetProfile });
      if (refresh) query.set('refresh', '1');

      const res = await fetch(`/api/report?${query.toString()}`, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Failed to fetch report');
      }
      setData(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown dashboard fetch error');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !connected) return;
    fetchReport(profile, true);
  }, [mounted, connected, profile, fetchReport]);

  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!mounted || !connected || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchReport(profile, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [mounted, connected, autoRefresh, profile, fetchReport]);

  const onProfileChange = (nextProfile: ProfileKey) => {
    setProfile(nextProfile);
  };

  const onRefresh = async () => {
    await fetchReport(profile, true);
  };

  const onApplyParameters = async (thresholds: ThresholdOverrides) => {
    setIsUpdating(true);
    setError('');
    try {
      const res = await fetch('/api/recompute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, thresholds }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Failed to recompute');
      }
      setData(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown recompute error');
    } finally {
      setIsUpdating(false);
    }
  };

  const onDisconnect = async () => {
    await disconnect();
    router.replace('/');
  };

  const onExportJson = () => {
    if (!data) return;
    download(`qualification-${profile}.json`, JSON.stringify(data, null, 2), 'application/json');
  };

  const onExportCsv = () => {
    if (!data) return;
    download(`qualification-${profile}.csv`, toCsv(data), 'text/csv;charset=utf-8');
  };

  const freshnessLabel = useMemo(() => {
    if (!data?.generatedAt) return 'unknown';
    return formatFreshness(data.generatedAt, nowTick);
  }, [data?.generatedAt, nowTick]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#Fdfdfc] text-neutral-500">
        Loading dashboard...
      </div>
    );
  }

  if (!walletAvailable) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#Fdfdfc] text-neutral-600">
        <p>No Solana wallet detected. Install Phantom or Solflare and reload.</p>
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#Fdfdfc] text-neutral-600">
        <p>{walletError}</p>
        <button className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm" onClick={() => router.replace('/')}>
          Go Back
        </button>
      </div>
    );
  }

  if (!connected || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#Fdfdfc] text-neutral-600">
        <p>{error || 'Loading dashboard...'}</p>
        <button
          className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm"
          onClick={() => fetchReport(profile, true)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DashboardShell
      data={data}
      profile={profile}
      walletAddress={address}
      onDisconnect={onDisconnect}
      onProfileChange={onProfileChange}
      onRefresh={onRefresh}
      onApplyParameters={onApplyParameters}
      onExportJson={onExportJson}
      onExportCsv={onExportCsv}
      isUpdating={isUpdating}
      error={error}
      autoRefresh={autoRefresh}
      onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
      freshnessLabel={freshnessLabel}
    />
  );
}
