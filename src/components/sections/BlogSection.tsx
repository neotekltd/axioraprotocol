import Link from 'next/link';
import { Card } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const ARTICLES = [
  { c: 'PROTOCOL', d: 'Sep 23, 2026', t: 'Inside the Axiora Consensus Engine', e: 'One model can be wrong. Four independent agents forced to agree before execution changes the risk profile entirely.' },
  { c: 'RISK', d: 'Sep 14, 2026', t: 'Why Multi-Agent Trading Needs Risk Intelligence', e: 'Exposure caps, stop-loss enforcement and correlation monitoring gate every consensus decision.' },
  { c: 'EDUCATION', d: 'Sep 02, 2026', t: 'How Autonomous Crypto Execution Works', e: 'Win rate, P&L and capital are meaningless without timestamps, audit trails and backend sources.' },
];

export function BlogSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-page px-5 md:px-8">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="t-h2 text-3xl sm:text-4xl">Blog Insights</h2>
            <Link href="/blog" className="text-sm text-pulse">
              All articles →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.t} delay={i * 90}>
              <Card className="h-full overflow-hidden">
                <div className="grid h-44 place-items-center bg-[linear-gradient(135deg,rgba(0,210,148,0.22),rgba(0,210,148,0.02))] font-mono text-xs tracking-[0.2em] text-pulse">
                  AXIORA / {a.c}
                </div>
                <div className="p-6">
                  <div className="text-[0.6875rem] tracking-[0.2em] text-fog">{a.d} · {a.c}</div>
                  <div className="t-h3 mt-2 text-lg">{a.t}</div>
                  <p className="mt-2 text-sm leading-relaxed text-fog">{a.e}</p>
                  <div className="mt-3 text-sm text-pulse">Read →</div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
