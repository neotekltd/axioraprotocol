'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PLANS, getPlan, quotePlan, formatUSD, formatPct, type PlanKey } from '@/lib/plans';

export function CalculatorWidget({ compact = false }: { compact?: boolean }) {
  const [amount, setAmount] = useState(1000);
  const [planKey, setPlanKey] = useState<PlanKey>('premium');
  const plan = getPlan(planKey) ?? PLANS[1];
  const selectPlan = (key: PlanKey) => {
    const next = getPlan(key) ?? PLANS[1];
    setPlanKey(key);
    setAmount((a) => Math.min(Math.max(a || next.min, next.min), next.max));
  };
  const q = useMemo(() => {
    try {
      return quotePlan(plan.key, amount);
    } catch {
      return null;
    }
  }, [plan, amount]);

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Model your returns</h3>
        <span className="text-[10px] tracking-widest text-fog border border-line rounded-full px-2.5 py-1">INSTANT ESTIMATE</span>
      </div>
      <div className={`mt-6 grid gap-6 ${compact ? '' : 'md:grid-cols-2'}`}>
        <div className="space-y-6">
          <div>
            <div className="text-sm text-fog">Module</div>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Module">
              {PLANS.map((p) => (
                <button
                  key={p.key} role="radio" aria-checked={p.key === planKey} onClick={() => selectPlan(p.key)}
                  className={`rounded-xl border px-4 py-2 text-sm transition ${p.key === planKey ? 'border-pulse/60 bg-pulse/10 font-bold text-pulse' : 'border-line hover:border-pulse/50'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-fog">{plan.name} accepts {formatUSD(plan.min, { decimals: 0 })} – {formatUSD(plan.max, { decimals: 0 })}.</div>
          </div>
          <div>
            <div className="flex justify-between text-sm"><span className="text-fog">Capital</span><span className="font-semibold">{formatUSD(Math.max(0, amount), { decimals: 0 })}</span></div>
            <input type="range" min={plan.min} max={plan.max} step={1} value={Math.min(Math.max(amount, plan.min), plan.max)} onChange={(e) => setAmount(Number(e.target.value))} className="mt-3 w-full accent-[#22D3EE]" aria-label="Capital" />
            <input
              type="number" min={plan.min} max={plan.max} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full rounded-xl border border-line bg-void px-4 py-2.5 text-sm outline-none focus:border-pulse" aria-label="Capital amount"
            />
          </div>
          <p className="text-[11px] text-fog leading-relaxed">Frontend estimate only ({formatPct(plan.ratePerCredit * 100)} per 6h credit, 4 credits/day). Deployment confirmation recalculates server-side via <code>/api/deployments/quote</code>. No yield is guaranteed.</p>
        </div>
        <div className="rounded-2xl border border-line bg-void/60 p-5 space-y-3" aria-live="polite">
          {q ? (
            <>
              <Row k="Each payout" v={formatUSD(q.creditPerPayout)} hi />
              <Row k="Daily total (4×)" v={formatUSD(q.dailyTotal)} hi />
              <Row k="Principal back" v={formatUSD(q.principal)} />
              <Row k="Lands in total (1 day)" v={formatUSD(q.totalWithPrincipal)} />
              <Link href="/register" className="mt-2 block rounded-xl bg-pulse px-4 py-3 text-center text-sm font-bold text-black hover:brightness-110">
                Deploy {formatUSD(q.amount, { decimals: 0 })}
              </Link>
            </>
          ) : (
            <p role="alert" className="text-sm text-fog">Enter an amount within {plan.name} range ({formatUSD(plan.min, { decimals: 0 })} – {formatUSD(plan.max, { decimals: 0 })}) to see the projection.</p>
          )}
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
