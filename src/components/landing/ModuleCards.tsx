'use client';

// Module cards on the authoritative plan engine (lib/plans.ts — the only
// finance source). Card selection drives the simulator through shared state.
// Pointer-tracked radial highlight + staged telemetry draw on viewport entry.

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { PLANS, quotePlan, examplePlanAmount, formatUSD, formatPct, type PlanQuote } from '@/lib/plans';
import { useInViewOnce } from '@/components/landing/motion';
import { usePlanSync } from '@/components/landing/plan-sync';

const SAMPLE = 1000;

export function ModuleCards() {
  const { plan: selectedPlan, setPlan } = usePlanSync();
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.2);
  const maxRate = PLANS[PLANS.length - 1].ratePerCredit;

  const onPointer = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} className="mt-10 grid gap-4 lg:grid-cols-3">
      {PLANS.map((plan, i) => {
        // Per-plan valid example amount (never one global sample). Defensive
        // fallback renders honestly instead of crashing the homepage.
        let q: PlanQuote | null = null;
        try {
          q = quotePlan(plan.key, examplePlanAmount(plan));
        } catch {
          q = null;
        }
        const active = selectedPlan === plan.key;
        return (
          <Reveal key={plan.key} delay={i * 100}>
            <button
              onClick={() => setPlan(plan.key)}
              onPointerMove={onPointer}
              aria-pressed={active}
              className={`card-sweep group relative block h-full w-full rounded-xl border bg-panel/80 p-5 text-left transition-all duration-200 hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse ${
                active ? 'border-pulse/70 shadow-glow' : 'border-line hover:border-pulse/50'
              }`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(34,211,238,0.09), transparent 45%)' }}
              />
              <div className="relative flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-fog">
                <span>{plan.code} · FIXED MODULE</span>
                <span aria-hidden="true" className="text-pulse/70">◈</span>
              </div>
              <div className="relative mt-2.5 text-lg font-bold">{plan.name}</div>
              <div className="relative mt-1 font-mono text-[2rem] font-bold leading-none tracking-tight text-white">
                {formatPct(plan.ratePerCredit * 100)}
                <span className="ml-1 align-middle text-[11px] font-normal text-fog">every 6h</span>
              </div>
              <div className="relative mt-3.5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
                <div
                  className={`boot-line h-full rounded-full bg-gradient-to-r from-pulseDim via-pulse to-pulseBright ${inView ? 'go' : ''}`}
                  style={{ width: `${Math.round((plan.ratePerCredit / maxRate) * 100)}%` }}
                />
              </div>
              <dl className="relative mt-3.5 space-y-[5px] text-xs">
                {[
                  ['Invest', `$${plan.min.toLocaleString()} – $${plan.max.toLocaleString()}`],
                  ['Rate', `${formatPct(plan.ratePerCredit * 100)} per payout`],
                  ['Cycle', 'Every 6 hours'],
                  ['Payouts', '4 per day'],
                  ['Est. daily', q ? `+${formatUSD(q.dailyTotal)} @ ${formatUSD(examplePlanAmount(plan), { decimals: 0 })}` : 'Calculation unavailable'],
                  ['Principal', 'Returned at maturity'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="text-fog">{k}</dt>
                    <dd className="font-mono text-mist">{v}</dd>
                  </div>
                ))}
              </dl>
              <span className={`relative mt-4 block rounded-md py-2.5 text-center text-[13px] font-bold transition ${active ? 'bg-pulse text-black' : 'bg-white/[0.06] text-white hover:bg-pulse hover:text-black'}`}>
                {active ? 'Selected' : `Select — ${plan.name}`}
              </span>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}

export function ModuleCta() {
  return (
    <div className="mt-6 text-center">
      <Link href="/register" className="text-sm text-pulse hover:brightness-110">Create an account to activate a module →</Link>
      <p className="mt-2 text-xs text-fog">Estimates only. Confirmation re-quotes server-side. No yield is guaranteed.</p>
    </div>
  );
}
