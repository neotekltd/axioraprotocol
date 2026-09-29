import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot password',
  description: 'Request a password reset link for your Axiora account.',
  alternates: { canonical: '/forgot-password' },
};

export default function ForgotPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-28 pb-20">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-xs text-fog">Enter your account email to receive a reset link.</p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
