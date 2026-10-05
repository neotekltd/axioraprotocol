'use client';

import { useMemo, useState } from 'react';
import { SectionCard, TableWrap, EmptyState } from '@/components/data';
import { Tabs } from '@/components/ui';
import { formatUSD } from '@/lib/finance';
import type { WalletTxn } from '@/lib/queries';
import { useT } from '@/components/LanguageProvider';
import { stWord } from '@/lib/i18n-dict';

const TYPE_IDS = ['All', 'Deposit', 'Withdrawal', 'Deployment', 'Profit', 'Referral', 'Fee'] as const;
const STATUS_IDS = ['All', 'Completed', 'Pending', 'Processing', 'Failed', 'Cancelled'] as const;

export function TransactionsView({ initial }: { initial: WalletTxn[] }) {
  const t = useT();
  const TYPE_OPTS = TYPE_IDS.map((id) => ({
    id,
    label: id === 'All' ? t.common.all : id === 'Deposit' ? t.support.catDeposit : id === 'Withdrawal' ? t.support.catWithdrawal : id === 'Deployment' ? t.tx.tyDeployment : id === 'Profit' ? t.tx.tyProfit : id === 'Referral' ? t.tx.tyReferral : t.tx.tyFee,
  }));
  const STATUS_OPTS = STATUS_IDS.map((id) => ({ id, label: id === 'All' ? t.common.all : stWord(t, id) }));
  const labelOf = (opts: { id: string; label: string }[], id: string) => opts.find((o) => o.id === id)?.label ?? id;
  const idOf = (opts: { id: string; label: string }[], label: string) => opts.find((o) => o.label === label)?.id ?? 'All';
  const [type, setType] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

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
        <Tabs options={TYPE_OPTS.map((o) => o.label)} value={labelOf(TYPE_OPTS, type)} onChange={(lbl) => setType(idOf(TYPE_OPTS, lbl))} />
        <div className="flex flex-wrap gap-3">
          <label className="text-xs text-fog">{t.tx.statusF}
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="ml-2 rounded-lg border border-line bg-void px-3 py-1.5 text-xs text-white outline-none">
              {STATUS_OPTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-fog">{t.tx.searchF}
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.tx.searchPh} dir="ltr" className="ml-2 rounded-lg border border-line bg-void px-3 py-1.5 text-xs text-white outline-none placeholder:text-fog/60" />
          </label>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={initial.length === 0 ? t.tx.noTx : t.tx.noMatch}
            body={initial.length === 0 ? t.tx.noTxB : t.tx.tryOther}
          />
        </div>
      ) : (
        <>
          <SectionCard title={rows.length === 1 ? t.tx.txn1.replace('{n}', '1') : t.tx.txnsN.replace('{n}', String(rows.length))}>
            <TableWrap>
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">{t.tx.cDate}</th><th className="p-4">{t.tx.cType}</th><th className="p-4 text-right">{t.tx.cAmount}</th><th className="p-4">{t.tx.cAsset}</th><th className="p-4 text-right">{t.tx.cStatus}</th><th className="p-4 text-right">{t.tx.cHash}</th></tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-line">
                      <td className="p-4 text-fog">{row.createdAt.slice(0, 10)}</td>
                      <td className="p-4 capitalize">{TYPE_OPTS.find((o) => o.id.toLowerCase() === row.type.toLowerCase())?.label ?? row.type}</td>
                      <td className="p-4 text-right font-mono">{formatUSD(row.amount)}</td>
                      <td className="p-4">{row.asset}</td>
                      <td className="p-4 text-right text-fog">{stWord(t, row.status)}</td>
                      <td dir="ltr" className="max-w-[180px] truncate p-4 text-right font-mono text-xs text-fog">{row.txHash ? `${row.txHash.slice(0, 12)}…` : row.address ? `${row.address.slice(0, 12)}…` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </SectionCard>
          {/* Mobile cards (tap to expand details) */}
          <div className="mt-4 space-y-3 md:hidden">
            {rows.map((row) => {
              const open = expanded === row.id;
              return (
                <button
                  key={row.id}
                  onClick={() => setExpanded(open ? null : row.id)}
                  aria-expanded={open}
                  className={`block w-full rounded-[20px] border bg-[#0D111A] p-4 text-left text-sm transition ${open ? 'border-[rgba(47,214,255,0.5)]' : 'border-[#202A3A]'}`}
                >
                  <div className="flex justify-between"><span className="font-semibold capitalize text-white">{TYPE_OPTS.find((o) => o.id.toLowerCase() === row.type.toLowerCase())?.label ?? row.type}</span><span className="font-mono text-white">{formatUSD(row.amount)} {row.asset}</span></div>
                  <div className="mt-1 flex justify-between text-xs text-[#78859A]"><span>{row.createdAt.slice(0, 10)}</span><span>{stWord(t, row.status)}</span></div>
                  <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div dir="ltr" className="space-y-1 border-t border-[#202A3A]/70 pt-2 text-left font-mono text-[11px] text-[#78859A]">
                        <div>ID: {row.id.slice(0, 13)}…</div>
                        {row.txHash && <div>HASH: {row.txHash}</div>}
                        {row.address && <div>ADDR: {row.address.slice(0, 20)}…</div>}
                        {row.network && <div>NET: {row.network}</div>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
