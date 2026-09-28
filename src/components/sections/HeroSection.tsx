'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SectionEyebrow } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const ConsensusCanvas = dynamic(() => import('@/components/ConsensusCanvas').then((m) => m.ConsensusCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(0,210,148,0.14),transparent_65%)]" />,
});

const STATS: [string, string][] = [
  ['$10', 'MINIMUM DEPLOYMENT'],
  ['24/7', 'AUTONOMOUS MONITORING'],
  ['4', 'AI AGENTS'],
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pb-20 pt-32 md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_72%_32%,rgba(0,210,148,0.12),transparent)]" />
      <div className="relative mx-auto grid w-full max-w-page items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div>
          <Reveal>
            <SectionEyebrow>AI-POWERED CONVERGENCE PROTOCOL</SectionEyebrow>
            <h1 className="t-display mt-5 text-[2.75rem] sm:text-6xl xl:text-[4.5rem]">
              Autonomous Intelligence.
              <br />
              Executed by <span className="text-pulse text-glow">Consensus.</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="t-body mt-6 max-w-lg text-base text-mist/80">
              Axiora Protocol combines autonomous trading agents, real-time market intelligence and
              risk-controlled execution into a single consensus-driven trading system.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/protocol" className="rounded-xl border border-line px-6 py-3 text-sm text-mist hover:border-pulse/50 hover:text-white">
                Explore Protocol
              </Link>
              <Link href="/statistics" className="rounded-xl bg-pulse px-6 py-3 text-sm font-semibold text-black shadow-glow hover:brightness-110">
                View Statistics
              </Link>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/5 pt-7">
              {STATS.map(([v, l]) => (
                <div key={l}>
                  <dd className="t-metric text-[1.375rem] text-white">{v}</dd>
                  <dt className="mt-1.5 block text-[0.6875rem] tracking-[0.18em] text-fog">{l}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        <Reveal delay={150} className="relative">
          <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
            <div className="absolute inset-0 motion-safe:block hidden">
              <ConsensusCanvas />
            </div>
            <div className="absolute inset-x-6 bottom-2 top-auto">
              <BullMark />
            </div>
            <div className="absolute right-2 top-2 flex items-center gap-2 rounded-full border border-line bg-void/70 px-3.5 py-1.5 text-[0.6875rem] tracking-[0.2em] text-fog backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pulse" /> LIVE SIM
            </div>
          </div>
          <p className="mt-3 text-center text-[0.6875rem] tracking-[0.2em] text-fog">AXIORA MARKET CORE · ORIGINAL RENDER</p>
        </Reveal>
      </div>
    </section>
  );
}

function BullMark() {
  return (
    <svg viewBox="0 0 400 220" className="w-full" role="img" aria-label="Axiora abstract market core">
      <defs>
        <linearGradient id="axg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34D399" stopOpacity="0.9" />
          <stop offset="1" stopColor="#00BB7F" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#axg)" strokeWidth="1.2" opacity="0.9">
        <polygon points="60,170 110,90 170,110 200,60 260,80 320,50 340,140 260,190 140,185" fill="rgba(0,210,148,0.06)" />
        <polygon points="110,90 170,110 150,160 90,165" fill="rgba(0,210,148,0.1)" />
        <polygon points="200,60 260,80 240,140 180,125" fill="rgba(0,210,148,0.12)" />
        <line x1="40" y1="180" x2="365" y2="120" strokeDasharray="4 5" opacity="0.6" />
        <circle cx="200" cy="60" r="3" fill="#00D294" />
        <circle cx="320" cy="50" r="3" fill="#00D294" />
        <circle cx="110" cy="90" r="2.5" fill="#00D294" />
      </g>
    </svg>
  );
}
