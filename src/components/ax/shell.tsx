'use client';

// Authenticated app shell chrome: fixed top header (mark + site-wide Live
// pill counting from the fixed go-live moment + notifications + avatar),
// fixed 5-item bottom nav with safe-area padding, floating support button.
// Desktop swaps the bottom nav for a sidebar rail (see AppShell).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Home, LifeBuoy, Send, TrendingUp, Users, Wallet } from 'lucide-react';
import { AxioraMark } from '@/components/AxioraLogo';
import { AccountMenu } from '@/components/ax/account-menu';
import { LiveCounter } from '@/components/LiveCounter';
import { useT } from '@/components/LanguageProvider';
import { AXIORA_TELEGRAM_URL } from '@/lib/config';
import { cn } from '@/lib/utils';

export function AppHeader({ email, username, unread = 0 }: { email?: string | null; username?: string | null; unread?: number }) {
  const t = useT();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#202A3A]/70 bg-[#080B12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 md:px-7">
        <Link
          href="/"
          aria-label={t.appHeader.home}
          className="flex min-h-[44px] items-center gap-2.5 rounded-lg"
        >
          <AxioraMark size={36} />
          <span className="text-[17px] font-extrabold tracking-tight text-white">
            AXIORA<span className="text-[#2FD6FF]">.</span>
          </span>
        </Link>
        <div className="hidden items-center gap-2 rounded-full border border-[#2A394D] bg-[#111722] px-3.5 py-1.5 min-[420px]:flex" role="status" aria-label={t.appHeader.live}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#35D98B]" aria-hidden="true" />
          <LiveCounter />
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/app/notifications"
            aria-label={unread > 0 ? t.appHeader.notificationsUnread.replace('{count}', String(unread)) : t.appHeader.notifications}
            className="relative grid h-10 w-10 place-items-center rounded-full text-[#AAB5C7] hover:text-white"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#2FD6FF] px-1 font-mono text-[10px] font-bold text-black">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <AccountMenu email={email} username={username} />
        </div>
      </div>
    </header>
  );
}

const NAV = [
  { href: '/app/dashboard', key: 'home', Icon: Home },
  { href: '/app/deploy', key: 'invest', Icon: TrendingUp },
  { href: '/app/wallet', key: 'wallet', Icon: Wallet },
  { href: '/app/referrals', key: 'referrals', Icon: Users },
  { href: '/app/support', key: 'support', Icon: LifeBuoy },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav aria-label={t.appnav.primary} className="fixed inset-x-0 bottom-0 z-40 border-t border-[#202A3A] bg-[#080B12]/95 backdrop-blur-xl lg:hidden">
      <div className="ax-safe-bottom grid grid-cols-5 px-2 pb-2 pt-1.5">
        {NAV.map(({ href, key, Icon }) => {
          const label = t.appnav[key];
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

// Global floating Telegram widget: fixed to the viewport, above page
// content but below drawers/modals (z-40 vs public drawer z-60), offset
// above the mobile bottom nav in-app, safe-area aware everywhere.
// Destination is the canonical Axiora Telegram channel — in-app support
// tickets remain reachable via the Support navigation entry.
export function FloatingSupportButton() {
  const t = useT();
  return (
    <a
      href={AXIORA_TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.fab.label}
      className="ax-fab fixed bottom-[calc(104px+env(safe-area-inset-bottom))] right-[14px] z-40 grid h-14 w-14 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2FD6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:bottom-[calc(24px+env(safe-area-inset-bottom))] lg:right-[24px]"
    >
      <span aria-hidden="true" className="ax-fab-ring" />
      <span aria-hidden="true" className="ax-fab-ripple" />
      <span className="ax-fab-btn">
        <Send size={24} />
      </span>
    </a>
  );
}

// Public-site floating support: hidden inside /app (the app shell renders
// its own) and /admin (dedicated admin shell). Links to the in-app support
// route (auth-gated for visitors).
export function PublicFloatingSupport() {
  const pathname = usePathname();
  if (pathname.startsWith('/app') || pathname.startsWith('/admin')) return null;
  return (
    <div className="[&_a]:!bottom-[calc(24px+env(safe-area-inset-bottom))]">
      <FloatingSupportButton />
    </div>
  );
}

// Dedicated authenticated-header identity for the dashboard shell.
export const AuthenticatedAppHeader = AppHeader;
