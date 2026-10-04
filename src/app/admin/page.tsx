import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/data';
import { getAdminMetrics, getOpenTicketCount } from '@/lib/admin';
import { ASSET_IDS, configStatus, DEPOSIT_CONFIG } from '@/lib/deposits';
import { formatUSD } from '@/lib/finance';

export const metadata = { title: 'Admin dashboard' };

function ago(iso: string | null): string {
  if (!iso) return 'none yet';
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return 'unknown';
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

function Dot({ ok, warn }: { ok: boolean; warn?: boolean }) {
  const c = ok ? 'bg-[#35D98B]' : warn ? 'bg-[#F2BF4A]' : 'bg-[#F06B78]';
  return <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${c}`} />;
}

export default async function AdminDashboard() {
  const [m, openTickets] = await Promise.all([getAdminMetrics(), getOpenTicketCount()]);
  const attention = m.needsAttention + m.pendingWithdrawals;
  return (
    <div>
      <PageHeader title="Admin control" sub="Live system state from Supabase. Empty states show 0 — never fabricated activity." />

      {/* System status — every dot is local truth, never assumed green. */}
      <div className="mt-6 rounded-[16px] border border-[#202A3A] bg-[#0D111A] px-4 py-3">
        <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">SYSTEM STATUS</div>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#AAB5C7]">
          <li className="flex items-center gap-1.5"><Dot ok={m.dbOk} /> Database {m.dbOk ? 'live' : 'unreachable'}</li>
          <li className="flex items-center gap-1.5"><Dot ok={m.providerApiConfigured} warn={!m.providerApiConfigured} /> Payments API {m.providerApiConfigured ? 'key configured' : 'key missing'}</li>
          <li className="flex items-center gap-1.5"><Dot ok={m.providerIpnConfigured} warn={!m.providerIpnConfigured} /> IPN {m.providerIpnConfigured ? 'secret configured' : 'secret missing'}</li>
          <li className="flex items-center gap-1.5"><Dot ok /> Payouts manual approval</li>
        </ul>
      </div>

      {/* Needs attention — the admin's work queue. */}
      <Link
        href="/admin/deposits?status=pending&kind=review"
        className={`mt-4 block rounded-[16px] border p-4 transition sm:p-5 ${
          attention > 0
            ? 'border-[rgba(242,191,74,0.45)] bg-[rgba(242,191,74,0.05)] hover:border-[rgba(242,191,74,0.7)]'
            : 'border-[#202A3A] bg-[#0D111A] hover:border-[rgba(47,214,255,0.5)]'
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">NEEDS ATTENTION</div>
          <div className={`font-mono text-2xl font-bold ${attention > 0 ? 'text-[#F2BF4A]' : 'text-[#35D98B]'}`}>{attention}</div>
        </div>
        {attention > 0 ? (
          <p className="mt-1 text-[13px] text-[#AAB5C7]">
            {m.pendingManual} manual review{m.pendingManual === 1 ? '' : 's'} · {m.pendingWithdrawals} withdrawal{m.pendingWithdrawals === 1 ? '' : 's'} · {m.needsAttention - m.pendingManual} provider exception{m.needsAttention - m.pendingManual === 1 ? '' : 's'}
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-[#AAB5C7]">All systems operational — nothing awaiting review.</p>
        )}
        <div className="mt-2 text-[14px] font-bold text-[#2FD6FF]">Open review queue →</div>
      </Link>

      {/* Deposit rails split: manual needs review, automatic flows itself. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/deposits?status=pending&kind=manual" className="rounded-[16px] border border-[#202A3A] bg-[#0D111A] p-4 transition hover:border-[rgba(47,214,255,0.5)] sm:p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">MANUAL DEPOSITS · TXID REVIEW</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-white">{m.pendingManual} pending</div>
          <div className="mt-1 text-[13px] text-[#AAB5C7]">{formatUSD(m.pendingManualTotal)} awaiting admin review</div>
          <div className="mt-2 text-[14px] font-bold text-[#2FD6FF]">Open queue →</div>
        </Link>
        <Link href="/admin/deposits?status=pending&kind=automatic" className="rounded-[16px] border border-[#202A3A] bg-[#0D111A] p-4 transition hover:border-[rgba(47,214,255,0.5)] sm:p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">AUTOMATIC · NOWPAYMENTS</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-white">{m.autoPending} in flight</div>
          <div className="mt-1 text-[13px] text-[#AAB5C7]">{m.autoFinished} finished · credits itself, no approval</div>
          <div className="mt-2 text-[14px] font-bold text-[#2FD6FF]">Monitor activity →</div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="USERS" value={String(m.users)} />
        <StatCard label="PENDING WITHDRAWALS" value={String(m.pendingWithdrawals)} sub={formatUSD(m.pendingWithdrawalsTotal)} accent={m.pendingWithdrawals > 0 ? 'up' : 'neutral'} />
        <StatCard label="ACTIVE INVESTED" value={formatUSD(m.activeInvested)} />
        <StatCard label="PROVIDER ACTIVITY" value={m.providerLastActivity ? ago(m.providerLastActivity) : 'none yet'} sub="last NOWPayments payment" />
      </div>

      <Link href="/admin/support?status=open" className="mt-4 flex items-center justify-between gap-3 rounded-[16px] border border-[#202A3A] bg-[#0D111A] p-4 transition hover:border-[rgba(47,214,255,0.5)] sm:p-5">
        <div>
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">OPEN TICKETS</div>
          <div className="mt-1 text-[13px] text-[#AAB5C7]">
            {openTickets === 0 ? 'All support requests are up to date.' : `${openTickets} awaiting a reply — open the queue.`}
          </div>
        </div>
        <div className={`font-mono text-2xl font-bold ${openTickets > 0 ? 'text-[#F2BF4A]' : 'text-white'}`}>{openTickets}</div>
      </Link>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/withdrawals?status=pending" className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5 transition hover:border-[rgba(47,214,255,0.5)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">WITHDRAWALS</div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{m.pendingWithdrawals} pending</div>
          <div className="mt-1 text-[13px] text-[#78859A]">Approve separately from broadcast</div>
          <div className="mt-3 text-[14px] font-bold text-[#2FD6FF]">Open queue →</div>
        </Link>
        <div className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">PAYMENT PROVIDER</div>
          <div className="mt-2 text-[15px] font-bold text-white">NOWPayments</div>
          <ul className="mt-2 space-y-1 text-[13px] text-[#AAB5C7]">
            <li className="flex items-center gap-1.5"><Dot ok={m.providerApiConfigured} warn={!m.providerApiConfigured} /> API {m.providerApiConfigured ? 'key configured' : 'key missing'}</li>
            <li className="flex items-center gap-1.5"><Dot ok={m.providerIpnConfigured} warn={!m.providerIpnConfigured} /> IPN {m.providerIpnConfigured ? 'secret configured' : 'secret missing'}</li>
            <li>Last activity: {m.providerLastActivity ? ago(m.providerLastActivity) : 'none yet'}</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">DEPOSIT CONFIGURATION · STATUS ONLY, NO VALUES SHOWN</div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(() => {
            const status = configStatus();
            return ASSET_IDS.map((id) => {
              const ok = status[id];
              const c = DEPOSIT_CONFIG[id];
              return (
                <li key={id} className="flex items-center justify-between gap-2 rounded-[12px] border border-[#202A3A] bg-[#0A0E16] px-3.5 py-2.5 text-[13px]">
                  <span className="font-mono font-bold text-white">{c.symbol} · {c.standard}</span>
                  <span className={`font-mono text-[11px] font-bold ${ok ? 'text-[#35D98B]' : 'text-[#F2BF4A]'}`}>
                    {ok ? 'ACTIVE' : 'NOT CONFIGURED'}
                  </span>
                </li>
              );
            });
          })()}
        </ul>
        <p className="mt-3 text-[12px] text-[#78859A]">
          Resolved from server runtime configuration (environment first, then the networks table).
          Manage addresses in <Link href="/admin/assets" className="font-semibold text-[#2FD6FF]">Assets</Link>.
        </p>
      </div>
    </div>
  );
}
