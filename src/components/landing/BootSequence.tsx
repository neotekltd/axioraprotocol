'use client';

import { useEffect, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import { useInViewOnce } from '@/components/landing/motion';
import { useT } from '@/components/LanguageProvider';

const NUMS = ['01', '02', '03', '04'];

// Boot sequence: nodes activate in staged order with a traveling signal
// once the section scrolls into view. Plays once.
export function BootSequence() {
  const t = useT();
  const STEPS = t.bootSteps.map((s, i) => [NUMS[i], s.t, s.s] as const);
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.3);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(4);
      return;
    }
    setStage(1);
    const timers = [2, 3, 4].map((s, i) => setTimeout(() => setStage(s), 700 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28" aria-label={t.land.bootAria}>
      <Reveal>
        <div className="text-center">
          <div className="inline-block"><TechEyebrow index="03" label={t.land.bootAria.toUpperCase()} /></div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{t.land.bootT}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-fog">{t.land.bootS}</p>
        </div>
      </Reveal>
      <div ref={ref} className="relative mt-12">
        <div className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-white/[0.08] md:block" aria-hidden="true">
          <div className={`boot-line h-full bg-gradient-to-r from-pulseDim via-pulse to-pulseBright ${stage > 0 ? 'go' : ''}`} />
          {stage > 0 && stage < 4 && <span className="signal-x" style={{ animationDuration: '1.8s' }} />}
        </div>
        <ol className="grid gap-8 md:grid-cols-4 md:gap-4">
          {STEPS.map(([n, title, body], i) => {
            const on = stage > i;
            return (
              <li key={n} className="relative flex gap-4 md:block md:text-center">
                <div className="md:hidden" aria-hidden="true">
                  <div className={`mt-1 h-full w-px bg-white/[0.08]`} />
                </div>
                <div
                  className={`relative z-10 mx-auto grid h-12 w-12 shrink-0 place-items-center rounded-full border font-mono text-xs font-bold transition-all duration-500 ${
                    on ? 'border-pulse/70 bg-pulse/10 text-pulse shadow-glow' : 'border-line bg-panel text-fog'
                  } ${on ? 'ping-soft' : ''}`}
                  aria-hidden="true"
                >
                  {n}
                </div>
                <div className="md:mt-5">
                  <div className={`font-bold transition-colors duration-500 ${on ? 'text-white' : 'text-mist/60'}`}>{title}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fog">{body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
