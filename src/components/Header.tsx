'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AxioraMark } from '@/components/AxioraLogo';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useT } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';

const NAV_KEYS = [
  'protocol',
  'howItWorks',
  'technology',
  'calculator',
  'referrals',
  'blog',
  'faq',
] as const;

const NAV_HREFS: Record<(typeof NAV_KEYS)[number], string> = {
  protocol: '/protocol',
  howItWorks: '/how-it-works',
  technology: '/technology',
  calculator: '/calculator',
  referrals: '/referral-program',
  blog: '/blog',
  faq: '/faq',
};

// Drawer destinations preserve the reference numbering/presentation with
// Axiora's real routes (anchors work from any page via /#...).
const DRAWER_ITEMS = [
  { n: '01', href: '/#modules', key: 'plans' },
  { n: '02', href: '/how-it-works', key: 'howItWorks' },
  { n: '03', href: '/technology', key: 'features' },
  { n: '04', href: '/statistics', key: 'liveStats' },
  { n: '05', href: '/referral-program', key: 'referrals' },
  { n: '06', href: '/faq', key: 'faq' },
] as const;

export function Header() {
  const pathname = usePathname();
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [renderDrawer, setRenderDrawer] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  // Same Supabase session as the app: when authenticated, the public CTA
  // leads to the dashboard instead of the auth pages. Read-only session
  // check — never signs out, never writes storage.
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    let mounted = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (mounted) setAuthed(Boolean(data.session));
      })
      .catch(() => {});
    const { data: sub } = createClient().auth.onAuthStateChange((_e, session) => {
      if (mounted) setAuthed(Boolean(session));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  // Drawer lifecycle: mount for exit animation, lock body scroll, Escape,
  // focus close on open and restore focus to the opener on close.
  useEffect(() => {
    if (!open) return;
    setRenderDrawer(true);
    const opener = openerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      opener?.focus();
    };
  }, [open ]);
  useEffect(() => {
    if (!open && renderDrawer) {
      const t = setTimeout(() => setRenderDrawer(false), 420);
      return () => clearTimeout(t);
    }
  }, [open, renderDrawer]);

  const close = () => setOpen(false);

  // The authenticated /app area owns its own shell (sidebar + mobile drawer).
  // Auth routes use the standalone AuthShell with its own header/footer.
  // /admin owns the dedicated admin shell — the marketing header must never
  // stack above it (that collision produced the duplicated mobile headers).
  if (pathname.startsWith('/app') || pathname.startsWith('/admin')) return null;
  if (['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(pathname)) return null;
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-void/85 backdrop-blur-xl border-b border-line' : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Row 1 — system bar (all widths) */}
        <div className="border-b border-line/50 px-4 font-mono text-[11px] md:px-8" aria-hidden="true">
          <div className="mx-auto flex h-[44px] max-w-page items-center justify-between text-fog">
            <span className="flex items-center gap-1.5 tracking-[0.18em] text-[#35D98B]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#35D98B]" /> {t.header.systemOnline}
            </span>
            <Link href="/app/support" className="tracking-[0.18em] transition hover:text-white">
              {t.header.supportChat}
            </Link>
            <LanguageSelector compact />
          </div>
        </div>
        {/* Row 2 — main nav */}
        <div className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Axiora Protocol home">
            <AxioraMark size={34} />
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight">AXIORA<span className="text-pulse">.</span></span>
              <span className="mt-0.5 hidden font-mono text-[8px] tracking-[0.25em] text-fog min-[380px]:block">AUTONOMOUS CAPITAL</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_KEYS.map((key) => (
              <Link key={NAV_HREFS[key]} href={NAV_HREFS[key]} className="text-[13px] text-mist/80 hover:text-pulse transition-colors">
                {t.header.nav[key]}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2.5 lg:flex">
            {authed ? (
              <Link href="/app/dashboard" className="rounded-md bg-pulse px-4 py-2 text-[13px] font-bold text-black hover:brightness-110 shadow-glow transition">
                {t.header.dashboard}
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-md px-3.5 py-2 text-[13px] text-mist hover:text-pulse border border-line hover:border-pulse/40 transition-colors">
                  {t.header.signIn}
                </Link>
                <Link href="/register" className="rounded-md bg-pulse px-4 py-2 text-[13px] font-bold text-black hover:brightness-110 shadow-glow transition">
                  {t.header.getStarted}
                </Link>
              </>
            )}
          </div>
          {/* Mobile: compact CTA + square hamburger */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <Link
              href={authed ? '/app/dashboard' : '/register'}
              className="flex h-[46px] shrink-0 items-center whitespace-nowrap rounded-[12px] bg-pulse px-3.5 text-[13px] font-bold text-black shadow-glow transition hover:brightness-110 min-[400px]:px-4"
            >
              {authed ? t.header.dashboard : t.header.activateAccount}
            </Link>
            <button
              ref={openerRef}
              onClick={() => setOpen(true)}
              aria-label={t.header.openNav}
              aria-expanded={open}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] border border-line bg-void text-mist transition hover:border-pulse/50 hover:text-white"
            >
              <span className="flex flex-col items-end gap-[5px]" aria-hidden="true">
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-3.5 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {renderDrawer && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <div
            className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={close}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.header.siteNav}
            className={`absolute bottom-0 right-0 top-0 flex h-[100dvh] w-[clamp(300px,87vw,420px)] flex-col border-l border-[rgba(100,150,180,0.15)] bg-[#090D14] transition-transform duration-[400ms] ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="tech-dots pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative flex items-center justify-between px-[36px] pb-2 pt-6">
              <span className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.25em] text-fog">
                <span className="h-2 w-2 rounded-full bg-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" aria-hidden="true" />
                {t.header.navigation}
              </span>
              <button
                ref={closeRef}
                onClick={close}
                aria-label={t.header.closeNav}
                className="grid h-12 w-12 place-items-center rounded-[12px] border border-line bg-void text-mist transition hover:border-pulse/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse active:scale-95"
              >
                <X size={22} />
              </button>
            </div>
            <nav aria-label={t.header.mobileNav} className="relative flex-1 overflow-y-auto px-[36px] pb-6 pt-[32px]">
              <ul>
                {DRAWER_ITEMS.map((n, i) => (
                  <li
                    key={n.n}
                    className={`border-b border-[rgba(120,140,165,0.12)] transition-all duration-300 ${open ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}
                    style={{ transitionDelay: open ? `${80 + i * 40}ms` : '0ms' }}
                  >
                    <Link
                      href={n.href}
                      onClick={close}
                      className="group flex w-full items-center gap-4 rounded-lg py-[18px] text-left transition-colors hover:bg-white/[0.03] active:bg-white/[0.05]"
                    >
                      <span className="w-10 shrink-0 font-mono text-[14px] text-pulse transition group-hover:brightness-125" aria-hidden="true">{n.n}</span>
                      <span className="text-[20px] font-bold tracking-tight text-white transition-transform duration-200 group-hover:translate-x-[2px]">
                        {t.header.drawer[n.key]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="ax-safe-bottom relative space-y-4 px-[36px] pb-8 pt-2">
              {authed ? (
                <Link
                  href="/app/dashboard"
                  onClick={close}
                  className="flex min-h-[56px] w-full items-center justify-center rounded-[14px] bg-pulse text-[16px] font-bold text-black shadow-glow transition hover:brightness-110 active:scale-[0.99]"
                >
                  {t.header.dashboard}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex min-h-[56px] w-full items-center justify-center rounded-[14px] border border-line bg-[#111722] text-[16px] font-bold text-white transition hover:border-pulse/50 active:scale-[0.99]"
                  >
                    {t.header.signInAction}
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
                    className="flex min-h-[56px] w-full items-center justify-center rounded-[14px] bg-pulse text-[16px] font-bold text-black shadow-glow transition hover:brightness-110 active:scale-[0.99]"
                  >
                    {t.header.activateAccount}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
