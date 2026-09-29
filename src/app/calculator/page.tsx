import { CalculatorWidget } from '@/components/CalculatorWidget';
import { SectionEyebrow, SectionTitle } from '@/components/ui';

export const metadata = {
  title: 'Calculator',
  description: 'Model Axiora deployment outcomes by amount and term. Instant estimates, server-quoted at confirmation.',
  alternates: { canonical: '/calculator' },
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-40 pb-20">
      <SectionEyebrow>INVESTMENT CALCULATOR</SectionEyebrow>
      <SectionTitle>Model deployment outcomes</SectionTitle>
      <p className="mt-3 text-sm text-fog max-w-2xl">Term 20–90 days · capital $10–$100,000 · instant frontend estimate. Authoritative figures come from <code>GET /api/deployments/quote</code> at confirmation.</p>
      <div className="mt-8"><CalculatorWidget /></div>
    </div>
  );
}
