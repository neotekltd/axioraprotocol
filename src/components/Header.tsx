'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

const NAV = [
  { href: '/protocol', label: 'Protocol' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/technology', label: 'Technology' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/referrals', label: 'Referrals' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
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
      <div className="mx-auto flex h-16 max-w-page items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-pulse/15 border border-pulse/30">
            <Zap className="text-pulse" size={14} />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-bold tracking-tight">AXIORA PROTOCOL</span>
            <span className="mt-0.5 block font-mono text-[9px] tracking-[0.25em] text-fog">AUTONOMOUS CAPITAL</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-[13px] text-mist/80 hover:text-pulse transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 lg:flex">
          <Link href="/login" className="rounded-md px-3.5 py-2 text-[13px] text-mist hover:text-pulse border border-line hover:border-pulse/40 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="rounded-md bg-pulse px-4 py-2 text-[13px] font-bold text-black hover:brightness-110 shadow-glow transition">
            Get Started
          </Link>
        </div>
        <button className="lg:hidden p-2 text-mist" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-line bg-void/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {[...NAV, { href: '/login', label: 'Sign In' }, { href: '/register', label: 'Get Started' }].map((n) => (
            <Link key={n.href + n.label} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] text-mist hover:bg-surface hover:text-white">
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
