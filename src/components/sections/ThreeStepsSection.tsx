import { Card } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

const STEPS: [string, string, string][] = [
  ['01 — FUND', 'Fund', 'Connect your supported wallet and fund your Axiora account.'],
  ['02 — DEPLOY', 'Deploy', 'Choose your allocation and deployment parameters.'],
  ['03 — EARN', 'Earn', 'Monitor protocol activity, performance and completed execution cycles.'],
];

export function ThreeStepsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-page px-5 text-center md:px-8">
        <Reveal>
          <h2 className="t-h2 text-4xl sm:text-5xl">Three Steps. Four Agents.</h2>
          <p className="t-body mx-auto mt-5 max-w-xl text-fog">From funding to deployment to monitored execution.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 text-left md:grid-cols-3">
          {STEPS.map(([k, t, d], i) => (
            <Reveal key={k} delay={i * 90}>
              <Card className="h-full p-7">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-pulse" />
                  <span className="text-xs font-bold tracking-[0.2em] text-pulse">{k}</span>
                </div>
                <div className="t-h3 mt-4 text-xl">{t}</div>
                <p className="t-body mt-2.5 text-sm text-mist/80">{d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
