// Invest-hub plan cards (Axiora-native). Every figure derives from the
// central plan config — daily % = ratePerCredit x creditsPerDay, ranges,
// cycle, per-day credit count. Axiora deployments are open-ended
// (term_days/matures_at/payouts_total NULL by migration 0008/0016), so the
// rows state that honestly instead of a fixed term/count/total.

import { examplePlanAmount, formatUSD, PLANS, type PlanDef, type PlanKey } from '@/lib/plans';
import { useT } from '@/components/LanguageProvider';
import type { Dictionary } from '@/lib/i18n-dict';
import { cn } from '@/lib/utils';

// Trim float noise: 1, 1.5, 2 — never 1.4999999.
function trimPct(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function dailyPct(p: PlanDef): string {
  return trimPct(p.ratePerCredit * p.creditsPerDay * 100);
}

export function perPayoutPct(p: PlanDef): string {
  return trimPct(p.ratePerCredit * 100);
}

export function rangeLabel(p: PlanDef): string {
  return `${formatUSD(p.min, { decimals: 0 })} – ${formatUSD(p.max, { decimals: 0 })}`;
}

// Illustrative per-payout credit on the plan's example amount (real engine
// math: example x ratePerCredit), always labeled with that amount.
export function exampleCredit(p: PlanDef): { example: number; credit: number } {
  const example = examplePlanAmount(p);
  return { example, credit: Math.round(example * p.ratePerCredit * 100) / 100 };
}

// Original Axiora module glyph: dark housing + ascending signal bars.
export function ModuleIcon({ index }: { index: number }) {
  const bars = [10, 15, 20];
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="34" height="34" rx="10" fill="#101724" stroke="#2A394D" strokeWidth="1.5" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={10 + i * 6}
          y={24 - h}
          width="3.6"
          height={h}
          rx="1.8"
          fill="#2FD6FF"
          opacity={i <= index ? 1 : 0.35}
        />
      ))}
    </svg>
  );
}

// Segmented settlement strip: one segment per daily credit (data-driven,
// never a fabricated payout total). The final segment carries the cyan edge.
export function CreditStrip({ segments }: { segments: number }) {
  const t = useT();
  return (
    <div
      className="mt-3 flex gap-[3px]"
      role="img"
      aria-label={t.inv.settles.replace('{n}', String(segments))}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            'h-[7px] flex-1 rounded-[2px] border',
            i === segments - 1
              ? 'border-[rgba(47,214,255,0.65)] bg-[rgba(47,214,255,0.22)] shadow-[0_0_10px_rgba(47,214,255,0.35)]'
              : 'border-[#242E40] bg-[#151B27]'
          )}
        />
      ))}
    </div>
  );
}

export interface PlanRow {
  label: string;
  value: string;
  tone: 'cyan' | 'amber' | 'green';
}

const TONE: Record<PlanRow['tone'], string> = {
  cyan: 'text-[#2FD6FF]',
  amber: 'text-[#F2BF4A]',
  green: 'text-[#35D98B]',
};

export function planRows(p: PlanDef, t: Dictionary['inv']): PlanRow[] {
  const { example, credit } = exampleCredit(p);
  return [
    { label: t.planInvest, value: rangeLabel(p), tone: 'cyan' },
    { label: t.planRate, value: t.perPayout.replace('{p}', perPayoutPct(p)), tone: 'cyan' },
    { label: t.planCycle, value: t.everyHX.replace('{h}', String(p.cycleHours)), tone: 'amber' },
    { label: t.payoutsL, value: t.perDayX.replace('{n}', String(p.creditsPerDay)), tone: 'amber' },
    { label: t.termL, value: t.openEnded, tone: 'amber' },
    { label: t.onXL.replace('{x}', formatUSD(example, { decimals: 0 })), value: t.perPayoutV.replace('{c}', formatUSD(credit)), tone: 'green' },
    { label: t.principalL, value: t.staysDeployed, tone: 'green' },
  ];
}

