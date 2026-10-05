import { BalanceHeroCard, OnboardingStepsCard, PlanCard, ReferralSummaryCard } from '@/components/ax/dashboard';
import { ActivePlanCard } from '@/components/ax/active-plan';
import { AxCard, SectionHeader } from '@/components/ax/primitives';
import { SITE_URL, PROTOCOL_CONFIG } from '@/lib/config';
import {
  getSessionUser, getProfile, getPortfolioSummary, getReferrals, getReferralEarnings,
  getActivePlans,
} from '@/lib/queries';
import { ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const t = getDict();
  const [user, profile, summary, referrals, earnings, activePlans] = await Promise.all([
    getSessionUser(), getProfile(), getPortfolioSummary(), getReferrals(), getReferralEarnings(),
    getActivePlans(),
  ]);
  const earning = summary.profitCredited + summary.referralCredited;
  const firstName = profile?.displayName || user?.email?.split('@')[0] || 'there';
  const link = profile ? `${SITE_URL}/register?ref=${profile.referralCode}` : null;
  const referralTotal = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-white sm:text-[24px]">
          {t.dashboard.welcome.replace('{name}', firstName)}
        </h1>
        <p className="mt-1 text-[14px] text-[#AAB5C7]">{t.dashboard.readySub}</p>
      </div>

      <BalanceHeroCard
        total={summary.totalValue}
        available={summary.available}
        earning={earning}
        invested={summary.deployedActive}
        hasDeposits={summary.deposited > 0}
      />

      <OnboardingStepsCard doneDeposited={summary.deposited > 0} doneDeployed={summary.deployedActive > 0} />

      {activePlans.length > 0 && (
        <section aria-label={t.dashboard.activePlans}>
          <SectionHeader title={`${t.dashboard.activePlans} · ${activePlans.length}`} />
          <div className="mt-4 space-y-4">
            {activePlans.map((p) => (
              <ActivePlanCard key={p.id} plan={p} />
            ))}
          </div>
        </section>
      )}

      <AxCard className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#2A394D] bg-[#151B27] text-[#AAB5C7]">
              <Layers size={20} />
            </span>
            <h2 className="text-[24px] font-bold tracking-tight text-white">{t.dashboard.plans}</h2>
          </div>
          <Link href="/app/deploy" className="flex items-center gap-1 text-[14px] text-[#AAB5C7] hover:text-white">{t.dashboard.compare} <ArrowRight size={15} /></Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(['essential', 'premium', 'exclusive'] as const).map((key) => (
            <PlanCard key={key} planKey={key} />
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-[#596579]">{t.dashboard.ratesNote}</p>
      </AxCard>

      <ReferralSummaryCard link={link} count={referrals.length} earned={referralTotal} />

      <AxCard className="flex items-center justify-between p-5">
        <div className="text-[14px] text-[#AAB5C7]">{t.dashboard.historyTeaser}</div>
        <Link href="/app/transactions" className="flex shrink-0 items-center gap-1 text-[14px] font-semibold text-white hover:text-[#2FD6FF]">
          {t.dashboard.transactions} <ArrowRight size={15} />
        </Link>
      </AxCard>
    </div>
  );
}
