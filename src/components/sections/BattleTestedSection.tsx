import { SectionEyebrow, DemoBadge } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const METRICS: [string, string][] = [
  ['LIVE CAPITAL', '$24.8M'],
  ['VERIFIED TRADES', '48,213'],
  ['PROTOCOL P&L', '$3.91M'],
  ['WIN RATE', '63.42%'],
];

export function BattleTestedSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-surface py-24 md:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_78%_45%,rgba(0,210,148,0.1),transparent)]" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="relative mx-auto grid max-w-page items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionEyebrow>BATTLE-TESTED PROTOCOL</SectionEyebrow>
            <h2 className="t-h2 mt-4 text-4xl sm:text-5xl lg:text-6xl">Designed for changing markets.</h2>
            <p className="t-body mt-6 max-w-lg text-[1.0625rem] text-mist/75">
              Axiora continuously evaluates market conditions, risk and execution before capital is deployed.
              Production stats stream from the backend — demo values below are simulated.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {METRICS.map(([k, v], i) => (
              <Reveal key={k} delay={i * 80}>
                <div className="rounded-2xl border border-line bg-void/70 p-5 md:p-6">
                  <div className="text-[0.6875rem] tracking-[0.2em] text-fog">{k}</div>
                  <div className="t-metric mt-2 text-2xl text-white md:text-[1.75rem]">{v}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="mt-6">
              <DemoBadge />
            </div>
          </Reveal>
        </div>
        <Reveal delay={150}>
          <div className="glass rounded-3xl p-8 md:p-12">
            <MachineMark />
            <p className="mt-6 text-xs leading-relaxed text-fog">
              Original autonomous trading-machine illustration (SVG). No reference artwork reproduced.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MachineMark() {
  return (
    <svg viewBox="0 0 400 220" className="w-full" role="img" aria-label="Axiora trading machine">
      <g stroke="#00D294" fill="none" opacity="0.85">
        <rect x="150" y="25" width="100" height="160" rx="14" fill="rgba(0,210,148,0.07)" />
        <circle cx="200" cy="78" r="18" fill="rgba(0,210,148,0.15)" />
        <line x1="170" y1="120" x2="230" y2="120" />
        <line x1="170" y1="136" x2="230" y2="136" />
        <line x1="170" y1="152" x2="210" y2="152" />
        <line x1="60" y1="100" x2="150" y2="100" strokeDasharray="5 5" />
        <line x1="250" y1="100" x2="340" y2="66" strokeDasharray="5 5" />
        <circle cx="60" cy="100" r="4" fill="#00D294" />
        <circle cx="340" cy="66" r="4" fill="#00D294" />
      </g>
    </svg>
  );
}
