import { PageHero, FeatureCard, CTASection } from '@/components/public';

export const metadata = {
  title: 'Technology',
  description: 'Axiora multi-agent architecture: signal, risk, execution and sentiment agents behind a consensus gate.',
  alternates: { canonical: '/technology' },
};

export default function TechnologyPage() {
  return (
    <div>
      <PageHero
        eyebrow="TECHNOLOGY"
        title="Four agents. One consensus gate."
        lede="Each agent reasons independently over the same market. A decision executes only when all four agree and the risk layer approves — otherwise nothing fires."
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold">Multi-agent intelligence</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeatureCard title="Signal Agent" body="Technicals, market structure, liquidity and venue order-book state across monitored assets (BTC, ETH, BNB and others). Produces directional hypotheses with confidence — never orders." />
          <FeatureCard title="Risk Agent" body="Exposure caps, cross-asset correlation, volatility-scaled sizing, drawdown guards and stop-loss enforcement. Holds veto power over every decision, including consensus-approved ones." />
          <FeatureCard title="Execution Agent" body="Venue selection, spread and slippage modeling, fill planning and idempotent order submission with reconciliation. Plans fills; never self-authorizes them." />
          <FeatureCard title="Sentiment Agent" body="Funding rates, social activity, whale flows and market mood as an independent contrarian check on technical signals." />
        </div>
        <h2 className="mt-12 text-xl font-bold">System layers</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeatureCard title="Consensus" body="LONG, SHORT or PASS per agent with confidence. Execution requires agreement across all four — disagreement means no trade. Decisions are typed records (agent, decision, confidence), not vibes." />
          <FeatureCard title="Execution" body="Approved decisions flow to risk validation, balance checks and the execution engine. Every order is reconciled against exchange state; frontend requests can never execute orders directly." />
          <FeatureCard title="Risk management" body="Position limits, volatility scaling, correlation monitoring and drawdown guards gate sizing continuously — including shrinking or halting deployment during losing periods." />
          <FeatureCard title="Monitoring" body="Positions, P&L, settlements and protocol activity surface on the dashboard and protocol statistics from recorded data. Losses are shown, not hidden." />
          <FeatureCard title="Transparency" body="Deployment confirmation re-quotes server-side; rates snapshot per deployment and per referral reward so history never re-prices. Statistics pages show audited snapshots or honest empty states." />
          <FeatureCard title="Security" body="Supabase Auth with email verification, HTTP-only cookie sessions, auth.uid()-scoped row-level security on all private tables, and security headers. Full honest accounting on the Security page." />
          <FeatureCard title="Infrastructure" body="Next.js on Cloudflare Workers via OpenNext, Supabase Postgres/Auth/Realtime as the data plane, Resend for email. No second database, no duplicated financial state." />
          <FeatureCard title="What we do not claim" body="No external security audit, no certifications, no TOTP two-factor yet, no guaranteed yields. The Security page lists exactly what is implemented versus planned." />
        </div>
      </div>
      <CTASection
        title="Read the protocol overview"
        body="The Protocol page walks through convergence architecture stage by stage."
        primaryLabel="View Protocol"
        primaryHref="/protocol"
        secondaryLabel="Get Started"
        secondaryHref="/register"
      />
    </div>
  );
}
