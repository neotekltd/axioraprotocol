import { FAQS } from '@/lib/mock';
import { SectionEyebrow, SectionTitle, Card } from '@/components/ui';

export const metadata = { title: 'FAQ' };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-28 pb-20">
      <SectionEyebrow>SUPPORT</SectionEyebrow>
      <SectionTitle>Frequently asked questions</SectionTitle>
      <div className="mt-8 space-y-3">
        {FAQS.map((f) => (
          <Card key={f.q} className="p-5">
            <div className="font-semibold">{f.q}</div>
            <p className="mt-2 text-sm text-fog leading-relaxed">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
