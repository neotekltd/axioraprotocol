import { HeroAutopilot, CoinsStrip } from '@/components/landing/hero';
import { ModulesSection, SimulatorSection, SpecsSection } from '@/components/landing/modules';
import { BootSequence } from '@/components/landing/BootSequence';
import { TelemetrySection, ActivitySection, ReferralNetworkSection, FaqDiagnostics, FinalCta } from '@/components/landing/live';
import { ProtocolBackground, PageSpine } from '@/components/landing/background';
import { getProtocolStats } from '@/lib/queries';

// Axiora homepage — AIMEX information architecture and motion language
// (structure/composition only). All branding, copy, figures, artwork and
// data are Axiora-original: configuration, calculator rules, audited
// snapshots, or honest empty states. No AIMEX text, numbers or assets.

export default async function Home() {
  const stats = await getProtocolStats();
  return (
    <div className="relative overflow-x-clip bg-[#05080d]">
      <ProtocolBackground />
      <div className="relative">
        <PageSpine />
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
