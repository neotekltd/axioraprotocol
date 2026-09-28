import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { formatUSD } from '@/lib/finance';
import { getDeploymentByRef } from '@/lib/queries';

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
        title={`Deployment ${d.ref}`}
        sub={`Created ${fmt(d.createdAt)} · ${d.termDays}-day term`}
        actions={<Link href="/app/deployments" className="rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">Back to list</Link>}
      />
      <SectionCard title="Overview">
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="text-[11px] tracking-widest text-fog">AMOUNT</div><div className="mt-1 font-mono text-xl font-bold">{formatUSD(d.amount)}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">PROFIT TO DATE</div><div className="mt-1 font-mono text-xl font-bold text-pulse">{formatUSD(d.profit, { sign: true })}</div></div>
          <div><div className="text-[11px] tracking-widest text-fog">STATUS</div><div className="mt-1"><StatusBadge status={d.status} /></div></div>
          <div><div className="text-[11px] tracking-widest text-fog">ASSET</div><div className="mt-1 font-mono text-xl font-bold">{d.asset}</div></div>
        </div>
        <div className="border-t border-line px-5 py-4">
          <div className="flex justify-between text-xs text-fog"><span>Started {fmt(d.startedAt)}</span><span>Matures {fmt(d.maturesAt)}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Term progress">
            <div className="h-full bg-pulse" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-fog">{progress}% elapsed</div>
        </div>
      </SectionCard>
      <p className="mt-4 text-xs text-fog">Profit settles from ledger-backed results only. Figures shown here are recorded values, never projections.</p>
    </div>
  );
}
