'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  // Authenticated /app area uses its own shell without the marketing footer.
  if (pathname.startsWith('/app')) return null;
  const col = 'text-[11px] font-semibold tracking-[0.2em] text-fog';
  const link = 'block text-[13px] text-mist/75 hover:text-pulse transition-colors';
  return (
    <footer className="border-t border-line bg-[#04070c]">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="text-sm font-bold tracking-tight">AXIORA PROTOCOL</div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.25em] text-fog">AUTONOMOUS CAPITAL</div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-fog">
            Multi-agent consensus trading interface. Original implementation; not affiliated
            with any other protocol. No real funds move in this build.
          </p>
        </div>
        <nav aria-label="Protocol">
          <div className={col}>PROTOCOL</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/protocol">Protocol</Link>
            <Link className={link} href="/how-it-works">How it works</Link>
            <Link className={link} href="/technology">Technology</Link>
            <Link className={link} href="/about">About</Link>
          </div>
        </nav>
        <nav aria-label="Product">
          <div className={col}>PRODUCT</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/calculator">Calculator</Link>
            <Link className={link} href="/referrals">Referrals</Link>
            <Link className={link} href="/statistics">Statistics</Link>
            <Link className={link} href="/blog">Blog</Link>
          </div>
        </nav>
        <nav aria-label="Resources">
          <div className={col}>RESOURCES</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/faq">FAQ</Link>
            <Link className={link} href="/security">Security</Link>
            <Link className={link} href="/whitepaper">Whitepaper</Link>
            <Link className={link} href="/login">Sign In</Link>
          </div>
        </nav>
        <nav aria-label="Legal">
          <div className={col}>LEGAL</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/terms">Terms</Link>
            <Link className={link} href="/privacy">Privacy</Link>
            <Link className={link} href="/register">Register</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-5 py-5 text-[11px] text-fog sm:px-8 md:flex-row">
          <span>© 2026 Axiora Protocol. All figures simulated unless connected to a backend.</span>
          <span className="font-mono tracking-[0.15em]">TRADING INVOLVES RISK OF LOSS</span>
        </div>
      </div>
    </footer>
  );
}
