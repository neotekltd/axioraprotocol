// Landing hero: settlement-platform positioning. "Capital on autopilot."
// with a compact externally-backed intelligence strip (Claude/GPT/Fable/
// Astra are owner-confirmed models of the SEPARATE external strategy app —
// shown only as the external source, never as Axiora activity). Factual
// terms panel, capital-flow visual.

import Link from 'next/link';
import { TechEyebrow } from '@/components/landing/background';
import { HeroRobotStage } from '@/components/landing/robot/HeroRobotStage';
import { PROTOCOL_CONFIG } from '@/lib/config';

const MODELS = ['CLAUDE', 'GPT', 'FABLE', 'ASTRA'];

const STATUS_ROWS: [string, string][] = [
  ['RATE', '1.00–2.00% per 6h'],
  ['CYCLE', 'Every 6 hours'],
  ['ENTRY', 'From $10'],
  ['PRINCIPAL', 'Returned at maturity'],
];

export function HeroAutopilot() {
  return (
    <section className="relative overflow-hidden pb-14 pt-40 md:pb-16 md:pt-44" aria-label="Introduction">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_72%_32%,rgba(34,211,238,0.1),transparent)]" aria-hidden="true" />
      <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 640">
        <g stroke="#22D3EE" strokeOpacity="0.14" strokeWidth="1">
          <line x1="620" y1="0" x2="900" y2="640" />
          <line x1="760" y1="0" x2="1040" y2="640" />
          <line x1="480" y1="640" x2="820" y2="120" />
          <line x1="0" y1="480" x2="1200" y2="380" strokeOpacity="0.07" />
        </g>
        <g fill="#22D3EE">
          <circle cx="820" cy="120" r="2.5" opacity="0.5" className="pulse-node" />
          <circle cx="900" cy="640" r="2.5" opacity="0.4" />
          <circle cx="680" cy="420" r="2" opacity="0.45" className="pulse-node" />
          <circle cx="1040" cy="300" r="2" opacity="0.35" />
        </g>
      </svg>
      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6">
        <div>
          <div className="hero-in" style={{ animationDelay: '250ms' }}>
            <TechEyebrow index="" label="AXIORA PROTOCOL / SETTLEMENT PLATFORM" />
          </div>
          <h1 className="mt-4 max-w-[12ch] text-[2.6rem] font-bold leading-[1.0] tracking-[-0.025em] sm:text-6xl xl:text-[4rem]">
            <span className="hero-in block" style={{ animationDelay: '400ms' }}>Capital on autopilot.</span>
            <span className="hero-in block text-pulse text-glow" style={{ animationDelay: '500ms' }}>Backed by frontier intelligence.</span>
          </h1>
          <p className="hero-in mt-5 max-w-md text-[15px] leading-relaxed text-mist/80" style={{ animationDelay: '650ms' }}>
            One place for deposits, scheduled earnings and withdrawals. Strategies powering
            Axiora are developed and evaluated using leading frontier AI models.
          </p>
          <div className="hero-in mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '800ms' }}>
            <Link href="/register" className="rounded-md bg-pulse px-5 py-2.5 text-[13px] font-bold text-black shadow-glow transition hover:brightness-110">
              Activate account
            </Link>
            <Link href="/how-it-works" className="rounded-md border border-line px-5 py-2.5 text-[13px] text-mist transition hover:border-pulse/50 hover:text-white">
              How it works
            </Link>
          </div>
          <div className="hero-in mt-6 grid max-w-sm grid-cols-3 gap-2 rounded-lg border border-line bg-void/70 p-3.5" style={{ animationDelay: '900ms' }}>
            {[
              ['RATE', '1.00–2.00% / 6h'],
              ['CYCLE', 'Every 6 hours'],
              ['ENTRY', 'From $10'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] tracking-[0.18em] text-fog">{k}</dt>
                <dd className="mt-0.5 font-mono text-[12px] font-bold text-mist">{v}</dd>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-in relative" style={{ animationDelay: '950ms' }}>
          <HeroRobotStage />
          <p className="mt-3 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-fog">DEPOSIT → PLAN → SETTLEMENT → WALLET</p>
        </div>
      </div>
      <div className="hero-in relative mx-auto mt-10 max-w-[1200px] px-5 md:px-8" style={{ animationDelay: '1050ms' }}>
        <div className="rounded-xl border border-line bg-void/60 px-5 py-4">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <div className="font-mono text-[10px] tracking-[0.25em] text-fog">POWERED BY FRONTIER INTELLIGENCE</div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 md:justify-start">
                {MODELS.map((m) => (
                  <span key={m} className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.15em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-pulse/70" aria-hidden="true" />{m}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-fog">
              <span className="text-center">EXTERNAL<br />STRATEGY ENGINE</span>
              <span className="text-pulse" aria-hidden="true">↓</span>
              <span className="rounded-md border border-pulse/40 bg-pulse/[0.07] px-3 py-2 text-center text-pulse">AXIORA<br />CAPITAL · PLANS · PAYOUTS</span>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-fog md:text-left">Model strategy operates in a separate application. Axiora handles capital, accounting and settlement.</p>
        </div>
      </div>
    </section>
  );
}

export function CoinsStrip() {
  return (
    <section aria-label="Connected assets" className="border-y border-white/5 bg-void/60">
      <div className="thin-scroll mx-auto flex max-w-[1200px] items-center gap-2.5 overflow-x-auto px-5 py-3 md:px-8">
        <span className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-fog">CONNECTED ASSETS</span>
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        {PROTOCOL_CONFIG.supportedAssets.map((a) => (
          <span key={a} className="group flex shrink-0 items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1.5 transition hover:border-pulse/50">
            <span className="h-1 w-1 rounded-full bg-pulse/70 transition group-hover:bg-pulse" aria-hidden="true" />
            <span className="font-mono text-[11px] font-bold tracking-wide text-mist">{a}</span>
          </span>
        ))}
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        <span className="shrink-0 text-[11px] text-fog">Deposits convert to USDT on arrival</span>
      </div>
    </section>
  );
}
