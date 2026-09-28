import { PageHeader } from '@/components/data';
import { NotificationsView } from '@/components/NotificationsView';
import { getNotifications } from '@/lib/queries';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const items = await getNotifications();
  const unread = items.filter((n) => !n.read).length;
  return (
    <div>
      <PageHeader title="Notifications" sub="Security, money movement and protocol events." />
      <NotificationsView initial={items} unread={unread} />
    </div>
  );
}
