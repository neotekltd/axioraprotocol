'use client';

import { useMemo, useState } from 'react';
import { SectionCard, TableWrap, EmptyState, StatusBadge } from '@/components/data';
import { Tabs } from '@/components/ui';
import { formatUSD } from '@/lib/finance';
import type { Trade } from '@/lib/queries';

export function TradesView({ initial }: { initial: Trade[] }) {
  const [tab, setTab] = useState<'Active' | 'History'>('Active');
  const open = useMemo(() => initial.filter((t) => t.status === 'open'), [initial]);
  const closed = useMemo(() => initial.filter((t) => t.status === 'closed'), [initial]);
  const rows = tab === 'Active' ? open : closed;

  return (
    <div>
      <div className="mt-6"><Tabs options={['Active', 'History'] as const} value={tab} onChange={setTab} /></div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={initial.length === 0 ? 'No trading activity' : tab === 'Active' ? 'No open positions' : 'No closed trades'}
            body={initial.length === 0 ? 'Trades are executed by protocol deployments. Activate a deployment and its trades will appear here with live P&L.' : tab === 'Active' ? 'All positions are currently closed.' : 'Closed trades will be listed here with entry, exit and result.'}
            actionLabel={initial.length === 0 ? 'Explore deployments' : undefined}
            actionHref={initial.length === 0 ? '/app/deploy' : undefined}
          />
        </div>
      ) : (
        <SectionCard title={tab === 'Active' ? `${rows.length} open position${rows.length === 1 ? '' : 's'}` : `${rows.length} closed trade${rows.length === 1 ? '' : 's'}`}>
          <TableWrap>
            <table className="w-full min-w-[680px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">PAIR</th><th className="p-4">SIDE</th><th className="p-4 text-right">ENTRY</th><th className="p-4 text-right">EXIT</th><th className="p-4 text-right">SIZE</th><th className="p-4 text-right">P&L</th><th className="p-4 text-right">STATUS</th></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-line font-mono">
                    <td className="p-4">{t.pair}</td>
                    <td className={`p-4 ${t.side === 'LONG' ? 'text-pulse' : 'text-danger'}`}>{t.side}</td>
                    <td className="p-4 text-right">{t.entry}</td>
                    <td className="p-4 text-right">{t.exit ?? '—'}</td>
                    <td className="p-4 text-right">{t.size}</td>
                    <td className={`p-4 text-right ${t.pnl >= 0 ? 'text-pulse' : 'text-danger'}`}>{formatUSD(t.pnl, { sign: true })}</td>
                    <td className="p-4 text-right"><StatusBadge status={t.status} /></td>
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
