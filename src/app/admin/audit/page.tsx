import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { getAuditLog } from '@/lib/admin';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Admin audit log' };

export default async function AdminAudit() {
  const t = getDict();
  const rows = await getAuditLog();
  return (
    <div>
      <PageHeader title={t.ax.auditTitle} sub={t.ax.auditSub} />
      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState title={t.ax.noAudit} body={t.ax.auditB} /></div>
      ) : (
        <SectionCard title={t.ax.entriesN.replace('{n}', String(rows.length))}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((r) => (
              <li key={r.id} className="px-5 py-3.5 text-[13px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-[8px] border border-[#2A394D] bg-[#111722] px-2 py-0.5 font-mono text-[11px] font-bold text-[#2FD6FF]">{r.action}</span>
                  {r.entity && <span dir="ltr" className="text-left font-mono text-[11px] text-[#78859A]">{r.entity}:{r.entityId?.slice(0, 13)}</span>}
                </div>
                <div dir="ltr" className="mt-1 text-left font-mono text-[11px] text-[#596579]">
                  admin {r.actor?.slice(0, 8) ?? '—'} · {r.createdAt.slice(0, 16).replace('T', ' ')}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
