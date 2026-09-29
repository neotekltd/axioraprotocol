import { PageHero, StepCard, CTASection } from '@/components/public';

export const metadata = {
  title: 'How It Works',
  description: 'Fund, deploy, execute, settle, withdraw — how capital moves through Axiora Protocol.',
  alternates: { canonical: '/how-it-works' },
};

const STEPS = [
  ['01 — FUND', 'Deposit', 'Fund your account from an external wallet. Supported assets convert to USDT on arrival and credit to your available balance after network confirmations.'],
  ['02 — DEPLOY', 'Deploy', 'Choose an amount ($10–$100,000) and a term (20–90 days). The server computes a binding quote — daily rate, gross profit, protocol fee, net profit — and activation records a real deployment in your ledger.'],
  ['03 — EXECUTE', 'Consensus execution', 'Signal, risk, execution and sentiment agents analyze markets independently. Only decisions that pass consensus and the risk gate (exposure caps, correlation, balance checks, stops) are executed.'],
  ['04 — SETTLE', 'Earn / settle', 'Completed protocol activity settles into your account as recorded profit. Every figure on the dashboard traces to ledger rows — settled profit, credited profit, referral earnings.'],
  ['05 — WITHDRAW', 'Withdraw', 'Withdraw from available balance only. Requests are recorded with full state tracking and processed in the daily window to your saved, verified address.'],
];

export default function HowItWorksPage() {
  return (
    <div>
      <PageHero
        eyebrow="HOW IT WORKS"
        title="Five steps from deposit to withdrawal"
        lede="No black boxes in the money flow. Each stage below maps to a real screen in the application and real rows in your ledger."
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(([index, title, body]) => (
          <StepCard key={index} index={index} title={title} body={body} />
        ))}
        <div className="glass rounded-2xl border-pulse/30 p-6 sm:p-8">
          <div className="font-mono text-sm font-bold text-pulse">NO GUARANTEES</div>
          <div className="mt-2 text-lg font-bold">Risk is real</div>
          <p className="mt-2 text-sm leading-relaxed text-fog">Estimates are not promises. Losing periods reduce position value and are shown transparently. Never deploy capital you cannot afford to lose.</p>
        </div>
      </div>
      <CTASection
        title="Start with the calculator"
        body="Model a deployment with your own numbers, then create an account when you are ready."
        primaryLabel="Get Started"
        primaryHref="/register"
        secondaryLabel="Model Returns"
        secondaryHref="/calculator"
      />
    </div>
  );
}
