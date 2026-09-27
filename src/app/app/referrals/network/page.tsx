import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Referral network' };

export default function ReferralNetworkPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Referral Network</h1><DemoBadge /></div>
      <Card className="mt-6 p-8">
        <div className="flex flex-col items-center font-mono text-xs">
          <div className="rounded-xl border border-pulse/50 bg-pulse/10 px-5 py-2 font-bold text-pulse">YOU</div>
          <div className="h-5 w-px bg-pulse/60" />
          <div className="flex gap-4">
            {['L1 · Alice', 'L1 · Mike', 'L1 · Ahmed'].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div className="rounded-lg border border-line bg-void px-3 py-1.5">{n}</div>
                <div className="h-4 w-px bg-pulse/50" />
                <div className="rounded-lg border border-line bg-void px-3 py-1">L2 ×2</div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-fog">Depth capped at 5 levels. Production tree is server-rendered from the referral ledger.</p>
      </Card>
    </div>
  );
}
