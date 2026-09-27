import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Withdraw' };

export default function WithdrawPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Withdraw</h1><DemoBadge /></div>
      <Card className="mt-6 p-6 sm:p-8">
        <div className="text-sm text-fog">Available Balance <span className="font-bold text-white">$3,281.42</span></div>
        <label className="mt-4 block text-xs text-fog">Amount</label>
        <input type="number" placeholder="0.00" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" />
        <label className="mt-4 block text-xs text-fog">Destination wallet</label>
        <div className="mt-1 rounded-xl border border-line bg-void px-4 py-3 text-sm">USDT / TRC20 · TQ…91X ✓</div>
        <div className="mt-4 space-y-1 text-xs text-fog"><div>Network fee: $1.00 (est.)</div><div>Platform fee: $0.00</div><div className="text-white">You receive: —</div></div>
        <label className="mt-4 block text-xs text-fog">2FA code</label>
        <input inputMode="numeric" placeholder="••••••" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse sm:max-w-xs" />
        <p className="mt-4 text-xs text-fog">Processed in the configurable daily window from available balance only. Production enforces 2FA + withdrawal-state machine.</p>
        <button className="mt-6 rounded-xl bg-pulse px-8 py-3 text-sm font-bold text-black">Confirm Withdrawal</button>
      </Card>
    </div>
  );
}
