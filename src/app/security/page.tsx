import { PageHero, FeatureCard, CTASection } from '@/components/public';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Security',
  description: 'What Axiora implements to protect accounts and data — and what it does not claim.',
  alternates: { canonical: '/security' },
};

export default function SecurityInfoPage() {
  const t = getDict();
  return (
    <div>
      <PageHero
        eyebrow={t.pub.secEyebrow}
        title={t.pub.secTitle}
        lede={t.pub.secLede}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold">{t.pub.secImpT}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {t.pub.secImp.map(([title, body]) => (
            <FeatureCard key={title} title={title} body={body} />
          ))}
        </div>
        <h2 className="mt-12 text-xl font-bold">{t.pub.secNotT}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {t.pub.secNot.map(([title, body]) => (
            <FeatureCard key={title} title={title} body={body} />
          ))}
        </div>
        <h2 className="mt-12 text-xl font-bold">{t.pub.secRespT}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {t.pub.secResp.map(([title, body]) => (
            <FeatureCard key={title} title={title} body={body} />
          ))}
        </div>
      </div>
      <CTASection
        title={t.pub.secCtaT}
        body={t.pub.secCtaB}
        primaryLabel={t.header.getStarted}
        primaryHref="/register"
        secondaryLabel={t.header.drawer.howItWorks}
        secondaryHref="/how-it-works"
      />
    </div>
  );
}
