import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Notifications' };

const ITEMS = [
  ['Deployment activated', '#AX-1042 · $5,000 · 60 days', 'Sep 27'],
  ['Profit settled', '+$184.21 daily profit credited', 'Sep 27'],
  ['Referral reward', '+$38.42 from your network', 'Sep 26'],
  ['Security alert', 'New login from unrecognized device', 'Sep 26'],
];

export default function NotificationsPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Notifications</h1><DemoBadge /><span className="rounded-full bg-pulse/15 px-2.5 py-1 text-[11px] text-pulse">● 3 unread</span></div>
      <div className="mt-6 space-y-3">
        {ITEMS.map(([t, d, w]) => (
          <Card key={t} className="flex items-center justify-between p-5"><div><div className="text-sm font-semibold">{t}</div><div className="text-xs text-fog">{d}</div></div><div className="text-xs text-fog">{w}</div></Card>
        ))}
      </div>
    </div>
  );
}
