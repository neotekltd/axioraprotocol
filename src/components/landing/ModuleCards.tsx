'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { calculateDeployment, formatUSD, formatPct } from '@/lib/finance';
import { useInViewOnce } from '@/components/landing/motion';

const MODULE_TERMS = [30, 60, 90];
const SAMPLE = 1000;

export const MODULE_TAG: Record<number, string | null> = { 30: null, 60: 'BALANCED', 90: null };

export function ModuleCards() {
  const [selected, setSelected] = useState(1);
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.2);
  const maxRate = calculateDeployment({ amount: SAMPLE, termDays: 90 }).dailyRate;
  return (
    <div ref={ref} className="mt-10 grid gap-4 lg:grid-cols-3">
      {MODULE_TERMS.map((term, i) => {
        const r = calculateDeployment({ amount: SAMPLE, termDays: term });
        const active = selected === i;
        const tag = MODULE_TAG[term];
        return (
          <Reveal key={term} delay={i * 100}>
            <button
              onClick={() => setSelected(i)}
              aria-pressed={active}
              className={`card-sweep block h-full w-full rounded-xl border bg-panel/80 p-5 text-left transition-all duration-200 hover:-translate-y-[2px] ${
                active ? 'border-pulse/70 shadow-glow' : 'border-line hover:border-pulse/50'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-fog">
                <span>M{String(i + 1).padStart(2, '0')} / 03 · TERM MODULE</span>
                {tag ? (
                  <span className="rounded-full border border-pulse/60 bg-pulse/10 px-2 py-0.5 text-[9px] text-pulse">{tag}</span>
                ) : (
                  <span aria-hidden="true" className="text-pulse/70">◈</span>
                )}
              </div>
              <div className="mt-2.5 text-lg font-bold">{term}-Day Module</div>
              <div className="mt-1 font-mono text-[2rem] font-bold leading-none tracking-tight text-white">
                {formatPct(r.dailyRate * 100)}
                <span className="ml-1 align-middle text-[11px] font-normal text-fog">/day model</span>
              </div>
              <div className="relative mt-3.5 h-[3px] overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
                <div
                  className={`boot-line h-full rounded-full bg-gradient-to-r from-pulseDim via-pulse to-pulseBright ${inView ? 'go' : ''}`}
                  style={{ width: `${Math.round((r.dailyRate / maxRate) * 100)}%` }}
                />
                <span className={`signal-x ${inView ? '' : '[animation-play-state:paused]'}`} style={{ animationDuration: '4s' }} />
              </div>
              <dl className="mt-3.5 space-y-[5px] text-xs">
                {[
                  ['Minimum', `$${PROTOCOL_CONFIG.minDeployment.toLocaleString()}`],
                  ['Maximum', `$${PROTOCOL_CONFIG.maxDeployment.toLocaleString()}`],
                  ['Rate', `${formatPct(r.dailyRate * 100)} / day model`],
                  ['Cycle', 'Daily'],
                  ['Payouts', 'At maturity'],
                  ['Term', `${term} days`],
                  ['Modeled', `+${formatUSD(calculateDeployment({ amount: SAMPLE, termDays: term }).netProfit)} / $1k`],
                  ['Principal', 'Reserved for term'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="text-fog">{k}</dt>
                    <dd className="font-mono text-mist">{v}</dd>
                  </div>
                ))}
              </dl>
              <span className={`mt-4 block rounded-md py-2.5 text-center text-[13px] font-bold transition ${active ? 'bg-pulse text-black' : 'bg-white/[0.06] text-white hover:bg-pulse hover:text-black'}`}>
                {active ? 'Selected' : `Select — ${term}d`}
              </span>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}

// Whole card is a button that also navigates: wrap CTA separately for a11y.
export function ModuleCta() {
  return (
    <div className="mt-6 text-center">
      <Link href="/register" className="text-sm text-pulse hover:brightness-110">Create an account to activate a module →</Link>
      <p className="mt-2 text-xs text-fog">Estimates only. Confirmation re-quotes server-side. No yield is guaranteed.</p>
    </div>
  );
}
