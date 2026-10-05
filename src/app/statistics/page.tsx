import { SectionEyebrow, SectionTitle, Stat, Card } from '@/components/ui';
import { getProtocolStats } from '@/lib/queries';
import { formatUSD } from '@/lib/finance';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Statistics',
  description: 'Audited Axiora protocol statistics: capital, verified trades, P&L and win rate.',
  alternates: { canonical: '/statistics' },
};

export default async function StatisticsPage() {
  const t = getDict();
  const stats = await getProtocolStats();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-40 pb-20">
      <SectionEyebrow>{t.pub.statsEyebrow}</SectionEyebrow>
      <SectionTitle>{t.pub.statsTitle}</SectionTitle>
      {!stats ? (
        <>
          <p className="mt-3 max-w-2xl text-sm text-fog">
            {t.pub.statsPendingB}
          </p>
          <Card className="mt-8 p-8 text-center sm:p-12">
            <div className="font-bold">{t.pub.statsPendingT}</div>
            <p className="mx-auto mt-1 max-w-md text-sm text-fog">{t.pub.statsPendingB2}</p>
          </Card>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-sm text-fog">{t.pub.statsUpdated.replace('{d}', stats.updatedAt.slice(0, 10))}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label={t.inv.capLbl} value={formatUSD(stats.capital, { decimals: 0 })} />
            <Stat label={t.inv.tradesLbl} value={stats.verifiedTrades.toLocaleString('en-US')} />
            <Stat label={t.inv.pnlLbl} value={formatUSD(stats.totalPnl, { sign: true, decimals: 0 })} />
            <Stat label={t.inv.winLbl} value={`${stats.winRate.toFixed(2)}%`} />
            <Stat label={t.inv.posLbl} value={String(stats.activePositions)} />
            <Stat label={t.inv.valLbl} value={formatUSD(stats.currentValue, { decimals: 0 })} />
          </div>
        </>
      )}
    </div>
  );
}
