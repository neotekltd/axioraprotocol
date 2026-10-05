import Link from 'next/link';
import { SectionEyebrow, SectionTitle, Card } from '@/components/ui';
import { PROTOCOL_CONFIG } from '@/lib/config';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Referrals',
  description: 'Axiora referral program: instant bonuses and daily profit shares across five levels.',
  alternates: { canonical: '/referral-program' },
};

export default function ReferralsPage() {
  const t = getDict();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-40 pb-20">
      <SectionEyebrow>{t.pub.refpEyebrow}</SectionEyebrow>
      <SectionTitle>{t.pub.refpTitle}</SectionTitle>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-8"><div className="text-pulse font-bold tracking-widest text-xs">{t.pub.refpBonusT}</div><p className="mt-2 text-sm text-fog">{t.pub.refpBonusB}</p></Card>
        <Card className="p-8"><div className="text-pulse font-bold tracking-widest text-xs">{t.pub.refpShareT}</div><p className="mt-2 text-sm text-fog">{t.pub.refpShareB}</p></Card>
      </div>
      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px] tracking-widest"><th className="p-4">{t.pub.refpCLevel}</th><th className="p-4 text-right">{t.pub.refpCInstant}</th><th className="p-4 text-right">{t.pub.refpCDaily}</th></tr></thead>
          <tbody>{PROTOCOL_CONFIG.referralLevels.map((r) => (<tr key={r.level} className="border-t border-line"><td className="p-4">L{r.level}</td><td className="p-4 text-right">{r.instantPct}%</td><td className="p-4 text-right">{r.dailySharePct}%</td></tr>))}</tbody>
        </table>
      </Card>
      <Link href="/register" className="mt-6 inline-block rounded-xl bg-pulse px-6 py-3 text-sm font-bold text-black">{t.pub.refpGetLink}</Link>
    </div>
  );
}
