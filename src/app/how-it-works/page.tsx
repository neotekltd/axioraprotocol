import { PageHero, StepCard, CTASection } from '@/components/public';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'How It Works',
  description: 'Fund, deploy, execute, settle, withdraw — how capital moves through Axiora Protocol.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksPage() {
  const t = getDict();
  return (
    <div>
      <PageHero
        eyebrow={t.pub.hiwEyebrow}
        title={t.pub.hiwTitle}
        lede={t.pub.hiwLede}
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {t.pub.hiwSteps.map(([index, title, body]) => (
          <StepCard key={index} index={index} title={title} body={body} />
        ))}
        <div className="glass rounded-2xl border-pulse/30 p-6 sm:p-8">
          <div className="font-mono text-sm font-bold text-pulse">{t.pub.hiwRiskT}</div>
          <div className="mt-2 text-lg font-bold">{t.pub.hiwRiskH}</div>
          <p className="mt-2 text-sm leading-relaxed text-fog">{t.pub.hiwRiskB}</p>
        </div>
      </div>
      <CTASection
        title={t.pub.hiwCtaT}
        body={t.pub.hiwCtaB}
        primaryLabel={t.header.getStarted}
        primaryHref="/register"
        secondaryLabel={t.footer.links.calculator}
        secondaryHref="/calculator"
      />
    </div>
  );
}
