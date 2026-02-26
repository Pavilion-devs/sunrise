'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldX,
  SlidersHorizontal,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  RefreshCw,
  Download,
  MessageCircle,
  Sparkles,
  Send,
  X,
  Menu,
  Plus,
  Trash2,
} from 'lucide-react';
import type { DashboardData, ProfileKey, ThresholdOverrides } from '@/lib/report-types';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const CHAT_STORAGE_KEY = 'sunrise_ai_chat_sessions_v1';
const ASSISTANT_GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'Hi, I can explain qualification results, suggest threshold settings, and summarize rejected assets.',
};

function createChatSession(index = 1): ChatSession {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `Session ${index}`,
    messages: [ASSISTANT_GREETING],
    updatedAt: Date.now(),
  };
}

function formatSessionTime(value: number) {
  try {
    return `${new Date(value).toISOString().slice(11, 16)} UTC`;
  } catch {
    return '--:-- UTC';
  }
}

const sections = [
  { key: 'Overview', icon: LayoutDashboard },
  { key: 'Ranked Assets', icon: TrendingUp },
  { key: 'Rejection Log', icon: ShieldX },
  { key: 'Parameters', icon: SlidersHorizontal },
] as const;

type SectionKey = (typeof sections)[number]['key'];

const profileOptions: Array<{ value: ProfileKey; label: string }> = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'strict_simon', label: 'Strict Simon' },
  { value: 'growth', label: 'Growth' },
];

