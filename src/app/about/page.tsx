import { PageHero, FeatureCard, CTASection } from '@/components/public';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'About',
  description: 'What Axiora Protocol is, why it exists, and how it operates transparently.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const t = getDict();
  return (
    <div>
      <PageHero
        eyebrow={t.pub.aboutEyebrow}
        title={t.pub.aboutTitle}
        lede={t.pub.aboutLede}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {t.pub.aboutCards.map(([title, body]) => (
            <FeatureCard key={title} title={title} body={body} />
          ))}
        </div>
      </div>
      <CTASection
        title={t.pub.aboutCtaT}
        body={t.pub.aboutCtaB}
        primaryLabel={t.header.getStarted}
        primaryHref="/register"
        secondaryLabel={t.footer.links.protocol}
        secondaryHref="/protocol"
      />
    </div>
  );
}
