'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

const NAV = [
  { href: '/protocol', label: 'Protocol' },
  { href: '/#how', label: 'How It Works' },
  { href: '/statistics', label: 'Statistics' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/referrals', label: 'Referral' },
  { href: '/blog', label: 'Blog' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  // The authenticated /app area owns its own shell (sidebar + mobile drawer).
  if (pathname.startsWith('/app')) return null;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-void/85 backdrop-blur-xl border-b border-line' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-pulse/15 border border-pulse/30">
            <Zap className="text-pulse" size={14} />
          </span>
          <span className="text-sm font-bold tracking-tight">AXIORA PROTOCOL</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-mist/80 hover:text-white transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-mist hover:text-white border border-line hover:border-edge">
            Log in
          </Link>
          <Link href="/register" className="rounded-lg bg-pulse px-5 py-2.5 text-[13px] font-semibold text-black hover:brightness-110 shadow-glow">
            Deploy Capital
          </Link>
        </div>
        <button className="lg:hidden p-2 text-mist" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-line bg-void/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {[...NAV, { href: '/login', label: 'Log in' }, { href: '/register', label: 'Deploy Capital' }].map((n) => (
            <Link key={n.href + n.label} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] text-mist hover:bg-surface hover:text-white">
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
