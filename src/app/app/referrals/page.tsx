import { ReferralsView } from '@/components/ax/referrals';
import { SITE_URL } from '@/lib/config';
import { getProfile, getReferrals, getReferralEarnings } from '@/lib/queries';

export const metadata = { title: 'Referrals' };

export default async function ReferralsAppPage() {
  const [profile, referrals, earnings] = await Promise.all([getProfile(), getReferrals(), getReferralEarnings()]);
  const link = profile ? `${SITE_URL}/register?ref=${profile.referralCode}` : null;
  const total = earnings.filter((e) => e.status === 'available').reduce((a, e) => a + e.amount, 0);

  return (
    <ReferralsView
      link={link}
      code={profile?.referralCode ?? null}
      referrals={referrals}
      earned={total}
    />
  );
}
