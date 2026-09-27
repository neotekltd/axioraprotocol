import Link from 'next/link';
export const metadata = { title: 'Log in' };
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-xs text-fog">Secure encrypted connection · demo only, no real auth wired yet</p>
        <form className="mt-6 space-y-4" action="/app/dashboard">
          <div><label className="text-xs text-fog">Email</label><input required type="email" placeholder="you@domain.com" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
          <div><label className="text-xs text-fog">Password</label><input required type="password" placeholder="••••••••" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
          <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-fog"><input type="checkbox" className="accent-[#34F5A5]" /> Remember me</label><Link href="/forgot-password" className="text-pulse">Forgot password?</Link></div>
          <button className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black">Sign in</button>
        </form>
        <p className="mt-4 text-center text-xs text-fog">Don&apos;t have an account? <Link href="/register" className="text-pulse">Create one</Link></p>
      </div>
    </div>
  );
}
