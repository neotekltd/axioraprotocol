import { SectionEyebrow, SectionTitle, Stat, Card } from '@/components/ui';
import { getProtocolStats } from '@/lib/queries';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Statistics' };

export default async function StatisticsPage() {
  const stats = await getProtocolStats();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20">
      <SectionEyebrow>PROTOCOL TERMINAL</SectionEyebrow>
      <SectionTitle>Statistics</SectionTitle>
      {!stats ? (
        <>
          <p className="mt-3 max-w-2xl text-sm text-fog">
            Audited protocol statistics will be published here once the operator releases the first
            verified snapshot. No estimates or placeholder figures are shown in the meantime.
          </p>
          <Card className="mt-8 p-8 text-center sm:p-12">
            <div className="font-bold">Statistics pending first audit</div>
            <p className="mx-auto mt-1 max-w-md text-sm text-fog">Protocol capital, verified trades, total P&amp;L, win rate and active positions appear here when published.</p>
          </Card>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-sm text-fog">Operator-published snapshot · updated {stats.updatedAt.slice(0, 10)}. Past results do not predict future performance.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="PROTOCOL CAPITAL" value={formatUSD(stats.capital, { decimals: 0 })} />
            <Stat label="VERIFIED TRADES" value={stats.verifiedTrades.toLocaleString('en-US')} />
            <Stat label="TOTAL P&L" value={formatUSD(stats.totalPnl, { sign: true, decimals: 0 })} />
            <Stat label="WIN RATE" value={`${stats.winRate.toFixed(2)}%`} />
            <Stat label="ACTIVE POSITIONS" value={String(stats.activePositions)} />
            <Stat label="CURRENT VALUE" value={formatUSD(stats.currentValue, { decimals: 0 })} />
          </div>
        </>
      )}
    </div>
  );
}
