// Landing group 2 (server): module section shell, simulator shell,
// specifications. Interactive children are client components.

import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { TechEyebrow } from '@/components/landing/background';
import { ModuleCards, ModuleCta } from '@/components/landing/ModuleCards';
import { SimulatorHome } from '@/components/landing/SimulatorHome';
import { BootSequence } from '@/components/landing/BootSequence';
import { SpecsInteractive } from '@/components/landing/SpecsInteractive';
import { PROTOCOL_CONFIG } from '@/lib/config';

export function ModulesSection() {
  return (
    <section id="modules" className="relative mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 md:px-8 md:py-28" aria-label="Investment modules">
      <Reveal>
        <TechEyebrow index="01" label="MODULES" />
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Pick the module that fits your capital.</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">
          Three fixed modules, one per capital band. Every rate below is Axiora&apos;s own
          per-credit rate — estimates, never guarantees.
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
  return <SpecsInteractive />;
}

export function ProtocolNote() {
  return (
    <p className="mt-4 text-xs text-fog">Sourced from protocol configuration. {PROTOCOL_CONFIG.withdrawalWindowNote}</p>
  );
}
