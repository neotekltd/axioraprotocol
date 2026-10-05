import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getDeploymentByRef, deploymentLabel } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Deployment ${params.id}` };
}

function fmt(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default async function DeploymentDetail({ params }: { params: { id: string } }) {
  const t = getDict();
  const d = await getDeploymentByRef(params.id);
  if (!d) notFound();
  const now = Date.now();
  const start = d.startedAt ? new Date(d.startedAt).getTime() : null;
  const end = d.maturesAt ? new Date(d.maturesAt).getTime() : null;
  const progress = start != null && end != null && end > start
    ? Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
    : d.status === 'matured' ? 100 : 0;

  return (
    <div>
      <PageHeader
        title={t.dpl.depT.replace('{r}', d.ref)}
        sub={t.dpl.createdX.replace('{d}', fmt(d.createdAt)).replace('{l}', deploymentLabel(d) === '—' ? t.dpl.deploymentW : t.dpl.planW.replace('{l}', deploymentLabel(d)))}
        actions={<Link href="/app/deployments" className="rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">{t.dpl.backList}</Link>}
      />
      <SectionCard title={t.dpl.overview}>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="text-[11px] tracking-widest text-fog">{t.dpl.amountC}</div><div className="mt-1 font-mono text-xl font-bold">{formatUSD(d.amount)}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">{t.dpl.profitDate}</div><div className="mt-1 font-mono text-xl font-bold text-pulse">{formatUSD(d.profit, { sign: true })}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">{t.tx.cStatus}</div><div className="mt-1"><StatusBadge status={d.status} label={stWord(t, d.status)} /></div></div>
          <div><div className="text-[11px] tracking-widest text-fog">{t.dpl.assetC}</div><div className="mt-1 font-mono text-xl font-bold">{d.asset}</div></div>
        </div>
        <div className="border-t border-line px-5 py-4">
          <div className="flex justify-between text-xs text-fog"><span>{t.dpl.started.replace('{d}', fmt(d.startedAt))}</span><span>{t.dpl.matures.replace('{d}', fmt(d.maturesAt))}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={t.dpl.termProgress}>
            <div className="h-full bg-pulse" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-fog">{t.dpl.elapsed.replace('{n}', String(progress))}</div>
        </div>
      </SectionCard>
      <p className="mt-4 text-xs text-fog">{t.dpl.profitNote}</p>
    </div>
  );
}
