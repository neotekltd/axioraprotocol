import Link from 'next/link';
import { PageHeader, SectionCard, TableWrap, StatusBadge, EmptyState } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getDeployments, deploymentLabel, getPayoutHistory } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export const metadata = { title: 'Deployments' };

const FILTERS = ['all', 'active', 'pending', 'matured', 'cancelled'] as const;

export default async function DeploymentsPage({ searchParams }: { searchParams: { status?: string } }) {
  const t = getDict();
  const [all, payouts] = await Promise.all([getDeployments(), getPayoutHistory(50)]);
  const activeFilter = (searchParams.status ?? 'all').toLowerCase();
  const rows = activeFilter === 'all' ? all : all.filter((d) => d.status === activeFilter);
  const counts = (s: string) => (s === 'all' ? all.length : all.filter((d) => d.status === s).length);
  const filterLabel = (f: string) => (f === 'all' ? t.common.all : stWord(t, f));

  return (
    <div>
      <PageHeader
        title={t.dpl.title}
        sub={all.length === 1 ? t.dpl.sub1.replace('{n}', '1') : t.dpl.subN.replace('{n}', String(all.length))}
        actions={<Link href="/app/deploy" className="rounded-xl bg-pulse px-5 py-2.5 text-sm font-bold text-black hover:brightness-110">{t.dpl.newDep}</Link>}
      />
      <div className="mt-6 flex flex-wrap gap-2" role="navigation" aria-label={t.dpl.filterAria}>
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/app/deployments' : `/app/deployments?status=${f}`}
            aria-current={activeFilter === f ? 'page' : undefined}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${activeFilter === f ? 'border-pulse/60 bg-pulse/10 text-pulse' : 'border-line text-fog hover:text-white'}`}
          >
            {filterLabel(f)} ({counts(f)})
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={all.length === 0 ? t.dpl.noDep : t.dpl.noDepF.replace('{s}', filterLabel(activeFilter))}
            body={all.length === 0 ? t.dpl.noDepB : t.dpl.nothingStatus}
            actionLabel={all.length === 0 ? t.dpl.startFirst : undefined}
            actionHref={all.length === 0 ? '/app/deploy' : undefined}
          />
        </div>
      ) : (
        <SectionCard title={rows.length === 1 ? t.dpl.dep1.replace('{n}', '1') : t.dpl.depN.replace('{n}', String(rows.length))}>
          <TableWrap>
            <table className="w-full min-w-[620px] text-sm">
              <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">{t.dpl.cRef}</th><th className="p-4 text-right">{t.tx.cAmount}</th><th className="p-4 text-right">{t.dpl.cTerm}</th><th className="p-4 text-right">{t.dpl.cProfit}</th><th className="p-4 text-right">{t.tx.cStatus}</th><th className="p-4 text-right">{t.dpl.cDetail}</th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-4 font-mono">{d.ref}</td>
                    <td className="p-4 text-right font-mono">{formatUSD(d.amount)}</td>
                    <td className="p-4 text-right">{deploymentLabel(d)}</td>
                    <td className="p-4 text-right font-mono text-pulse">{formatUSD(d.profit, { sign: true })}</td>
                    <td className="p-4 text-right"><StatusBadge status={d.status} label={stWord(t, d.status)} /></td>
                    <td className="p-4 text-right"><Link href={`/app/deployments/${d.ref}`} className="text-pulse hover:brightness-110">{t.dpl.view}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}
      <div className="mt-6">
        <SectionCard title={t.dpl.payoutHist.replace('{n}', String(payouts.length))}>
          {payouts.length === 0 ? (
            <p className="p-4 text-sm text-fog">{t.dpl.noPayouts}</p>
          ) : (
            <TableWrap>
              <table className="w-full min-w-[620px] text-sm">
                <thead><tr className="text-left text-[11px] text-fog"><th className="p-4">{t.dpl.cPayout}</th><th className="p-4 text-right">{t.dpl.cPlan}</th><th className="p-4 text-right">{t.tx.cAmount}</th><th className="p-4 text-right">{t.dpl.cSched}</th><th className="p-4 text-right">{t.tx.cStatus}</th></tr></thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-t border-line">
                      <td className="p-4 font-mono">#{p.payoutNumber}{p.deploymentRef ? ` · ${p.deploymentRef}` : ''}</td>
                      <td className="p-4 text-right">{p.planName}</td>
                      <td className="p-4 text-right font-mono text-pulse">{formatUSD(p.amount, { sign: true })}</td>
                      <td className="p-4 text-right font-mono text-[12px]">{new Date(p.scheduledFor).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-4 text-right"><StatusBadge status={p.status} label={stWord(t, p.status)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
