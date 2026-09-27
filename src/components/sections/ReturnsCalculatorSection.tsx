import { CalculatorWidget } from '@/components/CalculatorWidget';
import { SectionEyebrow } from '@/components/ui';
import { Reveal } from '@/components/Reveal';

export function ReturnsCalculatorSection() {
  return (
    <section className="py-24 md:py-36">
      <div className="mx-auto max-w-page px-5 md:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <SectionEyebrow>INTERACTIVE</SectionEyebrow>
          <h2 className="t-h2 mt-4 text-4xl sm:text-5xl">Model Your Returns</h2>
          <p className="t-body mt-5 max-w-xl text-fog">
            Explore how deployment size and duration affect projected protocol outcomes. Axiora values come from
            Axiora business rules — never copied claims.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mx-auto mt-14 max-w-5xl">
            <CalculatorWidget />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
