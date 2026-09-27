import { HeroSection } from '@/components/sections/HeroSection';
import { ConvergenceSection } from '@/components/sections/ConvergenceSection';
import { BattleTestedSection } from '@/components/sections/BattleTestedSection';
import { BeyondScriptsSection } from '@/components/sections/BeyondScriptsSection';
import { ReturnsCalculatorSection } from '@/components/sections/ReturnsCalculatorSection';
import { BusinessModelSection } from '@/components/sections/BusinessModelSection';
import { ThreeStepsSection } from '@/components/sections/ThreeStepsSection';
import { ConsensusSection } from '@/components/sections/ConsensusSection';
import { ReferralSection } from '@/components/sections/ReferralSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { FaqSection } from '@/components/sections/FaqSection';

// Axiora Protocol homepage — reference section ORDER only.
// All copy, visuals, data and branding are Axiora-original.
export default function Home() {
  return (
    <div className="overflow-x-clip">
      <HeroSection />
      <ConvergenceSection />
      <BattleTestedSection />
      <BeyondScriptsSection />
      <ReturnsCalculatorSection />
      <BusinessModelSection />
      <ThreeStepsSection />
      <ConsensusSection />
      <ReferralSection />
      <BlogSection />
      <FaqSection />
    </div>
  );
}
