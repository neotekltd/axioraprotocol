import { PageHeader, StatCard, SectionCard, TableWrap, EmptyState } from '@/components/data';
import { PortfolioChart } from '@/components/PortfolioChart';
import { formatUSD } from '@/lib/finance';
import { getDeployments, getPortfolioSummary, getTrades } from '@/lib/queries';
import Link from 'next/link';

export const metadata = { title: 'Portfolio' };

export default async function PortfolioPage() {
  const [summary, deployments, trades] = await Promise.all([getPortfolioSummary(), getDeployments(), getTrades()]);
  // Real cumulative deployed-principal curve from deployment rows (oldest → newest).
  const ordered = [...deployments].reverse();
  let running = 0;
  const series = ordered.map((d) => {
    running += d.status === 'cancelled' || d.status === 'failed' ? 0 : d.amount;
    return { t: d.createdAt.slice(0, 10), value: Math.round(running * 100) / 100 };
  });
  const closedPnl = trades.filter((t) => t.status === 'closed').reduce((a, t) => a + t.pnl, 0);
  const hasAnything = deployments.length > 0 || summary.deposited > 0;

  return (
    <div>
      <PageHeader title="Portfolio" sub="Your capital, deployments and performance — from your ledger." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL VALUE" value={formatUSD(summary.totalValue)} />
        <StatCard label="AVAILABLE" value={formatUSD(summary.available)} />
        <StatCard label="DEPLOYED" value={formatUSD(summary.deployedActive)} />
        <StatCard
          label="TOTAL PROFIT"
          value={formatUSD(summary.totalProfit, { sign: true })}
          accent={summary.totalProfit > 0 ? 'up' : summary.totalProfit < 0 ? 'down' : 'neutral'}
        />
      </div>

      <SectionCard title="Deployed Capital Over Time">
        {!hasAnything ? (
          <div className="p-6">
            <EmptyState
              title="No portfolio history yet"
              body="Your performance chart builds itself from real deployment activity. Deposit funds and activate a deployment to begin."
              actionLabel="Deposit funds"
              actionHref="/app/deposit"
            />
          </div>
        ) : (
          <div className="p-5">
            <PortfolioChart series={series} />
            <p className="mt-2 text-xs text-fog">Cumulative deployed principal from {deployments.length} recorded deployment{deployments.length === 1 ? '' : 's'}.</p>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Performance"
        action={<Link href="/app/trades" className="text-xs text-pulse hover:brightness-110">All trades</Link>}
      >
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div><div className="text-[11px] tracking-widest text-fog">CLOSED TRADE P&L</div><div className={`mt-1 font-mono text-xl font-bold ${closedPnl >= 0 ? 'text-pulse' : 'text-danger'}`}>{formatUSD(closedPnl, { sign: true })}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">TOTAL DEPOSITED</div><div className="mt-1 font-mono text-xl font-bold">{formatUSD(summary.deposited)}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">TOTAL WITHDRAWN</div><div className="mt-1 font-mono text-xl font-bold">{formatUSD(summary.withdrawn)}</div></div>
        </div>
      </SectionCard>

      <SectionCard
        title="Deployments"
        action={<Link href="/app/deployments" className="text-xs text-pulse hover:brightness-110">View all</Link>}
      >
        {deployments.length === 0 ? (
          <p className="p-6 text-sm text-fog">No deployments recorded.</p>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">REF</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">TERM</th><th className="p-4 text-right">STATUS</th></tr></thead>
              <tbody>
                {deployments.slice(0, 8).map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-4 font-mono"><Link href={`/app/deployments/${d.ref}`} className="text-pulse">{d.ref}</Link></td>
                    <td className="p-4 text-right font-mono">{formatUSD(d.amount)}</td>
                    <td className="p-4 text-right">{d.termDays}d</td>
                    <td className="p-4 text-right text-fog">{d.status}</td>
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
