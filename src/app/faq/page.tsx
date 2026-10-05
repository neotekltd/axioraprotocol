import { PageHero, CTASection } from '@/components/public';
import { FaqAccordion } from '@/components/FaqAccordion';
import { getDict } from '@/lib/i18n-server';
import { PLANS, formatUSD } from '@/lib/plans';

export const metadata = {
  title: 'FAQ',
  description: 'Answers about the Axiora protocol, deposits, deployments, withdrawals, security, referrals and accounts.',
  alternates: { canonical: '/faq' },
};

// Index-based categories: stable across locales (never match on text).
const CATS: number[][] = [[0], [1, 6, 8], [2, 3, 4], [5], [9], [7], [10, 11]];

export default function FaqPage() {
  const t = getDict();
  const minFaq = formatUSD(Math.min(...PLANS.map((p) => p.min)), { decimals: 0 });
  const rangesFaq = PLANS.map((p) => `${p.name} ${formatUSD(p.min, { decimals: 0 })}–${formatUSD(p.max, { decimals: 0 })}`).join(', ');
  const faqs = t.faqs.map((f) => ({ q: f.q, a: f.a.replace('{min}', minFaq).replace('{ranges}', rangesFaq) }));
  return (
    <div>
      <PageHero
        eyebrow={t.pub.faqEyebrow}
        title={t.support.faqTitle}
        lede={t.pub.faqLede}
      />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-14 sm:px-6">
        {CATS.map((idxs, ci) => {
          const items = idxs.filter((i) => faqs[i]).map((i) => faqs[i]);
          if (items.length === 0) return null;
          const title = t.pub.faqCats[ci] ?? '';
          return (
            <section key={title} aria-label={title}>
              <h2 className="text-lg font-bold">{title}</h2>
              <div className="mt-3"><FaqAccordion items={items} /></div>
            </section>
          );
        })}
      </div>
      <CTASection
        title={t.pub.faqCtaT}
        body={t.pub.faqCtaB}
        primaryLabel={t.header.getStarted}
        primaryHref="/register"
        secondaryLabel={t.support.title}
        secondaryHref="/app/support"
      />
    </div>
  );
}
