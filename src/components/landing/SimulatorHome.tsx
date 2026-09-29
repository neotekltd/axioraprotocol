'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PLANS, getPlan, quotePlan, formatUSD, formatPct, type PlanKey } from '@/lib/plans';
import { useAnimatedNumber, useInViewOnce, usePrefersReducedMotion } from '@/components/landing/motion';
import { usePlanSync } from '@/components/landing/plan-sync';

// Homepage simulator on the authoritative plan engine: credit =
// capital × ratePerCredit, 4 credits per 24h. Shares selection state with
// the module cards (single source of truth). Animated numbers + drawn curve.
const CREDITS_SHOWN = 28;

export function SimulatorHome() {
  const { plan: planKey, setPlan } = usePlanSync();
  const [amount, setAmount] = useState(681);
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>(0.2);
  const reduced = usePrefersReducedMotion();

  const plan = getPlan(planKey) ?? PLANS[1];
  // UI-range normalization on plan switch: move the amount inside the new
  // plan's valid range instead of calling quotePlan with an invalid amount.
  const selectPlan = (key: PlanKey) => {
    const next = getPlan(key) ?? PLANS[1];
    setPlan(key);
    setAmount((a) => Math.min(Math.max(a || next.min, next.min), next.max));
  };
  const valid = amount >= plan.min && amount <= plan.max;
  const q = useMemo(() => {
    try {
      return quotePlan(plan.key, amount);
    } catch {
      return null;
    }
  }, [plan, amount]);

  const animTotal = useAnimatedNumber(q ? q.totalWithPrincipal : 0, inView);
  const animEarn = useAnimatedNumber(q ? q.dailyTotal : 0, inView);

  // Deterministic 28-credit projection series (linear, same math).
  const series = useMemo(() => {
    if (!q) return [0];
    const pts: number[] = [q.amount];
    for (let c = 1; c <= CREDITS_SHOWN; c++) pts.push(q.amount + q.creditPerPayout * c);
    return pts;
  }, [q]);
  const max = Math.max(...series);
  const min = Math.min(...series);
  const path = useMemo(() => {
    const W = 560, H = 150, P = 8;
    return series
      .map((v, i) => {
        const x = P + (i / (series.length - 1)) * (W - 2 * P);
        const y = H - P - ((v - min) / Math.max(1e-9, max - min)) * (H - 2 * P);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [series, max, min]);
  const lastY = (150 - 8 - ((series[series.length - 1] - min) / Math.max(1e-9, max - min)) * (150 - 16)).toFixed(1);

  const inputCls = 'w-full rounded-lg border border-line bg-void px-4 py-3 font-mono text-sm text-white outline-none focus:border-pulse/60';

  const onAmount = (raw: string) => {
    const n = Number(raw);
    setAmount(raw === '' ? 0 : Number.isFinite(n) ? Math.max(0, Math.min(50000, n)) : 0);
  };

  return (
    <div ref={wrapRef} className="mt-8 grid gap-4 rounded-xl border border-line bg-panel/70 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <label htmlFor="sim-amount" className="font-mono text-[10px] tracking-[0.25em] text-fog">AMOUNT · USDT</label>
        <input
          id="sim-amount" type="number" min={plan.min} max={plan.max}
          value={amount === 0 ? '' : amount} onChange={(e) => onAmount(e.target.value)}
          className={`mt-2 ${inputCls}`}
        />
        {!valid && amount !== 0 && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {plan.name} accepts {formatUSD(plan.min, { decimals: 0 })} – {formatUSD(plan.max, { decimals: 0 })}.
          </p>
        )}
        <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-fog">MODULE</div>
        <div className="mt-2 space-y-2" role="radiogroup" aria-label="Module">
          {PLANS.map((p) => {
            const active = p.key === plan.key;
            return (
              <button
                key={p.key} role="radio" aria-checked={active} onClick={() => selectPlan(p.key)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse ${
                  active ? 'border-pulse/70 bg-pulse/[0.07]' : 'border-line hover:border-pulse/40'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-pulse shadow-[0_0_8px_1px_rgba(34,211,238,0.8)]' : 'bg-white/20'}`} aria-hidden="true" />
                  <span className={active ? 'font-bold text-white' : 'text-mist/80'}>{p.name}</span>
                </span>
                <span className="font-mono text-xs text-fog">{formatPct(p.ratePerCredit * 100)}/6h</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-fog">Same engine as the public calculator. Binding quotes are server-side at confirmation.</p>
      </div>
      <div className="rounded-lg border border-line bg-void/70 p-4 sm:p-5" aria-live="polite">
        <div className="font-mono text-[10px] tracking-[0.25em] text-fog">LANDS IN TOTAL · {plan.name.toUpperCase()}</div>
        <div className="mt-1 font-mono text-5xl font-bold tracking-tight text-pulse sm:text-6xl">
          {q ? formatUSD(animTotal) : formatUSD(0)}
        </div>
        <svg viewBox="0 0 560 150" className="mt-3 h-32 w-full sm:h-36" role="img" aria-label="Projected credit curve">
          <defs>
            <linearGradient id="simfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
            </linearGradient>
          </defs>
          {q && <path d={`${path} L560,150 L0,150 Z`} fill="url(#simfill)" />}
          {q && (
            <path
              d={path} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinejoin="round"
              pathLength={1} strokeDasharray={1}
              strokeDashoffset={inView || reduced ? 0 : 1}
              style={reduced ? undefined : { transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
            />
          )}
          {q && <circle cx="552" cy={lastY} r="4" fill="#22D3EE" className="pulse-node" />}
        </svg>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            ['EARNINGS', q ? `+${formatUSD(animEarn)}` : '—'],
            ['PRINCIPAL BACK', q ? formatUSD(q.principal) : '—'],
            ['EACH PAYOUT', q ? formatUSD(q.creditPerPayout) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line bg-panel px-2 py-3">
              <dt className="font-mono text-[9px] tracking-[0.2em] text-fog">{k}</dt>
              <dd className="mt-1 truncate font-mono text-sm font-bold text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <Link href="/calculator" className="mt-4 block rounded-lg bg-pulse py-3 text-center text-sm font-bold text-black transition hover:brightness-110">
          Open full simulator
        </Link>
      </div>
    </div>
  );
}
