import Link from 'next/link';
import { PageHeader, StatCard, SectionCard } from '@/components/data';
import { CopyButton } from '@/components/ui';
import { formatUSD } from '@/lib/finance';
import { SITE_URL } from '@/lib/config';
import { getProfile, getReferrals, getReferralEarnings } from '@/lib/queries';

export const metadata = { title: 'Referrals' };

export default async function ReferralsAppPage() {
  const [profile, referrals, earnings] = await Promise.all([getProfile(), getReferrals(), getReferralEarnings()]);
  const link = profile ? `${SITE_URL}/register?ref=${profile.referralCode}` : null;
  const total = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = earnings.filter((e) => e.createdAt.slice(0, 10) === today).reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <PageHeader title="Referrals" sub="Invite others and earn from their protocol activity. Never from your own deposits." />
      <SectionCard title="Your referral link">
        <div className="p-5">
          {link ? (
            <>
              <div className="break-all font-mono text-sm text-pulse">{link}</div>
              <div className="mt-3 flex gap-2"><CopyButton text={link} label="Copy link" /></div>
            </>
          ) : (
            <p className="text-sm text-fog">Your referral code will appear here once your profile is ready.</p>
          )}
        </div>
      </SectionCard>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL REFERRALS" value={String(referrals.length)} />
        <StatCard label="ACTIVE LEVELS" value={String(new Set(referrals.map((r) => r.level)).size)} sub="Depth capped at 5" />
        <StatCard label="TOTAL EARNINGS" value={formatUSD(total)} />
        <StatCard label="TODAY'S EARNINGS" value={formatUSD(todayTotal)} />
      </div>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/app/referrals/network" className="rounded-xl border border-line px-5 py-2.5 hover:border-pulse/50">Network</Link>
        <Link href="/app/referrals/earnings" className="rounded-xl border border-line px-5 py-2.5 hover:border-pulse/50">Earnings</Link>
      </div>
    </div>
  );
}
