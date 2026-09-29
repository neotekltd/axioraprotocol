import { HeroAutopilot, CoinsStrip } from '@/components/landing/hero';
import { ModulesSection, SimulatorSection, SpecsSection } from '@/components/landing/modules';
import { BootSequence } from '@/components/landing/BootSequence';
import { TelemetrySection, ActivitySection, ReferralNetworkSection, FaqDiagnostics, FinalCta } from '@/components/landing/live';
import { ProtocolBackground } from '@/components/landing/background';
import { getProtocolStats } from '@/lib/queries';

// Axiora homepage — AIMEX capital/settlement information architecture
// (structure/composition only). Axiora is the capital, accounting and
// settlement layer; strategy/model work happens externally. All branding,
// copy, figures and data are Axiora-original: configuration, calculator
// rules, audited snapshots, or honest empty states.

export default async function Home() {
  const stats = await getProtocolStats();
  return (
    <div className="relative overflow-x-clip bg-[#05080d]">
      <ProtocolBackground />
      <div className="relative">
        <HeroAutopilot />
        <CoinsStrip />
        <ModulesSection />
        <SimulatorSection />
        <BootSequence />
        <SpecsSection />
        <TelemetrySection stats={stats} />
        <ActivitySection />
        <ReferralNetworkSection />
        <FaqDiagnostics />
        <FinalCta />
      </div>
    </div>
  );
}
