export const metadata = { title: 'Reset password' };
export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-xs text-fog">Demo only — token validation happens server-side in production.</p>
        <form className="mt-6 space-y-4" action="/login">
          <div><label className="text-xs text-fog">New password</label><input required type="password" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
          <div><label className="text-xs text-fog">Confirm new password</label><input required type="password" className="mt-1 w-full rounded-xl border border-line bg-void px-4 py-3 text-sm outline-none focus:border-pulse" /></div>
          <button className="w-full rounded-xl bg-pulse py-3 text-sm font-bold text-black">Update password</button>
        </form>
      </div>
    </div>
  );
}
