import { SectionEyebrow, Card } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const AGENTS = [
  { name: 'SIGNAL', title: 'Market Intelligence', points: ['Technical structure', 'Momentum', 'Liquidity', 'Market regime'] },
  { name: 'RISK', title: 'Risk Intelligence', points: ['Exposure', 'Correlation', 'Volatility', 'Drawdown', 'Position sizing'] },
  { name: 'EXECUTION', title: 'Execution Intelligence', points: ['Liquidity', 'Spread', 'Slippage', 'Order routing'] },
  { name: 'SENTIMENT', title: 'Sentiment Intelligence', points: ['Funding', 'Market mood', 'Social signals', 'Whale activity'] },
];

export function ConvergenceSection() {
  return (
    <section id="how" className="py-20 md:py-32">
      <div className="mx-auto max-w-page px-5 md:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <SectionEyebrow>HOW CONVERGENCE WORKS</SectionEyebrow>
          <h2 className="t-h2 mt-4 text-4xl sm:text-5xl">How Consensus Works</h2>
          <p className="t-body mt-5 max-w-2xl text-fog">
            Four autonomous agents analyze independently. A trade is executed only when the protocol reaches consensus.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mx-auto mt-14 hidden max-w-4xl justify-center md:flex">
            <DiagramHorizontal />
          </div>
          <div className="mx-auto mt-12 max-w-sm md:hidden">
            <DiagramVertical />
          </div>
        </Reveal>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((a, i) => (
            <Reveal key={a.name} delay={i * 80}>
              <Card className="h-full p-7">
                <div className="t-eyebrow text-pulse">{a.name}</div>
                <div className="t-h3 mt-2.5 text-lg">{a.title}</div>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-fog">
                  {a.points.map((p) => (
                    <li key={p}>· {p}</li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const box = 'rounded-xl border border-line bg-surface px-5 py-3 text-[0.6875rem] font-bold tracking-[0.22em] text-mist';

function DiagramHorizontal() {
  return (
    <div className="flex items-center gap-4 text-center">
      <div className="space-y-3">
        <div className={box}>SIGNAL</div>
        <div className={box}>RISK</div>
      </div>
      <span className="text-xl text-pulse">→</span>
      <div className="rounded-2xl border border-pulse/50 bg-pulse/10 px-8 py-6 shadow-glow">
        <div className="text-sm font-bold tracking-[0.22em] text-pulse">CONSENSUS</div>
      </div>
      <span className="text-xl text-pulse">→</span>
      <div className="space-y-3">
        <div className={box}>SENTIMENT</div>
        <div className={box}>EXECUTION</div>
      </div>
      <span className="text-xl text-pulse">→</span>
      <div className="rounded-xl bg-pulse px-6 py-4 text-sm font-bold text-black">TRADE</div>
    </div>
  );
}

function DiagramVertical() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {['SIGNAL', 'RISK', 'SENTIMENT', 'EXECUTION'].map((n) => (
        <div key={n} className={box}>
          {n}
        </div>
      ))}
      <div className="h-5 w-px bg-pulse" />
      <div className="rounded-2xl border border-pulse/50 bg-pulse/10 px-8 py-4 text-sm font-bold tracking-[0.22em] text-pulse">CONSENSUS</div>
      <div className="h-5 w-px bg-pulse" />
      <div className="rounded-xl bg-pulse px-8 py-3 text-sm font-bold text-black">TRADE</div>
    </div>
  );
}
