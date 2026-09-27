import { DemoBadge, Card } from '@/components/ui';
import { PROTOCOL_CONFIG } from '@/lib/config';

export const metadata = { title: 'Deploy' };

export default function DeployPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Deploy Capital</h1><DemoBadge /></div>
      <Card className="mt-6 p-6 sm:p-8">
        <div className="text-sm text-fog">Available Balance <span className="font-bold text-white">$3,281.42</span></div>
        <label className="mt-4 block text-xs text-fog">Amount (USD)</label>
        <input type="number" min={PROTOCOL_CONFIG.minDeployment} max={PROTOCOL_CONFIG.maxDeployment} defaultValue={1000} className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" />
        <label className="mt-4 block text-xs text-fog">Term</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROTOCOL_CONFIG.termOptions.map((t) => (
            <button key={t} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-pulse/50">{t} days</button>
          ))}
        </div>
        <p className="mt-4 text-xs text-fog">Estimate shown pre-confirmation. Confirmation calls <code>GET /api/deployments/quote</code> and snapshots rates; production wraps activation in a ledger transaction.</p>
        <button className="mt-6 w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black sm:w-auto sm:px-8">Activate Protocol</button>
      </Card>
    </div>
  );
}
