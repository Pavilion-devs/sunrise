import { useMemo, useState } from "react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "ranked", label: "Ranked Assets" },
  { id: "rejected", label: "Rejection Log" },
  { id: "parameters", label: "Parameters" },
];

function GlassCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/45 bg-white/45 p-4 backdrop-blur-md shadow-sm">
      <h3 className="text-sm font-semibold text-sunrise-heading mb-3">{title}</h3>
      {children}
    </section>
  );
}

function SummaryCards({ meta }) {
  const cards = [
    { label: "Eligible", value: meta.eligible_count },
    { label: "Borderline", value: meta.borderline_count },
    { label: "Rejected", value: meta.rejected_count },
    { label: "Candidates", value: meta.total_candidates },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-white/45 bg-white/50 p-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wide text-sunrise-link">{card.label}</p>
          <p className="text-2xl font-bold text-sunrise-heading mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function RankedTable({ rows }) {
  return (
    <div className="overflow-auto rounded-xl border border-white/45 bg-white/45">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/60 text-sunrise-link">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Asset</th>
            <th className="px-3 py-2">Chain</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Confidence</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.assetId} className="border-t border-white/40 text-sunrise-page-text">
              <td className="px-3 py-2">{row.rank}</td>
              <td className="px-3 py-2 font-medium">{row.name} ({row.symbol})</td>
              <td className="px-3 py-2">{row.chain}</td>
              <td className="px-3 py-2">{row.score}</td>
              <td className="px-3 py-2">{row.confidence}%</td>
              <td className="px-3 py-2 capitalize">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RejectionList({ rows }) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.assetId} className="rounded-xl border border-white/40 bg-white/45 p-3">
          <p className="font-semibold text-sunrise-heading">{row.name} ({row.symbol})</p>
          <p className="text-xs text-sunrise-link">{row.chain}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {row.reasons.map((reason) => (
              <span key={reason} className="rounded-full bg-rose-100/70 text-rose-900 px-2 py-1 text-xs">
                {reason}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ParametersPanel({ params, onParamChange, onExchangeToggle, onReset }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <GlassCard title="Threshold Controls">
        <div className="grid gap-2">
          <label className="text-xs text-sunrise-link">Min MCAP (USD)</label>
          <input className="rounded-lg border border-white/60 bg-white/70 p-2" type="number" value={params.min_mcap_usd} onChange={(e) => onParamChange("min_mcap_usd", Number(e.target.value))} />
          <label className="text-xs text-sunrise-link">Min FDV (USD)</label>
          <input className="rounded-lg border border-white/60 bg-white/70 p-2" type="number" value={params.min_fdv_usd} onChange={(e) => onParamChange("min_fdv_usd", Number(e.target.value))} />
          <label className="text-xs text-sunrise-link">Min Liquidity (USD)</label>
          <input className="rounded-lg border border-white/60 bg-white/70 p-2" type="number" value={params.min_est_liquidity_usd} onChange={(e) => onParamChange("min_est_liquidity_usd", Number(e.target.value))} />
          <label className="text-xs text-sunrise-link">Min Tier-1 CEX Count</label>
          <input className="rounded-lg border border-white/60 bg-white/70 p-2" type="number" min="1" value={params.min_tier1_cex_count} onChange={(e) => onParamChange("min_tier1_cex_count", Number(e.target.value))} />
        </div>
      </GlassCard>

      <GlassCard title="Tier-1 Exchange Filter">
        <div className="grid gap-2">
          {params.tier1_cex.map((cex) => (
            <label key={cex.name} className="flex items-center justify-between rounded-lg border border-white/55 bg-white/60 p-2 text-sm">
              <span>{cex.name}</span>
              <input type="checkbox" checked={cex.enabled} onChange={() => onExchangeToggle(cex.name)} />
            </label>
          ))}
          <button type="button" onClick={onReset} className="mt-2 rounded-full bg-sunrise-btn text-white px-4 py-2 text-sm hover:opacity-90">
            Reset Defaults
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

export default function Dashboard({ data, walletAddress }) {
  const [activeSection, setActiveSection] = useState("overview");

  const defaults = useMemo(() => ({
    min_mcap_usd: data.thresholds.min_mcap_usd,
    min_fdv_usd: data.thresholds.min_fdv_usd,
    min_est_liquidity_usd: data.thresholds.min_est_liquidity_usd,
    min_tier1_cex_count: data.thresholds.min_tier1_cex_count,
    tier1_cex: data.thresholds.tier1_cex.map((name) => ({ name, enabled: true })),
  }), [data.thresholds]);

  const [params, setParams] = useState(defaults);

  const onParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const onExchangeToggle = (name) => {
    setParams((prev) => ({
      ...prev,
      tier1_cex: prev.tier1_cex.map((cex) =>
        cex.name === name ? { ...cex, enabled: !cex.enabled } : cex
      ),
    }));
  };

  const onReset = () => setParams(defaults);

  return (
    <div className="mx-auto max-w-[1360px] px-4 md:px-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
        <aside className="rounded-2xl border border-white/45 bg-white/45 p-4 backdrop-blur-md h-fit">
          <p className="text-xs uppercase tracking-wide text-sunrise-link mb-3">Dashboard</p>
          <div className="grid gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeSection === section.id
                    ? "bg-sunrise-btn text-white"
                    : "bg-white/60 text-sunrise-page-text hover:bg-white/80"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="grid gap-4">
          <div className="rounded-2xl border border-white/45 bg-white/50 p-4 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-sunrise-link">Wallet Connected</p>
              <p className="font-semibold text-sunrise-heading">{walletAddress}</p>
            </div>
            <p className="text-xs text-sunrise-link">Data generated: {new Date(data.generatedAt).toLocaleString()}</p>
          </div>

          {activeSection === "overview" && (
            <>
              <SummaryCards meta={data.meta} />
              <GlassCard title="Top Migration Candidates">
                <RankedTable rows={data.topRanked.slice(0, 6)} />
              </GlassCard>
            </>
          )}

          {activeSection === "ranked" && (
            <GlassCard title="Ranked Assets">
              <RankedTable rows={data.topRanked} />
            </GlassCard>
          )}

          {activeSection === "rejected" && (
            <GlassCard title="Rejected Assets">
              <RejectionList rows={data.rejected} />
            </GlassCard>
          )}

          {activeSection === "parameters" && (
            <ParametersPanel
              params={params}
              onParamChange={onParamChange}
              onExchangeToggle={onExchangeToggle}
              onReset={onReset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
