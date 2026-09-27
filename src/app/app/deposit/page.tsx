import { DemoBadge, Card } from '@/components/ui';
import { PROTOCOL_CONFIG } from '@/lib/config';

export const metadata = { title: 'Deposit' };

export default function DepositPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Deposit</h1><DemoBadge /></div>
      <p className="mt-1 text-sm text-fog">Supported deposits auto-convert to USDT on arrival (demo — no real funds).</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <label className="text-xs text-fog">Asset</label>
          <div className="mt-1 rounded-xl border border-line bg-void px-4 py-3 text-sm">USDT</div>
          <label className="mt-4 block text-xs text-fog">Network</label>
          <div className="mt-1 rounded-xl border border-line bg-void px-4 py-3 text-sm">TRC20 · TRON</div>
          <div className="mt-4 text-xs text-fog">Minimum deposit: {`$${PROTOCOL_CONFIG.minDeployment}`}</div>
        </Card>
        <Card className="p-6">
          <div className="text-xs tracking-widest text-fog">DEPOSIT ADDRESS</div>
          <div className="mt-2 break-all font-mono text-sm text-pulse">TXYZdemoAddressXXXXXXXXXXXXXXXXXXXXXXX</div>
          <button className="mt-4 rounded-xl border border-line px-5 py-2.5 text-sm hover:border-pulse/50">Copy address</button>
          <div className="mt-4 text-xs text-fog">State machine: CREATED → ADDRESS_ASSIGNED → AWAITING → DETECTED → CONFIRMING → CONFIRMED → CREDITED.</div>
        </Card>
      </div>
    </div>
  );
}
