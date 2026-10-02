import { ReferralsView } from '@/components/ax/referrals';
import { SITE_URL } from '@/lib/config';
import { getProfile, getReferrals, getReferralEarnings } from '@/lib/queries';

export const metadata = { title: 'Referrals' };

export default async function ReferralsAppPage() {
  const [profile, referrals, earnings] = await Promise.all([getProfile(), getReferrals(), getReferralEarnings()]);
  // Short public entry: /r/CODE captures first-touch attribution (cookie)
  // and routes into signup. Never the legacy ?ref= form, never external.
  const link = profile ? `${SITE_URL}/r/${profile.referralCode}` : null;
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
