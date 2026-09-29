import { PageHero, Prose, CTASection } from '@/components/public';

export const metadata = {
  title: 'Privacy Policy',
  description: 'What Axiora collects, why, and your rights. Demo policy pending legal review.',
  alternates: { canonical: '/privacy' },
};

function H({ children }: { children: string }) {
  return <h2 className="pt-4 text-lg font-bold text-white">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <div>
      <PageHero
        eyebrow="LEGAL"
        title="Privacy Policy"
        lede="What this demo collects and why. Production deployments must finalize retention periods, cookie usage, analytics and jurisdiction-specific rights with counsel."
      />
      <div className="py-12">
        <Prose>
          <H>Information collected</H>
          <p><strong className="text-white">Account information:</strong> your email address, display name you choose, referral code and referral relationships, created for operating your account.</p>
          <p><strong className="text-white">Authentication:</strong> Supabase Auth manages credentials and session tokens. Axiora code never stores, logs or displays your password.</p>
          <p><strong className="text-white">Wallet information:</strong> destination addresses you save and transaction records (amounts, assets, networks, hashes) required to operate deposits, withdrawals and deployments.</p>
          <p><strong className="text-white">Usage information:</strong> support tickets you open and notification events tied to your account activity.</p>
          <H>Cookies</H>
          <p>Authentication uses HTTP-only session cookies required for sign-in. No advertising cookies are set by this demo. A production cookie policy must be published before launch.</p>
          <H>Third parties</H>
          <p>Account and data hosting is provided by Supabase (database, authentication) and Cloudflare (hosting); email delivery uses Resend once configured. Each processes data under its own terms to provide the service.</p>
          <H>Security</H>
          <p>Private tables are gated by owner-scoped row-level security, sessions travel in HTTP-only cookies, and privileged credentials never ship to the browser. See the Security page for the exact implemented controls.</p>
          <H>Retention</H>
          <p>Account and ledger records are retained while your account exists and as required for auditability. A production retention schedule must be defined before launch.</p>
          <H>User rights</H>
          <p>You may update your display name in Profile, and request export or deletion of your account data via a support ticket. Deletion of ledger rows may be limited where audit obligations apply.</p>
          <H>Contact</H>
          <p>Privacy questions go through the in-app support ticket flow. No dedicated privacy contact address has been established for this demo.</p>
        </Prose>
      </div>
      <CTASection
        title="Your data stays yours"
        body="Owner-scoped access on every private table. Read the Security page for details."
        primaryLabel="Security"
        primaryHref="/security"
        secondaryLabel="Get Started"
        secondaryHref="/register"
      />
    </div>
  );
}
