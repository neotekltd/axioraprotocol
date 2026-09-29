import { BalanceHeroCard, OnboardingStepsCard, PlanCard, ReferralSummaryCard } from '@/components/ax/dashboard';
import { AxCard, SectionHeader } from '@/components/ax/primitives';
import { SITE_URL, PROTOCOL_CONFIG } from '@/lib/config';
import {
  getSessionUser, getProfile, getPortfolioSummary, getReferrals, getReferralEarnings,
} from '@/lib/queries';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const [user, profile, summary, referrals, earnings] = await Promise.all([
    getSessionUser(), getProfile(), getPortfolioSummary(), getReferrals(), getReferralEarnings(),
  ]);
  const earning = summary.profitCredited + summary.referralCredited;
  const firstName = profile?.displayName || user?.email?.split('@')[0] || 'there';
  const link = profile ? `${SITE_URL}/register?ref=${profile.referralCode}` : null;
  const referralTotal = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-[15px] text-[#AAB5C7]">Your account is ready. Here is how to start.</p>
      </div>

      <BalanceHeroCard
        total={summary.totalValue}
        available={summary.available}
        earning={earning}
        invested={summary.deployedActive}
        hasDeposits={summary.deposited > 0}
      />

      <OnboardingStepsCard doneDeposited={summary.deposited > 0} doneDeployed={summary.deployedActive > 0} />

      <div>
        <SectionHeader
          title="Plans"
          action={<Link href="/app/deploy" className="flex items-center gap-1 text-[14px] text-[#AAB5C7] hover:text-white">Compare <ArrowRight size={15} /></Link>}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(['essential', 'premium', 'exclusive'] as const).map((key) => (
            <PlanCard key={key} planKey={key} />
          ))}
        </div>
        <p className="mt-2.5 font-mono text-[10px] tracking-[0.15em] text-[#596579]">MOD-01…03 · RATES ARE MODEL ESTIMATES</p>
      </div>

      <ReferralSummaryCard link={link} count={referrals.length} earned={referralTotal} />

      <AxCard className="flex items-center justify-between p-5">
        <div className="text-[14px] text-[#AAB5C7]">Full history, trades and protocol stats live here too.</div>
        <Link href="/app/transactions" className="flex shrink-0 items-center gap-1 text-[14px] font-semibold text-white hover:text-[#2FD6FF]">
          Transactions <ArrowRight size={15} />
        </Link>
      </AxCard>
    </div>
  );
}
