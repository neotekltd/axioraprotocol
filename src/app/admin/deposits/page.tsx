import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { getAdminDeposits } from '@/lib/admin';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin deposits' };

const TABS = ['pending', 'completed', 'rejected', 'all'] as const;

function short(h: string | null) {
  if (!h) return '—';
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h;
}

export default async function AdminDeposits({ searchParams }: { searchParams?: { status?: string } }) {
  const status = searchParams?.status ?? 'pending';
  const rows = await getAdminDeposits(status);
  return (
    <div>
      <PageHeader title="Deposits" sub="Review TXIDs, verify on the correct explorer, then confirm exactly once." />
      <div className="mt-6 grid grid-cols-4 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label="Deposit status filter">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/deposits?status=${t}`}
            aria-current={status === t ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[13px] capitalize transition ${status === t ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {t}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState title="No deposits here" body={status === 'pending' ? 'All deposit reviews are clear.' : `Nothing with status ${status}.`} /></div>
      ) : (
        <SectionCard title={`${rows.length} deposit${rows.length === 1 ? '' : 's'}`}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/deposits/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#111722]/60">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[14px] font-bold text-white">{formatUSD(d.amount)} {d.asset}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="mt-1 truncate font-mono text-[12px] text-[#78859A]">
                      {d.userEmail ?? d.userId.slice(0, 8)} · {d.network ?? '—'} · TX {short(d.txHash)} · {d.createdAt.slice(0, 16).replace('T', ' ')}
                    </div>
                  </div>
                  <span aria-hidden="true" className="shrink-0 font-mono text-[#2FD6FF]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
