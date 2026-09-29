// Landing group 2 (server): module section shell, simulator shell,
// specifications. Interactive children are client components.

import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import { SystemViz } from '@/components/landing/network-viz';
import { ModuleCards, ModuleCta } from '@/components/landing/ModuleCards';
import { SimulatorHome } from '@/components/landing/SimulatorHome';
import { BootSequence } from '@/components/landing/BootSequence';
import { PROTOCOL_CONFIG } from '@/lib/config';

export function ModulesSection() {
  return (
    <section id="modules" className="relative mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 md:px-8 md:py-28" aria-label="Investment modules">
      <Reveal>
        <TechEyebrow index="01" label="MODULES" />
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Pick the module that fits your capital.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">
          Three fixed terms on one capital range. Every rate below is Axiora&apos;s own model rate —
          estimates, never guarantees.
        </p>
      </Reveal>
      <ModuleCards />
      <ModuleCta />
    </section>
  );
}

export function SimulatorSection() {
  return (
    <section id="simulator" className="scroll-mt-24 border-y border-white/5 bg-void/60" aria-label="Simulator">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <TechEyebrow index="02" label="SIMULATOR" />
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Run the numbers before you run the plan.</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">Live Axiora arithmetic — the same functions the public calculator uses. Nothing hardcoded.</p>
        </Reveal>
        <Reveal delay={120}>
          <SimulatorHome />
        </Reveal>
      </div>
    </section>
  );
}

export { BootSequence };

const SPECS: [string, string, string, string][] = [
  ['01', 'Fixed schedule', 'Every module runs a fixed 30, 60 or 90-day term with payout at maturity. No open-ended positions.', 'TERMS · 30/60/90D'],
  ['02', 'Automatic withdrawals', 'Withdrawal requests record instantly with a balance hold and track state to completion.', 'REQUEST · TRACKED'],
  ['03', 'Principal returned', 'Deployed principal reserves for the term and returns at maturity per ledger records.', 'MATURITY · SETTLED'],
  ['04', 'Everything on record', 'Deployments, payouts, withdrawals and referrals write immutable ledger rows with full history.', 'LEDGER · RLS'],
];

export function SpecsSection() {
  return (
    <section className="border-b border-white/5 bg-void/60" aria-label="Specifications">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div className="rounded-2xl border border-line bg-panel/70 p-6 sm:p-8">
            <div className="font-mono text-[10px] tracking-[0.25em] text-fog">AXIORA CORE · CONSENSUS FABRIC</div>
            <div className="mt-4"><SystemViz /></div>
            <p className="mt-4 text-xs leading-relaxed text-fog">Original Axiora system render. Four agents, one gate, zero manual execution paths.</p>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <TechEyebrow index="04" label="SPECIFICATIONS" />
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Built to run without you watching.</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mist/75">Only shipped, implemented behavior is listed. Axiora provides the capital, accounting and settlement layer for strategies operated by external execution infrastructure.</p>
          </Reveal>
          <div className="mt-6 space-y-2.5">
            {SPECS.map(([n, t, b, m], i) => (
              <Reveal key={n} delay={i * 90}>
                <div className="card-sweep flex gap-3.5 rounded-xl border border-line bg-panel/70 p-4 transition hover:border-pulse/50">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-pulse/30 bg-pulse/[0.07] font-mono text-[11px] font-bold text-pulse" aria-hidden="true">{n}</span>
                  <div>
                    <div className="text-[15px] font-bold">{t}</div>
                    <p className="mt-1 text-[13px] leading-relaxed text-fog">{b}</p>
                    <div className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-fog">{m}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mt-4 text-xs text-fog">Full honest accounting of implemented vs. planned controls lives on the <Link href="/security" className="text-pulse">Security page</Link>.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ProtocolNote() {
  return (
    <p className="mt-4 text-xs text-fog">Sourced from protocol configuration. {PROTOCOL_CONFIG.withdrawalWindowNote}</p>
  );
}
