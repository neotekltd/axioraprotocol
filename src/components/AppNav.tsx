'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@/components/SignOutButton';

const NAV: [string, string][] = [
  ['Dashboard', '/app/dashboard'],
  ['Portfolio', '/app/portfolio'],
  ['Deploy', '/app/deploy'],
  ['Deployments', '/app/deployments'],
  ['Wallet', '/app/wallet'],
  ['Transactions', '/app/transactions'],
  ['Trades', '/app/trades'],
  ['Referrals', '/app/referrals'],
  ['Protocol Stats', '/app/protocol-stats'],
  ['Notifications', '/app/notifications'],
  ['Support', '/app/support'],
  ['Profile', '/app/profile'],
  ['Security', '/app/security'],
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/app/dashboard' && pathname.startsWith(href + '/'));
}

function linkClass(active: boolean) {
  return `relative block rounded-md px-3 py-2 font-mono text-[12px] tracking-[0.08em] uppercase transition-colors ${
    active
      ? 'bg-pulse/10 font-bold text-pulse before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[2px] before:-translate-y-1/2 before:bg-pulse'
      : 'text-mist/75 hover:bg-surface hover:text-white'
  }`;
}

export function AppNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-void/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/app/dashboard" className="font-display text-sm font-bold tracking-tight" onClick={() => setOpen(false)}>
          AXIORA <span className="text-pulse">PROTOCOL</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-lg border border-line px-3 py-2 text-sm text-mist hover:text-white"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Application menu">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <nav className="thin-scroll absolute right-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-l border-line bg-void p-4">
            <div className="space-y-1">
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={linkClass(isActive(pathname, href))}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <SignOutButton className="w-full" />
            </div>
          </nav>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav aria-label="Application" className="sticky top-24 space-y-1 rounded-2xl border border-line bg-panel/60 p-3">
          <div className="px-3 pb-2 pt-1 font-display text-xs font-bold tracking-widest text-fog">AXIORA PROTOCOL</div>
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} className={linkClass(isActive(pathname, href))}>
              {label}
            </Link>
          ))}
          <div className="border-t border-line pt-3">
            <SignOutButton className="w-full" />
          </div>
        </nav>
      </aside>
    </>
  );
}
