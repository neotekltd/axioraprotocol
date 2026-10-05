import Link from 'next/link';
import { PageHeader, SectionCard, EmptyState } from '@/components/data';
import { getAdminUsers } from '@/lib/admin';
import { getDict } from '@/lib/i18n-server';

export const metadata = { title: 'Admin users' };

export default async function AdminUsers({ searchParams }: { searchParams?: { q?: string } }) {
  const t = getDict();
  const q = searchParams?.q ?? '';
  const rows = await getAdminUsers(q);
  return (
    <div>
      <PageHeader title={t.ax.usersTitle} sub={t.ax.usersSub} />
      <form method="get" action="/admin/users" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder={t.ax.userSearchPh}
          autoComplete="off"
          aria-label={t.ax.searchUsers}
          dir="ltr"
          className="w-full rounded-[12px] border border-[#2A394D] bg-[#080B12] px-4 py-3 text-[14px] text-white outline-none placeholder:text-[#596579] focus:border-[#2FD6FF]"
        />
        <button type="submit" className="shrink-0 rounded-[12px] bg-[#2FD6FF] px-5 text-[14px] font-bold text-[#06121A] hover:brightness-110">
          {t.at.searchBtn}
        </button>
      </form>
      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState title={t.ax.noUsers} body={t.ax.tryOtherSearch} /></div>
      ) : (
        <SectionCard title={rows.length === 1 ? t.ax.users1.replace('{n}', '1') : t.ax.usersN.replace('{n}', String(rows.length))}>
          <ul className="divide-y divide-[#202A3A]/70">
            {rows.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/users/${u.id}`} className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#111722]/60">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-white">{u.email}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-[#78859A]">
                      {u.username ? `@${u.username} · ` : ''}{u.referralCode} · {u.createdAt.slice(0, 10)}
                    </div>
                  </div>
                  <span aria-hidden="true" className="shrink-0 font-mono text-[#2FD6FF]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
