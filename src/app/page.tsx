import { HeroAutopilot, CoinsStrip } from '@/components/landing/hero';
import { IntelligenceSection } from '@/components/landing/intelligence';
import { ModulesSection, SimulatorSection, SpecsSection } from '@/components/landing/modules';
import { BootSequence } from '@/components/landing/BootSequence';
import { TelemetrySection, ActivitySection, ReferralNetworkSection, FaqDiagnostics, FinalCta } from '@/components/landing/live';
import { ProtocolBackground, PageSpine } from '@/components/landing/background';
import { getProtocolStats } from '@/lib/queries';
import { getAgentStates } from '@/lib/agents';

// Axiora homepage — AIMEX information architecture and motion language
// (structure/composition only). All branding, copy, figures, artwork and
// data are Axiora-original: configuration, calculator rules, agent registry,
// audited snapshots, or honest empty states. No AIMEX text, numbers or assets.

export default async function Home() {
  const [stats, agents] = await Promise.all([getProtocolStats(), getAgentStates()]);
  return (
    <div className="relative overflow-x-clip bg-[#05080d]">
      <ProtocolBackground />
      <div className="relative">
        <PageSpine />
        <HeroAutopilot agents={agents} />
        <CoinsStrip />
        <IntelligenceSection agents={agents} />
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
