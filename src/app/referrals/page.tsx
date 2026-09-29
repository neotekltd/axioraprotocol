import Link from 'next/link';
import { SectionEyebrow, SectionTitle, Card } from '@/components/ui';
import { PROTOCOL_CONFIG } from '@/lib/config';

export const metadata = {
  title: 'Referrals',
  description: 'Axiora referral program: instant bonuses and daily profit shares across five levels.',
  alternates: { canonical: '/referrals' },
};

export default function ReferralsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20">
      <SectionEyebrow>REFERRAL PROGRAM</SectionEyebrow>
      <SectionTitle>Two reward mechanisms</SectionTitle>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-8"><div className="text-pulse font-bold tracking-widest text-xs">INSTANT BONUS</div><p className="mt-2 text-sm text-fog">Reward when a referral deploys capital. Rate snapshotted at deployment time.</p></Card>
        <Card className="p-8"><div className="text-pulse font-bold tracking-widest text-xs">DAILY PROFIT SHARE</div><p className="mt-2 text-sm text-fog">Recurring reward on positive protocol results, per level.</p></Card>
      </div>
      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px] tracking-widest"><th className="p-4">LEVEL</th><th className="p-4 text-right">INSTANT</th><th className="p-4 text-right">DAILY SHARE</th></tr></thead>
          <tbody>{PROTOCOL_CONFIG.referralLevels.map((r) => (<tr key={r.level} className="border-t border-line"><td className="p-4">L{r.level}</td><td className="p-4 text-right">{r.instantPct}%</td><td className="p-4 text-right">{r.dailySharePct}%</td></tr>))}</tbody>
        </table>
      </Card>
      <Link href="/register" className="mt-6 inline-block rounded-xl bg-pulse px-6 py-3 text-sm font-bold text-black">Get Referral Link</Link>
    </div>
  );
}
