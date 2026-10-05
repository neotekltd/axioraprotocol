'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { FaqAccordion } from '@/components/FaqAccordion';
import { NetworkViz } from '@/components/landing/network-viz';
import { TechEyebrow } from '@/components/landing/background';
import { useInViewOnce } from '@/components/landing/motion';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { useT } from '@/components/LanguageProvider';
import { CtaArrow } from '@/components/CtaArrow';
import { PLANS, formatUSD } from '@/lib/plans';

export function ReferralNetworkSection() {
  const t = useT();
  const [level, setLevel] = useState<number | null>(null);
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28" aria-label={t.land.refAria}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Reveal>
            <TechEyebrow index="07" label={t.header.nav.referrals.toUpperCase()} />
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{t.land.refT}</h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mist/75">{t.land.refS}</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8 space-y-2" onMouseLeave={() => setLevel(null)}>
              {PROTOCOL_CONFIG.referralLevels.slice(0, 3).map((r) => (
                <div
                  key={r.level}
                  onMouseEnter={() => setLevel(r.level)}
                  onFocus={() => setLevel(r.level)}
                  tabIndex={0}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${level === r.level ? 'border-pulse/70 bg-pulse/[0.06] shadow-glow' : 'border-line bg-panel/70 hover:border-pulse/40'}`}
                >
                  <span className={`font-mono font-bold ${level === r.level ? 'text-pulse' : 'text-white'}`}>L{r.level}</span>
                  <span className="font-mono text-xs text-fog">{t.land.instantDaily.replace('{i}', String(r.instantPct)).replace('{d}', String(r.dailySharePct))}</span>
                </div>
              ))}
              <p className="pt-1 text-xs text-fog">{t.land.deeper} <Link href="/referral-program" className="text-pulse">{t.footer.links.referrals}</Link>.</p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-lg bg-pulse px-6 py-3 text-sm font-bold text-black transition hover:brightness-110">{t.land.ctaLink}</Link>
              <Link href="/referral-program" className="rounded-lg border border-line px-6 py-3 text-sm hover:border-pulse/50">{t.land.howRef}</Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={120}>
          <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-panel/50 p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-fog">{t.land.topo}</div>
            <div className="mt-1"><NetworkViz highlight={level} /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FaqDiagnostics() {
  const t = useT();
  const minFaq = formatUSD(Math.min(...PLANS.map((p) => p.min)), { decimals: 0 });
  const rangesFaq = PLANS.map((p) => `${p.name} ${formatUSD(p.min, { decimals: 0 })}–${formatUSD(p.max, { decimals: 0 })}`).join(', ');
  const items = t.faqs.slice(0, 7).map((f) => ({ q: f.q, a: f.a.replace('{min}', minFaq).replace('{ranges}', rangesFaq) }));
  return (
    <section className="border-y border-white/5 bg-void/60" aria-label={t.land.faqAria}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <TechEyebrow index="08" label={t.land.faqAria.toUpperCase()} />
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.land.faqT}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mist/75">{t.land.faqS}</p>
          <div className="mt-6">
            <Link href="/faq" className="inline-block rounded-lg border border-line px-5 py-2.5 text-sm transition hover:border-pulse/50">{t.land.openAll}</Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="overflow-hidden rounded-xl border border-line bg-[#070b12]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-fog" dir="ltr">axiora://diagnostics</span>
            </div>
            <div className="p-3"><FaqAccordion items={items} numbered /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  const t = useT();
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-8">
      <Reveal>
        <div className="relative mt-16 overflow-hidden rounded-3xl border border-pulse/25 bg-[#060b13] p-8 text-center sm:p-14">
          <div className="tech-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="absolute left-1/2 top-0 h-40 w-[36rem] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.14),transparent_70%)]" aria-hidden="true" />
          <div className="relative">
            <div className="ping-soft mx-auto grid h-12 w-12 place-items-center rounded-full border border-pulse/50 bg-pulse/10 font-mono text-sm font-bold text-pulse">A×</div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{t.land.ctaT}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-fog">{t.land.ctaS}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="flex items-center gap-2 rounded-lg bg-pulse px-7 py-3 text-sm font-bold text-black shadow-glow transition hover:-translate-y-0.5 hover:brightness-110">{t.header.activateAccount}<CtaArrow /></Link>
              <Link href="#modules" className="rounded-lg border border-line px-7 py-3 text-sm transition hover:border-pulse/50 hover:text-white">{t.land.viewModules}</Link>
            </div>
          </div>
        </div>
      </Reveal>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-fog">
        {t.land.riskFull}
      </p>
    </div>
  );
}
