// Statistics tab: the existing operator-published protocol figures,
// restyled into the hub. When nothing is published, the honest empty state
// (never estimates).

import { SectionCard, StatCard } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import type { ProtocolStats } from '@/lib/queries';
import { useT } from '@/components/LanguageProvider';

export function StatsView({ stats }: { stats: ProtocolStats | null }) {
  const t = useT();
  if (!stats) {
    return (
      <section aria-label={t.inv.hStatsT} className="mt-4 rounded-2xl border border-[#202A3A] bg-[#0B0F16] p-8 text-center sm:p-10">
        <div className="mx-auto h-10 w-10 rounded-[12px] border border-[#2A394D] bg-[#151B27]" aria-hidden="true" />
        <h2 className="mt-4 text-[18px] font-bold text-white">{t.inv.statsEmptyT}</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#AAB5C7]">
          {t.inv.statsEmptyB}
        </p>
        <p className="mt-4 text-[12px] text-[#596579]">{t.inv.statsUnaffected}</p>
      </section>
    );
  }
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label={t.inv.capLbl} value={formatUSD(stats.capital, { decimals: 0 })} />
        <StatCard label={t.inv.tradesLbl} value={stats.verifiedTrades.toLocaleString('en-US')} />
        <StatCard label={t.inv.pnlLbl} value={formatUSD(stats.totalPnl, { sign: true, decimals: 0 })} accent={stats.totalPnl >= 0 ? 'up' : 'down'} />
        <StatCard label={t.inv.winLbl} value={`${stats.winRate.toFixed(2)}%`} />
        <StatCard label={t.inv.posLbl} value={String(stats.activePositions)} />
        <StatCard label={t.inv.valLbl} value={formatUSD(stats.currentValue, { decimals: 0 })} />
      </div>
      <SectionCard title={t.inv.aboutFig}>
        <p className="p-5 text-[14px] leading-relaxed text-[#AAB5C7]">
          {t.inv.updatedX.replace('{d}', stats.updatedAt.slice(0, 10))}
        </p>
      </SectionCard>
    </div>
  );
}
