import { PageHero, FeatureCard, CTASection } from '@/components/public';

export const metadata = {
  title: 'About',
  description: 'What Axiora Protocol is, why it exists, and how it operates transparently.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="ABOUT AXIORA"
        title="Autonomous intelligence for crypto markets"
        lede="Axiora Protocol is an original implementation of a multi-agent consensus trading system: independent AI agents must agree before any capital is deployed or any order is routed."
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard title="Mission" body="Replace single-signal automation with verifiable consensus. One model can be wrong; four independent agents forced to agree before execution changes the risk profile entirely." />
          <FeatureCard title="What Axiora is" body="A protocol interface plus account system: deployments with fixed terms, a ledger-backed dashboard, referral tracking, and transparent statistics. Everything a user sees comes from recorded data — never invented figures." />
          <FeatureCard title="Why it exists" body="Retail automation fails in regime shifts because one signal dominates. Axiora separates signal, risk, execution and sentiment analysis, then gates every decision through consensus and risk validation." />
          <FeatureCard title="How autonomy is used" body="Agents analyze markets continuously, but autonomy ends at the risk gate: exposure caps, correlation checks, balance verification and stop-loss enforcement run before anything executes. Frontend requests can never execute exchange orders directly." />
          <FeatureCard title="Transparency" body="Protocol statistics are operator-published snapshots; personal balances come from the user's own ledger. Demo-labeled values are always marked as such, and estimates are labeled estimates." />
          <FeatureCard title="Security" body="Email-verified Supabase Auth sessions over HTTP-only cookies, row-level security on every private table, and no private keys or seed phrases anywhere in the product. See the Security page for exactly what is — and is not — implemented." />
          <FeatureCard title="Access" body="Anyone can create an account with email verification. Deployments start at $10 with 20–90 day terms. No invitation, no token gate, no waitlist." />
          <FeatureCard title="What Axiora is not" body="Not affiliated with any other protocol or Axiora-branded product. Not a guarantee of returns. Not a bank, broker, or custodian making promises about performance." />
        </div>
      </div>
      <CTASection
        title="See the protocol in action"
        body="Model outcomes with the calculator, then create an account to open your dashboard."
        primaryLabel="Get Started"
        primaryHref="/register"
        secondaryLabel="View Protocol"
        secondaryHref="/protocol"
      />
    </div>
  );
}
