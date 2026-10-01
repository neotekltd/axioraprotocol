import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/data';
import { getAdminMetrics } from '@/lib/admin';
import { ASSET_IDS, configStatus, DEPOSIT_CONFIG } from '@/lib/deposits';
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
      <div className="mt-4 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">DEPOSIT CONFIGURATION · STATUS ONLY, NO VALUES SHOWN</div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(() => {
            const status = configStatus();
            return ASSET_IDS.map((id) => {
              const ok = status[id];
              const c = DEPOSIT_CONFIG[id];
              return (
                <li key={id} className="flex items-center justify-between gap-2 rounded-[12px] border border-[#202A3A] bg-[#0A0E16] px-3.5 py-2.5 text-[13px]">
                  <span className="font-mono font-bold text-white">{c.symbol} · {c.standard}</span>
                  <span className={`font-mono text-[11px] font-bold ${ok ? 'text-[#35D98B]' : 'text-[#F2BF4A]'}`}>
                    {ok ? 'ACTIVE' : 'NOT CONFIGURED'}
                  </span>
                </li>
              );
            });
          })()}
        </ul>
        <p className="mt-3 text-[12px] text-[#78859A]">
          Resolved from server runtime configuration (environment first, then the networks table).
          Manage addresses in <Link href="/admin/assets" className="font-semibold text-[#2FD6FF]">Assets</Link>.
        </p>
      </div>
    </div>
  );
}
