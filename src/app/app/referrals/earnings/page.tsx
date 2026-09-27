import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Referral earnings' };

const ROWS = [
  ['Sep 27', 'Instant · L1', '+$12.50'], ['Sep 27', 'Daily share · L2', '+$3.10'],
  ['Sep 26', 'Instant · L1', '+$25.00'], ['Sep 26', 'Daily share · L1', '+$18.42'],
];

export default function ReferralEarningsPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Referral Earnings</h1><DemoBadge /></div>
      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">DATE</th><th className="p-4">TYPE</th><th className="p-4 text-right">AMOUNT</th></tr></thead>
          <tbody>{ROWS.map(([d, t, a], i) => (<tr key={i} className="border-t border-line"><td className="p-4">{d}</td><td className="p-4">{t}</td><td className="p-4 text-right text-pulse">{a}</td></tr>))}</tbody>
        </table>
      </Card>
      <p className="mt-3 text-xs text-fog">Each reward snapshots its rate at calculation time; history never re-prices on config change.</p>
    </div>
  );
}
