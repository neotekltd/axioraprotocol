import { HeroAutopilot, CoinsStrip } from '@/components/landing/hero';
import { PlanSyncProvider } from '@/components/landing/plan-sync';
import { ModulesSection, SimulatorSection, SpecsSection } from '@/components/landing/modules';
import { BootSequence } from '@/components/landing/BootSequence';
import { TelemetrySection } from '@/components/landing/telemetry';
import { LiveActivity } from '@/components/landing/live-activity';
import { ReferralNetworkSection, FaqDiagnostics, FinalCta } from '@/components/landing/live';
import { ProtocolBackground } from '@/components/landing/background';
import { getHomepageFeed } from '@/lib/queries';
import { getProtocolTelemetry } from '@/lib/telemetry';

// Axiora homepage — AIMEX capital/settlement information architecture
// (structure/composition only). Axiora is the capital, accounting and
// settlement layer; strategy/model work happens externally. All branding,
// copy, figures and data are Axiora-original: configuration, calculator
// rules, audited snapshots, or honest empty states.

export default async function Home() {
  const [telemetry, activity] = await Promise.all([getProtocolTelemetry(), getHomepageFeed()]);
  return (
    <div className="relative overflow-x-clip bg-[#05080d]">
      <ProtocolBackground />
      <div className="relative">
        <HeroAutopilot />
        <CoinsStrip />
        <PlanSyncProvider>
          <ModulesSection />
          <SimulatorSection />
        </PlanSyncProvider>
        <BootSequence />
        <SpecsSection />
        <TelemetrySection data={telemetry} />
        <LiveActivity initial={activity} />
        <ReferralNetworkSection />
        <FaqDiagnostics />
        <FinalCta />
      </div>
    </div>
  );
}
