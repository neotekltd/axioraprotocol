import Link from 'next/link';
import { DEMO_DEPLOYMENTS, DEMO_TRADES, DEMO_TRANSACTIONS } from '@/lib/mock';
import { DemoBadge, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  // Server-side session: the authenticated Supabase user, never browser input.
  let sessionEmail: string | null = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    sessionEmail = data.user?.email ?? null;
  } catch {
    sessionEmail = null; // Unconfigured env or unreachable project — demo content still renders.
  }
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Good morning — Portfolio Overview</h1><DemoBadge /></div>
      <p className="mt-1 text-xs text-fog">{sessionEmail ? `Signed in as ${sessionEmail}` : 'Browsing demo state — sign in to load your live balance.'}</p>
      <Card className="mt-6 p-6">
        <div className="text-[11px] tracking-widest text-fog">TOTAL BALANCE</div>
        <div className="mt-1 text-4xl font-bold">$12,481.42</div>
        <div className="text-sm text-pulse">+$481.42 · +4.01%</div>
      </Card>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Available Balance', '$3,281.42'], ['Deployed', '$9,200.00'], ["Today's Profit", '+$184.21'], ['Total Profit', '+$1,481.42']].map(([k, v]) => (
          <Card key={k} className="p-5"><div className="text-[11px] tracking-widest text-fog">{k.toUpperCase()}</div><div className="mt-1 text-xl font-bold">{v}</div></Card>
        ))}
      </div>
      <h2 className="mt-10 font-bold">Active Deployments</h2>
      <Card className="mt-3 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">DEPLOYMENT</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">TERM</th><th className="p-4 text-right">PROFIT</th><th className="p-4 text-right">STATUS</th></tr></thead>
          <tbody>{DEMO_DEPLOYMENTS.map((d) => (<tr key={d.id} className="border-t border-line"><td className="p-4">{d.id}</td><td className="p-4 text-right">${d.amount.toLocaleString()}</td><td className="p-4 text-right">{d.term}d</td><td className="p-4 text-right text-pulse">+${d.profit}</td><td className="p-4 text-right">{d.status}</td></tr>))}</tbody>
        </table>
      </Card>
      <h2 className="mt-10 font-bold">Recent Trades</h2>
      <Card className="mt-3 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">ASSET</th><th className="p-4">SIDE</th><th className="p-4 text-right">P&L</th><th className="p-4 text-right">STATUS</th></tr></thead>
          <tbody>{DEMO_TRADES.map((t, i) => (<tr key={i} className="border-t border-line"><td className="p-4 font-mono">{t.asset}</td><td className="p-4">{t.side}</td><td className="p-4 text-right text-pulse">+${t.pnl}</td><td className="p-4 text-right">{t.status}</td></tr>))}</tbody>
        </table>
      </Card>
      <h2 className="mt-10 font-bold">Transactions</h2>
      <Card className="mt-3 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-fog text-[11px]"><th className="p-4">ID</th><th className="p-4">TYPE</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-right">STATUS</th></tr></thead>
          <tbody>{DEMO_TRANSACTIONS.map((t) => (<tr key={t.id} className="border-t border-line"><td className="p-4 font-mono">{t.id}</td><td className="p-4">{t.type}</td><td className="p-4 text-right">${t.amount}</td><td className="p-4 text-right">{t.status}</td></tr>))}</tbody>
        </table>
      </Card>
      <div className="mt-8 flex gap-3 text-sm">
        <Link href="/app/deploy" className="rounded-xl bg-pulse px-5 py-2.5 font-bold text-black">Deploy</Link>
        <Link href="/app/withdraw" className="rounded-xl border border-line px-5 py-2.5">Withdraw</Link>
        <Link href="/app/referrals" className="rounded-xl border border-line px-5 py-2.5">Referrals</Link>
      </div>
    </div>
  );
}
