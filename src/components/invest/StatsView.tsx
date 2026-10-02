// Statistics tab: the existing operator-published protocol figures,
// restyled into the hub. When nothing is published, the honest empty state
// (never estimates).

import { SectionCard, StatCard } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import type { ProtocolStats } from '@/lib/queries';

export function StatsView({ stats }: { stats: ProtocolStats | null }) {
  if (!stats) {
    return (
      <section aria-label="Statistics unavailable" className="mt-4 rounded-2xl border border-[#202A3A] bg-[#0B0F16] p-8 text-center sm:p-10">
        <div className="mx-auto h-10 w-10 rounded-[12px] border border-[#2A394D] bg-[#151B27]" aria-hidden="true" />
        <h2 className="mt-4 text-[18px] font-bold text-white">Protocol statistics not published yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#AAB5C7]">
          Audited protocol figures (capital, verified trades, total P&amp;L, win rate) will appear here once
          the operator publishes the first audited snapshot. No estimates are shown in the meantime.
        </p>
        <p className="mt-4 text-[12px] text-[#596579]">Your personal balances on the dashboard are unaffected.</p>
      </section>
    );
  }
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="PROTOCOL CAPITAL" value={formatUSD(stats.capital, { decimals: 0 })} />
        <StatCard label="VERIFIED TRADES" value={stats.verifiedTrades.toLocaleString('en-US')} />
        <StatCard label="TOTAL P&L" value={formatUSD(stats.totalPnl, { sign: true, decimals: 0 })} accent={stats.totalPnl >= 0 ? 'up' : 'down'} />
        <StatCard label="WIN RATE" value={`${stats.winRate.toFixed(2)}%`} />
        <StatCard label="ACTIVE POSITIONS" value={String(stats.activePositions)} />
        <StatCard label="CURRENT VALUE" value={formatUSD(stats.currentValue, { decimals: 0 })} />
      </div>
      <SectionCard title="About these figures">
        <p className="p-5 text-[14px] leading-relaxed text-[#AAB5C7]">
          Updated {stats.updatedAt.slice(0, 10)}. Protocol statistics are operator-published and audited
          separately from individual account ledgers. Past results do not predict future performance.
        </p>
      </SectionCard>
    </div>
  );
}
