import { PageHero, CTASection } from '@/components/public';
import { FaqAccordion } from '@/components/FaqAccordion';
import { FAQS } from '@/lib/mock';

export const metadata = {
  title: 'FAQ',
  description: 'Answers about the Axiora protocol, deposits, deployments, withdrawals, security, referrals and accounts.',
  alternates: { canonical: '/faq' },
};

const CATEGORIES: { title: string; match: string[] }[] = [
  { title: 'General', match: ['What is Axiora Protocol?'] },
  { title: 'Protocol', match: ['How does automated trading work?', 'How are profits calculated?', 'What happens during losing periods?'] },
  { title: 'Deposits & Deployments', match: ['What assets are supported?', 'What is the minimum deployment?', 'How are fees calculated?'] },
  { title: 'Withdrawals', match: ['Can I withdraw at any time?'] },
  { title: 'Security', match: ['What security controls exist?'] },
  { title: 'Referrals', match: ['How does the referral system work?'] },
  { title: 'Account', match: ['Is identity verification required?', 'Which jurisdictions are supported?'] },
];

export default function FaqPage() {
  const byQ = new Map(FAQS.map((f) => [f.q, f.a]));
  return (
    <div>
      <PageHero
        eyebrow="SUPPORT"
        title="Frequently asked questions"
        lede="Factual answers about the protocol, money movement, security and accounts. No guaranteed returns, no risk-free claims."
      />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-14 sm:px-6">
        {CATEGORIES.map((c) => {
          const items = c.match.filter((q) => byQ.has(q)).map((q) => ({ q, a: byQ.get(q) as string }));
          if (items.length === 0) return null;
          return (
            <section key={c.title} aria-label={c.title}>
              <h2 className="text-lg font-bold">{c.title}</h2>
              <div className="mt-3"><FaqAccordion items={items} /></div>
            </section>
          );
        })}
      </div>
      <CTASection
        title="Still stuck?"
        body="Open a support ticket from inside the app and we will follow up by email."
        primaryLabel="Get Started"
        primaryHref="/register"
        secondaryLabel="Contact Support"
        secondaryHref="/app/support"
      />
    </div>
  );
}
