import { SectionEyebrow, SectionTitle, Stat, DemoBadge, Card } from '@/components/ui';
import { DEMO_TICKER } from '@/lib/mock';

export const metadata = { title: 'Statistics' };

export default function StatisticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20">
      <div className="flex items-center gap-3"><SectionEyebrow>PROTOCOL TERMINAL</SectionEyebrow><DemoBadge /></div>
      <SectionTitle>Statistics</SectionTitle>
      <p className="mt-3 text-sm text-fog">Production source: <code>GET /api/public/stats</code>. Numbers animate on viewport entry; live P&amp;L streams over WebSocket.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="PROTOCOL CAPITAL" value="$24,816,402" />
        <Stat label="VERIFIED TRADES" value="48,213" />
        <Stat label="TOTAL P&L" value="$3,912,558" />
        <Stat label="WIN RATE" value="63.42%" />
        <Stat label="ACTIVE POSITIONS" value="37" />
        <Stat label="CURRENT VALUE" value="$28,728,960" />
      </div>
      <Card className="mt-8 overflow-hidden">
        <div className="p-4 text-[11px] tracking-widest text-fog border-b border-line">LIVE TICKER · DEMO</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px] tracking-widest"><th className="p-4">ASSET</th><th className="p-4">SIDE</th><th className="p-4 text-right">ENTRY</th><th className="p-4 text-right">PRICE</th><th className="p-4 text-right">P&L</th><th className="p-4 text-right">STATUS</th></tr></thead>
          <tbody>
            {DEMO_TICKER.map((t) => (
              <tr key={t.pair} className="border-t border-line font-mono">
                <td className="p-4">{t.pair}</td><td className={`p-4 ${t.side === 'LONG' ? 'text-pulse' : 'text-danger'}`}>{t.side}</td>
                <td className="p-4 text-right">{t.entry}</td><td className="p-4 text-right">{t.price}</td>
                <td className="p-4 text-right text-pulse">+{t.pnlPct.toFixed(2)}%</td><td className="p-4 text-right">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
