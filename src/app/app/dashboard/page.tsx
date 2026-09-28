import Link from 'next/link';
import { PageHeader, StatCard, SectionCard, TableWrap, StatusBadge, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { SITE_URL } from '@/lib/config';
import {
  getSessionUser, getProfile, getPortfolioSummary, getDeployments, getTrades,
  getTransactions, getReferrals, getReferralEarnings,
} from '@/lib/queries';

export const metadata = { title: 'Dashboard' };

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default async function DashboardPage() {
  const [user, profile, summary, deployments, trades, txns, referrals, earnings] = await Promise.all([
    getSessionUser(), getProfile(), getPortfolioSummary(), getDeployments(),
    getTrades(), getTransactions(5), getReferrals(), getReferralEarnings(),
  ]);
  const active = deployments.filter((d) => d.status === 'active' || d.status === 'pending');
  const recentTrades = trades.slice(0, 4);
  const referralTotal = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);
  const name = profile?.displayName || user?.email?.split('@')[0] || 'there';

  return (
    <div>
      <PageHeader
        title={`Welcome${name !== 'there' ? `, ${name}` : ''} — Portfolio Overview`}
        sub={user?.email ? `Signed in as ${user.email}` : 'Sign in to load your live balance.'}
        actions={
          <>
            <Link href="/app/deposit" className="rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">Deposit</Link>
            <Link href="/app/deploy" className="rounded-xl bg-pulse px-5 py-2.5 text-sm font-bold text-black hover:brightness-110">Deploy</Link>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL VALUE" value={formatUSD(summary.totalValue)} sub="Available + deployed" />
        <StatCard label="AVAILABLE" value={formatUSD(summary.available)} sub="Ready to deploy or withdraw" />
        <StatCard label="DEPLOYED" value={formatUSD(summary.deployedActive)} sub={`${active.length} active deployment${active.length === 1 ? '' : 's'}`} />
        <StatCard
          label="TOTAL PROFIT"
          value={formatUSD(summary.totalProfit, { sign: true })}
          sub="Settled + credited profit"
          accent={summary.totalProfit > 0 ? 'up' : summary.totalProfit < 0 ? 'down' : 'neutral'}
        />
      </div>

      <SectionCard
        title="Active Deployments"
        action={<Link href="/app/deployments" className="text-xs text-pulse hover:brightness-110">View all</Link>}
      >
        {active.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No active deployments"
              body="Deploy capital to put it to work. New accounts start at $0.00 — deposit funds, then start your first deployment."
              actionLabel="Start your first deployment"
              actionHref="/app/deploy"
            />
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">REF</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">TERM</th><th className="p-4 text-right">PROFIT</th><th className="p-4 text-right">STATUS</th></tr></thead>
              <tbody>
                {active.slice(0, 5).map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-4 font-mono"><Link href={`/app/deployments/${d.ref}`} className="text-pulse">{d.ref}</Link></td>
                    <td className="p-4 text-right font-mono">{formatUSD(d.amount)}</td>
                    <td className="p-4 text-right">{d.termDays}d</td>
                    <td className="p-4 text-right font-mono text-pulse">{formatUSD(d.profit, { sign: true })}</td>
                    <td className="p-4 text-right"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Recent Trades"
          action={<Link href="/app/trades" className="text-xs text-pulse hover:brightness-110">View all</Link>}
        >
          {recentTrades.length === 0 ? (
            <p className="p-6 text-sm text-fog">No trades yet. Trades appear here once your deployments execute.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentTrades.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                  <div><span className="font-mono">{t.pair}</span> <span className="text-fog">{t.side}</span></div>
                  <div className="text-right">
                    <div className={`font-mono ${t.pnl >= 0 ? 'text-pulse' : 'text-danger'}`}>{formatUSD(t.pnl, { sign: true })}</div>
                    <div className="text-[11px] text-fog">{fmtDate(t.openedAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard
          title="Recent Transactions"
          action={<Link href="/app/transactions" className="text-xs text-pulse hover:brightness-110">View all</Link>}
        >
          {txns.length === 0 ? (
            <p className="p-6 text-sm text-fog">No transactions yet. Deposits, withdrawals and deployments will be listed here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {txns.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                  <div><span className="capitalize">{t.type}</span> <span className="text-fog">{t.asset}</span></div>
                  <div className="text-right">
                    <div className="font-mono">{formatUSD(t.amount)}</div>
                    <div className="text-[11px] text-fog">{fmtDate(t.createdAt)} · {t.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Referral Summary"
        action={<Link href="/app/referrals" className="text-xs text-pulse hover:brightness-110">Open referrals</Link>}
      >
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div><div className="text-[11px] tracking-widest text-fog">YOUR CODE</div><div className="mt-1 font-mono font-bold text-pulse">{profile?.referralCode ?? '—'}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">REFERRALS</div><div className="mt-1 font-mono text-xl font-bold">{referrals.length}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">EARNINGS</div><div className="mt-1 font-mono text-xl font-bold">{formatUSD(referralTotal)}</div></div>
        </div>
        {profile && (
          <p className="break-all border-t border-line px-5 py-3 font-mono text-xs text-fog">
            {SITE_URL}/register?ref={profile.referralCode}
          </p>
        )}
      </SectionCard>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/app/wallet" className="rounded-xl border border-line px-5 py-2.5 hover:border-pulse/50">Open wallet</Link>
        <Link href="/app/protocol-stats" className="rounded-xl border border-line px-5 py-2.5 hover:border-pulse/50">Protocol stats</Link>
      </div>
      <p className="mt-4 text-xs text-fog">All figures come from your Supabase ledger. Placeholder data is never shown.</p>
    </div>
  );
}
