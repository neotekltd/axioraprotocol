import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { NetworkEditor } from '@/components/admin/forms';
import { getAdminAssets } from '@/lib/admin';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Admin assets' };

export default async function AdminAssets() {
  const t = getDict();
  const assets = await getAdminAssets();
  return (
    <div>
      <PageHeader title={t.ax.assetsTitle} sub={t.ax.assetsSub} />
      {assets.length === 0 && (
        <div className="mt-6"><EmptyState title={t.ax.noAssets} body={t.ax.seedNote} /></div>
      )}
      <div className="space-y-4">
        {assets.map((a) => (
          <SectionCard
            key={a.id}
            title={`${a.symbol} · ${a.name}`}
            action={<span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#78859A]">{a.isActive ? t.ax.activeH : t.ax.hiddenH}</span>}
          >
            {a.networks.length === 0 ? (
              <p className="px-5 py-4 text-[13px] font-mono uppercase tracking-[0.12em] text-[#596579]">{t.ax.notCfgNet}</p>
            ) : (
              <div className="divide-y divide-[#202A3A]/70">
                {a.networks.map((n) => (
                  <details key={n.id}>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-5 py-4 text-[14px] transition hover:bg-[#111722]/60 [&::-webkit-details-marker]:hidden">
                      <span>
                        <span className="font-bold text-white">{n.display}</span>
                        <span className="ml-2 font-mono text-[11px] text-[#78859A]">{n.code}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {n.address
                          ? <span className="font-mono text-[12px] text-[#35D98B]">{t.ax.addrSet}</span>
                          : <span className="font-mono text-[12px] text-[#F2BF4A]">{t.ops.notCfg}</span>}
                        <span className={`font-mono text-[11px] uppercase ${n.depositEnabled ? 'text-[#2FD6FF]' : 'text-[#596579]'}`}>
                          {n.depositEnabled ? t.status.active : t.common.off}
                        </span>
                      </span>
                    </summary>
                    <div className="border-t border-[#202A3A]/60">
                      <NetworkEditor network={n} />
                    </div>
                  </details>
                ))}
              </div>
            )}
          </SectionCard>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-[#78859A]">
        {t.ax.backTo} <Link href="/admin" className="font-semibold text-[#2FD6FF]">{t.admin.nav.dashboard}</Link>. {t.ax.keysNote}
      </p>
    </div>
  );
}
