import Link from 'next/link';
import { DemoBadge, Card } from '@/components/ui';

export const metadata = { title: 'Referrals' };

export default function ReferralsAppPage() {
  return (
    <div>
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Referrals</h1><DemoBadge /></div>
      <Card className="mt-6 p-6">
        <div className="text-xs tracking-widest text-fog">YOUR REFERRAL LINK</div>
        <div className="mt-2 break-all font-mono text-sm text-pulse">https://example.com/register?ref=AXIORA42</div>
        <div className="mt-3 flex gap-2"><button className="rounded-xl border border-line px-4 py-2 text-xs">Copy link</button><button className="rounded-xl border border-line px-4 py-2 text-xs">Share</button></div>
      </Card>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Total Referrals', '127'], ['Active Referrals', '83'], ['Total Earnings', '$4,281.32'], ["Today's Earnings", '$38.42']].map(([k, v]) => (
          <Card key={k} className="p-5"><div className="text-[11px] tracking-widest text-fog">{k.toUpperCase()}</div><div className="mt-1 text-xl font-bold">{v}</div></Card>
        ))}
      </div>
      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/app/referrals/network" className="rounded-xl border border-line px-5 py-2.5">Network</Link>
        <Link href="/app/referrals/earnings" className="rounded-xl border border-line px-5 py-2.5">Earnings</Link>
      </div>
    </div>
  );
}
