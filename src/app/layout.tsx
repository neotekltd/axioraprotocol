import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import 'geist/font/sans';
import 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicFloatingSupport } from '@/components/ax/shell';
import { LanguageProvider } from '@/components/LanguageProvider';
import { SITE_URL } from '@/lib/config';
import { dirOf } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });

// Pre-paint locale script: localStorage wins (survives login/logout),
// cookie second, default en. Sets lang (dir stays ltr) before first
// paint — no FOUC, no redirect, no separate routes.
const LOCALE_BOOT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)axiora-lang=(en|es)/);var l=window.localStorage.getItem('axiora-lang')||(m&&m[1])||'en';if(l!=='en'&&l!=='es')l='en';document.documentElement.lang=l;document.documentElement.dir='ltr';}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: 'Axiora Protocol — AI Consensus Trading Platform',
    template: '%s — Axiora Protocol',
  },
  description:
    'Axiora is an original AI consensus trading protocol interface: autonomous signal, risk, execution and sentiment agents, transparent statistics, calculator, and capital deployment dashboard.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  icons: {
    icon: '/axiora-mark.png',
    apple: '/axiora-mark.png',
  },
  openGraph: {
    title: 'Axiora Protocol — AI Consensus Trading',
    description: 'Autonomous order execution with multi-agent consensus, live statistics and auditable deployment flow.',
    type: 'website',
    url: '/',
    images: [{ url: '/axiora-logo.png', width: 1200, height: 744, alt: 'Axiora Protocol' }],
  },
  twitter: { card: 'summary_large_image', title: 'Axiora Protocol', description: 'AI consensus trading protocol interface.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} dir={dirOf(locale)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT }} />
      </head>
      <body className={`min-h-screen bg-void font-body ${display.variable}`}>
        <LanguageProvider initial={locale}>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <PublicFloatingSupport />
        </LanguageProvider>
      </body>
    </html>
  );
}
