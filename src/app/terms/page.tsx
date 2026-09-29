import { PageHero, Prose, CTASection } from '@/components/public';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of the Axiora Protocol demo interface.',
  alternates: { canonical: '/terms' },
};

function H({ children }: { children: string }) {
  return <h2 className="pt-4 text-lg font-bold text-white">{children}</h2>;
}

export default function TermsPage() {
  return (
    <div>
      <PageHero
        eyebrow="LEGAL"
        title="Terms of Service"
        lede="Demo terms for the Axiora Protocol interface. Do not launch a production service on this copy without jurisdiction-specific legal review."
      />
      <div className="py-12">
        <Prose>
          <H>1. What this is</H>
          <p>Axiora Protocol in this repository is an original implementation of a multi-agent consensus trading concept. It is not affiliated with any other Axiora-branded product and makes no earnings guarantees. On-chain deposit processing and automated withdrawal broadcasting are not yet activated: deposits show as unavailable until backend issuance is connected, and withdrawals are recorded as requests with full state tracking until the execution layer is activated.</p>
          <H>2. Eligibility</H>
          <p>Account creation requires a valid email address and successful email verification. Availability by jurisdiction (including KYC/AML and restricted regions) must be determined with legal counsel before any production launch; this demo blocks no one.</p>
          <H>3. Accounts and security</H>
          <p>You are responsible for keeping your credentials confidential and for activity under your account. Use a unique password and sign out on shared devices. See the Security page for exactly which protections are implemented.</p>
          <H>4. Deployments and estimates</H>
          <p>Calculator figures and pre-confirmation quotes are estimates, not promises. Deployment terms, fees and referral rates are configuration and may change; history snapshots its rates at calculation time and never re-prices.</p>
          <H>5. Referrals</H>
          <p>Referral rewards pay on recorded referral activity per the published level structure. Self-referral is prohibited. Abuse may result in reward cancellation and account closure.</p>
          <H>6. Acceptable use</H>
          <p>No unlawful activity, no misrepresentation of the service, no attempts to disrupt the service or access other users&apos; data. All private data is scoped to its owner; probing other accounts is a violation.</p>
          <H>7. Risk disclosure</H>
          <p>Trading crypto assets involves substantial risk of loss, up to and including total loss. Past simulated performance proves nothing. Never deploy capital you cannot afford to lose.</p>
          <H>8. No warranties; limitation of liability</H>
          <p>This demo is provided as-is without warranties of any kind. To the maximum extent permitted by law, liability is limited, and nothing here is financial, legal, or tax advice.</p>
          <H>9. Changes</H>
          <p>These terms and the service may change; material changes will be communicated. Continued use after changes take effect constitutes acceptance.</p>
          <H>10. Production requirements</H>
          <p>A production launch additionally requires finalized Terms, Privacy, Risk Disclosure, Investment Disclaimer, Fee Disclosure, Referral Terms, Restricted Jurisdictions, KYC/AML and Cookie policies — all independently reviewed. No company registration numbers, legal entities, jurisdictions or addresses are stated here because none have been established for this demo.</p>
        </Prose>
      </div>
      <CTASection
        title="Questions about these terms?"
        body="Read the FAQ or open a support ticket from inside the app."
        primaryLabel="Read FAQ"
        primaryHref="/faq"
        secondaryLabel="Get Started"
        secondaryHref="/register"
      />
    </div>
  );
}
