import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/data';
import { getAdminMetrics, getOpenTicketCount } from '@/lib/admin';
import { ASSET_IDS, configStatus, DEPOSIT_CONFIG } from '@/lib/deposits';
import { formatUSD } from '@/lib/finance';
import { getDict } from '@/lib/i18n-server';
import type { Dictionary } from '@/lib/i18n-dict';

export const metadata = { title: 'Admin dashboard' };

function ago(t: Dictionary['ops'], iso: string | null): string {
  if (!iso) return t.agoNone;
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return t.agoUnknown;
  const min = Math.floor(ms / 60000);
  if (min < 1) return t.agoJust;
  if (min < 60) return t.agoMin.replace('{n}', String(min));
  const h = Math.floor(min / 60);
  if (h < 48) return t.agoH.replace('{n}', String(h));
  return t.agoD.replace('{n}', String(Math.floor(h / 24)));
}

function Dot({ ok, warn }: { ok: boolean; warn?: boolean }) {
  const c = ok ? 'bg-[#35D98B]' : warn ? 'bg-[#F2BF4A]' : 'bg-[#F06B78]';
  return <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${c}`} />;
}

export default async function AdminDashboard() {
  const t = getDict();
  const [m, openTickets] = await Promise.all([getAdminMetrics(), getOpenTicketCount()]);
  const attention = m.needsAttention + m.pendingWithdrawals;
  return (
    <div>
      <PageHeader title={t.ops.controlTitle} sub={t.ops.controlSub} />

      {/* System status — every dot is local truth, never assumed green. */}
      <div className="mt-6 rounded-[16px] border border-[#202A3A] bg-[#0D111A] px-4 py-3">
        <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">{t.ops.sysStatus}</div>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#AAB5C7]">
          <li className="flex items-center gap-1.5"><Dot ok={m.dbOk} /> {t.ops.db} {m.dbOk ? t.ops.live : t.ops.unreachable}</li>
          <li className="flex items-center gap-1.5"><Dot ok={m.providerApiConfigured} warn={!m.providerApiConfigured} /> {t.ops.payApi} {m.providerApiConfigured ? t.ops.keyOk : t.ops.keyNo}</li>
          <li className="flex items-center gap-1.5"><Dot ok={m.providerIpnConfigured} warn={!m.providerIpnConfigured} /> {t.ops.ipn} {m.providerIpnConfigured ? t.ops.secretOk : t.ops.secretNo}</li>
          <li className="flex items-center gap-1.5"><Dot ok /> {t.ops.payoutsManual}</li>
          {m.providerSyncError && (
            <li className="flex items-center gap-1.5 text-[#F2BF4A]"><Dot ok={false} warn /> {t.ops.syncError}</li>
          )}
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
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">{t.ops.needsAtt}</div>
          <div className={`font-mono text-2xl font-bold ${attention > 0 ? 'text-[#F2BF4A]' : 'text-[#35D98B]'}`}>{attention}</div>
        </div>
        {attention > 0 ? (
          <p className="mt-1 text-[13px] text-[#AAB5C7]">
            {t.ops.attLine.replace('{m}', String(m.pendingManual)).replace('{w}', String(m.pendingWithdrawals)).replace('{e}', String(m.needsAttention - m.pendingManual))}
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-[#AAB5C7]">{t.ops.allOps}</p>
        )}
        <div className="mt-2 text-[14px] font-bold text-[#2FD6FF]">{t.ops.openReview} →</div>
      </Link>

      {/* Deposit rails split: manual needs review, automatic flows itself. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/deposits?status=pending&kind=manual" className="rounded-[16px] border border-[#202A3A] bg-[#0D111A] p-4 transition hover:border-[rgba(47,214,255,0.5)] sm:p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">{t.ops.manualT}</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-white">{t.ops.pendingN.replace('{n}', String(m.pendingManual))}</div>
          <div className="mt-1 text-[13px] text-[#AAB5C7]">{formatUSD(m.pendingManualTotal)} {t.ops.awaitingReview.replace('{x}', '').trim()}</div>
          <div className="mt-2 text-[14px] font-bold text-[#2FD6FF]">{t.admin.dashboard.viewQueue} →</div>
        </Link>
        <Link href="/admin/deposits?status=pending&kind=automatic" className="rounded-[16px] border border-[#202A3A] bg-[#0D111A] p-4 transition hover:border-[rgba(47,214,255,0.55)] sm:p-5">
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">{t.ops.autoT}</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-white">{t.ops.inFlight.replace('{n}', String(m.autoPending))}</div>
          <div className="mt-1 text-[13px] text-[#AAB5C7]">{t.ops.finishedSelf.replace('{f}', String(m.autoFinished))}</div>
          <div className="mt-2 text-[14px] font-bold text-[#2FD6FF]">{t.ops.monitor} →</div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.ops.users} value={String(m.users)} />
        <StatCard label={t.ops.pendWd} value={String(m.pendingWithdrawals)} sub={formatUSD(m.pendingWithdrawalsTotal)} accent={m.pendingWithdrawals > 0 ? 'up' : 'neutral'} />
        <StatCard label={t.ops.activeInv} value={formatUSD(m.activeInvested)} />
        <StatCard label={t.ops.provAct} value={m.providerLastActivity ? ago(t.ops, m.providerLastActivity) : t.ops.agoNone} sub={t.ops.lastNp} />
      </div>

      <Link href="/admin/support?status=open" className="mt-4 flex items-center justify-between gap-3 rounded-[16px] border border-[#202A3A] bg-[#0D111A] p-4 transition hover:border-[rgba(47,214,255,0.5)] sm:p-5">
        <div>
          <div className="font-mono text-[10px] tracking-[0.18em] text-[#78859A]">{t.admin.dashboard.openTickets}</div>
          <div className="mt-1 text-[13px] text-[#AAB5C7]">
            {openTickets === 0 ? t.ops.ticketsOk : t.ops.ticketsWait.replace('{n}', String(openTickets))}
          </div>
        </div>
        <div className={`font-mono text-2xl font-bold ${openTickets > 0 ? 'text-[#F2BF4A]' : 'text-white'}`}>{openTickets}</div>
      </Link>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/withdrawals?status=pending" className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5 transition hover:border-[rgba(47,214,255,0.5)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">{t.ops.wds}</div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{t.ops.pendingN.replace('{n}', String(m.pendingWithdrawals))}</div>
          <div className="mt-1 text-[13px] text-[#78859A]">{t.ops.approveSep}</div>
          <div className="mt-3 text-[14px] font-bold text-[#2FD6FF]">{t.ops.openReview} →</div>
        </Link>
        <div className="rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">{t.ops.provider}</div>
          <div className="mt-2 text-[15px] font-bold text-white">NOWPayments</div>
          <ul className="mt-2 space-y-1 text-[13px] text-[#AAB5C7]">
            <li className="flex items-center gap-1.5"><Dot ok={m.providerApiConfigured} warn={!m.providerApiConfigured} /> {t.ops.payApi} {m.providerApiConfigured ? t.ops.keyOk : t.ops.keyNo}</li>
            <li className="flex items-center gap-1.5"><Dot ok={m.providerIpnConfigured} warn={!m.providerIpnConfigured} /> {t.ops.ipn} {m.providerIpnConfigured ? t.ops.secretOk : t.ops.secretNo}</li>
            <li>{t.ops.lastAct.replace('{x}', m.providerLastActivity ? ago(t.ops, m.providerLastActivity) : t.ops.agoNone)}</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[#78859A]">{t.ops.depCfg}</div>
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
                    {ok ? t.ops.active : t.ops.notCfg}
                  </span>
                </li>
              );
            });
          })()}
        </ul>
        <p className="mt-3 text-[12px] text-[#78859A]">
          {t.ops.resolvedFrom}{' '}
          {t.ops.manageIn} <Link href="/admin/assets" className="font-semibold text-[#2FD6FF]">{t.admin.nav.assets}</Link>.
        </p>
      </div>
    </div>
  );
}
