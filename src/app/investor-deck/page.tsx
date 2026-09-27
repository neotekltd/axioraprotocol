export const metadata = { title: 'Investor Deck' };
export default function DeckPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-28 pb-20">
      <h1 className="text-4xl font-bold tracking-tight">Investor Deck (demo)</h1>
      <div className="mt-6 grid gap-3 text-sm">
        {['Problem: single-signal bots fail in regime shifts', 'Solution: four-agent consensus + risk gate', 'Product: protocol + dashboard + referrals', 'Economics: transparent performance fee only', 'Moat: auditable ledger + risk engine', 'Ask: backend, audit, compliance before mainnet'].map((s) => (
          <div key={s} className="glass rounded-xl p-4 text-mist/85">{s}</div>
        ))}
      </div>
    </div>
  );
}
