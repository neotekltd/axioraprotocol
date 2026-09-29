'use client';

// Authenticated app shell chrome: fixed top header (mark + Live pill with
// real session-elapsed timer + notifications + avatar), fixed 5-item bottom
// nav with safe-area padding, floating support button. Desktop swaps the
// bottom nav for a sidebar rail (see AppShell).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Home, LifeBuoy, TrendingUp, Users, Wallet, MessageCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function useSessionElapsed(active: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = Date.now();
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active]);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function AppHeader({ email, unread = 0 }: { email?: string | null; unread?: number }) {
  const elapsed = useSessionElapsed(true);
  const initials = (email?.trim()?.[0] ?? 'A').toUpperCase();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#202A3A]/70 bg-[#080B12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 md:px-7">
        <Link href="/app/dashboard" className="flex items-center gap-2.5" aria-label="Axiora home">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] border border-[rgba(47,214,255,0.4)] bg-[rgba(47,214,255,0.1)]">
            <Zap size={16} className="text-[#2FD6FF]" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-white">
            AXIORA<span className="text-[#2FD6FF]">.</span>
          </span>
        </Link>
        <div className="hidden items-center gap-2 rounded-full border border-[#2A394D] bg-[#111722] px-3.5 py-1.5 sm:flex" role="status" aria-label="Session live">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#35D98B]" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-[#AAB5C7]">Live</span>
          <span className="font-mono text-[13px] text-[#78859A]" suppressHydrationWarning>{elapsed}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/app/notifications"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative grid h-10 w-10 place-items-center rounded-full text-[#AAB5C7] hover:text-white"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#2FD6FF] px-1 font-mono text-[10px] font-bold text-black">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <Link
            href="/app/profile"
            aria-label="Profile"
            className="grid h-10 w-10 place-items-center rounded-[12px] border border-[rgba(47,214,255,0.45)] bg-[rgba(47,214,255,0.08)] text-[15px] font-bold text-[#2FD6FF]"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}

const NAV = [
  { href: '/app/dashboard', label: 'Home', Icon: Home },
  { href: '/app/deploy', label: 'Invest', Icon: TrendingUp },
  { href: '/app/wallet', label: 'Wallet', Icon: Wallet },
  { href: '/app/referrals', label: 'Referrals', Icon: Users },
  { href: '/app/support', label: 'Support', Icon: LifeBuoy },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-[#202A3A] bg-[#080B12]/95 backdrop-blur-xl lg:hidden">
      <div className="ax-safe-bottom grid grid-cols-5 px-2 pb-2 pt-1.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/app/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-1 rounded-lg py-1.5"
            >
              {active && <span className="absolute -top-[7px] h-[3px] w-10 rounded-full bg-[#2FD6FF] shadow-[0_0_12px_rgba(47,214,255,0.8)]" aria-hidden="true" />}
              <Icon size={22} className={active ? 'text-[#2FD6FF]' : 'text-[#596579]'} />
              <span className={cn('text-[11px] font-semibold', active ? 'text-[#2FD6FF]' : 'text-[#596579]')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function FloatingSupportButton() {
  return (
    <Link
      href="/app/support"
      aria-label="Contact support"
      className="fixed bottom-[104px] right-[18px] z-40 grid h-14 w-14 place-items-center rounded-full bg-[#2FD6FF] text-[#06121A] shadow-[0_8px_28px_rgba(47,214,255,0.4)] transition hover:scale-105 hover:brightness-110 active:scale-95 lg:bottom-8"
    >
      <MessageCircle size={24} />
    </Link>
  );
}

// Public-site floating support: hidden inside /app (the app shell renders
// its own). Links to the in-app support route (auth-gated for visitors).
export function PublicFloatingSupport() {
  const pathname = usePathname();
  if (pathname.startsWith('/app')) return null;
  return (
    <div className="[&_a]:!bottom-6">
      <FloatingSupportButton />
    </div>
  );
}
