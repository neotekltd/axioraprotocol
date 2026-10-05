// Landing hero: settlement-platform positioning. "Capital on autopilot."
// with a compact externally-backed intelligence strip (Claude/GPT/Fable/
// Astra are owner-confirmed models of the SEPARATE external strategy app —
// shown only as the external source, never as Axiora activity). Centered
// robot scene (robot / beam / SAY HELLO / stat cards) with the asset
// strip transitioning into the next section.

import Link from 'next/link';
import { TechEyebrow } from '@/components/landing/background';
import { HeroRobotStage } from '@/components/landing/robot/HeroRobotStage';
import { LaunchStamp } from '@/components/landing/launch-stamp';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { PLANS } from '@/lib/plans';
import { getDict } from '@/lib/i18n-server';
import type { Dictionary } from '@/lib/i18n-dict';

const MODELS = ['CLAUDE', 'GPT', 'FABLE', 'ASTRA'];

// Directional arrow for primary CTAs (decorative icon, never mirrored —
 // both locales are LTR).
export function CtaArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Terminal-style boot log with REAL Axiora facts (plan count, payout
// cycle from the canonical plan config). Axiora-original copy, staggered
// entrance matching the hero choreography. Decorative only.
function BootLog({ t }: { t: Dictionary }) {
  const cycle = PLANS[0]?.cycleHours ?? 6;
  const lines = [
    t.land.bootLedger,
    t.land.bootPlans.replace('{n}', String(PLANS.length)),
    t.land.bootCycle.replace('{h}', String(cycle)),
  ];
  return (
    <div className="hero-in mx-auto mt-6 max-w-xs text-left font-mono text-[11px] leading-relaxed text-fog" aria-hidden="true" style={{ animationDelay: '900ms' }}>
      {lines.map((l) => (
        <p key={l}>
          <span className="text-pulse">›</span> {l} <b className="text-[#35D98B]">ok</b>
        </p>
      ))}
      <p>
        <span className="text-pulse">›</span> {t.land.bootReady}
        <span className="ax-caret" />
      </p>
    </div>
  );
}

export function HeroAutopilot() {
  const t = getDict();
  return (
    <section className="relative overflow-hidden pb-14 pt-32 md:pb-16 md:pt-40" aria-label={t.land.introAria}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(34,211,238,0.08),transparent)]" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="hero-in flex justify-center" style={{ animationDelay: '250ms' }}>
            <TechEyebrow index="" label={t.land.eyebrow} />
          </div>
          <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.0] tracking-[-0.025em] sm:text-6xl xl:text-[4rem]">
            <span className="hero-in block" style={{ animationDelay: '400ms' }}>{t.land.heroA}</span>
            <span className="hero-in block text-pulse text-glow" style={{ animationDelay: '500ms' }}>{t.land.heroB}</span>
          </h1>
          <p className="hero-in mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-mist/80" style={{ animationDelay: '650ms' }}>
            {t.land.heroSub}
          </p>
          <div className="hero-in mt-7 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '800ms' }}>
            <Link href="/register" className="flex items-center gap-2 rounded-md bg-pulse px-5 py-2.5 text-[13px] font-bold text-black shadow-glow transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B]">
              {t.header.activateAccount}
              <CtaArrow />
            </Link>
            <Link href="/how-it-works" className="rounded-md border border-line px-5 py-2.5 text-[13px] text-mist transition hover:border-pulse/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B]">
              {t.header.drawer.howItWorks}
            </Link>
          </div>
          <BootLog t={t} />
          <LaunchStamp />
        </div>
        <div className="hero-in relative mx-auto mt-8 max-w-[720px]" style={{ animationDelay: '950ms' }}>
          <HeroRobotStage />
          <p className="mt-3 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-fog">{t.land.flowLine}</p>
        </div>
      </div>
      <div className="hero-in relative mx-auto mt-10 max-w-[1200px] px-5 md:px-8" style={{ animationDelay: '1050ms' }}>
        <div className="rounded-xl border border-line bg-void/60 px-5 py-4">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <div className="font-mono text-[10px] tracking-[0.25em] text-fog">{t.land.poweredBy}</div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 md:justify-start">
                {MODELS.map((m) => (
                  <span key={m} className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.15em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-pulse/70" aria-hidden="true" />{m}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-fog">
              <span className="text-center">{t.land.extA}<br />{t.land.extB}</span>
              <span className="text-pulse" aria-hidden="true">↓</span>
              <span className="rounded-md border border-pulse/40 bg-pulse/[0.07] px-3 py-2 text-center text-pulse">{t.land.axA}<br />{t.land.axB}</span>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-fog md:text-left">{t.land.modelNote}</p>
        </div>
      </div>
    </section>
  );
}

export function CoinsStrip() {
  const t = getDict();
  return (
    <section aria-label={t.land.connected} className="border-y border-white/5 bg-void/60">
      <div className="robot-ticker thin-scroll mx-auto flex max-w-[1200px] items-center gap-2.5 overflow-x-auto px-5 py-3 md:px-8">
        <span className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-fog">{t.land.connected}</span>
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        {PROTOCOL_CONFIG.supportedAssets.map((a) => (
          <span key={a} className="group flex shrink-0 items-center gap-2 rounded-full border border-line bg-panel py-1.5 pl-1.5 pr-3 transition hover:border-pulse/50">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-pulse/40 bg-pulse/[0.08] font-mono text-[10px] font-bold text-pulse" aria-hidden="true">
              {a.slice(0, 1)}
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wide text-mist">{a}</span>
          </span>
        ))}
        <span className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        <span className="shrink-0 text-[11px] text-fog">{t.land.depositsConvert}</span>
      </div>
    </section>
  );
}
