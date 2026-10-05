'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AxioraMark } from '@/components/AxioraLogo';
import { TechGridBackground } from '@/components/ax/primitives';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useT } from '@/components/LanguageProvider';

// AIMEX-composition auth shell: compact logo header + real language
// selector + back-to-site, upper-middle ~500px card slot, decorative
// network line, minimal legal footer. Branding and routes are Axiora's own.
// Client component: it renders inside client auth forms.
export function AuthShell({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="relative min-h-screen bg-[#080B12]">
      <TechGridBackground />
      <header className="relative mx-auto flex max-w-[1200px] items-center justify-between px-5 pt-7 md:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label={t.authShell.home}>
          <AxioraMark size={34} />
          <span className="text-[15px] font-extrabold tracking-tight text-white">
            AXIORA<span className="text-[#2FD6FF]">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <Link href="/" className="flex h-[42px] items-center gap-1.5 rounded-full border border-[#2A394D] bg-[#0D111A]/80 px-4 text-[13px] text-[#AAB5C7] transition hover:border-[rgba(47,214,255,0.5)] hover:text-white">
            <ArrowLeft size={14} aria-hidden="true" /> {t.authShell.backToSite}
          </Link>
        </div>
      </header>
      <main className="relative mx-auto w-full max-w-[500px] px-5 pb-16 pt-10 md:pt-14">{children}</main>
      <AuthGraphLine />
      <footer className="relative pb-8 pt-4 text-center">
        <p className="text-[12px] text-[#596579]">{t.authShell.risk}</p>
        <p className="mt-1.5 text-[12px]">
          <Link href="/terms" className="text-[#78859A] hover:text-white">{t.authShell.terms}</Link>
          <span className="mx-2 text-[#2A394D]" aria-hidden="true">·</span>
          <Link href="/privacy" className="text-[#78859A] hover:text-white">{t.authShell.privacy}</Link>
        </p>
      </footer>
    </div>
  );
}

// Decorative network line: pure motif, aria-hidden, never labeled as data.
export function AuthGraphLine() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] w-full opacity-70"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="axg-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2FD6FF" stopOpacity="0.05" />
          <stop offset="60%" stopColor="#2FD6FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2FD6FF" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="axg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2FD6FF" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#2FD6FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M-20,300 C240,296 420,282 640,262 C860,242 1020,200 1180,140 C1300,96 1380,70 1460,54 L1460,320 L-20,320 Z"
        fill="url(#axg-fill)"
      />
      <path
        d="M-20,300 C240,296 420,282 640,262 C860,242 1020,200 1180,140 C1300,96 1380,70 1460,54"
        fill="none" stroke="url(#axg-line)" strokeWidth="2" strokeLinecap="round"
        className="auth-graph-drift"
      />
      <g fill="#2FD6FF">
        <circle cx="640" cy="262" r="2.5" opacity="0.5" className="pulse-node" />
        <circle cx="1180" cy="140" r="2.5" opacity="0.6" className="pulse-node" />
        <circle cx="240" cy="294" r="2" opacity="0.4" />
      </g>
    </svg>
  );
}