export function PlanCard({
  plan,
  index,
  selected,
  onSelect,
  onInvest,
}: {
  plan: PlanDef;
  index: number;
  selected: boolean;
  onSelect: (key: PlanKey) => void;
  onInvest: (key: PlanKey) => void;
}) {
  const t = useT();
  return (
    <article
      aria-label={t.inv.planAria.replace('{name}', plan.name)}
      className={cn(
        'rounded-2xl border bg-[#0E141E] p-5 transition-colors duration-200',
        selected ? 'border-[rgba(47,214,255,0.55)] shadow-[0_0_24px_rgba(47,214,255,0.12)]' : 'border-[#202A3A]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ModuleIcon index={index} />
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#78859A]">{plan.code}</div>
            <div className="truncate text-[17px] font-bold text-white">{plan.name}</div>
          </div>
        </div>
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={t.inv.selectPlan.replace('{name}', plan.name)}
          onClick={() => onSelect(plan.key)}
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-200',
            selected ? 'border-[rgba(47,214,255,0.7)] bg-[rgba(47,214,255,0.08)]' : 'border-[#2A394D] hover:border-[rgba(47,214,255,0.4)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'grid h-5 w-5 place-items-center rounded-full border',
              selected ? 'border-[#2FD6FF]' : 'border-[#3A4A61]'
            )}
          >
            {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#2FD6FF] shadow-[0_0_8px_rgba(47,214,255,0.8)]" />}
          </span>
        </button>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn('font-mono text-[40px] font-bold leading-none tracking-tight', index === 2 ? 'text-[#2FD6FF]' : 'text-white')}>
          {dailyPct(plan)}%
        </span>
        <span className="text-[14px] text-[#78859A]">{t.inv.aDay}</span>
      </div>
      <p className="mt-1.5 text-[13px] text-[#78859A]">{t.inv.paidEvery.replace('{h}', String(plan.cycleHours)).replace('{n}', String(plan.creditsPerDay))}</p>

      <CreditStrip segments={plan.creditsPerDay} />

      <dl className="mt-3 divide-y divide-[#1A2231]">
        {planRows(plan, t.inv).map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="shrink-0 text-[14px] text-[#78859A]">{r.label}</dt>
            <dd className={cn('text-right font-mono text-[13px] font-bold', TONE[r.tone])}>{r.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => onInvest(plan.key)}
        className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] shadow-[0_0_24px_rgba(47,214,255,0.22)] transition duration-200 hover:brightness-110 active:scale-[0.99]"
      >
        {t.inv.investBtn} <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

export function ChoosePlanSection({
  selected,
  onSelect,
  onInvest,
  panel,
}: {
  selected: PlanKey | null;
  onSelect: (key: PlanKey) => void;
  onInvest: (key: PlanKey) => void;
  panel: React.ReactNode;
}) {
  const t = useT();
  return (
    <section aria-label={t.inv.choosePlan} className="mt-4 rounded-2xl border border-[#202A3A] bg-[#0B0F16] p-4 shadow-[inset_0_0_0_1px_rgba(47,214,255,0.06)] sm:p-5">
      <div className="flex items-center gap-2.5 px-1 pb-4">
        <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-[8px] border border-[rgba(47,214,255,0.5)] bg-[rgba(47,214,255,0.07)] font-mono text-[13px] font-bold text-[#2FD6FF]">
          1
        </span>
        <h2 className="text-[18px] font-bold tracking-tight text-white">{t.inv.choosePlan}</h2>
      </div>
      <div className="space-y-3" role="radiogroup" aria-label={t.inv.plansGroup}>
        {PLANS.map((p, i) => (
          <PlanCard
            key={p.key}
            plan={p}
            index={i}
            selected={selected === p.key}
            onSelect={onSelect}
            onInvest={onInvest}
          />
        ))}
      </div>
      {panel}
    </section>
  );
}
