'use client';

// Canonical authenticated account menu. One component used by the shared
// app header on EVERY authenticated page: mobile bottom sheet, desktop
// anchored popover. Real session data only (username/email from the
// Supabase session — never hardcoded, never internal IDs).
// Routes reuse existing pages: Profile -> /app/profile,
// Password -> /app/security. Language has no selector in this build
// (single-locale product), so it renders as a static current-locale row
// rather than a dead link. Sign out uses the real Supabase signOut.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Globe, Lock, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BottomSheet } from '@/components/ax/wallet';
import { ClientPortal } from '@/components/Portal';
import { cn } from '@/lib/utils';

function initialsOf(username: string | null, email: string | null): string {
  const src = (username ?? '').trim() || (email ?? '').trim();
  if (!src) return 'A';
  const clean = src.replace(/^@/, '');
  return clean.slice(0, 2).toUpperCase();
}

function Identity({ username, email, size = 'md' }: { username: string | null; email: string | null; size?: 'md' | 'sm' }) {
  const box = size === 'md' ? 'h-[54px] w-[54px] text-[17px]' : 'h-10 w-10 text-[15px]';
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className={cn('grid shrink-0 place-items-center rounded-[12px] border border-[rgba(47,214,255,0.5)] bg-[#0E2233] font-bold text-[#2FD6FF]', box)}
      >
        {initialsOf(username, email)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[16px] font-bold text-white">{username ?? email ?? 'Account'}</span>
        <span className="block truncate text-[12px] text-[#78859A]">
          {username ? `@${username}` : ''}{username && email ? ' · ' : ''}{email ?? ''}
        </span>
      </span>
    </div>
  );
}

function MenuRows({ onNavigate }: { onNavigate: () => void }) {
  // Close is deferred past the click event: closing synchronously unmounts
  // the Next.js Link mid-click and swallows the navigation.
  const later = () => setTimeout(onNavigate, 60);
  const rows = [
    { href: '/app/profile', Icon: User, label: 'Profile', chevron: true },
    { href: '/app/security', Icon: Lock, label: 'Password', chevron: true },
  ];
  return (
    <div role="menu" aria-label="Account">
      {rows.map(({ href, Icon, label }, i) => (
        <Link
          key={href}
          href={href}
          role="menuitem"
          onClick={later}
          style={{ transitionDelay: `${i * 28}ms` }}
          className="acc-row flex min-h-[54px] items-center gap-3 rounded-[12px] px-2 text-[15px] font-semibold text-white transition hover:bg-white/[0.04] active:scale-[0.99] motion-reduce:transition-none"
        >
          <Icon size={20} className="shrink-0 text-[#AAB5C7]" aria-hidden="true" />
          <span className="flex-1">{label}</span>
          <ChevronRight size={16} className="shrink-0 text-[#596579]" aria-hidden="true" />
        </Link>
      ))}
      <div role="menuitem" aria-disabled="true" className="flex min-h-[54px] cursor-default items-center gap-3 rounded-[12px] px-2 text-[15px] font-semibold text-white" aria-label="Language: English">
        <Globe size={20} className="shrink-0 text-[#AAB5C7]" aria-hidden="true" />
        <span className="flex-1">Language</span>
        <span className="text-[13px] font-normal text-[#78859A]">English</span>
        <ChevronRight size={16} className="shrink-0 text-[#323f52]" aria-hidden="true" />
      </div>
      <div aria-hidden="true" className="my-1 h-px bg-[#202A3A]/80" />
      <SignOutRow />
    </div>
  );
}

function SignOutRow() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const out = async () => {
    setBusy(true);
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };
  return (
    <button
      type="button"
      role="menuitem"
      disabled={busy}
      onClick={() => void out()}
      className="flex min-h-[54px] w-full items-center gap-3 rounded-[12px] px-2 text-left text-[15px] font-semibold text-[#AAB5C7] transition hover:bg-[rgba(240,107,120,0.07)] hover:text-white active:scale-[0.99] disabled:opacity-60 motion-reduce:transition-none"
    >
      <LogOut size={20} className="shrink-0" aria-hidden="true" />
      <span className="flex-1">{busy ? 'Signing out…' : 'Sign out'}</span>
    </button>
  );
}

export function AccountMenu({ email, username }: { email?: string | null; username?: string | null }) {
  const [open, setOpen] = useState(false);
  const [renderDesktop, setRenderDesktop] = useState(false);
  // Mobile sheet mounts only below the lg breakpoint: BottomSheet portals
  // itself to document.body, so the lg:hidden wrapper class cannot hide its
  // content — without this gate, desktop gets a duplicate dialog plus a
  // full-viewport overlay intercepting the anchored popover.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Desktop popover exit animation handling.
  useEffect(() => {
    if (open) {
      setRenderDesktop(true);
      return;
    }
    if (!renderDesktop) return;
    const t = setTimeout(() => setRenderDesktop(false), 220);
    return () => clearTimeout(t);
  }, [open, renderDesktop]);

  // Desktop: click-outside + Escape (mobile sheet handles its own).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      // The mobile sheet lives in BottomSheet's own body portal (a different
      // host node than this component's wrapper), so ref containment can
      // never match it — every tap inside the sheet counted as "outside"
      // and closed the menu on pointerdown before click handlers ran. Match
      // by the sheet root marker instead.
      if (el && typeof el.closest === 'function' && el.closest('[data-sheet-root]')) return;
      if (
        el &&
        (triggerRef.current?.contains(el) ||
          panelRef.current?.contains(el))
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Close account menu' : 'Open account menu'}
        className={cn(
          'grid h-10 w-10 place-items-center rounded-[12px] border text-[15px] font-bold transition',
          open
            ? 'border-[rgba(47,214,255,0.6)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
            : 'border-[rgba(47,214,255,0.45)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF] hover:border-[rgba(47,214,255,0.7)]'
        )}
      >
        {initialsOf(username ?? null, email ?? null)}
      </button>

      {/* Desktop popover */}
      {renderDesktop && (
        <div
          ref={panelRef}
          className={cn(
            'absolute right-0 top-[calc(100%+10px)] z-[46] hidden w-[330px] rounded-[16px] border border-[#2A394D] bg-[#0C1119] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.55)] transition-all duration-200 lg:block motion-reduce:transition-none',
            open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
          )}
        >
          <div className="px-2 pb-2 pt-1">
            <Identity username={username ?? null} email={email ?? null} size="sm" />
          </div>
          <div aria-hidden="true" className="mb-1 h-px bg-[#202A3A]/80" />
          <MenuRows onNavigate={() => setOpen(false)} />
        </div>
      )}

      {/* Mobile bottom sheet — portaled to body so the header's
          backdrop-filter cannot reparent its fixed positioning.
          Mounted only below lg (see isDesktop): BottomSheet portals its
          own content, so a CSS hiding class on this wrapper could never
          hide the dialog/overlay from desktop. */}
      {open && !isDesktop && (
        <ClientPortal>
          <div className="lg:hidden">
            <BottomSheet
              open={open}
              onClose={() => setOpen(false)}
              labelledBy="Account menu"
              overlayClassName="inset-x-0 bottom-0"
              overlayTop={76}
              title={<Identity username={username ?? null} email={email ?? null} />}
            >
              <MenuRows onNavigate={() => setOpen(false)} />
            </BottomSheet>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
