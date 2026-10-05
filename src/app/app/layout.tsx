import Link from 'next/link';
import { AppHeader, FloatingSupportButton, MobileBottomNav } from '@/components/ax/shell';
import { TechGridBackground } from '@/components/ax/primitives';
import { getNotifications, getSessionUser } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'App',
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const t = getDict();
  const DESKTOP_NAV: [string, string][] = [
    [t.rail.dashboard, '/app/dashboard'],
    [t.rail.deploy, '/app/deploy'],
    [t.rail.wallet, '/app/wallet'],
    [t.rail.transactions, '/app/transactions'],
    [t.rail.trades, '/app/trades'],
    [t.rail.referrals, '/app/referrals'],
    [t.rail.protocolStats, '/app/protocol-stats'],
    [t.rail.notifications, '/app/notifications'],
    [t.rail.profile, '/app/profile'],
    [t.rail.security, '/app/security'],
    [t.rail.support, '/app/support'],
  ];
  const [user, notifications] = await Promise.all([getSessionUser(), getNotifications()]);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F1F5FA]">
      <TechGridBackground />
      <AppHeader email={user?.email} username={user?.username} unread={unread} />
      <div className="relative mx-auto max-w-[1180px] px-7 pb-32 pt-[88px] md:px-8 lg:flex lg:pb-16">
        <div className="hidden lg:block lg:w-60 lg:shrink-0">
          <nav aria-label={t.rail.appNav} className="sticky top-[88px] space-y-1 rounded-[20px] border border-[#202A3A] bg-[#0D111A]/80 p-3">
            {DESKTOP_NAV.map(([label, href]) => (
              <Link key={href} href={href} className="block rounded-[12px] px-3.5 py-2.5 text-[14px] text-[#AAB5C7] transition hover:bg-[#111722] hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="min-w-0 flex-1 lg:pl-6">{children}</div>
      </div>
      <MobileBottomNav />
      <FloatingSupportButton />
    </div>
  );
}
