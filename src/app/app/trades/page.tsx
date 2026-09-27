import { DEMO_TRADES } from '@/lib/mock';
import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Trades' };

export default function TradesPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Trading Activity</h1><DemoBadge /></div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {['All assets', 'LONG', 'SHORT', 'Profitable', 'Loss'].map((f) => (<span key={f} className="rounded-full border border-line px-3 py-1.5 text-fog">{f}</span>))}
      </div>
      <Card className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">ASSET</th><th className="p-4">SIDE</th><th className="p-4 text-right">ENTRY</th><th className="p-4 text-right">EXIT</th><th className="p-4 text-right">SIZE</th><th className="p-4 text-right">P&L</th><th className="p-4 text-right">TIME</th></tr></thead>
          <tbody>
            {DEMO_TRADES.map((t, i) => (
              <tr key={i} className="border-t border-line font-mono">
                <td className="p-4">{t.asset}</td><td className="p-4">{t.side}</td><td className="p-4 text-right">{t.entry}</td>
                <td className="p-4 text-right">{t.exit}</td><td className="p-4 text-right">{t.size}</td>
                <td className="p-4 text-right text-pulse">+${t.pnl}</td><td className="p-4 text-right">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
