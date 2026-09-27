import Link from 'next/link';
import { DEMO_DEPLOYMENTS } from '@/lib/mock';
import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Deployments' };

export default function DeploymentsPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Deployments</h1><DemoBadge /></div>
      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">ID</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">TERM</th><th className="p-4 text-right">PROFIT</th><th className="p-4 text-right">STATUS</th><th className="p-4 text-right">DETAIL</th></tr></thead>
          <tbody>
            {DEMO_DEPLOYMENTS.map((d) => (
              <tr key={d.id} className="border-t border-line">
                <td className="p-4 font-mono">{d.id}</td><td className="p-4 text-right">${d.amount.toLocaleString()}</td>
                <td className="p-4 text-right">{d.term}d</td><td className="p-4 text-right text-pulse">+${d.profit}</td>
                <td className="p-4 text-right">{d.status}</td>
                <td className="p-4 text-right"><Link href={`/app/deployments/${d.id.replace('#', '')}`} className="text-pulse">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
