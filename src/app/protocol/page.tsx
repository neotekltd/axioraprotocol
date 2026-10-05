import { SectionEyebrow, SectionTitle, Card } from '@/components/ui';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Protocol',
  description: 'Axiora convergence architecture: four agents, consensus gate, risk validation and ledger settlement.',
  alternates: { canonical: '/protocol' },
};

export default function ProtocolPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-40 pb-20">
      <SectionEyebrow>{t.pub.protoEyebrow}</SectionEyebrow>
      <SectionTitle>{t.pub.protoTitle}</SectionTitle>
      <p className="mt-4 max-w-2xl text-mist/75">{t.pub.protoLede}</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {t.pub.protoFlow.map(([title, desc], i) => (
          <Card key={title} className="p-6">
            <div className="text-[11px] tracking-widest text-pulse">{t.pub.protoStage.replace('{n}', String(i + 1).padStart(2, '0'))}</div>
            <div className="mt-2 font-bold">{title}</div>
            <p className="mt-1 text-sm text-fog">{desc}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-8 p-6 text-sm text-fog">
        <span className="text-white font-semibold">{t.pub.protoConsensus}</span>
        <code dir="ltr">AgentDecision {'{ agent, decision: LONG | SHORT | PASS, confidence }'}/ ConsensusDecision {'{ asset, direction, approved, riskScore, positionSize, stopLoss }'}</code>
      </Card>
    </div>
  );
}
