import { PageHero, Prose, CTASection } from '@/components/public';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Privacy Policy',
  description: 'What Axiora collects, why, and your rights. Demo policy pending legal review.',
  alternates: { canonical: '/privacy' },
};

function H({ children }: { children: string }) {
  return <h2 className="pt-4 text-lg font-bold text-white">{children}</h2>;
}

export default function PrivacyPage() {
  const t = getDict();
  return (
    <div>
      <PageHero
        eyebrow={t.pub.privEyebrow}
        title={t.pub.privTitle}
        lede={t.pub.privLede}
      />
      <div className="py-12">
        <Prose>
          {t.pub.privH.map((h, i) => (
            <div key={h}>
              <H>{h}</H>
              <p>{t.pub.privP[i]}</p>
            </div>
          ))}
        </Prose>
      </div>
      <CTASection
        title={t.pub.privCtaT}
        body={t.pub.privCtaB}
        primaryLabel={t.footer.links.security}
        primaryHref="/security"
        secondaryLabel={t.header.getStarted}
        secondaryHref="/register"
      />
    </div>
  );
}
