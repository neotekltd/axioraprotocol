import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Wallets' };

export default function WalletsPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Saved Wallets</h1><DemoBadge /></div>
      <Card className="mt-6 p-6">
        <div className="font-mono text-sm">USDT / TRC20 · TQ…91X</div>
        <div className="mt-1 text-xs text-fog">Added Sep 21 · Verified ✓</div>
        <button className="mt-4 rounded-xl border border-line px-4 py-2 text-xs">Remove</button>
      </Card>
      <Card className="mt-4 p-6">
        <div className="text-sm font-bold">Add wallet</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input placeholder="Asset (USDT)" className="rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse" />
          <input placeholder="Network (TRC20)" className="rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse" />
          <input placeholder="Address" className="rounded-xl border border-line bg-void px-4 py-2.5 font-mono text-sm outline-none focus:border-pulse sm:col-span-2" />
          <input placeholder="Label" className="rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse" />
          <input placeholder="2FA code" className="rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse" />
        </div>
        <p className="mt-3 text-xs text-fog">New addresses require verification before withdrawals can target them.</p>
        <button className="mt-4 rounded-xl bg-pulse px-6 py-2.5 text-sm font-bold text-black">Save wallet</button>
      </Card>
    </div>
  );
}
