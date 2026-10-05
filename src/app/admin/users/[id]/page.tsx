import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SectionCard, StatusBadge } from '@/components/data';
import { getAdminUsers } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';
import { formatUSD } from '@/lib/finance';
import { getDict } from '@/lib/i18n-server';
import { stWord } from '@/lib/i18n-dict';

export const metadata = { title: 'Admin user detail' };

const num = (v: unknown) => (typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0);

export default async function AdminUserDetail({ params }: { params: { id: string } }) {
  const t = getDict();
  const found = await getAdminUsers('');
  const user = found.find((u) => u.id === params.id);
  if (!user) {
    // Fall back to a direct lookup (list is capped).
    const supabase = createClient();
    const { data } = await supabase.from('profiles').select('id,email,username,referral_code,created_at').eq('id', params.id).maybeSingle();
    const p = data as Record<string, unknown> | null;
    if (!p) notFound();
  }
  const supabase = createClient();
  const [txns, wallets, deps, refs] = await Promise.all([
    supabase.from('wallet_transactions').select('id,type,asset,amount,status,created_at').eq('user_id', params.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('wallets').select('id,asset,network,address,label,verified').eq('user_id', params.id).limit(20),
    supabase.from('deployments').select('id,amount,status,plan').eq('user_id', params.id).limit(50),
    supabase.from('referrals').select('id,level,created_at').eq('user_id', params.id).limit(100),
  ]);
  const txRows = ((txns.data ?? []) as Record<string, unknown>[]);
  const depSum = ((deps.data ?? []) as Record<string, unknown>[])
    .filter((d) => String(d.status) === 'active')
    .reduce((a, d) => a + num(d.amount), 0);

  return (
    <div>
      <Link href="/admin/users" className="text-[14px] text-[#AAB5C7] hover:text-white">← {t.ax.backUsers}</Link>
      <div className="mt-2">
        <PageHeader title={user?.email ?? params.id.slice(0, 8)} sub={user ? `@${user.username ?? '—'} · ${t.ax.codeSince.replace('{c}', user.referralCode).replace('{d}', user.createdAt.slice(0, 10))}` : undefined} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <SectionCard title={t.ax.walletsSec}>
          {(((wallets.data ?? []) as Record<string, unknown>[]).length === 0) ? (
            <p className="px-5 py-4 text-[13px] text-[#78859A]">{t.ax.noAddrSaved}</p>
          ) : (
            <ul className="divide-y divide-[#202A3A]/70">
              {((wallets.data ?? []) as Record<string, unknown>[]).map((w) => (
                <li key={String(w.id)} className="px-5 py-3 font-mono text-[12px] text-[#AAB5C7]">
                  <span className="text-white">{String(w.asset)}/{String(w.network)}</span>
                  <span dir="ltr" className="block break-all text-left">{String(w.address)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title={`${t.ax.activeInvSec} · ${formatUSD(depSum)}`}>
          {(((deps.data ?? []) as Record<string, unknown>[]).length === 0) ? (
            <p className="px-5 py-4 text-[13px] text-[#78859A]">{t.ax.noDeps}</p>
          ) : (
            <ul className="divide-y divide-[#202A3A]/70">
              {((deps.data ?? []) as Record<string, unknown>[]).map((d) => (
                <li key={String(d.id)} className="flex items-center justify-between gap-2 px-5 py-3 text-[13px]">
                  <span className="font-mono text-white">{formatUSD(num(d.amount))} · {String(d.plan ?? '')}</span>
                  <StatusBadge status={String(d.status ?? '')} label={stWord(t, String(d.status ?? ''))} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title={`${t.ax.refSec} · ${((refs.data ?? []) as unknown[]).length}`}>
          {(((refs.data ?? []) as Record<string, unknown>[]).length === 0) ? (
            <p className="px-5 py-4 text-[13px] text-[#78859A]">{t.ax.noRefs}</p>
          ) : (
            <ul className="divide-y divide-[#202A3A]/70">
              {((refs.data ?? []) as Record<string, unknown>[]).slice(0, 10).map((r) => (
                <li key={String(r.id)} className="px-5 py-3 font-mono text-[12px] text-[#AAB5C7]">
                  L{String(r.level)} · {String(r.created_at ?? '').slice(0, 10)}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
      <SectionCard title={`${t.ax.txSec} · ${txRows.length}`}>
        {txRows.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-[#78859A]">{t.ax.noTx}</p>
        ) : (
          <ul className="divide-y divide-[#202A3A]/70">
            {txRows.map((row) => (
              <li key={String(row.id)} className="flex items-center justify-between gap-3 px-5 py-3 text-[13px]">
                <span className="font-mono capitalize text-white">{String(row.type)} {String(row.asset)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-white">{formatUSD(num(row.amount))}</span>
                  <StatusBadge status={String(row.status ?? '')} label={stWord(t, String(row.status ?? ''))} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
