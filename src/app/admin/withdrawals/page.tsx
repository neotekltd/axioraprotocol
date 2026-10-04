import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/data';
import { WithdrawalActions } from '@/components/admin/forms';
import { getAdminWithdrawals } from '@/lib/admin';
import { providerEnabled } from '@/lib/nowpayments';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin withdrawals' };

const TABS = ['pending', 'processing', 'completed', 'cancelled', 'all'] as const;

function short(h: string | null) {
  if (!h) return '—';
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h;
}

export default async function AdminWithdrawals({ searchParams }: { searchParams?: { status?: string } }) {
  const status = searchParams?.status ?? 'pending';
  const rows = await getAdminWithdrawals(status);
  const provider = providerEnabled();
  return (
    <div>
      <PageHeader title="Withdrawals" sub="Approval is separate from broadcast. Mark sent only after the on-chain transaction exists." />
      <div className="mt-6 grid grid-cols-5 gap-1 rounded-[16px] border border-[#202A3A] bg-[#0A0E16] p-1.5" role="navigation" aria-label="Withdrawal status filter">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/withdrawals?status=${t}`}
            aria-current={status === t ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-[11px] text-[12px] capitalize transition ${status === t ? 'bg-[#1A2334] font-bold text-white' : 'text-[#78859A] hover:text-white'}`}
          >
            {t}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState title="No withdrawals here" body="Nothing requires administrator action." /></div>
      ) : (
        <div className="mt-4 space-y-4">
          {rows.map((w) => (
            <SectionCard
              key={w.id}
              title={`${formatUSD(w.amount)} ${w.asset}`}
              action={<StatusBadge status={w.status} />}
            >
              <div className="px-5 py-3 font-mono text-[12px] leading-relaxed text-[#78859A]">
                <div className="break-all">TO {w.address ?? '—'}</div>
                <div>{w.userEmail ?? w.userId.slice(0, 8)} · {w.network ?? '—'} · {w.createdAt.slice(0, 16).replace('T', ' ')}</div>
                {w.txHash && <div className="break-all">TX {short(w.txHash)}</div>}
              </div>
              <div className="border-t border-[#202A3A]/60 p-5">
                <WithdrawalActions id={w.id} status={w.status} providerEnabled={provider} />
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
