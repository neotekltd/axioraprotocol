import { CalculatorWidget } from '@/components/CalculatorWidget';
import { SectionEyebrow, SectionTitle } from '@/components/ui';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Calculator',
  description: 'Model Axiora deployment outcomes by amount and term. Instant estimates, server-quoted at confirmation.',
  alternates: { canonical: '/calculator' },
};

export default function CalculatorPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-40 pb-20">
      <SectionEyebrow>{t.pub.calcEyebrow}</SectionEyebrow>
      <SectionTitle>{t.pub.calcTitle}</SectionTitle>
      <p className="mt-3 text-sm text-fog max-w-2xl">{t.pub.calcLede}</p>
      <div className="mt-8"><CalculatorWidget /></div>
    </div>
  );
}
