'use client';

// Module cards on the authoritative plan engine (lib/plans.ts — the only
// finance source). Data-driven technical module composition: HUD corner
// accents, traveling left-edge telemetry, chip icon, signal bars, daily
// rate, segmented daily-credit rail, semantic spec rows, select CTA.
// Card selection drives the simulator through shared plan-sync state.
// Pointer-tracked radial highlight + scroll-gated entrance choreography.

import { useRef } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { PLANS, quotePlan, examplePlanAmount, formatUSD, formatPct, type PlanDef, type PlanQuote } from '@/lib/plans';
import { useInViewOnce } from '@/components/landing/motion';
import { usePlanSync } from '@/components/landing/plan-sync';
import { useT } from '@/components/LanguageProvider';
import type { Dictionary } from '@/lib/i18n-dict';

const TELEMETRY_SEGS = 12;

function ChipIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="mod-chip h-11 w-11 text-[#2FD6FF]">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <line x1="8" y1="2" x2="8" y2="9" />
        <line x1="16" y1="2" x2="16" y2="9" />
        <line x1="24" y1="2" x2="24" y2="9" />
        <line x1="32" y1="2" x2="32" y2="9" />
        <line x1="8" y1="31" x2="8" y2="38" />
        <line x1="16" y1="31" x2="16" y2="38" />
        <line x1="24" y1="31" x2="24" y2="38" />
        <line x1="32" y1="31" x2="32" y2="38" />
        <line x1="2" y1="8" x2="9" y2="8" />
        <line x1="2" y1="16" x2="9" y2="16" />
        <line x1="2" y1="24" x2="9" y2="24" />
        <line x1="2" y1="32" x2="9" y2="32" />
        <line x1="31" y1="8" x2="38" y2="8" />
        <line x1="31" y1="16" x2="38" y2="16" />
        <line x1="31" y1="24" x2="38" y2="24" />
        <line x1="31" y1="32" x2="38" y2="32" />
      </g>
      <rect x="10" y="10" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="16" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function SignalBars() {
  return (
    <span aria-hidden="true" className="mod-sig flex items-end gap-[3px]">
      <span className="w-[4px] rounded-sm bg-[#2FD6FF]" style={{ height: 8 }} />
      <span className="w-[4px] rounded-sm bg-[#2FD6FF]" style={{ height: 13 }} />
      <span className="w-[4px] rounded-sm bg-[#2FD6FF]" style={{ height: 18 }} />
    </span>
  );
}

function CycleRail({ segments, go }: { segments: number; go: boolean }) {
  return (
    <div className="relative" aria-hidden="true">
      <div className="flex gap-[5px]">
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={`mod-rail-seg h-[9px] flex-1 rounded-[3px] ${i === segments - 1 ? 'bg-[#2FD6FF] shadow-[0_0_12px_rgba(47,214,255,0.7)]' : 'bg-[#1B2940]'}`}
            style={go ? { animationDelay: `${0.15 + i * 0.07}s` } : undefined}
          />
        ))}
      </div>
      {go && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3px]">
          <span className="mod-rail-sweep absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-transparent via-[rgba(165,243,252,0.35)] to-transparent" />
        </div>
      )}
    </div>
  );
}

interface SpecRow {
  label: string;
  value: string;
  tone: 'cyan' | 'amber' | 'green' | 'muted';
}

const TONE: Record<SpecRow['tone'], string> = {
  cyan: 'text-[#2FD6FF]',
  amber: 'text-[#F2BF4A]',
  green: 'text-[#35D98B]',
  muted: 'text-mist',
};

function specRows(plan: PlanDef, q: PlanQuote | null, d: Dictionary): SpecRow[] {
  const t = d.land;
  const v = d.inv;
  return [
    { label: v.planInvest, value: `$${plan.min.toLocaleString()} – $${plan.max.toLocaleString()}`, tone: 'cyan' },
    { label: v.planRate, value: v.perPayout.replace('{p}', formatPct(plan.ratePerCredit * 100)), tone: 'cyan' },
    { label: v.planCycle, value: v.everyHX.replace('{h}', String(plan.cycleHours)), tone: 'amber' },
    { label: v.payoutsL, value: v.perDayX.replace('{n}', String(plan.creditsPerDay)), tone: 'amber' },
    { label: v.termL, value: t.termVD.replace('{p}', String(plan.payoutsPerTerm)).replace('{d}', String(plan.termDays)), tone: 'muted' },
    {
      label: t.estDaily,
      value: q ? `+${formatUSD(q.dailyTotal)} @ ${formatUSD(examplePlanAmount(plan), { decimals: 0 })}` : t.calcNA,
      tone: 'cyan',
    },
    { label: v.principalL, value: t.principalBack, tone: 'green' },
  ];
}

