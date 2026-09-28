import { SecurityView } from '@/components/SecurityView';
import { getSessionUser } from '@/lib/queries';

export const metadata = { title: 'Security' };

export default async function SecurityPage() {
  const user = await getSessionUser();
  return <SecurityView email={user?.email ?? '—'} verified={user?.emailConfirmed ?? false} />;
}
