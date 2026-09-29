import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, SectionCard, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getPortfolioSummary, getTransactions, getWallets } from '@/lib/queries';

export const metadata = { title: 'Wallet' };

function short(addr: string) {
  return addr.length > 18 ? `${addr.slice(0, 10)}…${addr.slice(-6)}` : addr;
}

export default async function WalletPage() {
  const [summary, txns, wallets] = await Promise.all([getPortfolioSummary(), getTransactions(8), getWallets()]);
  const recent = txns.filter((t) => t.type === 'deposit' || t.type === 'withdrawal');

  return (
    <div>
      <PageHeader
        title="Wallet"
        sub="Balances, saved addresses and wallet activity."
        actions={
          <>
            <Link href="/app/deposit" className="inline-flex min-h-[44px] items-center rounded-[12px] border border-[#2A394D] px-4 text-[14px] font-semibold text-white hover:border-[rgba(47,214,255,0.5)]">Deposit</Link>
            <Link href="/app/withdraw" className="inline-flex min-h-[44px] items-center rounded-[12px] bg-[#2FD6FF] px-4 text-[14px] font-bold text-[#06121A] hover:brightness-110">Withdraw</Link>
          </>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="TOTAL BALANCE" value={formatUSD(summary.totalValue)} />
        <StatCard label="AVAILABLE" value={formatUSD(summary.available)} />
        <StatCard label="RESERVED" value={formatUSD(summary.deployedActive + summary.reservedWithdrawals)} sub="Deployments + withdrawal holds" />
        <StatCard label="WITHDRAWN" value={formatUSD(summary.withdrawn)} sub="Lifetime" />
      </div>

      <SectionCard
        title="Saved Addresses"
        action={<Link href="/app/wallets" className="flex items-center gap-1 text-[13px] text-[#AAB5C7] hover:text-white">Manage <ArrowRight size={14} /></Link>}
      >
        {wallets.length === 0 ? (
          <p className="p-6 text-[14px] text-[#78859A]">No saved addresses. Add one to speed up withdrawals.</p>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {wallets.slice(0, 4).map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-[14px]">
                <div>
                  <span className="font-mono text-white">{w.asset} / {w.network}</span>
                  <span className="ml-2 font-mono text-[#78859A]">{short(w.address)}</span>
                  {w.label && <span className="ml-2 text-[#78859A]">· {w.label}</span>}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">{w.verified ? 'Verified' : 'Unverified'}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Recent Wallet Activity"
        action={<Link href="/app/transactions" className="flex items-center gap-1 text-[13px] text-[#AAB5C7] hover:text-white">Full history <ArrowRight size={14} /></Link>}
      >
        {recent.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No wallet activity" body="Deposits and withdrawals will appear here once recorded." actionLabel="How to deposit" actionHref="/app/deposit" />
          </div>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-4 text-[14px]">
                <div><span className="font-semibold capitalize text-white">{t.type}</span> <span className="text-[#78859A]">{t.asset}</span></div>
                <div className="text-right">
                  <div className="font-mono text-white">{formatUSD(t.amount)}</div>
                  <div className="font-mono text-[11px] text-[#78859A]">{t.createdAt.slice(0, 10)} · {t.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
