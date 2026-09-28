import { SectionEyebrow, Card } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const METRICS: [string, string][] = [
  ['WIN RATE', '63.42%'],
  ['TRADES', '48,213'],
  ['RETURN', '+15.8%'],
  ['CURRENT VALUE', '$28.7M'],
];

export function ConsensusSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-page px-5 md:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <SectionEyebrow>TECHNICAL CREDIBILITY</SectionEyebrow>
          <h2 className="t-h2 mt-4 text-4xl sm:text-5xl">Built for Consensus</h2>
          <p className="t-body mt-5 max-w-xl text-fog">
            Multi-agent intelligence. Risk-controlled execution. Transparent infrastructure.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card className="h-full p-8 md:p-12">
              <div className="text-xs font-bold tracking-[0.22em]">CONSENSUS-DRIVEN EXECUTION</div>
              <div className="mt-6 font-mono text-sm leading-9 text-mist/85 md:text-base md:leading-10">
                Signal ──┐<br />
                Risk ────┤<br />
                Sentiment ┤ → <span className="font-bold text-pulse">CONSENSUS</span> → EXECUTION
                <br />
                Execution ┘
              </div>
            </Card>
          </Reveal>
          <Reveal delay={120}>
            <Card className="h-full border-pulse/25 p-8 md:p-10">
              <div className="text-xs font-bold tracking-[0.22em] text-pulse">RISK-FIRST ENGINE</div>
              <ul className="mt-5 space-y-3 text-[0.9375rem] text-fog">
                <li>· Dynamic sizing</li>
                <li>· Correlation</li>
                <li>· Portfolio exposure</li>
                <li>· Drawdown controls</li>
              </ul>
            </Card>
          </Reveal>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {METRICS.map(([k, v], i) => (
            <Reveal key={k} delay={i * 70}>
              <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
                <div className="text-[0.6875rem] tracking-[0.2em] text-fog">{k}</div>
                <div className="t-metric mt-2 text-xl md:text-2xl">{v}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <Card className="h-full p-8">
              <div className="text-xs font-bold tracking-[0.22em]">TRANSPARENT FEE MODEL</div>
              <ul className="mt-5 space-y-3 text-[0.9375rem] text-fog">
                <li>· No deposit fee</li>
                <li>· 0% platform withdrawal fee</li>
                <li>· No management fee</li>
                <li>· Performance fee on profit only, disclosed up front</li>
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={100}>
            <Card className="h-full p-8">
              <div className="text-xs font-bold tracking-[0.22em]">BANK-GRADE SECURITY</div>
              <ul className="mt-5 space-y-3 text-[0.9375rem] text-fog">
                <li>· AES-256 encryption at rest</li>
                <li>· TLS 1.3 data in transit</li>
                <li>· 2FA account + withdrawal protection</li>
                <li>· DDoS infrastructure protection</li>
              </ul>
              <p className="mt-4 text-xs text-fog">Claim only what is implemented and audited.</p>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
