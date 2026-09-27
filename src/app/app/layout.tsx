import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';

const NAV = [
  ['Dashboard', '/app/dashboard'],
  ['Deposit', '/app/deposit'],
  ['Deploy', '/app/deploy'],
  ['Deployments', '/app/deployments'],
  ['Portfolio', '/app/portfolio'],
  ['Trades', '/app/trades'],
  ['Transactions', '/app/transactions'],
  ['Withdraw', '/app/withdraw'],
  ['Wallets', '/app/wallets'],
  ['Referrals', '/app/referrals'],
  ['Profile', '/app/profile'],
  ['Security', '/app/security'],
  ['Notifications', '/app/notifications'],
  ['Support', '/app/support'],
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 lg:pt-24">
      <div className="flex gap-6">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-line bg-panel/60 p-3">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm text-mist/80 hover:bg-surface hover:text-white">
                {label}
              </Link>
            ))}
            <div className="pt-2">
              <SignOutButton className="w-full" />
            </div>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-void/95 py-2 backdrop-blur-xl lg:hidden">
        {[['Home', '/app/dashboard'], ['Portfolio', '/app/portfolio'], ['Deploy', '/app/deploy'], ['Referrals', '/app/referrals'], ['Profile', '/app/profile']].map(([label, href]) => (
          <Link key={href} href={href} className="px-3 py-2 text-xs text-mist/80 hover:text-white">{label}</Link>
        ))}
      </nav>
    </div>
  );
}
