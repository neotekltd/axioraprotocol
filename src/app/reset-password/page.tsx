import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset password',
  description: 'Set a new password for your Axiora account.',
  alternates: { canonical: '/reset-password' },
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-xs text-fog">Opened from a valid reset link. Links expire shortly and work once.</p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
