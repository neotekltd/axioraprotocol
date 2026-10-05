import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AxioraMark } from '@/components/AxioraLogo';
import { isAdmin } from '@/lib/admin';
import { getSessionUser } from '@/lib/queries';
import { getDict } from '@/lib/i18n-server';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Signed out -> /login. Authenticated non-admin -> authorization failure
  // (no admin surface revealed). Both re-verified on every request.
  const t = getDict();
  const NAV: [string, string][] = [
    [t.admin.nav.dashboard, '/admin'],
    [t.admin.nav.assets, '/admin/assets'],
    [t.admin.nav.deposits, '/admin/deposits'],
    [t.admin.nav.withdrawals, '/admin/withdrawals'],
    [t.admin.nav.support, '/admin/support'],
    [t.admin.nav.users, '/admin/users'],
    [t.admin.nav.audit, '/admin/audit'],
    [t.admin.nav.settings, '/admin/settings'],
  ];
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!(await isAdmin())) notFound();
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F1F5FA]">
      <header className="border-b border-[#202A3A]/70 bg-[#080B12]/95">
        <div className="mx-auto flex h-[64px] max-w-[1180px] items-center justify-between gap-3 px-5 md:px-7">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="Admin home">
            <AxioraMark size={30} />
            <span className="text-[15px] font-extrabold tracking-tight text-white">
              AXIORA<span className="text-[#2FD6FF]">.</span>
            </span>
            <span className="rounded-full border border-[rgba(242,191,74,0.45)] bg-[rgba(242,191,74,0.08)] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#F2BF4A]">
              {t.admin.badge}
            </span>
          </Link>
          <Link href="/app/dashboard" className="text-[13px] font-semibold text-[#AAB5C7] hover:text-white">
            ← {t.admin.userApp}
          </Link>
        </div>
        <nav aria-label="Admin" className="mx-auto max-w-[1180px] px-5 md:px-7">
          <div className="thin-scroll flex gap-1 overflow-x-auto pb-3">
            {NAV.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold text-[#AAB5C7] transition hover:bg-[#111722] hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-[1180px] px-5 pb-16 pt-6 md:px-7">{children}</main>
    </div>
  );
}
