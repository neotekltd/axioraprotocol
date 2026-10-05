import { PageHeader, StatCard, SectionCard, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getProtocolStats } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Protocol Stats' };

export default async function ProtocolStatsPage() {
  const t = getDict();
  const stats = await getProtocolStats();

  return (
    <div>
      <PageHeader
        title={t.rail.protocolStats}
        sub={t.rail.protocolStatsSub}
      />
      {!stats ? (
        <div className="mt-6">
          <EmptyState
            title={t.inv.statsEmptyT}
            body={t.inv.statsEmptyB}
          />
          <p className="mt-4 text-xs text-fog">{t.inv.statsUnaffected}</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label={t.inv.capLbl} value={formatUSD(stats.capital, { decimals: 0 })} />
            <StatCard label={t.inv.tradesLbl} value={stats.verifiedTrades.toLocaleString('en-US')} />
            <StatCard label={t.inv.pnlLbl} value={formatUSD(stats.totalPnl, { sign: true, decimals: 0 })} accent={stats.totalPnl >= 0 ? 'up' : 'down'} />
            <StatCard label={t.inv.winLbl} value={`${stats.winRate.toFixed(2)}%`} />
            <StatCard label={t.inv.posLbl} value={String(stats.activePositions)} />
            <StatCard label={t.inv.valLbl} value={formatUSD(stats.currentValue, { decimals: 0 })} />
          </div>
          <SectionCard title={t.inv.aboutFig}>
            <p className="p-5 text-sm text-fog">
              {t.inv.updatedX.replace('{d}', stats.updatedAt.slice(0, 10))}
            </p>
          </SectionCard>
        </>
      )}
    </div>
  );
}
