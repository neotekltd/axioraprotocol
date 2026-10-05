'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AxioraLogo } from '@/components/AxioraLogo';
import { useT } from '@/components/LanguageProvider';

export function Footer() {
  const pathname = usePathname();
  const t = useT();
  // Authenticated /app area uses its own shell without the marketing footer.
  // Auth routes use the standalone AuthShell with its own footer.
  // /admin owns the dedicated admin shell.
  if (pathname.startsWith('/app') || pathname.startsWith('/admin')) return null;
  if (['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(pathname)) return null;
  const col = 'text-[11px] font-semibold tracking-[0.2em] text-fog';
  const link = 'block text-[13px] text-mist/75 hover:text-pulse transition-colors';
  return (
    <footer className="border-t border-line bg-[#04070c]">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
        <div>
          <AxioraLogo width={150} />
          <div className="mt-2 font-mono text-[10px] tracking-[0.25em] text-fog">{t.footer.tagline}</div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-fog">
            {t.footer.about}
          </p>
        </div>
        <nav aria-label={t.footer.protocol}>
          <div className={col}>{t.footer.protocol}</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/protocol">{t.footer.links.protocol}</Link>
            <Link className={link} href="/how-it-works">{t.footer.links.howItWorks}</Link>
            <Link className={link} href="/technology">{t.footer.links.technology}</Link>
            <Link className={link} href="/about">{t.footer.links.about}</Link>
          </div>
        </nav>
        <nav aria-label={t.footer.product}>
          <div className={col}>{t.footer.product}</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/calculator">{t.footer.links.calculator}</Link>
            <Link className={link} href="/referral-program">{t.footer.links.referrals}</Link>
            <Link className={link} href="/statistics">{t.footer.links.statistics}</Link>
            <Link className={link} href="/blog">{t.footer.links.blog}</Link>
          </div>
        </nav>
        <nav aria-label={t.footer.resources}>
          <div className={col}>{t.footer.resources}</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/faq">{t.footer.links.faq}</Link>
            <Link className={link} href="/security">{t.footer.links.security}</Link>
            <Link className={link} href="/whitepaper">{t.footer.links.whitepaper}</Link>
            <Link className={link} href="/login">{t.footer.links.signIn}</Link>
          </div>
        </nav>
        <nav aria-label={t.footer.legal}>
          <div className={col}>{t.footer.legal}</div>
          <div className="mt-3 space-y-2">
            <Link className={link} href="/terms">{t.footer.links.terms}</Link>
            <Link className={link} href="/privacy">{t.footer.links.privacy}</Link>
            <Link className={link} href="/register">{t.footer.links.register}</Link>
          </div>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-5 py-5 text-[11px] text-fog sm:px-8 md:flex-row">
          <span>{t.footer.notice}</span>
          <span className="font-mono tracking-[0.15em]">{t.footer.risk}</span>
        </div>
      </div>
    </footer>
  );
}