function PlanModuleCard({ plan, index, go, active, onSelect }: {
  plan: PlanDef;
  index: number;
  go: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  // Per-plan valid example amount (never one global sample). Defensive
  // fallback renders honestly instead of crashing the homepage.
  let q: PlanQuote | null = null;
  try {
    q = quotePlan(plan.key, examplePlanAmount(plan));
  } catch {
    q = null;
  }
  const t = useT();
  const cardRef = useRef<HTMLButtonElement>(null);
  const onPointer = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
  };
  const rows = specRows(plan, q, t);
  const dailyPct = formatPct(plan.ratePerCredit * plan.creditsPerDay * 100);

  return (
      <button
      ref={cardRef}
      onClick={onSelect}
      onPointerMove={onPointer}
      aria-pressed={active}
      aria-label={t.inv.selectPlan.replace('{name}', plan.name)}
      className={`mod-card card-sweep group relative block h-full w-full overflow-visible rounded-2xl border bg-gradient-to-b from-[#0D1420] to-[#080C14] p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse sm:p-6 ${
        active ? 'border-pulse/70 shadow-glow' : 'border-line'
      }`}
    >
      {/* HUD corner accents */}
      <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 rounded-tl-md border-l-2 border-t-2 border-[#2FD6FF]/70" />
      <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 rounded-tr-md border-r-2 border-t-2 border-[#2FD6FF]/70" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 rounded-bl-md border-b-2 border-l-2 border-[#2FD6FF]/40" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 h-3.5 w-3.5 rounded-br-md border-b-2 border-r-2 border-[#2FD6FF]/40" />
      {/* traveling left-edge telemetry */}
      <span aria-hidden="true" className="mod-telemetry absolute -left-[7px] top-8 flex flex-col gap-[7px]">
        {Array.from({ length: TELEMETRY_SEGS }, (_, i) => (
          <span key={i} className="block h-[9px] w-[5px] rounded-[1px] bg-[#2FD6FF]" style={{ ['--i' as string]: i }} />
        ))}
      </span>
      {/* pointer-tracked highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(34,211,238,0.09), transparent 45%)' }}
      />
      {/* header */}
      <div className={`relative flex items-start justify-between gap-3 ${go ? 'mod-rise' : 'opacity-0'}`} style={{ animationDelay: `${index * 60}ms` }}>
        <span className="flex items-center gap-3">
          <ChipIcon />
          <span>
            <span className="block font-mono text-[10px] tracking-[0.24em] text-fog">{plan.code}</span>
            <span className="mt-0.5 block text-[19px] font-bold tracking-tight text-white">{plan.name}</span>
          </span>
        </span>
        <SignalBars />
      </div>
      {/* rate */}
      <div className={`relative mt-4 ${go ? 'mod-rise' : 'opacity-0'}`} style={{ animationDelay: `${120 + index * 60}ms` }}>
        <span className="font-mono text-[2.6rem] font-bold leading-none tracking-tight text-white">{dailyPct}</span>
        <span className="ml-2 align-middle font-mono text-[11px] tracking-[0.2em] text-fog">{t.land.aDayUp}</span>
        <p className="mt-1.5 text-[13px] text-fog">{t.land.paidEvery2.replace('{h}', String(plan.cycleHours)).replace('{n}', String(plan.creditsPerDay))}</p>
      </div>
      {/* daily credit rail */}
      <div className={`relative mt-4 ${go ? 'mod-rise' : 'opacity-0'}`} style={{ animationDelay: `${200 + index * 60}ms` }}>
        <CycleRail segments={plan.creditsPerDay} go={go} />
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.18em] text-fog">{t.land.dailyCycle}</p>
      </div>
      {/* spec rows */}
      <dl className="relative mt-3 space-y-0 text-[13px]">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between gap-3 border-t border-white/[0.06] py-2 ${go ? 'mod-rise' : 'opacity-0'}`}
            style={{ animationDelay: `${260 + index * 60 + i * 55}ms` }}
          >
            <dt className="text-fog">{r.label}</dt>
            <dd className={`text-right font-mono font-semibold ${TONE[r.tone]}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
      {/* action */}
      <span
        className={`relative mt-4 flex min-h-[52px] items-center justify-center gap-2 rounded-xl border text-[14px] font-bold transition ${
          active
            ? 'border-pulse/70 bg-pulse text-black'
            : 'border-[#2A394D] bg-[#111722] text-white hover:border-[rgba(47,214,255,0.55)]'
        }`}
      >
        {active ? t.land.selectedB : t.land.selectX.replace('{name}', plan.name)}
        <span aria-hidden="true" className="mod-cta-arrow font-mono">→</span>
      </span>
    </button>
  );
}

export function ModuleCards() {
  const { plan: selectedPlan, setPlan } = usePlanSync();
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.15);

  return (
    <div ref={ref} className={`${inView ? 'mod-go' : ''} mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-4`}>
      {PLANS.map((plan, i) => (
        <Reveal key={plan.key} delay={i * 110}>
          <PlanModuleCard plan={plan} index={i} go={inView} active={selectedPlan === plan.key} onSelect={() => setPlan(plan.key)} />
        </Reveal>
      ))}
    </div>
  );
}

export function ModuleCta() {
  const t = useT();
  return (
    <div className="mt-6 text-center">
      <Link href="/register" className="text-sm text-pulse hover:brightness-110">{t.land.ctaCreate} →</Link>
      <p className="mt-2 text-xs text-fog">{t.land.estNote2}</p>
    </div>
  );
}
