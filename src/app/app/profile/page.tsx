import { PageHeader } from '@/components/data';
import { ProfileForm } from '@/components/ProfileForm';
import { getSessionUser, getProfile } from '@/lib/queries';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([getSessionUser(), getProfile()]);
  const memberSince = profile?.createdAt ? profile.createdAt.slice(0, 10) : user?.createdAt ? user.createdAt.slice(0, 10) : '—';
  return (
    <div>
      <PageHeader title="Profile" sub="Account information and preferences." />
      <ProfileForm
        email={user?.email ?? profile?.email ?? '—'}
        verified={user?.emailConfirmed ?? false}
        displayName={profile?.displayName ?? null}
        memberSince={memberSince}
        referralCode={profile?.referralCode ?? null}
      />
    </div>
  );
}
