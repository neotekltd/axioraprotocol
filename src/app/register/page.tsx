import Link from 'next/link';
export const metadata = { title: 'Register' };
export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-xs text-fog">Demo registration — backend validation, email verification and rate limiting required in prod</p>
        <form className="mt-6 space-y-4" action="/app/dashboard">
          <div><label className="text-xs text-fog">Email</label><input required type="email" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-fog">Password</label><input required type="password" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
            <div><label className="text-xs text-fog">Confirm</label><input required type="password" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
          </div>
          <div><label className="text-xs text-fog">Referral code (optional)</label><input className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" placeholder="AB12CD" /></div>
          <label className="flex items-start gap-2 text-xs text-fog"><input required type="checkbox" className="mt-0.5 accent-[#34F5A5]" /> I accept the Terms and Risk Disclosure.</label>
          <button className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black">Create Account</button>
        </form>
        <p className="mt-4 text-center text-xs text-fog">Have an account? <Link href="/login" className="text-pulse">Sign in</Link></p>
      </div>
    </div>
  );
}
