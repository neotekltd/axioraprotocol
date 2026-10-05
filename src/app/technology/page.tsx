import { PageHero, FeatureCard, CTASection } from '@/components/public';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Technology',
  description: 'Axiora multi-agent architecture: signal, risk, execution and sentiment agents behind a consensus gate.',
  alternates: { canonical: '/technology' },
};

export default function TechnologyPage() {
  const t = getDict();
  return (
    <div>
      <PageHero
        eyebrow={t.pub.techEyebrow}
        title={t.pub.techTitle}
        lede={t.pub.techLede}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold">{t.pub.techSec1}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {t.pub.techAgents.map(([title, body]) => (
            <FeatureCard key={title} title={title} body={body} />
          ))}
        </div>
        <h2 className="mt-12 text-xl font-bold">{t.pub.techSec2}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {t.pub.techLayers.map(([title, body]) => (
            <FeatureCard key={title} title={title} body={body} />
          ))}
        </div>
      </div>
      <CTASection
        title={t.pub.techCtaT}
        body={t.pub.techCtaB}
        primaryLabel={t.footer.links.protocol}
        primaryHref="/protocol"
        secondaryLabel={t.header.getStarted}
        secondaryHref="/register"
      />
    </div>
  );
}
