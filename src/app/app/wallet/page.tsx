import Link from 'next/link';
import { PageHeader, StatCard, SectionCard, TableWrap, EmptyState } from '@/components/data';
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
            <Link href="/app/deposit" className="rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">Deposit</Link>
            <Link href="/app/withdraw" className="rounded-xl bg-pulse px-5 py-2.5 text-sm font-bold text-black hover:brightness-110">Withdraw</Link>
          </>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL BALANCE" value={formatUSD(summary.totalValue)} />
        <StatCard label="AVAILABLE" value={formatUSD(summary.available)} />
        <StatCard label="RESERVED" value={formatUSD(summary.deployedActive + summary.reservedWithdrawals)} sub="Deployments + withdrawal holds" />
        <StatCard label="WITHDRAWN" value={formatUSD(summary.withdrawn)} sub="Lifetime" />
      </div>

      <SectionCard
        title="Saved Addresses"
        action={<Link href="/app/wallets" className="text-xs text-pulse hover:brightness-110">Manage</Link>}
      >
        {wallets.length === 0 ? (
          <p className="p-6 text-sm text-fog">No saved addresses. Add one to speed up withdrawals.</p>
        ) : (
          <ul className="divide-y divide-line">
            {wallets.slice(0, 4).map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                <div>
                  <span className="font-mono">{w.asset} / {w.network}</span>
                  <span className="ml-2 font-mono text-fog">{short(w.address)}</span>
                  {w.label && <span className="ml-2 text-fog">· {w.label}</span>}
                </div>
                <span className="text-[11px] text-fog">{w.verified ? 'Verified' : 'Unverified'}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Recent Wallet Activity"
        action={<Link href="/app/transactions" className="text-xs text-pulse hover:brightness-110">Full history</Link>}
      >
        {recent.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No wallet activity" body="Deposits and withdrawals will appear here once recorded." actionLabel="How to deposit" actionHref="/app/deposit" />
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">TYPE</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">STATUS</th><th className="p-4 text-right">DATE</th></tr></thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="p-4 capitalize">{t.type} <span className="text-fog">{t.asset}</span></td>
                    <td className="p-4 text-right font-mono">{formatUSD(t.amount)}</td>
                    <td className="p-4 text-right text-fog">{t.status}</td>
                    <td className="p-4 text-right text-fog">{t.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </SectionCard>
    </div>
  );
}
