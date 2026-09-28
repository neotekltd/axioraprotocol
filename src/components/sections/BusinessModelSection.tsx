import Link from 'next/link';
import { SectionEyebrow } from '@/components/ui';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { Reveal } from '@/components/Reveal';

export function BusinessModelSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-page items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div>
          <Reveal>
            <SectionEyebrow>BUSINESS MODEL</SectionEyebrow>
            <h2 className="t-h2 mt-4 text-4xl sm:text-5xl">Transparent protocol economics</h2>
            <p className="t-body mt-6 max-w-lg text-mist/75">
              Axiora&apos;s protocol economics are designed around transparent execution and clearly defined
              protocol fees.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {['PROTOCOL', 'FEES', 'TRANSPARENCY'].map((t) => (
                <span key={t} className="rounded-full border border-pulse/30 bg-pulse/10 px-5 py-2 text-[0.6875rem] font-bold tracking-[0.2em] text-pulse">
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[['NO DEPOSIT FEE', '0%'], ['0% PLATFORM WITHDRAWAL', 'fee'], ['NO MANAGEMENT', 'fee']].map(([a, b], i) => (
              <Reveal key={a} delay={i * 80}>
                <div className="rounded-2xl border border-line bg-surface p-4 md:p-5">
                  <div className="text-xs font-bold leading-snug">{a}</div>
                  <div className="mt-1 text-[0.6875rem] text-fog">{b}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={140}>
            <p className="mt-5 max-w-md text-xs leading-relaxed text-fog">
              Protocol fee: {(PROTOCOL_CONFIG.performanceFeeRate * 100).toFixed(0)}% on profit only ·
              configured transparently in admin. Never copy another protocol&apos;s fee percentages.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/investor-deck" className="inline-block rounded-xl bg-pulse px-7 py-3.5 text-[0.9375rem] font-semibold text-black shadow-glow hover:brightness-110">
                Investor Deck
              </Link>
              <Link href="/whitepaper" className="inline-block rounded-xl border border-line px-7 py-3.5 text-[0.9375rem] hover:border-pulse/50">
                Whitepaper
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={150}>
          <div className="glass rounded-3xl p-8 md:p-12">
            <LiquidityTowers />
            <div className="mt-5 flex justify-between text-[0.6875rem] tracking-[0.2em] text-fog">
              <span>CAPITAL</span>
              <span>PERFORMANCE</span>
              <span>EXECUTION</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LiquidityTowers() {
  const bars = [34, 52, 44, 70, 62, 92, 84];
  return (
    <div className="flex h-56 items-end justify-center gap-3 md:h-72" role="img" aria-label="Axiora liquidity visualization">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-10 rounded-t-lg border border-pulse/40 bg-pulse/10 md:w-12"
          style={{ height: `${h}%`, boxShadow: '0 0 28px rgba(0,210,148,0.25)' }}
        />
      ))}
    </div>
  );
}
