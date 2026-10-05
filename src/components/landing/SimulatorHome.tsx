'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PLANS,
  getPlan,
  planForAmount,
  simulatePlanTerm,
  simulationSeries,
  formatUSD,
  type PlanKey,
} from '@/lib/plans';
import { useAnimatedNumber, useInViewOnce, usePrefersReducedMotion } from '@/components/landing/motion';
import { usePlanSync } from '@/components/landing/plan-sync';
import { useT } from '@/components/LanguageProvider';

// Homepage investment simulator on the authoritative plan engine:
// profit = P × r × n (simple, no compounding), total = P + profit,
// principal back at completion. Shares selection state with the module
// cards (single source of truth). Composition follows the reference:
// amount → range → PLAN → rows → description → term strip → divider →
// LANDS IN TOTAL → chart → EARNINGS / PRINCIPAL BACK / EACH PAYOUT.
const MAX_AMOUNT = 50000;

function trimPct(n: number): string {
  return String(parseFloat(n.toFixed(3)));
}

function parseAmount(raw: string): number | null {
  const t = raw.trim().replace(/[$,\s]/g, '');
  if (t === '') return null;
  if (!/^\d+(\.\d{0,2})?$/.test(t)) return NaN;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export function SimulatorHome() {
  const t = useT();
  const { plan: planKey, setPlan } = usePlanSync();
  const [text, setText] = useState('601');
  const [wrapRef, inView] = useInViewOnce<HTMLDivElement>(0.2);
  const reduced = usePrefersReducedMotion();

  const plan = getPlan(planKey) ?? PLANS[1];
  const parsed = parseAmount(text);

  const sim = useMemo(() => {
    if (parsed === null || Number.isNaN(parsed)) return null;
    try {
      return simulatePlanTerm(plan.key, parsed);
    } catch {
      return null;
    }
  }, [plan, parsed]);
  const empty = parsed === null;
  const invalid = !empty && (Number.isNaN(parsed) || sim === null);

  const animTotal = useAnimatedNumber(sim ? sim.totalReturn : 0, inView && !!sim);
  const animEarn = useAnimatedNumber(sim ? sim.totalProfit : 0, inView && !!sim);

  // Amount change: validate, then follow the amount into its plan band.
  const onAmount = (raw: string) => {
    setText(raw.replace(/[^0-9.]/g, '').slice(0, 9));
  };
  const commitPlanForAmount = (raw: string) => {
    const n = parseAmount(raw);
    if (n === null || Number.isNaN(n)) return;
    const match = planForAmount(n);
    if (match && match.key !== planKey) setPlan(match.key);
  };

  // Plan switch: keep the existing normalization — move the amount inside
  // the new plan's band instead of quoting an invalid combination.
  const selectPlan = (key: PlanKey) => {
    const next = getPlan(key) ?? PLANS[1];
    setPlan(key);
    const n = parseAmount(text);
    if (n === null || Number.isNaN(n) || n < next.min || n > next.max) {
      const clamped = Math.min(Math.max(Number.isFinite(n) ? (n as number) : next.min, next.min), next.max);
      setText(String(clamped));
    }
  };

  // Cumulative term series; final point equals totalReturn by construction.
  const series = useMemo(() => (sim ? simulationSeries(sim) : []), [sim]);
  const W = 560;
  const H = 170;
  const P = 10;
  const max = sim ? sim.totalReturn : 1;
  const path = useMemo(() => {
    if (!series.length) return '';
    return series
      .map((v, i) => {
        const x = P + (i / (series.length - 1)) * (W - 2 * P);
        const y = H - P - (v / max) * (H - 2 * P);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [series, max]);
  const endX = W - P;
  const capY = P - 2;
  const gridV = [P + 108, P + 216, P + 324, P + 432];
  const gridH = [P + 38, P + 76, P + 114];

  const dailyLabel = (p: (typeof PLANS)[number]) => t.land.perDayLbl.replace('{p}', trimPct(p.ratePerCredit * p.creditsPerDay * 100));
  const desc = t.land.descLine.replace('{r}', trimPct(plan.ratePerCredit * 100)).replace('{n}', String(plan.payoutsPerTerm)).replace('{h}', String(plan.cycleHours));
  const termLine = t.land.termLine.replace('{n}', String(plan.payoutsPerTerm)).replace('{d}', String(plan.termDays));

  return (
    <div ref={wrapRef} className="sim-root mx-auto mt-8 w-full max-w-[680px]">
      {/* amount */}
      <div className={`sim-amount flex items-center gap-3 rounded-[14px] border bg-[#05080D] px-5 py-4 transition-colors duration-200 sm:py-5 ${
        invalid ? 'border-down/60' : 'border-line-2 focus-within:border-brand/60'
      }`}>
        <span aria-hidden="true" className="font-mono text-[34px] font-bold leading-none text-brand sm:text-[40px]">$</span>
        <input
          value={text}
          onChange={(e) => {
            onAmount(e.target.value);
            commitPlanForAmount(e.target.value);
          }}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          aria-label={t.land.simAmountAria}
          aria-invalid={invalid}
          aria-describedby="sim-range"
          placeholder="0"
          className="w-full min-w-0 bg-transparent font-mono text-[34px] font-bold leading-none text-ink outline-none placeholder:text-t4/50 sm:text-[40px]"
        />
      </div>
      <p id="sim-range" className="mt-2.5 font-mono text-[12px] tracking-wide text-t3">
        {t.land.accepts.replace('{min}', formatUSD(plan.min, { decimals: 0 })).replace('{max}', formatUSD(plan.max, { decimals: 0 }))}
      </p>
      {invalid && (
        <p role="alert" className="mt-1.5 font-mono text-[12px] text-down">
          {t.land.rangeErr.replace('{name}', plan.name).replace('{min}', formatUSD(plan.min, { decimals: 0 })).replace('{max}', formatUSD(plan.max, { decimals: 0 }))}
        </p>
      )}

      {/* plan */}
      <div className="mt-5 font-mono text-[11px] tracking-[0.3em] text-t3">{t.land.planLbl}</div>
      <div className="mt-2.5 space-y-2" role="radiogroup" aria-label={t.land.planGroup}>
        {PLANS.map((p) => {
          const active = p.key === plan.key;
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => selectPlan(p.key)}
              className={`sim-row flex w-full items-center gap-4 rounded-[12px] border px-4 py-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B] ${
                active
                  ? 'border-brand/60 bg-brand-wash shadow-[0_0_24px_rgba(47,214,255,0.12)]'
                  : 'border-line bg-pane hover:border-line-2'
              }`}
            >
              <span
                aria-hidden="true"
                className={`relative h-[22px] w-[38px] shrink-0 rounded-full border transition-colors duration-200 ${
                  active ? 'border-brand/60 bg-brand/20' : 'border-line-2 bg-pane-3'
                }`}
              >
                <span
                  className={`absolute top-1/2 h-[14px] w-[14px] -translate-y-1/2 rounded-full transition-all duration-200 ${
                    active
                      ? 'left-[19px] bg-brand shadow-[0_0_10px_rgba(47,214,255,0.9)]'
                      : 'left-[3px] bg-t4'
                  }`}
                />
              </span>
              <span className={`text-[15px] ${active ? 'font-bold text-white' : 'font-medium text-mist/80'}`}>{p.name}</span>
              <span className={`ml-auto font-mono text-[13px] ${active ? 'font-bold text-brand' : 'text-t3'}`}>
                {dailyLabel(p)}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[12px] leading-relaxed tracking-wide text-t3">{desc}</p>

      {/* term strip */}
      <div className="mt-4 rounded-[12px] border border-line bg-pane/60 p-4">
        <div className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: plan.payoutsPerTerm }).map((_, i) => (
            <span key={i} className="h-[14px] flex-1 rounded-[2px] bg-brand/70 last:shadow-[0_0_8px_rgba(47,214,255,0.8)]" />
          ))}
        </div>
        <p className="mt-2.5 font-mono text-[12px] tracking-wide text-t3">{termLine}</p>
      </div>

      {/* output */}
      <div className="mt-4 border-t border-line pt-5" aria-live="polite">
        <div className="font-mono text-[11px] tracking-[0.3em] text-t3">{t.land.landsTotal}</div>
        <div className="mt-1 font-mono text-[44px] font-bold leading-none tracking-tight text-brand sm:text-[56px]">
          {sim ? formatUSD(animTotal) : <span className="text-t4/60">—</span>}
        </div>

        <div className="sim-chart mt-4 overflow-hidden rounded-[12px] border border-line bg-[#04070C] p-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-40 w-full sm:h-44"
            role="img"
            aria-label={
              sim
                ? t.land.projGrowing.replace('{p}', formatUSD(sim.principal)).replace('{t}', formatUSD(sim.totalReturn)).replace('{n}', String(sim.payoutCount))
                : t.land.projChart
            }
          >
            <defs>
              <linearGradient id="simline" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#2FD6FF" stopOpacity="0.55" />
                <stop offset="1" stopColor="#7FE7FF" />
              </linearGradient>
              <filter id="simglow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {gridV.map((x) => (
              <line key={`v${x}`} x1={x} y1={P} x2={x} y2={H - P} stroke="#1A2231" strokeWidth="1" />
            ))}
            {gridH.map((y) => (
              <line key={`h${y}`} x1={P} y1={y} x2={W - P} y2={y} stroke="#1A2231" strokeWidth="1" />
            ))}
            {sim && (
              <>
                <path d={`${path} L${W - P},${H - P} L${P},${H - P} Z`} fill="#2FD6FF" opacity="0.06" />
                <path
                  key={`${sim.plan}-${sim.amount}`}
                  d={`${path} L${endX},${capY}`}
                  fill="none"
                  stroke="url(#simline)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#simglow)"
                  pathLength={1}
                  strokeDasharray={reduced ? undefined : 1}
                  className={reduced ? undefined : 'sim-draw'}
                />
                <circle cx={endX} cy={capY} r="3.5" fill="#7FE7FF" filter="url(#simglow)" className={reduced ? undefined : 'robot-glow-dot'} />
              </>
            )}
          </svg>
        </div>

        <dl className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-[10px] border border-line bg-pane/60 px-4 py-3">
            <dt className="font-mono text-[11px] tracking-[0.24em] text-t3">{t.land.earnings}</dt>
            <dd className={`font-mono text-[17px] font-bold ${sim ? 'text-up' : 'text-t4/60'}`}>
              {sim ? `+${formatUSD(animEarn)}` : '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-line bg-pane/60 px-4 py-3">
            <dt className="font-mono text-[11px] tracking-[0.24em] text-t3">{t.land.principalBack2}</dt>
            <dd className={`font-mono text-[17px] font-bold ${sim ? 'text-white' : 'text-t4/60'}`}>
              {sim ? formatUSD(sim.principal) : '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-line bg-pane/60 px-4 py-3">
            <dt className="font-mono text-[11px] tracking-[0.24em] text-t3">{t.land.eachPayout2}</dt>
            <dd className={`font-mono text-[17px] font-bold ${sim ? 'text-brand' : 'text-t4/60'}`}>
              {sim ? formatUSD(sim.payoutAmount) : '—'}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[11px] leading-relaxed text-t4">
          {t.land.projNote}
        </p>
        <Link
          href="/calculator"
          className="mt-3 block rounded-[10px] bg-brand py-3 text-center text-sm font-bold text-on-brand transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B]"
        >
          {t.land.openSim}
        </Link>
      </div>
    </div>
  );
}
