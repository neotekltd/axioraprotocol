export const metadata = { title: 'Verify email' };
export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8 text-center">
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm text-fog">We sent a verification link to your email (demo — no email is actually sent until Resend is configured).</p>
        <div className="mt-6 rounded-xl border border-line bg-void p-4 text-xs text-fog">Resend status: not configured in local development.</div>
      </div>
    </div>
  );
}
