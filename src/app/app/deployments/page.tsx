import Link from 'next/link';
import { PageHeader, SectionCard, TableWrap, StatusBadge, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getDeployments, deploymentLabel } from '@/lib/queries';

export const metadata = { title: 'Deployments' };

const FILTERS = ['all', 'active', 'pending', 'matured', 'cancelled'] as const;

export default async function DeploymentsPage({ searchParams }: { searchParams: { status?: string } }) {
  const all = await getDeployments();
  const activeFilter = (searchParams.status ?? 'all').toLowerCase();
  const rows = activeFilter === 'all' ? all : all.filter((d) => d.status === activeFilter);
  const counts = (s: string) => (s === 'all' ? all.length : all.filter((d) => d.status === s).length);

  return (
    <div>
      <PageHeader
        title="Deployments"
        sub={`${all.length} recorded deployment${all.length === 1 ? '' : 's'} in your ledger.`}
        actions={<Link href="/app/deploy" className="rounded-xl bg-pulse px-5 py-2.5 text-sm font-bold text-black hover:brightness-110">New deployment</Link>}
      />
      <div className="mt-6 flex flex-wrap gap-2" role="navigation" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/app/deployments' : `/app/deployments?status=${f}`}
            aria-current={activeFilter === f ? 'page' : undefined}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${activeFilter === f ? 'border-pulse/60 bg-pulse/10 text-pulse' : 'border-line text-fog hover:text-white'}`}
          >
            {f} ({counts(f)})
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={all.length === 0 ? 'No deployments yet' : `No ${activeFilter} deployments`}
            body={all.length === 0 ? 'Activate your first deployment to put capital to work. Every deployment is recorded in your ledger.' : 'Nothing with this status right now.'}
            actionLabel={all.length === 0 ? 'Start your first deployment' : undefined}
            actionHref={all.length === 0 ? '/app/deploy' : undefined}
          />
        </div>
      ) : (
        <SectionCard title={`${rows.length} deployment${rows.length === 1 ? '' : 's'}`}>
          <TableWrap>
            <table className="w-full min-w-[620px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">REF</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">TERM</th><th className="p-4 text-right">PROFIT</th><th className="p-4 text-right">STATUS</th><th className="p-4 text-right">DETAIL</th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-4 font-mono">{d.ref}</td>
                    <td className="p-4 text-right font-mono">{formatUSD(d.amount)}</td>
                    <td className="p-4 text-right">{deploymentLabel(d)}</td>
                    <td className="p-4 text-right font-mono text-pulse">{formatUSD(d.profit, { sign: true })}</td>
                    <td className="p-4 text-right"><StatusBadge status={d.status} /></td>
                    <td className="p-4 text-right"><Link href={`/app/deployments/${d.ref}`} className="text-pulse hover:brightness-110">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}
    </div>
  );
}
