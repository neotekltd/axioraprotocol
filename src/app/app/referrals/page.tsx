import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/data';
import { ReferralSummaryCard } from '@/components/ax/dashboard';
import { SITE_URL } from '@/lib/config';
import { formatUSD } from '@/lib/finance';
import { getProfile, getReferrals, getReferralEarnings } from '@/lib/queries';

export const metadata = { title: 'Referrals' };

export default async function ReferralsAppPage() {
  const [profile, referrals, earnings] = await Promise.all([getProfile(), getReferrals(), getReferralEarnings()]);
  const link = profile ? `${SITE_URL}/register?ref=${profile.referralCode}` : null;
  const total = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = earnings.filter((e) => e.createdAt.slice(0, 10) === today).reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Referrals" sub="Invite others and earn from their protocol activity." />
      <ReferralSummaryCard link={link} count={referrals.length} earned={total} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TOTAL REFERRALS" value={String(referrals.length)} />
        <StatCard label="TOTAL EARNINGS" value={formatUSD(total)} />
        <StatCard label="TODAY" value={formatUSD(todayTotal)} />
      </div>
      <div className="flex gap-3">
        <Link href="/app/referrals/network" className="flex flex-1 items-center justify-center gap-1 rounded-[14px] border border-[#2A394D] bg-[#111722] py-3.5 text-[14px] font-semibold text-white hover:border-[rgba(47,214,255,0.5)]">
          Network <ArrowRight size={15} />
        </Link>
        <Link href="/app/referrals/earnings" className="flex flex-1 items-center justify-center gap-1 rounded-[14px] border border-[#2A394D] bg-[#111722] py-3.5 text-[14px] font-semibold text-white hover:border-[rgba(47,214,255,0.5)]">
          Earnings <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
