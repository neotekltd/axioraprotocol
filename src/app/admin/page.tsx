import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/data';
import { getAdminMetrics } from '@/lib/admin';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin dashboard' };

export default async function AdminDashboard() {
  const m = await getAdminMetrics();
  return (
    <div>
      <PageHeader title="Admin control" sub="Live system state from Supabase. Empty states show 0 — never fabricated activity." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="USERS" value={String(m.users)} />
        <StatCard label="PENDING DEPOSITS" value={String(m.pendingDeposits)} sub={formatUSD(m.pendingDepositsTotal)} accent={m.pendingDeposits > 0 ? 'up' : 'neutral'} />
        <StatCard label="PENDING WITHDRAWALS" value={String(m.pendingWithdrawals)} sub={formatUSD(m.pendingWithdrawalsTotal)} accent={m.pendingWithdrawals > 0 ? 'up' : 'neutral'} />
        <StatCard label="ACTIVE INVESTED" value={formatUSD(m.activeInvested)} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/deposits?status=pending" className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5 transition hover:border-[rgba(47,214,255,0.5)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">DEPOSITS</div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{m.pendingDeposits} pending</div>
          <div className="mt-1 text-[13px] text-[#78859A]">Needs administrator review</div>
          <div className="mt-3 text-[14px] font-bold text-[#2FD6FF]">Open queue →</div>
        </Link>
        <Link href="/admin/withdrawals?status=pending" className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5 transition hover:border-[rgba(47,214,255,0.5)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">WITHDRAWALS</div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{m.pendingWithdrawals} pending</div>
          <div className="mt-1 text-[13px] text-[#78859A]">Approve separately from broadcast</div>
          <div className="mt-3 text-[14px] font-bold text-[#2FD6FF]">Open queue →</div>
        </Link>
      </div>
    </div>
  );
}
