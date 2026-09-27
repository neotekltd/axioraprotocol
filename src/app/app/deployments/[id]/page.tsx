import { DEMO_DEPLOYMENTS } from '@/lib/mock';
import { DemoBadge, Card } from '@/components/ui';
import { notFound } from 'next/navigation';

export default function DeploymentDetail({ params }: { params: { id: string } }) {
  const d = DEMO_DEPLOYMENTS.find((x) => x.id.replace('#', '') === params.id);
  if (!d) notFound();
  const progress = d.status === 'Active' ? 72 : 100;
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Deployment {d.id}</h1><DemoBadge /></div>
      <Card className="mt-6 p-6">
        <div className="text-3xl font-bold">${d.amount.toLocaleString()}</div>
        <div className="mt-1 text-sm text-fog">{d.term} days · Started {d.started} · Matures {d.maturity}</div>
        <div className="mt-2 text-sm text-pulse">Profit +${d.profit}</div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-edge"><div className="h-full bg-pulse" style={{ width: `${progress}%` }} /></div>
        <div className="mt-1 text-xs text-fog">{progress}% · {d.status}</div>
      </Card>
    </div>
  );
}
