export const metadata = { title: 'Whitepaper' };
export default function WhitepaperPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-20">
      <h1 className="text-4xl font-bold tracking-tight">Axiora Protocol Whitepaper (demo outline)</h1>
      <div className="mt-6 space-y-4 text-sm text-mist/80 leading-relaxed">
        <p>1. Consensus architecture — Signal, Risk, Execution, Sentiment agents and the consensus gate.</p>
        <p>2. Risk engine — exposure caps, correlation, volatility sizing, drawdown guards, stop-loss enforcement.</p>
        <p>3. Execution — venue selection, idempotency, reconciliation, ledger settlement.</p>
        <p>4. Fee and referral economics — admin-configurable, snapshotted per deployment/reward.</p>
        <p>5. Security, accounting (double-entry ledger), and real-time channels.</p>
        <p className="text-fog">Full paper ships with backend auditability. This outline is original and demo-only.</p>
      </div>
    </div>
  );
}
