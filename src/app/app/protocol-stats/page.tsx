import { PageHeader, StatCard, SectionCard, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getProtocolStats } from '@/lib/queries';

export const metadata = { title: 'Protocol Stats' };

export default async function ProtocolStatsPage() {
  const stats = await getProtocolStats();

  return (
    <div>
      <PageHeader
        title="Protocol Stats"
        sub="Protocol-wide figures, maintained by the protocol operator — separate from your personal balances."
      />
      {!stats ? (
        <div className="mt-6">
          <EmptyState
            title="Protocol statistics not published yet"
            body="Audited protocol figures (capital, verified trades, total P&L, win rate) will appear here once the operator publishes the first audited snapshot. No estimates are shown in the meantime."
          />
          <p className="mt-4 text-xs text-fog">Your personal balances are on the dashboard and portfolio pages and are unaffected.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="PROTOCOL CAPITAL" value={formatUSD(stats.capital, { decimals: 0 })} />
            <StatCard label="VERIFIED TRADES" value={stats.verifiedTrades.toLocaleString('en-US')} />
            <StatCard label="TOTAL P&L" value={formatUSD(stats.totalPnl, { sign: true, decimals: 0 })} accent={stats.totalPnl >= 0 ? 'up' : 'down'} />
            <StatCard label="WIN RATE" value={`${stats.winRate.toFixed(2)}%`} />
            <StatCard label="ACTIVE POSITIONS" value={String(stats.activePositions)} />
            <StatCard label="CURRENT VALUE" value={formatUSD(stats.currentValue, { decimals: 0 })} />
          </div>
          <SectionCard title="About these figures">
            <p className="p-5 text-sm text-fog">
              Updated {stats.updatedAt.slice(0, 10)}. Protocol statistics are operator-published and audited
              separately from individual account ledgers. Past results do not predict future performance.
            </p>
          </SectionCard>
        </>
      )}
    </div>
  );
}
