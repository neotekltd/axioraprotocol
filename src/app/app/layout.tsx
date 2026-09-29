import Link from 'next/link';
import { AppHeader, FloatingSupportButton, MobileBottomNav } from '@/components/ax/shell';
import { TechGridBackground } from '@/components/ax/primitives';
import { getNotifications, getSessionUser } from '@/lib/queries';

export const metadata = {
  title: 'App',
  robots: { index: false, follow: false },
};

const DESKTOP_NAV: [string, string][] = [
  ['Dashboard', '/app/dashboard'],
  ['Deploy', '/app/deploy'],
  ['Wallet', '/app/wallet'],
  ['Transactions', '/app/transactions'],
  ['Trades', '/app/trades'],
  ['Referrals', '/app/referrals'],
  ['Protocol Stats', '/app/protocol-stats'],
  ['Notifications', '/app/notifications'],
  ['Profile', '/app/profile'],
  ['Security', '/app/security'],
  ['Support', '/app/support'],
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, notifications] = await Promise.all([getSessionUser(), getNotifications()]);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F1F5FA]">
      <TechGridBackground />
      <AppHeader email={user?.email} unread={unread} />
      <div className="relative mx-auto max-w-[1180px] px-7 pb-32 pt-[104px] md:px-8 lg:flex lg:pb-16">
        <div className="hidden lg:block lg:w-60 lg:shrink-0">
          <nav aria-label="Application" className="sticky top-[104px] space-y-1 rounded-[20px] border border-[#202A3A] bg-[#0D111A]/80 p-3">
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
