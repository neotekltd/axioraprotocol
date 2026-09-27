export const metadata = { title: 'Forgot password' };
export default function ForgotPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-xs text-fog">Enter your email to receive a reset link (demo).</p>
        <form className="mt-6 space-y-4"><input required type="email" placeholder="you@domain.com" className="w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /><button className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black">Send reset link</button></form>
      </div>
    </div>
  );
}
