import { PageHeader } from '@/components/data';
import { NotificationsView } from '@/components/NotificationsView';
import { getNotifications } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const t = getDict();
  const items = await getNotifications();
  const unread = items.filter((n) => !n.read).length;
  return (
    <div>
      <PageHeader title={t.notifications.title} sub={t.nt.pageSub} />
      <NotificationsView initial={items} unread={unread} />
    </div>
  );
}
