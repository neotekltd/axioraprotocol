'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatUSD } from '@/lib/finance';

export function PortfolioChart({ series }: { series: { t: string; value: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series.length > 0 ? series : [{ t: '', value: 0 }]}>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: '#0B0F16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
            formatter={(v) => [formatUSD(Number(v)), 'Deployed']}
          />
          <Line type="monotone" dataKey="value" stroke="#00D294" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
