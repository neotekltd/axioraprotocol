// My-investments view: one compact line-card per live investment (every
// payout so far + earned back, from authoritative server props), past
// deployments when nothing is live, and the spacious empty state with an
// original Axiora module-robot decoration when the user has none.

import Link from 'next/link';
import { deploymentLabel, formatUSD, formatPct } from '@/lib/plans';
import { useT } from '@/components/LanguageProvider';
import { stWord } from '@/lib/i18n-dict';
import { PayoutCountdown } from '@/components/ax/active-plan';
import type { ActivePlan, Deployment } from '@/lib/queries';

// Original Axiora decoration: small module bot (housing + cyan eyes +
// antenna), pure CSS, partially cropped by its frame like the reference
// composition. Decorative only.
export function ModuleBot() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative mx-auto -mb-8 h-28 w-44 overflow-hidden">
      <div className="absolute bottom-2 left-1/2 h-20 w-28 -translate-x-1/2 rounded-[22px] border border-[#2A394D] bg-[#141B28] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-4 left-1/2 h-4 w-[2px] -translate-x-1/2 bg-[#2A394D]" />
        <div className="absolute -top-[22px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#2FD6FF] shadow-[0_0_12px_rgba(47,214,255,0.9)]" />
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-[14px] border border-[#202A3A] bg-[#080B12] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.9)]" />
          <span className="h-3 w-3 rounded-full bg-[#2FD6FF] shadow-[0_0_10px_rgba(47,214,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

function InvestmentRow({ plan }: { plan: ActivePlan }) {
  const t = useT();
  return (
    <li className="rounded-2xl border border-[#202A3A] bg-[#0E141E] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#78859A]">{plan.ref}</div>
          <div className="truncate text-[17px] font-bold text-white">{plan.planName}</div>
        </div>
        <span className="shrink-0 rounded-full border border-[rgba(53,217,139,0.5)] bg-[rgba(53,217,139,0.1)] px-3 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-[#35D98B]">
          {stWord(t, plan.status).toUpperCase()}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-[#1A2231] pt-3">
        <div>
          <dt className="text-[12px] text-[#78859A]">{t.inv.investedC}</dt>
          <dd className="mt-0.5 font-mono text-[15px] font-bold text-white">{formatUSD(plan.amount)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-[#78859A]">{t.inv.paidBack}</dt>
          <dd className="mt-0.5 font-mono text-[15px] font-bold text-[#35D98B]">{formatUSD(plan.earnedTotal)}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-[#78859A]">{t.inv.payoutsC}</dt>
          <dd className="mt-0.5 font-mono text-[15px] font-bold text-white">
            {plan.payoutsCompleted}{plan.payoutsTotal != null ? ` / ${plan.payoutsTotal}` : ''}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-[12px] border border-[#202A3A] bg-[#080B12] px-4 py-3">
        <span className="text-[13px] text-[#78859A]">
          {formatPct(plan.ratePerCredit * 100)} {t.inv.everyH.replace('{h}', String(plan.cycleHours))} · {t.inv.nextLbl.replace('{x}', formatUSD(plan.nextCredit))}
        </span>
        <Link href="/app/deployments" className="shrink-0 text-[13px] font-bold text-[#2FD6FF] hover:brightness-110">
          {t.inv.details}
        </Link>
      </div>
      <div className="mt-3">
        <PayoutCountdown nextPayoutAt={plan.nextPayoutAt} />
      </div>
    </li>
  );
}

export function InvestmentsView({
  activePlans,
  deployments,
  onStartPlan,
}: {
  activePlans: ActivePlan[];
  deployments: Deployment[];
  onStartPlan: () => void;
}) {
  const t = useT();
  if (activePlans.length === 0 && deployments.length === 0) {
    return (
      <section aria-label={t.inv.noInvAria} className="mt-4 overflow-hidden rounded-2xl border border-[#202A3A] bg-[#0B0F16] px-6 pb-0 pt-12 text-center">
        <h2 className="text-[20px] font-bold tracking-tight text-white">{t.inv.noInvT}</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#AAB5C7]">
          {t.inv.noInvB}
        </p>
        <button
          type="button"
          onClick={onStartPlan}
          className="mt-6 inline-flex min-h-[52px] items-center rounded-[14px] bg-[#2FD6FF] px-8 text-[15px] font-bold text-[#06121A] shadow-[0_0_24px_rgba(47,214,255,0.25)] transition duration-200 hover:brightness-110 active:scale-[0.99]"
        >
          {t.inv.startPlan}
        </button>
        <div className="mt-8">
          <ModuleBot />
        </div>
      </section>
    );
  }

  return (
    <div className="mt-4">
      {activePlans.length > 0 ? (
        <ul className="space-y-3">
          {activePlans.map((p) => (
            <InvestmentRow key={p.id} plan={p} />
          ))}
        </ul>
      ) : (
        <section aria-label={t.inv.pastAria} className="rounded-2xl border border-[#202A3A] bg-[#0B0F16] p-5">
          <h2 className="text-[16px] font-bold text-white">{t.inv.pastT}</h2>
          <p className="mt-1 text-[14px] text-[#AAB5C7]">{t.inv.pastB}</p>
          <ul className="mt-4 divide-y divide-[#1A2231]">
            {deployments.slice(0, 10).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <div className="min-w-0">
                  <span className="font-bold text-white">{deploymentLabel({ plan: d.plan, termDays: d.termDays })}</span>
                  <span className="ml-2 font-mono text-[12px] text-[#78859A]">{d.ref}</span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono font-bold text-white">{formatUSD(d.amount)}</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">{stWord(t, d.status)}</div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onStartPlan}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2FD6FF] text-[15px] font-bold text-[#06121A] transition hover:brightness-110 active:scale-[0.99]"
          >
            {t.inv.startPlan}
          </button>
        </section>
      )}
    </div>
  );
}
