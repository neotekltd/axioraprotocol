import { PageHero, Prose, CTASection } from '@/components/public';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of the Axiora Protocol demo interface.',
  alternates: { canonical: '/terms' },
};

function H({ children }: { children: string }) {
  return <h2 className="pt-4 text-lg font-bold text-white">{children}</h2>;
}

export default function TermsPage() {
  const t = getDict();
  return (
    <div>
      <PageHero
        eyebrow={t.pub.termsEyebrow}
        title={t.pub.termsTitle}
        lede={t.pub.termsLede}
      />
      <div className="py-12">
        <Prose>
          {t.pub.termsH.map((h, i) => (
            <div key={h}>
              <H>{h}</H>
              <p>{t.pub.termsP[i]}</p>
            </div>
          ))}
        </Prose>
      </div>
      <CTASection
        title={t.pub.termsCtaT}
        body={t.pub.termsCtaB}
        primaryLabel={t.header.drawer.faq}
        primaryHref="/faq"
        secondaryLabel={t.header.getStarted}
        secondaryHref="/register"
      />
    </div>
  );
}