export function DashboardShell({
  data,
  profile,
  walletAddress,
  onDisconnect,
  onProfileChange,
  onRefresh,
  onApplyParameters,
  onExportJson,
  onExportCsv,
  isUpdating,
  error,
  autoRefresh,
  onToggleAutoRefresh,
  freshnessLabel,
}: {
  data: DashboardData;
  profile: ProfileKey;
  walletAddress: string;
  onDisconnect: () => void | Promise<void>;
  onProfileChange: (profile: ProfileKey) => void;
  onRefresh: () => void | Promise<void>;
  onApplyParameters: (thresholds: ThresholdOverrides) => void | Promise<void>;
  onExportJson: () => void;
  onExportCsv: () => void;
  isUpdating: boolean;
  error?: string;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  freshnessLabel: string;
}) {
  const [active, setActive] = useState<SectionKey>('Overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [aiOpen, setAiOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState('');

  const defaults = useMemo(
    () => ({
      min_mcap_usd: data.thresholds.min_mcap_usd,
      min_fdv_usd: data.thresholds.min_fdv_usd,
      min_est_liquidity_usd: data.thresholds.min_est_liquidity_usd,
      min_tier1_cex_count: data.thresholds.min_tier1_cex_count,
      tier1: data.thresholds.tier1_cex.map((x) => ({ name: x, enabled: true })),
    }),
    [data.thresholds],
  );

  const [params, setParams] = useState(defaults);
  const walletSessionKey = walletAddress ? walletAddress.toLowerCase() : 'guest';

  useEffect(() => {
    setParams(defaults);
  }, [defaults]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      const store = raw ? (JSON.parse(raw) as Record<string, ChatSession[]>) : {};
      const existing = store[walletSessionKey];
      const normalized = Array.isArray(existing)
        ? existing
            .filter((session) => session && typeof session.id === 'string')
            .map((session, index) => ({
              id: session.id,
              title: session.title || `Session ${index + 1}`,
              messages: Array.isArray(session.messages) && session.messages.length > 0 ? session.messages : [ASSISTANT_GREETING],
              updatedAt: Number.isFinite(session.updatedAt) ? session.updatedAt : Date.now(),
            }))
        : [];

      if (normalized.length) {
        setChatSessions(normalized);
        setActiveSessionId(normalized[0].id);
      } else {
        const next = createChatSession();
        setChatSessions([next]);
        setActiveSessionId(next.id);
      }
    } catch {
      const next = createChatSession();
      setChatSessions([next]);
      setActiveSessionId(next.id);
    }
  }, [walletSessionKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || chatSessions.length === 0) return;
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      const store = raw ? (JSON.parse(raw) as Record<string, ChatSession[]>) : {};
      store[walletSessionKey] = chatSessions;
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // no-op: localStorage can fail in private mode
    }
  }, [walletSessionKey, chatSessions]);

  const activeSession = useMemo(
    () => chatSessions.find((s) => s.id === activeSessionId) ?? chatSessions[0],
    [chatSessions, activeSessionId],
  );

  useEffect(() => {
    if (!activeSession && chatSessions.length > 0) {
      setActiveSessionId(chatSessions[0].id);
    }
  }, [activeSession, chatSessions]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredRanked = useMemo(() => {
    if (!normalizedSearch) return data.topRanked;
    return data.topRanked.filter((row) => {
      const haystack = `${row.name} ${row.symbol} ${row.chain} ${row.status}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [data.topRanked, normalizedSearch]);

  const filteredRejected = useMemo(() => {
    if (!normalizedSearch) return data.rejected;
    return data.rejected.filter((row) => {
      const reasons = row.reasons.join(' ').toLowerCase();
      const haystack = `${row.name} ${row.symbol} ${row.chain} ${reasons}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [data.rejected, normalizedSearch]);

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : '';

  const applyThresholds = () => {
    onApplyParameters({
      min_mcap_usd: params.min_mcap_usd,
      min_fdv_usd: params.min_fdv_usd,
      min_est_liquidity_usd: params.min_est_liquidity_usd,
      min_tier1_cex_count: params.min_tier1_cex_count,
      tier1_cex: params.tier1.filter((x) => x.enabled).map((x) => x.name),
    });
  };

  const startNewChat = () => {
    const next = createChatSession(chatSessions.length + 1);
    setChatSessions((prev) => [next, ...prev]);
    setActiveSessionId(next.id);
    setAiInput('');
  };

  const clearActiveChat = () => {
    if (!activeSession?.id) return;
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              messages: [ASSISTANT_GREETING],
              updatedAt: Date.now(),
            }
          : session,
      ),
    );
  };

  const sendAiMessage = async () => {
    const prompt = aiInput.trim();
    if (!prompt || aiLoading || !activeSession) return;

    const sessionId = activeSession.id;
    const nextUser: ChatMessage = { role: 'user', content: prompt };
    const nextMessages = [...activeSession.messages, nextUser];
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title:
                session.messages.length <= 1
                  ? prompt.slice(0, 36) || session.title
                  : session.title,
              messages: [...session.messages, nextUser],
              updatedAt: Date.now(),
            }
          : session,
      ),
    );
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            profile,
            generatedAt: data.generatedAt,
            meta: data.meta,
            topRanked: data.topRanked.slice(0, 10),
            rejected: data.rejected.slice(0, 10),
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'AI request failed');
      }

      const assistantReply: ChatMessage = {
        role: 'assistant',
        content: body.reply || 'No reply generated.',
      };
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, assistantReply],
                updatedAt: Date.now(),
              }
            : session,
        ),
      );
    } catch (err) {
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    role: 'assistant',
                    content: err instanceof Error ? `AI error: ${err.message}` : 'AI error occurred.',
                  },
                ],
                updatedAt: Date.now(),
              }
            : session,
        ),
      );
    } finally {
      setAiLoading(false);
    }
  };

  const activeMessages = activeSession?.messages ?? [ASSISTANT_GREETING];

  return (
    <div className="flex h-screen overflow-hidden bg-[#Fdfdfc]">
      <aside className="w-64 border-r border-neutral-200 flex flex-col justify-between bg-white shrink-0">
        <div>
          <div className="px-6 py-6 border-b border-neutral-100">
            <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-70 transition-opacity">
              Sunrise.
            </Link>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {sections.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active === key
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {key}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-3 pb-4 space-y-1">
          <div className="px-3 py-3 border-t border-neutral-100 mb-2">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
              Connected
            </div>
            <div className="text-xs font-mono text-neutral-600 font-mono-display">{shortAddr}</div>
          </div>
          <button
            onClick={onDisconnect}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Disconnect
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-neutral-900">{active}</h1>
            <span className="text-xs text-neutral-400 font-medium">
              Migration Qualification OS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:border-neutral-400 transition-colors w-56"
              />
            </div>
            <button className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors">
              <Bell className="w-4 h-4 text-neutral-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
              {walletAddress?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8 px-1 gap-4">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-neutral-400">Profile:</span>
              <select
                value={profile}
                onChange={(e) => onProfileChange(e.target.value as ProfileKey)}
                disabled={isUpdating}
                className="text-sm font-semibold text-neutral-900 border border-neutral-200 rounded-lg px-2 py-1 bg-white"
              >
                {profileOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3 h-3 text-neutral-300" />
              <span className="text-neutral-400">
                Generated{' '}
                {new Date(data.generatedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-neutral-400">• Updated {freshnessLabel}</span>
              <button
                onClick={onToggleAutoRefresh}
                className={`text-[11px] px-2 py-1 rounded-full border ${
                  autoRefresh ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                Auto-refresh {autoRefresh ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                Refresh Live
              </button>
              <button
                onClick={onExportJson}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
              >
                <Download className="w-3.5 h-3.5" /> JSON
              </button>
              <button
                onClick={onExportCsv}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {active === 'Overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-4">
                {([
                  ['Eligible', data.meta.eligible_count, 'bg-emerald-50', 'text-emerald-700', 'border-emerald-100'],
                  ['Borderline', data.meta.borderline_count, 'bg-amber-50', 'text-amber-700', 'border-amber-100'],
                  ['Rejected', data.meta.rejected_count, 'bg-red-50', 'text-red-700', 'border-red-100'],
                  ['Total Candidates', data.meta.total_candidates, 'bg-neutral-50', 'text-neutral-700', 'border-neutral-100'],
                ] as const).map(([label, value, bg, color, border]) => (
                  <div
                    key={label}
                    className={`${bg} border ${border} rounded-2xl p-6 transition-all hover:scale-[1.02] duration-300`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                      {label}
                    </div>
                    <div className={`text-4xl font-semibold tracking-tight ${color}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900">Top Ranked Assets</h3>
                  <button
                    onClick={() => setActive('Ranked Assets')}
                    className="text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3">Chain</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRanked.slice(0, 5).map((row) => (
                      <tr
                        key={row.assetId}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="px-6 py-3.5 text-sm text-neutral-400 font-mono font-mono-display">{row.rank}</td>
                        <td className="px-6 py-3.5 text-sm font-medium text-neutral-900">
                          {row.name} <span className="text-neutral-400">({row.symbol})</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-neutral-500">{row.chain}</td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 font-mono-display">{row.score}</td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredRanked.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-sm text-neutral-400 text-center">
                          No ranked assets match &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {active === 'Ranked Assets' && (
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">All Qualified Assets</h3>
                <p className="text-xs text-neutral-400 mt-1">Ranked by adjusted readiness score</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3">Chain</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Confidence</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRanked.map((row) => (
                      <tr
                        key={row.assetId}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="px-6 py-3.5 text-sm text-neutral-400 font-mono font-mono-display">{row.rank}</td>
                        <td className="px-6 py-3.5 text-sm font-medium text-neutral-900">
                          {row.name} <span className="text-neutral-400">({row.symbol})</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-neutral-500">{row.chain}</td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 font-mono-display">{row.score}</td>
                        <td className="px-6 py-3.5 text-sm text-neutral-500 font-mono-display">{row.confidence}%</td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredRanked.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-sm text-neutral-400 text-center">
                          No ranked assets match &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {active === 'Rejection Log' && (
            <div className="space-y-3">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-neutral-900">Rejected Assets</h3>
                <p className="text-xs text-neutral-400 mt-1">{filteredRejected.length} assets shown</p>
              </div>
              {filteredRejected.map((row) => (
                <div
                  key={row.assetId}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {row.name} <span className="text-neutral-400 font-normal">({row.symbol})</span>
                      </h4>
                      <span className="text-xs text-neutral-400">{row.chain}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      rejected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="px-3 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-100"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {filteredRejected.length === 0 && (
                <div className="px-6 py-8 text-sm text-neutral-400 text-center bg-white border border-neutral-200 rounded-2xl">
                  No rejected assets match &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          )}

          {active === 'Parameters' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-1">Thresholds</h3>
                <p className="text-xs text-neutral-400 mb-6">Minimum requirements for asset qualification</p>

                <div className="space-y-5">
                  {([
                    ['Min MCAP (USD)', 'min_mcap_usd'] as const,
                    ['Min FDV (USD)', 'min_fdv_usd'] as const,
                    ['Min Liquidity (USD)', 'min_est_liquidity_usd'] as const,
                    ['Min Tier-1 Count', 'min_tier1_cex_count'] as const,
                  ]).map(([label, key]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-neutral-500 mb-1.5 block">{label}</label>
                      <input
                        type="number"
                        value={params[key]}
                        onChange={(e) =>
                          setParams((p) => ({ ...p, [key]: Number(e.target.value) }))
                        }
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-400 transition-colors font-mono-display"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-neutral-900 mb-1">Tier-1 Exchanges</h3>
                <p className="text-xs text-neutral-400 mb-6">Toggle exchanges included in qualification</p>

                <div className="space-y-3 flex-1">
                  {params.tier1.map((x) => (
                    <label
                      key={x.name}
                      className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-medium text-neutral-700">{x.name}</span>
                      <div
                        onClick={() =>
                          setParams((p) => ({
                            ...p,
                            tier1: p.tier1.map((t) =>
                              t.name === x.name ? { ...t, enabled: !t.enabled } : t,
                            ),
                          }))
                        }
                        className={`w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer relative ${
                          x.enabled ? 'bg-neutral-900' : 'bg-neutral-200'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            x.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button
                    onClick={() => setParams(defaults)}
                    disabled={isUpdating}
                    className="py-3 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-full hover:bg-neutral-100 transition-colors disabled:opacity-60"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={applyThresholds}
                    disabled={isUpdating}
                    className="py-3 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-60"
                  >
                    {isUpdating ? 'Applying...' : 'Apply Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-neutral-900 text-white shadow-xl hover:bg-neutral-800 transition-colors flex items-center justify-center"
          aria-label="Open AI assistant"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {aiOpen && (
        <div
          className={`fixed right-6 bottom-6 z-50 h-[540px] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex overflow-hidden transition-[width] duration-200 ${
            historyOpen ? 'w-[620px]' : 'w-[380px]'
          }`}
        >
          {historyOpen && (
            <aside className="w-60 border-r border-neutral-200 bg-neutral-50 flex flex-col">
              <div className="px-3 py-3 border-b border-neutral-200 flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">History</p>
                <button
                  onClick={startNewChat}
                  className="w-7 h-7 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center"
                  aria-label="New chat session"
                >
                  <Plus className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                      session.id === activeSession?.id
                        ? 'bg-white border-neutral-300'
                        : 'bg-transparent border-transparent hover:bg-white hover:border-neutral-200'
                    }`}
                  >
                    <p className="text-xs font-medium text-neutral-800 truncate">{session.title}</p>
                    <p className="text-[11px] text-neutral-400">{formatSessionTime(session.updatedAt)}</p>
                  </button>
                ))}
              </div>
            </aside>
          )}

          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="w-7 h-7 rounded-lg hover:bg-neutral-200 flex items-center justify-center"
                  aria-label="Toggle chat history"
                >
                  <Menu className="w-4 h-4 text-neutral-600" />
                </button>
                <MessageCircle className="w-4 h-4 text-neutral-700" />
                <p className="text-sm font-semibold text-neutral-900">AI Assistant</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearActiveChat}
                  className="w-7 h-7 rounded-lg hover:bg-neutral-200 flex items-center justify-center"
                  aria-label="Clear current chat"
                >
                  <Trash2 className="w-4 h-4 text-neutral-600" />
                </button>
                <button onClick={() => setAiOpen(false)} className="p-1 rounded hover:bg-neutral-200" aria-label="Close AI assistant">
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
              {activeMessages.map((message, idx) => (
                <div
                  key={`${activeSession?.id || 'session'}-${message.role}-${idx}`}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'ml-auto bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {aiLoading && (
                <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm bg-neutral-100 text-neutral-800">
                  Thinking...
                </div>
              )}
            </div>

            <div className="p-3 border-t border-neutral-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendAiMessage();
                    }
                  }}
                  placeholder="Ask about rankings, rejects, thresholds..."
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400"
                />
                <button
                  onClick={sendAiMessage}
                  disabled={aiLoading || !aiInput.trim() || !activeSession}
                  className="w-9 h-9 rounded-xl bg-neutral-900 text-white disabled:opacity-40 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
