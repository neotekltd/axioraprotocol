import { SectionEyebrow, SectionTitle, Card } from '@/components/ui';

export const metadata = {
  title: 'Protocol',
  description: 'Axiora convergence architecture: four agents, consensus gate, risk validation and ledger settlement.',
  alternates: { canonical: '/protocol' },
};

const FLOW = [
  ['MARKET DATA', 'Aggregated venues, order books, funding rates.'],
  ['SIGNAL ANALYSIS', 'Technicals, structure, liquidity, BTC/ETH/BNB.'],
  ['RISK ANALYSIS', 'Exposure, correlation, sizing, stops, drawdown.'],
  ['EXECUTION ANALYSIS', 'Venue, spread, slippage, fill plan.'],
  ['SENTIMENT ANALYSIS', 'Funding, social, whale activity, mood.'],
  ['CONSENSUS', 'All four must agree or no trade fires.'],
  ['ORDER → POSITION → P&L', 'Risk-gated execution, ledger-settled results.'],
];

export default function ProtocolPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20">
      <SectionEyebrow>AXIORA PROTOCOL</SectionEyebrow>
      <SectionTitle>Convergence architecture</SectionTitle>
      <p className="mt-4 max-w-2xl text-mist/75">Original design: four independent agents plus a consensus gate, risk validation, execution engine, exchange, reconciler and ledger. Frontend requests can never execute orders directly.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {FLOW.map(([t, d], i) => (
          <Card key={t} className="p-6">
            <div className="text-[11px] tracking-widest text-pulse">STAGE {String(i + 1).padStart(2, '0')}</div>
            <div className="mt-2 font-bold">{t}</div>
            <p className="mt-1 text-sm text-fog">{d}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-8 p-6 text-sm text-fog">
        <span className="text-white font-semibold">Consensus types (backend): </span>
        <code>AgentDecision {'{ agent, decision: LONG | SHORT | PASS, confidence }'}/ ConsensusDecision {'{ asset, direction, approved, riskScore, positionSize, stopLoss }'}</code>
      </Card>
    </div>
  );
}
