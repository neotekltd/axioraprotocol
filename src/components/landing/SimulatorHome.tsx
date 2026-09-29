'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateDeployment, formatUSD, formatPct } from '@/lib/finance';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { useAnimatedNumber, useInViewOnce, usePrefersReducedMotion } from '@/components/landing/motion';

const TERMS = [30, 60, 90];

// Homepage simulator: same finance.ts arithmetic as /calculator (one source
// of truth), rendered in the reference's control-left / result-right
// composition with interpolated numbers and a drawn projection curve.
export function SimulatorHome() {
  const [amount, setAmount] = useState(681);
  const [termIdx, setTermIdx] = useState(1);
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>(0.2);
  const reduced = usePrefersReducedMotion();

  const r = useMemo(
    () => calculateDeployment({ amount, termDays: TERMS[termIdx] }),
    [amount, termIdx]
  );
  const animTotal = useAnimatedNumber(r.totalValue, inView);
  const animNet = useAnimatedNumber(r.netProfit, inView);

  // Deterministic daily projection series (linear model, same math).
  const series = useMemo(() => {
    const pts: number[] = [];
    const daily = r.amount * r.dailyRate * (1 - PROTOCOL_CONFIG.performanceFeeRate);
    for (let d = 0; d <= r.termDays; d += Math.max(1, Math.floor(r.termDays / 40))) {
      pts.push(r.amount + daily * d);
    }
    return pts;
  }, [r]);
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
  const last = series[series.length - 1];

  const inputCls = 'w-full rounded-lg border border-line bg-void px-4 py-3 font-mono text-sm text-white outline-none focus:border-pulse/60';

  return (
    <div ref={wrapRef} className="mt-8 grid gap-4 rounded-xl border border-line bg-panel/70 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <label htmlFor="sim-amount" className="font-mono text-[10px] tracking-[0.25em] text-fog">AMOUNT · USDT</label>
        <input
          id="sim-amount" type="number" min={PROTOCOL_CONFIG.minDeployment} max={PROTOCOL_CONFIG.maxDeployment}
          value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          className={`mt-2 ${inputCls}`}
        />
        <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-fog">MODULE</div>
        <div className="mt-2 space-y-2" role="radiogroup" aria-label="Module">
          {TERMS.map((t, i) => {
            const active = i === termIdx;
            const rr = calculateDeployment({ amount: SAMPLE_FALLBACK(amount), termDays: t });
            return (
              <button
                key={t} role="radio" aria-checked={active} onClick={() => setTermIdx(i)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${
                  active ? 'border-pulse/70 bg-pulse/[0.07]' : 'border-line hover:border-pulse/40'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-pulse shadow-[0_0_8px_1px_rgba(34,211,238,0.8)]' : 'bg-white/20'}`} aria-hidden="true" />
                  <span className={active ? 'font-bold text-white' : 'text-mist/80'}>{t}-Day Module</span>
                </span>
                <span className="font-mono text-xs text-fog">{formatPct(rr.dailyRate * 100)}/day</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-fog">Same arithmetic as the public calculator. Binding quotes are server-side at confirmation.</p>
      </div>
      <div className="rounded-lg border border-line bg-void/70 p-4 sm:p-5" aria-live="polite">
        <div className="font-mono text-[10px] tracking-[0.25em] text-fog">PROJECTED TOTAL · {r.termDays}D</div>
        <div className="mt-1 font-mono text-5xl font-bold tracking-tight text-pulse sm:text-6xl">
          {formatUSD(animTotal)}
        </div>
        <svg viewBox="0 0 560 150" className="mt-3 h-32 w-full sm:h-36" role="img" aria-label="Projected growth curve">
          <defs>
            <linearGradient id="simfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L560,150 L0,150 Z`} fill="url(#simfill)" />
          <path
            d={path} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1}
            strokeDashoffset={inView || reduced ? 0 : 1}
            style={reduced ? undefined : { transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
          />
          <circle cx="552" cy={(150 - 8 - ((last - min) / Math.max(1e-9, max - min)) * (150 - 16)).toFixed(1)} r="4" fill="#22D3EE" className="pulse-node" />
        </svg>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            ['EARNINGS', `+${formatUSD(animNet)}`],
            ['PRINCIPAL', formatUSD(r.amount)],
            ['PER DAY', formatUSD(r.dailyYield)],
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

function SAMPLE_FALLBACK(v: number) {
  return v > 0 ? v : 1000;
}
