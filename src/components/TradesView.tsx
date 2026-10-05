'use client';

import { useMemo, useState } from 'react';
import { SectionCard, TableWrap, EmptyState, StatusBadge } from '@/components/data';
import { Tabs } from '@/components/ui';
import { formatUSD } from '@/lib/finance';
import type { Trade } from '@/lib/queries';
import { useT } from '@/components/LanguageProvider';
import { stWord } from '@/lib/i18n-dict';

export function TradesView({ initial }: { initial: Trade[] }) {
  const t = useT();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const open = useMemo(() => initial.filter((r) => r.status === 'open'), [initial]);
  const closed = useMemo(() => initial.filter((r) => r.status === 'closed'), [initial]);
  const rows = tab === 'active' ? open : closed;
  const tabLabels = [t.trd.tabActive, t.trd.tabHistory];
  const tabLabel = tab === 'active' ? t.trd.tabActive : t.trd.tabHistory;

  return (
    <div>
      <div className="mt-6"><Tabs options={tabLabels} value={tabLabel} onChange={(lbl) => setTab(lbl === t.trd.tabHistory ? 'history' : 'active')} /></div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={initial.length === 0 ? t.trd.noTrades : tab === 'active' ? t.trd.noOpen : t.trd.noClosed}
            body={initial.length === 0 ? t.trd.tradesB : tab === 'active' ? t.trd.allClosed : t.trd.closedB}
            actionLabel={initial.length === 0 ? t.trd.exploreDep : undefined}
            actionHref={initial.length === 0 ? '/app/deploy' : undefined}
          />
        </div>
      ) : (
        <SectionCard title={tab === 'active' ? (rows.length === 1 ? t.trd.openPos1.replace('{n}', '1') : t.trd.openPos.replace('{n}', String(rows.length))) : (rows.length === 1 ? t.trd.closedT1.replace('{n}', '1') : t.trd.closedT.replace('{n}', String(rows.length)))}>
          <TableWrap>
            <table className="w-full min-w-[680px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">{t.trd.cPair}</th><th className="p-4">{t.trd.cSide}</th><th className="p-4 text-right">{t.trd.cEntry}</th><th className="p-4 text-right">{t.trd.cExit}</th><th className="p-4 text-right">{t.trd.cSize}</th><th className="p-4 text-right">{t.trd.cPnl}</th><th className="p-4 text-right">{t.tx.cStatus}</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line font-mono">
                    <td className="p-4">{r.pair}</td>
                    <td className={`p-4 ${r.side === 'LONG' ? 'text-pulse' : 'text-danger'}`}>{r.side}</td>
                    <td className="p-4 text-right">{r.entry}</td>
                    <td className="p-4 text-right">{r.exit ?? '—'}</td>
                    <td className="p-4 text-right">{r.size}</td>
                    <td className={`p-4 text-right ${r.pnl >= 0 ? 'text-pulse' : 'text-danger'}`}>{formatUSD(r.pnl, { sign: true })}</td>
                    <td className="p-4 text-right"><StatusBadge status={r.status} label={stWord(t, r.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}
    </div>
  );
}
