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
import { getDict } from '@/lib/i18n-server';

export function ModulesSection() {
  const t = getDict();
  return (
    <section id="modules" className="relative mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 md:px-8 md:py-28" aria-label={t.land.modulesAria}>
      <Reveal>
        <TechEyebrow index="01" label={t.inv.tabPlans.toUpperCase()} />
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">{t.land.modT}</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">
          {t.land.modS}
        </p>
      </Reveal>
      <ModuleCards />
      <ModuleCta />
    </section>
  );
}

export function SimulatorSection() {
  const t = getDict();
  return (
    <section id="simulator" className="scroll-mt-24 border-y border-white/5 bg-void/60" aria-label={t.land.simAria}>
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <TechEyebrow index="02" label={t.land.simAria.toUpperCase()} />
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">{t.land.simT}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist/75">{t.land.simS}</p>
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
  ['01', 'Fixed schedule', 'Every module runs a fixed 3, 7 or 14-day term with payouts every 6 hours. No open-ended positions.', 'TERMS · 3/7/14D'],
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
