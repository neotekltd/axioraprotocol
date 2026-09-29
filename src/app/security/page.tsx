import { PageHero, FeatureCard, CTASection } from '@/components/public';

export const metadata = {
  title: 'Security',
  description: 'What Axiora implements to protect accounts and data — and what it does not claim.',
  alternates: { canonical: '/security' },
};

export default function SecurityInfoPage() {
  return (
    <div>
      <PageHero
        eyebrow="SECURITY"
        title="Protected where it counts. Honest about the rest."
        lede="This page lists exactly what is implemented in the Axiora codebase today. Anything not listed here is not claimed."
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold">Implemented</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeatureCard title="Account security" body="Email + password authentication with mandatory email verification. Unverified sessions cannot reach the application — middleware redirects them to verification." />
          <FeatureCard title="Authentication" body="Supabase Auth sessions carried in HTTP-only cookies, refreshed per request. Passwords are never stored, logged, or displayed by Axiora code." />
          <FeatureCard title="Wallet security" body="No private keys or seed phrases exist anywhere in the product. Withdrawals target saved addresses only, draw from available balance, and are state-tracked end to end." />
          <FeatureCard title="Data protection" body="Every private table is gated by auth.uid() row-level security: users can only read their own profiles, deployments, transactions, trades, referrals and notifications." />
          <FeatureCard title="Infrastructure" body="Security response headers (content-type protection, frame denial, strict referrer policy), no privileged credentials in client bundles, server-side validation on every financial mutation." />
          <FeatureCard title="Transaction security" body="Deployment activation re-quotes server-side and records idempotency keys, so double-submits cannot create duplicate deployments. Financial amounts are stored as NUMERIC, never float." />
          <FeatureCard title="Risk controls" body="Exposure caps, correlation checks and drawdown guards sit between consensus decisions and execution. Risk can veto any trade." />
        </div>
        <h2 className="mt-12 text-xl font-bold">Not implemented (not claimed)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeatureCard title="No TOTP two-factor yet" body="Authenticator-based 2FA is not available in this release. Email-verified sessions and address verification carry withdrawal protection instead." />
          <FeatureCard title="No external audit" body="No third-party security audit, penetration test, or compliance certification has been performed. Do not treat this build as audited." />
        </div>
        <h2 className="mt-12 text-xl font-bold">Your responsibilities</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeatureCard title="Credentials" body="Use a unique password, keep your email account secure, and sign out on shared devices." />
          <FeatureCard title="Addresses" body="Always verify destination addresses before withdrawing. Transactions on public networks cannot be reversed." />
        </div>
      </div>
      <CTASection
        title="Create a secured account"
        body="Email verification is required before any account can reach the application."
        primaryLabel="Get Started"
        primaryHref="/register"
        secondaryLabel="How It Works"
        secondaryHref="/how-it-works"
      />
    </div>
  );
}
