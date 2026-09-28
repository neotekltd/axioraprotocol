'use client';

import { useMemo, useState } from 'react';
import { SectionCard, TableWrap, EmptyState } from '@/components/data';
import { Tabs } from '@/components/ui';
import { formatUSD } from '@/lib/finance';
import type { WalletTxn } from '@/lib/queries';

const TYPES = ['All', 'Deposit', 'Withdrawal', 'Deployment', 'Profit', 'Referral', 'Fee'] as const;
const STATUSES = ['All', 'Completed', 'Pending', 'Processing', 'Failed', 'Cancelled'] as const;

export function TransactionsView({ initial }: { initial: WalletTxn[] }) {
  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.filter((t) => {
      if (type !== 'All' && t.type.toLowerCase() !== type.toLowerCase()) return false;
      if (status !== 'All' && t.status.toLowerCase() !== status.toLowerCase()) return false;
      if (q && !(t.id.toLowerCase().includes(q) || (t.txHash ?? '').toLowerCase().includes(q) || (t.address ?? '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [initial, type, status, query]);

  return (
    <div>
      <div className="mt-6 space-y-3">
        <Tabs options={TYPES} value={type} onChange={setType} />
        <div className="flex flex-wrap gap-3">
          <label className="text-xs text-fog">Status
            <select value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])} className="ml-2 rounded-lg border border-line bg-void px-3 py-1.5 text-xs text-white outline-none">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-fog">Search
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ID, hash or address" className="ml-2 rounded-lg border border-line bg-void px-3 py-1.5 text-xs text-white outline-none placeholder:text-fog/60" />
          </label>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={initial.length === 0 ? 'No transactions yet' : 'No matches'}
            body={initial.length === 0 ? 'Deposits, withdrawals, deployments, profit, referral rewards and fees will be listed here once recorded.' : 'Try a different filter or search term.'}
          />
        </div>
      ) : (
        <>
          <SectionCard title={`${rows.length} transaction${rows.length === 1 ? '' : 's'}`}>
            <TableWrap>
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">DATE</th><th className="p-4">TYPE</th><th className="p-4 text-right">AMOUNT</th><th className="p-4">ASSET</th><th className="p-4 text-right">STATUS</th><th className="p-4 text-right">HASH / ADDRESS</th></tr></thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-t border-line">
                      <td className="p-4 text-fog">{t.createdAt.slice(0, 10)}</td>
                      <td className="p-4 capitalize">{t.type}</td>
                      <td className="p-4 text-right font-mono">{formatUSD(t.amount)}</td>
                      <td className="p-4">{t.asset}</td>
                      <td className="p-4 text-right text-fog">{t.status}</td>
                      <td className="max-w-[180px] truncate p-4 text-right font-mono text-xs text-fog">{t.txHash ? `${t.txHash.slice(0, 12)}…` : t.address ? `${t.address.slice(0, 12)}…` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </SectionCard>
          {/* Mobile cards */}
          <div className="mt-4 space-y-3 md:hidden">
            {rows.map((t) => (
              <div key={t.id} className="glass rounded-2xl p-4 text-sm">
                <div className="flex justify-between"><span className="font-semibold capitalize">{t.type}</span><span className="font-mono">{formatUSD(t.amount)} {t.asset}</span></div>
                <div className="mt-1 flex justify-between text-xs text-fog"><span>{t.createdAt.slice(0, 10)}</span><span>{t.status}</span></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
