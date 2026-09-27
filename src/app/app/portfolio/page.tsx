'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DemoBadge, Card } from '@/components/ui';

const RANGES = ['1D', '7D', '30D', '90D', 'ALL'];
const DATA = Array.from({ length: 30 }, (_, i) => ({ t: `D${i + 1}`, balance: 11000 + i * 52 + Math.sin(i / 3) * 40, profit: 120 + i * 2 }));

export default function PortfolioPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Portfolio</h1><DemoBadge /></div>
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap gap-2">{RANGES.map((r) => (<button key={r} className="rounded-lg border border-line px-3 py-1.5 text-xs hover:border-pulse/50">{r}</button>))}</div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA}>
              <XAxis dataKey="t" hide /><YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#0B0F16', border: '1px solid #1E293B' }} />
              <Line type="monotone" dataKey="balance" stroke="#34F5A5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-fog">Demo series. Production streams balance points over Supabase Realtime.</p>
      </Card>
    </div>
  );
}
