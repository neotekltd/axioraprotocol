'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateDeployment, formatUSD, formatPct } from '@/lib/finance';
import { PROTOCOL_CONFIG } from '@/lib/config';

export function CalculatorWidget({ compact = false }: { compact?: boolean }) {
  const [amount, setAmount] = useState(1000);
  const [term, setTerm] = useState(20);
  const r = useMemo(() => calculateDeployment({ amount, termDays: term }), [amount, term]);

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Model your returns</h3>
        <span className="text-[10px] tracking-widest text-fog border border-line rounded-full px-2.5 py-1">INSTANT ESTIMATE</span>
      </div>
      <div className={`mt-6 grid gap-6 ${compact ? '' : 'md:grid-cols-2'}`}>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm"><span className="text-fog">Term</span><span className="font-semibold">{r.termDays} days</span></div>
            <input type="range" min={PROTOCOL_CONFIG.minTermDays} max={PROTOCOL_CONFIG.maxTermDays} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="mt-3 w-full accent-[#34F5A5]" />
            <div className="flex justify-between text-[11px] text-fog"><span>20 days</span><span>90 days</span></div>
          </div>
          <div>
            <div className="flex justify-between text-sm"><span className="text-fog">Capital</span><span className="font-semibold">{formatUSD(r.amount, { decimals: 0 })}</span></div>
            <input type="range" min={10} max={100000} step={10} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-3 w-full accent-[#34F5A5]" />
            <input
              type="number" min={10} max={100000} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse"
            />
          </div>
          <p className="text-[11px] text-fog leading-relaxed">Frontend estimate only. Deployment confirmation recalculates server-side via <code>/api/deployments/quote</code>. No yield is guaranteed.</p>
        </div>
        <div className="rounded-2xl border border-line bg-void/60 p-5 space-y-3">
          <Row k="Daily yield" v={`${formatPct(r.dailyRate * 100)} · ${formatUSD(r.dailyYield)}`} hi />
          <Row k="Monthly estimate" v={formatUSD(r.monthlyEstimate)} />
          <Row k="Net profit" v={`+${formatUSD(r.netProfit).slice(0) }`} hi />
          <Row k="Total return" v={formatUSD(r.totalValue)} />
          <div className="text-[11px] text-fog">Protocol fee {(PROTOCOL_CONFIG.performanceFeeRate * 100).toFixed(0)}% · {formatUSD(r.protocolFee)}</div>
          <Link href={`/register?amount=${r.amount}&term=${r.termDays}`} className="mt-2 block rounded-xl bg-pulse px-4 py-3 text-center text-sm font-bold text-black hover:brightness-110">
            Deploy {formatUSD(r.amount, { decimals: 0 })}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, hi }: { k: string; v: string; hi?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fog">{k}</span>
      <span className={`font-bold ${hi ? 'text-pulse' : ''}`}>{v}</span>
    </div>
  );
}
