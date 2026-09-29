import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import 'geist/font/sans';
import 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublicFloatingSupport } from '@/components/ax/shell';
import { SITE_URL } from '@/lib/config';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' });

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
  return (
    <html lang="en">
      <body className={`min-h-screen bg-void font-body ${display.variable}`}>
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <PublicFloatingSupport />
      </body>
    </html>
  );
}
